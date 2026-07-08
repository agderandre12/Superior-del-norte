import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logoNorte from '../assets/logo_instituto_norte.png';
import { Download, ArrowLeft, CheckCircle, ExternalLink, Check, Copy } from 'lucide-react';
import { sanitizeHtml } from '../utils/sanitize';
import BachillerCertificate from './BachillerCertificate';


const decodeMojibake = (str: string | undefined): string | undefined => {
  if (!str) return str;
  try {
    const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
    const decoded = new TextDecoder('utf-8').decode(bytes);
    if (!decoded.includes('\uFFFD')) {
      return decoded;
    }
  } catch (e) {}

  const mapping = [
    ['Ã¡', 'á'], ['Ã©', 'é'], ['Ã­', 'í'], ['Ã³', 'ó'], ['Ãº', 'ú'],
    ['Ã±', 'ñ'], ['Ã‘', 'Ñ'], ['Ã ', 'Á'], ['Ã‰', 'É'], ['Ã ', 'Í'],
    ['Ã“', 'Ó'], ['Ãš', 'Ú'], ['Ã¼', 'ü'], ['Ãœ', 'Ü']
  ];
  let result = str;
  for (const [mojibake, correct] of mapping) {
    result = result.replaceAll(mojibake, correct);
  }
  return result;
};

const Certificate = () => {
  const { user, downloadCertificate, downloadActa, token, API_BASE_URL, activeCourseId, studentCourses } = useContext(AppContext);
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [copied, setCopied] = useState(false);

  const currentCourse = studentCourses.find(c => c.id === activeCourseId);
  const courseTitle = currentCourse ? currentCourse.titulo : 'Curso de Manipulación Higiénica de Alimentos';

  // Cinematic asymmetric-split (65/35) view for the Bachiller Académico course,
  // which is flagged with `certificacion_directa` in the database. All other
  // courses render the standard institutional certificate layout below.
  if (currentCourse?.certificacion_directa === 1) {
    return <BachillerCertificate courseTitle={courseTitle} />;
  }

  // Fetch certificate metadata from `/api/certificate/detail`
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const resCert = await fetch(`${API_BASE_URL}/certificate/detail?courseId=${activeCourseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resCert.ok) {
          const data = await resCert.json();
          setCertData(data);
        }
      } catch (err) {
        console.error('Error fetching cert metadata:', err);
      }
    };
    if (activeCourseId) {
      fetchMetadata();
    }
  }, [token, API_BASE_URL, activeCourseId]);

  const handleCopyCode = () => {
    if (certData?.codigo_verificacion) {
      navigator.clipboard.writeText(certData.codigo_verificacion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 16px', backgroundColor: 'var(--isn-bg-light)' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: landscape;
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #print-certificate-area, #print-certificate-area * {
            visibility: visible;
          }
          #print-certificate-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            border: none;
          }
          /* hide header and footer */
          nav, footer, button, .lucide {
            display: none !important;
          }
        }
      ` }} />
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--isn-blue)',
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
        <span>Volver al Dashboard</span>
      </button>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', borderRadius: '24px', backgroundColor: '#FFFFFF' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '32px' }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: '1.75rem', color: 'var(--isn-blue)', fontWeight: 900 }}>Tu Certificación Oficial</h2>
            <p style={{ color: 'var(--isn-charcoal)', fontSize: '0.95rem', marginTop: '4px', fontWeight: 600 }}>
              {courseTitle}
            </p>
          </div>
          {currentCourse?.certificacion_directa === 1 ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={downloadCertificate}
                style={{ height: '46px', borderRadius: '9999px', fontWeight: 700 }}
              >
                <Download size={18} />
                <span>Descargar Diploma</span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={downloadActa}
                style={{ height: '46px', borderRadius: '9999px', fontWeight: 700 }}
              >
                <Download size={18} />
                <span>Descargar Acta de Grado</span>
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={certData?.certificado_template ? () => window.print() : downloadCertificate}
              style={{ height: '46px', borderRadius: '9999px' }}
            >
              <Download size={18} />
              <span>{certData?.certificado_template ? 'Imprimir / Guardar PDF' : 'Descargar PDF Oficial'}</span>
            </button>
          )}
        </div>

        {/* Certificate Preview Card — sanitized to prevent stored XSS via admin template */}
        {certData?.certificado_template ? (
          <div
            id="print-certificate-area"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(certData.certificado_template) }}
            style={{
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '32px'
            }}
          />
        ) : (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-glass)',
            borderRadius: '16px',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '32px'
          }}>
            
            {/* Inner Gold Border */}
            <div style={{
              position: 'absolute',
              top: 8,
              left: 8,
              right: 8,
              bottom: 8,
              border: '1px solid var(--isn-gold)',
              borderRadius: '12px',
              pointerEvents: 'none'
            }} />

            {/* Decorative Corner Lines */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', width: '48px', height: '48px', borderLeft: '2px solid var(--isn-gold)', borderTop: '2px solid var(--isn-gold)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '16px', right: '16px', width: '48px', height: '48px', borderRight: '2px solid var(--isn-gold)', borderTop: '2px solid var(--isn-gold)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '48px', height: '48px', borderLeft: '2px solid var(--isn-gold)', borderBottom: '2px solid var(--isn-gold)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '48px', height: '48px', borderRight: '2px solid var(--isn-gold)', borderBottom: '2px solid var(--isn-gold)', pointerEvents: 'none' }} />

            <img src={logoNorte} alt="Instituto Superior del Norte" style={{ width: '190px', height: 'auto', margin: '0 auto 16px auto', display: 'block' }} />
            <h3 className="font-serif" style={{ fontSize: '1.8rem', color: 'var(--isn-blue)', fontWeight: 900, marginBottom: '4px' }}>
              CERTIFICADO DE APROBACIÓN
            </h3>
            
            <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', color: 'var(--isn-gold)', fontWeight: 800, marginBottom: '24px' }}>
              {courseTitle.toUpperCase()}
            </p>
            
            {certData?.numero_certificado && (
              <p className="font-sans-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--isn-blue)', marginBottom: '20px' }}>
                REGISTRO N°: <span style={{ color: 'var(--isn-gold)' }}>{certData.numero_certificado}</span>
              </p>
            )}
            
            <p style={{ fontSize: '0.9rem', color: 'var(--isn-charcoal)', marginBottom: '8px' }}>
              Se otorga el presente documento de certificación y participación a:
            </p>
            <p className="font-serif" style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--isn-blue)', borderBottom: '1.5px solid var(--isn-gold)', display: 'inline-block', padding: '2px 16px', marginBottom: '8px' }}>
              {decodeMojibake(user?.nombre_completo)?.toUpperCase()}
            </p>
            <p className="font-sans-mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--isn-blue-dark)', marginBottom: '24px' }}>
              Cédula de Identidad N°: {user?.cedula}
            </p>
            
            <div style={{ width: '80%', height: '1px', background: '#E2E8F0', margin: '0 auto 20px auto' }} />
            
            <p style={{ fontSize: '0.9rem', color: 'var(--isn-charcoal)', maxWidth: '80%', margin: '0 auto', lineHeight: '1.5', fontWeight: 500 }}>
              Por haber cumplido con todos los requisitos académicos del curso y aprobado satisfactoriamente la evaluación de conocimientos sobre normas higiénico-sanitarias vigentes.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 600 }}>
                Intensidad: 3 Horas Lectivas
              </p>
              {certData?.calificacion_obtenida && (
                <p style={{ fontSize: '0.8rem', color: 'var(--isn-blue)', fontWeight: 800 }}>
                  Calificación: {certData.calificacion_obtenida}%
                </p>
              )}
            </div>
          </div>
        )}

        {/* Verification Details */}
        {certData && (
          <div style={{
            background: 'var(--isn-bg-light)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: 800 }}>
                Verificación de Autenticidad
              </p>
              <p className="font-sans-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--isn-blue-dark)' }}>
                {certData.codigo_verificacion}
              </p>
              <p className="font-sans-mono" style={{ fontSize: '0.85rem', color: 'var(--isn-charcoal)', marginTop: '4px' }}>
                Emitido el: {certData.fecha_emision}
              </p>
            </div>
            
            <button
              onClick={handleCopyCode}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', fontSize: '0.85rem', height: '42px', borderRadius: '4px' }}
            >
              {copied ? (
                <>
                  <Check size={16} color="var(--isn-success)" />
                  <span style={{ color: 'var(--isn-success)', fontWeight: 700 }}>Copiado</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Certificate;
