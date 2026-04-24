import { useEffect, useRef, useState } from 'react'
import './Typewriter.css'
import { colors } from '@/constants/colors'

type Props = {
  words: string[]
  style?: React.CSSProperties
  cursorColor?: string
}

export function Typewriter({ words, style, cursorColor }: Props) {
  const [text, setText] = useState('')
  const indexRef = useRef(0)
  const charRef = useRef(0)
  const deletingRef = useRef(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const tick = () => {
      const current = words[indexRef.current % words.length] ?? ''
      if (!deletingRef.current) {
        charRef.current += 1
        setText(current.slice(0, charRef.current))
        if (charRef.current >= current.length) {
          deletingRef.current = true
          timeout = setTimeout(tick, 1400)
          return
        }
        timeout = setTimeout(tick, 80)
      } else {
        charRef.current -= 1
        setText(current.slice(0, Math.max(charRef.current, 0)))
        if (charRef.current <= 0) {
          deletingRef.current = false
          indexRef.current += 1
          timeout = setTimeout(tick, 250)
          return
        }
        timeout = setTimeout(tick, 40)
      }
    }

    timeout = setTimeout(tick, 400)
    return () => clearTimeout(timeout)
  }, [words])

  return (
    <div style={{ display: 'flex', alignItems: 'center', ...style }}>
      <span>{text}</span>
      <div
        className="typewriter-cursor"
        style={{
          width: 10,
          height: (style?.fontSize as number || 18) * 1.05,
          marginLeft: 4,
          backgroundColor: cursorColor ?? colors.pink,
        }}
      />
    </div>
  )
}
