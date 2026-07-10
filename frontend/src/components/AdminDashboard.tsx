import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Users, CheckCircle2, Clock, Plus, UserPlus, RefreshCw, X, ShieldAlert, Award, FileText, Edit, Download, FileCheck } from 'lucide-react';

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

const FinancialMetricsView = () => {
  const { financialMetrics, fetchFinancialMetrics } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFinancialData = async () => {
      setLoading(true);
      await fetchFinancialMetrics();
      setLoading(false);
    };
    loadFinancialData();
  }, [fetchFinancialMetrics]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
        <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 16px auto', display: 'block', color: 'var(--isn-blue)' }} />
        <p>Cargando métricas financieras...</p>
      </div>
    );
  }

  const metrics = financialMetrics || { coursesSold: [], monthlyBalance: 0, historicalBalance: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Metrics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {/* Card 1: Balance Mensual */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: '#FFFFFF', border: 'none', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(15, 44, 89, 0.08)',
            color: 'var(--isn-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance Mensual</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--isn-blue)', marginTop: '2px' }}>
              ${metrics.monthlyBalance?.toLocaleString('es-CO')} COP
            </h3>
          </div>
        </div>

        {/* Card 2: Balance Histórico */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', background: '#FFFFFF', border: 'none', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.08)',
            color: 'var(--isn-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance Histórico</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--isn-gold)', marginTop: '2px' }}>
              ${metrics.historicalBalance?.toLocaleString('es-CO')} COP
            </h3>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-panel" style={{ padding: '28px', overflow: 'hidden', border: 'none', background: '#FFFFFF', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--isn-blue-dark)' }}>
            Registro de Cursos Vendidos
          </h3>
          <span style={{
            background: 'rgba(15, 44, 89, 0.04)',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            padding: '6px 12px',
            borderRadius: '8px',
            fontWeight: 700
          }}>
            {metrics.coursesSold?.length || 0} ventas
          </span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px', border: 'none' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 44, 89, 0.04)' }}>
                <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>Estudiante</th>
                <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Cédula</th>
                <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Curso Adquirido</th>
                <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Fecha de Matrícula</th>
                <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {(!metrics.coursesSold || metrics.coursesSold.length === 0) ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    No hay ventas registradas.
                  </td>
                </tr>
              ) : (
                metrics.coursesSold.map((sale: any, idx: number) => (
                  <tr key={idx} className="table-row table-row-hover" style={{ transition: 'background-color 0.15s' }}>
                    <td style={{ padding: '16px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {decodeMojibake(sale.nombre_completo)}
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {sale.cedula}
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {decodeMojibake(sale.curso_adquirido)}
                    </td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {sale.fecha_matricula}
                    </td>
                    <td className="font-sans-mono" style={{ padding: '16px 12px', color: 'var(--isn-blue)', fontSize: '0.95rem', fontWeight: 700 }}>
                      ${sale.precio?.toLocaleString('es-CO')} COP
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const {
    user,
    adminMetrics,
    adminUsers,
    courses,
    coursesList,
    fetchAdminMetrics,
    fetchAdminUsers,
    fetchCourses,
    fetchCoursesList,
    createStudentUser,
    updateStudentCourses,
    updateCourse,
    updateCourseModule,
    updateStudentProfile,
    financialMetrics,
    fetchFinancialMetrics,
    downloadStudentCertificate,
    token,
    API_BASE_URL,
    loading: contextLoading
  } = useContext(AppContext);
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'students' | 'courses' | 'financial'>('students');

  // Local States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('123456'); // Default password
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New Student Metadata states
  const [fechaExpedicion, setFechaExpedicion] = useState('');
  const [municipioExpedicion, setMunicipioExpedicion] = useState('');
  const [municipioNacimiento, setMunicipioNacimiento] = useState('');
  const [anioNacimiento, setAnioNacimiento] = useState('');
  const [pagoRealizado, setPagoRealizado] = useState(false);
  const [certificarInmediatamente, setCertificarInmediatamente] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [vipass, setVipass] = useState(false);

  // Search local state
  const [searchCedula, setSearchCedula] = useState('');

  // Edit courses modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editSelectedCourses, setEditSelectedCourses] = useState([]);
  const [editError, setEditError] = useState('');
  const [editSuccessMessage, setEditSuccessMessage] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Student Profile Edit Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileNombre, setProfileNombre] = useState('');
  const [profileFechaExpedicion, setProfileFechaExpedicion] = useState('');
  const [profileMunicipioExpedicion, setProfileMunicipioExpedicion] = useState('');
  const [profileMunicipioNacimiento, setProfileMunicipioNacimiento] = useState('');
  const [profileAnioNacimiento, setProfileAnioNacimiento] = useState('');
  const [profilePagoRealizado, setProfilePagoRealizado] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Course Edit Modal states
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseTitulo, setCourseTitulo] = useState('');
  const [courseDescripcion, setCourseDescripcion] = useState('');
  const [coursePrecio, setCoursePrecio] = useState('');
  const [courseError, setCourseError] = useState('');
  const [courseSuccess, setCourseSuccess] = useState('');
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [editingCourseModules, setEditingCourseModules] = useState<any[]>([]);

  // Module Edit Modal states
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [moduleTitulo, setModuleTitulo] = useState('');
  const [moduleTipo, setModuleTipo] = useState('');
  const [moduleText, setModuleText] = useState('');
  const [moduleUrl, setModuleUrl] = useState('');
  const [moduleError, setModuleError] = useState('');
  const [moduleSuccess, setModuleSuccess] = useState('');
  const [moduleSubmitting, setModuleSubmitting] = useState(false);

  // Aggregates all dashboard fetches. Declared with useCallback so its identity
  // is stable and can safely be used as a useEffect dependency.
  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAdminMetrics(),
        fetchAdminUsers(''),
        fetchCourses(),
        fetchCoursesList()
      ]);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setRefreshing(false);
    }
  }, [fetchAdminMetrics, fetchAdminUsers, fetchCourses, fetchCoursesList]);

  // Load dashboard data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync selected courses once courses list loads
  useEffect(() => {
    if (courses && courses.length > 0 && selectedCourses.length === 0) {
      // Default to checking the first course (Manipulación de Alimentos)
      setSelectedCourses([courses[0].id.toString()]);
    }
  }, [courses, selectedCourses]);

  // Debounce search by cedula
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdminUsers(searchCedula);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchCedula, fetchAdminUsers]);

  const handleOpenEditModal = async (student) => {
    setSelectedStudent(student);
    setEditSelectedCourses((student.enrolled_courses || []).map(String));
    setEditError('');
    setEditSuccessMessage('');
    setIsEditModalOpen(true);
    
    try {
      await fetchCoursesList();
    } catch (e) {
      console.error('Error fetching courses list:', e);
    }
  };

  const handleEditCheckboxChange = (courseId) => {
    const cidStr = courseId.toString();
    if (editSelectedCourses.includes(cidStr)) {
      setEditSelectedCourses(editSelectedCourses.filter(id => id !== cidStr));
    } else {
      setEditSelectedCourses([...editSelectedCourses, cidStr]);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccessMessage('');
    setEditSubmitting(true);

    try {
      await updateStudentCourses(selectedStudent.cedula, editSelectedCourses.map(Number));
      setEditSuccessMessage('¡Matrículas actualizadas con éxito!');
      
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSelectedStudent(null);
        setEditSuccessMessage('');
      }, 1500);
    } catch (err) {
      setEditError(err.message || 'Error al actualizar las matrículas.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleProfileEditOpen = (student: any) => {
    setSelectedStudent(student);
    setProfileNombre(decodeMojibake(student.nombre_completo) || '');
    setProfileFechaExpedicion(student.fecha_expedicion_cedula || '');
    setProfileMunicipioExpedicion(student.municipio_expedicion_cedula || '');
    setProfileMunicipioNacimiento(student.municipio_nacimiento || '');
    setProfileAnioNacimiento(student.anio_nacimiento ? student.anio_nacimiento.toString() : '');
    setProfilePagoRealizado(student.pago_realizado === 1 || student.pago_realizado === true);
    setProfileError('');
    setProfileSuccess('');
    setIsProfileModalOpen(true);
  };

  const handleProfileEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileSubmitting(true);
    try {
      await updateStudentProfile(selectedStudent.cedula, {
        nombre_completo: profileNombre.trim(),
        fecha_expedicion_cedula: profileFechaExpedicion.trim(),
        municipio_expedicion_cedula: profileMunicipioExpedicion.trim(),
        municipio_nacimiento: profileMunicipioNacimiento.trim(),
        anio_nacimiento: profileAnioNacimiento ? parseInt(profileAnioNacimiento) : null,
        pago_realizado: profilePagoRealizado ? 1 : 0
      });
      setProfileSuccess('¡Perfil de estudiante actualizado con éxito!');
      setTimeout(() => {
        setIsProfileModalOpen(false);
        setSelectedStudent(null);
        setProfileSuccess('');
      }, 1500);
    } catch (err: any) {
      setProfileError(err.message || 'Error al actualizar el perfil.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleCourseEditOpen = async (course: any) => {
    setSelectedCourse(course);
    setCourseTitulo(decodeMojibake(course.titulo) || '');
    setCourseDescripcion(decodeMojibake(course.descripcion) || '');
    setCoursePrecio(course.precio ? course.precio.toString() : '');
    setCourseError('');
    setCourseSuccess('');
    setEditingCourseModules([]);
    setIsCourseModalOpen(true);

    try {
      const response = await fetch(`${API_BASE_URL}/course/content?courseId=${course.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEditingCourseModules(data);
      }
    } catch (err) {
      console.error('Error fetching course modules:', err);
    }
  };

  const handleCourseEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseError('');
    setCourseSuccess('');
    setCourseSubmitting(true);
    try {
      await updateCourse(selectedCourse.id, {
        titulo: courseTitulo.trim(),
        descripcion: courseDescripcion.trim(),
        precio: parseFloat(coursePrecio)
      });
      setCourseSuccess('¡Curso actualizado con éxito!');
      setTimeout(() => {
        setIsCourseModalOpen(false);
        setSelectedCourse(null);
        setCourseSuccess('');
      }, 1500);
    } catch (err: any) {
      setCourseError(err.message || 'Error al actualizar el curso.');
    } finally {
      setCourseSubmitting(false);
    }
  };

  const handleModuleEditOpen = (mod: any) => {
    setSelectedModule(mod);
    setModuleTitulo(decodeMojibake(mod.titulo) || decodeMojibake(mod.titulo_modulo) || '');
    const typeCap = mod.tipo_recurso 
      ? mod.tipo_recurso.charAt(0).toUpperCase() + mod.tipo_recurso.slice(1).toLowerCase() 
      : 'Texto';
    setModuleTipo(typeCap);
    setModuleText(mod.contenido || '');
    setModuleUrl(mod.url_recurso || '');
    setModuleError('');
    setModuleSuccess('');
    setIsModuleModalOpen(true);
  };

  const handleModuleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModuleError('');
    setModuleSuccess('');
    setModuleSubmitting(true);
    try {
      const data_contenido = JSON.stringify({
        url: moduleUrl.trim(),
        text: moduleText
      });

      await updateCourseModule(selectedCourse.id, selectedModule.id, {
        titulo_modulo: moduleTitulo.trim(),
        tipo_contenido: moduleTipo,
        data_contenido: data_contenido
      });

      setModuleSuccess('¡Módulo actualizado con éxito!');

      const response = await fetch(`${API_BASE_URL}/course/content?courseId=${selectedCourse.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEditingCourseModules(data);
      }

      setTimeout(() => {
        setIsModuleModalOpen(false);
        setSelectedModule(null);
        setModuleSuccess('');
      }, 1500);
    } catch (err: any) {
      setModuleError(err.message || 'Error al actualizar el módulo.');
    } finally {
      setModuleSubmitting(false);
    }
  };

  const handleCheckboxChange = (courseId) => {
    const cidStr = courseId.toString();
    if (selectedCourses.includes(cidStr)) {
      setSelectedCourses(selectedCourses.filter(id => id !== cidStr));
    } else {
      setSelectedCourses([...selectedCourses, cidStr]);
    }
  };

  const handleDownloadStudentCertificate = async (studentCedula, courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/certificate/download?cedula=${studentCedula}&courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo descargar el certificado');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const currentCourse = courses.find(c => c.id === courseId);
      const courseTitle = currentCourse ? currentCourse.titulo : 'Curso';
      
      const filename = `Certificado_${courseTitle.replace(/\s+/g, '_')}_${studentCedula}.pdf`;
      a.target = '_blank';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDownloadStudentActa = async (studentCedula, courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/certificate/download-acta?cedula=${studentCedula}&courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo descargar el acta de grado');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const currentCourse = courses.find(c => c.id === courseId);
      const courseTitle = currentCourse ? currentCourse.titulo : 'Curso';
      
      const filename = `Acta_de_Grado_${courseTitle.replace(/\s+/g, '_')}_${studentCedula}.pdf`;
      a.target = '_blank';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    setSubmitting(true);

    const cleanNombre = nombre.trim();
    const cleanCedula = cedula.trim();

    // Local Validation
    if (!cleanNombre || !cleanCedula || !password) {
      setLocalError('Todos los campos son obligatorios.');
      setSubmitting(false);
      return;
    }

    // Cedula validation: numeric only
    if (!/^\d+$/.test(cleanCedula)) {
      setLocalError('La cédula debe contener únicamente números.');
      setSubmitting(false);
      return;
    }

    // Name validation: letters, accents and spaces only
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!nameRegex.test(cleanNombre)) {
      setLocalError('El nombre completo debe contener únicamente letras y espacios (se soportan acentos y ñ).');
      setSubmitting(false);
      return;
    }

    // Password strength check
    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      setSubmitting(false);
      return;
    }

    // Courses selection check
    if (selectedCourses.length === 0) {
      setLocalError('Debe asignar al menos un curso al estudiante.');
      setSubmitting(false);
      return;
    }

    // New Metadata validation
    if (!fechaExpedicion || !municipioExpedicion || !municipioNacimiento || !anioNacimiento) {
      setLocalError('La fecha de expedición, el municipio de expedición, el municipio de nacimiento y el año de nacimiento son requeridos.');
      setSubmitting(false);
      return;
    }

    try {
      await createStudentUser({
        cedula: cleanCedula,
        nombre_completo: cleanNombre,
        password: password,
        cursos: selectedCourses.map(id => parseInt(id)),
        fecha_expedicion_cedula: fechaExpedicion,
        municipio_expedicion_cedula: municipioExpedicion,
        municipio_nacimiento: municipioNacimiento,
        anio_nacimiento: anioNacimiento ? parseInt(anioNacimiento) : null,
        pago_realizado: pagoRealizado ? 1 : 0,
        certificar_inmediatamente: certificarInmediatamente,
        email: studentEmail.trim() || undefined,
        vipass: vipass
      });

      // Clear form
      setNombre('');
      setCedula('');
      setPassword('123456');
      setFechaExpedicion('');
      setMunicipioExpedicion('');
      setMunicipioNacimiento('');
      setAnioNacimiento('');
      setPagoRealizado(false);
      setCertificarInmediatamente(false);
      setStudentEmail('');
      setVipass(false);
      
      if (courses && courses.length > 0) {
        setSelectedCourses([courses[0].id.toString()]);
      }
      setSuccessMessage('¡Estudiante creado y matriculado correctamente!');
      
      // Close modal after a brief delay
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage('');
      }, 1800);

    } catch (err) {
      setLocalError(err.message || 'Error al registrar al estudiante.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: '2.25rem', color: 'var(--isn-blue-dark)', fontWeight: 800, marginBottom: '6px' }}>
            Panel de Administrador
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Supervisa el progreso de los estudiantes, gestiona matrículas y revisa métricas globales.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary"
            onClick={loadData}
            disabled={refreshing || contextLoading}
            style={{ height: '48px', padding: '0 16px' }}
            title="Recargar información"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span className="hide-mobile">Actualizar</span>
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/admin/create-course')}
            style={{ height: '48px', background: 'var(--isn-success)' }}
          >
            <Plus size={18} />
            <span>Añadir Nuevo Curso</span>
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
            style={{ height: '48px', background: 'var(--isn-blue-dark)' }}
          >
            <UserPlus size={18} />
            <span>Matricular Estudiante</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '36px'
      }}>
        {/* Card 1: Active Users */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(0, 141, 218, 0.08)',
            color: 'var(--accent-teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estudiantes Activos</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {adminMetrics.usuarios_activos}
            </h3>
          </div>
        </div>

        {/* Card 2: Completed Courses */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(29, 78, 216, 0.08)',
            color: 'var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cursos Completados</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {adminMetrics.cursos_completados}
            </h3>
          </div>
        </div>

        {/* Card 3: Pending Courses */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.08)',
            color: 'var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cursos en Curso</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {adminMetrics.cursos_pendientes}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('students')}
          style={{
            padding: '12px 24px',
            borderRadius: '9999px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: activeTab === 'students' ? 'var(--isn-blue-dark)' : 'rgba(15, 44, 89, 0.05)',
            color: activeTab === 'students' ? '#FFFFFF' : 'var(--text-secondary)'
          }}
        >
          Gestión de Estudiantes
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            padding: '12px 24px',
            borderRadius: '9999px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: activeTab === 'courses' ? 'var(--isn-blue-dark)' : 'rgba(15, 44, 89, 0.05)',
            color: activeTab === 'courses' ? '#FFFFFF' : 'var(--text-secondary)'
          }}
        >
          Catálogo de Cursos
        </button>
        {(user?.rol === 'ingeniero_software' || user?.cedula === '1001244637') && (
          <button
            onClick={() => setActiveTab('financial')}
            style={{
              padding: '12px 24px',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'financial' ? 'var(--isn-blue-dark)' : 'rgba(15, 44, 89, 0.05)',
              color: activeTab === 'financial' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Métricas de Ventas y Balance Financiero
          </button>
        )}
      </div>

      {activeTab === 'students' && (
        /* Students List Table container */
        <div className="glass-panel" style={{ padding: '28px', overflow: 'hidden', border: 'none', background: '#FFFFFF', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--isn-blue-dark)' }}>
              Listado General de Estudiantes
            </h3>
            <span style={{
              background: 'rgba(15, 44, 89, 0.04)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 700
            }}>
              {adminUsers.length} registros
            </span>
          </div>

          {/* Input Search por Cédula */}
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Buscar por Cédula..."
              value={searchCedula}
              onChange={(e) => setSearchCedula(e.target.value)}
              className="input-field font-sans-mono"
              style={{
                maxWidth: '360px',
                height: '42px',
                padding: '10px 16px',
              }}
            />
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px', border: 'none' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 44, 89, 0.04)' }}>
                  <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>Nombre Completo</th>
                  <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Número de Cédula</th>
                  <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Fecha de Registro</th>
                  <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Estado de Pago</th>
                  <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', width: '220px' }}>Progreso del Curso</th>
                  <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', width: '380px', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      No hay estudiantes registrados.
                    </td>
                  </tr>
                ) : (
                  adminUsers.map((student) => (
                    <tr 
                      key={student.cedula}
                      style={{ transition: 'background-color 0.15s' }}
                      className="table-row table-row-hover"
                    >
                      <td style={{ padding: '16px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {decodeMojibake(student.nombre_completo)}
                      </td>
                      <td className="font-sans-mono" style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
                        {student.cedula}
                      </td>
                      <td className="font-sans-mono" style={{ padding: '16px 12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {student.fecha_registro}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: student.pago_realizado ? 'rgba(29, 78, 216, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: student.pago_realizado ? 'var(--isn-success)' : 'var(--accent-rose)'
                        }}>
                          {student.pago_realizado ? 'Pagado' : 'Pendiente'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="progress-container" style={{ flex: 1, height: '6px', background: '#E2E8F0' }}>
                            <div 
                              className="progress-bar" 
                              style={{ 
                                width: `${student.progreso_porcentaje}%`,
                                background: student.progreso_porcentaje === 100 ? 'var(--accent-emerald)' : 'var(--accent-teal)'
                              }} 
                            />
                          </div>
                          <span style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 700, 
                            color: student.progreso_porcentaje === 100 ? 'var(--accent-emerald)' : 'var(--text-primary)',
                            minWidth: '38px',
                            textAlign: 'right'
                          }}>
                            {student.progreso_porcentaje}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleProfileEditOpen(student)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--isn-blue)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            transition: 'background-color 0.15s, color 0.15s'
                          }}
                          className="btn-edit-courses-hover"
                        >
                          <Edit size={14} />
                          <span>Editar Perfil</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(student)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-teal)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            transition: 'background-color 0.15s, color 0.15s'
                          }}
                          className="btn-edit-courses-hover"
                        >
                          <Edit size={14} />
                          <span>Editar Cursos</span>
                        </button>

                        {student.certified_courses && student.certified_courses.length > 0 && (() => {
                          const certCourseId = student.certified_courses[0];
                          const certCourse = courses.find(c => c.id === certCourseId);
                          const isDirect = certCourse && certCourse.certificacion_directa === 1;
                          const isHighSchool = certCourse && certCourse.certificacion_directa === 1 && String(certCourse.titulo || '').toLowerCase().includes('bachiller');
                          
                          return (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {isHighSchool ? (
                                <>
                                  <button
                                    onClick={() => downloadStudentCertificate(student.cedula, certCourseId, 'notas')}
                                    title="Descargar Certificado de Notas"
                                    style={{
                                      background: 'rgba(15, 44, 89, 0.05)',
                                      border: 'none',
                                      color: 'var(--isn-blue)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      padding: '6px 10px',
                                      borderRadius: '9999px',
                                      transition: 'background-color 0.15s, color 0.15s'
                                    }}
                                  >
                                    <FileText size={14} color="var(--isn-blue)" />
                                    <span>Notas</span>
                                  </button>
                                  <button
                                    onClick={() => downloadStudentCertificate(student.cedula, certCourseId, 'acta')}
                                    title="Descargar Acta de Grado"
                                    style={{
                                      background: 'rgba(22, 163, 74, 0.05)',
                                      border: 'none',
                                      color: 'var(--accent-emerald)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      padding: '6px 10px',
                                      borderRadius: '9999px',
                                      transition: 'background-color 0.15s, color 0.15s'
                                    }}
                                  >
                                    <FileCheck size={14} color="var(--accent-emerald)" />
                                    <span>Acta</span>
                                  </button>
                                  <button
                                    onClick={() => downloadStudentCertificate(student.cedula, certCourseId, 'diploma')}
                                    title="Descargar Diploma"
                                    style={{
                                      background: 'rgba(212, 175, 55, 0.1)',
                                      border: 'none',
                                      color: 'var(--isn-gold)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      padding: '6px 10px',
                                      borderRadius: '9999px',
                                      transition: 'background-color 0.15s, color 0.15s'
                                    }}
                                  >
                                    <Award size={14} color="var(--isn-gold)" />
                                    <span>Diploma</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => downloadStudentCertificate(student.cedula, certCourseId, 'diploma')}
                                    style={{
                                      background: 'rgba(15, 44, 89, 0.05)',
                                      border: 'none',
                                      color: 'var(--isn-blue)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '0.85rem',
                                      fontWeight: 700,
                                      padding: '6px 12px',
                                      borderRadius: '9999px',
                                      transition: 'background-color 0.15s, color 0.15s'
                                    }}
                                  >
                                    <Award size={14} color="var(--isn-gold)" />
                                    <span>{isDirect ? 'Diploma' : 'Descargar'}</span>
                                  </button>
                                  
                                  {isDirect && (
                                    <button
                                      onClick={() => downloadStudentCertificate(student.cedula, certCourseId, 'acta')}
                                      style={{
                                        background: 'rgba(22, 163, 74, 0.05)',
                                        border: 'none',
                                        color: 'var(--accent-emerald)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        padding: '6px 12px',
                                        borderRadius: '9999px',
                                        transition: 'background-color 0.15s, color 0.15s'
                                      }}
                                    >
                                      <FileCheck size={14} color="var(--accent-emerald)" />
                                      <span>Acta</span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        /* Courses Catalog List container */
        <div className="glass-panel" style={{ padding: '28px', overflow: 'hidden', border: 'none', background: '#FFFFFF', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--isn-blue-dark)' }}>
              Catálogo de Cursos Formativos
            </h3>
            <span style={{
              background: 'rgba(15, 44, 89, 0.04)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 700
            }}>
              {courses.length} registros
            </span>
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px', border: 'none' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 44, 89, 0.04)' }}>
                  <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>Título del Curso</th>
                  <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Descripción</th>
                  <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', width: '150px' }}>Precio</th>
                  <th style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', width: '180px', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      No hay cursos registrados.
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr 
                      key={course.id}
                      style={{ transition: 'background-color 0.15s' }}
                      className="table-row table-row-hover"
                    >
                      <td style={{ padding: '16px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {decodeMojibake(course.titulo)}
                      </td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {decodeMojibake(course.descripcion)}
                      </td>
                      <td className="font-sans-mono" style={{ padding: '16px 12px', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700 }}>
                        ${course.precio?.toLocaleString('es-CO')} COP
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <button
                          onClick={() => handleCourseEditOpen(course)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--isn-blue)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            padding: '6px 12px',
                            borderRadius: '9999px',
                            transition: 'background-color 0.15s, color 0.15s'
                          }}
                          className="btn-edit-courses-hover"
                        >
                          <Edit size={14} />
                          <span>Editar Curso</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <FinancialMetricsView />
      )}

      {/* Matricula Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 44, 89, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-panel animate-scale-up" style={{
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: '#FFFFFF',
            borderRadius: '24px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(15, 44, 89, 0.15)',
            border: 'none'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '28px 28px 12px 28px',
              background: 'transparent',
              color: 'var(--text-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Plus size={20} color="var(--isn-gold)" />
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--isn-blue)' }}>
                  Matricular Estudiante
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setLocalError('');
                  setSuccessMessage('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '50%',
                  transition: 'background-color 0.15s'
                }}
                className="btn-secondary-hover"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              
              {/* Messages */}
              {localError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--accent-rose)',
                  fontSize: '0.875rem'
                }}>
                  <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                  <span>{localError}</span>
                </div>
              )}

              {successMessage && (
                <div style={{
                  background: 'rgba(78, 159, 61, 0.06)',
                  border: '1px solid rgba(78, 159, 61, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--accent-emerald)',
                  fontSize: '0.875rem'
                }}>
                  <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Name */}
              <div className="input-group">
                <label className="input-label" htmlFor="student-nombre">Nombre Completo</label>
                <input
                  className="input-field"
                  type="text"
                  id="student-nombre"
                  placeholder="Ej. Andrés Nariño"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Cedula */}
                <div className="input-group">
                  <label className="input-label" htmlFor="student-cedula">Cédula (Usuario)</label>
                  <input
                    className="input-field"
                    type="text"
                    id="student-cedula"
                    placeholder="Ej. 102938475"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                {/* Password */}
                <div className="input-group">
                  <label className="input-label" htmlFor="student-password">Contraseña Temporal</label>
                  <input
                    className="input-field"
                    type="password"
                    id="student-password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="student-email">Correo Electrónico (opcional)</label>
                  <input
                    className="input-field"
                    type="email"
                    id="student-email"
                    placeholder="ejemplo@correo.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Cédula y Nacimiento Metadata */}
              <div style={{ margin: '8px 0 20px 0', background: 'rgba(15, 44, 89, 0.02)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                <h4 className="font-serif" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--isn-blue)', marginBottom: '16px' }}>
                  Datos de Cédula y Nacimiento
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" htmlFor="student-fecha-expedicion">Fecha Expedición Cédula</label>
                    <input
                      className="input-field"
                      type="date"
                      id="student-fecha-expedicion"
                      value={fechaExpedicion}
                      onChange={(e) => setFechaExpedicion(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" htmlFor="student-municipio-expedicion">Municipio Expedición</label>
                    <input
                      className="input-field"
                      type="text"
                      id="student-municipio-expedicion"
                      placeholder="Ej. Bogotá"
                      value={municipioExpedicion}
                      onChange={(e) => setMunicipioExpedicion(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" htmlFor="student-municipio-nacimiento">Municipio Nacimiento</label>
                    <input
                      className="input-field"
                      type="text"
                      id="student-municipio-nacimiento"
                      placeholder="Ej. Medellín"
                      value={municipioNacimiento}
                      onChange={(e) => setMunicipioNacimiento(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" htmlFor="student-anio-nacimiento">Año de Nacimiento</label>
                    <input
                      className="input-field"
                      type="number"
                      id="student-anio-nacimiento"
                      placeholder="Ej. 1995"
                      min="1900"
                      max={new Date().getFullYear()}
                      value={anioNacimiento}
                      onChange={(e) => setAnioNacimiento(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment status & Bypass */}
              <div style={{ margin: '8px 0 20px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    fontSize: '0.95rem', 
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--isn-blue)' }}
                    checked={pagoRealizado}
                    onChange={(e) => setPagoRealizado(e.target.checked)}
                    disabled={submitting}
                  />
                  <span>¿Ya pagó el último curso en el que se matricula?</span>
                </label>

                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    fontSize: '0.95rem', 
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: 'rgba(15, 44, 89, 0.04)',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: '1px dashed var(--isn-gold)'
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--isn-blue)' }}
                    checked={certificarInmediatamente}
                    onChange={(e) => setCertificarInmediatamente(e.target.checked)}
                    disabled={submitting}
                  />
                  <div>
                    <span style={{ color: 'var(--isn-blue)' }}>Otorgar Certificación Inmediata (Bypass Completo)</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                      Omite el examen y le genera progreso al 100% con certificado listo para descargar.
                    </span>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    background: 'rgba(212, 175, 55, 0.08)',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    border: '1px solid var(--isn-gold)'
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--isn-gold)' }}
                    checked={vipass}
                    onChange={(e) => {
                      setVipass(e.target.checked);
                      if (e.target.checked) setCertificarInmediatamente(true);
                    }}
                    disabled={submitting}
                  />
                  <div>
                    <span style={{ color: 'var(--isn-gold)' }}>Acceso VIP (Entrega Automática de Certificado)</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                      Genera y envía automáticamente el certificado por correo corporativo al crear la cuenta.
                    </span>
                  </div>
                </label>
              </div>

              {/* Courses Checklist */}
              <div style={{ marginBottom: '28px' }}>
                <label className="input-label">Cursos a Matricular</label>
                <div style={{ 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  background: 'rgba(15, 44, 89, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {courses.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cargando cursos...</p>
                  ) : (
                    courses.map(course => (
                      <label 
                        key={course.id}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '10px', 
                          fontSize: '0.9rem', 
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{ marginTop: '4px', cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--text-primary)' }}
                          checked={selectedCourses.includes(course.id.toString())}
                          onChange={() => handleCheckboxChange(course.id)}
                          disabled={submitting}
                        />
                        <div>
                          <span>{course.titulo}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                            {course.descripcion}
                          </span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setLocalError('');
                    setSuccessMessage('');
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, background: 'var(--text-primary)' }}
                  disabled={submitting}
                >
                  {submitting ? 'Guardando...' : 'Matricular'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Courses Modal */}
      {isEditModalOpen && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 44, 89, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-panel animate-scale-up" style={{
            width: '100%',
            maxWidth: '500px',
            background: '#FFFFFF',
            borderRadius: '24px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(15, 44, 89, 0.15)',
            overflow: 'hidden',
            border: 'none'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '28px 28px 12px 28px',
              background: 'transparent',
              color: 'var(--text-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit size={20} color="var(--isn-gold)" />
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--isn-blue)' }}>
                  Gestionar Matrículas
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedStudent(null);
                  setEditError('');
                  setEditSuccessMessage('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '50%',
                  transition: 'background-color 0.15s'
                }}
                className="btn-secondary-hover"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleEditSubmit} style={{ padding: '24px' }}>
              
              {/* Student Info Box */}
              <div style={{
                background: 'rgba(15, 44, 89, 0.03)',
                border: 'none',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estudiante:</p>
                <h4 className="font-serif" style={{ margin: '4px 0 2px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {decodeMojibake(selectedStudent.nombre_completo)}
                </h4>
                <p className="font-sans-mono" style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Cédula: {selectedStudent.cedula}
                </p>
              </div>

              {/* Messages */}
              {editError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--accent-rose)',
                  fontSize: '0.875rem'
                }}>
                  <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                  <span>{editError}</span>
                </div>
              )}

              {editSuccessMessage && (
                <div style={{
                  background: 'rgba(78, 159, 61, 0.06)',
                  border: '1px solid rgba(78, 159, 61, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'var(--accent-emerald)',
                  fontSize: '0.875rem'
                }}>
                  <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                  <span>{editSuccessMessage}</span>
                </div>
              )}

              {/* Courses Checklist */}
              <div style={{ marginBottom: '28px' }}>
                <label className="input-label">Cursos Asignados</label>
                <div style={{ 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  background: 'rgba(15, 44, 89, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxHeight: '240px',
                  overflowY: 'auto'
                }}>
                  {(!coursesList || coursesList.length === 0) ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cargando cursos disponibles...</p>
                  ) : (
                    coursesList.map(course => (
                      <label 
                        key={course.id}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '10px', 
                          fontSize: '0.9rem', 
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{ marginTop: '4px', cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--text-primary)' }}
                          checked={editSelectedCourses.includes(course.id.toString())}
                          onChange={() => handleEditCheckboxChange(course.id)}
                          disabled={editSubmitting}
                        />
                        <div>
                          <span>{course.titulo}</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedStudent(null);
                    setEditError('');
                    setEditSuccessMessage('');
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={editSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, background: 'var(--text-primary)' }}
                  disabled={editSubmitting}
                >
                  {editSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Student Profile Edit Modal */}
      {isProfileModalOpen && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 44, 89, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-panel animate-scale-up" style={{
            width: '100%',
            maxWidth: '550px',
            background: '#FFFFFF',
            borderRadius: '24px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(15, 44, 89, 0.15)',
            overflow: 'hidden',
            border: 'none',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 28px 16px 28px',
              borderBottom: 'none',
              background: 'transparent',
              color: 'var(--text-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit size={20} color="var(--isn-blue)" style={{ strokeWidth: 2.5 }} />
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--isn-blue)', margin: 0 }}>
                  Editar Perfil de Estudiante
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setSelectedStudent(null);
                  setProfileError('');
                  setProfileSuccess('');
                }}
                style={{
                  background: 'rgba(15, 44, 89, 0.05)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--isn-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  borderRadius: '9999px',
                  transition: 'background-color 0.15s'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ overflowY: 'auto', padding: '0 28px 24px 28px', flex: 1 }}>
              <form onSubmit={handleProfileEditSubmit}>
                
                {/* Messages */}
                {profileError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '16px',
                    padding: '14px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--accent-rose)',
                    fontSize: '0.875rem'
                  }}>
                    <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                    <span>{profileError}</span>
                  </div>
                )}

                {profileSuccess && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '16px',
                    padding: '14px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#10B981',
                    fontSize: '0.875rem'
                  }}>
                    <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Field: Cedula */}
                  <div style={{
                    background: 'rgba(15, 44, 89, 0.03)',
                    borderRadius: '16px',
                    padding: '12px 16px'
                  }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                      CÉDULA DE CIUDADANÍA (NO EDITABLE)
                    </label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--isn-blue)', fontFamily: 'monospace' }}>
                      {selectedStudent.cedula}
                    </span>
                  </div>

                  {/* Field: Nombre Completo */}
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={profileNombre}
                      onChange={(e) => setProfileNombre(e.target.value)}
                      required
                      placeholder="Ej. Juan Pérez"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '9999px',
                        border: '1.5px solid rgba(15, 44, 89, 0.15)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Field: Fecha Expedicion & Municipio Expedicion */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                        Fecha Expedición Cédula
                      </label>
                      <input
                        type="date"
                        value={profileFechaExpedicion}
                        onChange={(e) => setProfileFechaExpedicion(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '9999px',
                          border: '1.5px solid rgba(15, 44, 89, 0.15)',
                          fontSize: '0.95rem',
                          outline: 'none',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                        Municipio Expedición
                      </label>
                      <input
                        type="text"
                        value={profileMunicipioExpedicion}
                        onChange={(e) => setProfileMunicipioExpedicion(e.target.value)}
                        placeholder="Ej. Medellín"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '9999px',
                          border: '1.5px solid rgba(15, 44, 89, 0.15)',
                          fontSize: '0.95rem',
                          outline: 'none',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Field: Municipio Nacimiento & Anio Nacimiento */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                        Municipio Nacimiento
                      </label>
                      <input
                        type="text"
                        value={profileMunicipioNacimiento}
                        onChange={(e) => setProfileMunicipioNacimiento(e.target.value)}
                        placeholder="Ej. Bello"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '9999px',
                          border: '1.5px solid rgba(15, 44, 89, 0.15)',
                          fontSize: '0.95rem',
                          outline: 'none',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                        Año de Nacimiento
                      </label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={profileAnioNacimiento}
                        onChange={(e) => setProfileAnioNacimiento(e.target.value)}
                        placeholder="Ej. 1995"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '9999px',
                          border: '1.5px solid rgba(15, 44, 89, 0.15)',
                          fontSize: '0.95rem',
                          outline: 'none',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Field: Pago Realizado Switch */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(15, 44, 89, 0.02)',
                    padding: '16px 20px',
                    borderRadius: '20px',
                    marginTop: '8px'
                  }}>
                    <div>
                      <label style={{ fontSize: '0.95rem', color: 'var(--isn-blue)', fontWeight: 800, display: 'block', margin: 0 }}>
                        Estado de Pago
                      </label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Marcar si el estudiante ya realizó el pago del curso
                      </span>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '48px',
                      height: '24px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={profilePagoRealizado}
                        onChange={(e) => setProfilePagoRealizado(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: profilePagoRealizado ? 'var(--isn-blue)' : '#CBD5E1',
                        transition: '0.3s',
                        borderRadius: '24px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '18px', width: '18px',
                          left: profilePagoRealizado ? '26px' : '4px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '0.3s',
                          borderRadius: '50%'
                        }} />
                      </span>
                    </label>
                  </div>

                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setSelectedStudent(null);
                      setProfileError('');
                      setProfileSuccess('');
                    }}
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '9999px',
                      border: 'none',
                      background: 'rgba(15, 44, 89, 0.05)',
                      color: 'var(--isn-blue)',
                      fontWeight: 600,
                      padding: '12px 24px',
                      cursor: 'pointer'
                    }}
                    disabled={profileSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '9999px',
                      border: 'none',
                      background: 'var(--isn-blue)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      padding: '12px 24px',
                      cursor: 'pointer'
                    }}
                    disabled={profileSubmitting}
                  >
                    {profileSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course Edit Modal */}
      {isCourseModalOpen && selectedCourse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 44, 89, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="glass-panel animate-scale-up" style={{
            width: '100%',
            maxWidth: '650px',
            background: '#FFFFFF',
            borderRadius: '24px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(15, 44, 89, 0.15)',
            overflow: 'hidden',
            border: 'none',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 28px 16px 28px',
              borderBottom: 'none',
              background: 'transparent',
              color: 'var(--text-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit size={20} color="var(--isn-blue)" style={{ strokeWidth: 2.5 }} />
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--isn-blue)', margin: 0 }}>
                  Editar Curso
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsCourseModalOpen(false);
                  setSelectedCourse(null);
                  setCourseError('');
                  setCourseSuccess('');
                }}
                style={{
                  background: 'rgba(15, 44, 89, 0.05)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--isn-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  borderRadius: '9999px',
                  transition: 'background-color 0.15s'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ overflowY: 'auto', padding: '0 28px 24px 28px', flex: 1 }}>
              <form onSubmit={handleCourseEditSubmit}>
                
                {/* Messages */}
                {courseError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '16px',
                    padding: '14px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--accent-rose)',
                    fontSize: '0.875rem'
                  }}>
                    <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                    <span>{courseError}</span>
                  </div>
                )}

                {courseSuccess && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '16px',
                    padding: '14px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#10B981',
                    fontSize: '0.875rem'
                  }}>
                    <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                    <span>{courseSuccess}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Field: Titulo */}
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Título del Curso
                    </label>
                    <input
                      type="text"
                      value={courseTitulo}
                      onChange={(e) => setCourseTitulo(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '9999px',
                        border: '1.5px solid rgba(15, 44, 89, 0.15)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Field: Descripcion */}
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Descripción
                    </label>
                    <textarea
                      value={courseDescripcion}
                      onChange={(e) => setCourseDescripcion(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '20px',
                        border: '1.5px solid rgba(15, 44, 89, 0.15)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        resize: 'none'
                      }}
                    />
                  </div>

                  {/* Field: Precio */}
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Precio Obligatorio ($ COP)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={coursePrecio}
                      onChange={(e) => setCoursePrecio(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '9999px',
                        border: '1.5px solid rgba(15, 44, 89, 0.15)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Modules Sub-list */}
                  <div style={{ marginTop: '10px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--isn-blue)', marginBottom: '12px' }}>
                      Módulos del Curso
                    </h4>
                    
                    {editingCourseModules.length === 0 ? (
                      <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No hay módulos registrados para este curso.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {editingCourseModules.map((mod, index) => {
                          const decodedTitle = decodeMojibake(mod.titulo) || decodeMojibake(mod.titulo_modulo) || `Módulo ${index + 1}`;
                          return (
                            <div key={mod.id || index} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: 'rgba(15, 44, 89, 0.02)',
                              padding: '12px 20px',
                              borderRadius: '20px'
                            }}>
                              <div style={{ flex: 1, marginRight: '16px' }}>
                                <span style={{ fontWeight: 700, color: 'var(--isn-blue)', fontSize: '0.95rem', display: 'block' }}>
                                  {decodedTitle}
                                </span>
                                <span style={{
                                  fontSize: '0.75rem',
                                  textTransform: 'uppercase',
                                  fontWeight: 700,
                                  color: 'var(--text-muted)',
                                  background: 'rgba(15, 44, 89, 0.05)',
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  display: 'inline-block',
                                  marginTop: '4px'
                                }}>
                                  {mod.tipo_recurso || mod.tipo_contenido || 'Texto'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleModuleEditOpen(mod)}
                                className="btn"
                                style={{
                                  borderRadius: '9999px',
                                  border: 'none',
                                  background: 'rgba(15, 44, 89, 0.05)',
                                  color: 'var(--isn-blue)',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  padding: '8px 16px',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                Editar Módulo
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCourseModalOpen(false);
                      setSelectedCourse(null);
                      setCourseError('');
                      setCourseSuccess('');
                    }}
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '9999px',
                      border: 'none',
                      background: 'rgba(15, 44, 89, 0.05)',
                      color: 'var(--isn-blue)',
                      fontWeight: 600,
                      padding: '12px 24px',
                      cursor: 'pointer'
                    }}
                    disabled={courseSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '9999px',
                      border: 'none',
                      background: 'var(--isn-blue)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      padding: '12px 24px',
                      cursor: 'pointer'
                    }}
                    disabled={courseSubmitting}
                  >
                    {courseSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Module Edit Modal */}
      {isModuleModalOpen && selectedModule && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 44, 89, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1100,
          padding: '16px'
        }}>
          <div className="glass-panel animate-scale-up" style={{
            width: '100%',
            maxWidth: '600px',
            background: '#FFFFFF',
            borderRadius: '24px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(15, 44, 89, 0.2)',
            overflow: 'hidden',
            border: 'none',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px 28px 16px 28px',
              borderBottom: 'none',
              background: 'transparent',
              color: 'var(--text-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit size={20} color="var(--isn-blue)" style={{ strokeWidth: 2.5 }} />
                <h3 className="font-serif" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--isn-blue)', margin: 0 }}>
                  Editar Módulo
                </h3>
              </div>
              <button 
                onClick={() => {
                  setIsModuleModalOpen(false);
                  setSelectedModule(null);
                  setModuleError('');
                  setModuleSuccess('');
                }}
                style={{
                  background: 'rgba(15, 44, 89, 0.05)',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--isn-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  borderRadius: '9999px',
                  transition: 'background-color 0.15s'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ overflowY: 'auto', padding: '0 28px 24px 28px', flex: 1 }}>
              <form onSubmit={handleModuleEditSubmit}>
                
                {/* Messages */}
                {moduleError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '16px',
                    padding: '14px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--accent-rose)',
                    fontSize: '0.875rem'
                  }}>
                    <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                    <span>{moduleError}</span>
                  </div>
                )}

                {moduleSuccess && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '16px',
                    padding: '14px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#10B981',
                    fontSize: '0.875rem'
                  }}>
                    <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                    <span>{moduleSuccess}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Field: Titulo del modulo */}
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Título del Módulo
                    </label>
                    <input
                      type="text"
                      value={moduleTitulo}
                      onChange={(e) => setModuleTitulo(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '9999px',
                        border: '1.5px solid rgba(15, 44, 89, 0.15)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Field: Tipo de contenido */}
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Tipo de Contenido
                    </label>
                    <select
                      value={moduleTipo}
                      onChange={(e) => setModuleTipo(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '9999px',
                        border: '1.5px solid rgba(15, 44, 89, 0.15)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Video">Video</option>
                      <option value="Audio">Audio</option>
                      <option value="Imagen">Imagen</option>
                      <option value="Texto">Texto</option>
                    </select>
                  </div>

                  {/* Field: URL de recurso */}
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      URL del Recurso
                    </label>
                    <input
                      type="text"
                      value={moduleUrl}
                      onChange={(e) => setModuleUrl(e.target.value)}
                      placeholder="Ej. https://url-al-recurso.mp4"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '9999px',
                        border: '1.5px solid rgba(15, 44, 89, 0.15)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {/* Field: Contenido */}
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--isn-blue)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      Contenido Interactivo (HTML / Texto)
                    </label>
                    <textarea
                      value={moduleText}
                      onChange={(e) => setModuleText(e.target.value)}
                      rows={6}
                      placeholder="Escribe el contenido HTML o de texto aquí..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '20px',
                        border: '1.5px solid rgba(15, 44, 89, 0.15)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                        resize: 'none'
                      }}
                    />
                  </div>

                </div>

                {/* Modal Footer Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModuleModalOpen(false);
                      setSelectedModule(null);
                      setModuleError('');
                      setModuleSuccess('');
                    }}
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '9999px',
                      border: 'none',
                      background: 'rgba(15, 44, 89, 0.05)',
                      color: 'var(--isn-blue)',
                      fontWeight: 600,
                      padding: '12px 24px',
                      cursor: 'pointer'
                    }}
                    disabled={moduleSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      flex: 1,
                      borderRadius: '9999px',
                      border: 'none',
                      background: 'var(--isn-blue)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      padding: '12px 24px',
                      cursor: 'pointer'
                    }}
                    disabled={moduleSubmitting}
                  >
                    {moduleSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Simple Inline Keyframe Definitions for Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .table-row-hover:hover {
          background-color: #F8FAFC !important;
        }
        .btn-secondary-hover:hover {
          background-color: #F1F5F9;
        }
        .btn-edit-courses-hover:hover {
          background-color: rgba(0, 141, 218, 0.08) !important;
          color: var(--accent-teal) !important;
        }
        .animate-scale-up {
          animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      
    </div>
  );
};

export default AdminDashboard;
