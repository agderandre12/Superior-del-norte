import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, isAdmin } from '../context/AppContext';
import logoNorte from '../assets/logo_instituto_norte.png';
import { Lock, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, loading, error: apiError } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Local Validations
    if (!cedula.trim() || !password.trim()) {
      setLocalError('Por favor complete todos los campos.');
      return;
    }

    if (!/^\d+$/.test(cedula)) {
      setLocalError('La cédula debe contener únicamente números.');
      return;
    }

    try {
      const u = await login(cedula, password);
      // Explicit post-login navigation (single source of truth: the action that
      // knows the result also performs the routing decision).
      navigate(isAdmin(u.rol) ? '/admin/dashboard' : '/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '16px', backgroundColor: 'var(--isn-bg-light)' }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        backgroundColor: '#FFFFFF'
      }}>

        {/* Top Decorative Gold Accent Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--isn-gold)'
        }} />

        <div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <img
              src={logoNorte}
              alt="Instituto Superior del Norte"
              style={{ width: '210px', height: 'auto', marginBottom: '16px' }}
            />
            <p className="font-serif" style={{ color: 'var(--isn-blue)', fontSize: '1.1rem', textAlign: 'center', fontWeight: 800 }}>
              Instituto Superior del Norte
            </p>
            <p style={{ color: 'var(--isn-charcoal)', fontSize: '0.75rem', textAlign: 'center', marginTop: '4px', fontWeight: 600 }}>

            </p>
          </div>

          {(localError || apiError) && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--accent-rose)',
              fontSize: '0.875rem'
            }}>
              <ShieldAlert size={20} style={{ flexShrink: 0 }} />
              <span>{localError || apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label" htmlFor="cedula" style={{ color: 'var(--isn-blue)', fontWeight: 700 }}>Número de Cédula</label>
              <input
                className="input-field"
                type="text"
                id="cedula"
                placeholder="Ej. 123456789"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '28px' }}>
              <label className="input-label" htmlFor="password" style={{ color: 'var(--isn-blue)', fontWeight: 700 }}>Contraseña</label>
              <input
                className="input-field"
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              {loading ? (
                <span>Iniciando sesión...</span>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Lock size={18} />
                  <span>Ingresar al Campus</span>
                </div>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--isn-blue)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 700
              }}
            >
              Volver al Inicio
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--isn-gold)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 700
              }}
            >
              Acceso Admin
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
