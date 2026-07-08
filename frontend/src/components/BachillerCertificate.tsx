import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logoNorte from '../assets/logo_instituto_norte.png';
import { Download, ArrowLeft, ShieldCheck, FileText, Award, Loader2 } from 'lucide-react';

const decodeMojibake = (str: string | undefined): string | undefined => {
  if (!str) return str;
  try {
    const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    if (!decoded.includes('\uFFFD')) return decoded;
  } catch (e) {}
  const mapping = [
    ['Ã¡', 'á'], ['Ã©', 'é'], ['Ã­', 'í'], ['Ã³', 'ó'], ['Ãº', 'ú'],
    ['Ã±', 'ñ'], ['Ã‘', 'Ñ'], ['Ã', 'Á'], ['Ã‰', 'É'], ['Ã“', 'Ó'], ['Ãš', 'Ú']
  ];
  let result = str;
  for (const [m, c] of mapping) result = result.replaceAll(m, c);
  return result;
};

const SPANISH_MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const formatSpanishDate = (iso: string) => {
  if (!iso) return { day: '—', month: '———', year: '—' };
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(d.getTime())) return { day: String(iso).slice(8, 10) || '—', month: '———', year: String(iso).slice(0, 4) || '—' };
  return { day: d.getDate(), month: SPANISH_MONTHS[d.getMonth()], year: d.getFullYear() };
};

// Decorative formal emblem standing in for the Escudo de la República de Colombia
// (the raster asset lives only on the backend; this keeps the frontend self-contained).
const ColombiaCrest: React.FC<{ size?: number }> = ({ size = 64 }) => (
  <svg width={size} height={size * 1.15} viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Escudo República de Colombia">
    <path d="M50 2 L92 14 V58 C92 86 72 104 50 113 C28 104 8 86 8 58 V14 Z" fill="#0F2C59" stroke="#D4AF37" strokeWidth="3" />
    <path d="M50 8 L86 18 V58 C86 82 68 98 50 106 C32 98 14 82 14 58 V18 Z" fill="#fbf8f0" stroke="#D4AF37" strokeWidth="1" />
    <path d="M50 38 Q40 52 50 70 Q60 52 50 38 Z" fill="#D4AF37" />
    <path d="M50 70 Q44 80 50 92 Q56 80 50 70 Z" fill="#0F2C59" />
    <circle cx="50" cy="40" r="5" fill="#0F2C59" />
    <path d="M30 86 Q50 96 70 86" stroke="#D4AF37" strokeWidth="2" fill="none" />
  </svg>
);

interface BachillerCertificateProps {
  courseTitle?: string;
}

const BachillerCertificate: React.FC<BachillerCertificateProps> = ({ courseTitle }) => {
  const { user, token, API_BASE_URL, activeCourseId, downloadCertificate, downloadActa } = useContext(AppContext);
  const navigate = useNavigate();
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingDoc, setProcessingDoc] = useState<'diploma' | 'acta' | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/certificate/detail?courseId=${activeCourseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setCertData(await res.json());
      } catch (err) {
        console.error('Error fetching cert metadata:', err);
      } finally {
        setLoading(false);
      }
    };
    if (activeCourseId && token) fetchMetadata();
    else setLoading(false);
  }, [token, API_BASE_URL, activeCourseId]);

  const studentName = decodeMojibake(user?.nombre_completo) || 'Estudiante';
  const codigo = certData?.codigo_verificacion || 'ALIM-XXXX-XXXX';
  const numeroCert = certData?.numero_certificado || 'AS-2026-0001';
  const certSeq = numeroCert.replace('AS-2026-', '') || '0001';
  const { day, month, year } = formatSpanishDate(certData?.fecha_emision);

  // Public verification URL (HashRouter → /#/verify/<code>)
  const verifyUrl = `${window.location.origin}/#/verify/${encodeURIComponent(codigo)}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=2&data=${encodeURIComponent(verifyUrl)}`;

  const handleDownload = async (kind: 'diploma' | 'acta') => {
    setProcessingDoc(kind);
    try {
      if (kind === 'diploma') await downloadCertificate();
      else await downloadActa();
    } finally {
      // brief cinematic "digital signing" flourish even after stream resolves
      setTimeout(() => setProcessingDoc(null), 900);
    }
  };

  const isProcessing = processingDoc !== null;

  return (
    <div className="bachiller-stage">
      <button className="bachiller-back-btn" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={18} />
        <span>Volver al Dashboard</span>
      </button>

      <div className="bachiller-split">
        {/* ============ PANEL PRINCIPAL (65%) — DIPLOMA EN MARFIL ============ */}
        <div className="bachiller-panel-main" id="bachiller-print-area">
          <div className="bachiller-frame" />

          {/* Shimmer / Glow processing sweep */}
          <div className={`bachiller-shimmer ${isProcessing ? 'is-active' : ''}`} />
          {isProcessing && (
            <div className="bachiller-processing-badge">
              <Loader2 size={13} className="animate-spin" />
              {processingDoc === 'diploma' ? 'Firmando digitalmente diploma…' : 'Firmando digitalmente acta…'}
            </div>
          )}

          <div className="bachiller-diploma">
            <div className="bachiller-crest-row">
              <ColombiaCrest size={56} />
              <img src={logoNorte} alt="Instituto Superior del Norte" style={{ height: 52, width: 'auto' }} />
            </div>

            <h3 className="bachiller-republic">REPÚBLICA DE COLOMBIA</h3>
            <h1 className="bachiller-inst">Instituto Superior del Norte</h1>
            <p className="bachiller-resolution">RESOLUCIÓN N° 10-50-2373 DE LA SECRETARÍA DE EDUCACIÓN MUNICIPAL DE MEDELLÍN</p>

            <h2 className="bachiller-confiere">Confiere a:</h2>
            <h1 className="bachiller-student-name">{studentName}</h1>
            <p className="bachiller-student-id">Identificado(a) con C.C. N° {user?.cedula}</p>

            <p className="bachiller-titulo-de">El Título de:</p>
            <h1 className="bachiller-titulo-nombre">Bachiller Académico</h1>

            <p className="bachiller-legal">
              Por haber cursado y aprobado la totalidad de los estudios correspondientes al nivel de Educación Media Académica,
              según los planes de estudio y programas vigentes de la institución y autorizados por el Ministerio de Educación Nacional.
            </p>

            <div className="bachiller-firmas">
              <div className="bachiller-firma-box">
                <span className="bachiller-firma-grafica">A. Gualtero</span>
                <div className="bachiller-firma-line" />
                <span className="bachiller-firma-name">Dr. Alberto Heriberto Gualtero</span>
                <span className="bachiller-firma-charge">Rector</span>
              </div>
              <div className="bachiller-firma-box">
                <span className="bachiller-firma-grafica">C. Vera M.</span>
                <div className="bachiller-firma-line" />
                <span className="bachiller-firma-name">Dra. Carlos Alberto Vera</span>
                <span className="bachiller-firma-charge">Secretaria Académica</span>
              </div>
            </div>

            <p className="bachiller-fecha">
              Dado en la ciudad de Medellín, Colombia, a los {day} días del mes de {month} de {year}
            </p>
          </div>
        </div>

        {/* ============ PANEL LATERAL (35%) — CINE OSCURO ============ */}
        <div className="bachiller-panel-side">
          <div>
            <p className="bachiller-side-eyebrow">Certificación Oficial</p>
            <h2 className="bachiller-side-title">Bachiller Académico</h2>
            <p className="bachiller-side-sub">
              {courseTitle || 'Título de Educación Media Académica'} — Documento de carácter oficial amparado por el Ministerio de Educación Nacional.
            </p>
          </div>

          <div className="bachiller-meta-grid">
            <div className="bachiller-meta-card">
              <div className="label">Acta No.</div>
              <div className="value">{certSeq}</div>
            </div>
            <div className="bachiller-meta-card">
              <div className="label">Folio No.</div>
              <div className="value">{certSeq}</div>
            </div>
            <div className="bachiller-meta-card">
              <div className="label">Registro</div>
              <div className="value">{numeroCert}</div>
            </div>
            <div className="bachiller-meta-card">
              <div className="label">Calificación</div>
              <div className="value">{certData?.calificacion_obtenida != null ? `${certData.calificacion_obtenida}%` : '100%'}</div>
            </div>
          </div>

          <div className="bachiller-qr-wrap">
            <img src={qrSrc} alt={`QR de verificación pública ${codigo}`} />
            <div className="bachiller-qr-caption">
              <ShieldCheck size={13} style={{ display: 'inline', marginBottom: '-2px', marginRight: 4 }} />
              Verificación Pública de Autenticidad
            </div>
            <div className="bachiller-verify-code">{codigo}</div>
          </div>

          <div className="bachiller-actions">
            <button
              className="bachiller-btn bachiller-btn-primary"
              onClick={() => handleDownload('diploma')}
              disabled={isProcessing || loading}
            >
              {processingDoc === 'diploma' ? <Loader2 size={18} className="animate-spin" /> : <Award size={18} />}
              <span>Descargar Diploma PDF</span>
            </button>
            <button
              className="bachiller-btn bachiller-btn-secondary"
              onClick={() => handleDownload('acta')}
              disabled={isProcessing || loading}
            >
              {processingDoc === 'acta' ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              <span>Descargar Acta de Grado PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BachillerCertificate;
