import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '@/config/api'
import './About.css'

type AboutContent = {
  headline: string
  body: string
}

export default function About() {
  const [about, setAbout] = useState<AboutContent | null>(null)
  const [status, setStatus] = useState('Loading about content...')

  useEffect(() => {
    const controller = new AbortController()

    async function loadAbout() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/about`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to load about content.')
        }

        const data = (await response.json()) as AboutContent | null
        if (data) {
          setAbout(data)
          setStatus('')
          return
        }

        setStatus('No about content found yet.')
      } catch (error) {
        if ((error as { name?: string }).name === 'AbortError') return
        setStatus('Could not reach backend about content.')
      }
    }

    void loadAbout()

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <div className="about-page">
      <div className="about-card">
        <h1>{about?.headline ?? 'About Naomie'}</h1>
        <p>{about?.body ?? 'Content is loaded from backend and can be managed in admin panel.'}</p>
        {status ? <p className="about-status">{status}</p> : null}

        <div className="about-points">
          <article>
            <h2>Mission</h2>
            <p>Create web experiences that are elegant, fast and easy to use.</p>
          </article>
          <article>
            <h2>Strengths</h2>
            <p>React, TypeScript, responsive design, UI consistency and collaboration.</p>
          </article>
          <article>
            <h2>Work Style</h2>
            <p>Organized delivery, clean code, thoughtful feedback and on-time communication.</p>
          </article>
        </div>

        <nav className="about-nav">
          <Link to="/">Home</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/cv">CV</Link>
        </nav>
      </div>
    </div>
  )
}
