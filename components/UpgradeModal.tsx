'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function UpgradeModal({ show }: { show: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (show) {
      setIsOpen(true)
    }
  }, [show])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(0,0,0,0.7)'
    }}>
      <div style={{
        maxWidth: 440,
        width: '100%',
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px var(--green-glow)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Glow Effect */}
        <div style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          background: 'var(--green)',
          opacity: 0.1,
          filter: 'blur(50px)',
          borderRadius: '50%'
        }} />

        <div style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            background: 'var(--green-muted)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            border: '1px solid var(--green-muted)'
          }}>
            <span style={{ fontSize: 24 }}>🛡️</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text)' }}>
            Usage Limit Reached
          </h2>
          
          <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '2rem' }}>
            You've successfully used all your available PR reviews for this month. 
            Upgrade to **Pro** to get unlimited reviews, priority analysis, and support for private repositories.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              href={`/api/checkout/dodo?productId=${process.env.NEXT_PUBLIC_DODO_STARTER_PRODUCT_ID}`}
              className="btn-primary"
              style={{ padding: '12px', textDecoration: 'none', textAlign: 'center', fontWeight: 600 }}
              onClick={() => setIsOpen(false)}
            >
              🚀 Upgrade to Starter for $19
            </Link>
            
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: 12,
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
        
        <div style={{ background: 'var(--surface2)', padding: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            Your usage will automatically reset at the start of next month.
          </p>
        </div>
      </div>
    </div>
  )
}
