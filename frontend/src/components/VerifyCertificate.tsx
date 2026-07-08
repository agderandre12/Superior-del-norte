import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Search, ShieldCheck, ShieldAlert, ArrowLeft, Loader2, Calendar, User, CreditCard, Award, FileText, BookOpen } from 'lucide-react';

interface VerifyResult {
  valido: boolean;
  usuario?: string;
  nombre_completo?: string;
  cedula?: string;
  fecha_emision?: string;
  codigo_verificacion?: string;
  calificacion_obtenida?: number;
  numero_certificado?: string;
  curso_titulo?: string;
}

const VerifyCertificate = ({ initialCode }: { initialCode?: string }) => {
  const { API_BASE_URL } = useContext(AppContext);
  const navigate = useNavigate();
  const [code, setCode] = useState(initialCode || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Keep the last in-flight request abortable so navigating away or starting a
  // new search cancels the stale fetch (prevents state updates on unmounted
  // component and out-of-order responses).
  const abortRef = useRef<AbortController | null>(null);

  const handleVerify = async (codeToVerify?: string) => {
    const targetCode = (codeToVerify || code).trim().toUpperCase();
    if (!targetCode) return;

    // Cancel any previous in-flight verification.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // encodeURIComponent guards against codes containing '/', '?', '#', '%'
      // breaking the path or being mis-parsed by the router/backend.
      const response = await fetch(
        `${API_BASE_URL}/certificate/verify/${encodeURIComponent(targetCode)}`,
        { signal: controller.signal }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data?.error?.message ||
          data?.error ||
          (response.status === 404
            ? 'No se encontró ningún diploma con ese código en el registro oficial.'
            : response.status === 429
            ? 'Demasiadas consultas. Espere unos segundos e intente nuevamente.'
            : 'Código de verificación no válido.');
        throw new Error(errorMsg);
      }

      // The backend returns the certificate payload at the top level of the
      // 200 response. Some legacy wrappers may nest under `data`; support both.
      const payload: VerifyResult = data?.data ?? data;
      if (!payload || payload.valido === false) {
        const errPayload = payload as any;
        throw new Error(errPayload?.error?.message || errPayload?.error || 'Diploma no encontrado.');
      }
      setResult(payload);
    } catch (err: any) {
      // AbortError is expected when a newer request supersedes this one or when
      // the component unmounts; silently ignore those.
      if (err?.name === 'AbortError') return;
      setError(err?.message || 'No se pudo completar la verificación. Intente nuevamente.');
    } finally {
      // Only clear loading if this request is still the active one.
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  };

  // If a code was provided in the URL, auto-verify it on load.
  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
    return () => {
      // Abort any in-flight request when the component unmounts.
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
      {/* Back Button — goes to the public landing page (this portal is reached
          by unauthenticated visitors such as employers verifying a diploma). */}
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--accent-teal)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          cursor: 'pointer',
          marginBottom: '24px',
          fontWeight: 700
        }}
      >
        <ArrowLeft size={18} />
        <span>Volver al Inicio</span>
      </button>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '8px', textAlign: 'center', fontWeight: 800 }}>
          Portal de Verificación
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '28px', textAlign: 'center', lineHeight: '1.5' }}>
          Ingrese el código de verificación del certificado para constatar su autenticidad y vigencia en nuestro registro nacional.
        </p>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Ej: ALIM-ABCD-EFGH"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input-field font-sans-mono"
              style={{ paddingLeft: '44px', height: '46px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerify();
              }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          
          <button className="btn btn-primary" onClick={() => handleVerify()} disabled={loading || !code.trim()} style={{ height: '46px' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Verificar</span>}
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Loader2 size={16} className="animate-spin" />
            <span>Consultando base de datos del Instituto...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.05)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            color: 'var(--accent-rose)'
          }}>
            <ShieldAlert size={36} style={{ margin: '0 auto 12px auto' }} />
            <h4 className="font-serif" style={{ fontSize: '1.15rem', marginBottom: '6px', fontWeight: 800 }}>Código No Encontrado</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{error}</p>
          </div>
        )}

        {/* Success / Result State */}
        {result && !loading && (
          <div className="glow-panel" style={{
            background: 'rgba(15, 44, 89, 0.03)',
            borderRadius: '12px',
            padding: '28px',
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid rgba(15, 44, 89, 0.08)', paddingBottom: '16px' }}>
              <ShieldCheck size={36} color="var(--accent-emerald)" />
              <div>
                <h4 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--accent-emerald)', fontWeight: 800 }}>CERTIFICADO VÁLIDO</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Validación oficial completada con éxito</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <User size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>Estudiante Certificado</p>
                  <p className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.usuario || result.nombre_completo}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CreditCard size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>Cédula de Identidad</p>
                  <p className="font-sans-mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.cedula || '—'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOpen size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>Curso Formativo</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.curso_titulo}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>Registro Oficial</p>
                  <p className="font-sans-mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-teal)' }}>{result.numero_certificado}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>Fecha de Emisión</p>
                  <p className="font-sans-mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.fecha_emision || '—'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>Calificación Evaluada</p>
                  <p className="font-sans-mono" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{typeof result.calificacion_obtenida === 'number' ? result.calificacion_obtenida : '—'}{typeof result.calificacion_obtenida === 'number' ? '%' : ''}</p>
                </div>
              </div>

            </div>

            <div className="font-sans-mono" style={{
              marginTop: '24px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(15, 44, 89, 0.05)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              fontWeight: 700,
              textAlign: 'center',
              border: 'none'
            }}>
              REF: {result.codigo_verificacion || '—'}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyCertificate;
