'use client'

import { useState } from 'react'
import { completeOnboarding } from '../actions'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    id: 1,
    title: 'Welcome',
    description: 'BugLens is now an independent AI reviewer. No manual webhooks required.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Install App',
    description: 'Grant BugLens access to your repositories to start reviewing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Ready',
    description: 'Start managing your reviews and usage directly from the dashboard.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const finishOnboarding = async () => {
    setLoading(true)
    try {
      await completeOnboarding()
      router.push('/dashboard')
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-progress">
          {STEPS.map((step) => (
            <div 
              key={step.id} 
              className={`progress-step ${currentStep >= step.id ? 'active' : ''}`}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-label">{step.title}</div>
            </div>
          ))}
        </div>

        <div className="onboarding-content">
          <div className="step-icon">
            {STEPS[currentStep - 1].icon}
          </div>
          <h1 className="step-title">{STEPS[currentStep - 1].title}</h1>
          <p className="step-description">
            {STEPS[currentStep - 1].description}
          </p>

          <div className="step-actions">
            {currentStep === 1 && (
              <button onClick={handleNext} className="btn-primary">
                Get Started →
              </button>
            )}
            
            {currentStep === 2 && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <a 
                  href="https://github.com/apps/buglensai/installations/new" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary"
                  style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
                >
                  Configure GitHub App
                </a>
                <button onClick={handleNext} className="btn-ghost" style={{ width: '100%', fontSize: 11 }}>
                  I've installed it
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <button 
                onClick={finishOnboarding} 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Entering Dashboard...' : 'Launch App →'}
              </button>
            )}
            
            <button 
              onClick={finishOnboarding} 
              className="btn-skip"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .onboarding-container {
          min-height: calc(100vh - 56px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--bg);
        }

        .onboarding-card {
          width: 100%;
          max-width: 520px;
          background: var(--surface);
          border: 1px solid var(--border-bright);
          border-radius: 20px;
          padding: 4rem 3rem;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
          position: relative;
          overflow: hidden;
        }

        .onboarding-card::before {
          content: "";
          position: absolute;
          top: -50px;
          left: -50px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, var(--green-glow) 0%, transparent 70%);
          pointer-events: none;
        }

        .onboarding-progress {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4rem;
          position: relative;
        }

        .onboarding-progress::before {
          content: "";
          position: absolute;
          top: 16px;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border);
          z-index: 0;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          position: relative;
          z-index: 1;
          flex: 1;
        }

        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--surface2);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text-dim);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-step.active .step-number {
          background: var(--green);
          border-color: var(--green);
          color: #000;
          box-shadow: 0 0 20px var(--green-glow);
          transform: scale(1.1);
        }

        .step-label {
          font-family: var(--mono);
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-dim);
          font-weight: 600;
        }

        .progress-step.active .step-label {
          color: var(--text);
        }

        .onboarding-content {
          text-align: center;
          animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .step-icon {
          width: 80px;
          height: 80px;
          background: var(--green-muted);
          border: 1px solid var(--border-bright);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          color: var(--green);
        }

        .step-icon svg {
          width: 36px;
          height: 36px;
        }

        .step-title {
          font-family: var(--serif);
          font-size: 36px;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .step-description {
          font-size: 15px;
          color: var(--text-muted);
          max-width: 340px;
          margin: 0 auto 3rem;
          line-height: 1.7;
        }

        .step-actions {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          align-items: center;
        }

        .btn-primary {
          width: 100%;
          font-family: var(--mono);
          font-size: 13px;
          padding: 14px;
          font-weight: 600;
        }

        .btn-skip {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--text-dim);
          background: none;
          border: none;
          text-decoration: underline;
          cursor: pointer;
          opacity: 0.6;
        }

        .btn-skip:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
