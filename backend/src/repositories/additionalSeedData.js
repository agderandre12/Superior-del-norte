// Seed data for the 5 new courses: Mecánica Básica, Primeros Auxilios, Manejo Defensivo, Manejo 4x4, Atención al Cliente
// Every course contains exactly 8 modules and 8 exam questions with answers.
// We use high-range IDs (102-106) for courses to avoid collision with any user-created auto-incrementing IDs.

const additionalCourses = [
  {
    id: 102,
    titulo: 'Mecánica Básica',
    descripcion: 'Aprende los principios fundamentales de la mecánica automotriz, diagnóstico de fallas y mantenimiento preventivo.',
    imagen_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    creado_en: '2026-06-17',
    precio: 150000
  },
  {
    id: 103,
    titulo: 'Primeros Auxilios',
    descripcion: 'Capacitación esencial en soporte vital básico (SVB), reanimación cardiopulmonar (RCP) y manejo de emergencias médicas.',
    imagen_url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80',
    creado_en: '2026-06-17',
    precio: 120000
  },
  {
    id: 104,
    titulo: 'Manejo Defensivo',
    descripcion: 'Técnicas avanzadas de anticipación, seguridad vial y prevención de siniestros bajo cualquier condición de la vía.',
    imagen_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
    creado_en: '2026-06-17',
    precio: 130000
  },
  {
    id: 105,
    titulo: 'Manejo 4x4',
    descripcion: 'Aprende el uso técnico del bajo/duplicadora, ángulos off-road, vadeo seguro y técnicas de rescate en terrenos difíciles.',
    imagen_url: 'https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?auto=format&fit=crop&w=800&q=80',
    creado_en: '2026-06-17',
    precio: 180000
  },
  {
    id: 106,
    titulo: 'Atención al Cliente',
    descripcion: 'Domina la comunicación asertiva, inteligencia emocional y gestión de PQRS para resolver conflictos y fidelizar clientes.',
    imagen_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
    creado_en: '2026-06-17',
    precio: 110000
  },
  {
    id: 107,
    titulo: 'Bachiller Académico',
    descripcion: 'Curso especial enfocado únicamente en la obtención de la certificación de Bachiller Académico.',
    imagen_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    creado_en: '2026-07-06',
    precio: 200000,
    certificacion_directa: 1
  }
];

const additionalModules = [
  // ==========================================
  // MECÁNICA BÁSICA (Curso ID: 102, Módulos 201-208)
  // ==========================================
  {
    id: 201,
    curso_id: 102,
    titulo_modulo: 'Módulo 1: Introducción y Mapa de Ruta del Estudiante',
    orden: 1,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Introducción al curso de mecánica y mapa de ruta formativa -->
<h3>Bienvenido a la Mecánica Automotriz Básica</h3>
<p>El conocimiento de la mecánica básica de un vehículo no solo te permite ahorrar dinero en reparaciones sencillas, sino que también garantiza tu seguridad vial al identificar fallas antes de que se conviertan en siniestros.</p>
<div class="roadmap-container">
  <div class="roadmap-title">Mapa de Ruta del Estudiante</div>
  <div class="roadmap-steps">
    <div class="roadmap-step"><span class="roadmap-badge">M1</span><span>Fundamentos y Mapa de Ruta</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M2</span><span>El Motor de Combustión</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M3</span><span>Sistemas de Refrigeración y Lubricación</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M4</span><span>Sistema de Frenado</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M5</span><span>Suspensión, Dirección y Transmisión</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M6</span><span>Diagnóstico, Herramientas y Seguridad</span></div>
  </div>
</div>
<div class="highlight-box">
  <strong>Importante:</strong> Antes de trabajar en cualquier vehículo, asegúrate de contar con terreno plano, freno de mano activo y gafas de protección ocular.
</div>`
    })
  },
  {
    id: 202,
    curso_id: 102,
    titulo_modulo: 'Módulo 2: El Motor de Combustión Interna y sus Componentes',
    orden: 2,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Componentes principales del motor de cuatro tiempos -->
<h3>El Corazón del Vehículo: El Motor</h3>
<p>La mayoría de automóviles modernos operan con un motor de combustión interna de cuatro tiempos (Admisión, Compresión, Combustión y Escape).</p>
<h4>Componentes Estructurales Clave:</h4>
<ul>
  <li><strong>El Bloque de Motor:</strong> La estructura principal donde se alojan los cilindros.</li>
  <li><strong>La Culata (Cabezote):</strong> Sella la parte superior de los cilindros y contiene las válvulas de admisión y escape.</li>
  <li><strong>Los Pistones y Bielas:</strong> Convierten la energía de la combustión en fuerza mecánica lineal.</li>
  <li><strong>El Cigüeñal:</strong> Transforma el movimiento lineal del pistón en un movimiento giratorio continuo.</li>
</ul>
<div class="pedagogical-tip">
  <strong>Consejo de Diagnóstico:</strong> Si observas humo azul saliendo del escape, esto generalmente indica que el aceite está ingresando a la cámara de combustión debido a anillos de pistón desgastados.
</div>`
    })
  },
  {
    id: 203,
    curso_id: 102,
    titulo_modulo: 'Módulo 3: Sistema de Alimentación de Combustible',
    orden: 3,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Proceso de inyección y aire en la cámara de combustión -->
<h3>Mezcla Aire-Combustible y su Entrega</h3>
<p>Para que la combustión ocurra de manera eficiente, el motor requiere una dosificación exacta de aire y gasolina o diésel.</p>
<h4>Elementos del Sistema:</h4>
<ol>
  <li><strong>Bomba de Combustible:</strong> Envía el combustible desde el tanque hacia los inyectores bajo presión.</li>
  <li><strong>Filtro de Combustible:</strong> Retiene sedimentos e impurezas nocivas para el sistema de inyección.</li>
  <li><strong>Inyectores de Combustible:</strong> Pulverizan la gasolina en la corriente de aire de admisión.</li>
  <li><strong>Filtro de Aire:</strong> Limpia el aire exterior de partículas de polvo antes de ingresar al colector de admisión.</li>
</ol>
<div class="highlight-box">
  Un filtro de aire obstruido reduce drásticamente el rendimiento del motor e incrementa el consumo de combustible hasta en un 15%. Cambiarlo regularmente es la tarea de mantenimiento más fácil y económica.
</div>`
    })
  },
  {
    id: 204,
    curso_id: 102,
    titulo_modulo: 'Módulo 4: Sistema de Refrigeración del Motor',
    orden: 4,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Control de temperatura e intercambio calórico en el radiador -->
<h3>Controlando la Temperatura del Motor</h3>
<p>El motor produce calor extremo durante la combustión. El sistema de refrigeración mantiene la temperatura en un rango operativo ideal (entre 90°C y 105°C).</p>
<h4>Componentes Fundamentales:</h4>
<ul>
  <li><strong>Radiador:</strong> Disipa el calor del líquido refrigerante al aire ambiente.</li>
  <li><strong>Termostato:</strong> Válvula sensible al calor que controla el flujo de refrigerante hacia el radiador.</li>
  <li><strong>Bomba de Agua:</strong> Hace circular el líquido a través del bloque y la culata del motor.</li>
  <li><strong>Ventilador de Enfriamiento:</strong> Aumenta el flujo de aire a través del radiador a bajas velocidades.</li>
</ul>
<div class="pedagogical-tip">
  <strong>Alerta de Seguridad:</strong> ¡Nunca retires la tapa del radiador con el motor caliente! El líquido se encuentra bajo alta presión y puede causar quemaduras graves de forma instantánea.
</div>`
    })
  },
  {
    id: 205,
    curso_id: 102,
    titulo_modulo: 'Módulo 5: Sistema de Lubricación',
    orden: 5,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Lubricación, viscosidad y prevención de fricción metálica -->
<h3>Protegiendo los Metales contra el Desgaste</h3>
<p>El aceite del motor cumple tres misiones críticas: reducir la fricción entre partes móviles, disipar parte del calor interno y limpiar las partículas metálicas generadas por el desgaste.</p>
<h4>Tipos de Aceite:</h4>
<ul>
  <li><strong>Minerales:</strong> Derivados directos del petróleo crudo, adecuados para motores antiguos o de baja exigencia.</li>
  <li><strong>Sintéticos:</strong> Diseñados químicamente en laboratorio para ofrecer máxima estabilidad térmica y durabilidad.</li>
  <li><strong>Semi-sintéticos:</strong> Una mezcla equilibrada que ofrece buen desempeño a costo moderado.</li>
</ul>
<div class="highlight-box">
  <strong>Verificación de Nivel:</strong> Revisa el nivel de aceite cada 1,000 kilómetros utilizando la varilla de medición. El nivel siempre debe estar posicionado exactamente entre las marcas 'MIN' y 'MAX'.
</div>`
    })
  },
  {
    id: 206,
    curso_id: 102,
    titulo_modulo: 'Módulo 6: Sistema de Frenos y Líquido Hidráulico',
    orden: 6,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Principio de Pascal aplicado al frenado y componentes de fricción -->
<h3>El Sistema de Seguridad Más Importante</h3>
<p>Los frenos transforman la energía cinética del vehículo en energía térmica a través de la fricción entre elementos móviles y fijos.</p>
<h4>Componentes y Funcionamiento:</h4>
<ol>
  <li><strong>Bomba Principal:</strong> Transforma la fuerza mecánica del pedal en presión hidráulica.</li>
  <li><strong>Mordaza (Calíper) y Pastillas:</strong> Presionan contra el disco de freno giratorio para detener las ruedas.</li>
  <li><strong>Disco de Freno:</strong> Gira solidario con la rueda y disipa el calor generado durante la frenada.</li>
  <li><strong>Líquido de Frenos:</strong> Fluido incompresible e higroscópico encargado de transmitir la presión.</li>
</ol>
<div class="pedagogical-tip">
  <strong>Señal de Peligro:</strong> Un pedal de freno con sensación esponjosa suele indicar la presencia de burbujas de aire en las líneas hidráulicas, requiriendo una purga inmediata del sistema.
</div>`
    })
  },
  {
    id: 207,
    curso_id: 102,
    titulo_modulo: 'Módulo 7: Suspensión y Dirección del Vehículo',
    orden: 7,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Estabilidad, amortiguación y control direccional -->
<h3>Estabilidad y Control en Marcha</h3>
<p>El sistema de suspensión absorbe las irregularidades del pavimento para mantener el confort y, lo más importante, asegurar el contacto constante del neumático con el suelo.</p>
<h4>Elementos Clave:</h4>
<ul>
  <li><strong>Amortiguadores:</strong> Controlan el rebote excesivo de los resortes y mantienen la estabilidad de la carrocería.</li>
  <li><strong>Espirales (Resortes):</strong> Soportan el peso total del vehículo y absorben impactos secos.</li>
  <li><strong>Bujes de Suspensión:</strong> Aíslan la vibración y permiten la articulación de los brazos de control.</li>
  <li><strong>Terminales de Dirección:</strong> Transmiten el movimiento de la caja de dirección hacia las llantas delanteras.</li>
</ul>
<div class="highlight-box">
  Los amortiguadores desgastados aumentan la distancia de frenado hasta en un 20% y aceleran drásticamente el desgaste irregular de los neumáticos delanteros.
</div>`
    })
  },
  {
    id: 208,
    curso_id: 102,
    titulo_modulo: 'Módulo 8: Diagnóstico de Fallas Comunes y Alertas del Tablero',
    orden: 8,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Interpretación de alarmas OBD y códigos de error del check engine -->
<h3>Lectura del Tablero de Instrumentos</h3>
<p>El tablero utiliza un código de colores tipo semáforo para informarte de la urgencia e importancia de las fallas del sistema:</p>
<ul>
  <li><span style="color:#EF4444; font-weight:bold;">Rojo (Alerta Crítica):</span> Detén el motor de inmediato. Ejemplos: Baja presión de aceite, sobrecalentamiento térmico o falla del sistema de carga.</li>
  <li><span style="color:#D4AF37; font-weight:bold;">Amarillo/Naranja (Precaución/Advertencia):</span> Diagnóstico requerido a la brevedad. Ejemplo: Luz "Check Engine" o indicador de desgaste de pastillas de freno.</li>
  <li><span style="color:#10B981; font-weight:bold;">Verde/Azul (Informativo):</span> Sistemas activos normales. Ejemplo: Luces encendidas o control de crucero.</li>
</ul>
<div class="pedagogical-tip">
  <strong>Herramienta Clave:</strong> Un escáner OBD-II básico permite leer los códigos de error almacenados en la computadora del motor para ubicar el origen exacto del desperfecto eléctrico o mecánico.
</div>`
    })
  },

  // ==========================================
  // PRIMEROS AUXILIOS (Curso ID: 103, Módulos 301-308)
  // ==========================================
  {
    id: 301,
    curso_id: 103,
    titulo_modulo: 'Módulo 1: Introducción, Mapa de Ruta y Principio PAS',
    orden: 1,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Protocolo de acción segura ante una víctima de accidente -->
<h3>Principios de Atención en Emergencias Médicas</h3>
<p>Los primeros auxilios son los cuidados inmediatos y provisionales prestados a personas accidentadas o con enfermedades repentinas antes de recibir atención especializada.</p>
<div class="roadmap-container">
  <div class="roadmap-title">Mapa de Ruta del Estudiante</div>
  <div class="roadmap-steps">
    <div class="roadmap-step"><span class="roadmap-badge">M1</span><span>Ruta y Conducta PAS</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M2</span><span>Evaluación Primaria del Paciente</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M3</span><span>Reanimación Cardiopulmonar (RCP)</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M4</span><span>Atragantamiento (Maniobra de Heimlich)</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M5</span><span>Heridas, Control de Hemorragias y Quemaduras</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M6</span><span>Manejo de Fracturas e Inmovilizaciones</span></div>
  </div>
</div>
<h4>La Regla de Oro: Conducta PAS</h4>
<ol>
  <li><strong>P (Proteger):</strong> Asegurar la zona del incidente para evitar nuevos accidentes. Tu propia seguridad es lo primero.</li>
  <li><strong>A (Alertar):</strong> Llamar a los números de emergencia médica proporcionando información precisa de ubicación y estado.</li>
  <li><strong>S (Socorrer):</strong> Prestar la asistencia primaria evaluando las funciones vitales de la víctima.</li>
</ol>`
    })
  },
  {
    id: 302,
    curso_id: 103,
    titulo_modulo: 'Módulo 2: Evaluación Primaria del Paciente',
    orden: 2,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Evaluación rápida de estado de consciencia y respiración -->
<h3>Evaluación Inicial en Situación Crítica</h3>
<p>La evaluación primaria es un examen sistemático rápido destinado a identificar condiciones que ponen en peligro inmediato la vida del paciente.</p>
<h4>Protocolo ABC del Socorrista:</h4>
<ul>
  <li><strong>A (Airway - Vía Aérea):</strong> Verificar que la vía aérea esté despejada y abrirla mediante la maniobra frente-mentón si no hay sospecha de trauma cervical.</li>
  <li><strong>B (Breathing - Respiración):</strong> Aplicar la técnica MES (Mirar el pecho, Escuchar la salida del aire, Sentir el aliento en tu mejilla) durante 10 segundos.</li>
  <li><strong>C (Circulation - Circulación):</strong> Controlar hemorragias severas externas de manera inmediata y evaluar pulso/temperatura de la piel.</li>
</ul>
<div class="highlight-box">
  Si la persona no responde a estímulos dolorosos ni llamados verbales y NO respira normalmente, debes activar de inmediato la alerta médica por paro cardiorrespiratorio.
</div>`
    })
  },
  {
    id: 303,
    curso_id: 103,
    titulo_modulo: 'Módulo 3: Reanimación Cardiopulmonar (RCP) y Desfibrilador',
    orden: 3,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Compresiones torácicas coordinadas y uso del DEA externo -->
<h3>Soporte Vital Básico: Salvar una Vida</h3>
<p>La RCP es una técnica de emergencia que combina compresiones del pecho y ventilaciones artificiales para mantener la sangre oxigenada circulando hacia el cerebro.</p>
<h4>Procedimiento en Adultos:</h4>
<ol>
  <li>Posiciona a la víctima boca arriba sobre una superficie firme.</li>
  <li>Ubica el talón de una mano en el centro del pecho (mitad inferior del esternón) y entrelaza la otra encima.</li>
  <li>Realiza compresiones continuas con los brazos extendidos y firmes.</li>
  <li><strong>Ritmo:</strong> 30 compresiones seguidas de 2 ventilaciones (ritmo de 100 a 120 compresiones por minuto).</li>
  <li>Comprime con una profundidad mínima de 5 centímetros en adultos.</li>
</ol>
<div class="pedagogical-tip">
  <strong>Desfibrilador Externo Automático (DEA):</strong> Si cuentas con un DEA, enciéndelo y sigue las instrucciones de voz. El dispositivo analizará el ritmo cardíaco y te indicará si se requiere una descarga eléctrica.
</div>`
    })
  },
  {
    id: 304,
    curso_id: 103,
    titulo_modulo: 'Módulo 4: Obstrucción de la Vía Aérea (Atragantamiento)',
    orden: 4,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Identificación de tos ineficaz y maniobra de Heimlich en adultos -->
<h3>Actuación ante Asfixia por Cuerpo Extraño</h3>
<p>La obstrucción respiratoria puede ser parcial (la víctima tose con fuerza y puede hablar) o total (la víctima no puede emitir sonidos, tose ineficazmente y se lleva las manos al cuello).</p>
<h4>Técnica para Obstrucción Total (Maniobra de Heimlich):</h4>
<ol>
  <li>Colócate de pie detrás de la víctima y rodéale la cintura con tus brazos.</li>
  <li>Haz un puño con una mano y colócalo justo encima del ombligo, debajo de las costillas.</li>
  <li>Sujeta el puño con la otra mano y presiona con fuerza hacia adentro y hacia arriba de forma explosiva.</li>
  <li>Repite el procedimiento hasta que el cuerpo extraño sea expulsado o la víctima pierda el conocimiento.</li>
</ol>
<div class="highlight-box">
  Si la víctima pierde el conocimiento, colócala en el suelo con cuidado, solicita asistencia de urgencias e inicia de inmediato la secuencia normal de RCP.
</div>`
    })
  },
  {
    id: 305,
    curso_id: 103,
    titulo_modulo: 'Módulo 5: Control de Hemorragias Externas',
    orden: 5,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Presión directa y uso de vendaje compresivo/torniquete -->
<h3>Prevención de Choque Hipovolémico</h3>
<p>Una pérdida masiva de sangre puede provocar la muerte del paciente en pocos minutos. Controlar la hemorragia es la prioridad médica principal tras asegurar la vía aérea.</p>
<h4>Métodos de Control de Hemorragias:</h4>
<ul>
  <li><strong>Presión Directa:</strong> Aplica presión firme con una gasa estéril o paño limpio sobre el sitio exacto del sangrado durante al menos 5 minutos sin retirar el apósito.</li>
  <li><strong>Vendaje Compresivo:</strong> Fija el apósito con una venda apretada para mantener la presión de forma constante.</li>
  <li><strong>Uso del Torniquete:</strong> Utilízalo únicamente en extremidades ante hemorragias arteriales severas que comprometan la vida. Colócalo de 5 a 7 centímetros por encima de la herida, nunca sobre las articulaciones.</li>
</ul>
<div class="pedagogical-tip">
  <strong>Comentario de Seguridad:</strong> Registra siempre la hora exacta de colocación del torniquete escribiéndola sobre el mismo dispositivo o en la frente de la víctima.
</div>`
    })
  },
  {
    id: 306,
    curso_id: 103,
    titulo_modulo: 'Módulo 6: Quemaduras y Clasificación',
    orden: 6,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Tratamiento inmediato de quemaduras térmicas y sustancias químicas -->
<h3>Clasificación y Cuidado de las Quemaduras</h3>
<p>Las quemaduras son lesiones térmicas producidas por calor, radiación, electricidad o contacto directo con productos químicos.</p>
<h4>Grados de Severidad:</h4>
<ul>
  <li><strong>Primer Grado:</strong> Daño en la epidermis. Enrojecimiento local y ardor leve. Ejemplo: Quemadura solar.</li>
  <li><strong>Segundo Grado:</strong> Daño en la dermis. Formación de ampollas dolorosas y enrojecimiento intenso.</li>
  <li><strong>Tercer Grado:</strong> Destrucción de todo el tejido de la piel. Aspecto blanquecino o carbonizado. Generalmente indolora debido a la destrucción de las terminaciones nerviosas.</li>
</ul>
<div class="highlight-box">
  <strong>Primeros Auxilios Críticos:</strong> Enfría la zona afectada utilizando agua limpia a temperatura ambiente durante 15 a 20 minutos. Nunca apliques hielo directo, aceites, cremas ni remedios caseros.
</div>`
    })
  },
  {
    id: 307,
    curso_id: 103,
    titulo_modulo: 'Módulo 7: Inmovilizaciones y Fracturas',
    orden: 7,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Inmovilización provisional para evitar daño neuromuscular -->
<h3>Cuidado del Trauma Óseo y Articular</h3>
<p>Ante una fractura sospechada, el principal objetivo de los primeros auxilios es mantener la extremidad completamente inmóvil para prevenir lesiones en vasos sanguíneos y nervios adyacentes.</p>
<h4>Técnicas de Inmovilización:</h4>
<ol>
  <li>Evita a toda costa mover la articulación o intentar alinear el hueso deformado.</li>
  <li>Utiliza tablillas, cartón grueso o revistas enrolladas como soportes rígidos temporales.</li>
  <li>Fija la tablilla por encima y por debajo de la articulación fracturada usando vendajes limpios.</li>
  <li>En caso de fracturas abiertas (el hueso se expone), cubre la herida con apósitos estériles antes de inmovilizar.</li>
</ol>
<div class="pedagogical-tip">
  <strong>Monitoreo:</strong> Verifica periódicamente que los dedos de la extremidad inmovilizada no estén fríos, morados ni entumecidos, señal de que el vendaje está obstruyendo la circulación sanguínea.
</div>`
    })
  },
  {
    id: 308,
    curso_id: 103,
    titulo_modulo: 'Módulo 8: Triaje en Incidentes de Múltiples Víctimas',
    orden: 8,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Priorización rápida de atención médica utilizando el método START -->
<h3>Clasificación y Priorización de Heridos</h3>
<p>Cuando el número de víctimas supera la capacidad inmediata de atención del socorrista, se debe emplear un sistema de clasificación rápida (Triaje).</p>
<h4>Categorización Internacional de Emergencia (Método START):</h4>
<ul>
  <li><span style="color:#EF4444; font-weight:bold;">Rojo (Inmediato):</span> Lesiones críticas que comprometen la vida de forma inminente pero son reversibles con atención rápida.</li>
  <li><span style="color:#D4AF37; font-weight:bold;">Amarillo (Diferido):</span> Lesiones estables que requieren atención pero pueden esperar un lapso de tiempo moderado.</li>
  <li><span style="color:#10B981; font-weight:bold;">Verde (Leve):</span> Víctimas conscientes que pueden caminar y presentan heridas superficiales.</li>
  <li><span style="color:#2D3748; font-weight:bold;">Negro (Fallecido):</span> Personas sin pulso ni respiración tras un intento inicial de apertura de la vía aérea.</li>
</ul>`
    })
  },

  // ==========================================
  // MANEJO DEFENSIVO (Curso ID: 104, Módulos 401-408)
  // ==========================================
  {
    id: 401,
    curso_id: 104,
    titulo_modulo: 'Módulo 1: Introducción y Fundamentos de Conducción Defensiva',
    orden: 1,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Concepto de manejo defensivo, estadísticas y mapa de ruta vial -->
<h3>El Factor Humano en la Seguridad Vial</h3>
<p>El manejo defensivo consiste en conducir con técnicas orientadas a prevenir accidentes a pesar de las acciones incorrectas de los demás conductores y de las condiciones climáticas o del terreno.</p>
<div class="roadmap-container">
  <div class="roadmap-title">Mapa de Ruta de Conducción Defensiva</div>
  <div class="roadmap-steps">
    <div class="roadmap-step"><span class="roadmap-badge">M1</span><span>Fundamentos y Mapa de Ruta</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M2</span><span>Fórmula de Distancias y Tiempos</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M3</span><span>Técnicas de Observación Activa</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M4</span><span>Condiciones Adversas de la Vía</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M5</span><span>Fatiga, Distracciones y Psicología</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M6</span><span>Seguridad Activa y Protocolos PAS</span></div>
  </div>
</div>
<div class="highlight-box">
  El 90% de los accidentes de tránsito a nivel mundial se deben al factor humano (exceso de velocidad, distracciones y conducción bajo efectos de alcohol o fatiga).
</div>`
    })
  },
  {
    id: 402,
    curso_id: 104,
    titulo_modulo: 'Módulo 2: Distancias de Seguimiento y Frenado',
    orden: 2,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Cálculo físico de distancia de reacción, frenado y regla de los 3 segundos -->
<h3>Física de la Conducción: Distancias Críticas</h3>
<p>Detener un vehículo en movimiento no es instantáneo. La distancia de parada total es la suma del tiempo de reacción mental del conductor más el tiempo de frenado mecánico.</p>
<h4>Cálculo de la Distancia de Parada:</h4>
<ul>
  <li><strong>Distancia de Reacción:</strong> Espacio recorrido desde que ves el peligro hasta que pisas el pedal de freno. Promedio: 0.75 a 1 segundo.</li>
  <li><strong>Distancia de Frenado:</strong> Espacio que recorre el vehículo una vez aplicados los frenos, condicionado por la velocidad física y la fricción del pavimento.</li>
</ul>
<div class="highlight-box">
  <strong>Regla de los 3 Segundos:</strong> Elige un punto de referencia fijo en la vía. Cuando el vehículo delante pase por allí, cuenta: "mil uno, mil dos, mil tres". Si pasas el punto antes de terminar de contar, tu distancia de seguimiento es insegura.
</div>`
    })
  },
  {
    id: 403,
    curso_id: 104,
    titulo_modulo: 'Módulo 3: Técnicas de Observación y Anticipación',
    orden: 3,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Escaneo visual de 15 segundos y control de puntos ciegos -->
<h3>Anticipación al Peligro en la Vía</h3>
<p>Un conductor defensivo no reacciona al peligro; lo anticipa escaneando visualmente el entorno de forma continua.</p>
<h4>Las Cinco Reglas de Observación:</h4>
<ol>
  <li><strong>Mirar Lejos hacia Adelante:</strong> Mantén la mirada 15 segundos adelante para identificar retenciones o cambios de carril preventivos.</li>
  <li><strong>Tener una Visión Panorámica:</strong> Monitorea los costados de la vía para detectar peatones distraídos o vehículos incorporándose.</li>
  <li><strong>Mantener los Ojos en Movimiento:</strong> Evita fijar la mirada en un solo punto por más de 2 segundos para no generar fatiga visual.</li>
  <li><strong>Asegurar una Salida:</strong> Mantén siempre un colchón de espacio alrededor del vehículo para realizar maniobras evasivas seguras.</li>
  <li><strong>Hacerse Ver:</strong> Utiliza las luces del vehículo, direccionales y la bocina de forma oportuna para comunicarte con otros conductores.</li>
</ol>
<div class="pedagogical-tip">
  <strong>Puntos Ciegos:</strong> Ajusta los espejos retrovisores laterales de modo que casi no veas la carrocería de tu vehículo, minimizando los puntos ciegos en los costados.
</div>`
    })
  },
  {
    id: 404,
    curso_id: 104,
    titulo_modulo: 'Módulo 4: Conducción en Condiciones Climáticas Adversas',
    orden: 4,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Efecto de aquaplaning, conducción en lluvia, niebla y hielo -->
<h3>Adherencia y Pérdida de Control Hidráulico</h3>
<p>El clima adverso altera drásticamente el estado de la vía y el coeficiente de fricción de los neumáticos con el suelo.</p>
<h4>Peligros Críticos del Asfalto Mojado:</h4>
<ul>
  <li><strong>Efecto Aquaplaning (Hidroplaneo):</strong> Ocurre cuando se acumula una película de agua delante del neumático a altas velocidades, levantando el vehículo del asfalto y anulando por completo la dirección y tracción de frenado.</li>
  <li><strong>Qué Hacer:</strong> Mantén la calma, retira suavemente el pie del acelerador y sujeta firmemente el volante en línea recta. Nunca pises el freno a fondo de manera violenta.</li>
</ul>
<div class="highlight-box">
  En caso de lluvia severa o niebla densa, duplica de inmediato tu distancia de seguimiento de 3 a 6 segundos y enciende las luces antiniebla del vehículo.
</div>`
    })
  },
  {
    id: 405,
    curso_id: 104,
    titulo_modulo: 'Módulo 5: Fatiga, Estrés y Distracciones al Volante',
    orden: 5,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Efectos psicológicos y de somnolencia al conducir -->
<h3>Psicología del Conductor y Concentración</h3>
<p>Las distracciones mentales, auditivas y físicas anulan por completo la capacidad de anticipación y aumentan el tiempo de reacción ante peligros de la vía.</p>
<h4>Peligros del Sueño y la Fatiga:</h4>
<ul>
  <li>La fatiga genera un efecto cognitivo similar a conducir con un nivel de alcohol en la sangre superior al permitido por la ley.</li>
  <li>Los "microsueños" son lapsos breves de somnolencia (de 1 a 4 segundos) donde el vehículo recorre decenas de metros sin control alguno.</li>
</ul>
<div class="pedagogical-tip">
  <strong>Norma Básica de Conducción Segura:</strong> Si realizas viajes de larga distancia, descansa por lo menos 15 minutos cada 2 horas o 200 kilómetros de trayecto acumulado.
</div>`
    })
  },
  {
    id: 406,
    curso_id: 104,
    titulo_modulo: 'Módulo 6: Normativa de Seguridad Vial y Señalización',
    orden: 6,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Tipos de señalización de tránsito y normas de prioridad vial -->
<h3>Interpretación de Señales de Tránsito</h3>
<p>El conocimiento y respeto estricto de las señales viales es obligatorio para la prevención de colisiones e interacciones seguras en intersecciones.</p>
<h4>Clasificación de Señales Viales:</h4>
<ol>
  <li><strong>Reglamentarias:</strong> Indican prohibiciones o mandatos de obligado cumplimiento por ley. Su forma es circular con borde rojo. Ejemplo: Límite de velocidad.</li>
  <li><strong>Preventivas:</strong> Advierten sobre peligros próximos en la calzada. Su forma es de rombo amarillo con borde negro. Ejemplo: Curva peligrosa.</li>
  <li><strong>Informativas:</strong> Guían al conductor proporcionando información geográfica, turística o de servicios. Su color es azul o verde.</li>
</ol>
<div class="highlight-box">
  <strong>Regla de Prioridad en Rotondas:</strong> Los vehículos que circulan dentro de la rotonda tienen prioridad de paso absoluta sobre los vehículos que planean incorporarse a ella.
</div>`
    })
  },
  {
    id: 407,
    curso_id: 104,
    titulo_modulo: 'Módulo 7: Seguridad Activa y Pasiva del Vehículo',
    orden: 7,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Dispositivos electrónicos de asistencia y sistemas de retención pasiva -->
<h3>Tecnología de Protección Automotriz</h3>
<p>Los vehículos modernos están equipados con múltiples sistemas clasificados en seguridad activa (previenen el accidente) y seguridad pasiva (reducen las lesiones del choque).</p>
<h4>Sistemas de Protección:</h4>
<ul>
  <li><strong>Seguridad Activa:</strong> Sistema de Frenado ABS (evita el bloqueo de ruedas), Control Electrónico de Estabilidad (ESC) y control de tracción automático.</li>
  <li><strong>Seguridad Pasiva:</strong> Cinturones de seguridad de tres puntos, Bolsas de aire (Airbags), deformación programada de la carrocería y apoyacabezas activos.</li>
</ul>
<div class="pedagogical-tip">
  El cinturón de seguridad reduce a la mitad el riesgo de lesiones mortales en los ocupantes de los asientos delanteros en caso de choque frontal.
</div>`
    })
  },
  {
    id: 408,
    curso_id: 104,
    titulo_modulo: 'Módulo 8: Protocolo de Actuación ante Siniestros (PAS)',
    orden: 8,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Conducción en emergencias y protocolo de asistencia médica inmediata -->
<h3>Protocolo de Emergencia PAS en la Vía</h3>
<p>Si eres testigo directo de un accidente de tránsito en carretera, la ley te obliga a prestar auxilio. Para hacerlo de forma segura, aplica la secuencia del protocolo PAS.</p>
<h4>Acción del Socorrista Vial:</h4>
<ul>
  <li><strong>Proteger:</strong> Estaciona tu vehículo fuera de la calzada, enciende las luces intermitentes de advertencia y coloca los triángulos reflectivos a 50 metros del siniestro.</li>
  <li><strong>Alertar:</strong> Informa a las autoridades policiales indicando el carril afectado, número de vehículos implicados y cantidad de heridos.</li>
  <li><strong>Socorrer:</strong> Brinda ayuda primaria únicamente si la zona es segura. No intentes retirar a las víctimas del interior de vehículos inestables o propensos a incendios.</li>
</ul>`
    })
  },

  // ==========================================
  // MANEJO 4X4 (Curso ID: 105, Módulos 501-508)
  // ==========================================
  {
    id: 501,
    curso_id: 105,
    titulo_modulo: 'Módulo 1: Introducción al Terreno Off-Road y Mapa de Ruta',
    orden: 1,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Principios básicos de tracción en terrenos difíciles y mapa offroad -->
<h3>Exploración y Conducción Todo Terreno</h3>
<p>La conducción 4x4 exige una comprensión técnica detallada de la mecánica del vehículo, del tipo de suelo que pisas y de la física aplicada para avanzar en terrenos de baja adherencia.</p>
<div class="roadmap-container">
  <div class="roadmap-title">Mapa de Ruta del Conductor 4x4</div>
  <div class="roadmap-steps">
    <div class="roadmap-step"><span class="roadmap-badge">M1</span><span>Fundamentos y Mapa de Ruta</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M2</span><span>Sistemas de Tracción y Bloqueos</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M3</span><span>Ángulos Geométricos del 4x4</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M4</span><span>Conducción en Arena y Dunas</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M5</span><span>Conducción en Barro y Pendientes</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M6</span><span>Técnicas de Vadeo Seguro</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M7</span><span>Herramientas de Rescate (Winch y Eslingas)</span></div>
  </div>
</div>`
    })
  },
  {
    id: 502,
    curso_id: 105,
    titulo_modulo: 'Módulo 2: Sistemas de Tracción: 4H, 4L y Bloqueos de Diferencial',
    orden: 2,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Uso técnico de la caja de transferencia y duplicadora/bajo -->
<h3>Caja de Transferencia y Relaciones de Engranajes</h3>
<p>Los vehículos 4x4 cuentan con una caja de transferencia que distribuye la fuerza del motor a los ejes delantero y trasero.</p>
<h4>Modos de Conducción Todo Terreno:</h4>
<ul>
  <li><strong>2H (High):</strong> Tracción solo en dos ruedas, ideal para pavimentos secos y conducción en autopista.</li>
  <li><strong>4H (4x4 High):</strong> Tracción en las cuatro ruedas en relación normal. Úsala para caminos de tierra húmeda o nieve firme a velocidades moderadas.</li>
  <li><strong>4L (4x4 Low / Bajo):</strong> Utiliza engranajes reductores para multiplicar el torque del motor. Ideal para subidas muy empinadas, cruce de rocas y barro espeso.</li>
</ul>
<div class="highlight-box">
  <strong>Bloqueo de Diferencial:</strong> Obliga a las dos ruedas de un mismo eje a girar a la misma velocidad exacta, evitando que la potencia se escape por la llanta que no tiene tracción o está suspendida en el aire.
</div>`
    })
  },
  {
    id: 503,
    curso_id: 105,
    titulo_modulo: 'Módulo 3: Ángulos Geométricos del Vehículo 4x4',
    orden: 3,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Medidas geométricas de entrada, panza y salida para evitar colisiones con rocas -->
<h3>Ángulos de Obstáculos y Altura Libre</h3>
<p>Antes de afrontar zanjas o rocas de gran tamaño, debes conocer los límites geométricos de la carrocería de tu vehículo 4x4.</p>
<h4>Los Tres Ángulos de Ataque off-road:</h4>
<ol>
  <li><strong>Ángulo de Ataque:</strong> Ángulo máximo que puede subir el vehículo sin que el parachoques delantero toque el obstáculo.</li>
  <li><strong>Ángulo Ventral (de Panza):</strong> Determina la capacidad de cruzar lomas o crestas sin que los bajos del auto se apoyen en el suelo.</li>
  <li><strong>Ángulo de Salida:</strong> Ángulo máximo del terreno que puede superar el vehículo sin arrastrar el parachoques trasero.</li>
</ol>
<div class="pedagogical-tip">
  Para proteger los componentes más expuestos del chasis (cárter de motor, transmisión), instala placas de protección metálicas (skid plates) en la parte inferior del vehículo.
</div>`
    })
  },
  {
    id: 504,
    curso_id: 105,
    titulo_modulo: 'Módulo 4: Técnicas de Conducción en Arena y Dunas',
    orden: 4,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Presión correcta en libras e inercia constante en arena blanda -->
<h3>Conducción en Terrenos de Arena Blanda</h3>
<p>El principal secreto en la arena es maximizar el área de contacto del neumático con el suelo y mantener la inercia del vehículo de forma fluida.</p>
<h4>Técnicas de Conducción en Arena:</h4>
<ul>
  <li><strong>Presión de Llantas:</strong> Disminuye la presión de los neumáticos a rangos de 12 a 15 PSI (libras) para ensanchar la huella y evitar enterrarte en la arena.</li>
  <li><strong>Inercia y Virajes:</strong> Mantén una aceleración constante en marchas medias. Evita giros bruscos del volante que acumulen arena delante de las ruedas y detengan el avance.</li>
  <li><strong>Frenado:</strong> Deja que el vehículo ruede por inercia hasta detenerse. Frenar con fuerza crea pozos bajo las ruedas que te dificultarán el arranque.</li>
</ul>`
    })
  },
  {
    id: 505,
    curso_id: 105,
    titulo_modulo: 'Módulo 5: Técnicas de Conducción en Barro y Pendientes',
    orden: 5,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Autolimpieza del dibujo de la llanta y control de tracción en lodo -->
<h3>Afrontando Barro Profundo y Zanjas</h3>
<p>El lodo es resbaladizo e impredecible. La clave para mantener la dirección es usar neumáticos de labrado profundo (Mud Terrain) y mantener las llantas libres de barro acumulado.</p>
<h4>Técnicas en Lodo y Cuestas:</h4>
<ul>
  <li>Utiliza el modo 4x4 Low (Bajo) en segunda o tercera velocidad para mantener suficiente fuerza de tracción.</li>
  <li>Mueve el volante con giros cortos a izquierda y derecha de forma repetida para ayudar a que los hombros del neumático busquen suelo firme en los costados de la huella.</li>
  <li>En descensos empinados en barro, deja que el freno de motor en 4L primera velocidad guíe el vehículo de forma segura sin pisar el freno de pedal.</li>
</ul>`
    })
  },
  {
    id: 506,
    curso_id: 105,
    titulo_modulo: 'Módulo 6: Técnicas de Vadeo Seguro',
    orden: 6,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Evaluación de la profundidad y creación de la ola de vadeo del motor -->
<h3>Cruces de Ríos y Aguas Profundas</h3>
<p>El ingreso de agua al motor a través de la admisión provoca daños catastróficos inmediatos por compresión hidráulica (choque hidráulico).</p>
<h4>Protocolo de Vadeo Seguro:</h4>
<ol>
  <li>Detén el auto e investiga a pie la profundidad, velocidad de la corriente y firmeza del fondo del río antes de cruzar.</li>
  <li>Conecta el sistema 4x4 Low (Bajo) en primera o segunda marcha.</li>
  <li>Ingresa al agua suavemente a velocidad constante para crear una "ola de proa" (ola de vadeo) delante del capó que proteja la entrada de aire del motor.</li>
  <li>No te detengas ni cambies de marcha en la mitad de la corriente bajo ninguna circunstancia.</li>
</ol>
<div class="pedagogical-tip">
  <strong>Snorkel Off-road:</strong> Instalar un snorkel eleva la toma de aire del motor al nivel del techo, aumentando la profundidad máxima de vadeo de forma segura.
</div>`
    })
  },
  {
    id: 507,
    curso_id: 105,
    titulo_modulo: 'Módulo 7: Herramientas de Rescate: Winch, Eslingas y Grilletes',
    orden: 7,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Uso seguro del winch, puntos de anclaje seguros y uso de amortiguador de cables -->
<h3>Rescate de Vehículos Todo Terreno</h3>
<p>Incluso el mejor conductor 4x4 puede quedar atrapado. Aprender el uso seguro de las herramientas de auto-rescate es indispensable.</p>
<h4>Equipo de Rescate Esencial:</h4>
<ul>
  <li><strong>El Winch (Cabrestante):</strong> Dispositivo eléctrico de arrastre de cable. Utiliza siempre un amortiguador de cable (manta de seguridad) sobre la línea de arrastre para atenuar latigazos en caso de rotura.</li>
  <li><strong>Eslingas de Remolque:</strong> Cintas textiles de alta resistencia con elasticidad que evitan tirones violentos que dañen el chasis del vehículo.</li>
  <li><strong>Grilletes:</strong> Eslabones metálicos de acoplamiento seguro. Nunca utilices ganchos de ferretería común o cables oxidados.</li>
</ul>
<div class="highlight-box">
  <strong>Anclaje Ecológico:</strong> Si te anclas a un árbol vivo para el rescate con el winch, protege la corteza del tronco utilizando siempre una eslinga protectora plana.
</div>`
    })
  },
  {
    id: 508,
    curso_id: 105,
    titulo_modulo: 'Módulo 8: Planificación y Conducción Off-Road Sostenible',
    orden: 8,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Respeto ambiental y reglas de comportamiento en áreas naturales -->
<h3>Conducción Responsable y del Medio Ambiente</h3>
<p>El verdadero amante del todo terreno no destruye la naturaleza, la respeta y la conserva para las futuras generaciones.</p>
<h4>Reglas Básicas de Conducción Off-road Sostenible:</h4>
<ul>
  <li>Mantente siempre en los senderos existentes y caminos autorizados. No crees nuevas huellas de paso sobre vegetación nativa.</li>
  <li>No arrojes residuos sólidos ni líquidos en las áreas naturales.</li>
  <li>Asegúrate de que tu vehículo no presente fugas de aceites ni refrigerantes que contaminen el suelo y las fuentes de agua.</li>
  <li>Respeta la fauna nativa reduciendo el ruido del escape de gases y conduciendo a baja velocidad.</li>
</ul>`
    })
  },

  // ==========================================
  // ATENCIÓN AL CLIENTE (Curso ID: 106, Módulos 601-608)
  // ==========================================
  {
    id: 601,
    curso_id: 106,
    titulo_modulo: 'Módulo 1: Fundamentos del Servicio Excepcional y Mapa de Ruta',
    orden: 1,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Definición de servicio al cliente e impacto comercial en la empresa -->
<h3>El Cliente en el Centro de la Estrategia</h3>
<p>La atención al cliente no es un departamento aislado; es una filosofía de trabajo que busca superar las expectativas para crear relaciones comerciales a largo plazo.</p>
<div class="roadmap-container">
  <div class="roadmap-title">Mapa de Ruta del Asesor Profesional</div>
  <div class="roadmap-steps">
    <div class="roadmap-step"><span class="roadmap-badge">M1</span><span>Fundamentos y Mapa de Ruta</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M2</span><span>Comunicación Asertiva y Escucha</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M3</span><span>Inteligencia Emocional y Empatía</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M4</span><span>Gestión de PQRS y Protocolos</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M5</span><span>Resolución de Conflictos y Clientes de Alta Tensión</span></div>
    <div class="roadmap-step"><span class="roadmap-badge">M6</span><span>Fidelización y Autocuidado del Asesor</span></div>
  </div>
</div>`
    })
  },
  {
    id: 602,
    curso_id: 106,
    titulo_modulo: 'Módulo 2: Comunicación Asertiva y Escucha Activa',
    orden: 2,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Habilidades verbales y de parafraseo para validación de información -->
<h3>Habilidades de Comunicación Efectiva</h3>
<p>La comunicación asertiva radica en expresar tu opinión de forma directa, honesta y respetuosa, sin herir la sensibilidad del cliente.</p>
<h4>Técnicas de Escucha Activa:</h4>
<ul>
  <li><strong>Parafrasear:</strong> Repite el problema del cliente con tus propias palabras (Ej: "Permítame confirmar si entendí bien: lo que usted requiere es...") para validar la información.</li>
  <li><strong>Retroalimentación No Verbal:</strong> Mantén contacto visual sincero, asiente levemente con la cabeza e inclina tu postura corporal hacia adelante.</li>
  <li><strong>Evitar Interrupciones:</strong> Permite que el cliente termine de explicar su problema antes de ofrecer alternativas de solución.</li>
</ul>`
    })
  },
  {
    id: 603,
    curso_id: 106,
    titulo_modulo: 'Módulo 3: Inteligencia Emocional y Empatía en el Servicio',
    orden: 3,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Control del autosecuestro amigdalino ante ataques de clientes molestos -->
<h3>Gestión Emocional ante Clientes Iracundos</h3>
<p>La inteligencia emocional es la capacidad de reconocer y regular tus propias emociones, así como comprender el estado emocional de la otra persona.</p>
<h4>Técnicas de Desescalamiento Emocional:</h4>
<ol>
  <li><strong>No te lo tomes como algo personal:</strong> El cliente está molesto con la situación o con la empresa, no contigo. Mantén tu tono de voz calmado.</li>
  <li><strong>Validación Emocional:</strong> Demuestra que entiendes su descontento usando frases empáticas (Ej: "Entiendo completamente su malestar y lamento las molestias causadas").</li>
  <li><strong>Respuestas Reflexivas:</strong> Realiza pausas de respiración profunda antes de responder para evitar reacciones impulsivas (autosecuestro amigdalino).</li>
</ol>`
    })
  },
  {
    id: 604,
    curso_id: 106,
    titulo_modulo: 'Módulo 4: Gestión Profesional de PQRS',
    orden: 4,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Tiempos de respuesta legales y clasificación interna de PQRS -->
<h3>Peticiones, Quejas, Reclamos y Sugerencias</h3>
<p>Una queja bien gestionada es una oportunidad de oro para recuperar y fidelizar a un cliente insatisfecho.</p>
<h4>Definiciones y Clasificación de PQRS:</h4>
<ul>
  <li><strong>Petición:</strong> Solicitud formal de información sobre los productos o servicios ofrecidos.</li>
  <li><strong>Queja:</strong> Manifestación de descontento debida al comportamiento de un colaborador de la empresa.</li>
  <li><strong>Reclamo:</strong> Solicitud de revisión económica o técnica por un fallo en la entrega del producto o servicio.</li>
  <li><strong>Sugerencia:</strong> Idea propuesta por el usuario orientada a mejorar la calidad del servicio.</li>
</ul>
<div class="pedagogical-tip">
  Registra siempre la PQRS con un número de radicado único y notifica al cliente del plazo de respuesta legal para mantener la transparencia del proceso.
</div>`
    })
  },
  {
    id: 605,
    curso_id: 106,
    titulo_modulo: 'Módulo 5: Resolution de Conflictos de Alta Tensión',
    orden: 5,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Método de la sandwichera y límites de respeto tolerados -->
<h3>Técnicas de Negociación ante Situaciones Límite</h3>
<p>En ocasiones te enfrentarás a clientes con alto grado de hostilidad que exigen soluciones inmediatas difíciles de otorgar.</p>
<h4>El Método de la Sandwichera para Entregar Malas Noticias:</h4>
<ol>
  <li><strong>Capa Superior (Mensaje Empático):</strong> Ej: "Agradecemos mucho su paciencia en la espera de este caso".</li>
  <li><strong>Capa Central (La mala noticia directa y clara):</strong> Ej: "Lamentablemente la política de garantía de este producto expiró hace dos meses".</li>
  <li><strong>Capa Inferior (Solución alternativa de valor):</strong> Ej: "Lo que puedo ofrecerle es un 20% de descuento en el costo del servicio técnico de reparación oficial".</li>
</ol>
<div class="highlight-box">
  <strong>Límites del Respeto:</strong> Tienes la obligación de escuchar el descontento, pero nunca debes tolerar gritos, insultos o faltas de respeto verbal. Si esto sucede, advierte amablemente al cliente sobre la suspensión de la llamada.
</div>`
    })
  },
  {
    id: 606,
    curso_id: 106,
    titulo_modulo: 'Módulo 6: Técnicas de Fidelización y Superación de Expectativas',
    orden: 6,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Estrategias de sobrecumplimiento y retención de valor comercial -->
<h3>Fidelizando al Cliente mediante el Sobrecumplimiento</h3>
<p>Fidelizar a un cliente existente es entre 5 y 25 veces más económico que conseguir un cliente nuevo.</p>
<h4>Estrategias de Retención de Clientes:</h4>
<ul>
  <li><strong>La Regla del Sobrecumplimiento:</strong> Promete menos de lo que puedes ofrecer y entrega más de lo prometido. Si la entrega tarda 3 días, indícale al cliente que tomará 5 y entrégala en 2.</li>
  <li><strong>Detalles de Agradecimiento:</strong> Envía cupones de descuento exclusivos o mensajes de felicitación personalizados en fechas especiales.</li>
  <li><strong>Seguimiento Post-Servicio:</strong> Llama o escribe al cliente a los pocos días de su compra para validar que su experiencia con el producto sea perfecta.</li>
</ul>`
    })
  },
  {
    id: 607,
    curso_id: 106,
    titulo_modulo: 'Módulo 7: Canales de Atención: Presencial, Telefónica y Digital',
    orden: 7,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Adaptación de tono de voz y ortografía en múltiples canales -->
<h3>Atención Omnicanal y Consistencia del Servicio</h3>
<p>El cliente moderno espera recibir la misma calidad de respuesta sin importar si se comunica vía chat, teléfono o de forma presencial.</p>
<h4>Particularidades por Canal:</h4>
<ul>
  <li><strong>Presencial:</strong> Imagen personal impecable, postura corporal de bienvenida y sonrisa sincera no impostada.</li>
  <li><strong>Telefónico:</strong> Modulación clara del tono de voz, ritmo pausado y uso inteligente de silencios para denotar atención.</li>
  <li><strong>Digital (Chat/Email):</strong> Excelente ortografía, respuestas rápidas pero estructuradas y uso adecuado de plantillas personalizadas.</li>
</ul>`
    })
  },
  {
    id: 608,
    curso_id: 106,
    titulo_modulo: 'Módulo 8: Autocuidado del Asesor y Manejo del Estrés (Burnout)',
    orden: 8,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<!-- lección pedagógica: Técnicas de ventilación y prevención de fatiga por compasión -->
<h3>Cuidado de la Salud Mental del Asesor</h3>
<p>La atención al cliente de alta tensión genera un alto desgaste emocional que puede derivar en el Síndrome de Desgaste Profesional (Burnout).</p>
<h4>Técnicas de Autocuidado Diario:</h4>
<ul>
  <li><strong>Ventilación Emocional:</strong> Conversa con tus compañeros o jefes sobre las interacciones difíciles del día para liberar carga emocional acumulada.</li>
  <li><strong>Pausas Activas:</strong> Levántate del asiento por 5 minutos cada hora para estirar articulaciones e interrumpir la fatiga visual.</li>
  <li><strong>Desconexión Laboral:</strong> Al terminar tu jornada de trabajo, realiza actividades recreativas y desconéctate completamente de los correos y chats de servicio.</li>
</ul>`
    })
  },
  // ==========================================
  // BACHILLER ACADÉMICO (Curso ID: 107, Módulos 701-704)
  // ==========================================
  {
    id: 701,
    curso_id: 107,
    titulo_modulo: 'Módulo 1: Inducción Institucional y Proyecto de Vida',
    orden: 1,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<h3>Bienvenidos al Instituto Superior del Norte</h3>
<p>El programa de Bachillerato Académico tiene como propósito fundamental formarte en competencias básicas y ciudadanas que te permitan proyectar tu futuro personal y profesional.</p>
<h4>Mapa de Ruta Formativa:</h4>
<ul>
  <li><strong>Módulo 1:</strong> Inducción Institucional y Proyecto de Vida</li>
  <li><strong>Módulo 2:</strong> Competencias Ciudadanas y Ética</li>
  <li><strong>Módulo 3:</strong> Metodología de Autoaprendizaje y Nuevas Tecnologías</li>
  <li><strong>Módulo 4:</strong> Requisitos y Protocolo de Grado</li>
</ul>`
    })
  },
  {
    id: 702,
    curso_id: 107,
    titulo_modulo: 'Módulo 2: Competencias Ciudadanas y Ética',
    orden: 2,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<h3>Formación Ciudadana y Ética</h3>
<p>El ejercicio responsable de la ciudadanía y la vivencia de principios éticos son la base para construir una sociedad justa y en paz en nuestro país.</p>
<h4>Valores Institucionales:</h4>
<ul>
  <li><strong>Respeto:</strong> Valoración de la diversidad y dignidad humana.</li>
  <li><strong>Responsabilidad:</strong> Compromiso ético con las propias acciones y deberes académicos.</li>
  <li><strong>Excelencia:</strong> Búsqueda constante del mejoramiento personal y social.</li>
</ul>`
    })
  },
  {
    id: 703,
    curso_id: 107,
    titulo_modulo: 'Módulo 3: Metodología de Autoaprendizaje y Nuevas Tecnologías',
    orden: 3,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<h3>El Aprendizaje Autónomo y las TIC</h3>
<p>El autoaprendizaje te empodera como gestor de tu propia formación, apoyado en el uso constructivo de las Tecnologías de la Información y la Comunicación (TIC).</p>
<h4>Recomendaciones para el Aprendizaje Autónomo:</h4>
<ul>
  <li>Establece un horario diario de estudio independiente.</li>
  <li>Utiliza herramientas tecnológicas para investigar y enriquecer tus conocimientos.</li>
  <li>Desarrolla el pensamiento crítico cuestionando la validez de las fuentes de información.</li>
</ul>`
    })
  },
  {
    id: 704,
    curso_id: 107,
    titulo_modulo: 'Módulo 4: Requisitos y Protocolo de Grado',
    orden: 4,
    tipo_contenido: 'texto',
    data_contenido: JSON.stringify({
      url: '',
      text: `<h3>Camino a la Graduación</h3>
<p>Para culminar con éxito el programa y obtener tu título oficial de Bachiller Académico, debes cumplir con todos los requisitos académicos establecidos.</p>
<h4>Documentos de Graduación:</h4>
<p>Una vez aprobado el curso y validada tu carpeta académica, el sistema habilitará automáticamente la descarga de tu <strong>Diploma de Bachiller</strong> y de tu <strong>Acta de Grado</strong>.</p>`
    })
  }
];

const additionalQuestions = [
  // ==========================================
  // MECÁNICA BÁSICA (Curso ID: 102, Preguntas 201-208)
  // ==========================================
  {
    id: 201,
    curso_id: 102,
    pregunta: "¿Cuáles son los cuatro tiempos de funcionamiento de un motor de combustión interna de automoción?",
    opciones: {
      "A": "Inyección, Compresión, Chispa, Escape",
      "B": "Admisión, Compresión, Combustión, Escape",
      "C": "Arranque, Aceleración, Marcha, Detención",
      "D": "Encendido, Lubricación, Refrigeración, Tracción"
    },
    respuesta_correcta: "B"
  },
  {
    id: 202,
    curso_id: 102,
    pregunta: "¿Qué componente del motor transforma el movimiento lineal del pistón en un movimiento giratorio continuo?",
    opciones: {
      "A": "La Culata",
      "B": "El Cigüeñal",
      "C": "El Árbol de Levas",
      "D": "La Correa de Distribución"
    },
    respuesta_correcta: "B"
  },
  {
    id: 203,
    curso_id: 102,
    pregunta: "¿Cuál es la función del termostato en el sistema de refrigeración del vehículo?",
    opciones: {
      "A": "Indicar la cantidad de líquido refrigerante en el tanque de expansión",
      "B": "Controlar el encendido eléctrico del ventilador del radiador",
      "C": "Regular el flujo de refrigerante hacia el radiador según la temperatura del motor",
      "D": "Lubricar las partes metáivas de la bomba de agua principal"
    },
    respuesta_correcta: "C"
  },
  {
    id: 204,
    curso_id: 102,
    pregunta: "¿Qué color de luz en el tablero de instrumentos indica una alerta crítica que requiere detener el vehículo inmediatamente?",
    opciones: {
      "A": "Verde",
      "B": "Azul",
      "C": "Amarillo / Naranja",
      "D": "Rojo"
    },
    respuesta_correcta: "D"
  },
  {
    id: 205,
    curso_id: 102,
    pregunta: "¿Qué síntoma hidráulico suele indicar la presencia de burbujas de aire en las líneas de freno?",
    opciones: {
      "A": "Sensación esponjosa o pedal que se hunde demasiado al presionarlo",
      "B": "Vibración fuerte en el volante al frenar a alta velocidad",
      "C": "Un chillido agudo al presionar levemente el pedal de frenos",
      "D": "Bloqueo instantáneo de las ruedas traseras al tocar el pedal"
    },
    respuesta_correcta: "A"
  },
  {
    id: 206,
    curso_id: 102,
    pregunta: "¿Qué sucede con el rendimiento del vehículo si el filtro de aire se encuentra completamente obstruido?",
    opciones: {
      "A": "Aumenta la velocidad máxima del motor por exceso de aire",
      "B": "El motor pierde potencia y aumenta significativamente el consumo de combustible",
      "C": "Se vacía el refrigerante debido a la presión interna",
      "D": "Se bloquea el paso de corriente eléctrica a las bujías"
    },
    respuesta_correcta: "B"
  },
  {
    id: 207,
    curso_id: 102,
    pregunta: "¿Cuál es una función del aceite de motor aparte de reducir la fricción entre metales?",
    opciones: {
      "A": "Refrigerar y limpiar las impurezas internas del motor",
      "B": "Aumentar la compresión del motor mediante sellado gaseoso",
      "C": "Eliminar por completo el humo del tubo de escape",
      "D": "Alimentar la chispa de la bobina de encendido"
    },
    respuesta_correcta: "A"
  },
  {
    id: 208,
    curso_id: 102,
    pregunta: "¿Qué indica la emisión constante de humo azul por el escape del motor?",
    opciones: {
      "A": "Que se está quemando refrigerante en los cilindros",
      "B": "Exceso de combustible sin quemar por mala inyección",
      "C": "Que el aceite de motor está ingresando a la cámara de combustión",
      "D": "Que el filtro de aire está completamente limpio"
    },
    respuesta_correcta: "C"
  },

  // ==========================================
  // PRIMEROS AUXILIOS (Curso ID: 103, Preguntas 301-308)
  // ==========================================
  {
    id: 301,
    curso_id: 103,
    pregunta: "¿Qué significan las siglas PAS dentro de los protocolos de atención de emergencias?",
    opciones: {
      "A": "Parar, Analizar, Sanar",
      "B": "Proteger, Alertar, Socorrer",
      "C": "Pedir ayuda, Auxiliar, Salvar",
      "D": "Pacificar, Atender, Solucionar"
    },
    respuesta_correcta: "B"
  },
  {
    id: 302,
    curso_id: 103,
    pregunta: "¿Qué técnica de reanimación se debe aplicar si una víctima está inconsciente y no respira normalmente?",
    opciones: {
      "A": "Ventilaciones de rescate boca a boca exclusivamente",
      "B": "Colocarla en Posición Lateral de Seguridad",
      "C": "Iniciar RCP con 30 compresiones y 2 ventilaciones",
      "D": "Esperar 10 minutos a que recupere el conocimiento por sí sola"
    },
    respuesta_correcta: "C"
  },
  {
    id: 303,
    curso_id: 103,
    pregunta: "¿Cuál es el primer método recomendado para controlar una hemorragia externa que no compromete una extremidad?",
    opciones: {
      "A": "Aplicar un torniquete arterial lo más apretado posible",
      "B": "Efectuar presión directa y firme sobre la herida con gasa o apósito limpio",
      "C": "Lavar la herida con alcohol etílico de 96 grados de forma abundante",
      "D": "Elevar la herida y esperar a que coagule sola sin tocarla"
    },
    respuesta_correcta: "B"
  },
  {
    id: 304,
    curso_id: 103,
    pregunta: "¿Qué maniobra de emergencia se debe realizar ante un atragantamiento por obstrucción total de la vía aérea en un adulto consciente?",
    opciones: {
      "A": "La Maniobra de Heimlich con compresiones abdominales rápidas hacia adentro y arriba",
      "B": "Dar 10 golpes fuertes y secos directamente en el pecho de la víctima",
      "C": "Hacer inhalaciones profundas de rescate boca a boca de inmediato",
      "D": "Introducir los dedos a ciegas en la garganta para buscar el objeto"
    },
    respuesta_correcta: "A"
  },
  {
    id: 305,
    curso_id: 103,
    pregunta: "¿Cómo se debe tratar inicialmente una quemadura térmica leve de primer o segundo grado?",
    opciones: {
      "A": "Aplicar mantequilla, pasta de dientes o cremas sobre la lesión",
      "B": "Colocar hielo directo sobre la herida para aliviar el dolor rápidamente",
      "C": "Enfriar la zona con abundante agua limpia a temperatura ambiente por 15-20 minutos",
      "D": "Romper las ampollas de inmediato para liberar el calor retenido"
    },
    respuesta_correcta: "C"
  },
  {
    id: 306,
    curso_id: 103,
    pregunta: "¿Durante cuánto tiempo máximo se debe verificar la respiración de una víctima inconsciente aplicando el MES antes de iniciar RCP?",
    opciones: {
      "A": "1 segundo",
      "B": "5 segundos",
      "C": "10 segundos",
      "D": "1 minuto"
    },
    respuesta_correcta: "C"
  },
  {
    id: 307,
    curso_id: 103,
    pregunta: "¿Cuál es el color utilizado en el triaje de emergencias para clasificar a los pacientes estables con lesiones diferibles que pueden esperar atención?",
    opciones: {
      "A": "Verde",
      "B": "Amarillo",
      "C": "Rojo",
      "D": "Negro"
    },
    respuesta_correcta: "B"
  },
  {
    id: 308,
    curso_id: 103,
    pregunta: "¿Qué precaución se debe tener al colocar un torniquete de emergencia en una extremidad?",
    opciones: {
      "A": "Retirarlo y aflojarlo cada 5 minutos para ver si paró el sangrado",
      "B": "Colocarlo exactamente sobre una articulación como el codo o la rodilla",
      "C": "Registrar la hora exacta de colocación y no cubrirlo con vendajes",
      "D": "Usar alambre delgado o cordones finos para que apriete más"
    },
    respuesta_correcta: "C"
  },

  // ==========================================
  // MANEJO DEFENSIVO (Curso ID: 104, Preguntas 401-408)
  // ==========================================
  {
    id: 401,
    curso_id: 104,
    pregunta: "¿Cuál es el principal objetivo del manejo defensivo al conducir un vehículo?",
    opciones: {
      "A": "Llegar al destino en el menor tiempo posible excediendo límites de velocidad",
      "B": "Prevenir accidentes a pesar de las acciones de los demás y condiciones adversas",
      "C": "Demostrar habilidades de control en curvas peligrosas de la calzada",
      "D": "Aprender a reparar desperfectos mecánicos del chasis en ruta"
    },
    respuesta_correcta: "B"
  },
  {
    id: 402,
    curso_id: 104,
    pregunta: "¿Qué es el efecto 'Aquaplaning' y cómo debe actuar el conductor si le ocurre?",
    opciones: {
      "A": "La pérdida de frenos por mojarse; se debe frenar a fondo repetidamente",
      "B": "El hidroplaneo del neumático sobre agua; se debe mantener la calma, soltar acelerador y mantener dirección firme",
      "C": "El empañamiento del parabrisas; se debe encender el limpiaparabrisas a máxima velocidad",
      "D": "El sobrecalentamiento del radiador; se debe arrojar agua fría sobre el motor"
    },
    respuesta_correcta: "B"
  },
  {
    id: 403,
    curso_id: 104,
    pregunta: "¿Cuál es la regla de seguimiento segura aconsejada en condiciones normales de visibilidad y calzada?",
    opciones: {
      "A": "La regla de 1 segundo de distancia",
      "B": "La regla de los 3 segundos de distancia",
      "C": "Mantener una distancia fija de 5 metros a cualquier velocidad",
      "D": "La regla de 10 segundos de distancia"
    },
    respuesta_correcta: "B"
  },
  {
    id: 404,
    curso_id: 104,
    pregunta: "¿Qué porcentaje de los siniestros de tránsito se atribuye aproximadamente a fallas humanas y malas decisiones?",
    opciones: {
      "A": "Cerca del 10%",
      "B": "Alrededor del 30%",
      "C": "Aproximadamente el 50%",
      "D": "Cerca del 90%"
    },
    respuesta_correcta: "D"
  },
  {
    id: 405,
    curso_id: 104,
    pregunta: "¿Cuál es la forma y color característicos de las señales de tránsito preventivas de peligro?",
    opciones: {
      "A": "Círculo rojo con fondo blanco",
      "B": "Rombo amarillo con bordes y letras negras",
      "C": "Rectángulo azul o verde con dibujos blancos",
      "D": "Triángulo equilátero invertido con borde rojo"
    },
    respuesta_correcta: "B"
  },
  {
    id: 30, // Wait, let's keep the ID consistent
    id: 406,
    curso_id: 104,
    pregunta: "¿Qué dispositivos automotrices forman parte del sistema de seguridad pasiva?",
    opciones: {
      "A": "Frenos ABS, control de estabilidad y suspensión asistida",
      "B": "Espejos retrovisores, luces exploradoras y limpiaparabrisas",
      "C": "Cinturones de seguridad, airbags y zonas de deformación programada",
      "D": "Neumáticos todo terreno, dirección hidráulica y caja de cambios"
    },
    respuesta_correcta: "C"
  },
  {
    id: 407,
    curso_id: 104,
    pregunta: "¿Con qué frecuencia se recomienda descansar en viajes largos de carretera para evitar la somnolencia?",
    opciones: {
      "A": "Cada 30 minutos",
      "B": "Al menos 15 minutos cada 2 horas o 200 km recorridos",
      "C": "Únicamente cuando se encienda la luz de combustible",
      "D": "Cada 500 km sin realizar paradas previas"
    },
    respuesta_correcta: "B"
  },
  {
    id: 408,
    curso_id: 104,
    pregunta: "¿Quién tiene la prioridad de paso legal en una intersección de rotonda o glorieta?",
    opciones: {
      "A": "El vehículo que pretende incorporarse o ingresar a ella",
      "B": "El vehículo de mayor tamaño o peso de carga",
      "C": "El vehículo que ya circula dentro de la rotonda",
      "D": "El vehículo que transita a mayor velocidad de marcha"
    },
    respuesta_correcta: "C"
  },

  // ==========================================
  // MANEJO 4X4 (Curso ID: 105, Preguntas 501-508)
  // ==========================================
  {
    id: 501,
    curso_id: 105,
    pregunta: "¿En qué terrenos es adecuado conectar la duplicadora o modo 4x4 Low (Bajo)?",
    opciones: {
      "A": "Pavimento seco y autopistas de alta velocidad",
      "B": "Terrenos llanos de asfalto mojado o lluvia leve",
      "C": "Subidas muy empinadas, cruce de rocas grandes y barro espeso",
      "D": "Únicamente al realizar giros cerrados al estacionar"
    },
    respuesta_correcta: "C"
  },
  {
    id: 502,
    curso_id: 105,
    pregunta: "¿Qué ajuste mecánico se realiza prioritariamente en los neumáticos antes de ingresar a dunas de arena blanda?",
    opciones: {
      "A": "Aumentar la presión de inflado por encima de las 40 PSI",
      "B": "Disminuir la presión a rangos de 12 a 15 PSI para ensanchar la huella",
      "C": "Retirar por completo el aire y rodar sobre los rines de seguridad",
      "D": "Cambiar el tamaño de los rines antes de comenzar"
    },
    respuesta_correcta: "B"
  },
  {
    id: 503,
    curso_id: 105,
    pregunta: "¿Cuál es el ángulo geométrico que evita que el vehículo 4x4 toque el suelo con su parte central al superar una cresta?",
    opciones: {
      "A": "Ángulo de Ataque",
      "B": "Ángulo Ventral (de Panza)",
      "C": "Ángulo de Salida",
      "D": "Ángulo de Inclinación lateral"
    },
    respuesta_correcta: "B"
  },
  {
    id: 504,
    curso_id: 105,
    pregunta: "¿Cuál es la técnica recomendada para cruzar un río de forma segura (Vadeo)?",
    opciones: {
      "A": "Cruzar lo más rápido posible en velocidad 4H de autopista",
      "B": "Ingresar de forma suave y constante en 4L para generar una ola protectora en la proa",
      "C": "Entrar marcha atrás para proteger los radiadores delanteros del agua",
      "D": "Apagar el motor e ingresar por inercia empujando el vehículo"
    },
    respuesta_correcta: "B"
  },
  {
    id: 505,
    curso_id: 105,
    pregunta: "¿Para qué sirve el bloqueo de diferencial en terrenos extremos de baja adherencia?",
    opciones: {
      "A": "Para bloquear el giro del volante y mantener la dirección recta",
      "B": "Para forzar a que las ruedas de un mismo eje giren a la misma velocidad sin importar la fricción",
      "C": "Para desconectar automáticamente los frenos ABS traseros",
      "D": "Para aumentar la potencia eléctrica enviada al winch de rescate"
    },
    respuesta_correcta: "B"
  },
  {
    id: 506,
    curso_id: 105,
    pregunta: "¿Qué medida de seguridad es indispensable al utilizar un winch o cabrestante de cable de acero?",
    opciones: {
      "A": "Efectuar el rescate lo más rápido posible sin usar guantes",
      "B": "Colocar una manta o amortiguador de cable sobre la línea de tensión",
      "C": "Sujetar el cable directamente del gancho sin usar grilletes",
      "D": "Pararse justo al lado del cable bajo tensión para vigilar el enrollado"
    },
    respuesta_correcta: "B"
  },
  {
    id: 507,
    curso_id: 105,
    pregunta: "¿Cómo se debe actuar ecológicamente al anclarse a un árbol vivo durante un rescate off-road?",
    opciones: {
      "A": "Envolver el cable de acero directamente sobre el tronco del árbol",
      "B": "Utilizar siempre una eslinga protectora plana para no dañar la corteza",
      "C": "Hacer un corte profundo en el tronco para fijar mejor el cable",
      "D": "Clavar ganchos de acero sobre la madera del árbol"
    },
    respuesta_correcta: "B"
  },
  {
    id: 508,
    curso_id: 105,
    pregunta: "¿Cuál es la velocidad adecuada para realizar descensos en pendientes muy empinadas de barro?",
    opciones: {
      "A": "En punto neutro controlando la velocidad puramente con el freno de pedal",
      "B": "En el cambio 4x4 Low (Bajo) primera marcha dejando actuar el freno de motor",
      "C": "En el modo 4x4 High en cuarta marcha para bajar rápido",
      "D": "Apagando el vehículo por completo para evitar que se deslice"
    },
    respuesta_correcta: "B"
  },

  // ==========================================
  // ATENCIÓN AL CLIENTE (Curso ID: 106, Preguntas 601-608)
  // ==========================================
  {
    id: 601,
    curso_id: 106,
    pregunta: "¿Qué significa el concepto de comunicación asertiva en la atención al cliente?",
    opciones: {
      "A": "Darle la razón al cliente en todo, incluso si la empresa pierde dinero de forma injusta",
      "B": "Expresar opiniones y límites con claridad y respeto, sin agresividad ni sumisión",
      "C": "Responder con evasivas para no comprometerse a dar soluciones",
      "D": "Comunicarse exclusivamente mediante correos electrónicos formales"
    },
    respuesta_correcta: "B"
  },
  {
    id: 602,
    curso_id: 106,
    pregunta: "¿En qué consiste la técnica de parafrasear durante la escucha activa?",
    opciones: {
      "A": "Repetir exactamente palabra por palabra lo que el cliente dice con tono de burla",
      "B": "Explicar el problema expuesto por el cliente usando tus propias palabras para confirmar que lo entendiste",
      "C": "Interrumpir al cliente para contarle una anécdota personal parecida",
      "D": "Escribir la queja del cliente en el software de la empresa"
    },
    respuesta_correcta: "B"
  },
  {
    id: 603,
    curso_id: 106,
    pregunta: "¿Cuál es la recomendación principal de la inteligencia emocional ante los gritos de un cliente iracundo?",
    opciones: {
      "A": "Gritar con mayor volumen de voz para hacerse respetar como asesor",
      "B": "Mantener la calma, no tomarlo como algo personal y usar un tono pausado y empático",
      "C": "Colgar la llamada telefónica inmediatamente sin mediar palabra de advertencia",
      "D": "Darle respuestas irónicas para desarmar su hostilidad verbal"
    },
    respuesta_correcta: "B"
  },
  {
    id: 604,
    curso_id: 106,
    pregunta: "¿Qué define a un Reclamo dentro de las categorías de las PQRS?",
    opciones: {
      "A": "Una sugerencia del cliente para añadir nuevas características al producto",
      "B": "Una queja por mala conducta o actitud grosera del asesor de ventas",
      "C": "Una solicitud formal de revisión por fallos, incumplimientos o defectos del producto",
      "D": "Una solicitud informativa de horarios de atención del local comercial"
    },
    respuesta_correcta: "C"
  },
  {
    id: 605,
    curso_id: 106,
    pregunta: "¿En qué consiste la técnica de la 'Sandwichera' para entregar malas noticias a un usuario?",
    opciones: {
      "A": "Ofrecer comida gratis al cliente para calmar su molestia por el retraso",
      "B": "Envolver la mala noticia entre dos capas de mensajes positivos o de soluciones alternativas",
      "C": "Retrasar la mala noticia lo más posible hasta que el cliente se canse de preguntar",
      "D": "Delegar la entrega del mensaje a un compañero de trabajo de menor rango"
    },
    respuesta_correcta: "B"
  },
  {
    id: 606,
    curso_id: 106,
    pregunta: "¿Qué beneficio principal ofrece la fidelización de clientes en comparación con captar nuevos?",
    opciones: {
      "A": "Que los clientes antiguos no se quejan nunca de los fallos de entrega",
      "B": "Es sustancialmente más económico y genera mayores ingresos estables a largo plazo",
      "C": "Que los clientes fidelizados no requieren contratos ni facturas",
      "D": "No ofrece ningún beneficio financiero medible para la organización"
    },
    respuesta_correcta: "B"
  },
  {
    id: 607,
    curso_id: 106,
    pregunta: "¿Qué es el síndrome de 'Burnout' o desgaste profesional en atención al cliente?",
    opciones: {
      "A": "Una fatiga física severa producida por cargar mercancías pesadas en bodega",
      "B": "Un agotamiento emocional, despersonalización y baja realización personal por sobrecarga de estrés",
      "C": "El mal funcionamiento de las diademas telefónicas por uso continuo",
      "D": "La pérdida de datos de clientes en el servidor central"
    },
    respuesta_correcta: "B"
  },
  {
    id: 608,
    curso_id: 106,
    pregunta: "¿Cuál es una técnica de autocuidado aconsejada para prevenir el estrés laboral en el asesor de servicio?",
    opciones: {
      "A": "Trabajar horas extra todos los días sin descansar fines de semana",
      "B": "Realizar ventilación emocional con el equipo y tomar pausas activas breves cada hora",
      "C": "Consumir grandes dosis de cafeína para mantenerse activo sin pausar",
      "D": "Ignorar los problemas de los clientes y no registrar las PQRS"
    },
    respuesta_correcta: "B"
  },
  // ==========================================
  // BACHILLER ACADÉMICO (Curso ID: 107, Preguntas 701-705)
  // ==========================================
  {
    id: 701,
    curso_id: 107,
    pregunta: "¿Cuál es un valor fundamental del Instituto Superior del Norte?",
    opciones: {
      "A": "Competitividad desmedida",
      "B": "Excelencia y compromiso social",
      "C": "Lucro individual",
      "D": "Indiferencia ante la sociedad"
    },
    respuesta_correcta: "B"
  },
  {
    id: 702,
    curso_id: 107,
    pregunta: "¿Qué busca el Proyecto Educativo Institucional (PEI)?",
    opciones: {
      "A": "Formar únicamente en habilidades técnicas",
      "B": "Formar integralmente a los estudiantes bajo principios y valores",
      "C": "Limitar el acceso de los alumnos a las tecnologías",
      "D": "Organizar eventos netamente deportivos"
    },
    respuesta_correcta: "B"
  },
  {
    id: 703,
    curso_id: 107,
    pregunta: "¿En qué consiste el principio de autoaprendizaje?",
    opciones: {
      "A": "Esperar a que el tutor haga todo el trabajo",
      "B": "Asumir la responsabilidad del propio proceso de formación y estudio autónomo",
      "C": "Aprobar los exámenes sin leer ningún contenido",
      "D": "Estudiar únicamente en grupo sin responsabilidad personal"
    },
    respuesta_correcta: "B"
  },
  {
    id: 704,
    curso_id: 107,
    pregunta: "¿Cuál de los siguientes es un deber del graduando?",
    opciones: {
      "A": "Incumplir con el temario obligatorio",
      "B": "Cumplir con todos los requisitos académicos y administrativos establecidos",
      "C": "Delegar su examen final a un tercero",
      "D": "Retirarse del programa antes de finalizar"
    },
    respuesta_correcta: "B"
  },
  {
    id: 705,
    curso_id: 107,
    pregunta: "¿Qué ciudad es la sede oficial de emisión de los títulos académicos del Instituto?",
    opciones: {
      "A": "Bogotá, Colombia",
      "B": "Cali, Colombia",
      "C": "Medellín, Colombia",
      "D": "Barranquilla, Colombia"
    },
    respuesta_correcta: "C"
  }
];

module.exports = {
  additionalCourses,
  additionalModules,
  additionalQuestions
};
