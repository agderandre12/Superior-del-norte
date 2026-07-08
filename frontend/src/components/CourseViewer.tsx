import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Play, Pause, ChevronLeft, ChevronRight, CheckCircle2, Award, ArrowLeft, Volume2, Film, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sanitizeHtml } from '../utils/sanitize';

const CourseViewer = () => {
  const {
    modules,
    progress,
    activeModuleId,
    setActiveModuleId,
    completeModule,
    activeCourseId,
    examStatus
  } = useContext(AppContext);
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);

  const currentModule = modules.find(m => m.id === activeModuleId) || modules[0];
  const isCompleted = progress.modulos_completados.includes(currentModule?.id);

  // Reset play simulator when switching modules
  useEffect(() => {
    setIsPlaying(false);
    setPlayProgress(0);
  }, [activeModuleId]);

  // Audio/Video simulator progression timer
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            // Auto complete module once video/audio finishes!
            if (!isCompleted && currentModule) {
              completeModule(currentModule.id);
            }
            return 100;
          }
          return prev + 5; // progresses 5% per second
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isCompleted, currentModule]);

  if (!currentModule) {
    return <div style={{ color: 'var(--text-primary)', textAlign: 'center', padding: '40px' }}>Cargando contenido...</div>;
  }

  const currentIndex = modules.findIndex(m => m.id === currentModule.id);
  const prevModule = currentIndex > 0 ? modules[currentIndex - 1] : null;
  const nextModule = currentIndex < modules.length - 1 ? modules[currentIndex + 1] : null;

  const handleMarkAsCompleted = async () => {
    await completeModule(currentModule.id);
  };

  const handleNext = () => {
    if (nextModule) {
      setActiveModuleId(nextModule.id);
    }
  };

  const handlePrev = () => {
    if (prevModule) {
      setActiveModuleId(prevModule.id);
    }
  };

  const renderMediaSimulator = () => {
    const type = currentModule.tipo_recurso;
    if (type === 'texto') return null;

    if (type === 'video') {
      return (
        <div className="media-simulator">
          <Film size={48} color="#FFFFFF" style={{ opacity: isPlaying ? 0.35 : 0.8, transition: 'all 0.5s' }} />
          {isPlaying && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 44, 89, 0.1)', pointerEvents: 'none' }}>
              <div style={{ animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite', height: '22px', width: '22px', backgroundColor: 'var(--accent-emerald)', borderRadius: '50%' }}></div>
            </div>
          )}
          
          <div className="media-controls">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#FFFFFF' }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="media-slider-container" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              setPlayProgress(Math.round((clickX / rect.width) * 100));
            }}>
              <div className="media-slider-fill" style={{ width: `${playProgress}%` }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#FFFFFF', minWidth: '35px', textAlign: 'right', fontWeight: 600 }}>
              {Math.floor((playProgress * 1.8) / 60)}:{(Math.floor(playProgress * 1.8) % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      );
    }

    if (type === 'audio') {
      return (
        <div className="media-simulator" style={{ height: '180px' }}>
          {isPlaying ? (
            <div className="media-glowing-wave">
              <div className="media-wave-bar"></div>
              <div className="media-wave-bar"></div>
              <div className="media-wave-bar"></div>
              <div className="media-wave-bar"></div>
              <div className="media-wave-bar"></div>
            </div>
          ) : (
            <Volume2 size={48} color="#FFFFFF" style={{ marginBottom: '16px', opacity: 0.8 }} />
          )}

          <div className="media-controls">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#FFFFFF' }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="media-slider-container" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              setPlayProgress(Math.round((clickX / rect.width) * 100));
            }}>
              <div className="media-slider-fill" style={{ width: `${playProgress}%` }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#FFFFFF', minWidth: '35px', textAlign: 'right', fontWeight: 600 }}>
              {Math.floor((playProgress * 2.4) / 60)}:{(Math.floor(playProgress * 2.4) % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      );
    }

    if (type === 'imagen') {
      return (
        <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-glass)', marginBottom: '28px', boxShadow: 'var(--shadow-card)' }}>
          <img
            src={currentModule.url_recurso}
            alt={currentModule.titulo}
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '380px', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', bottom: 0, insetInline: 0, padding: '16px', background: 'linear-gradient(to top, rgba(15, 44, 89, 0.9) 0%, rgba(15, 44, 89, 0.4) 60%, transparent 100%)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ImageIcon size={20} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>Ilustración del Módulo formativo</span>
          </div>
        </div>
      );
    }

    return null;
  };

  const isAllCompleted = progress.modulos_completados.length === modules.length;

  return (
    <div className="course-grid">
      
      {/* Sidebar index */}
      <div className="glass-panel" style={{ height: 'fit-content', padding: '24px' }}>
        <button
          onClick={() => navigate(`/course/${activeCourseId}/detail`)}
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
          <span>Volver al Detalle</span>
        </button>

        <h3 className="font-serif" style={{ fontSize: '0.9rem', color: 'var(--isn-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', fontWeight: 800 }}>Módulos del Curso</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {modules.map((m, idx) => {
            const isModActive = m.id === currentModule.id;
            const isModCompleted = progress.modulos_completados.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => setActiveModuleId(m.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px',
                  borderRadius: '12px',
                  background: isModActive ? 'rgba(15, 44, 89, 0.06)' : 'transparent',
                  border: 'none',
                  color: isModActive ? 'var(--isn-blue)' : 'var(--isn-charcoal)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  boxShadow: isModActive ? '0 4px 12px rgba(15, 44, 89, 0.04)' : 'none'
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: isModActive ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                  {idx + 1}. {m.titulo}
                </span>
                {isModCompleted && <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main viewer content */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        
        {/* Module Header */}
        <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(15, 44, 89, 0.08)',
              color: 'var(--isn-blue)',
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontWeight: 700
            }}>MÓDULO {currentModule.orden}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{currentModule.tipo_recurso}</span>
          </div>
          <h2 className="font-serif" style={{ fontSize: '2rem', color: 'var(--isn-blue)', fontWeight: 900 }}>{currentModule.titulo}</h2>
          <p style={{ color: 'var(--isn-charcoal)', fontSize: '0.95rem', marginTop: '8px', lineHeight: '1.6' }}>{currentModule.descripcion}</p>
        </div>

        {/* Dynamic Simulator */}
        {renderMediaSimulator()}

        {/* Text Content */}
        <div
          className="course-content-markdown"
          style={{ lineHeight: '1.8', fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '32px' }}
        >
          {/<\/?[a-z][\s\S]*>/i.test(currentModule.contenido || '') ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentModule.contenido) }} />
          ) : (
            <ReactMarkdown>{currentModule.contenido}</ReactMarkdown>
          )}
        </div>

        {/* Actions & Completion */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          borderTop: '1px solid var(--border-glass)',
          paddingTop: '24px',
          marginTop: '40px'
        }}>
          <div>
            {isCompleted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                <CheckCircle2 size={22} />
                <span>Módulo Completado ✓</span>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={handleMarkAsCompleted}>
                <CheckCircle2 size={18} />
                <span>Marcar como Completado</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              onClick={handlePrev}
              disabled={!prevModule}
              style={{ padding: '12px 18px' }}
            >
              <ChevronLeft size={18} />
              <span>Anterior</span>
            </button>

            {nextModule ? (
              <button
                className="btn btn-secondary"
                onClick={handleNext}
                style={{ padding: '12px 18px' }}
              >
                <span>Siguiente</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              isAllCompleted && (
                <button
                  className="btn"
                  onClick={() => {
                    if (examStatus && examStatus.aprobado) {
                      navigate(`/certificate/${activeCourseId}`);
                    } else {
                      navigate(`/course/${activeCourseId}/exam`);
                    }
                  }}
                  style={{
                    background: 'var(--accent-gold)',
                    color: '#FFFFFF',
                    padding: '12px 20px'
                  }}
                >
                  <Award size={18} />
                  <span>Ir al Examen Final</span>
                </button>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseViewer;
