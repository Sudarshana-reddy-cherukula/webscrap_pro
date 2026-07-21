import useReducedMotion from './useReducedMotion'
import useIsDark from '@/hooks/useIsDark'

export default function AnimatedGradientLayer() {
  const reducedMotion = useReducedMotion()
  const isDark = useIsDark()

  const a = isDark ? 1 : 1.8

  if (reducedMotion) {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(99,102,241,${0.08 * a}), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,${0.06 * a}), transparent 60%)`,
        }}
        aria-hidden="true"
      />
    )
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 animate-gradient-rotate"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, rgba(99,102,241,${0.08 * a}) 0deg, rgba(139,92,246,${0.06 * a}) 90deg, rgba(6,182,212,${0.07 * a}) 180deg, rgba(79,70,229,${0.04 * a}) 270deg, rgba(99,102,241,${0.08 * a}) 360deg)`,
          width: '200vmax',
          height: '200vmax',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          animationDuration: '30s',
        }}
      />
    </div>
  )
}
