const { query } = require('./pool');
const { randomUUID } = require('crypto');

function toSnake(key) {
  if (key === '_id') return 'id';
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function toCamel(key) {
  if (key === 'id') return '_id';
  return key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function rowToDoc(row, jsonFields = []) {
  if (!row) return null;
  const doc = {};
  for (const [key, value] of Object.entries(row)) {
    const camel = toCamel(key);
    if (jsonFields.includes(camel) && typeof value === 'string') {
      try {
        doc[camel] = JSON.parse(value);
      } catch {
        doc[camel] = value;
      }
    } else {
      doc[camel] = value;
    }
  }
  return doc;
}

function buildWhere(filter = {}, startIndex = 1, { defaultFilter } = {}) {
  const merged = { ...(defaultFilter || {}), ...(filter || {}) };
  const clauses = [];
  const params = [];
  let idx = startIndex;

  const pushEq = (col, val) => {
    params.push(val);
    clauses.push(`${quoteIdent(col)} = $${idx++}`);
  };

  for (const [rawKey, rawVal] of Object.entries(merged)) {
    if (rawKey === '$or' && Array.isArray(rawVal)) {
      const orParts = [];
      for (const part of rawVal) {
        const sub = buildWhere(part, idx, {});
        if (sub.clauses.length) {
          orParts.push(`(${sub.clauses.join(' AND ')})`);
          params.push(...sub.params);
          idx += sub.params.length;
        }
      }
      if (orParts.length) clauses.push(`(${orParts.join(' OR ')})`);
      continue;
    }

    const col = toSnake(rawKey);

    if (rawVal && typeof rawVal === 'object' && !Array.isArray(rawVal) && !(rawVal instanceof Date)) {
      if ('$in' in rawVal) {
        const values = rawVal.$in || [];
        if (!values.length) {
          clauses.push('FALSE');
        } else {
          const placeholders = values.map(() => `$${idx++}`);
          params.push(...values);
          clauses.push(`${quoteIdent(col)} IN (${placeholders.join(', ')})`);
        }
        continue;
      }
      if ('$ne' in rawVal) {
        if (rawVal.$ne === null) {
          clauses.push(`${quoteIdent(col)} IS NOT NULL`);
        } else {
          params.push(rawVal.$ne);
          clauses.push(`${quoteIdent(col)} IS DISTINCT FROM $${idx++}`);
        }
        continue;
      }
      if ('$gte' in rawVal) {
        params.push(rawVal.$gte);
        clauses.push(`${quoteIdent(col)} >= $${idx++}`);
      }
      if ('$lte' in rawVal) {
        params.push(rawVal.$lte);
        clauses.push(`${quoteIdent(col)} <= $${idx++}`);
      }
      if ('$gt' in rawVal) {
        params.push(rawVal.$gt);
        clauses.push(`${quoteIdent(col)} > $${idx++}`);
      }
      if ('$lt' in rawVal) {
        params.push(rawVal.$lt);
        clauses.push(`${quoteIdent(col)} < $${idx++}`);
      }
      continue;
    }

    if (rawVal === null) {
      clauses.push(`${quoteIdent(col)} IS NULL`);
    } else {
      pushEq(col, rawVal);
    }
  }

  return { clauses, params, nextIndex: idx };
}

function createQuery(execute) {
  const state = {
    filter: {},
    projection: null,
    sort: null,
    limitCount: null,
    leanFlag: false,
  };

  const api = {
    select(fields) {
      state.projection = fields;
      return api;
    },
    sort(spec) {
      state.sort = spec;
      return api;
    },
    limit(n) {
      state.limitCount = n;
      return api;
    },
    lean() {
      state.leanFlag = true;
      return api;
    },
    then(resolve, reject) {
      return execute(state).then(resolve, reject);
    },
    catch(reject) {
      return execute(state).catch(reject);
    },
  };

  return api;
}

function applyProjection(doc, projection) {
  if (!doc || !projection) return doc;
  if (typeof projection === 'string') {
    const parts = projection.trim().split(/\s+/);
    const exclude = parts.filter((p) => p.startsWith('-')).map((p) => p.slice(1));
    const include = parts.filter((p) => !p.startsWith('-'));
    if (exclude.length) {
      const copy = { ...doc };
      for (const key of exclude) delete copy[key];
      return copy;
    }
    const out = { _id: doc._id };
    for (const key of include) {
      if (key in doc) out[key] = doc[key];
    }
    return out;
  }
  return doc;
}

function wrapDocument(raw, Model) {
  if (!raw) return null;
  const doc = { ...raw };
  Object.defineProperty(doc, 'isNew', {
    value: false,
    writable: true,
    enumerable: false,
  });
  doc.save = async function save() {
    return Model._saveDocument(this);
  };
  doc.toObject = function toObject() {
    const { save, toObject, isNew, ...rest } = this;
    return { ...rest };
  };
  return doc;
}

function createModel(tableName, options = {}) {
  const {
    defaults = {},
    defaultFilter = {},
    jsonFields = [],
  } = options;

  const Model = function ModelConstructor(data = {}) {
    const merged = { ...defaults, ...data };
    for (const [k, v] of Object.entries(merged)) {
      this[k] = v;
    }
    this.isNew = true;
    this.save = async () => Model._saveDocument(this);
    this.toObject = () => {
      const { save, toObject, isNew, ...rest } = this;
      return { ...rest };
    };
  };

  Model.modelName = tableName;
  Model.jsonFields = jsonFields;
  Model.defaults = defaults;
  Model.defaultFilter = defaultFilter;

  Model._saveDocument = async function _saveDocument(doc) {
    const payload = { ...defaults };
    for (const [k, v] of Object.entries(doc)) {
      if (typeof v === 'function') continue;
      if (['save', 'toObject', 'isNew'].includes(k)) continue;
      payload[k] = v;
    }

    const isInsert = doc.isNew || !payload._id;
    if (isInsert) {
      payload._id = payload._id || randomUUID();
      if (!payload.createdAt) payload.createdAt = new Date();
      if ('updatedAt' in defaults || 'updatedAt' in payload) {
        payload.updatedAt = new Date();
      }

      const cols = [];
      const vals = [];
      const params = [];
      let i = 1;
      for (const [key, value] of Object.entries(payload)) {
        if (key === 'isNew' || value === undefined || typeof value === 'function') continue;
        const col = toSnake(key);
        cols.push(quoteIdent(col));
        let stored = value;
        if (jsonFields.includes(key) && value != null && typeof value === 'object') {
          stored = JSON.stringify(value);
        }
        params.push(stored);
        vals.push(`$${i++}`);
      }

      const sql = `INSERT INTO ${quoteIdent(tableName)} (${cols.join(', ')}) VALUES (${vals.join(', ')}) RETURNING *`;
      const result = await query(sql, params);
      const saved = wrapDocument(rowToDoc(result.rows[0], jsonFields), Model);
      Object.assign(doc, saved);
      doc.isNew = false;
      return doc;
    }

    payload.updatedAt = new Date();
    const id = payload._id;
    const sets = [];
    const params = [];
    let i = 1;
    for (const [key, value] of Object.entries(payload)) {
      if (key === '_id' || key === 'isNew' || typeof value === 'function' || value === undefined) continue;
      const col = toSnake(key);
      let stored = value;
      if (jsonFields.includes(key) && value != null && typeof value === 'object') {
        stored = JSON.stringify(value);
      }
      params.push(stored);
      sets.push(`${quoteIdent(col)} = $${i++}`);
    }
    params.push(id);
    const sql = `UPDATE ${quoteIdent(tableName)} SET ${sets.join(', ')} WHERE ${quoteIdent('id')} = $${i} RETURNING *`;
    const result = await query(sql, params);
    const saved = wrapDocument(rowToDoc(result.rows[0], jsonFields), Model);
    Object.assign(doc, saved);
    doc.isNew = false;
    return doc;
  };

  async function runFind(state, { one = false } = {}) {
    const { clauses, params } = buildWhere(state.filter, 1, { defaultFilter });
    let sql = `SELECT * FROM ${quoteIdent(tableName)}`;
    if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;

    if (state.sort && typeof state.sort === 'object') {
      const parts = Object.entries(state.sort).map(([k, dir]) => {
        const order = dir === -1 || dir === 'desc' ? 'DESC' : 'ASC';
        return `${quoteIdent(toSnake(k))} ${order} NULLS LAST`;
      });
      if (parts.length) sql += ` ORDER BY ${parts.join(', ')}`;
    }

    if (one) {
      sql += ' LIMIT 1';
    } else if (state.limitCount) {
      sql += ` LIMIT ${Number(state.limitCount)}`;
    }

    const result = await query(sql, params);
    const docs = result.rows.map((row) => {
      const doc = rowToDoc(row, jsonFields);
      const projected = applyProjection(doc, state.projection);
      return state.leanFlag ? projected : wrapDocument(projected, Model);
    });
    return one ? (docs[0] || null) : docs;
  }

  Model.find = function find(filter = {}) {
    return createQuery((state) => {
      state.filter = filter;
      return runFind(state, { one: false });
    });
  };

  Model.findOne = function findOne(filter = {}) {
    return createQuery((state) => {
      state.filter = filter;
      return runFind(state, { one: true });
    });
  };

  Model.findById = function findById(id) {
    return Model.findOne({ _id: id });
  };

  Model.countDocuments = async function countDocuments(filter = {}) {
    const { clauses, params } = buildWhere(filter, 1, { defaultFilter });
    let sql = `SELECT COUNT(*)::int AS count FROM ${quoteIdent(tableName)}`;
    if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;
    const result = await query(sql, params);
    return result.rows[0].count;
  };

  Model.create = async function create(data) {
    const doc = new Model(data);
    return doc.save();
  };

  Model.findByIdAndUpdate = async function findByIdAndUpdate(id, update, opts = {}) {
    const existing = await Model.findById(id);
    if (!existing) return null;
    const patch = { ...(update.$set || update) };
    Object.assign(existing, patch);
    existing.updatedAt = new Date();
    await existing.save();
    return opts.new === false ? existing : existing;
  };

  Model.findByIdAndDelete = async function findByIdAndDelete(id) {
    const existing = await Model.findById(id);
    if (!existing) return null;
    await query(`DELETE FROM ${quoteIdent(tableName)} WHERE ${quoteIdent('id')} = $1`, [id]);
    return existing;
  };

  Model.deleteOne = async function deleteOne(filter = {}) {
    const doc = await Model.findOne(filter);
    if (!doc) return { deletedCount: 0 };
    await query(`DELETE FROM ${quoteIdent(tableName)} WHERE ${quoteIdent('id')} = $1`, [doc._id]);
    return { deletedCount: 1 };
  };

  Model.deleteMany = async function deleteMany(filter = {}) {
    const { clauses, params } = buildWhere(filter, 1, { defaultFilter });
    let sql = `DELETE FROM ${quoteIdent(tableName)}`;
    if (clauses.length) sql += ` WHERE ${clauses.join(' AND ')}`;
    const result = await query(sql, params);
    return { deletedCount: result.rowCount || 0 };
  };

  Model.findOneAndDelete = async function findOneAndDelete(filter = {}) {
    const existing = await Model.findOne(filter);
    if (!existing) return null;
    await query(`DELETE FROM ${quoteIdent(tableName)} WHERE ${quoteIdent('id')} = $1`, [existing._id]);
    return existing;
  };

  Model.insertMany = async function insertMany(docs = []) {
    const saved = [];
    for (const data of docs) {
      saved.push(await Model.create(data));
    }
    return saved;
  };

  Model.findOneAndUpdate = async function findOneAndUpdate(filter, update, opts = {}) {
    let existing = await Model.findOne(filter);
    if (!existing) {
      if (opts.upsert) {
        existing = new Model({ ...defaults, ...(filter || {}), ...(update.$set || update) });
        await existing.save();
        return existing;
      }
      return null;
    }
    Object.assign(existing, update.$set || update);
    existing.updatedAt = new Date();
    await existing.save();
    return existing;
  };

  return Model;
}

module.exports = {
  createModel,
  toSnake,
  toCamel,
  rowToDoc,
};
