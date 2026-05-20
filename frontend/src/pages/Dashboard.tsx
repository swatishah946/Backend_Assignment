import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Plus, Search, Edit2, Trash2, Calendar, 
  CheckCircle, Clock, AlertCircle, Filter, 
  User as UserIcon, X, Tag
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllUsers, setShowAllUsers] = useState<boolean>(false);

  // Modal/Form state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [dueDate, setDueDate] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ field: string; message: string }[]>([]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (searchQuery) params.search = searchQuery;
      if (showAllUsers && user?.role === 'ADMIN') params.all = 'true';

      const response = await api.get('/tasks', { params });
      if (response.data?.success) {
        setTasks(response.data.data);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, searchQuery, showAllUsers, user?.role]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Flash alerts auto-dismiss
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Handle Create/Update Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setErrorMsg(null);

    const payload: any = {
      title,
      description: description || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    try {
      if (editingTask) {
        // Update task
        const response = await api.put(`/tasks/${editingTask.id}`, payload);
        if (response.data?.success) {
          setSuccessMsg('Task updated successfully!');
          setModalOpen(false);
          resetForm();
          fetchTasks();
        }
      } else {
        // Create task
        const response = await api.post('/tasks', payload);
        if (response.data?.success) {
          setSuccessMsg('Task created successfully!');
          setModalOpen(false);
          resetForm();
          fetchTasks();
        }
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setErrorMsg(err.response?.data?.message || 'An error occurred while saving the task.');
      }
    }
  };

  // Open modal for editing
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.substring(0, 16) : '');
    setFormErrors([]);
    setModalOpen(true);
  };

  // Handle Delete task
  const handleDeleteClick = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setErrorMsg(null);
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      if (response.data?.success) {
        setSuccessMsg('Task deleted successfully.');
        fetchTasks();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  // Handle Status Quick Toggle (e.g. mark complete)
  const handleQuickStatusUpdate = async (task: Task, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    setErrorMsg(null);
    try {
      const response = await api.put(`/tasks/${task.id}`, { status: newStatus });
      if (response.data?.success) {
        setSuccessMsg(`Task marked as ${newStatus.replace('_', ' ')}.`);
        fetchTasks();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const resetForm = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setStatus('PENDING');
    setPriority('LOW');
    setDueDate('');
    setFormErrors([]);
  };

  // Aggregate stats from fetched tasks list
  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Alert Notifications */}
      {successMsg && (
        <div className="alert alert-success" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Greeting & Quick Stats */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-family-heading)' }}>
            Welcome, <span style={{ color: 'var(--color-primary)' }}>{user?.name}</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your tasks and optimize productivity.</p>
        </div>

        {/* Task Counters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', padding: '0.5rem', borderRadius: '50%' }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{pendingCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pending</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '0.5rem', borderRadius: '50%' }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{inProgressCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>In Progress</div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.5rem', borderRadius: '50%' }}>
              <CheckCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{completedCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Actions Toolbar */}
      <section className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Left Side: Filter inputs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', flex: 1, minWidth: '300px' }}>
          {/* Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '200px' }}>
            <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.75rem' }} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="input-field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '0.5rem', height: '2.5rem' }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} color="var(--text-secondary)" />
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ height: '2.5rem', padding: '0 2rem 0 1rem' }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              className="input-field"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ height: '2.5rem', padding: '0 2rem 0 1rem' }}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Admin view all users filter */}
          {user?.role === 'ADMIN' && (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={showAllUsers}
                onChange={(e) => setShowAllUsers(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--color-primary)',
                  cursor: 'pointer'
                }}
              />
              Show all users' tasks
            </label>
          )}
        </div>

        {/* Right Side: Add Button */}
        <div>
          <button 
            className="btn btn-primary" 
            onClick={() => { resetForm(); setModalOpen(true); }}
            style={{ height: '2.5rem', padding: '0 1.25rem' }}
          >
            <Plus size={18} />
            Create Task
          </button>
        </div>
      </section>

      {/* Task Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div style={{
            border: '4px solid rgba(255, 255, 255, 0.1)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            borderLeftColor: 'var(--color-primary)',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Tag size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No tasks found</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Try clearing filters or create a new task to get started.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {tasks.map((task) => (
            <article 
              key={task.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                gap: '1rem',
                borderLeft: `4px solid ${
                  task.priority === 'HIGH' ? 'var(--color-danger)' : 
                  task.priority === 'MEDIUM' ? 'var(--color-warning)' : 'var(--color-success)'
                }`,
                borderLeftWidth: '4px'
              }}
            >
              <div>
                {/* Header: Priority & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className={`badge badge-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <span className={`badge badge-${
                      task.status === 'COMPLETED' ? 'completed' : 
                      task.status === 'IN_PROGRESS' ? 'progress' : 'pending'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleEditClick(task)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                      title="Edit Task"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(task.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'color var(--transition-fast)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: '1.3' }}>{task.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {task.description || 'No description provided.'}
                </p>
              </div>

              {/* Footer: Date & User info */}
              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <Calendar size={14} />
                  <span>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No due date'}
                  </span>
                </div>

                {/* Creator (shown to Admin when searching all) */}
                {task.user && showAllUsers && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)', fontSize: '0.8rem' }}>
                    <UserIcon size={14} />
                    <span style={{ fontWeight: 500 }} title={task.user.email}>
                      {task.user.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Status Shift Toggles */}
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.25rem' }}>
                {task.status !== 'PENDING' && (
                  <button 
                    onClick={() => handleQuickStatusUpdate(task, 'PENDING')}
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '0.25rem', fontSize: '0.75rem', height: '2rem' }}
                  >
                    Set Pending
                  </button>
                )}
                {task.status !== 'IN_PROGRESS' && (
                  <button 
                    onClick={() => handleQuickStatusUpdate(task, 'IN_PROGRESS')}
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '0.25rem', fontSize: '0.75rem', height: '2rem', color: 'var(--color-secondary)' }}
                  >
                    Start
                  </button>
                )}
                {task.status !== 'COMPLETED' && (
                  <button 
                    onClick={() => handleQuickStatusUpdate(task, 'COMPLETED')}
                    className="btn btn-secondary" 
                    style={{ flex: 1, padding: '0.25rem', fontSize: '0.75rem', height: '2rem', color: 'var(--color-accent)' }}
                  >
                    Complete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Task Modal (Add / Edit) */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '550px',
            padding: '2rem',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', fontFamily: 'var(--font-family-heading)' }}>
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Title */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Task Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Implement JWT verification"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                {formErrors.find(e => e.field === 'title') && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {formErrors.find(e => e.field === 'title')?.message}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Description (Optional)</label>
                <textarea
                  className="input-field"
                  placeholder="Write clear instructions for this task..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
                {formErrors.find(e => e.field === 'description') && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {formErrors.find(e => e.field === 'description')?.message}
                  </span>
                )}
              </div>

              {/* Status and Priority Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Status</label>
                  <select
                    className="input-field"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Priority</label>
                  <select
                    className="input-field"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label className="input-label">Due Date & Time</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                {formErrors.find(e => e.field === 'dueDate') && (
                  <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {formErrors.find(e => e.field === 'dueDate')?.message}
                  </span>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;
