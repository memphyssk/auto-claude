// W5 — LIVE SHELL / COMMAND-DRIVEN
// The whole page is a single long terminal session. The user's "scroll" is
// the operator's session. Includes a faux command line where users can
// inspect sections by keyword.

function W5Shell() {
  const [input, setInput] = React.useState('');
  const [echo, setEcho] = React.useState('');
  const fakeRun = (e) => {
    if (e.key === 'Enter') {
      setEcho(input || 'identify');
      setInput('');
    }
  };

  return (
    <div className="crt">
      <div className="crt-glass" />
      <div className="crt-noise" />
      <MuthurHeader screen="05" designation="SHELL · /dev/muthur/tty0" />

      <div style={{ padding: '24px 36px 8px', fontFamily: 'var(--crt-mono)' }}>
        <Line cmd="whoami" out={[
          <span><span className="crt-amber">claudomat</span> · the operating system for one-person companies</span>
        ]}/>
        <Line cmd="cat /etc/motd" out={[
          <span className="crt-display crt-amber crt-glow-strong" style={{ fontSize: 56, lineHeight: 1, display: 'inline-block', margin: '8px 0' }}>
            BUILD ANYTHING. <br/>OPERATE EVERYTHING.
          </span>,
          <span className="crt-dim">// you ideate. claudomat builds the company around it.</span>
        ]}/>

        <Line cmd="claudomat status --verbose" out={[
          <pre className="crt-ascii crt-sm crt-amber" style={{ margin: '4px 0' }}>
{`SYSTEM ............ ONLINE
NODES ............. 6   [PRODUCT · ENG · BIZ · OPS · GTM · GOV]
QUEUE ............. ACCEPTING NEW INTENT
WAITLIST .......... Q2-2026  ▓▓▓▓▓▓▓░░░░░░░  62%`}
          </pre>
        ]}/>

        <Line cmd="claudomat why" out={[
          <div className="crt-lg" style={{ lineHeight: 1.45 }}>
            You can vibe-code the UI with Lovable, v0, Bolt.{' '}
            <span className="crt-amber crt-annot" data-note="screens != systems">But a company is not a screen.</span>{' '}
            It is a graph of decisions, dependencies, and feedback loops. We operate the graph.
          </div>
        ]}/>

        <Line cmd="claudomat list-pains --severity=high" out={[
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
            {PAINS.map(p => (
              <div key={p.code} style={{ padding: 10, border: '1px solid var(--crt-line)' }}>
                <div className="crt-tiny crt-amber crt-uc">▸ {p.code}</div>
                <div className="crt-sm crt-glow" style={{ marginTop: 2 }}>{p.title}</div>
                <div className="crt-tiny crt-dim" style={{ marginTop: 4 }}>{p.body}</div>
              </div>
            ))}
          </div>
        ]}/>

        <Line cmd="claudomat pipeline --diagram" out={[
          <pre className="crt-ascii crt-sm crt-amber" style={{ margin: '4px 0' }}>
{`stdin ─▶ [intake] ─▶ [framing] ─▶ [spec] ─▶ [plan] ─▶ [build] ─▶ [ops] ─▶ stdout
              │                                                │
              └────────────── feedback loop ◀──────────────────┘`}
          </pre>
        ]}/>

        <Line cmd="claudomat capabilities --tree" out={[
          <pre className="crt-ascii crt-sm" style={{ margin: '4px 0', color: 'var(--crt-text)' }}>
{`claudomat/
├── product/       ${CAPABILITIES[0].items.join(' · ')}
├── engineering/   ${CAPABILITIES[1].items.join(' · ')}
├── business/      ${CAPABILITIES[2].items.join(' · ')}
├── operations/    ${CAPABILITIES[3].items.join(' · ')}
├── gtm/           ${CAPABILITIES[4].items.join(' · ')}
└── governance/    ${CAPABILITIES[5].items.join(' · ')}`}
          </pre>
        ]}/>

        <Line cmd="claudomat creed" out={
          MANIFESTO_LINES.map((l, i) => (
            <div key={i} className="crt-sm" style={{ padding: '3px 0' }}>
              <span className="crt-amber">▸</span> {l}
            </div>
          ))
        }/>

        <Line cmd="claudomat manifest --no-marketing" out={[
          <div className="crt-lg crt-glow" style={{ lineHeight: 1.4 }}>
            We are not a copilot. We are not a chat.{' '}
            <span className="crt-amber">We are a chief of staff with shell access</span> to your company.
          </div>
        ]}/>

        <Line cmd="claudomat join --early-access" out={[
          <div className="crt-panel" style={{ marginTop: 6 }}>
            <div className="crt-panel-head"><span>◆ /tmp/claudomat-waitlist.form</span><LED kind="ok" label="OPEN"/></div>
            <div className="crt-row" style={{ gap: 8 }}>
              <input className="crt-input" placeholder="ripley@nostromo.dev"/>
              <button className="crt-btn">▸ TRANSMIT</button>
            </div>
            <div className="crt-tiny crt-dim" style={{ marginTop: 6 }}>// expected reply ≤ 72h</div>
          </div>
        ]}/>

        {echo && (
          <Line cmd={echo} out={[
            <span className="crt-warn">command not implemented in preview · </span>,
            <span className="crt-dim">try: status, why, pipeline, creed, join</span>
          ]}/>
        )}

        <div className="crt-row" style={{ gap: 8, marginTop: 6 }}>
          <span className="crt-amber">operator@claudomat:~$</span>
          <input
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            onKeyDown={fakeRun}
            placeholder="// type a command and press enter"
            style={{
              flex: 1,
              background: 'transparent',
              border: 0,
              outline: 0,
              color: 'var(--crt-text)',
              fontFamily: 'var(--crt-mono)',
              fontSize: 12,
            }}
          />
          <Cursor thin/>
        </div>
      </div>

      <Marquee items={EASTER} />
      <div style={{ padding: '12px 24px' }} className="crt-spread crt-tiny crt-uc crt-dim">
        <span>◆ /dev/muthur/tty0 · uptime 437d 02:14:09</span>
        <span>logout? <Cursor thin/></span>
      </div>
    </div>
  );
}

function Line({ cmd, out }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="crt-row" style={{ gap: 8 }}>
        <span className="crt-amber">operator@claudomat:~$</span>
        <span className="crt-text">{cmd}</span>
      </div>
      <div style={{ padding: '6px 0 0 14px' }}>
        {Array.isArray(out) ? out.map((o, i) => <div key={i}>{o}</div>) : out}
      </div>
    </div>
  );
}

window.W5Shell = W5Shell;
