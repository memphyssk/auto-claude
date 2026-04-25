// Shared CRT primitives used across all wireframe artboards.

const Cursor = ({ thin }) => (
  <span className={thin ? 'crt-cursor-thin' : 'crt-cursor'} />
);

const LED = ({ kind, label }) => (
  <span className="crt-row crt-tiny crt-uc crt-dim">
    <span className={`crt-led ${kind === 'ok' ? 'crt-led-ok' : kind === 'warn' ? 'crt-led-warn' : ''}`} />
    {label}
  </span>
);

// Chrome header bar that sits above CRT panels
const MuthurHeader = ({ designation = 'OPERATING SYSTEM', node = 'CLAUDOMAT.DEV', screen = '01' }) => {
  const [time, setTime] = React.useState('');
  React.useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = String(d.getUTCHours()).padStart(2, '0');
      const m = String(d.getUTCMinutes()).padStart(2, '0');
      const s = String(d.getUTCSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="crt-spread crt-tiny crt-uc crt-dim" style={{ padding: '8px 14px', borderBottom: '1px solid var(--crt-line)' }}>
      <div className="crt-row" style={{ gap: 14 }}>
        <span className="crt-amber crt-glow">◆ {designation}</span>
        <span>NODE: {node}</span>
        <span>SCR-{screen}</span>
      </div>
      <div className="crt-row" style={{ gap: 14 }}>
        <LED kind="ok" label="LINK" />
        <LED kind="ok" label="PWR" />
        <LED kind="warn" label="REC" />
        <span>{time}</span>
      </div>
    </div>
  );
};

// scrolling marquee (flight-recorder vibe)
const Marquee = ({ items }) => {
  const text = items.join('   ◆   ');
  return (
    <div className="crt-marquee crt-tiny crt-uc crt-dim">
      <div className="crt-marquee-track">
        {text}   ◆   {text}   ◆   {text}   ◆   {text}
      </div>
    </div>
  );
};

// Animated bar chart (system load / progress)
const LoadBar = ({ label, pct = 60, color }) => (
  <div className="crt-stack" style={{ gap: 3 }}>
    <div className="crt-spread crt-tiny crt-uc crt-dim">
      <span>{label}</span>
      <span className="crt-amber">{pct.toString().padStart(3, '0')}%</span>
    </div>
    <div className="crt-bar">
      <div className="crt-bar-fill" style={{ right: `${100 - pct}%`, background: color }} />
    </div>
  </div>
);

// ASCII placeholder block — for "imagery would go here"
const AsciiPlaceholder = ({ w = 200, h = 100, label = 'PLACEHOLDER' }) => (
  <div
    style={{
      width: w,
      height: h,
      border: '1px solid var(--crt-line)',
      backgroundImage:
        'repeating-linear-gradient(135deg, transparent 0 8px, var(--crt-amber-ghost) 8px 9px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--crt-text-dim)',
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      position: 'relative',
    }}
  >
    <span style={{ background: 'var(--crt-bg)', padding: '0 6px' }}>{label}</span>
  </div>
);

// Typewriter that reveals text once
const Typewriter = ({ text, speed = 28, className = '', startDelay = 0 }) => {
  const [shown, setShown] = React.useState('');
  React.useEffect(() => {
    let i = 0;
    let raf;
    const start = setTimeout(() => {
      const tick = () => {
        i += 1;
        setShown(text.slice(0, i));
        if (i < text.length) raf = setTimeout(tick, speed);
      };
      tick();
    }, startDelay);
    return () => { clearTimeout(start); clearTimeout(raf); };
  }, [text, speed, startDelay]);
  return <span className={className}>{shown}</span>;
};

// Random hex stream — for the "system telemetry" feel
const HexStream = ({ rows = 4, cols = 8 }) => {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 900);
    return () => clearInterval(id);
  }, []);
  const hex = (n) => n.toString(16).toUpperCase().padStart(2, '0');
  const lines = [];
  for (let r = 0; r < rows; r++) {
    const parts = [];
    for (let c = 0; c < cols; c++) {
      const v = Math.floor(Math.abs(Math.sin((r + 1) * (c + 1) * (tick + 1)) * 255));
      parts.push(hex(v));
    }
    lines.push(`0x${hex(r * 16 + tick * 4)}  ${parts.join(' ')}`);
  }
  return (
    <pre className="crt-ascii crt-tiny crt-faint" style={{ margin: 0 }}>
      {lines.join('\n')}
    </pre>
  );
};

// ──────────────────────────────────────────────────────────────────────
// CONTENT — single source of truth for copy across wireframes
// ──────────────────────────────────────────────────────────────────────

const PAINS = [
  {
    code: 'P-001',
    title: 'YOU CAN VIBE THE UI. NOBODY VIBES THE COMPANY.',
    body: 'Lovable, v0, Bolt — they ship pixels. The rest (pricing, onboarding, ops, retention, GTM) is left as an exercise to the founder.',
  },
  {
    code: 'P-002',
    title: 'YOU DO NOT KNOW WHAT YOU DO NOT KNOW.',
    body: 'Stripe webhooks. RBAC. Dunning. SOC-2-lite. NPS instrumentation. The known-unknowns alone fill a whiteboard. The unknown-unknowns kill the company.',
  },
  {
    code: 'P-003',
    title: 'CONTEXT-SWITCHING IS THE TAX.',
    body: 'You are CEO, PM, designer, eng, support, finance, lawyer. Each role has its own tooling, vocabulary, and failure modes. You context-switch yourself to death.',
  },
  {
    code: 'P-004',
    title: 'IDEAS ARE CHEAP. EXECUTION IS A SUPPLY CHAIN.',
    body: 'A landing page is a deliverable. A company is a graph of deliverables, dependencies, decisions, and feedback loops. You need an operator, not a generator.',
  },
];

const CAPABILITIES = [
  { code: 'C-01', area: 'PRODUCT', items: ['PRD drafting', 'Spec → ticket decomposition', 'Roadmap & cutlines', 'Release notes'] },
  { code: 'C-02', area: 'ENGINEERING', items: ['Architecture sketches', 'Codegen handoff', 'CI/CD scaffolds', 'Runbook synthesis'] },
  { code: 'C-03', area: 'BUSINESS', items: ['Pricing models', 'Unit economics', 'Forecasts & burn', 'Investor memos'] },
  { code: 'C-04', area: 'OPERATIONS', items: ['Hiring loops', 'Vendor selection', 'Process design', 'Incident response'] },
  { code: 'C-05', area: 'GO-TO-MARKET', items: ['Positioning', 'Channel mix', 'Lifecycle email', 'Launch sequencing'] },
  { code: 'C-06', area: 'GOVERNANCE', items: ['Risk registers', 'Policy drafts', 'Compliance maps', 'Audit prep'] },
];

const PIPELINE = [
  { id: 'IDEATE', sub: 'you', label: 'IDEA' },
  { id: 'FRAME', sub: 'mu/th/ur', label: 'PROBLEM FRAME' },
  { id: 'SPEC', sub: 'mu/th/ur', label: 'SPEC + PRD' },
  { id: 'PLAN', sub: 'mu/th/ur', label: 'WORK GRAPH' },
  { id: 'BUILD', sub: 'agents', label: 'EXECUTION' },
  { id: 'OPERATE', sub: 'mu/th/ur', label: 'LIVE COMPANY' },
];

const MANIFESTO_LINES = [
  '01.  THE ONE-PERSON COMPANY IS NOT A FANTASY. IT IS A SUPPLY-CHAIN PROBLEM.',
  '02.  TASTE IS NOT AUTOMATABLE. EVERYTHING DOWNSTREAM OF TASTE IS.',
  '03.  THE FOUNDER PROVIDES INTENT. THE OPERATING SYSTEM PROVIDES EVERYTHING ELSE.',
  '04.  TOOLS THAT ONLY GENERATE ARE TOYS. TOOLS THAT OPERATE ARE INFRASTRUCTURE.',
  '05.  WE ARE NOT BUILDING A COPILOT. WE ARE BUILDING A CHIEF OF STAFF.',
];

// Easter eggs — tiny references for the right reader
const EASTER = [
  'COMPILED ON THE NOSTROMO · SECTOR ZZ-9 PLURAL Z·ALPHA',
  'SPECIAL ORDER 937 — NOT FOUND',
  'CREW EXPENDABLE: FALSE',
  'AIRLOCK STATUS: SEALED',
  'WEYLAND-YUTANI PARTNERSHIP: PENDING REVIEW',
  'HAL_9000 // COMPATIBILITY MODE: OFF',
  'SHODAN.PROFILE: ARCHIVED',
  'ED-209: REQUIRES COMPLIANCE OVERRIDE',
  'COFFEE BREWED: 1,247,602 CUPS',
  'IF YOU READ THIS, YOU ARE NOT ALONE',
];

// expose
Object.assign(window, {
  Cursor,
  LED,
  MuthurHeader,
  Marquee,
  LoadBar,
  AsciiPlaceholder,
  Typewriter,
  HexStream,
  PAINS,
  CAPABILITIES,
  PIPELINE,
  MANIFESTO_LINES,
  EASTER,
});
