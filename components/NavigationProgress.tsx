'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import NProgress from 'nprogress'

NProgress.configure({
  minimum: 0.2,
  easing: 'ease',
  speed: 350,
  showSpinner: false,
})

export default function NavigationProgress() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)
  const prevSearch = useRef('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      prevSearch.current = window.location.search
    }
  }, [])

  // Start bar on click of any <a> that leads to a different route
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return
      // same page check
      const targetPath = href.split('?')[0]
      if (targetPath !== pathname) {
        NProgress.start()
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname])

  // Stop bar when route actually changes
  useEffect(() => {
    const currentSearch = typeof window !== 'undefined' ? window.location.search : ''
    if (pathname !== prevPathname.current || currentSearch !== prevSearch.current) {
      NProgress.done()
      prevPathname.current = pathname
      prevSearch.current = currentSearch
    }
  }, [pathname])

  return null
}
