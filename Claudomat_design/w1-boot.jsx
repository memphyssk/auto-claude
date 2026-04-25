// W1 — BOOT SEQUENCE / TUI MENU
// The page IS the boot screen. Big system identifier, scrolling boot lines,
// then a numbered menu of "concerns" that scroll the page to each section.

function W1Boot() {
  const [bootLines, setBootLines] = React.useState([]);
  const lines = [
    '[ OK ]  POWER-ON SELF TEST .................. PASS',
    '[ OK ]  MEMORY CHECK 524288K .................. OK',
    '[ OK ]  NEURAL CO-PROCESSOR .............. ONLINE',
    '[ OK ]  KNOWLEDGE BASE v.6.0.0 ........... LOADED',
    '[ .. ]  CALIBRATING TASTE VECTOR ............ ...',
    '[ OK ]  CALIBRATING TASTE VECTOR .......... DONE',
    '[ OK ]  FOUNDER INTENT BUFFER ........... STANDBY',
    '[ OK ]  WORK-GRAPH SCHEDULER ............. READY',
    '[ ** ]  AWAITING OPERATOR ...........',
  ];
  React.useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setBootLines(lines.slice(0, i));
      if (i >= lines.length) clearInterval(id);
    }, 220);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="crt">
      <div className="crt-glass" />
      <div className="crt-noise" />
      <MuthurHeader screen="01" />

      <div style={{ padding: '40px 56px 24px' }}>
        <div className="crt-tiny crt-uc crt-dim" style={{ marginBottom: 12 }}>
          ── INTERFACE 2037 — READY FOR INQUIRY ──
        </div>
        <div className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 96, lineHeight: 0.95, letterSpacing: '0.02em' }}>
          CLAUDOMAT
        </div>
        <div className="crt-display crt-amber" style={{ fontSize: 28, lineHeight: 1, marginTop: 6, opacity: 0.7 }}>
          /// THE OPERATING SYSTEM FOR ONE-PERSON COMPANIES
        </div>

        <div className="crt-row" style={{ marginTop: 28, gap: 18 }}>
          <button className="crt-btn">▸ REQUEST EARLY ACCESS</button>
          <button className="crt-btn crt-btn-ghost">SCROLL TO BRIEF ↓</button>
          <span className="crt-tiny crt-dim crt-uc" style={{ marginLeft: 'auto' }}>
            BUILD 6.0.{(new Date()).getDate().toString().padStart(2,'0')} · UNCLASSIFIED
          </span>
        </div>
      </div>

      <div style={{ padding: '0 56px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 28 }}>
        <pre className="crt-ascii crt-sm" style={{ margin: 0, color: 'var(--crt-text-dim)' }}>
{bootLines.join('\n')}
{bootLines.length === lines.length ? '' : <span className="crt-amber">_</span>}
        </pre>
        <div className="crt-panel">
          <div className="crt-panel-head">
            <span>◆ DIRECTIVE</span>
            <span>STATEMENT 01/01</span>
          </div>
          <div className="crt-lg" style={{ lineHeight: 1.55 }}>
            You bring an idea. <span className="crt-amber crt-glow">Claudomat</span> assembles
            the company around it — product, business, ops, GTM, governance — as a single,
            running system. Not generated. <span className="crt-amber">Operated.</span>
          </div>
          <hr className="crt-rule" style={{ margin: '12px 0' }} />
          <div className="crt-tiny crt-dim crt-uc">// You vibe-code the UI. We run the rest.</div>
        </div>
      </div>

      {/* TUI MENU */}
      <div style={{ padding: '36px 56px 0' }}>
        <div className="crt-tiny crt-uc crt-dim" style={{ marginBottom: 10 }}>
          SELECT INQUIRY · USE ↑↓ OR CLICK
        </div>
        <div style={{
          border: '1px solid var(--crt-line)',
          background: 'rgba(255,122,42,0.02)',
        }}>
          {[
            ['01', 'THE PROBLEM', 'why generation is not enough'],
            ['02', 'THE PIPELINE', 'how an idea becomes a company'],
            ['03', 'THE CAPABILITY MATRIX', 'what gets built for you'],
            ['04', 'THE MANIFESTO', 'first principles'],
            ['05', 'TRANSMIT INTENT', 'request early access'],
          ].map(([n, t, sub], i) => (
            <div
              key={n}
              className="crt-spread"
              style={{
                padding: '12px 18px',
                borderBottom: i < 4 ? '1px dashed var(--crt-line)' : '0',
                cursor: 'pointer',
              }}
            >
              <div className="crt-row" style={{ gap: 14 }}>
                <span className="crt-amber crt-display crt-2xl" style={{ width: 32 }}>{n}</span>
                <span className="crt-uc crt-lg crt-glitch">{t}</span>
                <span className="crt-tiny crt-dim crt-uc">// {sub}</span>
              </div>
              <span className="crt-amber">▸</span>
            </div>
          ))}
        </div>
      </div>

      {/* PAIN POINTS */}
      <SectionDivider n="01" title="THE PROBLEM" sub="Diagnostics on the founder/builder gap" />
      <div style={{ padding: '0 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {PAINS.map(p => (
          <div key={p.code} className="crt-panel" style={{ position: 'relative' }}>
            <div className="crt-panel-head">
              <span>◆ {p.code} · DIAGNOSTIC</span>
              <span><LED kind="warn" label="UNRESOLVED" /></span>
            </div>
            <div className="crt-lg crt-glow" style={{ marginBottom: 8 }}>{p.title}</div>
            <div className="crt-dim">{p.body}</div>
          </div>
        ))}
      </div>

      {/* PIPELINE */}
      <SectionDivider n="02" title="THE PIPELINE" sub="From intent to operating company" />
      <div style={{ padding: '0 56px' }}>
        <pre className="crt-ascii crt-sm crt-amber" style={{ margin: 0, opacity: 0.85 }}>
{`     ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
     │ IDEA │ ─▶ │FRAME │ ─▶ │ SPEC │ ─▶ │ PLAN │ ─▶ │BUILD │ ─▶ │ OPS  │
     └──────┘    └──────┘    └──────┘    └──────┘    └──────┘    └──────┘
        ▲           │            │           │           │           │
        │           ▼            ▼           ▼           ▼           ▼
   you-input    interviews   prd+scope   work graph   agents     dashboards
                clarifying   user-flows  dependency   codegen    metrics
                questions    pricing     critical-path sub-tasks  feedback`}
        </pre>
        <div className="crt-row" style={{ gap: 6, marginTop: 18, flexWrap: 'wrap' }}>
          {PIPELINE.map((p, i) => (
            <React.Fragment key={p.id}>
              <div className="crt-panel" style={{ flex: 1, minWidth: 130, padding: '10px 12px' }}>
                <div className="crt-tiny crt-dim crt-uc">STAGE {String(i+1).padStart(2,'0')} · {p.sub}</div>
                <div className="crt-amber crt-uc crt-lg crt-glow">{p.id}</div>
                <div className="crt-tiny crt-dim">{p.label}</div>
              </div>
              {i < PIPELINE.length - 1 && <span className="crt-amber">▸</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* CAPABILITY MATRIX */}
      <SectionDivider n="03" title="CAPABILITY MATRIX" sub="What Claudomat operates on your behalf" />
      <div style={{ padding: '0 56px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {CAPABILITIES.map(c => (
          <div key={c.code} className="crt-panel">
            <div className="crt-panel-head">
              <span>◆ {c.code}</span>
              <LED kind="ok" label="ACTIVE" />
            </div>
            <div className="crt-amber crt-uc crt-xl crt-glow" style={{ marginBottom: 8 }}>{c.area}</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {c.items.map(it => (
                <li key={it} className="crt-row crt-sm" style={{ padding: '3px 0', color: 'var(--crt-text)' }}>
                  <span className="crt-amber">▸</span> {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* MANIFESTO */}
      <SectionDivider n="04" title="MANIFESTO" sub="Five lines on first principles" />
      <div style={{ padding: '0 56px' }}>
        <div className="crt-panel" style={{ padding: '24px 28px' }}>
          {MANIFESTO_LINES.map(l => (
            <div key={l} className="crt-lg" style={{ padding: '6px 0', borderBottom: '1px dashed var(--crt-line)' }}>
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <SectionDivider n="05" title="TRANSMIT INTENT" sub="Request early access · expect a reply" />
      <div style={{ padding: '0 56px 56px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div className="crt-panel">
          <div className="crt-panel-head">
            <span>◆ TRANSMISSION FORM · EAS-001</span>
            <LED kind="ok" label="CHANNEL OPEN" />
          </div>
          <div className="crt-stack" style={{ gap: 10 }}>
            <div className="crt-stack" style={{ gap: 4 }}>
              <span className="crt-tiny crt-uc crt-dim">▸ OPERATOR DESIGNATION</span>
              <input className="crt-input" placeholder="ripley@nostromo.dev" defaultValue="" />
            </div>
            <div className="crt-stack" style={{ gap: 4 }}>
              <span className="crt-tiny crt-uc crt-dim">▸ THE THING YOU WANT TO BUILD</span>
              <textarea className="crt-input" rows={3} placeholder="// 1-2 lines. We will respond with the first three questions." />
            </div>
            <div className="crt-row" style={{ gap: 12, marginTop: 4 }}>
              <button className="crt-btn">▸ TRANSMIT</button>
              <span className="crt-tiny crt-dim">// Reply within 72h. Or never. Probably 72h.</span>
            </div>
          </div>
        </div>
        <div className="crt-stack" style={{ gap: 12 }}>
          <div className="crt-panel">
            <div className="crt-panel-head"><span>◆ LIVE TELEMETRY</span><span>RT</span></div>
            <LoadBar label="Intent buffer" pct={62} />
            <div style={{ height: 6 }} />
            <LoadBar label="Work-graph depth" pct={84} />
            <div style={{ height: 6 }} />
            <LoadBar label="Founder caffeine" pct={97} color="var(--crt-warn)" />
          </div>
          <div className="crt-panel">
            <div className="crt-panel-head"><span>◆ NOW ACCEPTING</span><span>Q2 · 2026</span></div>
            <div className="crt-sm crt-dim">Solo founders, indie hackers, senior engineers tired of building everything else.</div>
          </div>
        </div>
      </div>

      <Marquee items={EASTER} />

      <div style={{ padding: '14px 24px' }} className="crt-spread crt-tiny crt-uc crt-dim">
        <span>◆ CLAUDOMAT.DEV — A WEYLAND–YUTANI INDEPENDENT</span>
        <span>END OF TRANSMISSION <Cursor thin /></span>
      </div>
    </div>
  );
}

function SectionDivider({ n, title, sub }) {
  return (
    <div style={{ padding: '40px 56px 18px' }}>
      <div className="crt-row" style={{ gap: 12 }}>
        <span className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 48, lineHeight: 1 }}>§{n}</span>
        <div className="crt-stack">
          <span className="crt-uc crt-2xl crt-glow">{title}</span>
          <span className="crt-tiny crt-dim crt-uc">// {sub}</span>
        </div>
        <div style={{ flex: 1, marginLeft: 16, height: 1, background: 'var(--crt-line)' }} />
      </div>
    </div>
  );
}

window.W1Boot = W1Boot;
