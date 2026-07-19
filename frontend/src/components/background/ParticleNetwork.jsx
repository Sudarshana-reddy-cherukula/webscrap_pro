import { useRef, useEffect, useCallback } from 'react'
import useReducedMotion from './useReducedMotion'
import usePageVisibility from './usePageVisibility'

const CONNECTION_COLOR = [99, 102, 241]
const CELL_SIZE = 150
const MAX_TRAIL = 40
const TRAIL_SPAWN_INTERVAL = 2

function createParticle(w, h) {
  const speed = 0.15 + Math.random() * 0.25
  const angle = Math.random() * Math.PI * 2
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 0.5 + Math.random() * 2,
    baseAlpha: 0.15 + Math.random() * 0.3,
    alpha: 0,
    glowBoost: 0,
  }
}

function createTrailDot(x, y) {
  const angle = Math.random() * Math.PI * 2
  const speed = 0.3 + Math.random() * 0.6
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 1 + Math.random() * 1.5,
    alpha: 0.6 + Math.random() * 0.3,
    life: 1,
    decay: 0.008 + Math.random() * 0.012,
  }
}

function buildGrid(particles, w, h) {
  const cols = Math.ceil(w / CELL_SIZE)
  const rows = Math.ceil(h / CELL_SIZE)
  const grid = new Array(cols * rows)
  for (let i = 0; i < grid.length; i++) grid[i] = []
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    const col = Math.min(Math.floor(p.x / CELL_SIZE), cols - 1)
    const row = Math.min(Math.floor(p.y / CELL_SIZE), rows - 1)
    grid[row * cols + col].push(i)
  }
  return { grid, cols, rows }
}

function getNeighbors(grid, cols, rows, col, row) {
  const result = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr
      const c = col + dc
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const cell = grid[r * cols + c]
        for (let k = 0; k < cell.length; k++) result.push(cell[k])
      }
    }
  }
  return result
}

export default function ParticleNetwork({
  particleCount = 80,
  connectionDistance = 120,
  mouseRadius = 200,
  className = '',
}) {
  const canvasRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const isVisible = usePageVisibility()
  const stateRef = useRef(null)

  const initState = useCallback((canvas) => {
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    ctx.scale(dpr, dpr)

    const isDark = document.documentElement.classList.contains('dark')
    const particles = []
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(w, h))
    }

    return {
      ctx,
      w,
      h,
      dpr,
      particles,
      isDark,
      mouse: { x: -1000, y: -1000, prevX: -1000, prevY: -1000, active: false },
      ripples: [],
      trail: [],
      trailCounter: 0,
      lastMouseMove: 0,
      animId: null,
    }
  }, [particleCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const s = initState(canvas)
    stateRef.current = s

    const onMouseMove = (e) => {
      s.mouse.prevX = s.mouse.x
      s.mouse.prevY = s.mouse.y
      s.mouse.x = e.clientX
      s.mouse.y = e.clientY
      s.mouse.active = true
      s.lastMouseMove = Date.now()
      if (s.ripples.length < 5) {
        s.ripples.push({ x: e.clientX, y: e.clientY, radius: 0, alpha: 0.25, born: Date.now() })
      }
      s.trailCounter++
      if (s.trailCounter % TRAIL_SPAWN_INTERVAL === 0 && s.trail.length < MAX_TRAIL) {
        s.trail.push(createTrailDot(e.clientX, e.clientY))
      }
    }
    const onMouseLeave = () => { s.mouse.active = false }
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        s.mouse.prevX = s.mouse.x
        s.mouse.prevY = s.mouse.y
        s.mouse.x = e.touches[0].clientX
        s.mouse.y = e.touches[0].clientY
        s.mouse.active = true
        s.lastMouseMove = Date.now()
        s.trailCounter++
        if (s.trailCounter % TRAIL_SPAWN_INTERVAL === 0 && s.trail.length < MAX_TRAIL) {
          s.trail.push(createTrailDot(e.touches[0].clientX, e.touches[0].clientY))
        }
      }
    }
    const onTouchEnd = () => { s.mouse.active = false }

    const onResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      s.w = window.innerWidth
      s.h = window.innerHeight
      canvas.width = s.w * dpr
      canvas.height = s.h * dpr
      canvas.style.width = s.w + 'px'
      canvas.style.height = s.h + 'px'
      s.ctx.setTransform(1, 0, 0, 1, 0, 0)
      s.ctx.scale(dpr, dpr)
      s.dpr = dpr
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('resize', onResize)

    const animate = () => {
      if (!isVisible) {
        s.animId = requestAnimationFrame(animate)
        return
      }

      const { ctx, w, h, particles, mouse, ripples, trail } = s

      ctx.clearRect(0, 0, w, h)

      if (mouse.active && Date.now() - s.lastMouseMove > 3000) {
        mouse.active = false
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        const t = trail[i]
        t.x += t.vx
        t.y += t.vy
        t.vx *= 0.97
        t.vy *= 0.97
        t.life -= t.decay
        if (t.life <= 0) {
          trail.splice(i, 1)
          continue
        }
        const a = t.alpha * t.life
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size * t.life, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${a})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size * t.life * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99,102,241,${a * 0.15})`
        ctx.fill()
      }

      const grid = buildGrid(particles, w, h)
      const { cols, rows } = grid

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (!reducedMotion) {
          if (mouse.active) {
            const dx = mouse.x - p.x
            const dy = mouse.y - p.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < mouseRadius && dist > 0) {
              const norm = dist / mouseRadius
              if (dist > 60) {
                const attract = (1 - norm) * 0.04
                p.vx += (dx / dist) * attract
                p.vy += (dy / dist) * attract
              } else {
                const repel = (1 - dist / 60) * 0.4
                p.vx -= (dx / dist) * repel
                p.vy -= (dy / dist) * repel
              }
              p.glowBoost = Math.max(p.glowBoost, (1 - norm) * 0.6)
            }
          }

          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.995
          p.vy *= 0.995

          if (p.x < -10) p.x = w + 10
          else if (p.x > w + 10) p.x = -10
          if (p.y < -10) p.y = h + 10
          else if (p.y > h + 10) p.y = -10
        }

        p.glowBoost *= 0.95
        p.alpha = p.baseAlpha + p.glowBoost
        const finalSize = p.size + p.glowBoost * 2

        ctx.beginPath()
        ctx.arc(p.x, p.y, finalSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`
        ctx.fill()

        if (p.glowBoost > 0.05) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, finalSize * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(99,102,241,${p.glowBoost * 0.3})`
          ctx.fill()
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const col = Math.min(Math.floor(p.x / CELL_SIZE), cols - 1)
        const row = Math.min(Math.floor(p.y / CELL_SIZE), rows - 1)
        const neighbors = getNeighbors(grid, cols, rows, col, row)

        for (let k = 0; k < neighbors.length; k++) {
          const j = neighbors[k]
          if (j <= i) continue
          const q = particles[j]
          const dx = q.x - p.x
          const dy = q.y - p.y
          const dist = dx * dx + dy * dy
          const maxDist = connectionDistance * connectionDistance

          if (dist < maxDist) {
            const distSqrt = Math.sqrt(dist)
            const fade = 1 - distSqrt / connectionDistance
            const avgGlow = (p.glowBoost + q.glowBoost) * 0.5
            const lineAlpha = fade * 0.18 * (1 + avgGlow * 2)

            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(${CONNECTION_COLOR[0]},${CONNECTION_COLOR[1]},${CONNECTION_COLOR[2]},${lineAlpha})`
            ctx.lineWidth = 0.5 + fade * 0.5
            ctx.stroke()
          }
        }

        if (mouse.active) {
          const mdx = mouse.x - p.x
          const mdy = mouse.y - p.y
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
          if (mDist < mouseRadius && mDist > 0) {
            const fade = 1 - mDist / mouseRadius
            const lineAlpha = fade * 0.2 * (1 + p.glowBoost)
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.strokeStyle = `rgba(${CONNECTION_COLOR[0]},${CONNECTION_COLOR[1]},${CONNECTION_COLOR[2]},${lineAlpha})`
            ctx.lineWidth = 0.3 + fade * 0.4
            ctx.stroke()
          }
        }
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        const age = (Date.now() - r.born) / 1000
        r.radius = age * 120
        r.alpha = Math.max(0, 0.25 - age * 0.25)
        if (r.alpha <= 0) {
          ripples.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(99,102,241,${r.alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      if (mouse.active) {
        const cursorAge = (Date.now() - s.lastMouseMove) / 1000
        if (cursorAge < 3) {
          const fade = Math.max(0, 1 - cursorAge / 3)
          const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 100)
          grad.addColorStop(0, `rgba(99,102,241,${0.08 * fade})`)
          grad.addColorStop(0.5, `rgba(6,182,212,${0.04 * fade})`)
          grad.addColorStop(1, 'rgba(99,102,241,0)')
          ctx.beginPath()
          ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()
        }
      }

      s.animId = requestAnimationFrame(animate)
    }

    s.animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(s.animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', onResize)
    }
  }, [initState, reducedMotion, isVisible, connectionDistance, mouseRadius])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      aria-hidden="true"
    />
  )
}
