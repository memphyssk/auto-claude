// W4 — DEPENDENCY GRAPH / SCHEMATIC
// The page is a giant engineering schematic. Hero is a node graph showing
// how Claudomat operates. Sections hang off the graph as labeled blocks.

function W4Schematic() {
  return (
    <div className="crt">
      <div className="crt-glass" />
      <MuthurHeader screen="04" designation="SCHEMATIC.CLAUDOMAT.REV-06" />

      <div style={{ padding: '20px 32px 0' }}>
        <div className="crt-spread">
          <div>
            <div className="crt-tiny crt-uc crt-dim">DRAWING NO. CL-26-04 · SHEET 1 OF 1</div>
            <div className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 72, lineHeight: 0.95 }}>
              CLAUDOMAT
            </div>
            <div className="crt-display crt-amber" style={{ fontSize: 22, opacity: 0.7 }}>
              // SCHEMATIC OF A ONE-PERSON COMPANY
            </div>
          </div>
          <div className="crt-stack crt-tiny crt-uc crt-dim" style={{ alignItems: 'flex-end', gap: 4 }}>
            <span>SCALE 1:1</span>
            <span>TOLERANCE ± TASTE</span>
            <span>APPROVED <span className="crt-amber">[MU/TH/UR]</span></span>
            <span>SIGNED <span className="crt-amber">[OPERATOR ?]</span></span>
          </div>
        </div>
      </div>

      {/* SCHEMATIC */}
      <div style={{ padding: '24px 32px', position: 'relative' }}>
        <div className="crt-frame crt-frame-corners crt-dotgrid" style={{ padding: 28, position: 'relative', minHeight: 460 }}>
          <svg viewBox="0 0 1000 460" style={{ width: '100%', height: 460, display: 'block' }}>
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="#ff7a2a" />
              </marker>
              <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,122,42,0.18)" strokeWidth="1"/>
              </pattern>
            </defs>

            {/* outer dotted frame */}
            <rect x="2" y="2" width="996" height="456" fill="none" stroke="rgba(255,122,42,0.18)" strokeDasharray="2 4"/>

            {/* FOUNDER node */}
            <g>
              <rect x="30" y="200" width="140" height="60" fill="rgba(255,122,42,0.1)" stroke="#ff7a2a"/>
              <text x="100" y="225" fill="#ff7a2a" fontFamily="VT323" fontSize="22" textAnchor="middle">FOUNDER</text>
              <text x="100" y="245" fill="#8a6a4a" fontFamily="IBM Plex Mono" fontSize="9" textAnchor="middle">// you · intent</text>
            </g>

            {/* MUTHUR core */}
            <g>
              <rect x="380" y="140" width="240" height="180" fill="url(#hatch)" stroke="#ff7a2a" strokeWidth="2"/>
              <rect x="394" y="154" width="212" height="152" fill="rgba(10,8,7,0.85)" stroke="#ff7a2a"/>
              <text x="500" y="190" fill="#ff7a2a" fontFamily="VT323" fontSize="32" textAnchor="middle">MU/TH/UR</text>
              <text x="500" y="212" fill="#ff7a2a" fontFamily="VT323" fontSize="22" textAnchor="middle">CLAUDOMAT CORE</text>
              <text x="500" y="232" fill="#8a6a4a" fontFamily="IBM Plex Mono" fontSize="9" textAnchor="middle">framing · spec · planning · ops</text>
              <line x1="410" y1="248" x2="590" y2="248" stroke="#5a4530" strokeDasharray="2 2"/>
              <text x="410" y="268" fill="#8a6a4a" fontFamily="IBM Plex Mono" fontSize="9">▸ work-graph scheduler</text>
              <text x="410" y="282" fill="#8a6a4a" fontFamily="IBM Plex Mono" fontSize="9">▸ taste vector v6.0</text>
              <text x="410" y="296" fill="#8a6a4a" fontFamily="IBM Plex Mono" fontSize="9">▸ founder model</text>
            </g>

            {/* outputs */}
            {[
              ['PRODUCT', 80],
              ['ENGINEERING', 130],
              ['BUSINESS', 180],
              ['OPERATIONS', 230],
              ['GO-TO-MARKET', 280],
              ['GOVERNANCE', 330],
            ].map(([label, y], i)=>(
              <g key={i}>
                <rect x="780" y={y - 16} width="180" height="32" fill="none" stroke="#ff7a2a"/>
                <text x="790" y={y + 5} fill="#ff7a2a" fontFamily="IBM Plex Mono" fontSize="11" letterSpacing="1">▸ {label}</text>
                <line x1="620" y1="230" x2="780" y2={y} stroke="#ff7a2a" strokeWidth="0.6" markerEnd="url(#arrow)"/>
              </g>
            ))}

            {/* founder → core */}
            <line x1="170" y1="230" x2="380" y2="230" stroke="#ff7a2a" strokeWidth="1.2" markerEnd="url(#arrow)"/>
            <text x="240" y="222" fill="#8a6a4a" fontFamily="IBM Plex Mono" fontSize="9">intent + taste</text>

            {/* feedback loop */}
            <path d="M 870 350 Q 500 410 130 280" fill="none" stroke="#ff7a2a" strokeWidth="0.6" strokeDasharray="3 3" markerEnd="url(#arrow)"/>
            <text x="500" y="408" fill="#8a6a4a" fontFamily="IBM Plex Mono" fontSize="9" textAnchor="middle">// observability + feedback loop</text>

            {/* legend */}
            <g transform="translate(30, 380)">
              <text fill="#8a6a4a" fontFamily="IBM Plex Mono" fontSize="9">LEGEND</text>
              <rect x="0" y="10" width="14" height="10" fill="rgba(255,122,42,0.1)" stroke="#ff7a2a"/>
              <text x="22" y="19" fill="#8a6a4a" fontFamily="IBM Plex Mono" fontSize="9">human input</text>
              <rect x="120" y="10" width="14" height="10" fill="url(#hatch)" stroke="#ff7a2a"/>
              <text x="142" y="19" fill="#8a6a4a" fontFamily="IBM Plex Mono" fontSize="9">automated subsystem</text>
              <line x1="290" y1="15" x2="320" y2="15" stroke="#ff7a2a" strokeDasharray="3 3"/>
              <text x="328" y="19" fill="#8a6a4a" fontFamily="IBM Plex Mono" fontSize="9">feedback</text>
            </g>
          </svg>
        </div>
      </div>

      {/* CALLOUTS BAND */}
      <div style={{ padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 8 }}>
        <div className="crt-panel">
          <div className="crt-panel-head"><span>◆ NODE A · INPUT</span><LED kind="ok" label="LIVE" /></div>
          <div className="crt-lg crt-glow">FOUNDER INTENT</div>
          <div className="crt-sm crt-dim">You bring the seed. Taste, judgment, and the “why”. Everything else is downstream.</div>
        </div>
        <div className="crt-panel">
          <div className="crt-panel-head"><span>◆ NODE B · CORE</span><LED kind="ok" label="6.0.0" /></div>
          <div className="crt-lg crt-glow">CLAUDOMAT CORE</div>
          <div className="crt-sm crt-dim">A persistent operator. Frames the problem, writes specs, builds the work graph, dispatches agents.</div>
        </div>
        <div className="crt-panel">
          <div className="crt-panel-head"><span>◆ NODE C · OUTPUT</span><LED kind="warn" label="DELIVERABLE" /></div>
          <div className="crt-lg crt-glow">A RUNNING COMPANY</div>
          <div className="crt-sm crt-dim">Not a deck, not a prototype. A live system across product, business, and operations.</div>
        </div>
      </div>

      {/* SUBSYSTEMS */}
      <div style={{ padding: '36px 32px 8px' }}>
        <div className="crt-panel-head"><span>◆ SUBSYSTEM SHEET · 06 SUBSYSTEMS</span><span>REV-06</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {CAPABILITIES.map(c => (
            <div key={c.code} className="crt-frame" style={{ padding: 14, position: 'relative' }}>
              <div className="crt-spread crt-tiny crt-uc crt-dim" style={{ marginBottom: 6 }}>
                <span>◆ {c.code}</span>
                <span>// SUBSYS</span>
              </div>
              <div className="crt-amber crt-uc crt-xl crt-glow">{c.area}</div>
              <hr className="crt-rule" style={{ margin: '8px 0' }}/>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {c.items.map(it => (
                  <li key={it} className="crt-sm" style={{ padding: '2px 0' }}>
                    <span className="crt-amber">▸</span> {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* PAINS as FAILURE MODES */}
      <div style={{ padding: '24px 32px 0' }}>
        <div className="crt-panel-head"><span>◆ FAILURE MODES (FMEA)</span><span>SEVERITY · LIKELIHOOD</span></div>
        <table className="crt-mono crt-sm" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr className="crt-tiny crt-uc crt-dim" style={{ textAlign: 'left' }}>
              <th style={{ borderBottom: '1px solid var(--crt-line)', padding: '6px 8px' }}>CODE</th>
              <th style={{ borderBottom: '1px solid var(--crt-line)', padding: '6px 8px' }}>MODE</th>
              <th style={{ borderBottom: '1px solid var(--crt-line)', padding: '6px 8px' }}>EFFECT</th>
              <th style={{ borderBottom: '1px solid var(--crt-line)', padding: '6px 8px' }}>SEV</th>
              <th style={{ borderBottom: '1px solid var(--crt-line)', padding: '6px 8px' }}>MITIGATION</th>
            </tr>
          </thead>
          <tbody>
            {PAINS.map((p, i) => (
              <tr key={p.code}>
                <td style={{ padding: '8px', borderBottom: '1px dashed var(--crt-line)', verticalAlign: 'top' }} className="crt-amber">{p.code}</td>
                <td style={{ padding: '8px', borderBottom: '1px dashed var(--crt-line)', verticalAlign: 'top' }}>{p.title}</td>
                <td style={{ padding: '8px', borderBottom: '1px dashed var(--crt-line)', verticalAlign: 'top' }} className="crt-dim">{p.body}</td>
                <td style={{ padding: '8px', borderBottom: '1px dashed var(--crt-line)', verticalAlign: 'top' }} className="crt-warn">{['HI','HI','MED','HI'][i]}</td>
                <td style={{ padding: '8px', borderBottom: '1px dashed var(--crt-line)', verticalAlign: 'top' }} className="crt-amber">CLAUDOMAT</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div style={{ padding: '36px 32px 24px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        <div className="crt-panel">
          <div className="crt-panel-head"><span>◆ COMMISSIONING REQUEST</span><LED kind="ok" label="OPEN"/></div>
          <div className="crt-row" style={{ gap: 10 }}>
            <input className="crt-input" placeholder="operator@designation.io" />
            <button className="crt-btn">▸ REQUEST EARLY ACCESS</button>
          </div>
          <div className="crt-tiny crt-dim" style={{ marginTop: 8 }}>// Signed receipts arrive within 72 standard hours.</div>
        </div>
        <div className="crt-panel">
          <div className="crt-panel-head"><span>◆ DRAWING REVISIONS</span></div>
          <div className="crt-tiny crt-dim crt-uc">REV-04 · added GOVERNANCE node</div>
          <div className="crt-tiny crt-dim crt-uc">REV-05 · pruned COPILOT branch</div>
          <div className="crt-tiny crt-amber crt-uc">REV-06 · taste vector calibrated</div>
        </div>
      </div>

      <Marquee items={EASTER} />
      <div style={{ padding: '12px 24px' }} className="crt-spread crt-tiny crt-uc crt-dim">
        <span>◆ DRAWN BY MU/TH/UR · CHECKED BY OPERATOR</span>
        <span>END OF SHEET <Cursor thin/></span>
      </div>
    </div>
  );
}
window.W4Schematic = W4Schematic;
