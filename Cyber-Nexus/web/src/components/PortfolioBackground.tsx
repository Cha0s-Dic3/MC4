import { useEffect, useRef } from 'react'
import './PortfolioBackground.css'
import { colors } from '@/constants/colors'

const GRID_SIZE = 40

function Orb({
  color,
  size,
  top,
  left,
  delay = 0,
  duration = 6000,
}: {
  color: string
  size: number
  top: number
  left: number
  delay?: number
  duration?: number
}) {
  return (
    <div
      className="orb"
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 ${size / 2}px ${color}`,
        pointerEvents: 'none',
        animation: `orb-pulse ${duration}ms ease-in-out infinite`,
        animationDelay: `${delay}ms`,
        opacity: 0.5,
      }}
    />
  )
}

export function PortfolioBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const driftRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth + GRID_SIZE * 2
      canvas.height = window.innerHeight + GRID_SIZE * 2
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const drawGrid = (offset: number) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.fillStyle = colors.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = colors.grid
      ctx.lineWidth = 1

      const adjustedOffset = offset % GRID_SIZE

      for (let x = -GRID_SIZE + adjustedOffset; x < canvas.width; x += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = -GRID_SIZE + adjustedOffset; y < canvas.height; y += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    const animate = () => {
      driftRef.current = (driftRef.current + 0.05) % GRID_SIZE
      drawGrid(driftRef.current)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: colors.background,
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: -GRID_SIZE,
          left: -GRID_SIZE,
          display: 'block',
        }}
      />

      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Orb color={colors.pink} size={320} top={-80} left={-100} duration={6500} />
        <Orb
          color={colors.purpleDeep}
          size={260}
          top={window.innerHeight * 0.35}
          left={window.innerWidth - 140}
          duration={7800}
        />
        <Orb
          color={colors.pinkBright}
          size={300}
          top={window.innerHeight * 0.7}
          left={-90}
          duration={9000}
        />
      </div>
    </div>
  )
}
