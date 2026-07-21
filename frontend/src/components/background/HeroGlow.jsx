import useReducedMotion from './useReducedMotion'

const miniParticles = Array.from({ length: 12 }, (_, i) => ({
  size: 2 + Math.random() * 3,
  x: 10 + Math.random() * 80,
  y: 10 + Math.random() * 80,
  duration: 4 + Math.random() * 6,
  delay: Math.random() * -10,
  color: [
    'rgba(99,102,241,0.3)',
    'rgba(139,92,246,0.25)',
    'rgba(6,182,212,0.2)',
    'rgba(79,70,229,0.15)',
  ][i % 4],
}))

export default function HeroGlow() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className={reducedMotion ? '' : 'animate-hero-rotate'}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '800px',
          height: '800px',
          transform: 'translate(-50%, -50%)',
          background: 'conic-gradient(from 0deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08), rgba(6,182,212,0.1), rgba(79,70,229,0.06), rgba(99,102,241,0.12))',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animationDuration: '60s',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {!reducedMotion && miniParticles.map((p, i) => (
        <div
          key={i}
          className="animate-particle-float"
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}

      {[300, 220, 160].map((size, i) => (
        <div
          key={`blur-${i}`}
          className={reducedMotion ? '' : `animate-orb-float-${(i % 5) + 1}`}
          style={{
            position: 'absolute',
            left: `${25 + i * 25}%`,
            top: `${20 + i * 20}%`,
            width: size,
            height: size,
            borderRadius: '50%',
            background: [
              'rgba(99,102,241,0.06)',
              'rgba(139,92,246,0.05)',
              'rgba(6,182,212,0.04)',
            ][i],
            filter: `blur(${60 + i * 10}px)`,
            animationDuration: `${20 + i * 8}s`,
            animationDelay: `${-i * 4}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  )
}
