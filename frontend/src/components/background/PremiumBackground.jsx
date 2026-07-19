import ParticleNetwork from './ParticleNetwork'
import AnimatedGradientLayer from './AnimatedGradientLayer'
import FloatingOrbs from './FloatingOrbs'
import AnimatedGrid from './AnimatedGrid'
import LightRays from './LightRays'
import NoiseOverlay from './NoiseOverlay'
import MouseGlow from './MouseGlow'

export default function PremiumBackground({ variant = 'full', className = '' }) {
  const particleCount = variant === 'full' ? 80 : 30

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      aria-hidden="true"
    >
      <AnimatedGradientLayer />
      <FloatingOrbs />
      <AnimatedGrid />
      <ParticleNetwork particleCount={particleCount} />
      <LightRays />
      <NoiseOverlay />
      <MouseGlow />
    </div>
  )
}
