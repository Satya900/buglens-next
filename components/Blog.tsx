export default function Blog() {
  const posts = [
    {
      tag: "architecture",
      title: "Why I chose LangGraph over LangChain for multi-agent orchestration",
      excerpt: "State machines beat chains when your agents need to loop, retry, and share context. Here's the architecture that drove the decision.",
      author: "Satyabrata Mohanty",
      date: "Mar 28, 2026",
      readTime: "6 min read"
    },
    {
      tag: "deep dive",
      title: "How BugLens uses RAG to review code with your team's own standards",
      excerpt: "Generic LLM reviews are useless without context. Here's how we embed your docs, past PRs, and RFCs into every review.",
      author: "Satyabrata Mohanty",
      date: "Mar 21, 2026",
      readTime: "8 min read"
    },
    {
      tag: "security",
      title: "AST-based SQL injection detection - lessons from EnginIQ",
      excerpt: "Before BugLens, I built EnginIQ to protect Postgres from AI-generated SQL. The same AST techniques now power BugLens's scanner agent.",
      author: "Satyabrata Mohanty",
      date: "Mar 14, 2026",
      readTime: "5 min read"
    },
    {
      tag: "mcp",
      title: "MCP in 2026: why it's the USB-C moment for AI agents",
      excerpt: "Model Context Protocol went from niche spec to the default integration layer for AI tooling. Here's what that means for how we build agents.",
      author: "Satyabrata Mohanty",
      date: "Mar 7, 2026",
      readTime: "4 min read"
    }
  ];

  return (
    <>
      <div className="divider-line"></div>
      <section className="section" id="blog">
        <div className="section-eyebrow">{"// from the builder's log"}</div>
        <h2 className="section-title">Building in <em>public</em></h2>
        <p className="section-sub">Technical deep-dives on AI agents, RAG pipelines, and the engineering decisions behind BugLens.</p>
        <div className="blog-grid">
          {posts.map((post, i) => (
            <article key={i} className="blog-card">
              <span className="blog-tag">{post.tag}</span>
              <div className="blog-title">{post.title}</div>
              <div className="blog-excerpt">{post.excerpt}</div>
              <div className="blog-meta">
                <span>{post.author}</span>
                <span className="blog-meta-dot"></span>
                <span>{post.date}</span>
                <span className="blog-meta-dot"></span>
                <span>{post.readTime}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
