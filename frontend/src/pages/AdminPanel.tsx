import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Users, BookOpen, ShieldCheck, RefreshCw, BarChart2, Star } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalTasks: number;
  tasksByStatus: {
    PENDING: number;
    IN_PROGRESS: number;
    COMPLETED: number;
  };
  tasksByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
}

interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch admin statistics and users list
  const loadAdminData = async (isSilent: boolean = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setErrorMsg(null);

    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (usersRes.data?.success) setUsers(usersRes.data.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to load administration workspace data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Handle changing user role
  const handleRoleChange = async (userId: string, currentRole: 'USER' | 'ADMIN') => {
    const newRole = currentRole === 'USER' ? 'ADMIN' : 'USER';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    setErrorMsg(null);
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (response.data?.success) {
        setSuccessMsg(`Successfully updated user role to ${newRole}!`);
        loadAdminData(true); // silent refresh
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{
          border: '4px solid rgba(255, 255, 255, 0.1)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          borderLeftColor: 'var(--color-secondary)',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  // Calculate percentages
  const totalTasks = stats?.totalTasks || 0;
  const getPercentage = (count: number) => {
    if (totalTasks === 0) return 0;
    return Math.round((count / totalTasks) * 100);
  };

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

      {/* Header */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-family-heading)' }}>
            System <span style={{ color: 'var(--color-secondary)' }}>Administration</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>System statistics, task tracking, and role configuration controls.</p>
        </div>

        <button 
          onClick={() => loadAdminData(true)} 
          className="btn btn-secondary"
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '2.5rem' }}
        >
          <RefreshCw size={16} className={refreshing ? 'spin-anim' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </section>

      {/* Stats Cards Row */}
      {stats && (
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Card 1: Total Users */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-primary)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
              <Users size={28} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalUsers}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Registered Users</div>
            </div>
          </div>

          {/* Card 2: Total Tasks */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--color-secondary)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
              <BookOpen size={28} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.totalTasks}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tasks Generated</div>
            </div>
          </div>

          {/* Card 3: Completion Rate */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-accent)', padding: '1rem', borderRadius: 'var(--border-radius-md)' }}>
              <ShieldCheck size={28} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>
                {getPercentage(stats.tasksByStatus.COMPLETED)}%
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Completion Rate</div>
            </div>
          </div>
        </section>
      )}

      {/* Aggregated Visual Charts (HTML Progress Bars) */}
      {stats && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          
          {/* Status Breakdown Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={20} color="var(--color-primary)" />
              Task Status Distribution
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Completed */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>Completed</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{stats.tasksByStatus.COMPLETED} ({getPercentage(stats.tasksByStatus.COMPLETED)}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${getPercentage(stats.tasksByStatus.COMPLETED)}%`, background: 'var(--color-success)', borderRadius: '50px' }}></div>
                </div>
              </div>

              {/* In Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>In Progress</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{stats.tasksByStatus.IN_PROGRESS} ({getPercentage(stats.tasksByStatus.IN_PROGRESS)}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${getPercentage(stats.tasksByStatus.IN_PROGRESS)}%`, background: 'var(--color-secondary)', borderRadius: '50px' }}></div>
                </div>
              </div>

              {/* Pending */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>Pending</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{stats.tasksByStatus.PENDING} ({getPercentage(stats.tasksByStatus.PENDING)}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${getPercentage(stats.tasksByStatus.PENDING)}%`, background: 'var(--color-info)', borderRadius: '50px' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Breakdown Panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={20} color="var(--color-secondary)" />
              Task Priority Breakdown
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* High */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>High Priority</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{stats.tasksByPriority.HIGH} ({getPercentage(stats.tasksByPriority.HIGH)}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${getPercentage(stats.tasksByPriority.HIGH)}%`, background: 'var(--color-danger)', borderRadius: '50px' }}></div>
                </div>
              </div>

              {/* Medium */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>Medium Priority</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{stats.tasksByPriority.MEDIUM} ({getPercentage(stats.tasksByPriority.MEDIUM)}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${getPercentage(stats.tasksByPriority.MEDIUM)}%`, background: 'var(--color-warning)', borderRadius: '50px' }}></div>
                </div>
              </div>

              {/* Low */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>Low Priority</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{stats.tasksByPriority.LOW} ({getPercentage(stats.tasksByPriority.LOW)}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '50px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${getPercentage(stats.tasksByPriority.LOW)}%`, background: 'var(--color-success)', borderRadius: '50px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* User Management Section */}
      <section className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>User Accounts</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure authorization levels and promote users to administrators.</p>
        </div>

        {/* Responsive Table wrapper */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</th>
                <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Date Registered</th>
                <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Authorization Level</th>
                <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, textAlign: 'center' }}>Modify role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color var(--transition-fast)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem 2rem', fontSize: '0.95rem', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '1rem 2rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '1rem 2rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: '1rem 2rem' }}>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-high' : 'badge-low'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 2rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleRoleChange(u.id, u.role)}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Toggle to {u.role === 'USER' ? 'ADMIN' : 'USER'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
export default AdminPanel;
