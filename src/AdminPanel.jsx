import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from './config';

function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function Metric({ label, value, hint }) {
  return (
    <Card className="metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-hint">{hint}</div>
    </Card>
  );
}

const STATUS_OPTIONS = ['Submitted', 'In Review', 'Shortlisted', 'Flagged', 'Rejected', 'Hired'];

const SCREENING2_VIDEOS = [
  { id: 1, score: 1 },
  { id: 2, score: 2 },
  { id: 3, score: 4 },
  { id: 4, score: 1 },
  { id: 5, score: 2 },
];

function seededShuffle(arr, seed) {
  let s = [...arr];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  for (let i = s.length - 1; i > 0; i--) {
    h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) | 0;
    const j = Math.abs(h) % (i + 1);
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

function CandidateVideoOrder({ email }) {
  const shuffled = seededShuffle(SCREENING2_VIDEOS, email || 'default');
  const correct = [...shuffled].sort((a, b) => b.score - a.score);
  return (
    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
      <strong>Screening 2 video order shown:</strong>{' '}
      {shuffled.map((v, i) => (
        <span key={v.id}>Video {v.id} (score {v.score}){i < shuffled.length - 1 ? ' → ' : ''}</span>
      ))}
      <br />
      <strong>Correct ranking (high→low):</strong>{' '}
      {correct.map((v, i) => (
        <span key={v.id}>Video {v.id} (score {v.score}){i < correct.length - 1 ? ' → ' : ''}</span>
      ))}
    </div>
  );
}


export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab] = useState('candidates');

  async function apiFetch(path, options = {}) {
    const res = await fetch(`${APP_CONFIG.apiUrl}/admin${path}`, {
      ...options,
      headers: {
        'x-admin-password': password,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (res.status === 401) {
      setAuthed(false);
      setAuthError('Session expired. Please log in again.');
      throw new Error('Unauthorized');
    }
    return res;
  }

  async function login(e) {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${APP_CONFIG.apiUrl}/admin/stats`, {
        headers: { 'x-admin-password': password },
      });
      if (res.status === 401) {
        setAuthError('Wrong password.');
        return;
      }
      setAuthed(true);
    } catch {
      setAuthError('Could not connect to server.');
    }
  }

  useEffect(() => {
    if (!authed) return;
    loadData();
  }, [authed]);

  async function loadData() {
    try {
      const [statsRes, candidatesRes, sessionsRes] = await Promise.all([
        apiFetch('/stats'),
        apiFetch('/candidates'),
        apiFetch('/sessions'),
      ]);
      setStats(await statsRes.json());
      setCandidates(await candidatesRes.json());
      setSessions(await sessionsRes.json());
    } catch {
      // auth error handled in apiFetch
    }
  }

  async function updateStatus(id, newStatus) {
    await apiFetch(`/candidates/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    const statsRes = await apiFetch('/stats');
    setStats(await statsRes.json());
  }

  async function clearSession(id) {
    await apiFetch(`/sessions/${id}`, { method: 'DELETE' });
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  if (!authed) {
    return (
      <div className="app-shell">
        <header className="hero">
          <div>
            <p className="eyebrow">Internal hiring system</p>
            <h1>Admin Panel</h1>
            <p className="hero-copy">Enter the admin password to continue.</p>
          </div>
        </header>
        <div style={{ maxWidth: 400, margin: '2rem auto' }}>
          <Card>
            <form onSubmit={login} className="stack">
              <label className="field">
                <span className="field-label">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </label>
              {authError && <Card className="notice error">{authError}</Card>}
              <button className="primary" type="submit">Log in</button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  const expandedPayload = expanded != null
    ? candidates.find((c) => c.id === expanded)?.candidate_payload?.candidate
    : null;

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Internal hiring system</p>
          <h1>Admin Panel</h1>
          <p className="hero-copy">Manage candidate submissions and pipeline status.</p>
        </div>
        <div className="hero-actions">
          <button className={`pill ${tab === 'candidates' ? 'pill-active' : ''}`} onClick={() => setTab('candidates')}>
            Candidates
          </button>
          <button className={`pill ${tab === 'sessions' ? 'pill-active' : ''}`} onClick={() => setTab('sessions')}>
            Started Sessions ({sessions.length})
          </button>
          <button className="pill" onClick={loadData}>Refresh</button>
          <button className="pill" onClick={() => { setAuthed(false); setPassword(''); }}>Log out</button>
        </div>
      </header>

      {stats && (
        <div className="metrics-grid">
          <Metric label="Total Candidates" value={stats.total} hint="All submissions" />
          <Metric label="Awaiting Review" value={stats.awaitingReview} hint="Status: Submitted" />
          <Metric label="Shortlisted" value={stats.shortlisted} hint="Ready for Lisa interview" />
          <Metric label="Avg Device Score" value={stats.avgDeviceScore || 0} hint="Across all candidates" />
        </div>
      )}

      {tab === 'candidates' && (
        <Card>
          <h2>Candidate Pipeline</h2>
          {candidates.length === 0 ? (
            <p className="muted">No submissions yet.</p>
          ) : (
            <div className="candidate-list">
              {candidates.map((c) => (
                <Card key={c.id} className="candidate-item">
                  <div className="candidate-head">
                    <div>
                      <strong>{[c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unnamed'}</strong>
                      <div className="muted small">{c.email}</div>
                    </div>
                    <select
                      className={`badge ${c.status.toLowerCase().replace(/\s+/g, '-')}`}
                      value={c.status}
                      onChange={(e) => updateStatus(c.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="small"><strong>Stage:</strong> {c.current_stage || '-'}</div>
                  <div className="small"><strong>Device Score:</strong> {c.device_score}/100</div>
                  <div className="small"><strong>Progress:</strong> {c.progress}%</div>
                  <div className="small"><strong>Submitted:</strong> {c.created_at}</div>
                  {c.candidate_payload?.startedAt && (
                    <div className="small"><strong>Started:</strong> {c.candidate_payload.startedAt}</div>
                  )}

                  {c.files && c.files.length > 0 && (
                    <div className="small" style={{ marginTop: '0.5rem' }}>
                      <strong>Files:</strong>{' '}
                      {c.files.map((f) => (
                        <a key={f.id} href={f.public_url} target="_blank" rel="noreferrer" style={{ marginRight: '0.75rem' }}>
                          {f.file_name}
                        </a>
                      ))}
                    </div>
                  )}

                  <button
                    className="secondary"
                    style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  >
                    {expanded === c.id ? 'Hide details' : 'Show details'}
                  </button>

                  {expanded === c.id && expandedPayload && (
                    <div className="stack" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                      <div><strong>WhatsApp:</strong> {expandedPayload.whatsapp || '-'}</div>
                      <div><strong>Location:</strong> {expandedPayload.location || '-'}</div>
                      <div><strong>Portfolio:</strong> {expandedPayload.portfolioUrl || '-'}</div>
                      <div><strong>TikTok:</strong> {expandedPayload.tiktokUrl || '-'}</div>
                      <div><strong>Instagram:</strong> {expandedPayload.instagramUrl || '-'}</div>
                      <div><strong>Social usage:</strong> {expandedPayload.socialUsage || '-'}</div>
                      <div><strong>Current trends:</strong> {expandedPayload.currentTrends || '-'}</div>
                      <div><strong>Favorite influencer:</strong> {expandedPayload.favoriteInfluencer || '-'} — {expandedPayload.influencerReason || '-'}</div>
                      <div><strong>Ranking notes:</strong> {expandedPayload.rankingNotes || '-'}</div>
                      <CandidateVideoOrder email={c.email} />
                      <div><strong>Best performing video:</strong> {expandedPayload.bestPerformingVideo || '-'}</div>
                      <div><strong>Why:</strong> {expandedPayload.bestVideoWhy || '-'}</div>
                      <div><strong>What would you change:</strong> {expandedPayload.whatWouldYouChange || '-'}</div>
                      <div><strong>Focus notes (Test 1):</strong> {expandedPayload.focusNotes || '-'}</div>
                      <div><strong>Remake changes (Test 2):</strong> {expandedPayload.remakeChanges || '-'}</div>
                      <div><strong>Questions for Lisa:</strong> {expandedPayload.questionsForLisa || '-'}</div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'sessions' && (
        <Card>
          <h2>Started Sessions</h2>
          <p className="muted">These are candidates who have clicked "Continue" past the profile stage. Remove a row to allow them to retake the journey.</p>
          {sessions.length === 0 ? (
            <p className="muted" style={{ marginTop: '1rem' }}>No sessions recorded yet.</p>
          ) : (
            <div className="candidate-list">
              {sessions.map((s) => (
                <Card key={s.id} className="candidate-item">
                  <div className="candidate-head">
                    <div>
                      <strong>{[s.first_name, s.last_name].filter(Boolean).join(' ') || 'Unnamed'}</strong>
                      <div className="muted small">{s.email}</div>
                    </div>
                    <span className={`badge ${s.completed ? 'shortlisted' : 'in-review'}`}>
                      {s.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  {s.whatsapp && <div className="small"><strong>WhatsApp:</strong> {s.whatsapp}</div>}
                  <div className="small"><strong>Started:</strong> {s.started_at}</div>
                  {s.completed_at && <div className="small"><strong>Completed:</strong> {s.completed_at}</div>}
                  <button
                    className="secondary"
                    style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#dc2626' }}
                    onClick={() => clearSession(s.id)}
                  >
                    Clear (allow retake)
                  </button>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
