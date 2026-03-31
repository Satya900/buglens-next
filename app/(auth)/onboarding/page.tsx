'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { completeOnboarding, getWebhookSecret } from '../actions'
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
    title: 'Secure Configuration',
    description: 'Connect your GitHub App to the BugLens Core engine.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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
  const [webhookSecret, setWebhookSecret] = useState('Fetching...')
  const [copied, setCopied] = useState<string | null>(null)
  
  const webhookUrl = process.env.NEXT_PUBLIC_BUGLENS_CORE_WEBHOOK_URL || 'http://localhost:3001/webhook'
  const router = useRouter()

  useEffect(() => {
    if (currentStep === 2) {
      getWebhookSecret().then(secret => setWebhookSecret(secret || 'No secret found'))
    }
  }, [currentStep])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

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
              <>
                <button onClick={handleNext} className="btn-primary">
                  Install GitHub App →
                </button>
                <p className="hint text-center max-w-[280px]">
                  Grant BugLens access to use AI for reviews.
                </p>
              </>
            )}
            
            {currentStep === 2 && (
              <div className="webhook-config-box">
                <div className="config-item">
                  <label>Webhook URL</label>
                  <div className="copy-field">
                    <input readOnly value={webhookUrl} />
                    <button onClick={() => copyToClipboard(webhookUrl, 'url')}>
                      {copied === 'url' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                
                <div className="config-item">
                  <label>Webhook Secret</label>
                  <div className="copy-field">
                    <input readOnly type="password" value={webhookSecret} />
                    <button onClick={() => copyToClipboard(webhookSecret, 'secret')}>
                      {copied === 'secret' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="alert-banner green" style={{ fontSize: 11, marginBottom: '1.5rem', textAlign: 'left' }}>
                  <span>ℹ</span>
                  <span>Paste these into your GitHub App's "Webhook" settings to enable Secure AI scanning.</span>
                </div>

                <button onClick={handleNext} className="btn-primary">
                  I've configured this →
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <>
                <div className="final-check">
                  <div className="check-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>App Installed</span>
                  </div>
                  <div className="check-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Webhook Secure</span>
                  </div>
                </div>
                <button 
                  onClick={finishOnboarding} 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Finalizing...' : 'Go to Dashboard'}
                </button>
              </>
            )}
            
            <button 
              onClick={finishOnboarding} 
              className="btn-skip"
              disabled={loading}
            >
              Skip setup
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

        .webhook-config-box {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .config-item {
          margin-bottom: 1.25rem;
        }

        .config-item label {
          display: block;
          font-family: var(--mono);
          font-size: 11px;
          color: var(--text-dim);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .copy-field {
          display: flex;
          gap: 0.5rem;
        }

        .copy-field input {
          flex: 1;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          font-family: var(--mono);
          font-size: 13px;
          color: var(--text);
          min-width: 0;
        }

        .copy-field button {
          padding: 0.5rem 1rem;
          background: var(--surface);
          border: 1px solid var(--border-bright);
          border-radius: 4px;
          color: var(--text);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .copy-field button:hover {
          background: var(--border);
        }

        .final-check {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          align-items: center;
        }

        .check-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--green);
          font-family: var(--mono);
          font-size: 12px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hint {
          font-size: 11px;
          color: var(--text-dim);
          margin-top: 0.5rem;
          line-height: 1.5;
        }

        .alert-banner {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        
        .alert-banner.green {
          background: var(--green-muted);
          border: 1px solid var(--green);
          color: var(--green);
        }
      `}</style>
    </div>
  )
}

