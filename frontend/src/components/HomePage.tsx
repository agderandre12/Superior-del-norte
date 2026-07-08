import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logoLogo from '../assets/logo_instituto_norte.png';
import heroGraphic from '../assets/hero_graphic.png';
import securityQR from '../assets/security_qr.png';
import campusBuilding from '../assets/campus_building.png';
import { Award, BookOpen, Clock, ShieldCheck, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

// Course Card Images
import alimentosHigiene from '../assets/alimentos_higiene.png';
import haccpCalidad from '../assets/haccp_calidad.png';
import bpmManufactura from '../assets/bpm_manufactura.png';
import mecanicaBasica from '../assets/mecanica_basica.png';
import primerosAuxilios from '../assets/primeros_auxilios.png';
import manejoDefensivo from '../assets/manejo_defensivo.png';
import manejo4x4 from '../assets/manejo_4x4.png';
import atencionCliente from '../assets/atencion_cliente.png';
import paqueteMedico from '../assets/paquete_medico.png';

const coursesData = [
  {
    id: 1,
    titulo: "Manipulación Higiénica de Alimentos",
    descripcion: "Certificación oficial obligatoria para personal del sector de alimentos. Normativas sanitarias de higiene, control de puntos críticos y prevención de contaminación.",
    horas: 3,
    nivel: "",
    imagenText: "Manipulación e Higiene de Alimentos",
    imagen: alimentosHigiene
  },
  {
    id: 2,
    titulo: "Sistemas de Aseguramiento de Calidad (HACCP)",
    descripcion: "Análisis de peligros y control de puntos críticos. Diseñado para supervisores y jefes de calidad en la industria alimentaria.",
    horas: 8,
    nivel: "",
    imagenText: "Control de Calidad HACCP",
    imagen: haccpCalidad
  },
  {
    id: 3,
    titulo: "Buenas Prácticas de Manufactura (BPM)",
    descripcion: "Principios básicos y requisitos de higiene bajo regulaciones nacionales vigentes para establecimientos alimentarios.",
    horas: 6,
    nivel: "",
    imagenText: "Principios de Manufactura BPM",
    imagen: bpmManufactura
  },
  {
    id: 4,
    titulo: "Curso de Mecánica Básica",
    descripcion: "Capacitación práctica en diagnóstico preventivo, sistemas del vehículo, cambio de neumáticos y mantenimiento esencial para conductores.",
    horas: 24,
    nivel: "",
    imagenText: "Mecánica Básica",
    imagen: mecanicaBasica
  },
  {
    id: 5,
    titulo: "Curso de Primeros Auxilios",
    descripcion: "Formación vital en atención prehospitalaria, reanimación cardiopulmonar (RCP), manejo de heridas y respuesta inmediata ante emergencias médicas.",
    horas: 18,
    nivel: "",
    imagenText: "Primeros Auxilios",
    imagen: primerosAuxilios
  },
  {
    id: 6,
    titulo: "Curso de Manejo Defensivo",
    descripcion: "Técnicas avanzadas de conducción segura, anticipación de riesgos en la vía, psicología del conductor y prevención de accidentes de tránsito.",
    horas: 20,
    nivel: "",
    imagenText: "Manejo Defensivo",
    imagen: manejoDefensivo
  },
  {
    id: 7,
    titulo: "Curso de Manejo 4x4",
    descripcion: "Dominio técnico de vehículos de tracción integral, control en terrenos difíciles (barro, arena, pendientes pronunciadas) y uso correcto de implementos de rescate.",
    horas: 32,
    nivel: "",
    imagenText: "Manejo 4x4",
    imagen: manejo4x4
  },
  {
    id: 8,
    titulo: "Curso de Atención al Cliente",
    descripcion: "Desarrollo de habilidades blandas, comunicación asertiva, resolución de conflictos y excelencia en el servicio para la fidelización de usuarios.",
    horas: 18,
    nivel: "",
    imagenText: "Atención al Cliente",
    imagen: atencionCliente
  },
  {
    id: 9,
    titulo: "Paquete de Cursos Médicos en Salud",
    descripcion: "Compendio especializado orientado al personal asistencial, cubriendo protocolos de bioseguridad, normatividad en salud y actualización en procedimientos clínicos básicos.",
    horas: 30,
    nivel: "",
    imagenText: "Paquete Médico",
    imagen: paqueteMedico
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { API_BASE_URL } = useContext(AppContext);

  // Verification states
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = verificationCode.trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setVerifyError(null);
    setVerifyResult(null);

    try {
      // encodeURIComponent guards against codes that contain reserved path
      // characters which would otherwise break the request or be mis-parsed.
      const response = await fetch(`${API_BASE_URL}/certificate/verify/${encodeURIComponent(code)}`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg =
          data?.error?.message ||
          data?.error ||
          (response.status === 404
            ? 'No se encontró ningún diploma con ese código en el registro oficial.'
            : response.status === 429
            ? 'Demasiadas consultas. Espere unos segundos e intente nuevamente.'
            : 'Código de certificado no válido.');
        throw new Error(msg);
      }
      // The public verify endpoint returns the payload at the top level; the
      // `?? data` fallback tolerates a future `{ success, data }` envelope.
      const payload = data?.data ?? data;
      if (!payload || payload.valido === false) {
        throw new Error(payload?.error?.message || payload?.error || 'Diploma no encontrado en el registro oficial.');
      }
      setVerifyResult(payload);
    } catch (err) {
      setVerifyError(err?.message || 'Código de verificación no encontrado en el registro oficial');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--isn-bg-light)', minHeight: '100vh', width: '100%' }}>
      {/* 1. Header de Navegación Estacionario */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-glass)',
        boxShadow: '0 10px 30px -10px rgba(15, 44, 89, 0.04)',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px'
      }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => scrollToSection('home')}>
            <img src={logoLogo} alt="Instituto Superior del Norte" style={{ height: '55px', width: 'auto' }} />
            <h1 className="font-serif nav-title-responsive" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--isn-blue)', margin: 0 }}>
              Instituto Superior del Norte
            </h1>
          </div>

          {/* Nav Links & CTA Button wrapper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="nav-links-responsive" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <button onClick={() => scrollToSection('home')} style={{ background: 'none', border: 'none', color: 'var(--isn-charcoal)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Inicio</button>
              <button onClick={() => scrollToSection('courses')} style={{ background: 'none', border: 'none', color: 'var(--isn-charcoal)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Programas</button>
              <button onClick={() => scrollToSection('verification')} style={{ background: 'none', border: 'none', color: 'var(--isn-charcoal)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Verificación</button>
              <button onClick={() => scrollToSection('about')} style={{ background: 'none', border: 'none', color: 'var(--isn-charcoal)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>Nosotros</button>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{
                borderRadius: '9999px',
                padding: '10px 20px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(15, 44, 89, 0.12)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              Acceder al Campus Virtual
            </button>
          </div>
        </div>
      </nav>

      <div id="home" style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>

        {/* 2. Sección Hero Principal */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', marginBottom: '64px' }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: '3rem', color: 'var(--isn-blue)', lineHeight: 1.15, fontWeight: 900, marginBottom: '24px' }}>
              Formación superior para el mundo real
            </h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--isn-charcoal)', lineHeight: '1.6', marginBottom: '36px' }}>
              Capacítate bajo estándares oficiales del Instituto Superior del Norte. Desarrolla las competencias obligatorias y certifica tus conocimientos en manipulación higiénica de alimentos con validez curricular nacional.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => scrollToSection('courses')}
                className="btn"
                style={{
                  background: 'var(--accent-green-btn)',
                  color: '#FFFFFF',
                  padding: '14px 28px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                }}
              >
                Ver Programas Académicos
              </button>
              <button
                onClick={() => scrollToSection('verification')}
                className="btn"
                style={{
                  background: '#F1F5F9',
                  color: 'var(--isn-blue)',
                  padding: '14px 28px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Validar Certificado
              </button>
            </div>
          </div>

          {/* 3. Reserva de Espacios para Contenido Gráfico (Hero Side) */}
          <div className="glass-panel" style={{
            height: '400px',
            overflow: 'hidden',
            borderRadius: '24px',
            position: 'relative',
            boxShadow: '0 20px 40px -15px rgba(15, 44, 89, 0.08)',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFFFFF'
          }}>
            <img 
              src={heroGraphic} 
              alt="Infografía de Formación del Campus" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </section>

        {/* 4. Sección de Programas Destacados */}
        <section id="courses" style={{ marginBottom: '80px', paddingTop: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: 'var(--isn-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Especialidades Académicas</span>
            <h3 className="font-serif" style={{ fontSize: '2.25rem', color: 'var(--isn-blue)', fontWeight: 800, marginTop: '4px' }}>Programas Disponibles</h3>
            <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--isn-blue)', margin: '12px auto 0 auto', borderRadius: '2px' }} />
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '24px', color: 'var(--isn-charcoal)', fontSize: '0.95rem', textDecoration: 'none', border: '1px solid rgba(15, 44, 89, 0.1)', padding: '10px 20px', borderRadius: '9999px', transition: 'all 0.3s', backgroundColor: 'rgba(15, 44, 89, 0.02)' }}>
              ¿Necesitas una certificación en específico? <span style={{ color: 'var(--isn-blue)', fontWeight: 700 }}>Contáctanos y te ayudamos</span>
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
            {coursesData.map((course) => (
              <div key={course.id} className="glass-panel course-card" style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}>
                {/* Visual Placeholder for Course Image */}
                <div style={{
                  height: '180px',
                  backgroundColor: 'var(--isn-blue-dark)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#FFFFFF',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {course.imagen ? (
                    <img
                      src={course.imagen}
                      alt={course.titulo}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      className="course-image-hover"
                    />
                  ) : (
                    <>
                      <BookOpen size={36} color="var(--isn-gold)" style={{ marginBottom: '8px' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{course.imagenText}</span>
                    </>
                  )}
                  {course.nivel && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(15, 44, 89, 0.65)',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px'
                    }}>
                      {course.nivel}
                    </div>
                  )}
                </div>

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--isn-blue)', fontWeight: 800, marginBottom: '12px' }}>
                    {course.titulo}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--isn-charcoal)', lineHeight: '1.5', flex: 1, marginBottom: '20px' }}>
                    {course.descripcion}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--isn-charcoal)', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Clock size={16} color="var(--isn-gold)" />
                      <span>{course.horas} horas lectivas</span>
                    </div>

                    <a
                      href="https://wa.me/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--isn-blue)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        textDecoration: 'none'
                      }}
                    >
                      Matricularse →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* 5. Sección de Verificación en Línea */}
        <section id="verification" className="glass-panel" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '48px 32px',
          marginBottom: '80px',
          position: 'relative'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '48px', position: 'relative', zIndex: 1 }}>
            <div>
              <span style={{ color: 'var(--isn-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.85rem' }}>Registro Académico Nacional</span>
              <h3 className="font-serif" style={{ fontSize: '2rem', color: 'var(--isn-blue)', fontWeight: 900, marginTop: '4px', marginBottom: '16px' }}>
                Verificación Pública de Diplomas
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--isn-charcoal)', lineHeight: '1.6', marginBottom: '24px' }}>
                Todos los certificados emitidos por el Instituto Superior del Norte poseen un código único de verificación. Los empleadores y autoridades sanitarias pueden comprobar de manera inmediata la autenticidad de cualquier credencial académica en nuestro servidor central.
              </p>

              {/* Formular input estilizado */}
              <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Ej. ALIM-1234-5678"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-glass)',
                      fontSize: '1rem',
                      outline: 'none',
                      backgroundColor: 'var(--isn-bg-light)',
                      color: 'var(--isn-blue-dark)',
                      fontWeight: 700
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !verificationCode.trim()}
                  className="btn btn-primary"
                  style={{
                    fontWeight: 700,
                    padding: '0 24px',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  <span>Validar Diploma</span>
                </button>
              </form>

              {/* Results Container */}
              {verifyError && (
                <div style={{
                  marginTop: '20px',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--accent-rose)',
                  fontSize: '0.9rem'
                }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                  <span>{verifyError}</span>
                </div>
              )}

              {verifyResult && (
                <div style={{
                  marginTop: '20px',
                  backgroundColor: 'rgba(15, 44, 89, 0.03)',
                  borderRadius: '12px',
                  padding: '20px',
                  color: 'var(--isn-blue-dark)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--isn-blue)', fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
                    <CheckCircle size={18} />
                    <span>CERTIFICADO OFICIAL VÁLIDO</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4px 16px', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Estudiante:</span>
                    <span className="font-serif" style={{ fontWeight: 800 }}>{verifyResult.nombre_completo || verifyResult.usuario}</span>

                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Identificación:</span>
                    <span className="font-sans-mono">{verifyResult.cedula}</span>

                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Programa:</span>
                    <span style={{ fontWeight: 600 }}>{verifyResult.curso_titulo}</span>

                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Registro N°:</span>
                    <span className="font-sans-mono" style={{ color: 'var(--isn-gold)', fontWeight: 700 }}>{verifyResult.numero_certificado}</span>

                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Calificación:</span>
                    <span style={{ fontWeight: 700 }}>{verifyResult.calificacion_obtenida}%</span>

                    <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Fecha de Emisión:</span>
                    <span>{verifyResult.fecha_emision}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Reserva de Espacios para Contenido Gráfico (Verification Side) */}
            <div className="glass-panel" style={{
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px',
              textAlign: 'center',
              borderRadius: '24px',
              position: 'relative',
              boxShadow: '0 20px 40px -15px rgba(15, 44, 89, 0.08)',
              border: 'none'
            }}>
              <h4 className="font-serif" style={{ fontSize: '1.1rem', color: 'var(--isn-blue)', fontWeight: 800, marginBottom: '6px' }}>
                Sello de Seguridad Digital
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--isn-charcoal)', maxWidth: '220px', lineHeight: '1.4' }}>
                Acreditación oficial protegida mediante firma y registro criptográfico.
              </p>
              <img 
                src={securityQR} 
                alt="Código QR de Verificación" 
                style={{ width: '100px', height: '100px', objectFit: 'contain', marginTop: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }} 
              />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px', alignItems: 'center', paddingBottom: '24px' }}>
          {/* Graphic Placeholder (About Side) */}
          <div className="glass-panel" style={{
            height: '350px',
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
            borderRadius: '24px',
            boxShadow: '0 20px 40px -15px rgba(15, 44, 89, 0.08)',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img 
              src={campusBuilding} 
              alt="Sede e Instalaciones del Instituto" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          <div>
            <span style={{ color: 'var(--isn-gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Sobre Nuestra Institución</span>
            <h3 className="font-serif" style={{ fontSize: '2.25rem', color: 'var(--isn-blue)', fontWeight: 800, marginTop: '4px', marginBottom: '16px' }}>
              Comprometidos con la Calidad Académica
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--isn-charcoal)', lineHeight: '1.6', marginBottom: '16px' }}>
              El Instituto Superior del Norte (ISN) es un centro de formación superior enfocado en proveer cursos, diplomados y capacitaciones profesionales con certificación oficial para la inserción en el mercado productivo.
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--isn-charcoal)', lineHeight: '1.6' }}>
              NuestroCampus Virtual cuenta con ambientes dinámicos de aprendizaje, simuladores multimedia avanzados y sistemas automatizados de calificación y emisión de registros para garantizar un proceso educativo transparente, ágil y de excelencia.
            </p>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--isn-blue-dark)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
        padding: '36px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--isn-gold)', margin: 0 }}>
            Instituto Superior del Norte
          </p>
          <p style={{ fontSize: '0.8rem', color: '#D2D6DC', margin: 0 }}>
            © 2026 Instituto Superior del Norte. Todos los derechos reservados.
          </p>
          <p style={{ fontSize: '0.75rem', color: '#9AA5B1', maxWidth: '600px', margin: '0 auto' }}>
            Acreditación académica de programas educativos. Para consultas de soporte y matrículas adicionales, contáctese directamente con la administración del Campus Virtual.
          </p>
        </div>
      </footer>
    </div>
  );
}
