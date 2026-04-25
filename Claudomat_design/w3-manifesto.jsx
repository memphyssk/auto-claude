// W3 — MANIFESTO-FIRST, TYPOGRAPHIC
// Big text. The page reads like a printed dossier from the future. Less
// chrome, more conviction. Pull-quote treatment for the manifesto lines.

function W3Manifesto() {
  return (
    <div className="crt">
      <div className="crt-glass" />
      <MuthurHeader screen="03" designation="DOC.CLAUDOMAT.0026.A — UNCLASSIFIED" />

      {/* HERO */}
      <div style={{ padding: '60px 80px 40px', position: 'relative' }}>
        <div className="crt-tiny crt-uc crt-dim">FILED 2026 · 04 · 25 ·  AUTHORED BY MU/TH/UR</div>
        <div className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 180, lineHeight: 0.85, margin: '10px 0', letterSpacing: '0.01em' }}>
          THE
          <br/>
          ONE-
          <br/>
          PERSON
          <br/>
          COMPANY
        </div>
        <div className="crt-display crt-amber" style={{ fontSize: 36, opacity: 0.6, marginTop: 6 }}>
          IS A SUPPLY-CHAIN PROBLEM. WE SOLVED IT.
        </div>
        <div className="crt-row" style={{ marginTop: 32, gap: 14 }}>
          <button className="crt-btn">▸ REQUEST EARLY ACCESS</button>
          <span className="crt-tiny crt-dim crt-uc">// the rest of this document explains why</span>
        </div>
      </div>

      <hr className="crt-rule-solid" />

      {/* THE STATEMENT */}
      <div style={{ padding: '40px 80px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: 28 }}>
        <div className="crt-tiny crt-uc crt-dim">§01<br/>STATEMENT</div>
        <div className="crt-2xl crt-glow" style={{ lineHeight: 1.35, fontWeight: 300 }}>
          <span className="crt-amber">Claudomat</span> is a persistent operator that turns founder
          intent into a running company. You decide what to build and why. It does the rest —
          product, business, process. Not generated. <span className="crt-sketch">Operated.</span>
        </div>
      </div>

      <hr className="crt-rule" />

      {/* THE GAP */}
      <div style={{ padding: '40px 80px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: 28 }}>
        <div className="crt-tiny crt-uc crt-dim">§02<br/>THE GAP</div>
        <div>
          <div className="crt-2xl" style={{ lineHeight: 1.4, color: 'var(--crt-text)' }}>
            You can <span className="crt-amber">vibe-code</span> a landing page. You cannot
            vibe-code a <span className="crt-amber">company</span>. Pricing, onboarding, support,
            ops, dunning, hiring, governance — these are not screens. They are systems.
            Generators ship pixels. <span className="crt-glow">Operators ship outcomes.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 30 }}>
            {PAINS.map(p => (
              <div key={p.code} style={{ borderTop: '1px solid var(--crt-line)', paddingTop: 12 }}>
                <div className="crt-tiny crt-uc crt-amber">▸ {p.code}</div>
                <div className="crt-lg" style={{ lineHeight: 1.35, marginTop: 6 }}>{p.title}</div>
                <div className="crt-sm crt-dim" style={{ marginTop: 6 }}>{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="crt-rule" />

      {/* THE METHOD */}
      <div style={{ padding: '40px 80px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: 28 }}>
        <div className="crt-tiny crt-uc crt-dim">§03<br/>THE METHOD</div>
        <div>
          <pre className="crt-ascii crt-amber" style={{ margin: 0, fontSize: 12, lineHeight: 1.35 }}>
{`  YOU ─▶ INTENT ─▶ ┐
                   │   ╔═════════════════════════════╗
                   ├──▶║   M U / T H / U R   6 0 0 0  ║──▶ COMPANY
                   │   ╚═════════════════════════════╝
  context, taste ─▶┘    framing · spec · planning · build · ops`}
          </pre>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 22 }}>
            {CAPABILITIES.map(c => (
              <div key={c.code} style={{ borderTop: '1px solid var(--crt-line)', paddingTop: 8 }}>
                <div className="crt-tiny crt-uc crt-dim">▸ {c.code}</div>
                <div className="crt-amber crt-uc crt-lg crt-glow">{c.area}</div>
                <div className="crt-tiny crt-dim" style={{ marginTop: 4 }}>
                  {c.items.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="crt-rule" />

      {/* MANIFESTO LINES */}
      <div style={{ padding: '40px 80px' }}>
        <div className="crt-tiny crt-uc crt-dim">§04 · CREDO</div>
        <div style={{ marginTop: 18 }}>
          {MANIFESTO_LINES.map((l, i) => (
            <div key={i} className="crt-row" style={{ alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px dashed var(--crt-line)' }}>
              <div className="crt-display crt-amber crt-glow" style={{ fontSize: 36, lineHeight: 1, width: 84 }}>
                §{String(i+1).padStart(2,'0')}
              </div>
              <div className="crt-xl" style={{ flex: 1, lineHeight: 1.4 }}>
                {l.replace(/^\d+\.\s+/, '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="crt-rule-solid" />

      {/* CTA */}
      <div style={{ padding: '50px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
        <div>
          <div className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 88, lineHeight: 0.95 }}>
            TRANSMIT
            <br/>INTENT.
          </div>
          <div className="crt-lg crt-dim" style={{ marginTop: 10 }}>
            Send us the smallest seed of an idea. We respond with the first three questions.
          </div>
        </div>
        <div className="crt-panel">
          <div className="crt-panel-head"><span>◆ EARLY ACCESS</span><LED kind="ok" label="CHANNEL OPEN" /></div>
          <input className="crt-input" placeholder="ripley@nostromo.dev" style={{ marginBottom: 8 }}/>
          <textarea className="crt-input" rows={3} placeholder="// what would you build, if the rest of the company built itself?" />
          <button className="crt-btn" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}>▸ TRANSMIT</button>
        </div>
      </div>

      <Marquee items={EASTER} />
      <div style={{ padding: '12px 24px' }} className="crt-spread crt-tiny crt-uc crt-dim">
        <span>◆ END OF DOSSIER · DOC.CLAUDOMAT.0026.A</span>
        <span>SIGNED, MU/TH/UR <Cursor thin/></span>
      </div>
    </div>
  );
}
window.W3Manifesto = W3Manifesto;
