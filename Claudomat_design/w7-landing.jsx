// W7 — Polished landing page (v2)
// Spine: W3 typographic dossier. Hero: W5 terminal. Anchor copy from W1.
// Footer: W4 schematic-style, marquee hidden behind 'ash' easter egg.

function ClaudomatLanding() {
  const [easter, setEaster] = React.useState(false);
  React.useEffect(() => {
    let buf = '';
    const onKey = (e) => {
      buf = (buf + e.key).slice(-3).toLowerCase();
      if (buf === 'ash') setEaster(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="crt">
      <div className="crt-glass" />
      <div className="crt-noise" />
      <MuthurHeader screen="00" designation="OPERATING SYSTEM · CLAUDOMAT.DEV" />

      {/* ── HERO · TERMINAL SESSION ─────────────────────────────────── */}
      <div style={{ padding: '36px 80px 24px' }}>
        <div className="crt-tiny crt-uc crt-dim" style={{ marginBottom: 14 }}>
          /dev/system/tty0 · session #A937 · operator: unverified
        </div>

        <TermLine cmd="whoami" out={
          <span><span className="crt-amber">claudomat</span> · the operating system for one-person companies</span>
        }/>

        <TermLine cmd="cat /etc/motd" out={
          <div style={{ margin: '6px 0 2px' }}>
            <div className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 'clamp(56px, 9.4vw, 108px)', lineHeight: 1.05, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
              BUILD ANYTHING.
            </div>
            <div className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 'clamp(56px, 9.4vw, 108px)', lineHeight: 1.05, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
              OPERATE EVERYTHING.
            </div>
          </div>
        }/>

        <div className="crt-row" style={{ gap: 8, marginTop: 12 }}>
          <span className="crt-amber">operator@claudomat:~$</span>
          <span className="crt-text">claudomat join --early-access<Cursor thin/></span>
        </div>

        <div className="crt-row" style={{ marginTop: 22, gap: 14 }}>
          <button className="crt-btn">▸ GET EARLY ACCESS</button>
          <button className="crt-btn crt-btn-ghost">READ THE BRIEF ↓</button>
          <span className="crt-tiny crt-dim crt-uc" style={{ marginLeft: 'auto' }}>
            BUILD 6.0.{(new Date()).getDate().toString().padStart(2,'0')} · UNCLASSIFIED
          </span>
        </div>
      </div>

      <hr className="crt-rule-solid" style={{ margin: '24px 0 0' }}/>

      {/* ── §01 STATEMENT (W1 copy) ─────────────────────────────────── */}
      <div style={{ padding: '40px 80px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: 28 }}>
        <div className="crt-tiny crt-uc crt-dim">§01<br/>STATEMENT</div>
        <div className="crt-2xl crt-glow" style={{ lineHeight: 1.4, fontWeight: 300 }}>
          You bring an idea. <span className="crt-amber">Claudomat</span> assembles the company
          around it — product, business, ops, GTM, governance — as a single, running system.
          <br/>Not generated. <span className="crt-sketch">Operated.</span>
        </div>
      </div>

      <hr className="crt-rule"/>

      {/* ── §02 THE GAP (cards removed per request) ─────────────────── */}
      <div style={{ padding: '40px 80px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: 28 }}>
        <div className="crt-tiny crt-uc crt-dim">§02<br/>THE GAP</div>
        <div>
          <div className="crt-2xl" style={{ lineHeight: 1.45, color: 'var(--crt-text)' }}>
            You can <span className="crt-amber crt-annot" data-note="Lovable, v0, Bolt — generators of pixels.">vibe-code</span> a landing page.
            You cannot vibe-code a <span className="crt-amber">company</span>. Pricing, onboarding,
            support, ops, dunning, hiring, governance — these are not screens.
            They are <span className="crt-amber">systems</span>.
          </div>
          <div className="crt-2xl crt-glow" style={{ lineHeight: 1.45, marginTop: 18 }}>
            Generators ship pixels.<br/>
            <span className="crt-amber">Claudomat ships outcomes.</span>
          </div>

        </div>
      </div>

      <hr className="crt-rule"/>

      {/* ── §03 METHOD ──────────────────────────────────────────────── */}
      <div style={{ padding: '40px 80px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: 28 }}>
        <div className="crt-tiny crt-uc crt-dim">§03<br/>THE METHOD</div>
        <div>
          <pre className="crt-ascii crt-amber" style={{ margin: 0, fontSize: 12, lineHeight: 1.35 }}>
{`  YOU ─▶ INTENT ─▶ ┐
                   │   ╔═════════════════════════════╗
                   ├──▶║   C L A U D O M A T          ║──▶ COMPANY
                   │   ╚═════════════════════════════╝
  context, taste ─▶┘    framing · spec · planning · build · ops`}
          </pre>

          {/* Blackbox visual — sealed system, optional guidance */}
          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '120px 1fr 120px', gap: 0, alignItems: 'stretch' }}>
            {/* INPUT */}
            <div className="crt-stack" style={{ borderTop: '1px solid var(--crt-line)', borderBottom: '1px solid var(--crt-line)', padding: '14px 12px', justifyContent: 'center', gap: 4 }}>
              <div className="crt-tiny crt-uc crt-dim">▸ INPUT</div>
              <div className="crt-amber crt-uc crt-lg crt-glow">YOU</div>
              <div className="crt-tiny crt-faint">an idea<br/>+ taste</div>
            </div>

            {/* BLACKBOX */}
            <div style={{ position: 'relative', border: '1px solid var(--crt-amber)', background: 'rgba(0,0,0,0.55)', overflow: 'hidden' }}>
              {/* sealed-system label strip */}
              <div className="crt-spread crt-tiny crt-uc crt-dim" style={{ padding: '6px 12px', borderBottom: '1px dashed var(--crt-line)', background: 'rgba(255,122,42,0.04)' }}>
                <span><span className="crt-amber">◆ SEALED SYSTEM</span> · CLAUDOMAT</span>
                <span className="crt-row" style={{ gap: 10 }}>
                  <LED kind="ok" label="autonomous"/>
                  <span>// no founder hands required</span>
                </span>
              </div>

              {/* internal stages — present but greyed, with a faint "do not touch" diagonal hatch */}
              <div style={{
                position: 'relative',
                padding: '14px 12px',
                backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 14px, rgba(255,122,42,0.04) 14px 15px)',
              }}>
                <div className="crt-row" style={{ gap: 0, flexWrap: 'nowrap' }}>
                  {PIPELINE.map((p, i) => (
                    <React.Fragment key={p.id}>
                      <div style={{ flex: '1 1 0', minWidth: 0, border: '1px solid var(--crt-line)', padding: '8px 8px', background: 'rgba(10,8,7,0.7)' }}>
                        <div className="crt-tiny crt-uc crt-dim">STG·{String(i+1).padStart(2,'0')}</div>
                        <div className="crt-amber crt-uc crt-sm crt-glow" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.id}</div>
                        <div className="crt-tiny crt-faint" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.label}</div>
                      </div>
                      {i < PIPELINE.length - 1 && <span className="crt-amber" style={{ padding: '0 3px', alignSelf: 'center', opacity: 0.7 }}>▶</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="crt-tiny crt-dim crt-uc" style={{ marginTop: 10, textAlign: 'center', letterSpacing: '0.18em' }}>
                  // happens without you · interruptible · always inspectable
                </div>
              </div>
            </div>

            {/* OUTPUT */}
            <div className="crt-stack" style={{ borderTop: '1px solid var(--crt-line)', borderBottom: '1px solid var(--crt-line)', padding: '14px 12px', justifyContent: 'center', gap: 4, alignItems: 'flex-end', textAlign: 'right' }}>
              <div className="crt-tiny crt-uc crt-dim">OUTPUT ▸</div>
              <div className="crt-amber crt-uc crt-lg crt-glow">COMPANY</div>
              <div className="crt-tiny crt-faint">running<br/>system</div>
            </div>
          </div>

          {/* arrows / annotations row beneath blackbox */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px', gap: 0, marginTop: 6 }}>
            <div className="crt-tiny crt-faint" style={{ textAlign: 'center' }}>▲ required</div>
            <div className="crt-tiny crt-faint" style={{ textAlign: 'center' }}>▲ guidance optional · default = autopilot</div>
            <div className="crt-tiny crt-faint" style={{ textAlign: 'center' }}>▲ continuous</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 28 }}>
            {CAPABILITIES.map(c => (
              <div key={c.code} style={{ borderTop: '1px solid var(--crt-line)', paddingTop: 8 }}>
                <div className="crt-tiny crt-uc crt-dim">▸ {c.code}</div>
                <div className="crt-amber crt-uc crt-lg crt-glow">{c.area}</div>
                <div className="crt-tiny crt-dim" style={{ marginTop: 4, lineHeight: 1.5 }}>
                  {c.items.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="crt-rule"/>

      {/* ── §04 OPERATING LOG (terminal dialogue) ───────────────────── */}
      <div style={{ padding: '40px 80px' }}>
        <div className="crt-spread" style={{ marginBottom: 18 }}>
          <div className="crt-tiny crt-uc crt-dim">§04 · OPERATING LOG</div>
          <div className="crt-tiny crt-uc crt-dim">excerpt · day 47 · 03:22 — 04:11 UTC</div>
        </div>

        <div className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 'clamp(40px, 5.4vw, 68px)', lineHeight: 1.0, marginBottom: 22 }}>
          A DAY IN THE LIFE.
        </div>

        <TerminalWindow/>

        <div className="crt-tiny crt-uc crt-dim" style={{ marginTop: 10, textAlign: 'right' }}>
          // ~6 minutes of operator time this week · the rest is the operating system
        </div>
      </div>

      <hr className="crt-rule-solid"/>

      {/* ── §05 CTA ─────────────────────────────────────────────────── */}
      <div style={{ padding: '50px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
        <div>
          <div className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 'clamp(56px, 7vw, 88px)', lineHeight: 1.0 }}>
            TRANSMIT
            <br/>INTENT.
          </div>
        </div>
        <div className="crt-panel">
          <div className="crt-panel-head"><span>◆ EARLY ACCESS</span><LED kind="ok" label="CHANNEL OPEN" /></div>
          <input className="crt-input" placeholder="ripley@nostromo.dev" style={{ marginBottom: 8 }}/>
          <textarea className="crt-input" rows={3} placeholder="// what would you build, if the rest of the company built itself?" />
          <button className="crt-btn" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}>▸ TRANSMIT</button>
        </div>
      </div>

      {/* ── FOOTER (W4 schematic-style, no marquee) ──────────────────── */}
      <div style={{
        borderTop: '1px solid var(--crt-line)',
        padding: '20px 32px',
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr',
        gap: 28,
        background: 'rgba(255,122,42,0.02)',
      }}>
        <div>
          <div className="crt-tiny crt-uc crt-dim">DRAWING NO. CL-26-04 · SHEET 1 OF 1</div>
          <div className="crt-display crt-amber crt-glow" style={{ fontSize: 38, lineHeight: 1, marginTop: 4 }}>
            CLAUDOMAT
          </div>

        </div>
        <div className="crt-stack crt-tiny crt-uc crt-dim" style={{ gap: 4 }}>
          <span>SCALE 1:1</span>
          <span>TOLERANCE ± TASTE</span>
          <span>STATUS <span className="crt-amber">[OPERATIONAL]</span></span>
        </div>
        <div className="crt-stack crt-tiny crt-uc crt-dim" style={{ gap: 4, alignItems: 'flex-end' }}>
          <span>REV-04 · added GOVERNANCE node</span>
          <span>REV-05 · pruned COPILOT branch</span>
          <span className="crt-amber">REV-06 · taste vector calibrated</span>
        </div>
      </div>

      {/* Easter-egg-only marquee — toggle with 'ash' */}
      {easter && <Marquee items={EASTER} />}

      <div style={{ padding: '12px 32px' }} className="crt-spread crt-tiny crt-uc crt-dim">
        <span>◆ CLAUDOMAT.DEV</span>
        <span>END OF SHEET <Cursor thin/></span>
      </div>
    </div>
  );
}

function TermLine({ cmd, out }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div className="crt-row" style={{ gap: 8 }}>
        <span className="crt-amber">operator@claudomat:~$</span>
        <span className="crt-text">{cmd}</span>
      </div>
      <div style={{ padding: '4px 0 0 0' }}>{out}</div>
    </div>
  );
}

function TerminalWindow() {
  // each Bubble independently observes its own visibility for scroll-triggered reveal
  const Bubble = ({ who, children, ts, kind }) => {
    const ref = React.useRef(null);
    const [seen, setSeen] = React.useState(false);
    React.useEffect(() => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => { if (e.isIntersecting) { setSeen(true); obs.disconnect(); } });
        },
        { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
      );
      obs.observe(ref.current);
      return () => obs.disconnect();
    }, []);
    return (
      <div
        ref={ref}
        style={{
          marginBottom: 10,
          opacity: seen ? 1 : 0,
          transform: seen ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 600ms ease-out, transform 600ms ease-out',
        }}
      >
        <div className="crt-row crt-tiny crt-uc crt-dim" style={{ gap: 10, marginBottom: 3 }}>
          <span className={who === 'you' ? '' : 'crt-amber'}>
            {who === 'you' ? '▸ operator' : '◆ claudomat'}
          </span>
          <span style={{ flex: 1, height: 1, background: 'var(--crt-line)', opacity: 0.5 }}/>
          <span>{ts}</span>
        </div>
        <div style={{
          padding: '8px 12px',
          borderLeft: kind === 'report' ? '2px solid var(--crt-amber)' : '2px solid var(--crt-line)',
          background: who === 'you' ? 'rgba(255,255,255,0.02)' : 'rgba(255,122,42,0.04)',
          color: 'var(--crt-text)',
          fontSize: 13,
          lineHeight: 1.55,
        }}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="crt-frame" style={{ background: 'rgba(0,0,0,0.55)', position: 'relative', overflow: 'hidden' }}>
      {/* window chrome */}
      <div className="crt-spread" style={{ padding: '8px 12px', borderBottom: '1px solid var(--crt-line)', background: 'rgba(255,122,42,0.05)' }}>
        <div className="crt-row" style={{ gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d44a1c', boxShadow: '0 0 4px #d44a1c' }}/>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#c4521b', opacity: 0.6 }}/>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#b8d97a', boxShadow: '0 0 4px #b8d97a' }}/>
          <span className="crt-tiny crt-uc crt-dim" style={{ marginLeft: 12 }}>
            ◆ claudomat ~ operator-session-#A937
          </span>
        </div>
        <div className="crt-row crt-tiny crt-uc crt-dim" style={{ gap: 14 }}>
          <LED kind="ok" label="connected"/>
          <span>tty0</span>
        </div>
      </div>

      <div style={{ padding: '18px 22px' }}>
        {/* 1. weekly self-report — what got built, what was earned */}
                  <Bubble who="claudomat" ts="MON · 08:00" kind="report">
            <span className="crt-tiny crt-uc crt-amber">/// weekly digest · auto</span>
            <div style={{ marginTop: 6 }}>
              shipped this week: <span className="crt-amber">async collab mode</span>,
              {' '}<span className="crt-amber">SSO for teams</span>, and a rebuilt
              billing flow. revenue: <span className="crt-amber">$18,420</span> (+11% w/w).
              support load down 23% on the new onboarding.
            </div>
            <div className="crt-tiny crt-dim" style={{ marginTop: 6 }}>
              ▸ nothing requires you. read at your leisure.
            </div>
          </Bubble>

        {/* 2. operator places a high-level bet */}
                  <Bubble who="you" ts="WED · 22:14">
            gut feeling: the market is shifting toward small teams, not solo users.
            i think we're a year away from the buyer being a 3-person founding pod.
            worth taking seriously.
          </Bubble>

        {/* 3. claudomat acknowledges, runs the work */}
                  <Bubble who="claudomat" ts="WED · 22:14">
            understood. running market study + cohort analysis. i'll come back
            with evidence, not opinions.
          </Bubble>

        {/* 4. claudomat returns with research */}
                  <Bubble who="claudomat" ts="THU · 11:02" kind="report">
            <span className="crt-tiny crt-uc crt-amber">/// market study · 14h</span>
            <div style={{ marginTop: 6 }}>
              your gut checks out. signal across 4 sources:
            </div>
            <pre className="crt-ascii crt-tiny" style={{ margin: '6px 0', color: 'var(--crt-text)' }}>
{`  ▸ our funnel:    multi-seat invites +47% in last 90d
  ▸ search trend:  "small team tool" +38% YoY
  ▸ competitors:   3 of 5 launched team tiers in Q1
  ▸ interviews:    8/12 last-month signups want collab`}
            </pre>
            <div className="crt-tiny crt-dim" style={{ marginTop: 4 }}>
              ▸ confidence: high. ▸ window: ~9 months before saturation.
            </div>
          </Bubble>

        {/* 5. operator decides */}
                  <Bubble who="you" ts="THU · 11:38">
            ok. lean in. make us a teams company.
          </Bubble>

        {/* 6. claudomat owns the multi-area execution */}
                  <Bubble who="claudomat" ts="THU · 11:38" kind="report">
            <span className="crt-tiny crt-uc crt-amber">/// strategic pivot · accepted</span>
            <div style={{ marginTop: 6 }}>
              repositioning across the company. i'll handle:
            </div>
            <pre className="crt-ascii crt-tiny" style={{ margin: '6px 0', color: 'var(--crt-text)' }}>
{`  product   ▸ team workspaces · roles · shared history
  pricing   ▸ per-seat tier + legacy solo grandfathered
  website   ▸ new hero, "built for small teams"
  gtm       ▸ rewrite onboarding, lifecycle, sales deck
  ops       ▸ migrate cohort, invite flows, support docs`}
            </pre>
            <div className="crt-tiny crt-dim">
              ▸ ETA: 3 weeks rolling. ▸ i'll surface anything that needs your taste.
            </div>
          </Bubble>

        {/* 7. operator one-line trust */}
                  <Bubble who="you" ts="THU · 11:40">
            good. don't break the existing users.
          </Bubble>

        {/* 8. claudomat dry close */}
                  <Bubble who="claudomat" ts="THU · 11:40">
            <span className="crt-amber">noted.</span> grandfathering tier locked. i'll report next monday.
          </Bubble>

        {/* live prompt at bottom */}
        <div className="crt-row" style={{ gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--crt-line)' }}>
          <span className="crt-amber">operator@claudomat:~$</span>
          <Cursor thin/>
        </div>
      </div>
    </div>
  );
}

window.ClaudomatLanding = ClaudomatLanding;
