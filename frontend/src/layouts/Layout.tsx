import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { LayoutDashboard, ShieldCheck, LogOut, CheckSquare, User as UserIcon } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <header className="glass-panel" style={{
        margin: '1rem',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            padding: '0.5rem',
            borderRadius: 'var(--border-radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <CheckSquare size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-family-heading)', fontWeight: 800 }}>
              PRIMETRADE <span style={{ color: 'var(--color-primary)', fontWeight: 400 }}>PORTAL</span>
            </h1>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link 
            to="/dashboard" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              color: location.pathname === '/dashboard' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: 500
            }}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          
          {user?.role === 'ADMIN' && (
            <Link 
              to="/admin" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: location.pathname === '/admin' ? 'var(--color-secondary)' : 'var(--text-secondary)',
                fontWeight: 500
              }}
            >
              <ShieldCheck size={18} />
              Admin Panel
            </Link>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '50px', border: '1px solid var(--glass-border)' }}>
            <UserIcon size={14} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {user?.name}
            </span>
            <span 
              className={`badge ${user?.role === 'ADMIN' ? 'badge-high' : 'badge-low'}`} 
              style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginLeft: '0.25rem' }}
            >
              {user?.role}
            </span>
          </div>

          <button 
            onClick={handleLogout} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            title="Log Out"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '1rem 2rem 2rem 2rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        borderTop: '1px solid var(--glass-border)',
        marginTop: 'auto'
      }}>
        © 2026 Primetrade.ai Backend Developer Intern Assignment. Built with Node.js & React.
      </footer>
    </div>
  );
};
export default Layout;
