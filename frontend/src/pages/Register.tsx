import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { UserPlus, Key, Mail, User as UserIcon, CheckSquare, Info } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, error, setError, success, setSuccess, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clean messages on unmount
  useEffect(() => {
    return () => {
      setError(null);
      setSuccess(null);
    };
  }, [setError, setSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
    } catch (err) {
      // Error is handled inside Context
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '2rem 1rem',
      position: 'relative'
    }}>
      {/* Glow overlays */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'var(--color-primary-glow)',
        filter: 'blur(100px)',
        top: '15%',
        left: '20%',
        zIndex: 0
      }}></div>
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'var(--color-secondary-glow)',
        filter: 'blur(120px)',
        bottom: '15%',
        right: '20%',
        zIndex: 0
      }}></div>

      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2.5rem',
        zIndex: 1,
        border: '1px solid var(--glass-border)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
      }}>
        {/* App Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
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
            CREATE <span style={{ color: 'var(--color-primary)', fontWeight: 400 }}>ACCOUNT</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Get started with your collaborative task board</p>
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
            <label className="input-label" htmlFor="name-input">Full Name</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <UserIcon size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem' }} />
              <input
                id="name-input"
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

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

          <div className="input-group">
            <label className="input-label" htmlFor="password-input">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Key size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '1rem' }} />
              <input
                id="password-input"
                type="password"
                className="input-field"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          {/* Password complexity helper */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.03)',
            padding: '0.75rem',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
            border: '1px solid var(--glass-border)'
          }}>
            <Info size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Password must be at least 8 characters long, containing at least one uppercase letter and one numeric digit.</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', height: '3rem', fontSize: '1rem' }}
          >
            <UserPlus size={20} />
            {submitting ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Register;
