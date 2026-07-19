import { useState, useEffect } from 'react'
import useReducedMotion from './useReducedMotion'

export default function MouseGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [active, setActive] = useState(false)
  const reducedMotion = useReducedMotion()

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
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.04) 40%, transparent 70%)',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  )
}
