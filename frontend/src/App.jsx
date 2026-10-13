
import { useEffect, useRef, useState } from 'react';
import './App.css';

const API = 'http://localhost:8080/api/tasks';

const emptyForm = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  reminderAt: '',
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const notifiedReminders = useRef(new Set());

  // Load tasks from the Spring Boot backend.
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
      .catch(() => {
        setError(
          'Cannot connect to the backend. Make sure Spring Boot is running on port 8080.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Check reminders while this dashboard is open.
  useEffect(() => {
    if (
      !notificationsEnabled ||
      !('Notification' in window) ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    function checkReminders() {
      const now = Date.now();

      tasks.forEach((task) => {
        if (!task.reminderAt || task.status === 'DONE') {
          return;
        }

        const reminderTime = new Date(task.reminderAt).getTime();

        if (Number.isNaN(reminderTime) || reminderTime > now) {
          return;
        }

        const reminderKey = `${task.id}:${task.reminderAt}`;

        if (!notifiedReminders.current.has(reminderKey)) {
          notifiedReminders.current.add(reminderKey);

          try {
            new Notification(`DevFlow reminder: ${task.title}`, {
              body: task.description || 'Time to work on this task!',
            });
          } catch (notificationError) {
            console.error(
              'Could not show reminder notification:',
              notificationError
            );
          }
        }
      });
    }

    checkReminders();

    const timerId = window.setInterval(checkReminders, 5000);

    return () => window.clearInterval(timerId);
  }, [tasks, notificationsEnabled]);

  // Update form fields.
  function updateField(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  // Ask the browser for permission to display notifications.
  async function enableNotifications() {
    if (!('Notification' in window)) {
      setError('Your browser does not support notifications.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setNotificationsEnabled(true);
        setSuccess('Task reminders are enabled!');
        setError('');
      } else {
        setError('Please allow notifications in your browser settings.');
      }
    } catch (notificationError) {
      setError('Could not enable notifications.');
    }
  }

  // Create a new task or update an existing task.
  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setSuccess('');
    setSaving(true);

    const wasEditing = editingId !== null;

    try {
      const payload = {
        ...form,
        reminderAt: form.reminderAt || null,
      };

      const response = await fetch(
        wasEditing ? `${API}/${editingId}` : API,
        {
          method: wasEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to ${wasEditing ? 'update' : 'create'} the task.`
        );
      }

      await loadTasks();

      setForm({ ...emptyForm });
      setEditingId(null);
      setSuccess(
        wasEditing
          ? 'Task updated successfully!'
          : 'Task created successfully!'
      );
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  // Load a task into the form for editing.
  function startEditing(task) {
    setEditingId(task.id);

    setForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      reminderAt: task.reminderAt
        ? task.reminderAt.slice(0, 16)
        : '',
    });

    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delete a task.
  async function deleteTask(id) {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Unable to delete the task.');
      }

      await loadTasks();

      if (editingId === id) {
        setEditingId(null);
        setForm({ ...emptyForm });
      }

      setSuccess('Task deleted successfully!');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    }
  }

  function cancelEditing() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError('');
    setSuccess('');
  }

  function formatReminder(reminderAt) {
    if (!reminderAt) {
      return '';
    }

    const date = new Date(reminderAt);

    if (Number.isNaN(date.getTime())) {
      return reminderAt;
    }

    return date.toLocaleString();
  }

  const filteredTasks = tasks.filter(
    (task) => filter === 'ALL' || task.status === filter
  );

  const todoCount = tasks.filter(
    (task) => task.status === 'TODO'
  ).length;

  const progressCount = tasks.filter(
    (task) => task.status === 'IN_PROGRESS'
  ).length;

  const doneCount = tasks.filter(
    (task) => task.status === 'DONE'
  ).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">D</div>
          <span>
            devflow<span className="brand-dot">.</span>
          </span>
        </div>

        <div className="side-label">WORKSPACE</div>

        <div className="side-link active">
          <span>▦</span> Task Board
        </div>

        <div
          className={`side-link ${filter === 'IN_PROGRESS' ? 'active' : ''}`}
          onClick={() => setFilter('IN_PROGRESS')}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setFilter('IN_PROGRESS');
            }
          }}
        >
          <span>◷</span> In Progress
        </div>

        <div
          className={`side-link ${filter === 'DONE' ? 'active' : ''}`}
          onClick={() => setFilter('DONE')}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setFilter('DONE');
            }
          }}
        >
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
          <span className="breadcrumb">
            Workspace / <strong>Task Board</strong>
          </span>

          <span className="live-indicator">
            <span /> Workspace active
          </span>
        </header>

        <section className="page-heading">
          <div>
            <div className="eyebrow">YOUR WORKSPACE</div>
            <h1>
              Task Board<span className="heading-period">.</span>
            </h1>
            <p>Plan your work. Track progress. Get things done.</p>

            <button
              className="primary-button"
              type="button"
              onClick={enableNotifications}
            >
              {notificationsEnabled
                ? 'Alarms enabled ✓'
                : 'Enable alarms 🔔'}
            </button>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() =>
              document.getElementById('task-title')?.focus()
            }
          >
            + New task
          </button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total tasks</span>
              <span className="stat-icon purple">▤</span>
            </div>
            <div className="stat-number">{tasks.length}</div>
            <div className="stat-caption">Across your workspace</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>To do</span>
              <span className="stat-icon blue">◷</span>
            </div>
            <div className="stat-number">{todoCount}</div>
            <div className="stat-caption">Waiting to get started</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>In progress</span>
              <span className="stat-icon orange">↗</span>
            </div>
            <div className="stat-number">{progressCount}</div>
            <div className="stat-caption">Currently being worked on</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Completed</span>
              <span className="stat-icon green">✓</span>
            </div>
            <div className="stat-number">{doneCount}</div>
            <div className="stat-caption">Successfully finished</div>
          </div>
        </section>

        {error && (
          <div className="notice error-notice" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="notice success-notice" role="status">
            {success}
          </div>
        )}

        <section className="workspace-grid">
          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">
                  {editingId ? 'MAKE CHANGES' : 'GET STARTED'}
                </div>
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

              <label htmlFor="task-reminder">
                Reminder date and time
              </label>
              <input
                id="task-reminder"
                name="reminderAt"
                type="datetime-local"
                value={form.reminderAt}
                onChange={updateField}
              />

              <div className="form-row">
                <div>
                  <label htmlFor="task-status">Status</label>
                  <select
                    id="task-status"
                    name="status"
                    value={form.status}
                    onChange={updateField}
                  >
                    <option value="TODO">To do</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="task-priority">Priority</label>
                  <select
                    id="task-priority"
                    name="priority"
                    value={form.priority}
                    onChange={updateField}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <button
                className="primary-button submit-button"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Save changes →'
                    : 'Create task →'}
              </button>

              {editingId !== null && (
                <button
                  className="cancel-button"
                  type="button"
                  onClick={cancelEditing}
                >
                  Cancel editing
                </button>
              )}
            </form>
          </div>

          <div className="panel tasks-panel">
            <div className="panel-heading tasks-heading">
              <div>
                <div className="eyebrow">OVERVIEW</div>
                <h2>
                  Your tasks{' '}
                  <span className="count-pill">{tasks.length}</span>
                </h2>
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
                  type="button"
                  className={`filter-tab ${
                    filter === value ? 'selected' : ''
                  }`}
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
                <h3>
                  {tasks.length === 0
                    ? 'Your board is ready'
                    : 'No tasks in this view'}
                </h3>
                <p>
                  {tasks.length === 0
                    ? 'Create your first task using the form to get started.'
                    : 'Choose another filter to see your tasks.'}
                </p>
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map((task) => (
                  <article className="task-card" key={task.id}>
                    <div className="task-card-top">
                      <span
                        className={`status-tag status-${(
                          task.status || 'TODO'
                        ).toLowerCase()}`}
                      >
                        {(task.status || 'TODO').replace('_', ' ')}
                      </span>

                      <span
                        className={`priority-tag priority-${(
                          task.priority || 'MEDIUM'
                        ).toLowerCase()}`}
                      >
                        ● {task.priority || 'MEDIUM'}
                      </span>
                    </div>

                    <h3>{task.title}</h3>

                    <p className="task-description">
                      {task.description || 'No description provided.'}
                    </p>

                    {task.reminderAt && (
                      <p className="task-description">
                        🔔 Reminder: {formatReminder(task.reminderAt)}
                      </p>
                    )}

                    <div className="task-card-footer">
                      <span className="task-id">
                        TASK-{String(task.id).padStart(3, '0')}
                      </span>

                      <div className="task-actions">
                        <button
                          type="button"
                          className="action-button"
                          onClick={() => startEditing(task)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="action-button delete-action"
                          onClick={() => deleteTask(task.id)}
                        >
                          Delete
                        </button>
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
          <span>
            <span className="footer-dot" /> Connected to your task API
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
