import { useRef, useEffect } from 'react'

const COLORS = ['6,182,212', '99,102,241', '168,85,247', '14,165,233', '34,211,238']

export default function MovingDots({ count = 80, connectionDistance = 120, className = '' }) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let w, h

    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * (canvas.parentElement?.offsetWidth || window.innerWidth),
      y: Math.random() * (canvas.parentElement?.offsetHeight || window.innerHeight),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.4 + 0.1,
    }))

    const resize = () => {
      const parent = canvas.parentElement
      if (parent) {
        w = parent.offsetWidth
        h = parent.offsetHeight
        canvas.width = w
        canvas.height = h
      }
    }

    resize()
    window.addEventListener('resize', resize)

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse)

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      for (const d of dots) {
        d.x += d.vx
        d.y += d.vy

        if (d.x < 0 || d.x > w) d.vx *= -1
        if (d.y < 0 || d.y > h) d.vy *= -1

        const dx = mouseRef.current.x - d.x
        const dy = mouseRef.current.y - d.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          const force = (150 - dist) / 150
          d.vx -= (dx / dist) * force * 0.02
          d.vy -= (dy / dist) * force * 0.02
        }

        const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy)
        if (speed > 1) {
          d.vx = (d.vx / speed) * 1
          d.vy = (d.vy / speed) * 1
        }

        ctx.beginPath()
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${d.color},${d.alpha})`
        ctx.fill()
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x
          const dy = dots[i].y - dots[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.12
            ctx.beginPath()
            ctx.moveTo(dots[i].x, dots[i].y)
            ctx.lineTo(dots[j].x, dots[j].y)
            ctx.strokeStyle = `rgba(6,182,212,${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [count, connectionDistance])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden="true"
    />
  )
}
