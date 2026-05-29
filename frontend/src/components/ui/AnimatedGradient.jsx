import { useEffect, useRef } from 'react'

function AnimatedGradient({ className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let angle = 0
    const interval = setInterval(() => {
      angle = (angle + 0.3) % 360
      el.style.background = `linear-gradient(${angle}deg, rgba(6,182,212,0.12), rgba(59,130,246,0.08), rgba(168,85,247,0.12), rgba(236,72,153,0.08), rgba(6,182,212,0.12))`
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={ref}
      className={`pointer-events-none fixed inset-0 -z-10 ${className}`}
      aria-hidden="true"
    />
  )
}

export default AnimatedGradient
