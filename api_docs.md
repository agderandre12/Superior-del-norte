# Documentación de API - Sistema Instituto Superior del Norte CMS

Esta documentación describe el diseño de base de datos y la especificación de los endpoints del backend para el sistema dinámico de gestión de contenidos (CMS) multi-módulo de Instituto Superior del Norte.

---

## 💾 1. Esquema de Base de Datos (Relacional)

El almacenamiento es compatible con SQLite (principal) y fallback de almacenamiento JSON. Soporta múltiples cursos dinámicos e independientes.

### Tabla `usuarios`
Almacena las cuentas de usuarios en el sistema (estudiantes y administradores) con su respectiva información personal y estado de pago.
- `cedula`: `TEXT PRIMARY KEY` (Identificación nacional)
- `nombre_completo`: `TEXT`
- `password_hash`: `TEXT`
- `rol`: `TEXT DEFAULT 'estudiante'` ('estudiante' o 'administrador')
- `fecha_registro`: `TEXT` (Fecha de registro del usuario, formato `YYYY-MM-DD`)
- `fecha_expedicion_cedula`: `TEXT`
- `municipio_expedicion_cedula`: `TEXT`
- `municipio_nacimiento`: `TEXT`
- `anio_nacimiento`: `INTEGER`
- `pago_realizado`: `INTEGER DEFAULT 0` (Estado de pago: `1` para pagado, `0` para pendiente)
- `email`: `TEXT` (Correo electrónico real del estudiante para entrega de certificados. Si es `NULL`, el sistema deriva `${cedula}@institutosuperiordelnorte-student.co`)
- `vipass`: `INTEGER DEFAULT 0` (Flag de acceso VIP: `1` habilita la entrega automática de certificados al crear la cuenta vía admin. Implica certificación inmediata)

### Tabla `cursos`
Almacena la información principal de cada curso formativo.
- `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
- `titulo`: `TEXT` (Título principal, con restricción `UNIQUE` vía `idx_cursos_titulo`)
- `descripcion`: `TEXT` (Resumen curricular)
- `imagen_url`: `TEXT` (URL de imagen de portada)
- `creado_en`: `TEXT` (Fecha de registro de curso, formato `YYYY-MM-DD`)
- `precio`: `REAL NOT NULL` (Precio del curso, obligatorio, valor por defecto de 100000 en semilla de desarrollo)
- `certificado_template`: `TEXT` (Plantilla HTML opcional del diploma. Soporta las etiquetas `{{NOMBRE}}`, `{{CEDULA}}`, `{{FECHA_EXPEDICION}}`, `{{MUNICIPIO_EXPEDICION}}`, `{{ANIO_NACIMIENTO}}`, `{{CODIGO_VERIFICACION}}`, `{{FECHA_EMISION}}`. Si es `NULL`, se usa la plantilla institucional por defecto.)

### Tabla `modulos`
Almacena los módulos formativos asociados a un curso específico mediante una relación de clave foránea. **El número de módulos es dinámico por curso** — el progreso del 100% se calcula comparando registros completados contra el total de módulos del curso.
- `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
- `curso_id`: `INTEGER` (Clave foránea que referencia a `cursos(id)` en cascada)
- `titulo_modulo`: `TEXT` (Nombre del módulo)
- `orden`: `INTEGER` (Secuencia ordinal del módulo dentro del curso)
- `tipo_contenido`: `TEXT` (Tipo: `Texto`, `Video`, `Audio`, `Imagen`)
- `data_contenido`: `TEXT` (JSON serializado `{"url": "...", "text": "..."}`)

### Tabla `preguntas`
Almacena las preguntas del examen para cada curso. Las preguntas se cargan desde esta tabla en los endpoints de examen.
- `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
- `curso_id`: `INTEGER` (Clave foránea → `cursos(id)` ON DELETE CASCADE)
- `pregunta`: `TEXT`
- `opcion_a`, `opcion_b`, `opcion_c`, `opcion_d`: `TEXT`
- `respuesta_correcta`: `TEXT` — `'A'`, `'B'`, `'C'` o `'D'`. **Nunca se expone al cliente.**

### Tabla `examenes`
Almacena los intentos y estados evaluativos del estudiante para cada curso.
- `usuario_cedula`: `TEXT`
- `curso_id`: `INTEGER`
- `intentos`: `INTEGER` (Cantidad de intentos realizados)
- `puntaje_maximo`: `REAL` (Máxima nota obtenida, de 0 a 100)
- `aprobado`: `INTEGER` (Estado de aprobación: `1` para aprobado, `0` para no aprobado)
- `fecha_ultimo_intento`: `TEXT` (ISO timestamp del último intento — usado para cooldown de 10 min)
- *Clave Primaria:* `(usuario_cedula, curso_id)`

### Tabla `certificados`
Almacena las credenciales de diploma oficial emitidas por curso aprobado.
- `codigo_verificacion`: `TEXT PRIMARY KEY` (Código de validez formato `ALIM-XXXX-XXXX`)
- `usuario_cedula`: `TEXT`
- `curso_id`: `INTEGER`
- `fecha_emision`: `TEXT`
- `calificacion_obtenida`: `REAL`
- `numero_certificado`: `TEXT UNIQUE` (Registro secuencial formato `AS-2026-XXXX`)

---

## ⚙️ 2. Especificación de Endpoints (Backend)

Todos los endpoints (excepto las rutas públicas y de autenticación) requieren el token JWT en el header: `Authorization: Bearer <token>`.


### A. Crear Curso y Módulos (Solo Administradores)
Crea de manera atómica un curso completo. Si la inserción del curso o de algún módulo falla, se ejecuta un rollback para evitar registros huérfanos.

- **Endpoint:** `POST /api/admin/courses`
- **Request Body:**
```json
{
  "titulo": "Buenas Prácticas de Higiene para Lácteos",
  "descripcion": "Curso intensivo de inocuidad en el procesamiento y empaque de productos lácteos.",
  "imagen_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150",
  "precio": 120000,
  "certificado_template": "<html><body>...</body></html>",
  "modulos": [
    {
      "titulo_modulo": "Introducción e Higiene Corporal",
      "tipo_contenido": "Texto",
      "data_contenido": "<h3>Teoría</h3><p>El manipulador de lácteos debe mantener las uñas cortas...</p>"
    },
    {
      "titulo_modulo": "Simulación de Enfriamiento",
      "tipo_contenido": "Video",
      "data_contenido": "https://www.w3schools.com/html/mov_bbb.mp4"
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "message": "Curso creado con éxito junto con sus módulos.",
  "curso": {
    "id": 2,
    "titulo": "Buenas Prácticas de Higiene para Lácteos",
    "descripcion": "Curso intensivo de inocuidad...",
    "imagen_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150",
    "creado_en": "2026-05-26",
    "modulos": [...]
  }
}
```

### B. Listar Cursos Matriculados (Estudiantes)
Obtiene todos los cursos en los que el estudiante se encuentra matriculado, incluyendo el porcentaje de avance calculado dinámicamente.

- **Endpoint:** `GET /api/student/courses`
- **Response (200 OK):**
```json
[
  {
    "id": 1,
    "titulo": "Manipulación de Alimentos",
    "descripcion": "Curso estándar de 3 horas...",
    "imagen_url": "https://images.unsplash.com...",
    "creado_en": "2026-05-20",
    "fecha_matricula": "2026-05-20",
    "progreso_porcentaje": 12.5
  }
]
```

### C. endpoints Refactorizados con `courseId`
Los siguientes endpoints ahora aceptan `courseId` como parámetro en el query o en el body de la petición para realizar el filtrado dinámico del contenido:

1. **Obtener Temario:** `GET /api/course/content?courseId=X`
   - Retorna los módulos formateados para el visualizador del frontend correspondientes al curso solicitado.
2. **Obtener Progreso:** `GET /api/course/progress?courseId=X`
   - Retorna el porcentaje y los IDs de los módulos completados del curso solicitado.
3. **Preguntas de Examen:** `GET /api/exam/questions?courseId=X`
   - Retorna el quiz. Bloquea el acceso si no se han completado todos los módulos específicos de dicho curso.
4. **Enviar Examen:** `POST /api/exam/submit` (Envía `{ respuestas, courseId }`)
   - Evalúa y guarda el intento de examen para el curso solicitado. Si aprueba (>= 80%), genera el certificado en base de datos.
5. **Descargar Certificado PDF:** `GET /api/certificate/download?courseId=X`
   - Genera dinámicamente el certificado en PDF inyectando el nombre del curso en lugar de estar quemado.
6. **Detalle de Certificado:** `GET /api/certificate/detail?courseId=X`
   - Retorna los metadatos del diploma más la plantilla HTML interpolada del curso (`certificado_template`) si existe. Tags soportados: `{{NOMBRE}}`, `{{CEDULA}}`, `{{FECHA_EXPEDICION}}`, `{{MUNICIPIO_EXPEDICION}}`, `{{ANIO_NACIMIENTO}}`, `{{CODIGO_VERIFICACION}}`, `{{FECHA_EMISION}}`.
7. **Verificación Pública de Certificado:** `GET /api/certificate/verify/:codigo`
   - Ruta pública (sin autenticación). Valida la autenticidad de un diploma por su código de verificación. Retorna `{ valido, usuario, nombre_completo, cedula, fecha_emision, codigo_verificacion, calificacion_obtenida, curso_titulo, numero_certificado }`.
   - **Validación de formato:** el `codigo` debe cumplir el patrón `^[A-Za-z0-9]{3,5}-[A-Za-z0-9]{3,6}-[A-Za-z0-9]{3,6}$` (máx 50 caracteres). Códigos mal formados → `400`.
   - **Rate limiting:** 30 peticiones/minuto/IP para mitigar enumeración de códigos. Excedido → `429` con header `Retry-After`.
   - **Códigos de estado:** `200` (válido), `400` (formato inválido), `404` (formato válido pero inexistente), `429` (rate-limited).
   - **Integridad de datos:** el endpoint devuelve únicamente campos públicos. El frontend **no debe** usar valores fallback hardcodeados (`|| 100`, `|| 'AS-2026-0001'`) — mostrar exactamente lo que devuelve el API o un guion `—` si el campo está ausente.
8. **Listar Cursos (simplificado):** `GET /api/admin/courses/list`
   - Retorna un arreglo simplificado `[{ id, titulo }]` de todos los cursos (requiere admin).

---

## 🎨 3. Previsualización Óptima de Imagen en Frontend

Para lograr una experiencia premium (sin placeholders estáticos ni errores visuales de carga de imagen), se provee el siguiente método de previsualización en tiempo real mediante React:

1. **Estado de error reactivo (`imageError`):** Se mantiene un estado booleano para rastrear si la URL de la imagen es válida y cargable.
2. **Manejador de error en tag de imagen (`onError`):** Al cambiar la URL, se asume inicialmente como válida (`imageError = false`). Si el navegador falla al cargar la imagen, el evento `onError` del tag `<img>` lo captura y activa `imageError = true`.
3. **Renderizado condicional (Fallback elegante con Gradiente HSL):** 
   - Si la URL está vacía o `imageError` es `true`, se renderiza una tarjeta de fondo degradado corporativo (`linear-gradient`) y un ícono estilizado de `BookOpen` de lucide-react.
   - Si la imagen carga con éxito, se despliega como portada de fondo con un overlay translúcido para asegurar la legibilidad del título superior.

### Ejemplo de Código Implementado:
```jsx
// En el componente de Creación del Curso
const [imagenUrl, setImagenUrl] = useState('');
const [imageError, setImageError] = useState(false);

const handleImageChange = (val) => {
  setImagenUrl(val);
  setImageError(false); // Resetear estado al cambiar URL
};

// En el Renderizado
<div className="cover-preview-container">
  {imagenUrl.trim() && !imageError ? (
    <img 
      src={imagenUrl} 
      alt="Portada" 
      onError={() => setImageError(true)} 
      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
    />
  ) : (
    <div className="fallback-gradient-cover">
      <BookOpen size={48} />
      <span>Sin Portada Dinámica</span>
    </div>
  )}
</div>
```

### D. Gestión de Estudiantes y Certificación Directa (Solo Administradores)

#### 1. Crear Estudiante con Metadatos
Permite matricular a un estudiante, registrando sus datos de identificación, procedencia y estado de pago de manera obligatoria. Cuenta con una opción de bypass para la emisión inmediata de certificación.

- **Endpoint:** `POST /api/admin/users/create`
- **Request Body:**
```json
{
  "cedula": "987654321",
  "nombre_completo": "María García",
  "password": "provisional123",
  "email": "maria@correo.com",
  "cursos": [1],
  "fecha_expedicion_cedula": "2018-09-24",
  "municipio_expedicion_cedula": "Bucaramanga",
  "municipio_nacimiento": "Giron",
  "anio_nacimiento": 1996,
  "pago_realizado": 1,
  "certificar_inmediatamente": true,
  "vipass": false
}
```
- **Campos opcionales:**
  - `email` (string): correo real del estudiante. Si se omite, se deriva `${cedula}@institutosuperiordelnorte-student.co`.
  - `vipass` (boolean, default `false`): acceso VIP. Si es `true`, fuerza `certificar_inmediatamente = true` y dispara la entrega del certificado por correo corporativo.
  - `certificar_inmediatamente` (boolean, default `false`): bypass de examen y progreso.
- **Response (201 Created):**
```json
{
  "message": "Estudiante creado y matriculado con éxito.",
  "user": {
    "cedula": "987654321",
    "nombre_completo": "María García",
    "rol": "estudiante",
    "fecha_registro": "2026-06-17",
    "fecha_expedicion_cedula": "2018-09-24",
    "municipio_expedicion_cedula": "Bucaramanga",
    "municipio_nacimiento": "Giron",
    "anio_nacimiento": 1996,
    "pago_realizado": 1,
    "email": "maria@correo.com",
    "vipass": 0
  }
}
```
- **Seguridad del email de bienvenida:** por defecto (`EMAIL_INCLUDE_PASSWORD` no definido o `false`), el correo de bienvenida **no** incluye la contraseña provisional en texto plano; sólo muestra la cédula e indica que la contraseña se entrega por canal seguro. Habilitar `EMAIL_INCLUDE_PASSWORD=true` sólo si no existe flujo de establecimiento de contraseña.
- **Lógica de Certificación Inmediata:** Si `certificar_inmediatamente` es `true`, el servidor de manera transaccional y atómica:
  1. Registra 100% de progreso para todos los módulos asociados al curso en la tabla `progreso`.
  2. Registra un intento aprobado (calificación 100%) en la tabla `examenes`.
  3. Genera un registro oficial de diploma en la tabla `certificados`.
  4. Envía de forma asíncrona un correo electrónico de felicitación con el PDF adjunto.

#### 2. Descargar Certificado de Estudiante por Administrador
Permite a los administradores descargar el diploma de cualquier estudiante proporcionando su número de cédula y el ID del curso de interés.

- **Endpoint:** `GET /api/admin/certificate/download?cedula=X&courseId=Y`
- **Response (200 OK):**
  - Content-Type: `application/pdf`
  - Flujo binario (PDF)

#### 3. Actualizar Curso (Solo Administradores)
Permite modificar el título, la descripción y el precio obligatorio de un curso existente.

- **Endpoint:** `PUT /api/admin/courses/:id`
- **Request Body:**
```json
{
  "titulo": "Manipulación de Alimentos Premium",
  "descripcion": "Curso actualizado con regulaciones 2026...",
  "precio": 130000
}
```
- **Response (200 OK):**
```json
{
  "message": "Curso actualizado con éxito."
}
```

#### 4. Actualizar Módulo de Curso (Solo Administradores)
Permite modificar el título, tipo de contenido y el bloque interactive de datos de un módulo de curso formativo.

- **Endpoint:** `PUT /api/admin/courses/:courseId/modules/:moduleId`
- **Request Body:**
```json
{
  "titulo_modulo": "Módulo 1: Inocuidad y BPM (Edición 2026)",
  "tipo_contenido": "Texto",
  "data_contenido": "{\"url\":\"https://example.com/audio.mp3\",\"text\":\"## Nuevo Contenido BPM\"}"
}
```
- **Response (200 OK):**
```json
{
  "message": "Módulo de curso actualizado con éxito."
}
```

#### 5. Actualizar Perfil de Estudiante (Solo Administradores)
Permite modificar la información de perfil tradicional y extendida de un estudiante, así como su estado de pago.

- **Endpoint:** `PUT /api/admin/users/:cedula`
- **Request Body:**
```json
{
  "nombre_completo": "Juan Pérez Modificado",
  "fecha_expedicion_cedula": "2015-05-12",
  "municipio_expedicion_cedula": "Medellín",
  "municipio_nacimiento": "Itagüí",
  "anio_nacimiento": 1993,
  "pago_realizado": 1
}
```
- **Response (200 OK):**
```json
{
  "message": "Perfil del estudiante actualizado con éxito."
}
```

