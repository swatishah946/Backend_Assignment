import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { LogIn, Key, Mail, CheckSquare } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login, error, setError, success, setSuccess, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clean errors on unmount
  useEffect(() => {
    return () => {
      setError(null);
      setSuccess(null);
    };
  }, [setError, setSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      // AuthProvider triggers navigate via the isAuthenticated dependency above
    } catch (err) {
      // Error is caught and set inside AuthContext
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '1rem',
      position: 'relative'
    }}>
      {/* Decorative Glows */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'var(--color-primary-glow)',
        filter: 'blur(100px)',
        top: '20%',
        left: '30%',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'var(--color-secondary-glow)',
        filter: 'blur(120px)',
        bottom: '20%',
        right: '30%',
        zIndex: 0
      }}></div>

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '3rem 2.5rem',
        zIndex: 1,
        border: '1px solid var(--glass-border)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
      }}>
        {/* App Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '0.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            padding: '0.75rem',
            borderRadius: 'var(--border-radius-md)',
            display: 'inline-flex',
            boxShadow: '0 0 25px var(--color-primary-glow)'
          }}>
            <CheckSquare size={32} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem' }}>
            PRIMETRADE <span style={{ color: 'var(--color-primary)', fontWeight: 400 }}>PORTAL</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Enter credentials to access your workspace</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="email-input">Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem' }} />
              <input
                id="email-input"
                type="email"
                className="input-field"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '1.75rem' }}>
            <label className="input-label" htmlFor="password-input">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Key size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem' }} />
              <input
                id="password-input"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', height: '3rem', fontSize: '1rem' }}
          >
            <LogIn size={20} />
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Login;
