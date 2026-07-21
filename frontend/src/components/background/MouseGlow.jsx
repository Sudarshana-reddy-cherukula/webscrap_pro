import { useState, useEffect } from 'react'
import useReducedMotion from './useReducedMotion'
import useIsDark from '@/hooks/useIsDark'

export default function MouseGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [active, setActive] = useState(false)
  const reducedMotion = useReducedMotion()
  const isDark = useIsDark()

  const glowAlpha = isDark ? 0.08 : 0.14
  const glowAlpha2 = isDark ? 0.04 : 0.07

  useEffect(() => {
    if (reducedMotion) return

    let timeout
    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      setActive(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setActive(false), 3000)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      clearTimeout(timeout)
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return (
    <div
      className="pointer-events-none fixed -z-[5]"
      style={{
        left: pos.x - 150,
        top: pos.y - 150,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(99,102,241,${glowAlpha}) 0%, rgba(139,92,246,${glowAlpha2}) 40%, transparent 70%)`,
        opacity: active ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  )
}
