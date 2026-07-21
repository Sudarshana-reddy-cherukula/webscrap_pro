import useReducedMotion from './useReducedMotion'
import useIsDark from '@/hooks/useIsDark'

export default function LightRays() {
  const reducedMotion = useReducedMotion()
  const isDark = useIsDark()

  const a = isDark ? 1 : 1.8
  const rays = [
    { width: 300, angle: 15, color: `rgba(99,102,241,${0.03 * a})`, duration: '20s', delay: '0s', left: '-10%' },
    { width: 250, angle: -20, color: `rgba(6,182,212,${0.025 * a})`, duration: '25s', delay: '-7s', left: '30%' },
    { width: 200, angle: 25, color: `rgba(139,92,246,${0.02 * a})`, duration: '22s', delay: '-12s', left: '60%' },
    { width: 180, angle: -10, color: `rgba(99,102,241,${0.02 * a})`, duration: '28s', delay: '-4s', left: '80%' },
  ]

  if (reducedMotion) return null

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      {rays.map((ray, i) => (
        <div
          key={i}
          className="animate-ray-move"
          style={{
            position: 'absolute',
            left: ray.left,
            top: '-20%',
            width: ray.width,
            height: '140%',
            background: `linear-gradient(${ray.angle}deg, transparent, ${ray.color}, transparent)`,
            filter: 'blur(40px)',
            animationDuration: ray.duration,
            animationDelay: ray.delay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  )
}
