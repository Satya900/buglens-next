const lessons = [
  {
    tag: "Architecture",
    text: "Never call the database directly from route handlers. Always go through the service layer in /lib/services.",
  },
  {
    tag: "Security",
    text: "All user-facing file uploads must validate MIME type server-side. Do not trust the Content-Type header.",
  },
  {
    tag: "Patterns",
    text: "Async functions that can fail must return a Result type. No bare try/catch at the call site.",
  },
];

export default function KnowledgeBaseSection() {
  return (
    <section className="section kb-section">
      <div className="kb-inner">
        <div className="kb-left">
          <div className="section-eyebrow">{"// knowledge base"}</div>
          <h2 className="kb-title">
            BugLens learns<br /><em>your rules</em>
          </h2>
          <p className="kb-desc">
            Write team conventions once as Lessons. BugLens applies them to every
            PR — catching violations your senior devs would flag, without needing
            them to review every diff.
          </p>
          <div className="kb-stats">
            <div className="kb-stat">
              <span className="kb-stat-num">0</span>
              <span className="kb-stat-label">config files needed</span>
            </div>
            <div className="kb-stat">
              <span className="kb-stat-num">∞</span>
              <span className="kb-stat-label">rules you can teach</span>
            </div>
          </div>
          <a href="/login" className="btn-primary kb-cta">
            Start teaching BugLens →
          </a>
        </div>

        <div className="kb-right">
          <div className="kb-lessons-header">
            <span className="kb-lessons-label">Your team&apos;s lessons</span>
            <span className="kb-lessons-count">3 active</span>
          </div>
          {lessons.map((lesson, i) => (
            <div key={i} className="kb-lesson-card">
              <span className="kb-lesson-tag">{lesson.tag}</span>
              <p className="kb-lesson-text">{lesson.text}</p>
            </div>
          ))}
          <div className="kb-lesson-card kb-lesson-add">
            <span className="kb-add-icon">+</span>
            <span className="kb-add-text">Add a lesson...</span>
          </div>
        </div>
      </div>
    </section>
  );
}
