
import { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:8080/api/tasks';

const emptyForm = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('ALL');

  async function loadTasks() {
    const response = await fetch(API);

    if (!response.ok) {
      throw new Error('Could not load tasks.');
    }

    const data = await response.json();
    setTasks(data);
  }

  useEffect(() => {
    loadTasks()
      .catch(() => setError('Cannot connect to the backend. Make sure Spring Boot is running on port 8080.'))
      .finally(() => setLoading(false));
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error('Unable to save the task.');
      }

      await loadTasks();
      setForm(emptyForm);
      setEditingId(null);
      setSuccess(editingId ? 'Task updated successfully!' : 'Task created successfully!');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  function startEditing(task) {
    setEditingId(task.id);
    setForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
    });
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteTask(id) {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Unable to delete the task.');
      }

      await loadTasks();

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setSuccess('Task deleted successfully!');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
  }

  const filteredTasks = tasks.filter(
    task => filter === 'ALL' || task.status === filter
  );

  const todoCount = tasks.filter(task => task.status === 'TODO').length;
  const progressCount = tasks.filter(task => task.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter(task => task.status === 'DONE').length;

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">D</div>
          <span>devflow<span className="brand-dot">.</span></span>
        </div>

        <div className="side-label">WORKSPACE</div>
        <div className="side-link active">
          <span>▦</span> Task Board
        </div>
        <div className="side-link">
          <span>◷</span> In Progress
        </div>
        <div className="side-link">
          <span>✓</span> Completed
        </div>

        <div className="sidebar-bottom">
          <div className="avatar">DF</div>
          <div>
            <strong>DevFlow Workspace</strong>
            <span>Personal project</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span className="breadcrumb">Workspace / <strong>Task Board</strong></span>
          <span className="live-indicator"><span /> Workspace active</span>
        </header>

        <section className="page-heading">
          <div>
            <div className="eyebrow">YOUR WORKSPACE</div>
            <h1>Task Board<span className="heading-period">.</span></h1>
            <p>Plan your work. Track progress. Get things done.</p>
          </div>
          <button
            className="primary-button"
            onClick={() => document.getElementById('task-title')?.focus()}
          >
            + New task
          </button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top"><span>Total tasks</span><span className="stat-icon purple">▤</span></div>
            <div className="stat-number">{tasks.length}</div>
            <div className="stat-caption">Across your workspace</div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>To do</span><span className="stat-icon blue">◷</span></div>
            <div className="stat-number">{todoCount}</div>
            <div className="stat-caption">Waiting to get started</div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>In progress</span><span className="stat-icon orange">↗</span></div>
            <div className="stat-number">{progressCount}</div>
            <div className="stat-caption">Currently being worked on</div>
          </div>
          <div className="stat-card">
            <div className="stat-top"><span>Completed</span><span className="stat-icon green">✓</span></div>
            <div className="stat-number">{doneCount}</div>
            <div className="stat-caption">Successfully finished</div>
          </div>
        </section>

        {error && <div className="notice error-notice">{error}</div>}
        {success && <div className="notice success-notice">{success}</div>}

        <section className="workspace-grid">
          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">{editingId ? 'MAKE CHANGES' : 'GET STARTED'}</div>
                <h2>{editingId ? 'Edit task' : 'Create a task'}</h2>
              </div>
              <span className="heading-icon">＋</span>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="task-title">Task title</label>
              <input
                id="task-title"
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="e.g. Build dashboard"
                required
              />

              <label htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                name="description"
                value={form.description}
                onChange={updateField}
                placeholder="What needs to be done?"
                rows="4"
              />

              <div className="form-row">
                <div>
                  <label htmlFor="task-status">Status</label>
                  <select id="task-status" name="status" value={form.status} onChange={updateField}>
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="task-priority">Priority</label>
                  <select id="task-priority" name="priority" value={form.priority} onChange={updateField}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <button className="primary-button submit-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save changes →' : 'Create task →'}
              </button>

              {editingId && (
                <button className="cancel-button" type="button" onClick={cancelEditing}>
                  Cancel editing
                </button>
              )}
            </form>
          </div>

          <div className="panel tasks-panel">
            <div className="panel-heading tasks-heading">
              <div>
                <div className="eyebrow">OVERVIEW</div>
                <h2>Your tasks <span className="count-pill">{tasks.length}</span></h2>
              </div>
            </div>

            <div className="filter-tabs">
              {[
                ['ALL', 'All tasks'],
                ['TODO', 'To do'],
                ['IN_PROGRESS', 'In progress'],
                ['DONE', 'Completed'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={`filter-tab ${filter === value ? 'selected' : ''}`}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="empty-state">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">▤</div>
                <h3>{tasks.length === 0 ? 'Your board is ready' : 'No tasks in this view'}</h3>
                <p>
                  {tasks.length === 0
                    ? 'Create your first task using the form to get started.'
                    : 'Choose another filter to see your tasks.'}
                </p>
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map(task => (
                  <article className="task-card" key={task.id}>
                    <div className="task-card-top">
                      <span className={`status-tag status-${(task.status || 'TODO').toLowerCase()}`}>
                        {(task.status || 'TODO').replace('_', ' ')}
                      </span>
                      <span className={`priority-tag priority-${(task.priority || 'MEDIUM').toLowerCase()}`}>
                        ● {task.priority || 'MEDIUM'}
                      </span>
                    </div>

                    <h3>{task.title}</h3>
                    <p className="task-description">
                      {task.description || 'No description provided.'}
                    </p>

                    <div className="task-card-footer">
                      <span className="task-id">TASK-{String(task.id).padStart(3, '0')}</span>
                      <div className="task-actions">
                        <button className="action-button" onClick={() => startEditing(task)}>Edit</button>
                        <button className="action-button delete-action" onClick={() => deleteTask(task.id)}>Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="page-footer">
          <span>DevFlow · Team Task Management</span>
          <span><span className="footer-dot" /> Connected to your task API</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
