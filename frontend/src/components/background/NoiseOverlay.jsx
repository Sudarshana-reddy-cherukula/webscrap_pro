import { useRef, useEffect } from 'react'
import useReducedMotion from './useReducedMotion'
import usePageVisibility from './usePageVisibility'

export default function NoiseOverlay() {
  const canvasRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const isVisible = usePageVisibility()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reducedMotion) return

    const size = 256
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    let animId
    let lastFrame = 0
    const interval = 100

    const draw = (timestamp) => {
      if (!isVisible) {
        animId = requestAnimationFrame(draw)
        return
      }
      if (timestamp - lastFrame < interval) {
        animId = requestAnimationFrame(draw)
        return
      }
      lastFrame = timestamp

      const imageData = ctx.createImageData(size, size)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 255
      }
      ctx.putImageData(imageData, 0, 0)
      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [reducedMotion, isVisible])

  if (reducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        width: '100%',
        height: '100%',
        opacity: 0.02,
        imageRendering: 'pixelated',
      }}
      aria-hidden="true"
    />
  )
}
