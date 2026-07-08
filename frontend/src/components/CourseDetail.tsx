import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { BookOpen, CheckCircle, Circle, Award, FileText, Clock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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

const CourseDetail = () => {
  const {
    user,
    progress,
    modules,
    setActiveModuleId,
    examStatus,
    downloadCertificate,
    downloadActa,
    studentCourses,
    activeCourseId
  } = useContext(AppContext);
  const navigate = useNavigate();

  const totalModules = modules.length;
  const completedCount = progress?.modulos_completados?.length || 0;
  const isFinishedAllModules = completedCount === totalModules && totalModules > 0;
  const hasApprovedExam = examStatus && examStatus.aprobado;

  const displayCourse = studentCourses.find(c => c.id === activeCourseId);

  const handleCourseAction = () => {
    if (isFinishedAllModules) {
      if (hasApprovedExam) {
        navigate(`/certificate/${activeCourseId}`);
      } else {
        navigate(`/course/${activeCourseId}/exam`);
      }
    } else {
      const firstUncompleted = modules.find(m => !progress?.modulos_completados?.includes(m.id));
      const targetId = firstUncompleted ? firstUncompleted.id : (modules[0]?.id || null);
      setActiveModuleId(targetId);
      navigate(`/course/${activeCourseId}`);
    }
  };

  const handleModuleClick = (moduleId) => {
    setActiveModuleId(moduleId);
    navigate(`/course/${activeCourseId}`);
  };

  if (!displayCourse) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '32px' }} className="glass-panel">
        <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Cargando detalles del curso...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontWeight: 700
          }}
        >
          ← Volver a todos mis cursos
        </button>
      </div>

      {/* Welcome Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="font-serif" style={{ fontSize: '2.25rem', color: 'var(--isn-blue)', fontWeight: 900, marginBottom: '6px' }}>
          ¡Bienvenido, {decodeMojibake(user?.nombre_completo)}!
        </h1>
        <p style={{ color: 'var(--isn-charcoal)', fontSize: '1.05rem' }}>
          {isFinishedAllModules 
            ? 'Has completado todos los contenidos formativos. Continúa con tu evaluación.'
            : 'Continúa tu aprendizaje donde lo dejaste.'}
        </p>
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="course-grid">
        
        {/* Left Side: Course Progress & Modules list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: '24px', backgroundColor: '#FFFFFF' }}>
            {/* Banner Image */}
            <div style={{ position: 'relative', height: '240px', overflow: 'hidden', background: 'linear-gradient(135deg, #0F2C59 0%, #008DDA 100%)' }}>
              {displayCourse.imagen_url && (
                <img
                  src={displayCourse.imagen_url}
                  alt={displayCourse.titulo}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              {/* Overlay Gradient */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15, 44, 89, 0.85) 0%, rgba(15, 44, 89, 0.3) 60%, transparent 100%)'
              }} />
              
              <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', color: '#FFFFFF' }}>
                <span style={{
                  background: isFinishedAllModules ? 'var(--accent-emerald)' : 'var(--accent-gold)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'inline-block',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {isFinishedAllModules ? 'Contenido Finalizado' : 'En Progreso'}
                </span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {displayCourse.titulo}
                </h2>
              </div>
            </div>

            <div style={{ padding: '28px' }}>
              {/* Progress Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Progreso de la formación</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{progress?.progreso_porcentaje || 0}%</span>
                </div>
                
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${progress?.progreso_porcentaje || 0}%` }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={16} color="var(--accent-emerald)" />
                    <span>{completedCount} de {totalModules} módulos completados</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="var(--accent-gold)" />
                    <span>Autogestionado</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="btn btn-primary" 
                onClick={handleCourseAction} 
                style={{ width: '100%', height: '52px', fontSize: '1rem' }}
              >
                {isFinishedAllModules ? (
                  hasApprovedExam ? (
                    <>
                      <Award size={20} />
                      <span>Ver Certificado</span>
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      <span>Realizar Examen Final</span>
                    </>
                  )
                ) : (
                  <>
                    <BookOpen size={20} />
                    <span>{(progress?.progreso_porcentaje || 0) > 0 ? 'Continuar Curso' : 'Iniciar Aprendizaje'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Modules List */}
          <div className="glass-panel" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px', color: 'var(--isn-blue)' }}>
              Temario del Curso ({totalModules} Módulos obligatorios)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {modules.map((m, index) => {
                const isCompleted = progress?.modulos_completados?.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => handleModuleClick(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: '12px',
                      background: isCompleted ? 'rgba(15, 44, 89, 0.03)' : '#FFFFFF',
                      border: '1px solid rgba(15, 44, 89, 0.06)',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(15, 44, 89, 0.02)'
                    }}
                    className="module-item-hover"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                      {isCompleted ? (
                        <CheckCircle size={20} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
                      ) : (
                        <Circle size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      )}
                      
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          Módulo {index + 1}: {m.titulo}
                        </p>
                      </div>
                    </div>
                    
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: isCompleted ? '#E2E8F0' : '#008DDA15',
                      color: isCompleted ? 'var(--text-muted)' : 'var(--accent-teal)',
                      marginLeft: '12px',
                      flexShrink: 0
                    }}>
                      {m.tipo_recurso}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Sidebar Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Status Widget */}
          <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: hasApprovedExam ? 'rgba(78, 159, 61, 0.1)' : 'rgba(0, 141, 218, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {hasApprovedExam ? (
                  <ShieldCheck size={22} color="var(--accent-emerald)" />
                ) : (
                  <Clock size={22} color="var(--accent-teal)" />
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 className="font-serif" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--isn-blue)', marginBottom: '6px' }}>
                  {hasApprovedExam ? 'Formación Finalizada' : 'Próximo Paso Requerido'}
                </h3>
                
                {hasApprovedExam ? (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      Has aprobado exitosamente el examen final con una calificación del {examStatus.score}%.
                    </p>
                    <div style={{ background: 'rgba(15, 44, 89, 0.04)', border: '1px solid rgba(15, 44, 89, 0.1)', padding: '12px', borderRadius: '10px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        Certificado Emitido
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Calificación: {examStatus.score}%
                      </p>
                    </div>
                  </div>
                ) : isFinishedAllModules ? (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      ¡Has completado todos los módulos formativos! Ya puedes realizar el examen final.
                    </p>
                    <button
                      onClick={() => navigate(`/course/${activeCourseId}/exam`)}
                      className="btn"
                      style={{
                        background: 'var(--accent-gold)',
                        color: '#FFFFFF',
                        width: '100%',
                        padding: '10px 16px',
                        fontSize: '0.9rem'
                      }}
                    >
                      <span>Comenzar Examen</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      Debes visualizar y completar los {totalModules} módulos del temario para desbloquear el examen.
                    </p>
                    <div style={{ background: 'rgba(240, 165, 0, 0.08)', border: '1px solid rgba(240, 165, 0, 0.2)', padding: '12px', borderRadius: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <AlertCircle size={18} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Examen final bloqueado temporalmente
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificate Card */}
          <div className="glass-panel" style={{
            background: 'linear-gradient(135deg, var(--isn-blue) 0%, var(--isn-blue-dark) 100%)',
            color: '#FFFFFF',
            padding: '28px',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              right: '-20px',
              bottom: '-20px',
              opacity: 0.1,
              transform: 'rotate(-10deg)',
              color: '#FFFFFF'
            }}>
              <Award size={180} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                Certificación Oficial
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', marginBottom: '20px' }}>
                Obtén tu acreditación en {displayCourse.titulo}, válida a nivel nacional por autoridades sanitarias vigentes.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.95)' }}>
                  <CheckCircle size={16} color="#FFFFFF" />
                  <span>Acreditación curricular válida</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.95)' }}>
                  <CheckCircle size={16} color="#FFFFFF" />
                  <span>Código único de verificación en línea</span>
                </div>
              </div>

              {hasApprovedExam ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => navigate(`/certificate/${activeCourseId}`)}
                    className="btn"
                    style={{ background: '#FFFFFF', color: 'var(--text-primary)', width: '100%', padding: '12px', borderRadius: '9999px', border: '1px solid #E2E8F0', fontWeight: 700 }}
                  >
                    Ver Certificación y Documentos
                  </button>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button 
                      onClick={downloadCertificate}
                      className="btn" 
                      style={{ background: 'var(--isn-blue)', color: '#FFFFFF', flex: 1, padding: '12px', borderRadius: '9999px', fontWeight: 700 }}
                    >
                      Diploma
                    </button>
                    {displayCourse.certificacion_directa === 1 ? (
                      <button 
                        onClick={downloadActa}
                        className="btn" 
                        style={{ background: 'var(--accent-emerald)', color: '#FFFFFF', flex: 1, padding: '12px', borderRadius: '9999px', fontWeight: 700 }}
                      >
                        Acta de Grado
                      </button>
                    ) : (
                      <button 
                        onClick={downloadCertificate}
                        className="btn" 
                        style={{ background: 'var(--accent-emerald)', color: '#FFFFFF', flex: 1, padding: '12px', borderRadius: '9999px', fontWeight: 700 }}
                      >
                        Descargar PDF
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  fontWeight: 500,
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}>
                  Completa el curso y aprueba el examen final para descargar.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CourseDetail;
