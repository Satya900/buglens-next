'use client'

import { useState } from 'react'

export default function CouponCheckout({ productId }: { productId: string }) {
  const [coupon, setCoupon] = useState('')

  const href = coupon.trim()
    ? `/api/checkout/dodo?productId=${productId}&coupon=${encodeURIComponent(coupon.trim())}`
    : `/api/checkout/dodo?productId=${productId}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={coupon}
          onChange={e => setCoupon(e.target.value)}
          placeholder="Discount code (optional)"
          style={{
            flex: 1,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '7px 10px',
            fontSize: 11,
            color: 'var(--text)',
            outline: 'none',
          }}
        />
      </div>
      <a
        href={href}
        className="btn-primary"
        style={{ width: '100%', fontSize: 12, display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
      >
        Upgrade to Pro
      </a>
    </div>
  )
}
