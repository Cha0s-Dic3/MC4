const tokenInput = document.querySelector('#tokenInput')
const saveTokenBtn = document.querySelector('#saveTokenBtn')
const projectForm = document.querySelector('#projectForm')
const aboutForm = document.querySelector('#aboutForm')
const cvForm = document.querySelector('#cvForm')
const loadOverviewBtn = document.querySelector('#loadOverviewBtn')
const loadMessagesBtn = document.querySelector('#loadMessagesBtn')
const loadGroupedCommentsBtn = document.querySelector('#loadGroupedCommentsBtn')

const overviewOutput = document.querySelector('#overviewOutput')
const messagesOutput = document.querySelector('#messagesOutput')
const groupedCommentsOutput = document.querySelector('#groupedCommentsOutput')

const tokenKey = 'cyber_nexus_admin_token'
const defaultToken = 'change-this-token'

if (!localStorage.getItem(tokenKey)) {
  localStorage.setItem(tokenKey, defaultToken)
}

tokenInput.value = localStorage.getItem(tokenKey) ?? defaultToken

saveTokenBtn.addEventListener('click', () => {
  localStorage.setItem(tokenKey, tokenInput.value.trim())
  alert('Admin token saved in browser storage.')
})

function getAdminHeaders() {
  const token = localStorage.getItem(tokenKey)
  if (!token) {
    throw new Error('Set your admin token first.')
  }

  return {
    'x-admin-token': token,
  }
}

async function callAdmin(path, options = {}) {
  const headers = {
    ...getAdminHeaders(),
    ...(options.headers ?? {}),
  }

  const response = await fetch(`/api/admin-panel${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error ?? `Request failed: ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}

projectForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const formData = new FormData(projectForm)

  try {
    const data = await callAdmin('/projects', {
      method: 'POST',
      body: formData,
    })

    alert(`Project created: ${data.title}`)
    projectForm.reset()
  } catch (error) {
    alert(error.message)
  }
})

aboutForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const formData = new FormData(aboutForm)
  const payload = Object.fromEntries(formData.entries())

  try {
    const data = await callAdmin('/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    alert(`About updated at ${data.updated_at}`)
  } catch (error) {
    alert(error.message)
  }
})

cvForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const formData = new FormData(cvForm)

  try {
    const data = await callAdmin('/cv', {
      method: 'POST',
      body: formData,
    })

    alert(`CV uploaded: ${data.file_name}`)
    cvForm.reset()
  } catch (error) {
    alert(error.message)
  }
})

loadOverviewBtn.addEventListener('click', async () => {
  try {
    const data = await callAdmin('/overview')
    overviewOutput.textContent = JSON.stringify(data, null, 2)
  } catch (error) {
    alert(error.message)
  }
})

loadMessagesBtn.addEventListener('click', async () => {
  try {
    const data = await callAdmin('/messages?limit=20&page=1')
    messagesOutput.textContent = JSON.stringify(data, null, 2)
  } catch (error) {
    alert(error.message)
  }
})

loadGroupedCommentsBtn.addEventListener('click', async () => {
  try {
    const data = await callAdmin('/comments/grouped')
    groupedCommentsOutput.textContent = JSON.stringify(data, null, 2)
  } catch (error) {
    alert(error.message)
  }
})
