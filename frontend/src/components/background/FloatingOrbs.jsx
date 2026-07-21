import useReducedMotion from './useReducedMotion'
import useIsDark from '@/hooks/useIsDark'

const darkOrbs = [
  { size: 400, color: 'rgba(99,102,241,0.06)', x: '15%', y: '20%', duration: '25s', delay: '0s', blur: 100 },
  { size: 300, color: 'rgba(139,92,246,0.05)', x: '75%', y: '30%', duration: '30s', delay: '-5s', blur: 90 },
  { size: 250, color: 'rgba(6,182,212,0.05)', x: '50%', y: '70%', duration: '35s', delay: '-10s', blur: 80 },
  { size: 200, color: 'rgba(79,70,229,0.04)', x: '25%', y: '80%', duration: '28s', delay: '-8s', blur: 70 },
  { size: 150, color: 'rgba(6,182,212,0.04)', x: '85%', y: '65%', duration: '22s', delay: '-3s', blur: 60 },
  { size: 180, color: 'rgba(139,92,246,0.03)', x: '40%', y: '10%', duration: '32s', delay: '-12s', blur: 75 },
  { size: 120, color: 'rgba(99,102,241,0.04)', x: '60%', y: '45%', duration: '26s', delay: '-7s', blur: 50 },
]

const lightOrbs = [
  { size: 400, color: 'rgba(99,102,241,0.1)', x: '15%', y: '20%', duration: '25s', delay: '0s', blur: 100 },
  { size: 300, color: 'rgba(139,92,246,0.08)', x: '75%', y: '30%', duration: '30s', delay: '-5s', blur: 90 },
  { size: 250, color: 'rgba(6,182,212,0.08)', x: '50%', y: '70%', duration: '35s', delay: '-10s', blur: 80 },
  { size: 200, color: 'rgba(79,70,229,0.07)', x: '25%', y: '80%', duration: '28s', delay: '-8s', blur: 70 },
  { size: 150, color: 'rgba(6,182,212,0.06)', x: '85%', y: '65%', duration: '22s', delay: '-3s', blur: 60 },
  { size: 180, color: 'rgba(139,92,246,0.05)', x: '40%', y: '10%', duration: '32s', delay: '-12s', blur: 75 },
  { size: 120, color: 'rgba(99,102,241,0.06)', x: '60%', y: '45%', duration: '26s', delay: '-7s', blur: 50 },
]

export default function FloatingOrbs() {
  const reducedMotion = useReducedMotion()
  const isDark = useIsDark()
  const orbs = isDark ? darkOrbs : lightOrbs

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={reducedMotion ? '' : `animate-orb-float-${(i % 5) + 1}`}
          style={{
            position: 'absolute',
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: orb.color,
            filter: `blur(${orb.blur}px)`,
            animationDuration: orb.duration,
            animationDelay: orb.delay,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            transform: reducedMotion ? 'translate(-50%, -50%)' : undefined,
          }}
        />
      ))}
    </div>
  )
}
