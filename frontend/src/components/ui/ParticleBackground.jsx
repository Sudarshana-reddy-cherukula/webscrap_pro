import { useRef, useEffect } from 'react'

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#22d3ee']

export default function ParticleBackground({ particleCount = 50, interactive = true }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId, w, h, onMouse
    const particles = []
    const mouse = interactive ? { x: -1000, y: -1000 } : null

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2.5 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.3 + 0.1,
      })
    }

    if (interactive) {
      onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
      window.addEventListener('mousemove', onMouse)
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        if (interactive && mouse) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200) {
            const force = (200 - dist) / 200
            p.vx += (dx / dist || 0) * force * 0.02
            p.vy += (dy / dist || 0) * force * 0.02
          }
        }
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.99; p.vy *= 0.99
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha
        ctx.fill()
      }
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      if (interactive) window.removeEventListener('mousemove', onMouse)
    }
  }, [particleCount, interactive])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
}
