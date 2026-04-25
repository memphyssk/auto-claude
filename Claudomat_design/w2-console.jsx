// W2 — MU/TH/UR CONSOLE (split-pane operator interface)
// Looks like the actual MU/TH/UR room. Left: status / system stack. Center:
// the message. Right: live readouts. Whole thing reads like a workstation.

function W2Console() {
  return (
    <div className="crt">
      <div className="crt-glass" />
      <div className="crt-noise" />
      <MuthurHeader screen="02" designation="MU/TH/UR 6000 · INTERFACE 2037" />

      {/* command bar */}
      <div className="crt-row crt-tiny crt-uc crt-dim" style={{ padding: '6px 14px', gap: 22, borderBottom: '1px solid var(--crt-line)' }}>
        <span className="crt-amber">▸ INQUIRY</span>
        <span>BRIEF</span><span>PIPELINE</span><span>MATRIX</span><span>CREDO</span>
        <span style={{ marginLeft: 'auto' }}>SESSION #A937 · OPERATOR: UNVERIFIED</span>
      </div>

      {/* MAIN SPLIT */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: 0, minHeight: 720 }}>
        {/* LEFT — system stack */}
        <div style={{ borderRight: '1px solid var(--crt-line)', padding: '18px 16px' }}>
          <div className="crt-panel-head"><span>◆ SYSTEM STACK</span><LED kind="ok" label="OK" /></div>
          {[
            ['INTAKE', 'listening', 'ok'],
            ['FRAMING', 'idle', 'ok'],
            ['SPEC', 'idle', 'ok'],
            ['PLANNING', 'idle', 'ok'],
            ['EXECUTION', 'idle', 'ok'],
            ['OPS', 'standby', 'ok'],
            ['LEDGER', 'sync', 'ok'],
            ['GOVERNANCE', 'sealed', 'warn'],
          ].map(([k,v,s])=>(
            <div key={k} className="crt-spread crt-tiny crt-uc" style={{ padding: '6px 0', borderBottom: '1px dashed var(--crt-line)' }}>
              <span><span className="crt-amber">▸</span> {k}</span>
              <span><LED kind={s} label={v}/></span>
            </div>
          ))}
          <div style={{ height: 18 }} />
          <div className="crt-panel-head"><span>◆ TELEMETRY</span></div>
          <LoadBar label="QUERY DEPTH" pct={48} />
          <div style={{ height: 8 }}/>
          <LoadBar label="GRAPH NODES" pct={71} />
          <div style={{ height: 8 }}/>
          <LoadBar label="CONFIDENCE" pct={88} />
          <div style={{ height: 18 }} />
          <HexStream rows={5} cols={5} />
        </div>

        {/* CENTER — the headline + brief */}
        <div style={{ padding: '36px 36px 28px' }}>
          <div className="crt-tiny crt-uc crt-dim">CMD ▸ identify --self</div>
          <div className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 110, lineHeight: 0.92, margin: '8px 0 4px' }}>
            CLAUDOMAT
          </div>
          <div className="crt-display crt-amber" style={{ fontSize: 22, opacity: 0.7 }}>
            // OPERATING SYSTEM FOR ONE-PERSON COMPANIES
          </div>

          <hr className="crt-rule-solid" style={{ margin: '24px 0 18px' }}/>

          <div className="crt-tiny crt-uc crt-dim">CMD ▸ describe --gap</div>
          <div className="crt-2xl crt-glow" style={{ marginTop: 8, lineHeight: 1.35 }}>
            Lovable, v0, Bolt — they ship pixels.<br/>
            <span className="crt-amber">A company is a graph of decisions, not a screen.</span>
          </div>

          <div style={{ height: 22 }}/>
          <div className="crt-tiny crt-uc crt-dim">CMD ▸ describe --self</div>
          <div className="crt-lg" style={{ marginTop: 8, color: 'var(--crt-text)' }}>
            Claudomat is your <span className="crt-amber crt-annot" data-note="Not a copilot. Not a chat. A persistent operator.">product CEO on demand</span>.
            You ideate. It frames, specs, plans, builds, ships, operates, reports.
            Product. Business. Process. Nothing is off the table.
          </div>

          <div className="crt-row" style={{ marginTop: 28, gap: 14 }}>
            <button className="crt-btn">▸ REQUEST EARLY ACCESS</button>
            <button className="crt-btn crt-btn-ghost">READ THE BRIEF</button>
          </div>

          <hr className="crt-rule" style={{ margin: '28px 0' }}/>

          {/* PAINS as small index */}
          <div className="crt-panel-head"><span>◆ INDEX OF PAIN</span><span>04 ENTRIES</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {PAINS.map(p => (
              <div key={p.code} style={{ padding: 12, border: '1px solid var(--crt-line)' }}>
                <div className="crt-tiny crt-uc crt-amber">{p.code}</div>
                <div className="crt-sm crt-glow" style={{ margin: '4px 0 4px' }}>{p.title}</div>
                <div className="crt-tiny crt-dim">{p.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — live readouts */}
        <div style={{ borderLeft: '1px solid var(--crt-line)', padding: '18px 16px' }}>
          <div className="crt-panel-head"><span>◆ NOW</span><span><Cursor thin/></span></div>
          <div className="crt-tiny crt-dim crt-uc">CURRENT FOUNDER MODE</div>
          <div className="crt-amber crt-glow crt-uc crt-lg">CONTEXT-SWITCH</div>
          <div style={{ height: 12 }}/>
          <pre className="crt-ascii crt-tiny crt-faint" style={{ margin: 0 }}>
{`        you
       /│\\ \\
      / │ \\ \\__
     /  │  \\   \\
   pm  eng  ops finance
    │   │   │    │
   ???  ???  ???  ???`}
          </pre>
          <div className="crt-tiny crt-dim" style={{ marginTop: 6 }}>
            // 9 hats. 0 systems. Predictable failure mode.
          </div>

          <hr className="crt-rule" style={{ margin: '18px 0' }}/>

          <div className="crt-panel-head"><span>◆ AFTER</span></div>
          <pre className="crt-ascii crt-tiny crt-amber" style={{ margin: 0 }}>
{`        you
         │
         ▼
    ┌─────────┐
    │CLAUDOMAT│
    └─────────┘
     │ │ │ │ │
     ▼ ▼ ▼ ▼ ▼
    pm en op fi gtm`}
          </pre>
          <div className="crt-tiny crt-dim" style={{ marginTop: 6 }}>
            // 1 hat: founder. The rest is delegated to a system.
          </div>

          <hr className="crt-rule" style={{ margin: '18px 0' }}/>

          <div className="crt-panel-head"><span>◆ ACCEPTING</span></div>
          <div className="crt-display crt-amber crt-3xl crt-glow">Q2·26</div>
          <div className="crt-tiny crt-dim">solo founders · indie hackers · senior eng</div>

          <div style={{ height: 14 }} />
          <button className="crt-btn" style={{ width: '100%', justifyContent: 'center' }}>▸ JOIN WAITLIST</button>
        </div>
      </div>

      {/* PIPELINE STRIP */}
      <div style={{ padding: '20px 24px', borderTop: '1px solid var(--crt-line)' }}>
        <div className="crt-panel-head"><span>◆ PIPELINE · IDEA → COMPANY</span><span>06 STAGES</span></div>
        <div className="crt-row" style={{ gap: 0, marginTop: 6 }}>
          {PIPELINE.map((p, i) => (
            <React.Fragment key={p.id}>
              <div style={{ flex: 1, border: '1px solid var(--crt-line)', padding: 10, position: 'relative', background: i===0 ? 'rgba(255,122,42,0.08)' : 'transparent' }}>
                <div className="crt-tiny crt-uc crt-dim">STAGE {String(i+1).padStart(2,'0')} · {p.sub}</div>
                <div className="crt-amber crt-uc crt-lg crt-glow">{p.id}</div>
                <div className="crt-tiny crt-faint">{p.label}</div>
              </div>
              {i < PIPELINE.length - 1 && <span className="crt-amber" style={{ padding: '0 4px' }}>▶</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Marquee items={EASTER} />
      <div style={{ padding: '12px 16px' }} className="crt-spread crt-tiny crt-uc crt-dim">
        <span>◆ MU/TH/UR · NODE CLAUDOMAT.DEV</span>
        <span>SIGNAL CLEAR <Cursor thin/></span>
      </div>
    </div>
  );
}
window.W2Console = W2Console;
