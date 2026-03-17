
import React, { useMemo, useState } from 'react';
import { APP_CONFIG } from './config';
import { hasSupabaseConfig, supabase } from './lib/supabaseClient';

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

const SAMPLE_CANDIDATES = [
  { id: 'MC-1001', name: 'Aira Mendoza', stage: 'Interview with Lisa', score: 86, status: 'Shortlisted', email: 'aira@example.com' },
  { id: 'MC-1002', name: 'John Salazar', stage: 'Content Test 2', score: 73, status: 'In Review', email: 'john@example.com' },
  { id: 'MC-1003', name: 'Kaye Santos', stage: 'Screening 1', score: 58, status: 'Flagged', email: 'kaye@example.com' },
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

function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function Input({ label, textarea = false, className = '', ...props }) {
  return (
    <label className={`field ${className}`}>
      {label ? <span className="field-label">{label}</span> : null}
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

function FileInput({ label, helper, onChange, selectedName }) {
  return (
    <div className="upload-box">
      <div className="upload-text">
        <strong>{label}</strong>
        <span>{helper}</span>
        {selectedName ? <em>Selected: {selectedName}</em> : null}
      </div>
      <input type="file" onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </div>
  );
}

async function uploadFile(file, folder) {
  if (!supabase || !file) return null;
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const path = `${folder}/${safeName}`;
  const { error } = await supabase.storage.from(APP_CONFIG.storageBucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(APP_CONFIG.storageBucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl, name: file.name, size: file.size, type: file.type };
}

export default function App() {
  const [view, setView] = useState('candidate');
  const [currentStage, setCurrentStage] = useState('profile');
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({});
  const [submitState, setSubmitState] = useState({ loading: false, success: false, error: '' });

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

  function nextStage() {
    if (stageIndex < STAGES.length - 1) setCurrentStage(STAGES[stageIndex + 1].key);
  }

  function prevStage() {
    if (stageIndex > 0) setCurrentStage(STAGES[stageIndex - 1].key);
  }

  async function handleSubmit() {
    setSubmitState({ loading: true, success: false, error: '' });

    try {
      if (!hasSupabaseConfig) {
        throw new Error('Supabase is not configured yet. Update src/config.js first.');
      }

      const uploadedFiles = {};
      for (const [key] of FILE_KEYS) {
        if (files[key]) {
          uploadedFiles[key] = await uploadFile(files[key], `${form.email || 'candidate'}/${key}`);
        }
      }

      const payload = {
        candidate: form,
        stage: currentStage,
        progress,
        deviceScore,
        files: uploadedFiles,
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch(`${APP_CONFIG.supabaseUrl}/functions/v1/${APP_CONFIG.edgeFunctionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: APP_CONFIG.supabaseAnonKey,
          Authorization: `Bearer ${APP_CONFIG.supabaseAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Submission failed.');
      }

      setSubmitState({ loading: false, success: true, error: '' });
      setCurrentStage('review');
      alert('Candidate journey submitted successfully.');
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
        <div className="hero-actions">
          <button className={`pill ${view === 'candidate' ? 'pill-active' : ''}`} onClick={() => setView('candidate')}>
            Candidate View
          </button>
          <button className={`pill ${view === 'admin' ? 'pill-active' : ''}`} onClick={() => setView('admin')}>
            Admin View
          </button>
        </div>
      </header>

      {!hasSupabaseConfig && (
        <Card className="notice warning">
          <strong>Setup required:</strong> Update <code>src/config.js</code> with your Supabase project URL and anon key before submitting live candidate data.
        </Card>
      )}

      {view === 'candidate' ? (
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
                    onClick={() => setCurrentStage(stage.key)}
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
                    <Input label="First name" value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
                    <Input label="Last name" value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
                    <Input label="Email address" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                    <Input label="WhatsApp number" value={form.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} />
                    <Input label="Location" value={form.location} onChange={(e) => setField('location', e.target.value)} />
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
                        <Input label="CPU" placeholder="Intel i5 / Ryzen 5 / Apple M1 or better" value={form.laptopCpu} onChange={(e) => setField('laptopCpu', e.target.value)} />
                        <Input label="RAM (GB)" type="number" value={form.laptopRam} onChange={(e) => setField('laptopRam', e.target.value)} />
                        <Input label="Storage (GB)" type="number" value={form.laptopStorage} onChange={(e) => setField('laptopStorage', e.target.value)} />
                        <Input label="Operating System" placeholder="Windows 10+ or macOS 12+" value={form.laptopOs} onChange={(e) => setField('laptopOs', e.target.value)} />
                        <FileInput
                          label="Upload laptop screenshot / device specs"
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
                        <Input label="Mobile phone model" placeholder="iPhone 12+ or modern Android equivalent" value={form.phoneModel} onChange={(e) => setField('phoneModel', e.target.value)} />
                        <Input label="Mobile phone storage (GB)" type="number" value={form.phoneStorage} onChange={(e) => setField('phoneStorage', e.target.value)} />
                        <Input label="Internet speed (Mbps)" type="number" value={form.internetMbps} onChange={(e) => setField('internetMbps', e.target.value)} />
                        <Checkbox label="Headphones with microphone available" checked={form.headphones} onChange={(v) => setField('headphones', v)} />
                        <Checkbox label="Mouse available" checked={form.mouse} onChange={(v) => setField('mouse', v)} />
                        <FileInput
                          label="Upload internet speed screenshot"
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
                    <Input label="How often do you use social media?" textarea rows="3" value={form.socialUsage} onChange={(e) => setField('socialUsage', e.target.value)} />
                    <Input label="What are current trends on TikTok and Instagram?" textarea rows="4" value={form.currentTrends} onChange={(e) => setField('currentTrends', e.target.value)} />
                    <Input label="Who is your favorite influencer?" value={form.favoriteInfluencer} onChange={(e) => setField('favoriteInfluencer', e.target.value)} />
                    <Input label="Why is this your favorite influencer?" textarea rows="3" value={form.influencerReason} onChange={(e) => setField('influencerReason', e.target.value)} />
                    <Input label="Watch 5 videos and rank them by virality" textarea rows="4" value={form.rankingNotes} onChange={(e) => setField('rankingNotes', e.target.value)} />
                    <Input label="Which one will perform best?" value={form.bestPerformingVideo} onChange={(e) => setField('bestPerformingVideo', e.target.value)} />
                    <Input label="Why will it perform best?" textarea rows="3" value={form.bestVideoWhy} onChange={(e) => setField('bestVideoWhy', e.target.value)} />
                    <Input label="What would you change?" textarea rows="3" value={form.whatWouldYouChange} onChange={(e) => setField('whatWouldYouChange', e.target.value)} />
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
                        helper="MP4, MOV, or any export file"
                        selectedName={files.testVideo1File?.name}
                        onChange={(file) => setFiles((prev) => ({ ...prev, testVideo1File: file }))}
                      />
                      <Input label="What did you focus on in your first video?" textarea rows="5" value={form.focusNotes} onChange={(e) => setField('focusNotes', e.target.value)} />
                    </Card>

                    <Card className="subcard">
                      <h3>Video Creation Test 2</h3>
                      <p className="muted">Watch the Loom videos, remake the video, then explain the changes.</p>
                      <FileInput
                        label="Upload Video Test 2"
                        helper="Improved version after learning resources"
                        selectedName={files.testVideo2File?.name}
                        onChange={(file) => setFiles((prev) => ({ ...prev, testVideo2File: file }))}
                      />
                      <Input label="What changed from your initial video?" textarea rows="5" value={form.remakeChanges} onChange={(e) => setField('remakeChanges', e.target.value)} />
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
                    Lisa can review the hiring dashboard alongside the candidate’s past work before the interview.
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
                  <div>
                    <h2>Review & Submit</h2>
                    <p className="muted">This packages the full candidate journey and sends it to your backend and HR email workflow.</p>
                  </div>

                  <div className="metrics-grid">
                    <Metric label="Device Score" value={`${deviceScore}/100`} hint="Auto-calculated from device readiness" />
                    <Metric label="Current Stage" value={STAGES[stageIndex]?.title || 'Review'} hint="Candidate progress status" />
                    <Metric label="HR Email" value={APP_CONFIG.hrEmail} hint="Sent by Supabase Edge Function + Resend" />
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
                  {submitState.success ? <Card className="notice success">Submission sent successfully.</Card> : null}

                  <button className="primary" onClick={handleSubmit} disabled={submitState.loading}>
                    {submitState.loading ? 'Submitting...' : 'Submit Candidate Journey'}
                  </button>
                </section>
              )}

              <div className="footer-actions">
                <button className="secondary" onClick={prevStage} disabled={stageIndex === 0}>Back</button>
                <button className="primary" onClick={currentStage === 'review' ? handleSubmit : nextStage} disabled={submitState.loading}>
                  {currentStage === 'review' ? 'Submit' : 'Continue'}
                </button>
              </div>
            </Card>
          </main>
        </div>
      ) : (
        <div className="stack">
          <div className="metrics-grid">
            <Metric label="Total Candidates" value="34" hint="Across all active stages" />
            <Metric label="Awaiting Review" value="9" hint="Need HR assessment" />
            <Metric label="Shortlisted" value="6" hint="Ready for Lisa interview" />
            <Metric label="Average Device Score" value="78" hint="Across sample records" />
          </div>

          <Card>
            <h2>Candidate Pipeline</h2>
            <p className="muted">Use this screen as the foundation for your admin dashboard.</p>
            <div className="candidate-list">
              {SAMPLE_CANDIDATES.map((candidate) => (
                <Card key={candidate.id} className="candidate-item">
                  <div className="candidate-head">
                    <div>
                      <strong>{candidate.name}</strong>
                      <div className="muted small">{candidate.email}</div>
                    </div>
                    <span className={`badge ${candidate.status.toLowerCase().replace(/\s+/g, '-')}`}>{candidate.status}</span>
                  </div>
                  <div className="small"><strong>Stage:</strong> {candidate.stage}</div>
                  <div className="small"><strong>Score:</strong> {candidate.score}</div>
                </Card>
              ))}
            </div>
          </Card>

          <Card>
            <h2>Email / Backend Flow</h2>
            <ol className="summary-list">
              <li>Candidate submits the form from GitHub Pages.</li>
              <li>Frontend uploads any files to Supabase Storage.</li>
              <li>Frontend sends a structured payload to the Supabase Edge Function.</li>
              <li>The Edge Function stores the submission in the database and sends an email through Resend.</li>
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
}
