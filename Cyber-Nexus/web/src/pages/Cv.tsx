import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Cv.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000'
const CV_DOWNLOAD_URL = `${API_BASE_URL}/api/cv/download`

export default function Cv() {
  const [status, setStatus] = useState('Checking CV availability...')

  useEffect(() => {
    const controller = new AbortController()

    async function checkCv() {
      try {
        const response = await fetch(CV_DOWNLOAD_URL, {
          method: 'HEAD',
          signal: controller.signal,
        })

        if (response.ok) {
          setStatus('Latest CV is available .')
          return
        }

        setStatus('No active CV uploaded yet.')
      } catch {
        setStatus('Could not reach backend CV endpoint.')
      }
    }

    void checkCv()

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <div className="cv-page">
      <section className="cv-card">
        <h1>Career Profile</h1>
        <p>
          You can download the latest CV . 
        </p>
        <p className="cv-status">{status}</p>

        <a className="cv-download-btn" href={CV_DOWNLOAD_URL} target="_blank" rel="noreferrer">
          Download CV (PDF)
        </a>

        <nav className="cv-nav">
          <Link to="/">Home</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </section>
    </div>
  )
}
