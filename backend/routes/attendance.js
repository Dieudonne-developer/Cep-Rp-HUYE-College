const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { query } = require('../src/db/pool');
const { readAccessToken } = require('../src/auth/accessToken');
const { sendAdminInvitationEmail } = require('../utils/email');

const ALLOWED_GROUPS = ['choir', 'anointed'];
const STATUSES = ['present', 'absent', 'late'];

async function adminContext(req, res) {
  const email = String(req.headers['x-admin-email'] || '').trim().toLowerCase();
  if (!email) { res.status(401).json({ message: 'Admin email required' }); return null; }
  const { rows } = await query(
    `SELECT id, email, username, role, user_group, is_approved FROM app_users WHERE lower(email) = $1 LIMIT 1`,
    [email]
  );
  const user = rows[0];
  if (!user || !user.is_approved || !['admin', 'super-admin'].includes(user.role)) {
    res.status(403).json({ message: 'Admin access required' });
    return null;
  }
  const group = String(req.headers['x-admin-group'] || user.user_group || '').toLowerCase();
  const isSuper = user.role === 'super-admin';
  if (!isSuper && !ALLOWED_GROUPS.includes(group)) {
    res.status(403).json({ message: 'Attendance is only available for Ishyangaryera and Anointed choirs' });
    return null;
  }
  return { admin: user, group: isSuper ? group : group, isSuper };
}

async function memberFromToken(req) {
  const header = req.header('authorization') || '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  const payload = readAccessToken(token);
  const email = payload && payload.email ? String(payload.email).toLowerCase() : null;
  if (!email) return null;
  const { rows } = await query(
    `SELECT id, email, username, user_group FROM app_users
     WHERE lower(email) = $1 AND user_group = ANY($2) AND is_approved = true LIMIT 1`,
    [email, ALLOWED_GROUPS]
  );
  return rows[0] || null;
}

// ---- Admin: sessions ----
router.get('/sessions', async (req, res) => {
  try {
    const ctx = await adminContext(req, res); if (!ctx) return;
    let group = String(req.query.group || ctx.group).toLowerCase();
    if (!ALLOWED_GROUPS.includes(group)) {
      if (!ctx.isSuper) return res.status(400).json({ message: 'Invalid group' });
      group = 'choir';
    }
    const { rows } = await query(
      `SELECT * FROM attendance_sessions WHERE "group" = $1 ORDER BY session_date DESC NULLS LAST, created_at DESC`,
      [group]
    );
    res.json({ sessions: rows });
  } catch (err) { console.error('attendance sessions error:', err); res.status(500).json({ message: 'Failed to load sessions' }); }
});

router.post('/sessions', async (req, res) => {
  try {
    const ctx = await adminContext(req, res); if (!ctx) return;
    const group = String(req.body.group || ctx.group).toLowerCase();
    if (!ALLOWED_GROUPS.includes(group)) return res.status(400).json({ message: 'Attendance is only for choir and anointed' });
    const title = String(req.body.title || '').trim();
    if (!title) return res.status(400).json({ message: 'Session title is required' });
    const { rows } = await query(
      `INSERT INTO attendance_sessions ("group", title, session_date, session_time, location, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [group, title, req.body.date || null, req.body.time || null, req.body.location || null, req.body.notes || null, ctx.admin.email]
    );
    res.status(201).json({ session: rows[0] });
  } catch (err) { console.error('create session error:', err); res.status(500).json({ message: 'Failed to create session' }); }
});

router.put('/sessions/:id', async (req, res) => {
  try {
    const ctx = await adminContext(req, res); if (!ctx) return;
    const { rows } = await query(
      `UPDATE attendance_sessions SET title=$2, session_date=$3, session_time=$4, location=$5, notes=$6, updated_at=now()
       WHERE id=$1 AND ("group" = $7 OR $8) RETURNING *`,
      [req.params.id, req.body.title, req.body.date || null, req.body.time || null, req.body.location || null, req.body.notes || null, ctx.group, ctx.isSuper]
    );
    if (!rows.length) return res.status(404).json({ message: 'Session not found' });
    res.json({ session: rows[0] });
  } catch (err) { res.status(500).json({ message: 'Failed to update session' }); }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    const ctx = await adminContext(req, res); if (!ctx) return;
    const { rowCount } = await query(
      `DELETE FROM attendance_sessions WHERE id=$1 AND ("group" = $2 OR $3)`,
      [req.params.id, ctx.group, ctx.isSuper]
    );
    if (!rowCount) return res.status(404).json({ message: 'Session not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: 'Failed to delete session' }); }
});

// ---- Admin: roster + records ----
router.get('/sessions/:id/roster', async (req, res) => {
  try {
    const ctx = await adminContext(req, res); if (!ctx) return;
    const session = (await query(`SELECT * FROM attendance_sessions WHERE id=$1`, [req.params.id])).rows[0];
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!ctx.isSuper && session.group !== ctx.group) return res.status(403).json({ message: 'Not your group' });
    const members = (await query(
      `SELECT id, username AS name, email, contact_number FROM app_users WHERE user_group=$1 AND is_approved=true AND (is_current IS NULL OR is_current = true) AND role <> 'admin' AND role <> 'super-admin' ORDER BY name`,
      [session.group]
    )).rows;
    const records = (await query(`SELECT * FROM attendance_records WHERE session_id=$1`, [session.id])).rows;
    const byUser = new Map(records.map(r => [r.user_id, r]));
    res.json({
      session,
      members: members.map(m => ({ ...m, record: byUser.get(m.id) || null })),
    });
  } catch (err) { console.error('roster error:', err); res.status(500).json({ message: 'Failed to load roster' }); }
});

router.put('/sessions/:id/records', async (req, res) => {
  try {
    const ctx = await adminContext(req, res); if (!ctx) return;
    const session = (await query(`SELECT * FROM attendance_sessions WHERE id=$1`, [req.params.id])).rows[0];
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!ctx.isSuper && session.group !== ctx.group) return res.status(403).json({ message: 'Not your group' });
    const items = Array.isArray(req.body.records) ? req.body.records : [];
    for (const item of items) {
      const status = STATUSES.includes(item.status) ? item.status : null;
      if (!status || !item.userId) continue;
      const hasReason = status === 'absent' && !!item.hasReason;
      const reason = hasReason ? String(item.reason || '').trim() || null : null;
      await query(
        `INSERT INTO attendance_records (session_id, user_id, user_email, user_name, status, has_reason, reason, recorded_by)
         SELECT $1, u.id, u.email, u.username, $3, $4, $5, $6 FROM app_users u WHERE u.id=$2
         ON CONFLICT (session_id, user_id) DO UPDATE SET status=$3, has_reason=$4, reason=$5, recorded_by=$6, updated_at=now()`,
        [session.id, item.userId, status, hasReason, reason, ctx.admin.email]
      );
    }
    res.json({ success: true });
  } catch (err) { console.error('save records error:', err); res.status(500).json({ message: 'Failed to save attendance' }); }
});

// ---- Admin: create singer account + email password setup ----
router.post('/singers', async (req, res) => {
  try {
    const ctx = await adminContext(req, res); if (!ctx) return;
    const group = String(req.body.group || ctx.group).toLowerCase();
    if (!ALLOWED_GROUPS.includes(group)) return res.status(400).json({ message: 'Only choir and anointed singers' });
    const email = String(req.body.email || '').trim().toLowerCase();
    const name = String(req.body.fullName || req.body.name || '').trim();
    const phone = String(req.body.phone || req.body.contactNumber || '').trim();
    if (!email || !email.includes('@')) return res.status(400).json({ message: 'Valid Gmail address required' });
    if (!name) return res.status(400).json({ message: 'Full name is required' });
    const exists = await query(`SELECT id FROM app_users WHERE lower(email)=$1 AND user_group=$2 LIMIT 1`, [email, group]);
    if (exists.rows.length) return res.status(400).json({ message: 'A member with this email already exists in this group' });
    const hashedPassword = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const { rows } = await query(
      `INSERT INTO app_users (email, username, password, contact_number, role, is_verified, is_approved,
        user_group, admin_group, verification_token, approved_at, approved_by, created_at, updated_at)
       VALUES ($1,$2,$3,$4,'member',false,true,$5,$5,$6,now(),$7,now(),now()) RETURNING id, email, username`,
      [email, name, hashedPassword, phone || null, group, verificationToken, ctx.admin.email]
    );
    const backendUrl = process.env.BACKEND_URL || 'https://cep-backend-hjfu.onrender.com';
    const setupLink = `${backendUrl}/api/auth/verify?token=${verificationToken}`;
    // Send email in background - never block account creation on SMTP
    sendAdminInvitationEmail(email, name, setupLink, group, 'member')
      .then(r => console.log('singer invite email result:', r && r.success ? 'sent' : (r && r.message) || 'failed'))
      .catch(err => console.error('singer invite email failed:', err));
    res.status(201).json({ success: true, member: rows[0], emailSent: true, passwordSetupLink: setupLink });
  } catch (err) { console.error('create singer error:', err); res.status(500).json({ message: 'Failed to create singer account' }); }
});

// ---- Admin: SMTP diagnostic ----
router.post('/test-email', async (req, res) => {
  try {
    const ctx = await adminContext(req, res); if (!ctx) return;
    const nodemailer = require('nodemailer');
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_APP_PASSWORD;
    const brevoKey = process.env.BREVO_SMTP_KEY;
    const brevoUser = process.env.BREVO_SMTP_USER || user;
    if (!brevoKey && (!user || !pass)) {
      return res.json({ success: false, reason: 'EMAIL_USER/EMAIL_APP_PASSWORD or BREVO_SMTP_KEY not set in environment' });
    }
    const cfg = brevoKey ? {
      host: 'smtp-relay.brevo.com', port: 587, secure: false, requireTLS: true,
      auth: { user: brevoUser, pass: brevoKey },
    } : {
      host: 'smtp.gmail.com', port: 587, secure: false, requireTLS: true,
      auth: { user, pass: String(pass).replace(/\s+/g, '') },
    };
    const t = nodemailer.createTransport({
      ...cfg,
      tls: { rejectUnauthorized: false },
      connectionTimeout: 20000, greetingTimeout: 20000, socketTimeout: 20000,
    });
    const info = await t.sendMail({
      from: `CEP RP Huye College <${user}>`,
      to: ctx.admin.email,
      subject: 'CEP SMTP Test',
      text: 'If you received this, SMTP is working from the server.',
    });
    res.json({ success: true, messageId: info.messageId, sentTo: ctx.admin.email });
  } catch (err) {
    res.json({ success: false, reason: err.message, code: err.code || null });
  }
});

// ---- Singer: own attendance ----
router.get('/me', async (req, res) => {
  try {
    const member = await memberFromToken(req);
    if (!member) return res.status(401).json({ message: 'Login required' });
    const { rows } = await query(
      `SELECT r.*, s.title AS session_title, s.session_date, s.session_time, s.location AS session_location, s."group" AS session_group
       FROM attendance_records r JOIN attendance_sessions s ON s.id = r.session_id
       WHERE lower(r.user_email) = $1 ORDER BY s.session_date DESC NULLS LAST`,
      [member.email]
    );
    res.json({ records: rows });
  } catch (err) { console.error('my attendance error:', err); res.status(500).json({ message: 'Failed to load attendance' }); }
});

module.exports = router;
