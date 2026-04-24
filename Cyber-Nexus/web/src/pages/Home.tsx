import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, Phone } from 'lucide-react'
import iratuziLogo from '@/assets/IRATUZI.png'
import naomiePhoto from '@/assets/Naomie.jpeg'
import { API_BASE_URL } from '@/config/api'
import './Home.css'

type AboutResponse = {
  headline: string
  body: string
}

type ProjectsResponse = {
  pagination?: {
    total: number
  }
}

export default function Home() {
  const [about, setAbout] = useState<AboutResponse | null>(null)
  const [projectCount, setProjectCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadHomeData() {
      try {
        const [aboutResponse, projectsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/about`, { signal: controller.signal }),
          fetch(`${API_BASE_URL}/api/projects?limit=1&page=1`, { signal: controller.signal }),
        ])

        if (aboutResponse.ok) {
          const aboutData = (await aboutResponse.json()) as AboutResponse | null
          if (aboutData) {
            setAbout(aboutData)
          }
        }

        if (projectsResponse.ok) {
          const projectsData = (await projectsResponse.json()) as ProjectsResponse
          setProjectCount(projectsData.pagination?.total ?? 0)
        }
      } catch {
        // Keep static fallbacks when backend is unavailable.
      }
    }

    void loadHomeData()

    return () => {
      controller.abort()
    }
  }, [])

  const tagline = useMemo(() => {
    if (about?.body?.trim()) {
      return about.body
    }
    return 'Frontend-focused developer building clean, modern and user friendly web experiences.'
  }, [about])

  return (
    <div className="home-page">
      <header className="top-nav">
        <Link to="/" className="brand" aria-label="Iratuzi home">
          <span className="brand-mark">
            <img src={iratuziLogo} alt="Iratuzi logo" className="brand-logo" />
          </span>
        </Link>
        <nav className="top-links">
          <Link to="/projects">Projects</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/cv">CV</Link>
        </nav>
        <Link className="hire-link" to="/contact">
          Hire Me
        </Link>
      </header>

      <main className="hero-layout">
        <section className="hero-copy">
          <p className="intro">Hello, I am</p>
          <h1>
            <span>IRATUZI</span>
            <span>Naomie</span>
          </h1>
          <p className="tagline">{tagline}</p>

          <div className="hero-actions">
            <Link to="/projects" className="primary-cta">
              View Work <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="secondary-cta">
              Contact
            </Link>
            <Link to="/cv" className="secondary-cta">
              CV
            </Link>
          </div>
          <p className="hero-meta">
            {projectCount > 0 ? `${projectCount} projects available from backend.` : 'Projects are synced from backend.'}
          </p>

          <div className="quick-contact">
            <p>
              <Phone size={16} /> 0735123452
            </p>
            <p>
              <Mail size={16} /> naomiejeje107@gmail.com
            </p>
          </div>
        </section>

        <aside className="hero-photo-wrap" aria-label="Naomie profile photo">
          <div className="photo-ring">
            <img src={naomiePhoto} alt="Naomie" className="hero-photo" />
          </div>
        </aside>
      </main>
    </div>
  )
}
