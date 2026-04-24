import { useEffect, useState } from 'react'
import './AdminPanel.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000'
const ACCESS_TOKEN_KEY = 'cyber_nexus_admin_access_token'
const DEFAULT_USERNAME = 'Jehovahniss'
const DEFAULT_PASSWORD = 'naomie@123'

type Overview = {
  projects: number
  messages: number
  unreadMessages: number
  comments: number
  aboutLastUpdated: string | null
}

type Project = {
  id: number
  title: string
  description: string
  live_link: string
  image_url: string
  created_at: string
  updated_at: string
}

type Message = {
  id: number
  sender_name: string
  sender_email: string | null
  sender_contact: string | null
  message: string
  is_read: number | boolean
  created_at: string
}

type GroupedComment = {
  project_id: number
  title: string
  comment_count: number
  latest_comment_at: string | null
}

type ProjectComment = {
  id: number
  project_id: number
  commenter_name: string
  commenter_email: string | null
  comment: string
  created_at: string
}

type AboutPayload = {
  headline: string
  body: string
  updated_at?: string
}

type CvDocument = {
  id: number
  file_name: string
  storage_path: string
  mime_type: string
  file_size_bytes: number
  is_active: number | boolean
  uploaded_at: string
}

type AdminUser = {
  username: string
  role: string
}

type LoginResponse = {
  accessToken: string
  tokenType: string
  user: AdminUser
}

type AuthMeResponse = {
  user: AdminUser
  expiresAt: number
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function isActiveFlag(value: number | boolean) {
  return value === true || value === 1
}

export default function AdminPanel() {
  const [accessToken, setAccessToken] = useState('')
  const [username, setUsername] = useState(DEFAULT_USERNAME)
  const [password, setPassword] = useState(DEFAULT_PASSWORD)
  const [authUser, setAuthUser] = useState<AdminUser | null>(null)
  const [statusMessage, setStatusMessage] = useState('Login to continue.')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [groupedComments, setGroupedComments] = useState<GroupedComment[]>([])
  const [selectedComments, setSelectedComments] = useState<ProjectComment[]>([])
  const [cvDocuments, setCvDocuments] = useState<CvDocument[]>([])
  const [aboutForm, setAboutForm] = useState<AboutPayload>({ headline: '', body: '' })
  const [projectForm, setProjectForm] = useState({
    projectId: '',
    title: '',
    description: '',
    liveLink: '',
  })
  const [projectImage, setProjectImage] = useState<File | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [activeCommentProject, setActiveCommentProject] = useState<number | null>(null)
  const isAuthenticated = Boolean(accessToken) && authUser?.role === 'admin'

  useEffect(() => {
    const storedToken = window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? ''
    if (storedToken) {
      setAccessToken(storedToken)
    }
  }, [])

  async function callApi<T>(path: string, options: RequestInit = {}): Promise<T | null> {
    const headers = new Headers(options.headers ?? {})
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const response = await fetch(`${API_BASE_URL}/api${path}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error ?? `Request failed with ${response.status}`)
    }

    if (response.status === 204) {
      return null
    }

    return response.json() as Promise<T>
  }

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = await callApi<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.trim(),
        password,
      }),
    })

    if (!data?.accessToken) {
      throw new Error('Login failed. No token returned.')
    }

    window.localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken)
    setAccessToken(data.accessToken)
    setAuthUser(data.user)
    setPassword('')
    setStatusMessage(`Authenticated as ${data.user.username}.`)
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    try {
      await login(event)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed.'
      setStatusMessage(message)
    }
  }

  function logout() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    setAccessToken('')
    setAuthUser(null)
    setOverview(null)
    setProjects([])
    setMessages([])
    setGroupedComments([])
    setSelectedComments([])
    setCvDocuments([])
    setActiveCommentProject(null)
    setStatusMessage('Logged out.')
  }

  async function validateSession() {
    if (!accessToken) {
      return
    }

    try {
      const data = await callApi<AuthMeResponse>('/auth/me')
      if (!data?.user) {
        throw new Error('Session check failed.')
      }
      setAuthUser(data.user)
    } catch {
      logout()
      setStatusMessage('Session expired. Login again.')
    }
  }

  async function loadOverview() {
    const data = await callApi<Overview>('/admin-panel/overview')
    setOverview(data)
  }

  async function loadProjects() {
    const data = await callApi<{ data: Project[] }>('/admin-panel/projects?limit=50&page=1')
    setProjects(data?.data ?? [])
  }

  async function loadMessages() {
    const data = await callApi<{ data: Message[] }>('/admin-panel/messages?limit=50&page=1')
    setMessages(data?.data ?? [])
  }

  async function loadGroupedComments() {
    const data = await callApi<GroupedComment[]>('/admin-panel/comments/grouped')
    setGroupedComments(data ?? [])
  }

  async function loadCommentsForProject(projectId: number) {
    const data = await callApi<ProjectComment[]>(`/admin-panel/comments/project/${projectId}`)
    setSelectedComments(data ?? [])
    setActiveCommentProject(projectId)
  }

  async function loadAbout() {
    const data = await callApi<AboutPayload>('/admin-panel/about')
    if (data) {
      setAboutForm({ headline: data.headline, body: data.body })
    }
  }

  async function loadCvDocuments() {
    const data = await callApi<CvDocument[]>('/admin-panel/cv')
    setCvDocuments(data ?? [])
  }

  async function refreshAll() {
    await Promise.all([loadOverview(), loadProjects(), loadMessages(), loadGroupedComments(), loadCvDocuments()])
  }

  useEffect(() => {
    if (!accessToken) return
    validateSession().catch(() => {
      setStatusMessage('Session validation failed.')
    })
  }, [accessToken])

  useEffect(() => {
    if (!isAuthenticated) return
    refreshAll().catch((error: Error) => {
      setStatusMessage(error.message)
    })
  }, [isAuthenticated])

  async function submitProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const editing = Boolean(projectForm.projectId)
      const formData = new FormData()
      formData.append('title', projectForm.title)
      formData.append('description', projectForm.description)
      formData.append('liveLink', projectForm.liveLink)
      if (projectImage) {
        formData.append('image', projectImage)
      }

      if (!editing && !projectImage) {
        setStatusMessage('Project image is required for new projects.')
        return
      }

      await callApi<Project>(editing ? `/admin-panel/projects/${projectForm.projectId}` : '/admin-panel/projects', {
        method: editing ? 'PUT' : 'POST',
        body: formData,
      })

      setProjectForm({ projectId: '', title: '', description: '', liveLink: '' })
      setProjectImage(null)
      setStatusMessage(editing ? 'Project updated.' : 'Project created.')
      await Promise.all([loadProjects(), loadOverview(), loadGroupedComments()])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Project upload failed.'
      setStatusMessage(message)
    }
  }

  async function deleteProject(projectId: number) {
    await callApi(`/admin-panel/projects/${projectId}`, { method: 'DELETE' })
    if (activeCommentProject === projectId) {
      setSelectedComments([])
      setActiveCommentProject(null)
    }
    setStatusMessage(`Project ${projectId} deleted.`)
    await Promise.all([loadProjects(), loadOverview(), loadGroupedComments()])
  }

  function startProjectEdit(project: Project) {
    setProjectForm({
      projectId: String(project.id),
      title: project.title,
      description: project.description,
      liveLink: project.live_link,
    })
    setProjectImage(null)
    setStatusMessage(`Editing project ${project.title}.`)
  }

  function cancelProjectEdit() {
    setProjectForm({ projectId: '', title: '', description: '', liveLink: '' })
    setProjectImage(null)
    setStatusMessage('Project edit cleared.')
  }

  async function submitAbout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await callApi<AboutPayload>('/admin-panel/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aboutForm),
    })
    setStatusMessage('About content updated.')
    await Promise.all([loadAbout(), loadOverview()])
  }

  async function uploadCv(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!cvFile) {
      setStatusMessage('Choose a PDF file first.')
      return
    }

    const formData = new FormData()
    formData.append('cv', cvFile)
    await callApi<CvDocument>('/admin-panel/cv', {
      method: 'POST',
      body: formData,
    })
    setCvFile(null)
    setStatusMessage('CV uploaded.')
    await loadCvDocuments()
  }

  async function toggleMessageRead(message: Message) {
    await callApi<Message>(`/admin-panel/messages/${message.id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: !isActiveFlag(message.is_read) }),
    })
    await Promise.all([loadMessages(), loadOverview()])
  }

  async function deleteMessage(messageId: number) {
    await callApi(`/admin-panel/messages/${messageId}`, { method: 'DELETE' })
    setStatusMessage(`Message ${messageId} deleted.`)
    await Promise.all([loadMessages(), loadOverview()])
  }

  async function deleteComment(commentId: number) {
    await callApi(`/admin-panel/comments/${commentId}`, { method: 'DELETE' })
    setStatusMessage(`Comment ${commentId} deleted.`)
    await Promise.all([
      loadGroupedComments(),
      activeCommentProject ? loadCommentsForProject(activeCommentProject) : Promise.resolve(),
      loadOverview(),
    ])
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <header className="admin-header admin-header-auth">
          <div className="admin-hero-copy">
            <p className="admin-eyebrow">Protected Route</p>
            <h1>Admin Panel</h1>
            <p className="admin-copy">
              Login with admin credentials to access dashboard features.
            </p>
            <div className="admin-highlight-grid">
              <article className="admin-highlight-card">
                <span>Projects</span>
                <strong>Create, update and remove portfolio work.</strong>
              </article>
              <article className="admin-highlight-card">
                <span>Messages</span>
                <strong>Track inbox activity and respond faster.</strong>
              </article>
            </div>
          </div>
          <div className="admin-token-card admin-auth-card">
            <div className="admin-section-intro">
              <p className="admin-section-label">Secure Access</p>
              <h2>Sign in to continue</h2>
            </div>
            <form className="admin-form" onSubmit={(event) => void handleLoginSubmit(event)}>
              <label htmlFor="adminUsername">Username</label>
              <input
                id="adminUsername"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
              <label htmlFor="adminPassword">Password</label>
              <input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button type="submit">Login</button>
            </form>
            <p className="admin-status">{statusMessage}</p>
          </div>
        </header>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-hero-copy">
          <p className="admin-eyebrow">Hidden Route</p>
          <h1>Admin Panel</h1>
          <p className="admin-copy">
            Manage projects, messages, grouped comments, about content and CV uploads from React.
          </p>
        </div>
        <div className="admin-token-card">
          <p className="admin-status">Signed in as {authUser?.username} ({authUser?.role})</p>
          <button type="button" className="button-secondary" onClick={logout}>
            Logout
          </button>
          <p className="admin-status">{statusMessage}</p>
        </div>
      </header>

      <nav className="admin-section-nav" aria-label="Admin sections">
        <a href="#admin-editor">Editor</a>
        <a href="#admin-dashboard">Dashboard</a>
        <a href="#admin-records">Projects and Messages</a>
        <a href="#admin-comments">Comments</a>
      </nav>

      <section id="admin-editor" className="admin-section">
        <div className="admin-section-intro">
          <p className="admin-section-label">Content Studio</p>
          <h2>Edit the main portfolio content</h2>
          <p>Create projects and update the about section from one place.</p>
        </div>
        <div className="admin-grid admin-grid-two">
        <article className="admin-card">
          <div className="admin-card-heading">
            <h2>{projectForm.projectId ? 'Edit Project' : 'Create Project'}</h2>
            {projectForm.projectId ? (
              <button type="button" className="button-secondary" onClick={cancelProjectEdit}>
                Cancel
              </button>
            ) : null}
          </div>
          <form className="admin-form" onSubmit={submitProject}>
            <input
              value={projectForm.title}
              onChange={(event) => setProjectForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Project title"
              required
            />
            <textarea
              value={projectForm.description}
              onChange={(event) => setProjectForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Project description"
              required
            />
            <input
              value={projectForm.liveLink}
              onChange={(event) => setProjectForm((prev) => ({ ...prev, liveLink: event.target.value }))}
              placeholder="Live link"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setProjectImage(event.target.files?.[0] ?? null)}
              required={!projectForm.projectId}
            />
            <button type="submit">{projectForm.projectId ? 'Update Project' : 'Add Project'}</button>
          </form>
        </article>

        <article className="admin-card">
          <div className="admin-card-heading">
            <h2>About Content</h2>
            <button type="button" className="button-secondary" onClick={() => void loadAbout()}>
              Load
            </button>
          </div>
          <form className="admin-form" onSubmit={submitAbout}>
            <input
              value={aboutForm.headline}
              onChange={(event) => setAboutForm((prev) => ({ ...prev, headline: event.target.value }))}
              placeholder="Headline"
              required
            />
            <textarea
              value={aboutForm.body}
              onChange={(event) => setAboutForm((prev) => ({ ...prev, body: event.target.value }))}
              placeholder="About text"
              required
            />
            <button type="submit">Save About</button>
          </form>
        </article>
        </div>
      </section>

      <section id="admin-dashboard" className="admin-section">
        <div className="admin-section-intro">
          <p className="admin-section-label">Dashboard</p>
          <h2>Watch the latest numbers</h2>
          <p>Overview cards and CV uploads stay together here for quick maintenance.</p>
        </div>
        <div className="admin-grid admin-grid-two">
        <article className="admin-card">
          <div className="admin-card-heading">
            <h2>Overview</h2>
            <button type="button" className="button-secondary" onClick={() => void loadOverview()}>
              Refresh
            </button>
          </div>
          <div className="stats-grid">
            <div className="stat-block">
              <span>Projects</span>
              <strong>{overview?.projects ?? 0}</strong>
            </div>
            <div className="stat-block">
              <span>Messages</span>
              <strong>{overview?.messages ?? 0}</strong>
            </div>
            <div className="stat-block">
              <span>Unread</span>
              <strong>{overview?.unreadMessages ?? 0}</strong>
            </div>
            <div className="stat-block">
              <span>Comments</span>
              <strong>{overview?.comments ?? 0}</strong>
            </div>
          </div>
          <p className="admin-muted">About updated: {formatDate(overview?.aboutLastUpdated)}</p>
        </article>

        <article className="admin-card">
          <div className="admin-card-heading">
            <h2>Upload CV</h2>
            <button type="button" className="button-secondary" onClick={() => void loadCvDocuments()}>
              Refresh
            </button>
          </div>
          <form className="admin-form" onSubmit={uploadCv}>
            <input type="file" accept="application/pdf" onChange={(event) => setCvFile(event.target.files?.[0] ?? null)} />
            <button type="submit">Upload PDF</button>
          </form>
          <div className="admin-list">
            {cvDocuments.length === 0 ? <p className="admin-empty">No CV uploaded yet.</p> : null}
            {cvDocuments.map((cv) => (
              <div key={cv.id} className="admin-list-item">
                <div>
                  <strong>{cv.file_name}</strong>
                  <p>{Math.round(cv.file_size_bytes / 1024)} KB</p>
                </div>
                <span className={isActiveFlag(cv.is_active) ? 'pill-active' : 'pill-muted'}>
                  {isActiveFlag(cv.is_active) ? 'Active' : 'Archived'}
                </span>
              </div>
            ))}
          </div>
        </article>
        </div>
      </section>

      <section id="admin-records" className="admin-section">
        <div className="admin-section-intro">
          <p className="admin-section-label">Records</p>
          <h2>Manage projects and inbox items</h2>
          <p>Everything related to stored portfolio items and messages lives in this section.</p>
        </div>
        <div className="admin-grid admin-grid-two">
        <article className="admin-card">
          <div className="admin-card-heading">
            <h2>Projects</h2>
            <button type="button" className="button-secondary" onClick={() => void loadProjects()}>
              Refresh
            </button>
          </div>
          <div className="admin-list">
            {projects.length === 0 ? <p className="admin-empty">No projects found.</p> : null}
            {projects.map((project) => (
              <div key={project.id} className="admin-list-item admin-list-item-stacked">
                <div>
                  <strong>{project.title}</strong>
                  <p>{project.description}</p>
                  <a href={project.live_link} target="_blank" rel="noreferrer">
                    {project.live_link}
                  </a>
                </div>
                <div className="action-row">
                  <button type="button" className="button-secondary" onClick={() => startProjectEdit(project)}>
                    Edit
                  </button>
                  <button type="button" className="button-danger" onClick={() => void deleteProject(project.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card-heading">
            <h2>Messages</h2>
            <button type="button" className="button-secondary" onClick={() => void loadMessages()}>
              Refresh
            </button>
          </div>
          <div className="admin-list">
            {messages.length === 0 ? <p className="admin-empty">No messages found.</p> : null}
            {messages.map((message) => (
              <div key={message.id} className="admin-list-item admin-list-item-stacked">
                <div>
                  <strong>{message.sender_name}</strong>
                  <p>{message.sender_email ?? message.sender_contact ?? 'No contact provided'}</p>
                  <p>{message.message}</p>
                  <p>{formatDate(message.created_at)}</p>
                </div>
                <div className="action-row">
                  <button type="button" className="button-secondary" onClick={() => void toggleMessageRead(message)}>
                    {isActiveFlag(message.is_read) ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button type="button" className="button-danger" onClick={() => void deleteMessage(message.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
        </div>
      </section>

      <section id="admin-comments" className="admin-section">
        <div className="admin-section-intro">
          <p className="admin-section-label">Comments Hub</p>
          <h2>Review feedback by project</h2>
          <p>Grouped comments and selected comment details are separated for easier moderation.</p>
        </div>
        <div className="admin-grid admin-grid-two">
        <article className="admin-card">
          <div className="admin-card-heading">
            <h2>Comments By Project</h2>
            <button type="button" className="button-secondary" onClick={() => void loadGroupedComments()}>
              Refresh
            </button>
          </div>
          <div className="admin-list">
            {groupedComments.length === 0 ? <p className="admin-empty">No grouped comments found.</p> : null}
            {groupedComments.map((group) => (
              <div key={group.project_id} className="admin-list-item">
                <div>
                  <strong>{group.title}</strong>
                  <p>{group.comment_count} comments</p>
                  <p>{formatDate(group.latest_comment_at)}</p>
                </div>
                <button type="button" className="button-secondary" onClick={() => void loadCommentsForProject(group.project_id)}>
                  View
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card-heading">
            <h2>Selected Comments</h2>
            {activeCommentProject ? (
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setActiveCommentProject(null)
                  setSelectedComments([])
                }}
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="admin-list">
            {selectedComments.length === 0 ? (
              <p className="admin-empty">Choose a project from the grouped comments list.</p>
            ) : null}
            {selectedComments.map((comment) => (
              <div key={comment.id} className="admin-list-item admin-list-item-stacked">
                <div>
                  <strong>{comment.commenter_name}</strong>
                  <p>{comment.commenter_email ?? 'No email provided'}</p>
                  <p>{comment.comment}</p>
                  <p>{formatDate(comment.created_at)}</p>
                </div>
                <div className="action-row">
                  <button type="button" className="button-danger" onClick={() => void deleteComment(comment.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
        </div>
      </section>
    </div>
  )
}
