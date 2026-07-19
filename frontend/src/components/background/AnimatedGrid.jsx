import useReducedMotion from './useReducedMotion'

export default function AnimatedGrid() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className={reducedMotion ? '' : 'animate-grid-shift'}
        style={{
          position: 'absolute',
          inset: '-20px',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.5,
        }}
      />
    </div>
  )
}
