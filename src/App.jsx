
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { APP_CONFIG } from './config';

const STAGES = [
  { key: 'profile', title: 'Profile' },
  { key: 'screening1', title: 'Screening 1' },
  { key: 'screening2', title: 'Screening 2' },
  { key: 'trial', title: 'Trial' },
  { key: 'training', title: 'Training' },
  { key: 'review', title: 'Review & Submit' },
];

const TRIAL_LINKS = [
  ['Tip 1: How to structure your video', 'https://www.loom.com/share/2cd307d696d4471085ede4522ec0a6a7'],
  ['Tip 2: Creating Engaging Video Hooks', 'https://www.loom.com/share/9d68d53c1b9f400c973a2686af190ba2'],
  ['Tip 3: Choosing the Right Music Part 1', 'https://www.loom.com/share/e0f2add38de5415ba2a2aa729fa5cf0f'],
  ['Tip 4: Choosing the Right Music Part 2', 'https://www.loom.com/share/98d84c2539bd4aedbb8e04d6fd8c548a'],
];

const TRAINING_LINKS = [
  ['Essential Tools for the Marketing Team', 'https://www.loom.com/share/f157147f099644d59e4c26fb939a0dea'],
  ['How to make a video using our tools', 'https://www.loom.com/share/0758310f66bf460c899713140c951e56'],
  ['How to Effectively Use the Content Calendar for Video Management', 'https://www.loom.com/share/377c1914822c4fa5bfe13459e96f490e'],
  ['Adding Screen Recordings: Part 1', 'https://www.loom.com/share/390cb1cdd94541d3aac9e8bde7d51fe1'],
  ['Adding Screen Recordings: Part 2', 'https://www.loom.com/share/e9a1cd3eaf074f4eab995b3237a71e0f'],
];

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  whatsapp: '',
  location: '',
  portfolioUrl: '',
  tiktokUrl: '',
  instagramUrl: '',
  laptopCpu: '',
  laptopRam: '',
  laptopStorage: '',
  laptopOs: '',
  secondDevice: '',
  secondDeviceHasCamera: true,
  secondDeviceHasMic: true,
  phoneModel: '',
  phoneStorage: '',
  internetMbps: '',
  headphones: true,
  mouse: false,
  socialUsage: '',
  currentTrends: '',
  favoriteInfluencer: '',
  influencerReason: '',
  rankingNotes: '',
  bestPerformingVideo: '',
  bestVideoWhy: '',
  whatWouldYouChange: '',
  focusNotes: '',
  remakeChanges: '',
  questionsForLisa: '',
  watchedWhoWeAre: false,
  learnedProperties: false,
  agreedTerms: false,
};

const FILE_KEYS = [
  ['laptopSpecsFile', 'Laptop specs screenshot / photo'],
  ['internetSpeedFile', 'Internet speed screenshot'],
  ['devicePhotoFile', 'Mobile or second device photo'],
  ['testVideo1File', 'Video Test 1'],
  ['testVideo2File', 'Video Test 2'],
];

const REQUIRED_PROFILE_FIELDS = ['firstName', 'lastName', 'email', 'whatsapp', 'location'];

const REQUIRED_SCREENING1_FIELDS = [
  'laptopCpu', 'laptopRam', 'laptopStorage', 'laptopOs',
  'internetMbps', 'phoneModel',
  'socialUsage', 'currentTrends', 'favoriteInfluencer', 'influencerReason',
  'rankingNotes', 'bestPerformingVideo', 'bestVideoWhy', 'whatWouldYouChange',
];
const REQUIRED_SCREENING1_FILES = ['laptopSpecsFile', 'internetSpeedFile'];

const REQUIRED_SCREENING2_FIELDS = ['focusNotes', 'remakeChanges'];
const REQUIRED_SCREENING2_FILES = ['testVideo1File', 'testVideo2File'];

const REQUIRED_TRAINING_CHECKS = ['watchedWhoWeAre', 'learnedProperties', 'agreedTerms'];

/* ── Shared UI components ── */

function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function Input({ label, textarea = false, className = '', required, ...props }) {
  return (
    <label className={`field ${className}`}>
      {label ? <span className="field-label">{label}{required ? ' *' : ''}</span> : null}
      {textarea ? <textarea {...props} /> : <input {...props} />}
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function StageLink({ active, done, title, step, onClick }) {
  return (
    <button type="button" className={`stage-link ${active ? 'active' : ''} ${done ? 'done' : ''}`} onClick={onClick}>
      <div className="stage-dot">{done ? '✓' : step}</div>
      <div>
        <div className="stage-title">{title}</div>
        <div className="stage-sub">Step {step}</div>
      </div>
    </button>
  );
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

function FileInput({ label, helper, onChange, selectedName, required }) {
  return (
    <div className="upload-box">
      <div className="upload-text">
        <strong>{label}{required ? ' *' : ''}</strong>
        <span>{helper}</span>
        {selectedName ? <em>Selected: {selectedName}</em> : null}
      </div>
      <input type="file" onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </div>
  );
}

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/* ── Main App ── */

export default function App() {
  const [currentStage, setCurrentStage] = useState('profile');
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({});
  const [submitState, setSubmitState] = useState({ loading: false, success: false, error: '' });
  const [validationError, setValidationError] = useState('');

  // Session tracking
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [startError, setStartError] = useState('');
  const [starting, setStarting] = useState(false);

  // Timer
  useEffect(() => {
    if (!startTime) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const stageIndex = STAGES.findIndex((s) => s.key === currentStage);
  const progress = Math.round(((stageIndex + 1) / STAGES.length) * 100);

  const deviceScore = useMemo(() => {
    let score = 0;
    const ram = Number(form.laptopRam || 0);
    const storage = Number(form.laptopStorage || 0);
    const internet = Number(form.internetMbps || 0);
    if (/i5|i7|i9|ryzen 5|ryzen 7|ryzen 9|m1|m2|m3/i.test(form.laptopCpu)) score += 25;
    if (ram >= 16) score += 25;
    else if (ram >= 8) score += 15;
    if (storage >= 512) score += 20;
    else if (storage >= 256) score += 10;
    if (/windows 10|windows 11|macos 12|macos 13|macos 14|macos 15/i.test(form.laptopOs.toLowerCase())) score += 10;
    if (internet >= 50) score += 10;
    if (form.secondDeviceHasCamera) score += 5;
    if (form.secondDeviceHasMic) score += 5;
    return Math.min(100, score);
  }, [form]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function prevStage() {
    if (stageIndex > 0) setCurrentStage(STAGES[stageIndex - 1].key);
  }

  function validateStage() {
    if (currentStage === 'profile') {
      const missing = REQUIRED_PROFILE_FIELDS.filter((f) => !form[f]?.trim());
      if (missing.length) return 'Please fill in all required fields (marked with *).';
    }

    if (currentStage === 'screening1') {
      const missing = REQUIRED_SCREENING1_FIELDS.filter((f) => !String(form[f] ?? '').trim());
      const missingFiles = REQUIRED_SCREENING1_FILES.filter((f) => !files[f]);
      if (missing.length || missingFiles.length)
        return 'Please fill in all required fields and upload required files (marked with *).';
    }

    if (currentStage === 'screening2') {
      const missing = REQUIRED_SCREENING2_FIELDS.filter((f) => !form[f]?.trim());
      const missingFiles = REQUIRED_SCREENING2_FILES.filter((f) => !files[f]);
      if (missing.length || missingFiles.length)
        return 'Please fill in all required fields and upload both video tests.';
    }

    if (currentStage === 'training') {
      const unchecked = REQUIRED_TRAINING_CHECKS.filter((f) => !form[f]);
      if (unchecked.length) return 'Please confirm all checkboxes before continuing.';
    }

    return null;
  }

  async function handleContinue() {
    setValidationError('');
    setStartError('');

    const error = validateStage();
    if (error) {
      setValidationError(error);
      return;
    }

    // On profile stage, register session with server
    if (currentStage === 'profile' && !started) {
      setStarting(true);
      try {
        const res = await fetch(`${APP_CONFIG.apiUrl}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            whatsapp: form.whatsapp,
            portfolioUrl: form.portfolioUrl,
            tiktokUrl: form.tiktokUrl,
            instagramUrl: form.instagramUrl,
            firstName: form.firstName,
            lastName: form.lastName,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStartError(data.error || 'Could not start session.');
          setStarting(false);
          return;
        }
        setStarted(true);
        setStartTime(Date.now());
      } catch {
        setStartError('Could not connect to server. Please try again.');
        setStarting(false);
        return;
      }
      setStarting(false);
    }

    // Move to next stage
    if (stageIndex < STAGES.length - 1) {
      setCurrentStage(STAGES[stageIndex + 1].key);
    }
  }

  async function handleSubmit() {
    setSubmitState({ loading: true, success: false, error: '' });

    try {
      const formData = new FormData();

      for (const [key] of FILE_KEYS) {
        if (files[key]) {
          formData.append(key, files[key]);
        }
      }

      formData.append('payload', JSON.stringify({
        candidate: form,
        stage: currentStage,
        progress,
        deviceScore,
        startedAt: startTime ? new Date(startTime).toISOString() : null,
        submittedAt: new Date().toISOString(),
      }));

      const response = await fetch(`${APP_CONFIG.apiUrl}/submit`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Submission failed.');
      }

      setSubmitState({ loading: false, success: true, error: '' });
    } catch (error) {
      setSubmitState({ loading: false, success: false, error: error.message || 'Submission failed.' });
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Internal hiring system</p>
          <h1>Marketing Candidate Journey</h1>
          <p className="hero-copy">
            One portal for screening, content tests, trial resources, training, and HR review.
          </p>
        </div>
      </header>

      {/* Disclaimer shown only on Profile (before starting) */}
      {currentStage === 'profile' && !started && (
        <Card className="notice warning">
          <strong>Important — Please read before starting:</strong> This application is designed to be completed in a single sitting of approximately 2–3 hours. Your start time and submission time will be monitored. Please make sure you have enough uninterrupted time before you begin.
        </Card>
      )}

      {/* Timer shown after session has started */}
      {started && (
        <Card className="notice">
          <strong>Time elapsed:</strong> {formatElapsed(elapsed)}
        </Card>
      )}

      <div className="grid-main">
        <aside>
          <Card>
            <div className="sidebar-title">Application Progress</div>
            <div className="progress-row">
              <div className="progress-bar"><span style={{ width: `${progress}%` }} /></div>
              <strong>{progress}%</strong>
            </div>

            <div className="stage-list">
              {STAGES.map((stage, idx) => (
                <StageLink
                  key={stage.key}
                  title={stage.title}
                  step={idx + 1}
                  active={stage.key === currentStage}
                  done={idx < stageIndex}
                  onClick={() => {
                    // Only allow navigating to completed stages or current
                    if (idx <= stageIndex) setCurrentStage(stage.key);
                  }}
                />
              ))}
            </div>

            <Card className="soft">
              <div className="metric-label">Auto Device Readiness Score</div>
              <div className="big-score">{deviceScore}/100</div>
              <div className="metric-hint">Calculated from CPU, RAM, storage, OS, internet, and second-device readiness.</div>
            </Card>
          </Card>
        </aside>

        <main>
          <Card className="content-card">
            {currentStage === 'profile' && (
              <section className="stack">
                <div>
                  <h2>Candidate Profile</h2>
                  <p className="muted">Collect core applicant information before moving to technical and creative evaluation.</p>
                </div>
                <div className="grid-two">
                  <Input label="First name" required value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
                  <Input label="Last name" required value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
                  <Input label="Email address" required type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                  <Input label="WhatsApp number" required value={form.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} />
                  <Input label="Location" required value={form.location} onChange={(e) => setField('location', e.target.value)} />
                  <Input label="Portfolio / Google Drive / Link" value={form.portfolioUrl} onChange={(e) => setField('portfolioUrl', e.target.value)} />
                  <Input label="TikTok profile URL" value={form.tiktokUrl} onChange={(e) => setField('tiktokUrl', e.target.value)} />
                  <Input label="Instagram profile URL" value={form.instagramUrl} onChange={(e) => setField('instagramUrl', e.target.value)} />
                </div>
              </section>
            )}

            {currentStage === 'screening1' && (
              <section className="stack">
                <div>
                  <h2>Screening 1 — Device + Social Fit</h2>
                  <p className="muted">Measure production readiness, content awareness, and natural marketing judgment.</p>
                </div>

                <div className="grid-two">
                  <Card className="subcard">
                    <h3>1. Laptop</h3>
                    <div className="grid-one">
                      <Input label="CPU" required placeholder="Intel i5 / Ryzen 5 / Apple M1 or better" value={form.laptopCpu} onChange={(e) => setField('laptopCpu', e.target.value)} />
                      <Input label="RAM (GB)" required type="number" value={form.laptopRam} onChange={(e) => setField('laptopRam', e.target.value)} />
                      <Input label="Storage (GB)" required type="number" value={form.laptopStorage} onChange={(e) => setField('laptopStorage', e.target.value)} />
                      <Input label="Operating System" required placeholder="Windows 10+ or macOS 12+" value={form.laptopOs} onChange={(e) => setField('laptopOs', e.target.value)} />
                      <FileInput
                        label="Upload laptop screenshot / device specs"
                        required
                        helper="Task Manager, About This Mac, or device photo"
                        selectedName={files.laptopSpecsFile?.name}
                        onChange={(file) => setFiles((prev) => ({ ...prev, laptopSpecsFile: file }))}
                      />
                    </div>
                  </Card>

                  <Card className="subcard">
                    <h3>2. Second Device + Mobile + Internet</h3>
                    <div className="grid-one">
                      <Input label="Second device type" placeholder="Tablet, second laptop, or smartphone" value={form.secondDevice} onChange={(e) => setField('secondDevice', e.target.value)} />
                      <Checkbox label="Second device has camera" checked={form.secondDeviceHasCamera} onChange={(v) => setField('secondDeviceHasCamera', v)} />
                      <Checkbox label="Second device has microphone" checked={form.secondDeviceHasMic} onChange={(v) => setField('secondDeviceHasMic', v)} />
                      <Input label="Mobile phone model" required placeholder="iPhone 12+ or modern Android equivalent" value={form.phoneModel} onChange={(e) => setField('phoneModel', e.target.value)} />
                      <Input label="Mobile phone storage (GB)" type="number" value={form.phoneStorage} onChange={(e) => setField('phoneStorage', e.target.value)} />
                      <Input label="Internet speed (Mbps)" required type="number" value={form.internetMbps} onChange={(e) => setField('internetMbps', e.target.value)} />
                      <Checkbox label="Headphones with microphone available" checked={form.headphones} onChange={(v) => setField('headphones', v)} />
                      <Checkbox label="Mouse available" checked={form.mouse} onChange={(v) => setField('mouse', v)} />
                      <FileInput
                        label="Upload internet speed screenshot"
                        required
                        helper="Speedtest screenshot preferred"
                        selectedName={files.internetSpeedFile?.name}
                        onChange={(file) => setFiles((prev) => ({ ...prev, internetSpeedFile: file }))}
                      />
                      <FileInput
                        label="Upload device photo"
                        helper="Optional phone or second-device image"
                        selectedName={files.devicePhotoFile?.name}
                        onChange={(file) => setFiles((prev) => ({ ...prev, devicePhotoFile: file }))}
                      />
                    </div>
                  </Card>
                </div>

                <div className="grid-one">
                  <Input label="How often do you use social media?" required textarea rows="3" value={form.socialUsage} onChange={(e) => setField('socialUsage', e.target.value)} />
                  <Input label="What are current trends on TikTok and Instagram?" required textarea rows="4" value={form.currentTrends} onChange={(e) => setField('currentTrends', e.target.value)} />
                  <Input label="Who is your favorite influencer?" required value={form.favoriteInfluencer} onChange={(e) => setField('favoriteInfluencer', e.target.value)} />
                  <Input label="Why is this your favorite influencer?" required textarea rows="3" value={form.influencerReason} onChange={(e) => setField('influencerReason', e.target.value)} />
                  <Input label="Watch 5 videos and rank them by virality" required textarea rows="4" value={form.rankingNotes} onChange={(e) => setField('rankingNotes', e.target.value)} />
                  <Input label="Which one will perform best?" required value={form.bestPerformingVideo} onChange={(e) => setField('bestPerformingVideo', e.target.value)} />
                  <Input label="Why will it perform best?" required textarea rows="3" value={form.bestVideoWhy} onChange={(e) => setField('bestVideoWhy', e.target.value)} />
                  <Input label="What would you change?" required textarea rows="3" value={form.whatWouldYouChange} onChange={(e) => setField('whatWouldYouChange', e.target.value)} />
                </div>
              </section>
            )}

            {currentStage === 'screening2' && (
              <section className="stack">
                <div>
                  <h2>Screening 2 — Content Creation Test</h2>
                  <p className="muted">The candidate submits an initial edit, then a revised version after watching guidance materials.</p>
                </div>

                <div className="grid-two">
                  <Card className="subcard">
                    <h3>Video Creation Test 1</h3>
                    <p className="muted">HR provides sample files. Candidate creates one short-form video.</p>
                    <FileInput
                      label="Upload Video Test 1"
                      required
                      helper="MP4, MOV, or any export file"
                      selectedName={files.testVideo1File?.name}
                      onChange={(file) => setFiles((prev) => ({ ...prev, testVideo1File: file }))}
                    />
                    <Input label="What did you focus on in your first video?" required textarea rows="5" value={form.focusNotes} onChange={(e) => setField('focusNotes', e.target.value)} />
                  </Card>

                  <Card className="subcard">
                    <h3>Video Creation Test 2</h3>
                    <p className="muted">Watch the Loom videos, remake the video, then explain the changes.</p>
                    <FileInput
                      label="Upload Video Test 2"
                      required
                      helper="Improved version after learning resources"
                      selectedName={files.testVideo2File?.name}
                      onChange={(file) => setFiles((prev) => ({ ...prev, testVideo2File: file }))}
                    />
                    <Input label="What changed from your initial video?" required textarea rows="5" value={form.remakeChanges} onChange={(e) => setField('remakeChanges', e.target.value)} />
                  </Card>
                </div>
              </section>
            )}

            {currentStage === 'trial' && (
              <section className="stack">
                <div>
                  <h2>Trial Resources</h2>
                  <p className="muted">Candidates review these materials before advancing to interview and onboarding.</p>
                </div>
                <div className="resource-grid">
                  {TRIAL_LINKS.map(([title, url]) => (
                    <a key={url} href={url} className="resource" target="_blank" rel="noreferrer">
                      <strong>{title}</strong>
                      <span>Open Loom resource</span>
                    </a>
                  ))}
                </div>
                <Card className="notice">
                  Lisa can review the hiring dashboard alongside the candidate's past work before the interview.
                </Card>
              </section>
            )}

            {currentStage === 'training' && (
              <section className="stack">
                <div>
                  <h2>Before Joining Trial + Training How-To</h2>
                  <p className="muted">Candidates should review onboarding materials and arrive ready with questions.</p>
                </div>
                <div className="resource-grid">
                  {TRAINING_LINKS.map(([title, url]) => (
                    <a key={url} href={url} className="resource" target="_blank" rel="noreferrer">
                      <strong>{title}</strong>
                      <span>Open training material</span>
                    </a>
                  ))}
                </div>
                <div className="grid-one">
                  <Checkbox label='I watched the "Who We Are" material' checked={form.watchedWhoWeAre} onChange={(v) => setField('watchedWhoWeAre', v)} />
                  <Checkbox label="I learned the 4 properties" checked={form.learnedProperties} onChange={(v) => setField('learnedProperties', v)} />
                  <Checkbox label="I understand my work will be reviewed by the hiring team" checked={form.agreedTerms} onChange={(v) => setField('agreedTerms', v)} />
                  <Input label="Questions to ask Lisa" textarea rows="5" value={form.questionsForLisa} onChange={(e) => setField('questionsForLisa', e.target.value)} />
                </div>
              </section>
            )}

            {currentStage === 'review' && (
              <section className="stack">
                {submitState.success ? (
                  <div>
                    <h2>Submission Complete</h2>
                    <Card className="notice success">
                      Your candidate journey has been submitted successfully. Thank you for your time — the hiring team will review your application and get back to you.
                    </Card>
                    {startTime && (
                      <p className="muted" style={{ marginTop: '1rem' }}>
                        Total time: {formatElapsed(Math.floor((Date.now() - startTime) / 1000))}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <h2>Review & Submit</h2>
                      <p className="muted">This packages the full candidate journey and sends it to the hiring team.</p>
                    </div>

                    <div className="metrics-grid">
                      <Metric label="Device Score" value={`${deviceScore}/100`} hint="Auto-calculated from device readiness" />
                      <Metric label="Time Elapsed" value={formatElapsed(elapsed)} hint="Since you started the assessment" />
                      <Metric label="HR Email" value={APP_CONFIG.hrEmail} hint="Notification sent via Resend" />
                    </div>

                    <Card className="soft">
                      <ul className="summary-list">
                        <li><strong>Name:</strong> {[form.firstName, form.lastName].filter(Boolean).join(' ') || '-'}</li>
                        <li><strong>Email:</strong> {form.email || '-'}</li>
                        <li><strong>WhatsApp:</strong> {form.whatsapp || '-'}</li>
                        <li><strong>Location:</strong> {form.location || '-'}</li>
                        <li><strong>Current Trends Answer:</strong> {form.currentTrends || '-'}</li>
                        <li><strong>Questions for Lisa:</strong> {form.questionsForLisa || '-'}</li>
                      </ul>
                    </Card>

                    {submitState.error ? <Card className="notice error">{submitState.error}</Card> : null}

                    <button className="primary" onClick={handleSubmit} disabled={submitState.loading}>
                      {submitState.loading ? 'Submitting...' : 'Submit Candidate Journey'}
                    </button>
                  </>
                )}
              </section>
            )}

            {validationError && <Card className="notice error">{validationError}</Card>}
            {startError && <Card className="notice error">{startError}</Card>}

            {/* Footer nav — hide after successful submission */}
            {!submitState.success && (
              <div className="footer-actions">
                <button className="secondary" onClick={prevStage} disabled={stageIndex === 0}>Back</button>
                <button
                  className="primary"
                  onClick={currentStage === 'review' ? handleSubmit : handleContinue}
                  disabled={submitState.loading || starting}
                >
                  {starting ? 'Starting...' : currentStage === 'review' ? 'Submit' : 'Continue'}
                </button>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
