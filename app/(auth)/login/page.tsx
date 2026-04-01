'use client'

import { signInWithGitHub } from '../actions'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import BugLensMark from '@/components/BugLensMark'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon" style={{ background: 'transparent', border: 'none' }}>
            <BugLensMark size={48} />
          </div>
          <h1 className="auth-title">Welcome to <em>Buglens</em></h1>
          <p className="auth-subtitle">
            GitHub OAuth only. GitHub is the identity for developers.
          </p>
        </div>

        <div className="auth-content">
          <button
            onClick={() => signInWithGitHub()}
            className="btn-github"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            Continue with GitHub
          </button>

          {error && <div className="auth-error">{error}</div>}
        </div>

        <div className="auth-info">
          <div className="info-item">
            <span className="dot"></span>
            Redirect to /onboarding on first login
          </div>
          <div className="info-item">
            <span className="dot"></span>
            Redirect to /dashboard on return
          </div>
        </div>

        <div className="auth-footer">
          <p>By continuing, you agree to Buglens&apos;s Terms and Privacy Policy.</p>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: calc(100vh - 56px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--bg);
          position: relative;
        }

        .auth-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(34, 197, 94, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .auth-card {
          width: 100%;
          max-width: 400px;
          background: var(--surface);
          border: 1px solid var(--border-bright);
          border-radius: 12px;
          padding: 3rem 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          position: relative;
          z-index: 1;
          animation: fadeUp 0.6s ease-out;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-icon {
          width: 48px;
          height: 48px;
          background: var(--green-muted);
          border: 1px solid var(--border-bright);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: var(--green);
        }

        .auth-icon svg {
          width: 24px;
          height: 24px;
        }

        .auth-title {
          font-family: var(--serif);
          font-size: 28px;
          color: var(--text);
          margin-bottom: 0.75rem;
        }

        .auth-title em {
          color: var(--green);
          font-style: italic;
        }

        .auth-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .auth-content {
          margin-bottom: 2rem;
        }

        .btn-github {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: var(--text);
          color: var(--bg);
          border: none;
          border-radius: 6px;
          padding: 12px;
          font-family: var(--mono);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-github:hover {
          background: #fff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
        }

        .btn-github svg {
          width: 20px;
          height: 20px;
        }

        .auth-error {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 6px;
          color: #f87171;
          font-size: 13px;
          text-align: center;
        }

        .auth-info {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-family: var(--mono);
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--text-dim);
        }

        .auth-footer {
          margin-top: 2.5rem;
          text-align: center;
          font-size: 11px;
          color: var(--text-dim);
          line-height: 1.5;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
