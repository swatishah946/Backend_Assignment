import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '70vh',
      flexDirection: 'column',
      textAlign: 'center',
      gap: '1.5rem',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        padding: '1.5rem',
        borderRadius: '50%',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        display: 'inline-flex',
        boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)',
        animation: 'pulse 2s infinite'
      }}>
        <ShieldAlert size={64} color="#ef4444" />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-family-heading)' }}>
        Access <span style={{ color: 'var(--color-danger)' }}>Denied</span>
      </h1>

      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '1rem', lineHeight: '1.6' }}>
        You do not have the administration privileges required to access this portal page. 
        Please contact your system administrator or return to your user workspace dashboard.
      </p>

      <Link to="/dashboard" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
export default Unauthorized;
