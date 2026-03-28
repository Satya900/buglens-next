export default function Terminal() {
  return (
    <div className="terminal">
      <div className="term-bar">
        <div className="t-dot" style={{ background: "#ff5f56" }}></div>
        <div className="t-dot" style={{ background: "#ffbd2e" }}></div>
        <div className="t-dot" style={{ background: "#27c93f" }}></div>
        <span className="term-title">buglens - PR #142 review</span>
      </div>
      <div className="term-body">
        <div><span className="t-dim">$</span> <span className="t-green">buglens</span> review <span className="t-blue">--pr 142</span></div>
        <div className="t-dim">  Fetching diff... 847 lines changed across 12 files</div>
        <div className="t-dim">  Running Lens agent -&gt; Context agent -&gt; Review agent</div>
        <div>&nbsp;</div>
        <div><span className="t-yellow">[!]</span>  <span style={{ color: "#fde68a" }}>auth/middleware.ts:34</span> <span className="t-dim">- SQL injection risk</span></div>
        <div className="t-dim t-comment">   {"// User input directly interpolated into query string"}</div>
        <div><span className="t-red">[x]</span>  <span style={{ color: "#fca5a5" }}>api/upload.ts:89</span> <span className="t-dim">- No file size validation</span></div>
        <div className="t-dim t-comment">   {"// Max 10MB enforced in docs but not in code (see RFC-22)"}</div>
        <div><span className="t-green">[ok]</span>  <span style={{ color: "#86efac" }}>utils/cache.ts</span> <span className="t-dim">- Matches team caching standard</span></div>
        <div>&nbsp;</div>
        <div><span className="t-green">-&gt;</span>  Posted 3 inline comments to PR #142</div>
        <div><span className="t-green">-&gt;</span>  Severity score: <span className="t-yellow">6.4 / 10</span> | Request changes: <span className="t-red">yes</span></div>
        <div><span className="t-dim">$</span> <span className="cursor"></span></div>
      </div>
    </div>
  );
}
