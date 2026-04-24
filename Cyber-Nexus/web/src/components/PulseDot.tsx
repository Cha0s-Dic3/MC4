import './PulseDot.css'

export function PulseDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <div
      className="pulse-dot"
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="pulse-dot-ring"
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
    </div>
  )
}
