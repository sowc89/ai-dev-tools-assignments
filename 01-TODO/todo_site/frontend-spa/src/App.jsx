import React, { useEffect, useState } from 'react'
import { listTasks, createTask, snoozeTask, completeTask, listCategories, createCategory } from './api'

function TaskItem({ t, onSnooze, onComplete }) {
  return (
    <div className="task">
      <div className="task-main">
        <strong>{t.title}</strong>
        <div className="meta">{t.category?.name || 'Uncategorized'} — {t.completed ? 'Done' : 'Open'}</div>
        <div className="desc">{t.description}</div>
      </div>
      <div className="task-actions">
        <button onClick={() => onSnooze(t.id, 10)}>Snooze +10m</button>
        <button onClick={() => onSnooze(t.id, 60)}>Snooze +1h</button>
        <button onClick={() => onSnooze(t.id, 24 * 60)}>Snooze +1d</button>
        {!t.completed && <button onClick={() => onComplete(t.id)}>Complete</button>}
      </div>
    </div>
  )
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', description: '', category_id: null, reminder_at: '' })
  const [catName, setCatName] = useState('')
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const [t, c] = await Promise.all([listTasks(), listCategories()])
      setTasks(t)
      setCategories(c)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    try {
      // convert empty string category to null
      const payload = { ...form }
      if (!payload.category_id) payload.category_id = null
      // reminder_at from datetime-local is local; convert to ISO if provided
      if (payload.reminder_at) payload.reminder_at = new Date(payload.reminder_at).toISOString()
      await createTask(payload)
      setForm({ title: '', description: '', category_id: null, reminder_at: '' })
      await load()
    } catch (e) { setError(e.message) }
  }

  async function handleCreateCategory(e) {
    e.preventDefault()
    if (!catName) return
    try {
      await createCategory({ name: catName })
      setCatName('')
      await load()
    } catch (e) { setError(e.message) }
  }

  async function handleSnooze(id, minutes) {
    try {
      await snoozeTask(id, { minutes })
      await load()
    } catch (e) { setError(e.message) }
  }

  async function handleComplete(id) {
    try {
      await completeTask(id)
      await load()
    } catch (e) { setError(e.message) }
  }

  return (
    <div className="app">
      <header>
        <h1>TODO App</h1>
      </header>

      <section className="controls">
        <form onSubmit={handleCreate} className="task-form">
          <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} required />
          <input placeholder="Description" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
          <select value={form.category_id || ''} onChange={e=>setForm({...form, category_id: e.target.value || null})}>
            <option value="">-- No category --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="datetime-local" value={form.reminder_at} onChange={e=>setForm({...form, reminder_at: e.target.value})} />
          <button type="submit">Add Task</button>
        </form>

        <form onSubmit={handleCreateCategory} className="cat-form">
          <input placeholder="New category" value={catName} onChange={e=>setCatName(e.target.value)} />
          <button type="submit">Add Category</button>
        </form>
      </section>

      <section className="list">
        {loading ? <div>Loading...</div> : (
          <>{error && <div className="error">{error}</div>}
          {tasks.length === 0 ? <div>No tasks yet</div> : tasks.map(t => (
            <TaskItem key={t.id} t={t} onSnooze={handleSnooze} onComplete={handleComplete} />
          ))}</>
        )}
      </section>
    </div>
  )
}
