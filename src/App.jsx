
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { APP_CONFIG } from './config';

const STAGES = [
  { key: 'profile', title: 'Profile' },
  { key: 'screening1', title: 'Screening 1' },
  { key: 'social', title: 'Social Fit' },
  { key: 'screening2', title: 'Screening 2' },
  { key: 'trial', title: 'Trial' },
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

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria',
  'Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan',
  'Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia',
  'Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo (DRC)','Congo (Republic)',
  'Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador',
  'Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland','France',
  'Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau',
  'Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland',
  'Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan',
  'Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar',
  'Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia',
  'Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan',
  'Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar',
  'Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia',
  'Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa',
  'South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan',
  'Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan',
  'Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu','Vatican City',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

const COUNTRY_CODES = [
  { code: '+93', label: '+93 (AF)' },{ code: '+355', label: '+355 (AL)' },{ code: '+213', label: '+213 (DZ)' },
  { code: '+1684', label: '+1684 (AS)' },{ code: '+376', label: '+376 (AD)' },{ code: '+244', label: '+244 (AO)' },
  { code: '+1264', label: '+1264 (AI)' },{ code: '+1268', label: '+1268 (AG)' },{ code: '+54', label: '+54 (AR)' },
  { code: '+374', label: '+374 (AM)' },{ code: '+297', label: '+297 (AW)' },{ code: '+61', label: '+61 (AU)' },
  { code: '+43', label: '+43 (AT)' },{ code: '+994', label: '+994 (AZ)' },{ code: '+1242', label: '+1242 (BS)' },
  { code: '+973', label: '+973 (BH)' },{ code: '+880', label: '+880 (BD)' },{ code: '+1246', label: '+1246 (BB)' },
  { code: '+375', label: '+375 (BY)' },{ code: '+32', label: '+32 (BE)' },{ code: '+501', label: '+501 (BZ)' },
  { code: '+229', label: '+229 (BJ)' },{ code: '+1441', label: '+1441 (BM)' },{ code: '+975', label: '+975 (BT)' },
  { code: '+591', label: '+591 (BO)' },{ code: '+387', label: '+387 (BA)' },{ code: '+267', label: '+267 (BW)' },
  { code: '+55', label: '+55 (BR)' },{ code: '+673', label: '+673 (BN)' },{ code: '+359', label: '+359 (BG)' },
  { code: '+226', label: '+226 (BF)' },{ code: '+257', label: '+257 (BI)' },{ code: '+238', label: '+238 (CV)' },
  { code: '+855', label: '+855 (KH)' },{ code: '+237', label: '+237 (CM)' },{ code: '+1', label: '+1 (CA/US)' },
  { code: '+1345', label: '+1345 (KY)' },{ code: '+236', label: '+236 (CF)' },{ code: '+235', label: '+235 (TD)' },
  { code: '+56', label: '+56 (CL)' },{ code: '+86', label: '+86 (CN)' },{ code: '+57', label: '+57 (CO)' },
  { code: '+269', label: '+269 (KM)' },{ code: '+242', label: '+242 (CG)' },{ code: '+243', label: '+243 (CD)' },
  { code: '+682', label: '+682 (CK)' },{ code: '+506', label: '+506 (CR)' },{ code: '+385', label: '+385 (HR)' },
  { code: '+53', label: '+53 (CU)' },{ code: '+599', label: '+599 (CW)' },{ code: '+357', label: '+357 (CY)' },
  { code: '+420', label: '+420 (CZ)' },{ code: '+45', label: '+45 (DK)' },{ code: '+253', label: '+253 (DJ)' },
  { code: '+1767', label: '+1767 (DM)' },{ code: '+1809', label: '+1809 (DO)' },{ code: '+593', label: '+593 (EC)' },
  { code: '+20', label: '+20 (EG)' },{ code: '+503', label: '+503 (SV)' },{ code: '+240', label: '+240 (GQ)' },
  { code: '+291', label: '+291 (ER)' },{ code: '+372', label: '+372 (EE)' },{ code: '+268', label: '+268 (SZ)' },
  { code: '+251', label: '+251 (ET)' },{ code: '+500', label: '+500 (FK)' },{ code: '+298', label: '+298 (FO)' },
  { code: '+679', label: '+679 (FJ)' },{ code: '+358', label: '+358 (FI)' },{ code: '+33', label: '+33 (FR)' },
  { code: '+594', label: '+594 (GF)' },{ code: '+689', label: '+689 (PF)' },{ code: '+241', label: '+241 (GA)' },
  { code: '+220', label: '+220 (GM)' },{ code: '+995', label: '+995 (GE)' },{ code: '+49', label: '+49 (DE)' },
  { code: '+233', label: '+233 (GH)' },{ code: '+350', label: '+350 (GI)' },{ code: '+30', label: '+30 (GR)' },
  { code: '+299', label: '+299 (GL)' },{ code: '+1473', label: '+1473 (GD)' },{ code: '+590', label: '+590 (GP)' },
  { code: '+1671', label: '+1671 (GU)' },{ code: '+502', label: '+502 (GT)' },{ code: '+224', label: '+224 (GN)' },
  { code: '+245', label: '+245 (GW)' },{ code: '+592', label: '+592 (GY)' },{ code: '+509', label: '+509 (HT)' },
  { code: '+504', label: '+504 (HN)' },{ code: '+852', label: '+852 (HK)' },{ code: '+36', label: '+36 (HU)' },
  { code: '+354', label: '+354 (IS)' },{ code: '+91', label: '+91 (IN)' },{ code: '+62', label: '+62 (ID)' },
  { code: '+98', label: '+98 (IR)' },{ code: '+964', label: '+964 (IQ)' },{ code: '+353', label: '+353 (IE)' },
  { code: '+972', label: '+972 (IL)' },{ code: '+39', label: '+39 (IT)' },{ code: '+1876', label: '+1876 (JM)' },
  { code: '+81', label: '+81 (JP)' },{ code: '+962', label: '+962 (JO)' },{ code: '+7', label: '+7 (KZ/RU)' },
  { code: '+254', label: '+254 (KE)' },{ code: '+686', label: '+686 (KI)' },{ code: '+850', label: '+850 (KP)' },
  { code: '+82', label: '+82 (KR)' },{ code: '+383', label: '+383 (XK)' },{ code: '+965', label: '+965 (KW)' },
  { code: '+996', label: '+996 (KG)' },{ code: '+856', label: '+856 (LA)' },{ code: '+371', label: '+371 (LV)' },
  { code: '+961', label: '+961 (LB)' },{ code: '+266', label: '+266 (LS)' },{ code: '+231', label: '+231 (LR)' },
  { code: '+218', label: '+218 (LY)' },{ code: '+423', label: '+423 (LI)' },{ code: '+370', label: '+370 (LT)' },
  { code: '+352', label: '+352 (LU)' },{ code: '+853', label: '+853 (MO)' },{ code: '+261', label: '+261 (MG)' },
  { code: '+265', label: '+265 (MW)' },{ code: '+60', label: '+60 (MY)' },{ code: '+960', label: '+960 (MV)' },
  { code: '+223', label: '+223 (ML)' },{ code: '+356', label: '+356 (MT)' },{ code: '+692', label: '+692 (MH)' },
  { code: '+596', label: '+596 (MQ)' },{ code: '+222', label: '+222 (MR)' },{ code: '+230', label: '+230 (MU)' },
  { code: '+262', label: '+262 (YT/RE)' },{ code: '+52', label: '+52 (MX)' },{ code: '+691', label: '+691 (FM)' },
  { code: '+373', label: '+373 (MD)' },{ code: '+377', label: '+377 (MC)' },{ code: '+976', label: '+976 (MN)' },
  { code: '+382', label: '+382 (ME)' },{ code: '+1664', label: '+1664 (MS)' },{ code: '+212', label: '+212 (MA)' },
  { code: '+258', label: '+258 (MZ)' },{ code: '+95', label: '+95 (MM)' },{ code: '+264', label: '+264 (NA)' },
  { code: '+674', label: '+674 (NR)' },{ code: '+977', label: '+977 (NP)' },{ code: '+31', label: '+31 (NL)' },
  { code: '+687', label: '+687 (NC)' },{ code: '+64', label: '+64 (NZ)' },{ code: '+505', label: '+505 (NI)' },
  { code: '+227', label: '+227 (NE)' },{ code: '+234', label: '+234 (NG)' },{ code: '+683', label: '+683 (NU)' },
  { code: '+389', label: '+389 (MK)' },{ code: '+1670', label: '+1670 (MP)' },{ code: '+47', label: '+47 (NO)' },
  { code: '+968', label: '+968 (OM)' },{ code: '+92', label: '+92 (PK)' },{ code: '+680', label: '+680 (PW)' },
  { code: '+970', label: '+970 (PS)' },{ code: '+507', label: '+507 (PA)' },{ code: '+675', label: '+675 (PG)' },
  { code: '+595', label: '+595 (PY)' },{ code: '+51', label: '+51 (PE)' },{ code: '+63', label: '+63 (PH)' },
  { code: '+48', label: '+48 (PL)' },{ code: '+351', label: '+351 (PT)' },{ code: '+1787', label: '+1787 (PR)' },
  { code: '+974', label: '+974 (QA)' },{ code: '+40', label: '+40 (RO)' },{ code: '+250', label: '+250 (RW)' },
  { code: '+290', label: '+290 (SH)' },{ code: '+1869', label: '+1869 (KN)' },{ code: '+1758', label: '+1758 (LC)' },
  { code: '+508', label: '+508 (PM)' },{ code: '+1784', label: '+1784 (VC)' },{ code: '+685', label: '+685 (WS)' },
  { code: '+378', label: '+378 (SM)' },{ code: '+239', label: '+239 (ST)' },{ code: '+966', label: '+966 (SA)' },
  { code: '+221', label: '+221 (SN)' },{ code: '+381', label: '+381 (RS)' },{ code: '+248', label: '+248 (SC)' },
  { code: '+232', label: '+232 (SL)' },{ code: '+65', label: '+65 (SG)' },{ code: '+1721', label: '+1721 (SX)' },
  { code: '+421', label: '+421 (SK)' },{ code: '+386', label: '+386 (SI)' },{ code: '+677', label: '+677 (SB)' },
  { code: '+252', label: '+252 (SO)' },{ code: '+27', label: '+27 (ZA)' },{ code: '+211', label: '+211 (SS)' },
  { code: '+34', label: '+34 (ES)' },{ code: '+94', label: '+94 (LK)' },{ code: '+249', label: '+249 (SD)' },
  { code: '+597', label: '+597 (SR)' },{ code: '+46', label: '+46 (SE)' },{ code: '+41', label: '+41 (CH)' },
  { code: '+963', label: '+963 (SY)' },{ code: '+886', label: '+886 (TW)' },{ code: '+992', label: '+992 (TJ)' },
  { code: '+255', label: '+255 (TZ)' },{ code: '+66', label: '+66 (TH)' },{ code: '+670', label: '+670 (TL)' },
  { code: '+228', label: '+228 (TG)' },{ code: '+690', label: '+690 (TK)' },{ code: '+676', label: '+676 (TO)' },
  { code: '+1868', label: '+1868 (TT)' },{ code: '+216', label: '+216 (TN)' },{ code: '+90', label: '+90 (TR)' },
  { code: '+993', label: '+993 (TM)' },{ code: '+1649', label: '+1649 (TC)' },{ code: '+688', label: '+688 (TV)' },
  { code: '+256', label: '+256 (UG)' },{ code: '+380', label: '+380 (UA)' },{ code: '+971', label: '+971 (AE)' },
  { code: '+44', label: '+44 (GB)' },{ code: '+1', label: '+1 (US)' },{ code: '+598', label: '+598 (UY)' },
  { code: '+998', label: '+998 (UZ)' },{ code: '+678', label: '+678 (VU)' },{ code: '+39', label: '+39 (VA)' },
  { code: '+58', label: '+58 (VE)' },{ code: '+84', label: '+84 (VN)' },{ code: '+1340', label: '+1340 (VI)' },
  { code: '+681', label: '+681 (WF)' },{ code: '+967', label: '+967 (YE)' },{ code: '+260', label: '+260 (ZM)' },
  { code: '+263', label: '+263 (ZW)' },
];

const REQUIRED_PROFILE_FIELDS = ['firstName', 'lastName', 'email', 'whatsapp', 'location'];

const REQUIRED_SCREENING1_FIELDS = [
  'laptopCpu', 'laptopRam', 'laptopStorage', 'laptopOs',
  'internetMbps', 'phoneModel',
];
const REQUIRED_SCREENING1_FILES = [];

const REQUIRED_SCREENING2_FIELDS = ['focusNotes'];
const REQUIRED_SCREENING2_FILES = ['testVideo1File'];


const SOCIAL_QUESTIONS = [
  { key: 'socialUsage',         label: 'How often do you use social media?',                type: 'text' },
  { key: 'currentTrends',       label: 'What are current trends on TikTok and Instagram?',  type: 'text' },
  { key: 'favoriteInfluencer',  label: 'Who is your favorite influencer?',                  type: 'text' },
  { key: 'influencerReason',    label: 'Why is this your favorite influencer?',             type: 'text' },
];

const SCREENING2_VOICE_QUESTIONS = [
  { key: 'rankingNotes',        label: 'Watch 5 videos and rank them by virality' },
  { key: 'bestPerformingVideo', label: 'Which one will perform best?' },
  { key: 'bestVideoWhy',        label: 'Why will it perform best?' },
  { key: 'whatWouldYouChange',  label: 'What would you change?' },
];

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  whatsappCountryCode: '+63',
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

function StageLink({ active, done, locked, title, step, onClick }) {
  return (
    <button
      type="button"
      className={`stage-link ${active ? 'active' : ''} ${done ? 'done' : ''} ${locked ? 'locked' : ''}`}
      onClick={locked ? undefined : onClick}
      disabled={locked}
    >
      <div className="stage-dot">{done ? '✓' : locked ? '🔒' : step}</div>
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

function VoiceRecorder({ onSubmit, savedUrl }) {
  const [status, setStatus] = useState(savedUrl ? 'submitted' : 'idle');
  const [audioUrl, setAudioUrl] = useState(savedUrl || null);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatus('stopped');
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setStatus('recording');
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      alert('Microphone access denied. Please allow microphone access and try again.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
  }

  function reRecord() {
    setAudioUrl(null);
    setStatus('idle');
    setSeconds(0);
    chunksRef.current = [];
  }

  function handleSubmit() {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    onSubmit(blob, audioUrl);
    setStatus('submitted');
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="voice-recorder">
      {(status === 'idle' || status === 'recording') && (
        <div className="recorder-centered">
          <button
            type="button"
            className={`record-btn ${status === 'recording' ? 'recording' : ''}`}
            onClick={status === 'recording' ? stopRecording : startRecording}
          >
            {status === 'recording' ? <span className="stop-icon" /> : '🎙'}
          </button>
          <div className="rec-timer">{fmt(seconds)}</div>
          <div className="rec-label">
            {status === 'recording' ? 'Recording… tap to stop' : 'Tap to record your answer'}
          </div>
        </div>
      )}

      {(status === 'stopped' || status === 'submitted') && (
        <div className="recorder-centered">
          <button type="button" className="record-btn small-record" onClick={reRecord}>🎙</button>
          <div className="rec-label">Re-record</div>
          <audio controls src={audioUrl} style={{ width: '100%', marginTop: '8px' }} />
          {status === 'stopped' && (
            <button type="button" className="primary submit-answer-btn" onClick={handleSubmit}>
              Submit Answer ✓
            </button>
          )}
          {status === 'submitted' && (
            <span className="rec-saved">✓ Answer saved</span>
          )}
        </div>
      )}
    </div>
  );
}

function VoiceQuiz({ questions, voiceAnswers, onSave }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  function goTo(next) {
    setVisible(false);
    setTimeout(() => { setIdx(next); setVisible(true); }, 280);
  }

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  return (
    <div className="voice-quiz">
      <div className="vq-progress">
        {questions.map((question, i) => (
          <div
            key={question.key}
            className={`vq-dot ${i === idx ? 'active' : ''} ${voiceAnswers[question.key] ? 'done' : ''}`}
          />
        ))}
      </div>

      <div className={`vq-question ${visible ? 'vq-visible' : 'vq-hidden'}`}>
        <div className="vq-step">Question {idx + 1} of {questions.length}</div>
        <h3 className="vq-label">{q.label}</h3>
        {q.type === 'text' ? (
          <textarea
            className="vq-textarea"
            rows={4}
            placeholder="Type your answer here…"
            value={voiceAnswers[q.key]?.text || ''}
            onChange={(e) => onSave(q.key, null, null, e.target.value)}
          />
        ) : (
          <VoiceRecorder
            key={q.key}
            savedUrl={voiceAnswers[q.key]?.url || null}
            onSubmit={(blob, url) => onSave(q.key, blob, url)}
          />
        )}
      </div>

      <div className="vq-footer">
        <button
          type="button"
          className="secondary"
          onClick={() => goTo(idx - 1)}
          style={{ visibility: idx === 0 ? 'hidden' : 'visible' }}
        >
          ← Back
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => !isLast && goTo(idx + 1)}
          disabled={isLast}
        >
          {isLast ? 'All done ✓' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

function SpecChecker({ onResult }) {
  const [status, setStatus] = useState('idle');
  const [specs, setSpecs] = useState(null);

  function runCheck() {
    setStatus('checking');
    const cores = navigator.hardwareConcurrency || null;
    const ram = navigator.deviceMemory || null;
    const ua = navigator.userAgent;

    let os = 'Unknown';
    if (/Windows NT 10|Windows NT 11/.test(ua)) os = 'Windows 10/11';
    else if (/Windows NT 6\.3/.test(ua)) os = 'Windows 8.1';
    else if (/Mac OS X 15/.test(ua)) os = 'macOS 15 Sequoia';
    else if (/Mac OS X 14/.test(ua)) os = 'macOS 14 Sonoma';
    else if (/Mac OS X 13/.test(ua)) os = 'macOS 13 Ventura';
    else if (/Mac OS X 12/.test(ua)) os = 'macOS 12 Monterey';
    else if (/Linux/.test(ua)) os = 'Linux';

    const result = { cores, ram, os, screen: `${screen.width}x${screen.height}` };
    setSpecs(result);
    setStatus('done');
    onResult(result);
  }

  useEffect(() => { runCheck(); }, []);

  return (
    <div className="auto-check-box">
      <div className="auto-check-header">
        <strong>Auto Spec Check</strong>
      </div>
      {specs && (
        <div className="spec-results">
          <div className="spec-row"><span>CPU Cores</span><strong>{specs.cores ? `${specs.cores} logical cores` : 'Not detected'}</strong></div>
          <div className="spec-row"><span>RAM</span><strong>{specs.ram ? `~${specs.ram} GB` : 'Not detected'}</strong></div>
          <div className="spec-row"><span>OS</span><strong>{specs.os}</strong></div>
          <div className="spec-row"><span>Screen</span><strong>{specs.screen}</strong></div>
        </div>
      )}
    </div>
  );
}

function SpeedTest({ onResult }) {
  const [status, setStatus] = useState('idle');
  const [mbps, setMbps] = useState(null);

  async function runTest() {
    setStatus('testing');
    try {
      const bytes = 10_000_000; // 10 MB
      const start = performance.now();
      const res = await fetch(`https://speed.cloudflare.com/__down?bytes=${bytes}`, { cache: 'no-store' });
      const buffer = await res.arrayBuffer();
      const elapsed = (performance.now() - start) / 1000;
      const result = ((buffer.byteLength * 8) / elapsed / 1_000_000).toFixed(1);
      setMbps(result);
      onResult(result);
      setStatus('done');
    } catch {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn?.downlink) {
        const result = conn.downlink.toFixed(1);
        setMbps(result);
        onResult(result);
        setStatus('done');
      } else {
        setStatus('error');
      }
    }
  }

  useEffect(() => { runTest(); }, []);

  return (
    <div className="auto-check-box">
      <div className="auto-check-header">
        <strong>Network Speed Test</strong>
      </div>
      {status === 'testing' && (
        <div className="speed-testing">
          <div className="speed-bar-track"><div className="speed-bar-fill" /></div>
          <span>Downloading test data…</span>
        </div>
      )}
      {status === 'done' && (
        <div className="spec-results">
          <div className="spec-row"><span>Download Speed</span><strong className="speed-value">{mbps} Mbps</strong></div>
        </div>
      )}
      {status === 'error' && <p className="auto-check-hint" style={{color:'var(--danger)'}}>Could not measure speed. Please enter manually above.</p>}
    </div>
  );
}

/* ── Main App ── */

export default function App() {
  const [currentStage, setCurrentStage] = useState('profile');
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({});
  const [voiceAnswers, setVoiceAnswers] = useState({});
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
        return 'Please fill in all required fields (marked with *).';
    }

    if (currentStage === 'screening2') {
      const missing = REQUIRED_SCREENING2_FIELDS.filter((f) => !form[f]?.trim());
      const missingFiles = REQUIRED_SCREENING2_FILES.filter((f) => !files[f]);
      if (missing.length || missingFiles.length)
        return 'Please fill in all required fields and upload both video tests.';
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

    // On profile stage, register session with server (non-blocking)
    if (currentStage === 'profile' && !started) {
      setStarted(true);
      setStartTime(Date.now());
      fetch(`${APP_CONFIG.apiUrl}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          whatsapp: `${form.whatsappCountryCode} ${form.whatsapp}`,
          portfolioUrl: form.portfolioUrl,
          tiktokUrl: form.tiktokUrl,
          instagramUrl: form.instagramUrl,
          firstName: form.firstName,
          lastName: form.lastName,
        }),
      }).catch(() => {
        // Server unavailable — session tracking skipped, form continues normally
      });
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

      for (const [key, answer] of Object.entries(voiceAnswers)) {
        if (answer?.blob) {
          const file = new File([answer.blob], `${key}.webm`, { type: 'audio/webm' });
          formData.append(`voice_${key}`, file);
        }
      }

      formData.append('payload', JSON.stringify({
        candidate: { ...form, whatsapp: `${form.whatsappCountryCode} ${form.whatsapp}` },
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
                  locked={false}
                  onClick={() => setCurrentStage(stage.key)}
                />
              ))}
            </div>

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
                  <label className="field">
                    <span className="field-label">WhatsApp number *</span>
                    <div className="phone-input">
                      <select value={form.whatsappCountryCode} onChange={(e) => setField('whatsappCountryCode', e.target.value)}>
                        {COUNTRY_CODES.map(({ code, label }) => (
                          <option key={code} value={code}>{label}</option>
                        ))}
                      </select>
                      <input type="tel" placeholder="9XX XXX XXXX" value={form.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} />
                    </div>
                  </label>
                  <label className="field">
                    <span className="field-label">Working from *</span>
                    <select value={form.location} onChange={(e) => setField('location', e.target.value)}>
                      <option value="">Select country…</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
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
                      <SpecChecker
                        onResult={(s) => {
                          if (s.ram) setField('laptopRam', String(s.ram));
                          if (s.os !== 'Unknown') setField('laptopOs', s.os);
                        }}
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
                      <SpeedTest onResult={(mbps) => setField('internetMbps', mbps)} />
                      <Checkbox label="Headphones with microphone available" checked={form.headphones} onChange={(v) => setField('headphones', v)} />
                      <Checkbox label="Mouse available" checked={form.mouse} onChange={(v) => setField('mouse', v)} />
                      <FileInput
                        label="Upload device photo"
                        helper="Optional phone or second-device image"
                        selectedName={files.devicePhotoFile?.name}
                        onChange={(file) => setFiles((prev) => ({ ...prev, devicePhotoFile: file }))}
                      />
                    </div>
                  </Card>
                </div>

              </section>
            )}

            {currentStage === 'social' && (
              <section className="stack">
                <div>
                  <h2>Social Fit Questions</h2>
                  <p className="muted">Record your answers to each question below. Tap the mic to start, then submit your answer before moving on.</p>
                </div>
                <VoiceQuiz
                  questions={SOCIAL_QUESTIONS}
                  voiceAnswers={voiceAnswers}
                  onSave={(key, blob, url, text) => setVoiceAnswers((prev) => ({ ...prev, [key]: text !== undefined ? { text } : { blob, url } }))}
                />
              </section>
            )}

            {currentStage === 'screening2' && (
              <section className="stack">
                <div>
                  <h2>Screening 2 — Content Creation Test</h2>
                  <p className="muted">The candidate submits an initial edit, then a revised version after watching guidance materials.</p>
                </div>

                <div>
                  <h3>Video Review Questions</h3>
                  <p className="muted">Record your answers to each question about the videos below.</p>
                </div>
                <VoiceQuiz
                  questions={SCREENING2_VOICE_QUESTIONS}
                  voiceAnswers={voiceAnswers}
                  onSave={(key, blob, url, text) => setVoiceAnswers((prev) => ({ ...prev, [key]: text !== undefined ? { text } : { blob, url } }))}
                />

                <div className="grid-one">
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
                <Card className="subcard">
                  <h3>Video Creation Test 2</h3>
                  <p className="muted">Watch the Loom videos above, remake the video, then explain the changes.</p>
                  <FileInput
                    label="Upload Video Test 2"
                    required
                    helper="Improved version after learning resources"
                    selectedName={files.testVideo2File?.name}
                    onChange={(file) => setFiles((prev) => ({ ...prev, testVideo2File: file }))}
                  />
                  <Input label="What changed from your initial video?" required textarea rows="5" value={form.remakeChanges} onChange={(e) => setField('remakeChanges', e.target.value)} />
                </Card>
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
                      <Metric label="Time Elapsed" value={formatElapsed(elapsed)} hint="Since you started the assessment" />
                      <Metric label="HR Email" value={APP_CONFIG.hrEmail} hint="Notification sent via Resend" />
                    </div>

                    <Card className="soft">
                      <ul className="summary-list">
                        <li><strong>Name:</strong> {[form.firstName, form.lastName].filter(Boolean).join(' ') || '-'}</li>
                        <li><strong>Email:</strong> {form.email || '-'}</li>
                        <li><strong>WhatsApp:</strong> {form.whatsapp ? `${form.whatsappCountryCode} ${form.whatsapp}` : '-'}</li>
                        <li><strong>Working from:</strong> {form.location || '-'}</li>
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
