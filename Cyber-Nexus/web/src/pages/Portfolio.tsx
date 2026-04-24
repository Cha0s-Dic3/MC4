import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '@/config/api'
import './Portfolio.css'

type Project = {
  id: number
  title: string
  description: string
  image_url: string
  live_link: string
  comment_count: number
}

type ProjectComment = {
  id: number
  commenter_name: string
  commenter_email: string | null
  comment: string
  created_at: string
}

type CommentDraft = {
  name: string
  email: string
  comment: string
}

type ProjectsResponse = {
  data: Project[]
}

type CommentsResponse = {
  data: ProjectComment[]
}

function toImageUrl(imageUrl: string) {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  return `${API_BASE_URL}${imageUrl}`
}

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([])
  const [comments, setComments] = useState<Record<number, ProjectComment[]>>({})
  const [drafts, setDrafts] = useState<Record<number, CommentDraft>>({})
  const [status, setStatus] = useState('Loading projects from backend...')

  async function loadComments(projectId: number) {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments?limit=10&page=1`)
    if (!response.ok) {
      throw new Error('Failed to load comments.')
    }
    const data = (await response.json()) as CommentsResponse
    setComments((prev) => ({
      ...prev,
      [projectId]: data.data ?? [],
    }))
  }

  async function loadProjects() {
    const response = await fetch(`${API_BASE_URL}/api/projects?limit=50&page=1`)
    if (!response.ok) {
      throw new Error('Failed to load projects.')
    }
    const data = (await response.json()) as ProjectsResponse
    const loadedProjects = data.data ?? []
    setProjects(loadedProjects)

    await Promise.all(loadedProjects.map((project) => loadComments(project.id)))
  }

  useEffect(() => {
    const controller = new AbortController()

    async function run() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects?limit=50&page=1`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to load projects.')
        }

        const data = (await response.json()) as ProjectsResponse
        const loadedProjects = data.data ?? []
        setProjects(loadedProjects)
        setStatus(loadedProjects.length ? '' : 'No projects available yet.')

        await Promise.all(
          loadedProjects.map(async (project) => {
            const commentsResponse = await fetch(`${API_BASE_URL}/api/projects/${project.id}/comments?limit=10&page=1`)
            if (!commentsResponse.ok) return
            const commentsData = (await commentsResponse.json()) as CommentsResponse
            setComments((prev) => ({
              ...prev,
              [project.id]: commentsData.data ?? [],
            }))
          }),
        )
      } catch (error) {
        if ((error as { name?: string }).name === 'AbortError') return
        setStatus('Could not load projects from backend.')
      }
    }

    void run()

    return () => {
      controller.abort()
    }
  }, [])

  function updateDraft(projectId: number, field: keyof CommentDraft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [projectId]: {
        name: prev[projectId]?.name ?? '',
        email: prev[projectId]?.email ?? '',
        comment: prev[projectId]?.comment ?? '',
        [field]: value,
      },
    }))
  }

  async function handleAddComment(projectId: number) {
    const draft = drafts[projectId] ?? { name: '', email: '', comment: '' }
    const name = draft.name.trim()
    const email = draft.email.trim()
    const comment = draft.comment.trim()

    if (!name || !comment) {
      setStatus('Name and comment are required.')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email || undefined,
          comment,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(errorData.error ?? 'Failed to submit comment.')
      }

      setDrafts((prev) => ({
        ...prev,
        [projectId]: {
          name: prev[projectId]?.name ?? '',
          email: prev[projectId]?.email ?? '',
          comment: '',
        },
      }))
      await loadComments(projectId)
      await loadProjects()
      setStatus('Comment posted successfully.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit comment.'
      setStatus(message)
    }
  }

  return (
    <div className="projects-page">
      <header className="projects-header">
        <h1>Projects</h1>
        <p>Explore featured work, open a live demo, and leave a comment on any project.</p>
        <div className="projects-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/cv">CV</Link>
        </div>
        {status ? <p className="projects-status">{status}</p> : null}
      </header>

      <section className="projects-grid">
        {projects.map((project) => (
          <article key={project.id} className="project-card">
            <div className="project-media">
              <img src={toImageUrl(project.image_url)} alt={project.title} />
            </div>
            <div className="project-content">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <a href={project.live_link} target="_blank" rel="noreferrer" className="live-view-link">
                Live View
              </a>
              <p className="comment-count">Comments: {project.comment_count}</p>

              <div className="comment-area">
                <label htmlFor={`commenter-name-${project.id}`}>Your name</label>
                <input
                  id={`commenter-name-${project.id}`}
                  value={drafts[project.id]?.name ?? ''}
                  onChange={(event) => updateDraft(project.id, 'name', event.target.value)}
                  placeholder="Enter your name"
                />

                <label htmlFor={`commenter-email-${project.id}`}>Email (optional)</label>
                <input
                  id={`commenter-email-${project.id}`}
                  type="email"
                  value={drafts[project.id]?.email ?? ''}
                  onChange={(event) => updateDraft(project.id, 'email', event.target.value)}
                  placeholder="Enter your email"
                />

                <label htmlFor={`comment-${project.id}`}>Comment on this project</label>
                <textarea
                  id={`comment-${project.id}`}
                  value={drafts[project.id]?.comment ?? ''}
                  onChange={(event) => updateDraft(project.id, 'comment', event.target.value)}
                  placeholder="Write your comment here"
                />
                <button type="button" onClick={() => void handleAddComment(project.id)}>
                  Post Comment
                </button>
                <ul>
                  {(comments[project.id] ?? []).map((comment) => (
                    <li key={comment.id}>
                      <strong>{comment.commenter_name}</strong>: {comment.comment}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
