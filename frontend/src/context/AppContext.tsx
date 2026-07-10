import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

export const AppContext = createContext<any>(null);

// API base URL resolved from the Vite environment. In dev it defaults to the
// local backend; in production it MUST be set at build time via
// VITE_API_BASE_URL (e.g. https://api.institutosuperiordelnorte.co/api).
// Hardcoding localhost here would break every request in a deployed build.
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Single source of truth for privileged roles. Mirrors backend ADMIN_ROLES.
export const ADMIN_ROLES = ['administrador', 'ingeniero_software'] as const;
export const isAdmin = (rol: string | undefined | null): boolean =>
  !!rol && (ADMIN_ROLES as readonly string[]).includes(rol);

const decodeJWTPayload = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT payload:', e);
    return null;
  }
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null);

  // Lazy init: decode user from stored token once, synchronously.
  const [user, setUser] = useState<any>(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const payload = decodeJWTPayload(savedToken);
      if (payload) {
        return {
          cedula: payload.cedula,
          nombre_completo: payload.nombre_completo,
          rol: payload.rol
        };
      }
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<string>(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      const payload = decodeJWTPayload(savedToken);
      if (payload) {
        return payload.rol === 'administrador' ? 'admin_dashboard' : 'dashboard';
      }
    }
    return 'login';
  });

  const [modules, setModules] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({ progreso_porcentaje: 0, modulos_completados: [] });
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [examStatus, setExamStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Course and Module states
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [studentCourses, setStudentCourses] = useState<any[]>([]);

  // Admin Panel states
  const [adminMetrics, setAdminMetrics] = useState<any>({ usuarios_activos: 0, cursos_completados: 0, cursos_pendientes: 0 });
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [financialMetrics, setFinancialMetrics] = useState<any>(null);

  const fetchStudentCourses = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/student/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudentCourses(data);
      }
    } catch (err) {
      console.error('Error fetching student courses:', err);
    }
  }, [token]);

  const fetchCourseContent = useCallback(async (courseId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/course/content?courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (err) {
      console.error('Error fetching course content:', err);
    }
  }, [token]);

  const fetchProgress = useCallback(async (courseId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/course/progress?courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  }, [token]);

  const fetchExamStatus = useCallback(async (courseId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/certificate/detail?courseId=${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExamStatus({ aprobado: true, score: data.calificacion_obtenida, intentos: data.intentos || 1 });
      } else {
        setExamStatus(null);
      }
    } catch (err) {
      console.error('Error checking exam status:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token && user?.cedula && user?.rol === 'estudiante') {
      fetchStudentCourses();
    }
  }, [token, user?.cedula, user?.rol, fetchStudentCourses]);

  useEffect(() => {
    if (token && user?.cedula && user?.rol === 'estudiante' && activeCourseId) {
      fetchCourseContent(activeCourseId);
      fetchProgress(activeCourseId);
      fetchExamStatus(activeCourseId);
    }
  }, [token, user?.cedula, user?.rol, activeCourseId, fetchCourseContent, fetchProgress, fetchExamStatus]);

  const login = async (cedula: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      // Keep legacy currentView in sync; navigation itself is handled by callers
      // via useNavigate() (see Login.tsx / AdminLogin.tsx).
      setCurrentView(isAdmin(data.user.rol) ? 'admin_dashboard' : 'dashboard');
      return data.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setModules([]);
    setProgress({ progreso_porcentaje: 0, modulos_completados: [] });
    setActiveModuleId(null);
    setExamStatus(null);
    setAdminMetrics({ usuarios_activos: 0, cursos_completados: 0, cursos_pendientes: 0 });
    setAdminUsers([]);
    setCourses([]);
    setStudentCourses([]);
    setActiveCourseId(null);
    setFinancialMetrics(null);
    setError(null);
    setCurrentView('login');
  };

  const completeModule = async (moduloId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/course/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ modulo_id: moduloId })
      });
      if (response.ok) {
        const data = await response.json();
        setProgress({
          progreso_porcentaje: data.progreso_porcentaje,
          modulos_completados: data.modulos_completados
        });
        await fetchStudentCourses();
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const submitExam = async (respuestas: Record<number, string>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/exam/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ respuestas, courseId: activeCourseId })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar examen');
      }

      if (data.aprobado) {
        setExamStatus({ aprobado: true, score: data.puntaje, intentos: data.intentos });
      } else {
        setExamStatus({ aprobado: false, score: data.puntaje, intentos: data.intentos });
      }
      await fetchStudentCourses();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/certificate/download?courseId=${activeCourseId}`, {
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
      const currentCourse = studentCourses.find(c => c.id === activeCourseId);
      const filename = currentCourse
        ? `Certificado_${currentCourse.titulo.replace(/\s+/g, '_')}_${user.cedula}.pdf`
        : `Certificado_${user.cedula}.pdf`;
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

  const downloadActa = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/certificate/download-acta?courseId=${activeCourseId}`, {
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
      const currentCourse = studentCourses.find(c => c.id === activeCourseId);
      const filename = currentCourse
        ? `Acta_de_Grado_${currentCourse.titulo.replace(/\s+/g, '_')}_${user.cedula}.pdf`
        : `Acta_de_Grado_${user.cedula}.pdf`;
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

  const downloadStudentCertificate = useCallback(async (studentCedula: string, courseId: number, type: 'notas' | 'acta' | 'diploma') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/certificate/download?cedula=${studentCedula}&courseId=${courseId}&type=${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'No se pudo descargar el documento');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      let filename = `Documento_${type}_${studentCedula}.pdf`;
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/["']/g, '');
        }
      }
      
      a.target = '_blank';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    }
  }, [token, API_BASE_URL]);

  const fetchAdminMetrics = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdminMetrics(data);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    }
  }, [token, API_BASE_URL]);

  const fetchFinancialMetrics = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/financial-metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFinancialMetrics(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching financial metrics:', err);
    }
  }, [token, API_BASE_URL]);

  const fetchAdminUsers = useCallback(async (cedula: string = '') => {
    if (!token) return;
    try {
      const url = cedula
        ? `${API_BASE_URL}/admin/users?cedula=${cedula}`
        : `${API_BASE_URL}/admin/users`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdminUsers(data);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    }
  }, [token, API_BASE_URL]);

  const fetchCourses = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }, [token, API_BASE_URL]);

  const createCourse = useCallback(async (courseData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el curso');
      }
      await fetchCourses();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE_URL, fetchCourses]);

  const createStudentUser = useCallback(async (studentData: any) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear estudiante');
      }
      await fetchAdminMetrics();
      await fetchAdminUsers();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE_URL, fetchAdminMetrics, fetchAdminUsers]);

  const fetchCoursesList = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCoursesList(data);
        return data;
      }
    } catch (err) {
      console.error('Error fetching courses list:', err);
    }
  }, [token, API_BASE_URL]);

  const updateStudentCourses = useCallback(async (cedula: string, courseIds: number[]) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${cedula}/courses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cursos: courseIds })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar cursos del estudiante');
      }
      await fetchAdminMetrics();
      await fetchAdminUsers();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE_URL, fetchAdminMetrics, fetchAdminUsers]);

  const updateCourse = useCallback(async (id: number, courseData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(courseData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el curso');
      }
      await fetchCourses();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateCourseModule = useCallback(async (courseId: number, moduleId: number, moduleData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(moduleData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el módulo');
      }
      await fetchCourses();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateStudentProfile = useCallback(async (cedula: string, profileData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${cedula}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el perfil del estudiante');
      }
      await fetchAdminMetrics();
      await fetchAdminUsers();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return (
    <AppContext.Provider value={{
      user,
      token,
      currentView,
      setCurrentView,
      modules,
      progress,
      activeModuleId,
      setActiveModuleId,
      examStatus,
      setExamStatus,
      activeCourseId,
      setActiveCourseId,
      studentCourses,
      setStudentCourses,
      fetchStudentCourses,
      loading,
      error,
      login,
      logout,
      completeModule,
      submitExam,
      downloadCertificate,
      downloadActa,
      downloadStudentCertificate,
      adminMetrics,
      adminUsers,
      courses,
      coursesList,
      fetchAdminMetrics,
      fetchAdminUsers,
      fetchCourses,
      createCourse,
      fetchCoursesList,
      createStudentUser,
      updateStudentCourses,
      updateCourse,
      updateCourseModule,
      updateStudentProfile,
      financialMetrics,
      fetchFinancialMetrics,
      API_BASE_URL
    }}>
      {children}
    </AppContext.Provider>
  );
};
