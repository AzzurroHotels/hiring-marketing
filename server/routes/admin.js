import { Router } from 'express';
import db from '../db.js';

const router = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'abc@123';

function requireAuth(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password.' });
  }
  next();
}

router.use(requireAuth);

const getStats = db.prepare(`
  SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as awaiting_review,
    SUM(CASE WHEN status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted,
    ROUND(AVG(device_score)) as avg_device_score
  FROM marketing_candidates
`);

const getCandidates = db.prepare(`
  SELECT
    c.id, c.first_name, c.last_name, c.email, c.whatsapp, c.location,
    c.current_stage, c.device_score, c.progress, c.status,
    c.candidate_payload, c.created_at
  FROM marketing_candidates c
  ORDER BY c.created_at DESC
`);

const getFiles = db.prepare(`
  SELECT id, candidate_id, file_key, file_name, public_url, file_type, file_size
  FROM marketing_candidate_files
  WHERE candidate_id = ?
`);

const updateStatus = db.prepare(`
  UPDATE marketing_candidates SET status = ? WHERE id = ?
`);

router.get('/stats', (_req, res) => {
  const row = getStats.get();
  res.json({
    total: row.total || 0,
    awaitingReview: row.awaiting_review || 0,
    shortlisted: row.shortlisted || 0,
    avgDeviceScore: row.avg_device_score || 0,
  });
});

router.get('/candidates', (_req, res) => {
  const rows = getCandidates.all();
  const candidates = rows.map((row) => ({
    ...row,
    candidate_payload: JSON.parse(row.candidate_payload || '{}'),
    files: getFiles.all(row.id),
  }));
  res.json(candidates);
});

router.patch('/candidates/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required.' });
  updateStatus.run(status, req.params.id);
  res.json({ ok: true });
});

// Started sessions management
const getSessions = db.prepare(`
  SELECT id, email, first_name, last_name, whatsapp, completed, started_at, completed_at
  FROM started_sessions
  ORDER BY started_at DESC
`);

const deleteSession = db.prepare(`DELETE FROM started_sessions WHERE id = ?`);

router.get('/sessions', (_req, res) => {
  res.json(getSessions.all());
});

router.delete('/sessions/:id', (req, res) => {
  deleteSession.run(req.params.id);
  res.json({ ok: true });
});

export { router as adminRoute };
