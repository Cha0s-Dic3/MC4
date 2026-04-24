import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import iratuziLogo from './assets/IRATUZI.png'
import AdminPanel from './pages/AdminPanel'
import About from './pages/About'
import Contact from './pages/Contact'
import Cv from './pages/Cv'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showSplash, setShowSplash] = useState(() => !window.sessionStorage.getItem('cyber_nexus_splash_seen'))

  useEffect(() => {
    if (!showSplash) {
      return
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem('cyber_nexus_splash_seen', 'true')
      setShowSplash(false)
      if (location.pathname === '/') {
        navigate('/', { replace: true })
      }
    }, 5000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [location.pathname, navigate, showSplash])

  if (showSplash) {
    return (
      <div className="app-splash" aria-label="Loading application">
        <div className="app-splash__orb">
          <img src={iratuziLogo} alt="Iratuzi logo" className="app-splash__logo" />
        </div>
        <p className="app-splash__text"> DESIGN.  CODE  . BUILD . GROW</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/projects" element={<Portfolio />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cv" element={<Cv />} />
      <Route path="/admin-panel" element={<AdminPanel />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
