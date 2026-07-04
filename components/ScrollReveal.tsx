'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Section-level reveal: when a <section> (or [data-animate-root]) enters the
 * viewport, every [data-animate] descendant inside it becomes visible at once.
 * Within that group, items can still keep a small `data-delay` for header
 * sequencing (h1 → p → btn). Heavy grids should omit `data-delay` entirely.
 *
 * `js-ready` is added to <html> after pre-pass so SSR/no-JS still shows content.
 */
export default function ScrollReveal() {
  const pathname = usePathname()

  useEffect(() => {
    const reveal = (root: ParentNode) => {
      root
        .querySelectorAll<HTMLElement>('[data-animate]:not([data-visible])')
        .forEach((el) => el.setAttribute('data-visible', ''))
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -64px 0px' }
    )

    const groups = document.querySelectorAll<HTMLElement>(
      'section, [data-animate-root]'
    )

    groups.forEach((g) => {
      if (!g.querySelector('[data-animate]')) return
      const { top, bottom } = g.getBoundingClientRect()
      if (top < window.innerHeight && bottom > 0) {
        reveal(g)
      } else {
        observer.observe(g)
      }
    })

    // Safety net: any [data-animate] outside a section/root.
    document
      .querySelectorAll<HTMLElement>('[data-animate]:not([data-visible])')
      .forEach((el) => {
        if (el.closest('section, [data-animate-root]')) return
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
