'use client'

import { useState } from 'react'
import Link from 'next/link'
import { completeOnboarding } from '../actions'
import { useRouter } from 'next/navigation'

const STEPS = [
  {
    id: 1,
    title: 'Install GitHub App',
    description: 'Grant Buglens access to your repositories to start reviewing.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Select Repos',
    description: 'Choose which repositories you want Buglens to monitor.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'First Review',
    description: 'Open a test PR and see Buglens in action.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
    await completeOnboarding()
    router.push('/dashboard')
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
                Install App
              </button>
            )}
            {currentStep === 2 && (
              <button onClick={handleNext} className="btn-primary">
                Select Repositories
              </button>
            )}
            {currentStep === 3 && (
              <button 
                onClick={finishOnboarding} 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Finalizing...' : 'Go to Dashboard'}
              </button>
            )}
            
            <button 
              onClick={finishOnboarding} 
              className="btn-skip"
              disabled={loading}
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
          max-width: 600px;
          background: var(--surface);
          border: 1px solid var(--border-bright);
          border-radius: 12px;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
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
          top: 15px;
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
          gap: 0.75rem;
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
          font-size: 12px;
          color: var(--text-dim);
          transition: all 0.3s;
        }

        .progress-step.active .step-number {
          background: var(--green);
          border-color: var(--green);
          color: #000;
          box-shadow: 0 0 15px var(--green-glow);
        }

        .step-label {
          font-family: var(--mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-dim);
          transition: all 0.3s;
        }

        .progress-step.active .step-label {
          color: var(--green);
        }

        .onboarding-content {
          text-align: center;
          animation: fadeIn 0.5s ease-out;
        }

        .step-icon {
          width: 64px;
          height: 64px;
          background: var(--green-muted);
          border: 1px solid var(--border-bright);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: var(--green);
        }

        .step-icon svg {
          width: 32px;
          height: 32px;
        }

        .step-title {
          font-family: var(--serif);
          font-size: 32px;
          color: var(--text);
          margin-bottom: 1rem;
        }

        .step-description {
          font-size: 16px;
          color: var(--text-muted);
          max-width: 400px;
          margin: 0 auto 2.5rem;
          line-height: 1.6;
        }

        .step-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        .btn-skip {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--text-dim);
          text-decoration: underline;
          cursor: pointer;
        }

        .btn-skip:hover {
          color: var(--text-muted);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
