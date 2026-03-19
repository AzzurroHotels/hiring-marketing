import { Router } from 'express';
import multer from 'multer';
import { mkdirSync, renameSync } from 'fs';
import { join, basename } from 'path';
import db from '../db.js';

const router = Router();

// Upload to a temp dir first; we move files into per-candidate folders after parsing the payload
const upload = multer({
  dest: 'uploads/_tmp',
  limits: { fileSize: 100 * 1024 * 1024 },
});

const FILE_FIELDS = [
  'laptopSpecsFile',
  'internetSpeedFile',
  'devicePhotoFile',
  'testVideo1File',
  'testVideo2File',
];

const insertCandidate = db.prepare(`
  INSERT INTO marketing_candidates
    (first_name, last_name, email, whatsapp, location, portfolio_url, tiktok_url, instagram_url,
     current_stage, device_score, progress, candidate_payload)
  VALUES
    (@first_name, @last_name, @email, @whatsapp, @location, @portfolio_url, @tiktok_url, @instagram_url,
     @current_stage, @device_score, @progress, @candidate_payload)
`);

const insertFile = db.prepare(`
  INSERT INTO marketing_candidate_files
    (candidate_id, file_key, file_name, file_path, public_url, file_type, file_size)
  VALUES
    (@candidate_id, @file_key, @file_name, @file_path, @public_url, @file_type, @file_size)
`);

const checkStarted = db.prepare(`SELECT id FROM started_sessions WHERE email = ?`);

const markCompleted = db.prepare(`
  UPDATE started_sessions SET completed = 1, completed_at = datetime('now') WHERE email = ?
`);

router.post(
  '/start',
  (req, res) => {
    try {
      const { email, whatsapp, portfolioUrl, tiktokUrl, instagramUrl, firstName, lastName } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required.' });

      // Check for existing session by email, whatsapp, portfolio, or social URLs
      const match = db.prepare(`
        SELECT id, email, completed FROM started_sessions
        WHERE email = @email
          OR (@whatsapp != '' AND whatsapp = @whatsapp)
          OR (@portfolioUrl != '' AND portfolio_url = @portfolioUrl)
          OR (@tiktokUrl != '' AND tiktok_url = @tiktokUrl)
          OR (@instagramUrl != '' AND instagram_url = @instagramUrl)
        LIMIT 1
      `).get({
        email,
        whatsapp: whatsapp || '',
        portfolioUrl: portfolioUrl || '',
        tiktokUrl: tiktokUrl || '',
        instagramUrl: instagramUrl || '',
      });

      if (match) {
        return res.status(409).json({
          error: 'You have already started this assessment. Please contact HR if you need to retake it.',
          existing: true,
        });
      }

      db.prepare(`
        INSERT INTO started_sessions (email, whatsapp, portfolio_url, tiktok_url, instagram_url, first_name, last_name)
        VALUES (@email, @whatsapp, @portfolio_url, @tiktok_url, @instagram_url, @first_name, @last_name)
      `).run({
        email,
        whatsapp: whatsapp || null,
        portfolio_url: portfolioUrl || null,
        tiktok_url: tiktokUrl || null,
        instagram_url: instagramUrl || null,
        first_name: firstName || null,
        last_name: lastName || null,
      });

      res.json({ ok: true });
    } catch (err) {
      console.error('Start error:', err);
      res.status(400).json({ error: err.message || 'Failed to start session.' });
    }
  }
);

router.post(
  '/submit',
  upload.fields(FILE_FIELDS.map((name) => ({ name, maxCount: 1 }))),
  async (req, res) => {
    try {
      const payload = JSON.parse(req.body.payload || '{}');
      const candidate = payload.candidate || {};
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;

      // Build a safe folder name from email
      const folderName = (candidate.email || 'unknown').replace(/[^a-zA-Z0-9._@-]/g, '_');

      // Insert candidate
      const result = insertCandidate.run({
        first_name: candidate.firstName || null,
        last_name: candidate.lastName || null,
        email: candidate.email || '',
        whatsapp: candidate.whatsapp || null,
        location: candidate.location || null,
        portfolio_url: candidate.portfolioUrl || null,
        tiktok_url: candidate.tiktokUrl || null,
        instagram_url: candidate.instagramUrl || null,
        current_stage: payload.stage || null,
        device_score: payload.deviceScore || 0,
        progress: payload.progress || 0,
        candidate_payload: JSON.stringify(payload),
      });

      const candidateId = result.lastInsertRowid;

      // Move files from temp to per-candidate folder and insert records
      const uploadedFiles = {};
      const files = req.files || {};
      for (const key of FILE_FIELDS) {
        const fileArr = files[key];
        if (fileArr && fileArr[0]) {
          const f = fileArr[0];
          const safe = f.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
          const destDir = join('uploads', folderName, key);
          mkdirSync(destDir, { recursive: true });
          const destPath = join(destDir, `${Date.now()}-${safe}`);
          renameSync(f.path, destPath);

          const publicUrl = `${baseUrl}/${destPath}`;
          insertFile.run({
            candidate_id: candidateId,
            file_key: key,
            file_name: f.originalname,
            file_path: destPath,
            public_url: publicUrl,
            file_type: f.mimetype,
            file_size: f.size,
          });
          uploadedFiles[key] = { name: f.originalname, publicUrl };
        }
      }

      // Mark started session as completed
      if (candidate.email) {
        markCompleted.run(candidate.email);
      }

      // Send email via Resend (if configured)
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      if (RESEND_API_KEY) {
        const name = [candidate.firstName, candidate.lastName].filter(Boolean).join(' ') || 'Unnamed candidate';
        const hrTo = process.env.HR_TO_EMAIL || 'careers@azzurrohotels.com';
        const fromEmail = process.env.FROM_EMAIL || 'Azzurro Hiring <onboarding@yourdomain.com>';

        const fileLines = Object.entries(uploadedFiles).length
          ? Object.entries(uploadedFiles)
              .map(([k, v]) => `<li><strong>${k}</strong>: <a href="${v.publicUrl}">${v.name}</a></li>`)
              .join('')
          : '<li>No files uploaded</li>';

        const html = `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
            <h2>New Marketing Candidate Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${candidate.email || '-'}</p>
            <p><strong>WhatsApp:</strong> ${candidate.whatsapp || '-'}</p>
            <p><strong>Location:</strong> ${candidate.location || '-'}</p>
            <p><strong>Stage:</strong> ${payload.stage || '-'}</p>
            <p><strong>Progress:</strong> ${payload.progress || 0}%</p>
            <p><strong>Device Score:</strong> ${payload.deviceScore || 0}/100</p>
            <p><strong>Started at:</strong> ${payload.startedAt || '-'}</p>
            <p><strong>Submitted at:</strong> ${payload.submittedAt || '-'}</p>
            <h3>Social / Content Answers</h3>
            <p><strong>Social usage:</strong><br>${candidate.socialUsage || '-'}</p>
            <p><strong>Current trends:</strong><br>${candidate.currentTrends || '-'}</p>
            <p><strong>Favorite influencer:</strong> ${candidate.favoriteInfluencer || '-'}</p>
            <p><strong>Why:</strong><br>${candidate.influencerReason || '-'}</p>
            <p><strong>Ranking notes:</strong><br>${candidate.rankingNotes || '-'}</p>
            <p><strong>Best performing video:</strong> ${candidate.bestPerformingVideo || '-'}</p>
            <p><strong>Why it will perform best:</strong><br>${candidate.bestVideoWhy || '-'}</p>
            <p><strong>What would you change:</strong><br>${candidate.whatWouldYouChange || '-'}</p>
            <p><strong>Focus notes:</strong><br>${candidate.focusNotes || '-'}</p>
            <p><strong>Remake changes:</strong><br>${candidate.remakeChanges || '-'}</p>
            <p><strong>Questions for Lisa:</strong><br>${candidate.questionsForLisa || '-'}</p>
            <h3>Uploaded files</h3>
            <ul>${fileLines}</ul>
          </div>`;

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [hrTo],
            subject: `New Marketing Candidate Submission - ${name}`,
            html,
          }),
        });
      }

      res.json({ ok: true, candidateId: Number(candidateId) });
    } catch (err) {
      console.error('Submit error:', err);
      res.status(400).json({ error: err.message || 'Submission failed.' });
    }
  }
);

export { router as submitRoute };
