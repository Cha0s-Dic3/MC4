import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Mail, Phone } from 'lucide-react'
import { API_BASE_URL } from '@/config/api'
import './Contact.css'

export default function Contact() {
  const [name, setName] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitState, setSubmitState] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!name.trim() || !emailOrPhone.trim() || !message.trim()) {
      setSubmitState('All fields are required.')
      return
    }

    const value = emailOrPhone.trim()
    const looksLikeEmail = value.includes('@')

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: looksLikeEmail ? value : undefined,
          contact: looksLikeEmail ? undefined : value,
          message: message.trim(),
        }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'Failed to send message.')
      }

      setSubmitState('Message submitted successfully and saved in backend.')
      setName('')
      setEmailOrPhone('')
      setMessage('')
    } catch (error) {
      const submitError = error instanceof Error ? error.message : 'Failed to send message.'
      setSubmitState(submitError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      <section className="contact-card">
        <h1>Contact Naomie</h1>
        <p className="contact-lead">
          Hire me and let us build something meaningful together. You can reach me using the details
          below or send a direct message from this form.
        </p>

        <div className="contact-links">
          <a href="tel:0735123452">
            <Phone size={17} /> 0735123452
          </a>
          <a href="mailto:naomiejeje107@gmail.com">
            <Mail size={17} /> naomiejeje107@gmail.com
          </a>
          <a href="https://instagram.com/naomiejeje107" target="_blank" rel="noreferrer">
            <ExternalLink size={17} /> Instagram
          </a>
          <a href="https://github.com/naomiejeje107" target="_blank" rel="noreferrer">
            <ExternalLink size={17} /> GitHub
          </a>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
          />

          <label htmlFor="emailOrPhone">Email or Contact</label>
          <input
            id="emailOrPhone"
            value={emailOrPhone}
            onChange={(event) => setEmailOrPhone(event.target.value)}
            placeholder="Enter your email or phone"
          />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write your message"
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Submit'}
          </button>
          {submitState ? <p className="submit-state">{submitState}</p> : null}
        </form>

        <nav className="contact-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/cv">CV</Link>
        </nav>
      </section>
    </div>
  )
}
