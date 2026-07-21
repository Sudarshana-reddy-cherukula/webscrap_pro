import useReducedMotion from './useReducedMotion'
import useIsDark from '@/hooks/useIsDark'

export default function AnimatedGrid() {
  const reducedMotion = useReducedMotion()
  const isDark = useIsDark()

  const gridColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)'

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className={reducedMotion ? '' : 'animate-grid-shift'}
        style={{
          position: 'absolute',
          inset: '-20px',
          backgroundImage: `
            linear-gradient(${gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.5,
        }}
      />
    </div>
  )
}
