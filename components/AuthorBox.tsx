import Image from "next/image";

type Author = {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  linkedIn?: string;
};

const DEFAULT_AUTHORS: Record<string, Author> = {
  "Satyabrata Mohanty": {
    name: "Satyabrata Mohanty",
    title: "Founder & Sr. Platform Engineer",
    bio: "Building BugLens. Formerly built security systems for Postgres at EnginIQ. Focused on RAG architecture and AI-driven code review ergonomics.",
    avatar: "/author-satya.jpg", // We can use a placeholder for now
    linkedIn: "https://linkedin.com/in/satya900",
  },
  "BugLens": {
    name: "BugLens Team",
    title: "The Editorial Team",
    bio: "Technical notes and product announcements directly from the team building the future of AI code review.",
    avatar: "/icon.svg",
  }
};

export default function AuthorBox({ name }: { name: string }) {
  const author = DEFAULT_AUTHORS[name] || DEFAULT_AUTHORS["BugLens"];

  return (
    <section className="author-box" aria-labelledby="about-the-author">
      <h2 id="about-the-author" className="author-box-title">About the author</h2>
      <div className="author-content">
        <div className="author-avatar-wrap">
          {author.avatar.endsWith(".svg") ? (
            <div className="author-avatar-placeholder">
              <Image src={author.avatar} alt={author.name} width={64} height={64} />
            </div>
          ) : (
            <div className="author-avatar">
              <div className="author-avatar-initials">{author.name.charAt(0)}</div>
            </div>
          )}
        </div>
        <div className="author-info">
          <div className="author-header">
            <span className="author-name">{author.name}</span>
            <span className="author-divider"></span>
            <span className="author-job-title">{author.title}</span>
          </div>
          <p className="author-bio">{author.bio}</p>
          {author.linkedIn && (
            <a
              href={author.linkedIn}
              className="author-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              Connect on LinkedIn
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
