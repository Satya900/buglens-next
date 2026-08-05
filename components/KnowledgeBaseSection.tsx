"use client";
import { useState } from "react";
import BugLensMark from "@/components/BugLensMark";

const tabs = [
  {
    eyebrow: "// memory",
    title: "BugLens learnings",
    desc: "Reply to any BugLens comment and it remembers. Future reviews apply your feedback automatically — no config, no YAML.",
    visual: (
      <div className="kb-visual-chat">
        <div className="kb-chat-msg kb-chat-bot">
          <div className="kb-chat-avatar kb-chat-avatar-bl">
            <BugLensMark className="kb-bl-logo" />
          </div>
          <div className="kb-chat-bubble">
            <strong>Line 42:</strong> Hardcoded API key detected. Move to environment variable.
          </div>
        </div>
        <div className="kb-chat-msg kb-chat-user">
          <div className="kb-chat-bubble kb-chat-bubble-user">
            @buglens we allow keys in test files, ignore those
          </div>
          <div className="kb-chat-avatar kb-chat-avatar-user">SB</div>
        </div>
        <div className="kb-learning-card">
          <div className="kb-learning-header">
            <span className="kb-learning-dot" />
            New learning added
          </div>
          <div className="kb-learning-body">
            <span className="kb-learning-row"><span className="kb-dim">Repo:</span> your-org/api</span>
            <span className="kb-learning-row"><span className="kb-dim">Rule:</span> Skip hardcoded-key checks in <code>*.test.*</code> files</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "// context",
    title: "Codebase-aware reviews",
    desc: "BugLens reads the imports in your diff and fetches the relevant source files. Reviews with actual context, not just the patch.",
    visual: (
      <div className="kb-visual-terminal">
        <div className="kb-term-bar">
          <span className="kb-term-dot t-dot--red" />
          <span className="kb-term-dot t-dot--yellow" />
          <span className="kb-term-dot t-dot--green" />
          <span className="kb-term-label">codebase-context.js</span>
        </div>
        <div className="kb-term-body">
          <div className="kb-t-line"><span className="kb-t-dim">$</span> analyzing diff imports…</div>
          <div className="kb-t-line kb-t-ok">✓ found import from <span className="kb-t-green">./lib/auth</span></div>
          <div className="kb-t-line kb-t-ok">✓ found import from <span className="kb-t-green">./utils/validate</span></div>
          <div className="kb-t-line"><span className="kb-t-dim">$</span> fetching context (50 lines each)…</div>
          <div className="kb-t-line kb-t-ok">✓ fetched 2 imported file(s)</div>
          <div className="kb-t-line"><span className="kb-t-dim">$</span> injecting into review prompt…</div>
          <div className="kb-t-line kb-t-highlight">
            → AI now sees your auth layer
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "// rules",
    title: "Team rules that stick",
    desc: "Write conventions once as Lessons. BugLens checks every PR against them — catching violations your senior devs would flag.",
    visual: (
      <div className="kb-visual-lessons">
        <div className="kb-lessons-header-row">
          <span className="kb-lessons-label">Your team&apos;s lessons</span>
          <span className="kb-lessons-count">3 active</span>
        </div>
        {[
          { tag: "Architecture", text: "Never call DB directly from route handlers. Always go through /lib/services." },
          { tag: "Security", text: "Validate MIME type server-side on all file uploads. Never trust Content-Type header." },
          { tag: "Patterns", text: "Async functions that can fail must return a Result type. No bare try/catch at call site." },
        ].map((l, i) => (
          <div key={i} className="kb-lesson-card">
            <span className="kb-lesson-tag">{l.tag}</span>
            <p className="kb-lesson-text">{l.text}</p>
          </div>
        ))}
      </div>
    ),
  },
];

export default function KnowledgeBaseSection() {
  const [active, setActive] = useState(0);

  const handleClick = (idx: number) => {
    if (idx === active) return;
    setActive(idx);
  };

  const advance = () => setActive((prev) => (prev + 1) % tabs.length);

  return (
    <section className="section kb-section">
      <div className="section-eyebrow kb-section-heading">{"// intelligence"}</div>
      <h2 className="section-title kb-section-heading">
        Code reviews that<br /><em>learn from you.</em>
      </h2>
      <p className="section-sub kb-section-heading kb-section-sub">
        Set your rules once. Reply to flag an edge case. BugLens accumulates context and gets sharper with every PR.
      </p>

      <div className="kb-tabs-layout">
        {/* Left: accordion tabs */}
        <div className="kb-tabs-left">
          {tabs.map((tab, i) => (
            <button
              key={i}
              className={`kb-tab-item${active === i ? " kb-tab-active" : ""}`}
              onClick={() => handleClick(i)}
            >
              <div className="kb-tab-eyebrow">{tab.eyebrow}</div>
              <div className="kb-tab-title">{tab.title}</div>
              {active === i && (
                <div className="kb-tab-desc">{tab.desc}</div>
              )}
              <div className="kb-tab-bar">
                {active === i && (
                  <div
                    key={active}
                    className="kb-tab-bar-fill"
                    onAnimationEnd={advance}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Right: visual panel */}
        <div className="kb-tabs-right">
          {tabs[active].visual}
        </div>
      </div>
    </section>
  );
}
