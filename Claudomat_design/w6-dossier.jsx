// W6 — DOSSIER / CLASSIFIED
// Structured like a Weyland-Yutani classified document. Big stamps, redactions,
// numbered sections. Plays heavy on the Alien dossier vibe.

function W6Dossier() {
  return (
    <div className="crt">
      <div className="crt-glass" />
      <MuthurHeader screen="06" designation="DOSSIER · SOL-LV-426 · INTERNAL" />

      <div style={{ padding: '24px 56px', position: 'relative' }}>
        {/* CLASSIFIED STAMP */}
        <div style={{
          position: 'absolute', top: 18, right: 56, transform: 'rotate(-8deg)',
          border: '3px double var(--crt-warn)', color: 'var(--crt-warn)',
          padding: '6px 18px', fontFamily: 'var(--crt-display)', fontSize: 28,
          letterSpacing: '0.16em', opacity: 0.85, zIndex: 60,
        }}>
          UNCLASSIFIED // TASTE-EYES-ONLY
        </div>

        <div className="crt-tiny crt-uc crt-dim">DOC ID · CL-26-04-A · ENTRY 0001</div>
        <div className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 100, lineHeight: 0.92, marginTop: 4 }}>
          SUBJECT:
          <br/>CLAUDOMAT
        </div>
        <div className="crt-row crt-tiny crt-uc crt-dim" style={{ gap: 22, marginTop: 14, flexWrap: 'wrap' }}>
          <span>CLASS · OPERATING SYSTEM</span>
          <span>SCOPE · ONE-PERSON COMPANY</span>
          <span>PRINCIPAL · MU/TH/UR 6000</span>
          <span>STATUS · <span className="crt-amber">PRE-COMMISSION</span></span>
          <span>FILED · 2026.04.25</span>
        </div>
      </div>

      <hr className="crt-rule-solid"/>

      {/* §A SUMMARY */}
      <DossierSection id="A" title="EXECUTIVE SUMMARY">
        <div className="crt-2xl crt-glow" style={{ lineHeight: 1.4, fontWeight: 300 }}>
          The subject is a persistent, software-mediated operator. It accepts
          founder intent and emits a <span className="crt-amber">running company</span> —
          across product, business, and operations — within bounded latency.
        </div>
        <div className="crt-sm crt-dim" style={{ marginTop: 14, lineHeight: 1.6 }}>
          Where prior systems (ref. <span className="crt-amber">[REDACTED-COPILOT]</span>,
          <span className="crt-amber"> [REDACTED-GENERATOR]</span>) terminate at the
          deliverable layer (UI, code, copy), the subject extends through the
          <span className="crt-amber"> coordination layer</span> — the substrate where
          companies actually exist.
        </div>
      </DossierSection>

      {/* §B BACKGROUND */}
      <DossierSection id="B" title="BACKGROUND // THE GAP">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div className="crt-uc crt-amber crt-lg crt-glow">▸ OBSERVED</div>
            <div className="crt-sm crt-dim" style={{ marginTop: 6, lineHeight: 1.55 }}>
              Founders increasingly arrive with <span className="crt-amber">intent</span>{' '}
              and <span className="crt-amber">taste</span> but no functional knowledge of
              how products, businesses, or operations are constructed. Generators yield
              local artifacts; the global system remains <span className="crt-amber">absent</span>.
            </div>
          </div>
          <div>
            <div className="crt-uc crt-amber crt-lg crt-glow">▸ HYPOTHESIS</div>
            <div className="crt-sm crt-dim" style={{ marginTop: 6, lineHeight: 1.55 }}>
              The bottleneck is not <span className="crt-amber">creation</span>. It is
              <span className="crt-amber"> coordination</span>. Treat the founder as the
              specification of a company and the operator as its compiler.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {PAINS.map(p => (
            <div key={p.code} style={{ borderLeft: '2px solid var(--crt-amber)', padding: '6px 12px' }}>
              <div className="crt-tiny crt-uc crt-amber">EVIDENCE · {p.code}</div>
              <div className="crt-sm crt-glow" style={{ marginTop: 2 }}>{p.title}</div>
              <div className="crt-tiny crt-dim" style={{ marginTop: 4 }}>{p.body}</div>
            </div>
          ))}
        </div>
      </DossierSection>

      {/* §C METHOD */}
      <DossierSection id="C" title="METHOD // PIPELINE">
        <pre className="crt-ascii crt-sm crt-amber" style={{ margin: 0 }}>
{`  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
  │ IDEA │──▶│FRAME │──▶│ SPEC │──▶│ PLAN │──▶│BUILD │──▶│ OPS  │
  └──────┘   └──────┘   └──────┘   └──────┘   └──────┘   └──────┘
   founder    muthur     muthur     muthur     agents     muthur`}
        </pre>
        <div className="crt-row" style={{ gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          {PIPELINE.map(p => (
            <div key={p.id} style={{ flex: '1 1 130px', border: '1px solid var(--crt-line)', padding: '8px 10px' }}>
              <div className="crt-tiny crt-uc crt-dim">{p.sub}</div>
              <div className="crt-amber crt-uc crt-lg crt-glow">{p.id}</div>
              <div className="crt-tiny crt-faint">{p.label}</div>
            </div>
          ))}
        </div>
      </DossierSection>

      {/* §D SCOPE */}
      <DossierSection id="D" title="SCOPE OF OPERATIONS">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {CAPABILITIES.map(c => (
            <div key={c.code} style={{ padding: 14, borderTop: '1px solid var(--crt-line)' }}>
              <div className="crt-tiny crt-uc crt-dim">▸ ANNEX {c.code}</div>
              <div className="crt-amber crt-uc crt-xl crt-glow" style={{ margin: '4px 0' }}>{c.area}</div>
              {c.items.map(it => (
                <div key={it} className="crt-sm" style={{ padding: '2px 0' }}><span className="crt-amber">·</span> {it}</div>
              ))}
            </div>
          ))}
        </div>
      </DossierSection>

      {/* §E CREDO */}
      <DossierSection id="E" title="OPERATING DOCTRINE">
        {MANIFESTO_LINES.map((l, i) => (
          <div key={i} className="crt-row" style={{ alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px dashed var(--crt-line)' }}>
            <div className="crt-display crt-amber" style={{ fontSize: 28, width: 60, lineHeight: 1 }}>§{String(i+1).padStart(2,'0')}</div>
            <div className="crt-lg" style={{ flex: 1 }}>{l.replace(/^\d+\.\s+/, '')}</div>
          </div>
        ))}
      </DossierSection>

      {/* §F NEXT ACTIONS */}
      <DossierSection id="F" title="NEXT ACTIONS // COMMISSIONING">
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
          <div className="crt-panel">
            <div className="crt-panel-head"><span>◆ COMMISSIONING REQUEST</span><LED kind="ok" label="OPEN"/></div>
            <div className="crt-stack" style={{ gap: 8 }}>
              <input className="crt-input" placeholder="operator@designation.io"/>
              <textarea className="crt-input" rows={2} placeholder="// what would you build, given an operator?"/>
              <button className="crt-btn">▸ REQUEST EARLY ACCESS</button>
            </div>
          </div>
          <div className="crt-panel">
            <div className="crt-panel-head"><span>◆ ELIGIBILITY</span></div>
            <div className="crt-sm">
              <div>▸ solo founders</div>
              <div>▸ indie hackers</div>
              <div>▸ senior engineers tired of building everything else</div>
              <div className="crt-warn" style={{ marginTop: 6 }}>▸ NOT ACCEPTING: agencies, no-code-shops, ideation tourists</div>
            </div>
          </div>
        </div>
      </DossierSection>

      <Marquee items={EASTER} />
      <div style={{ padding: '12px 24px' }} className="crt-spread crt-tiny crt-uc crt-dim">
        <span>◆ END OF DOSSIER · SIGNED MU/TH/UR 6000</span>
        <span>SHRED AFTER READING <Cursor thin/></span>
      </div>
    </div>
  );
}

function DossierSection({ id, title, children }) {
  return (
    <div style={{ padding: '28px 56px', borderBottom: '1px solid var(--crt-line)' }}>
      <div className="crt-row" style={{ gap: 14, marginBottom: 14 }}>
        <span className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 56, lineHeight: 1 }}>§{id}</span>
        <span className="crt-uc crt-2xl crt-glow">{title}</span>
        <div style={{ flex: 1, marginLeft: 14, height: 1, background: 'var(--crt-line)' }}/>
      </div>
      {children}
    </div>
  );
}

window.W6Dossier = W6Dossier;
