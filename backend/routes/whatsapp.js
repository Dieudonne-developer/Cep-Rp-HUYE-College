const express = require('express');
const router = express.Router();
const { query } = require('../src/db/pool');
const { createModel } = require('../src/db/createModel');
const { readAccessToken } = require('../src/auth/accessToken');

const WhatsAppGroup = createModel('whatsapp_groups', {
  defaults: { isActive: true },
});
const WhatsAppRequest = createModel('whatsapp_access_requests', {
  defaults: { status: 'pending' },
});

function normalizeInvite(raw) {
  const value = String(raw || '').trim();
  if (!value) return null;
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'chat.whatsapp.com') return false;
  const code = parsed.pathname.replace(/^\/+/, '').split('/')[0];
  if (!/^[A-Za-z0-9]{10,}$/.test(code)) return false;
  return `https://chat.whatsapp.com/${code}`;
}

function mapUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    email: row.email,
    username: row.username,
    role: row.role,
    isVerified: row.is_verified,
    isApproved: row.is_approved,
    userGroup: row.user_group,
  };
}

async function findMember(email) {
  const emailLower = String(email || '').trim().toLowerCase();
  if (!emailLower) return null;
  const result = await query(
    'SELECT * FROM app_users WHERE lower(email) = $1 ORDER BY is_approved DESC, created_at ASC LIMIT 1',
    [emailLower]
  );
  return mapUser(result.rows[0]);
}

function memberFromRequest(req) {
  const header = req.header('authorization') || '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  const payload = readAccessToken(token);
  return payload ? payload.email : null;
}

function publicGroup(group) {
  return {
    id: group._id,
    slug: group.slug,
    name: group.name,
    description: group.description || '',
    isActive: group.isActive !== false,
    hasInvite: Boolean(group.inviteUrl),
  };
}

async function requireAdmin(req, res) {
  const email = String(req.header('x-admin-email') || '').trim().toLowerCase();
  if (!email) {
    res.status(401).json({ success: false, message: 'Admin sign-in is required' });
    return null;
  }
  const user = await findMember(email);
  const role = (user?.role || '').toLowerCase();
  if (!user || (role !== 'admin' && role !== 'super-admin') || !user.isApproved) {
    res.status(403).json({ success: false, message: 'Only administrators can manage WhatsApp groups' });
    return null;
  }
  return user;
}

const FAMILY_SLUGS = new Set(['choir', 'cepier', 'anointed', 'abanyamugisha', 'psalm23', 'psalm46', 'protocol', 'social', 'evangelical']);

function contactKey(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length < 9) return '';
  return digits.slice(-9);
}

async function findApprovedMember(contactNumber, slug) {
  const key = contactKey(contactNumber);
  if (!key) return { error: 'Enter a valid contact number.' };
  const params = [key];
  let sql = `SELECT username, user_group FROM app_users
    WHERE is_approved = TRUE
      AND right(regexp_replace(coalesce(contact_number, ''), '\\D', '', 'g'), 9) = $1`;
  if (FAMILY_SLUGS.has(slug)) {
    params.push(slug);
    sql += ` AND user_group = $2`;
  }
  sql += ' LIMIT 1';
  const result = await query(sql, params);
  return { user: result.rows[0] || null };
}

router.post('/open', async (req, res) => {
  try {
    const slug = String(req.body.slug || '').trim().toLowerCase();
    const group = slug
      ? await WhatsAppGroup.findOne({ slug })
      : await WhatsAppGroup.findById(req.body.groupId);
    if (!group || group.isActive === false) {
      return res.status(404).json({ success: false, message: 'WhatsApp group not found' });
    }
    const found = await findApprovedMember(req.body.contactNumber, group.slug);
    if (found.error) return res.status(400).json({ success: false, message: found.error });
    if (!found.user) {
      return res.status(403).json({
        success: false,
        message: 'This contact number is not a member of this group.',
      });
    }
    if (!group.inviteUrl) {
      return res.json({
        success: true,
        member: true,
        inviteUrl: null,
        message: 'Your contact is a member of this group. Invitation link not yet provided.',
      });
    }
    res.json({
      success: true,
      member: true,
      inviteUrl: group.inviteUrl,
      message: 'Your contact is a member of this group. Open the invitation in WhatsApp. This does not add you to the group by itself.',
    });
  } catch (error) {
    console.error('WhatsApp open error:', error);
    res.status(500).json({ success: false, message: 'Could not check this contact number' });
  }
});

router.get('/groups', async (req, res) => {
  try {
    const groups = await WhatsAppGroup.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      groups: groups.map((group) => publicGroup(group)),
    });
  } catch (error) {
    console.error('WhatsApp groups error:', error);
    res.status(500).json({ success: false, message: 'Failed to load WhatsApp groups' });
  }
});

router.post('/requests', async (req, res) => {
  try {
    const email = memberFromRequest(req);
    if (!email) {
      return res.status(401).json({ success: false, message: 'Sign in before requesting a WhatsApp group.' });
    }
    const member = await findMember(email);
    if (!member || !member.isVerified || !member.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Only an approved member account can request a WhatsApp group.',
      });
    }
    const group = await WhatsAppGroup.findById(req.body.groupId);
    if (!group || group.isActive === false) {
      return res.status(404).json({ success: false, message: 'WhatsApp group not found' });
    }
    const existing = await WhatsAppRequest.findOne({ groupId: group._id, userEmail: email });
    if (existing) {
      if (existing.status === 'rejected') {
        existing.status = 'pending';
        existing.note = '';
        existing.reviewedBy = null;
        existing.reviewedAt = null;
        await existing.save();
      }
      return res.json({
        success: true,
        message: existing.status === 'approved'
          ? 'You are already approved for this group. Open the invitation link to join it in WhatsApp.'
          : 'Your request is awaiting administrator approval.',
        request: { id: existing._id, status: existing.status, groupId: existing.groupId },
      });
    }
    const created = await WhatsAppRequest.create({
      groupId: group._id,
      userEmail: email,
      username: member.username,
      userGroup: member.userGroup,
      status: 'pending',
    });
    res.json({
      success: true,
      message: 'Request sent. An administrator will review it.',
      request: { id: created._id, status: created.status, groupId: created.groupId },
    });
  } catch (error) {
    console.error('WhatsApp request error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit request' });
  }
});

router.get('/admin/groups', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const groups = await WhatsAppGroup.find().sort({ name: 1 });
    res.json({
      success: true,
      groups: groups.map((group) => ({
        id: group._id,
        slug: group.slug,
        name: group.name,
        description: group.description || '',
        inviteUrl: group.inviteUrl || '',
        isActive: group.isActive !== false,
        hasInvite: Boolean(group.inviteUrl),
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load groups' });
  }
});

router.post('/admin/groups', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const name = String(req.body.name || '').trim();
    const slug = String(req.body.slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!name || !slug) return res.status(400).json({ success: false, message: 'Group name is required' });
    const invite = normalizeInvite(req.body.inviteUrl);
    if (invite === false) {
      return res.status(400).json({ success: false, message: 'Invitation link must be an https://chat.whatsapp.com/ link, or left empty.' });
    }
    const group = await WhatsAppGroup.create({
      name,
      slug,
      description: String(req.body.description || '').trim(),
      inviteUrl: invite,
      isActive: req.body.isActive !== false,
    });
    res.json({ success: true, group: { id: group._id, slug: group.slug, name: group.name, inviteUrl: group.inviteUrl || '' } });
  } catch (error) {
    const duplicate = /duplicate key|unique/i.test(error.message || '');
    res.status(duplicate ? 400 : 500).json({
      success: false,
      message: duplicate ? 'A group with that name already exists' : 'Failed to create group',
    });
  }
});

router.put('/admin/groups/:id', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const group = await WhatsAppGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (req.body.name != null) group.name = String(req.body.name).trim();
    if (req.body.description != null) group.description = String(req.body.description).trim();
    if (req.body.isActive != null) group.isActive = Boolean(req.body.isActive);
    if (Object.prototype.hasOwnProperty.call(req.body, 'inviteUrl')) {
      const invite = normalizeInvite(req.body.inviteUrl);
      if (invite === false) {
        return res.status(400).json({ success: false, message: 'Invitation link must be an https://chat.whatsapp.com/ link, or left empty.' });
      }
      group.inviteUrl = invite;
    }
    await group.save();
    res.json({
      success: true,
      group: {
        id: group._id,
        slug: group.slug,
        name: group.name,
        description: group.description || '',
        inviteUrl: group.inviteUrl || '',
        isActive: group.isActive !== false,
        hasInvite: Boolean(group.inviteUrl),
      },
    });
  } catch (error) {
    console.error('WhatsApp group update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update group' });
  }
});

router.get('/admin/requests', async (req, res) => {
  try {
    if (!(await requireAdmin(req, res))) return;
    const requests = await WhatsAppRequest.find().sort({ createdAt: -1 });
    const groups = await WhatsAppGroup.find();
    const names = new Map(groups.map((group) => [String(group._id), group.name]));
    res.json({
      success: true,
      requests: requests.map((item) => ({
        id: item._id,
        groupId: item.groupId,
        groupName: names.get(String(item.groupId)) || 'Unknown group',
        userEmail: item.userEmail,
        username: item.username,
        userGroup: item.userGroup,
        status: item.status,
        note: item.note || '',
        reviewedBy: item.reviewedBy || '',
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load requests' });
  }
});

router.post('/admin/requests/:id/decision', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const status = req.body.status === 'approved' ? 'approved' : req.body.status === 'rejected' ? 'rejected' : '';
    if (!status) return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    const request = await WhatsAppRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    request.status = status;
    request.note = String(req.body.note || '').trim();
    request.reviewedBy = admin.email;
    request.reviewedAt = new Date();
    await request.save();
    res.json({
      success: true,
      message: status === 'approved'
        ? 'Approved. The member can now open this invitation link. Approval does not add them to the WhatsApp group automatically.'
        : 'Request rejected.',
      request: { id: request._id, status: request.status },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update request' });
  }
});

module.exports = router;
