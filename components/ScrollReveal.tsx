'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Mounts once in layout, re-runs on route change.
 * Adds `js-ready` to <html> (enables CSS reveal system) then
 * uses IntersectionObserver to add `data-visible` when elements enter
 * the viewport. Elements visible on initial load are pre-marked so
 * there is no flash-of-invisible-content.
 */
export default function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', '')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    )

    const elements = document.querySelectorAll<HTMLElement>(
      '[data-animate]:not([data-visible])'
    )

    // Pre-mark elements already in view — BEFORE adding js-ready —
    // to prevent any flash of invisible content.
    elements.forEach((el) => {
      const { top, bottom } = el.getBoundingClientRect()
      if (top < window.innerHeight && bottom > 0) {
        el.setAttribute('data-visible', '')
      } else {
        observer.observe(el)
      }
    })

    document.documentElement.classList.add('js-ready')

    return () => observer.disconnect()
  }, [pathname])

  return null
}
