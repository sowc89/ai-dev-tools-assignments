const API_BASE = '/api'

export async function fetchJSON(path, opts) {
  const res = await fetch(API_BASE + path, opts)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export function listTasks() {
  return fetchJSON('/tasks/')
}

export function createTask(payload) {
  return fetchJSON('/tasks/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
}

export function snoozeTask(id, body) {
  return fetchJSON(`/tasks/${id}/snooze/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}

export function completeTask(id) {
  return fetchJSON(`/tasks/${id}/complete/`, { method: 'POST' })
}

export function listCategories() {
  return fetchJSON('/categories/')
}

export function createCategory(payload) {
  return fetchJSON('/categories/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
}
