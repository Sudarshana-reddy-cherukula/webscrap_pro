const colorMap = {
  indigo: 'rgba(99,102,241,0.08)',
  violet: 'rgba(139,92,246,0.07)',
  cyan: 'rgba(6,182,212,0.07)',
  purple: 'rgba(79,70,229,0.06)',
  blue: 'rgba(59,130,246,0.06)',
}

const positionMap = {
  left: 'radial-gradient(ellipse at 20% 50%, COLOR, transparent 70%)',
  right: 'radial-gradient(ellipse at 80% 50%, COLOR, transparent 70%)',
  center: 'radial-gradient(ellipse at 50% 50%, COLOR, transparent 70%)',
  'top-left': 'radial-gradient(ellipse at 20% 20%, COLOR, transparent 70%)',
  'top-right': 'radial-gradient(ellipse at 80% 20%, COLOR, transparent 70%)',
  'bottom-center': 'radial-gradient(ellipse at 50% 80%, COLOR, transparent 70%)',
}

export default function SectionGlow({ color = 'indigo', position = 'center', className = '' }) {
  const gradient = (positionMap[position] || positionMap.center).replace('COLOR', colorMap[color] || colorMap.indigo)

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ background: gradient }}
      aria-hidden="true"
    />
  )
}
