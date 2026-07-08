const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { additionalCourses, additionalModules, additionalQuestions } = require('./additionalSeedData');

const dbFile = path.join(__dirname, '..', process.env.DB_FILE || 'database.sqlite');
const jsonDbFile = path.join(__dirname, '..', 'database.json');

let dbType = 'sqlite';
let sqliteDB = null;

// JSON DB Fallback implementation
const jsonDb = {
  users: [],
  modules: [],
  progress: [],
  exams: [],
  certificates: []
};

function loadJsonDb() {
  if (fs.existsSync(jsonDbFile)) {
    try {
      const data = fs.readFileSync(jsonDbFile, 'utf8');
      const parsed = JSON.parse(data);
      Object.assign(jsonDb, parsed);
    } catch (err) {
      console.error('Error reading JSON fallback DB:', err);
    }
  }
}

function saveJsonDb() {
  try {
    fs.writeFileSync(jsonDbFile, JSON.stringify(jsonDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing JSON fallback DB:', err);
  }
}

// Seed data definition
const seedModules = [
  {
    "id": 1,
    "titulo": "Módulo 1: Inocuidad alimentaria y BPM",
    "descripcion": "Inocuidad alimentaria y BPM Definición de alimento Todo producto natural o artificial, elaborado o no, que ingerido aporta al organismo huma...",
    "orden": 1,
    "tipo_recurso": "video",
    "contenido": "## Inocuidad alimentaria y BPM\n\n---\n\n### Definición de alimento\n\nTodo producto natural o artificial, elaborado o no, que ingerido aporta al organismo humano los nutrientes y la energía necesarios para el desarrollo de los procesos biológicos.\n\n### Definición de calidad\n\nCalidad es el conjunto de propiedades y características inherentes de un producto o servicio que le dan la capacidad de satisfacer gustos, necesidades, preferencias según un parámetro y cumplir con sus requerimientos. También se define calidad como la percepción de un cliente hacia un producto o servicio por sus cualidades, respecto al grado de conformidad y satisfacción que se consigue.\n\n### Definición de inocuidad\n\nEs la garantía de que los alimentos no causarán daño al consumidor cuando se preparen y consuman de acuerdo con el uso al que se destina. Resolución 2674 del 2013.\n\n### Diferencia entre calidad e inocuidad\n\nLa calidad se relaciona con las características del producto que satisfacen al cliente, como sabor, apariencia y presentación, mientras que la inocuidad garantiza que el alimento sea seguro y no represente un riesgo para la salud. Ambos conceptos son fundamentales, pero la inocuidad es un requisito obligatorio para cualquier alimento.\n\n### Importancia de la inocuidad alimentaria\n\nLos alimentos no inocuos socavan la seguridad alimentaria y la salud. Asegurar la inocuidad de los alimentos es esencial para promover la salud, los medios de vida, el comercio, el crecimiento económico y la prosperidad general.\n\nCada año, millones de personas enferman como consecuencia de alimentos no inocuos. Los grupos vulnerables, como los niños, las mujeres embarazadas y las personas de más edad corren mayor riesgo. FAO\n\n### Definición de alimento contaminado\n\nAlimento que presenta o contiene agentes y/o sustancias extrañas de cualquier naturaleza en cantidades superiores a las permitidas en las normas nacionales, o en su defecto en normas reconocidas internacionalmente.\n\n### Clasificación de los alimentos según el riesgo para la salud pública\n\n- **Alimento de mayor riesgo:** Alimento que, en razón a sus características de composición especialmente en sus contenidos de nutrientes, favorece el crecimiento microbiano y, por consiguiente, cualquier deficiencia en su proceso, manipulación, conservación, transporte, distribución y comercialización, puede ocasionar trastornos a la salud del consumidor. Ejemplo: Carne, pollo, lácteos, huevos, entre otros.\n- **Alimento de riesgo medio:** Los alimentos que pueden contener microorganismos patógenos, pero normalmente no favorecen su crecimiento debido a las características del alimento o alimentos que es poco probable que contengan microorganismos patógenos debido al tipo de alimento o procesamiento del mismo, pero que pueden apoyar a la formación de toxinas o el crecimiento de microorganismos patógenos. Ejemplo: Mantequilla, enlatados, entre otros.\n- **Alimento de menor riesgo:** Poseen menor riesgo de contaminación debido a su bajo contenido de Nutrientes, son más secos o más ácidos y por tanto tienen más resistencia y son más estables a T ambiente. Ejemplo: Galletas, cereales, pan, productos ácidos como el vinagre, mermelada, entre otros.\n\n### Definición de BPM\n\nPrincipios básicos y generales de higiene en la elaboración, preparación, elaboración, envasado, almacenamiento, transporte y distribución de alimentos para el consumo humano. Resolución 2674 del 2013.\n\n### Definición de seguridad alimentaria\n\nExiste seguridad alimentaria cuando las personas tienen acceso a alimentos suficientes, seguros y nutritivos para su crecimiento, desarrollo y una vida activa y saludable.\n\n> “…El 28 % de la población mundial se enfrentó a una inseguridad alimentaria moderada o grave en 2024. Los niveles de hambre y de inseguridad alimentaria mejoraron en algunas partes de América del Sur y Asia, pero empeoraron en África.” FAO.",
    "url_recurso": "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    "id": 2,
    "titulo": "Módulo 2: Higiene del personal manipulador",
    "descripcion": "Higiene del personal manipulador Definición de manipulador de alimentos Es toda persona que está en contacto directo con el alimento durante...",
    "orden": 2,
    "tipo_recurso": "audio",
    "contenido": "## Higiene del personal manipulador\n\n---\n\n### Definición de manipulador de alimentos\n\nEs toda persona que está en contacto directo con el alimento durante todo el proceso de transformación del mismo y que puede influir en la inocuidad o calidad sanitaria.\n\n> “Las personas son el principal transporte gratis para los microorganismos”\n\n### Estado de salud del manipulador de alimentos\n\n- El personal debe contar con buen estado de salud, no se permite con enfermedades infecciosas.\n- El personal debe contar con certificación médica para manipular alimentos, realizando exámenes periódicos 1 vez al año.\n- Realizar acciones correctivas y preventivas dependiendo de los exámenes de salud del personal.\n- La empresa deberá garantizar el seguimiento periódico de los exámenes médicos del personal manipulador.\n- Cuando se presenten enfermedades, heridas, tatuajes o demás, será responsabilidad del colaborador comunicar al jefe inmediato para tomar las medidas correspondientes.\n\n### Educación y capacitación del personal manipulador\n\nSegún la resolución 2674 del 2013, se debe contar con un plan de capacitación anual de por lo menos 10 horas sobre temas relacionados con la resolución 2674 del 2013. Los capacitadores deben demostrar su idoneidad para capacitar, deben tener formación en el tema y experiencia relacionada con el campo de los alimentos.\n\n### Prácticas higiénicas y medidas de protección\n\nLas prácticas higiénicas son fundamentales para garantizar la inocuidad de los alimentos y prevenir riesgos de contaminación. Todo manipulador debe mantener una adecuada higiene personal, realizar un correcto lavado de manos, utilizar la dotación de protección requerida y evitar conductas que puedan afectar la seguridad de los alimentos.\n\n- No hablar ni estornudar sobre los alimentos.\n- Mantener un constante y correcto lavado de manos.\n- **Utilizar el uniforme proporcionado por la organización:** Botas de seguridad, gorro, cubre barbas, tapabocas, bata antifluido.\n- Evitar joyas, accesorios como relojes, cadenas, aretes, manillas, piercings.\n- No fumar ni comer en el lugar de trabajo.\n- Reportar heridas, cortadas, tatuajes.\n- Evitar olores fuertes tales como perfume.\n- Las uñas deben permanecer limpias, sin esmalte y cortas.\n- En el caso de las mujeres, no podrán portar maquillaje, pestañas postizas, etc.\n\n### Lavado de manos\n\nEl lavado de manos debe realizarse en diversas situaciones:\n\n- Antes de comenzar a trabajar\n- Al ingresar a la planta de producción\n- Al cambiar de proceso\n- Al salir del baño\n- Al tocar cualquier elemento contaminado\n- Después de tocar elementos personales como el celular\n\n**Proceso correcto del lavado de manos:**\n1. Humedecer las manos con abundante agua.\n2. Enjabonar las manos con el grifo cerrado.\n3. Frotar las palmas entre ellas.\n4. Intercalar los dedos y frotar la palma.\n5. Enjuagar las manos con abundante agua (8 seg).\n6. Secar con una toalla desechable.\n\n### Prácticas higiénicas de los visitantes\n\n- Todos los visitantes deberán seguir todas las medidas de protección y sanitarias establecidas.\n- Deben portar la vestimenta y dotación adecuada suministrada por la empresa (polainas, bata, gorro, etc.).",
    "url_recurso": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    "id": 3,
    "titulo": "Módulo 3: Tipos de contaminación alimentaria",
    "descripcion": "Tipos de contaminación alimentaria Definición contaminación de los alimentos La contaminación de los alimentos es la presencia de agentes fí...",
    "orden": 3,
    "tipo_recurso": "imagen",
    "contenido": "## Tipos de contaminación alimentaria\n\n---\n\n### Definición contaminación de los alimentos\n\nLa contaminación de los alimentos es la presencia de agentes físicos, químicos o biológicos que pueden alterar la inocuidad de un alimento y representar un riesgo para la salud del consumidor. Esta contaminación puede ocurrir durante la preparación, almacenamiento, transporte, manipulación o distribución de los alimentos debido a prácticas inadecuadas de higiene.\n\n### Definición de alérgenos\n\nLos alérgenos son sustancias presentes en ciertos alimentos que pueden provocar reacciones alérgicas en personas sensibles.\n\nLos 14 alérgenos declarados son:\n\n1. Cereales que contienen gluten\n2. Crustáceos y productos a base de crustáceos\n3. Huevos y productos a base de huevo\n4. Pescado y productos a base de pescado\n5. Maní (cacahuate) y productos a base de maní\n6. Soja y productos a base de soja\n7. Leche y productos lácteos\n8. Frutos de cáscara (almendras, avellanas, nueces, etc.)\n9. Apio y productos a base de apio\n10. Mostaza\n11. Granos de sésamo\n12. Dióxido de azufre y sulfitos\n13. Altramuces (lupino)\n14. Moluscos\n\n### Contaminación física\n\nLa contaminación física ocurre cuando cuerpos extraños o partículas ajenas al alimento entran en contacto con este, afectando su inocuidad. Entre los contaminantes físicos más comunes se encuentran cabello, vidrio, plástico, metal, tierra, madera, piedras, uñas, joyas o fragmentos de utensilios.\n\n### Contaminación química\n\nLa contaminación química se presenta cuando sustancias químicas peligrosas entran en contacto con los alimentos. Este tipo de contaminación puede originarse por el uso inadecuado de productos de limpieza y desinfección, residuos de plaguicidas, jabones o desinfectantes mal enjuagados, lubricantes o metales pesados.\n\n### Contaminación biológica\n\nOcurre cuando microorganismos como bacterias, virus, hongos o parásitos contaminan los alimentos, pudiendo causar enfermedades transmitidas por alimentos (ETA). Es una de las más peligrosas, ya que muchos microorganismos no alteran el olor, sabor o apariencia del alimento.\n\n### Contaminación cruzada\n\nOcurre cuando microorganismos, sustancias o cuerpos extraños se transfieren de un alimento, superficie, utensilio o persona hacia otro alimento. Generalmente sucede cuando alimentos crudos entran en contacto con alimentos listos para el consumo.\n\n### Contaminación por alérgenos\n\nOcurre cuando un alimento entra en contacto con sustancias capaces de generar reacciones alérgicas en personas sensibles, por contacto directo o uso compartido de utensilios.",
    "url_recurso": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": 4,
    "titulo": "Módulo 4: Limpieza y desinfección",
    "descripcion": "Limpieza y desinfección Definición de limpieza La limpieza es el proceso mediante el cual se eliminan residuos visibles como grasa, suciedad...",
    "orden": 4,
    "tipo_recurso": "texto",
    "contenido": "## Limpieza y desinfección\n\n---\n\n### Definición de limpieza\n\nLa limpieza es el proceso mediante el cual se eliminan residuos visibles como grasa, suciedad, restos de alimentos, polvo y otras impurezas presentes en superficies, equipos, utensilios y áreas de trabajo.\n\nEste procedimiento es fundamental para mantener condiciones higiénicas adecuadas y facilitar la posterior desinfección.\n\n### Definición de desinfección\n\nLa desinfección es el proceso mediante el cual se eliminan o reducen los microorganismos presentes en superficies, equipos, utensilios y áreas de trabajo, mediante el uso de agentes químicos o métodos físicos autorizados.\n\n### Diferencia entre limpieza y desinfección\n\nLa limpieza consiste en eliminar suciedad, grasa y residuos visibles de las superficies, mientras que la desinfección tiene como objetivo eliminar o reducir los microorganismos que pueden causar contaminación. **Para lograr una adecuada inocuidad, primero debe realizarse la limpieza y posteriormente la desinfección.**\n\n**Los pasos básicos de limpieza son:**\n\n- Retirar residuos, aplicar detergente y enjuagar con agua.\n- Mantener limpias todas las áreas y superficies del lugar de trabajo.\n- Mantener los productos de aseo almacenados en un lugar exclusivo bajo llave.\n- No se deben mezclar productos químicos debido a que pueden generar olores tóxicos o nocivos.\n- Cada persona debe ser responsable de limpiar y desinfectar correctamente su área de trabajo.\n\n### Tipos de desinfección\n\n- **Desinfección por inmersión:** Utensilios o equipos se sumergen completamente en una solución desinfectante durante un tiempo determinado.\n- **Desinfección por aspersión:** Consiste en aplicar una solución desinfectante mediante pulverización o rociado.\n- **Desinfección manual:** Se aplica una solución desinfectante utilizando elementos como paños, cepillos o esponjas limpias.\n\n### Métodos para desinfectar\n\n1. **Calor:** Utiliza altas temperaturas, como agua caliente o vapor.\n2. **Desinfección por productos químicos:** Utiliza sustancias desinfectantes autorizadas.\n\n### Tipos de productos químicos\n\nEntre los más utilizados se encuentran:\n- Hipoclorito de sodio (cloro)\n- Amonios cuaternarios\n- Alcohol\n- Yodo y compuestos yodados\n- Peróxido de hidrógeno\n- Ácido peracético",
    "url_recurso": ""
  },
  {
    "id": 5,
    "titulo": "Módulo 5: Agua potable y control de plagas",
    "descripcion": "Agua potable y control de plagas El agua potable es aquella que cumple con las condiciones físicas, químicas y microbiológicas aptas para el...",
    "orden": 5,
    "tipo_recurso": "video",
    "contenido": "## Agua potable y control de plagas\n\n---\n\nEl agua potable es aquella que cumple con las condiciones físicas, químicas y microbiológicas aptas para el consumo humano y para su uso seguro en la preparación, limpieza y manipulación de alimentos.\n\nEl agua potable es fundamental en los procesos de manipulación de alimentos, ya que se utiliza para la preparación de productos, lavado de materias primas, limpieza de utensilios, equipos, superficies y aseo personal. \n\n### Usos del agua potable en la manipulación de alimentos\n\n- Lavado de manos.\n- Lavado y desinfección de frutas y verduras.\n- Limpieza y desinfección de equipos y utensilios.\n- Preparación de alimentos y bebidas.\n- Producción de hielo y vapor.\n- Limpieza de instalaciones y superficies.\n\n### Riesgos de utilizar agua contaminada o no potable\n\nEl uso de agua contaminada puede contener microorganismos patógenos, sustancias químicas o partículas extrañas capaces de alterar la calidad de los alimentos y causar enfermedades transmitidas por alimentos (ETA). Favorece la contaminación cruzada y la proliferación de microorganismos.\n\n### Medidas de control del agua potable\n\nLas industrias implementan controles como la limpieza y desinfección periódica de tanques de almacenamiento, el mantenimiento preventivo de tuberías y conexiones, y la realización de análisis físicos, químicos y microbiológicos para verificar la calidad del agua.\n\n---\n\n## Control de plagas\n\n### Definición de plagas\n\nLas plagas son organismos como insectos, roedores, aves u otros animales que pueden ingresar a las áreas de manipulación de alimentos y representar un riesgo para la inocuidad, ya que tienen la capacidad de contaminar alimentos, superficies, equipos y utensilios.\n\n### Importancia del control de plagas\n\nEs fundamental para prevenir la contaminación de los alimentos. Las plagas pueden:\n- Transmitir enfermedades.\n- Contaminar superficies y alimentos.\n- Deteriorar materias primas y empaques.\n- Generar pérdidas económicas.\n- Afectar la imagen del establecimiento.\n\n### Plagas más comunes en la industria alimentaria\n\n- Moscas\n- Cucarachas\n- Hormigas\n- Roedores\n- Aves\n- Gorgojos y otros insectos de almacenamiento\n\n### Manejo integrado de plagas\n\nEs fundamental mantener un adecuado control sobre las materias primas, empaques y áreas de almacenamiento. Deben cumplirse de manera permanente los programas de limpieza y desinfección.\n\n### Medidas preventivas para el control de plagas\n\n- Mantener orden y limpieza.\n- Disponer adecuadamente los residuos.\n- Mantener recipientes de basura tapados.\n- Evitar acumulación de agua.\n- Sellar grietas, huecos y entradas.\n- Almacenar alimentos protegidos y separados del piso.\n- Mantener puertas y ventanas protegidas.\n- Realizar inspecciones periódicas.",
    "url_recurso": "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    "id": 6,
    "titulo": "Módulo 6: Enfermedades transmitidas por alimentos (ETA)",
    "descripcion": "Enfermedades transmitidas por alimentos (ETA) Las Enfermedades Transmitidas por Alimentos (ETA), se definen como el síndrome originado por l...",
    "orden": 6,
    "tipo_recurso": "audio",
    "contenido": "## Enfermedades transmitidas por alimentos (ETA)\n\n---\n\nLas Enfermedades Transmitidas por Alimentos (ETA), se definen como el síndrome originado por la ingestión de alimentos y/o agua, que contengan agentes etiológicos, en cantidades suficientes, que afecten la salud del consumidor a nivel individual o colectivo.\n\n### Infección alimentaria\n\nLa infección alimentaria ocurre cuando una persona consume alimentos o agua contaminados con microorganismos patógenos **vivos**, como bacterias, virus o parásitos, que ingresan al organismo y se multiplican, causando enfermedad.\n\n### Intoxicación alimentaria\n\nLa intoxicación alimentaria se presenta cuando una persona consume alimentos que contienen **toxinas o sustancias tóxicas** producidas por microorganismos, sustancias químicas o contaminantes presentes en el alimento.\n\n### Factores que contribuyen a la formación de una ETA\n\nEntre las principales causas se encuentran la mala higiene personal de los manipuladores, el uso de agua no potable, la contaminación cruzada, la limpieza y desinfección insuficiente de equipos y utensilios, y la presencia de plagas.\n\nPara que ocurra una ETA, existen factores adicionales:\n- El alimento debe estar bajo características físicas (temperatura, humedad, tiempo) que favorezcan el crecimiento.\n- El agente etiológico debe estar presente en cantidad suficiente.\n- Debe ingerirse una cantidad suficiente del alimento.\n\n### Síntomas de una ETA\n\nLa manifestación clínica más común consiste en la aparición de síntomas gastrointestinales (náuseas, vómitos, calambres estomacales y diarrea), pero estas enfermedades también pueden dar lugar a síntomas neurológicos, ginecológicos, inmunológicos y de otro tipo.\n\n### Enfermedades más comunes trasmitidas por alimentos\n\n- **Salmonelosis:** Causada por bacterias del género Salmonella, asociada al consumo de alimentos contaminados como carnes, huevos, pollo o leche.\n- **Escherichia coli (E. coli):** Relacionada con alimentos contaminados, mala higiene o cocción insuficiente.\n- **Listeriosis:** Infección causada por Listeria monocytogenes, afecta a mujeres embarazadas y adultos mayores.\n- **Botulismo:** Enfermedad grave causada por toxinas de Clostridium botulinum (alimentos mal enlatados).\n- **Intoxicación por Staphylococcus aureus:** Intoxicación rápida producida por toxinas de la bacteria Staphylococcus aureus, por mala higiene del manipulador.\n\n### Medidas de prevención para evitar ETA\n\n- El correcto lavado de manos.\n- El uso de agua potable.\n- La limpieza y desinfección de superficies, equipos y utensilios.\n- La adecuada higiene personal de los manipuladores.\n- Evitar la contaminación cruzada y cocinar completamente los alimentos.",
    "url_recurso": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    "id": 7,
    "titulo": "Módulo 7: Manipulación segura y conservación de alimentos",
    "descripcion": "Manipulación segura y conservación de alimentos Definición de manipulación segura La adecuada manipulación de los alimentos es fundamental p...",
    "orden": 7,
    "tipo_recurso": "imagen",
    "contenido": "## Manipulación segura y conservación de alimentos\n\n---\n\n### Definición de manipulación segura\n\nLa adecuada manipulación de los alimentos es fundamental para prevenir Enfermedades Transmitidas por Alimentos (ETA), evitar la proliferación de microorganismos y proteger la salud del consumidor. La aplicación de buenas prácticas durante todos los procesos ayuda a mantener la calidad e inocuidad de los productos.\n\n### Lavado de frutas y verduras\n\nLas frutas y verduras deben lavarse y desinfectarse adecuadamente antes de su preparación o consumo para eliminar suciedad, residuos y posibles microorganismos contaminantes.\n\n### Separación de los alimentos\n\nLos alimentos crudos deben mantenerse separados de los alimentos listos para el consumo para evitar contaminación cruzada.\n\n### Conservación de los alimentos\n\nConsiste en aplicar condiciones y procedimientos adecuados para mantener la inocuidad, calidad y vida útil de los productos alimenticios durante su almacenamiento y distribución.\n\n### Importancia de la conservación de los alimentos\n\nUna adecuada conservación permite disminuir el crecimiento de microorganismos, evitar el deterioro de los alimentos y reducir riesgos de contaminación.\n\n### Métodos de conservación\n\n- **Refrigeración:** Consiste en mantener los alimentos a bajas temperaturas para disminuir la proliferación de microorganismos.\n- **Congelación:** Permite conservar los alimentos durante períodos más prolongados mediante temperaturas inferiores a cero grados.\n\n### Almacenamiento seguro de los alimentos\n\n- Mantener alimentos protegidos y tapados.\n- Separar alimentos crudos de cocidos.\n- Aplicar el método PEPS (Primero en Entrar, Primero en Salir).\n- Almacenar productos sobre estibas o superficies limpias.\n- Verificar fechas de vencimiento y estado de los productos.\n- Mantener áreas limpias, secas y organizadas.\n\n### Cadena de frío\n\nLa cadena de frío es el mantenimiento continuo de temperaturas adecuadas durante el almacenamiento, transporte y distribución de alimentos refrigerados o congelados, con el fin de conservar su inocuidad y calidad. La interrupción de la cadena de frío puede favorecer la proliferación de microorganismos.",
    "url_recurso": "https://images.unsplash.com/photo-1762329924239-e204f101fca4?auto=format&fit=crop&w=800&q=80"
  },
  {
    "id": 8,
    "titulo": "Módulo 8: Normatividad sanitaria",
    "descripcion": "Normatividad sanitaria Resolución 2674 del 2013 Es la norma colombiana que establece los requisitos sanitarios para la fabricación, procesam...",
    "orden": 8,
    "tipo_recurso": "texto",
    "contenido": "## Normatividad sanitaria\n\n---\n\n### Resolución 2674 del 2013\n\nEs la norma colombiana que establece los requisitos sanitarios para la fabricación, procesamiento, almacenamiento, transporte y comercialización de alimentos. Su objetivo es proteger la salud pública y garantizar la inocuidad de los productos en toda la cadena alimentaria.\n\n### Resolución 0810 del 2021\n\nTiene por objeto establecer el reglamento técnico sobre los requisitos de etiquetado nutricional y etiquetado frontal que deben cumplir los alimentos envasados o empacados para consumo humano que se comercialicen en Colombia.\n\n### Decreto 1500 del 2007\n\nTiene por objeto establecer el reglamento técnico mediante el cual se crea el Sistema Oficial de Inspección, Vigilancia y Control de la carne, productos cárnicos comestibles y derivados cárnicos destinados para el consumo humano, así como los requisitos sanitarios y de inocuidad que deben cumplirse a lo largo de todas las etapas de la cadena alimentaria.\n\n### Ley 9 de 1979\n\nTiene por objeto establecer medidas sanitarias orientadas a preservar, restaurar y mejorar las condiciones necesarias para proteger la salud humana y las condiciones sanitarias del ambiente.\n\n### Resolución 5109 del 2005\n\nTiene por objeto establecer el reglamento técnico sobre los requisitos de rotulado o etiquetado que deben cumplir los alimentos envasados o empacados y las materias primas para consumo humano, con el fin de brindar al consumidor información clara, comprensible y que no induzca a error o confusión.",
    "url_recurso": ""
  }
];

const seedQuestions = [
  {
    id: 1,
    pregunta: "¿Cuál es la temperatura mínima segura para cocinar pollo?",
    opciones: {
      "A": "60°C (140°F)",
      "B": "70°C (158°F)",
      "C": "74°C (165°F)",
      "D": "80°C (176°F)"
    },
    respuesta_correcta: "C"
  },
  {
    id: 2,
    pregunta: "¿Qué es la contaminación cruzada?",
    opciones: {
      "A": "Cuando un alimento se cocina demasiado",
      "B": "La transferencia de microorganismos de un alimento a otro",
      "C": "Cuando se mezclan diferentes ingredientes",
      "D": "El proceso de congelación de alimentos"
    },
    respuesta_correcta: "B"
  },
  {
    id: 3,
    pregunta: "¿Con qué frecuencia debe lavarse las manos un manipulador de alimentos?",
    opciones: {
      "A": "Solo al inicio del turno",
      "B": "Una vez por hora",
      "C": "Cada vez que cambie de tarea y después de tocar superficies contaminadas",
      "D": "Solamente antes de comer"
    },
    respuesta_correcta: "C"
  },
  {
    id: 4,
    pregunta: "¿Cuál es el rango de temperatura de la 'zona de peligro' para alimentos?",
    opciones: {
      "A": "0°C a 10°C",
      "B": "5°C a 60°C",
      "C": "10°C a 40°C",
      "D": "20°C a 50°C"
    },
    respuesta_correcta: "B"
  },
  {
    id: 5,
    pregunta: "¿Qué debe hacer si encuentra un alimento vencido en el almacén?",
    opciones: {
      "A": "Usarlo si no huele mal",
      "B": "Descartarlo inmediatamente y reportarlo",
      "C": "Mezclarlo con alimentos frescos",
      "D": "Guardarlo para revisión posterior"
    },
    respuesta_correcta: "B"
  },
  {
    id: 6,
    pregunta: "¿Cuál es la primera etapa del proceso de limpieza y desinfección?",
    opciones: {
      "A": "Aplicar desinfectante",
      "B": "Enjuagar con agua",
      "C": "Remover los residuos visibles",
      "D": "Secar las superficies"
    },
    respuesta_correcta: "C"
  },
  {
    id: 7,
    pregunta: "¿Qué característica NO debe tener un manipulador de alimentos?",
    opciones: {
      "A": "Uñas cortas y limpias",
      "B": "Joyas y accesorios en las manos",
      "C": "Ropa limpia y apropiada",
      "D": "Cabello recogido o cubierto"
    },
    respuesta_correcta: "B"
  },
  {
    id: 8,
    pregunta: "¿Cuánto tiempo máximo pueden permanecer alimentos perecederos a temperatura ambiente?",
    opciones: {
      "A": "30 minutos",
      "B": "1 hora",
      "C": "2 horas",
      "D": "4 horas"
    },
    respuesta_correcta: "C"
  }
];

// Database connection configuration with strict charset property.
// Note: While SQLite stores raw UTF-8 by default, we configure the connection 
// properties/metadata to strictly enforce 'utf8mb4' character set encoding
// for E2E consistency and complete UTF-8 compatibility.
const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: dbFile,
    charset: 'utf8mb4'
  },
  useNullAsDefault: true
};

// Initialize DB Connections
function initDB() {
  return new Promise(async (resolve, reject) => {
    try {
      const sqlite3 = require('sqlite3').verbose();
      sqliteDB = new sqlite3.Database(dbFile, (err) => {
        if (err) {
          console.warn('Could not open SQLite database file, falling back to JSON storage.', err.message);
          dbType = 'json';
          setupJsonDB().then(resolve);
        } else {
          console.log('Connected to the SQLite database.');
          sqliteDB.run("PRAGMA encoding = 'UTF-8';");
          setupSqliteDB().then(resolve).catch((sqliteErr) => {
            console.warn('SQLite setup failed, falling back to JSON storage.', sqliteErr.message);
            dbType = 'json';
            setupJsonDB().then(resolve);
          });
        }
      });
    } catch (e) {
      console.warn('SQLite initialization error, falling back to JSON storage.', e.message);
      dbType = 'json';
      setupJsonDB().then(resolve);
    }
  });
}

// Setup SQLite Tables — Idempotent (safe to run on every startup, preserves existing data)
function setupSqliteDB() {
  return new Promise((resolve, reject) => {
    sqliteDB.serialize(() => {
      // Enable foreign key constraints
      sqliteDB.run(`PRAGMA foreign_keys = OFF`, (err) => { if (err) console.warn('FK pragma warn:', err?.message); });

      // Create tables only if they don't exist — NO DROP TABLE to preserve production data
      sqliteDB.run(`CREATE TABLE IF NOT EXISTS usuarios (
          cedula TEXT PRIMARY KEY,
          nombre_completo TEXT,
          password_hash TEXT,
          rol TEXT DEFAULT 'estudiante',
          fecha_registro TEXT,
          fecha_expedicion_cedula TEXT,
          municipio_expedicion_cedula TEXT,
          municipio_nacimiento TEXT,
          anio_nacimiento INTEGER,
          pago_realizado INTEGER DEFAULT 0,
          email TEXT,
          vipass INTEGER DEFAULT 0
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS cursos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT UNIQUE NOT NULL,
          descripcion TEXT,
          imagen_url TEXT,
          creado_en TEXT,
          precio REAL NOT NULL,
          certificado_template TEXT,
          certificacion_directa INTEGER DEFAULT 0
        )`, (err) => { if (err) return reject(err); });

      async function runRemainingSetup(resolve, reject) {
        try {
          await new Promise((res, rej) => {
            sqliteDB.run(`CREATE TABLE IF NOT EXISTS matriculas (
                usuario_cedula TEXT,
                curso_id INTEGER,
                fecha_matricula TEXT,
                PRIMARY KEY (usuario_cedula, curso_id),
                FOREIGN KEY (usuario_cedula) REFERENCES usuarios(cedula) ON DELETE CASCADE,
                FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
              )`, (err) => err ? rej(err) : res());
          });

          await new Promise((res, rej) => {
            sqliteDB.run(`CREATE TABLE IF NOT EXISTS modulos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                curso_id INTEGER,
                titulo_modulo TEXT,
                orden INTEGER,
                tipo_contenido TEXT,
                data_contenido TEXT,
                FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
              )`, (err) => err ? rej(err) : res());
          });

          await new Promise((res, rej) => {
            sqliteDB.run(`CREATE TABLE IF NOT EXISTS preguntas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                curso_id INTEGER,
                pregunta TEXT,
                opcion_a TEXT,
                opcion_b TEXT,
                opcion_c TEXT,
                opcion_d TEXT,
                respuesta_correcta TEXT,
                FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
              )`, (err) => err ? rej(err) : res());
          });

          await new Promise((res, rej) => {
            sqliteDB.run(`CREATE TABLE IF NOT EXISTS progreso (
                usuario_cedula TEXT,
                modulo_id INTEGER,
                completado INTEGER DEFAULT 0,
                fecha_completado TEXT,
                PRIMARY KEY (usuario_cedula, modulo_id),
                FOREIGN KEY (usuario_cedula) REFERENCES usuarios(cedula) ON DELETE CASCADE,
                FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
              )`, (err) => err ? rej(err) : res());
          });

          await new Promise((res, rej) => {
            sqliteDB.run(`CREATE TABLE IF NOT EXISTS examenes (
                usuario_cedula TEXT,
                curso_id INTEGER DEFAULT 1,
                intentos INTEGER DEFAULT 0,
                puntaje_maximo REAL DEFAULT 0,
                aprobado INTEGER DEFAULT 0,
                fecha_ultimo_intento TEXT,
                PRIMARY KEY (usuario_cedula, curso_id),
                FOREIGN KEY (usuario_cedula) REFERENCES usuarios(cedula) ON DELETE CASCADE,
                FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
              )`, (err) => err ? rej(err) : res());
          });

          await new Promise((res, rej) => {
            sqliteDB.run(`CREATE TABLE IF NOT EXISTS certificados (
                codigo_verificacion TEXT PRIMARY KEY,
                usuario_cedula TEXT,
                curso_id INTEGER DEFAULT 1,
                fecha_emision TEXT,
                calificacion_obtenida REAL,
                numero_certificado TEXT UNIQUE,
                FOREIGN KEY (usuario_cedula) REFERENCES usuarios(cedula) ON DELETE CASCADE,
                FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
              )`, (err) => err ? rej(err) : res());
          });

          // Clean duplicate courses first (merges references atomically)
          await cleanDuplicateCoursesSQLite();

          // Create the UNIQUE index on cursos(titulo)
          await new Promise((res, rej) => {
            sqliteDB.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_cursos_titulo ON cursos(titulo)`, (err) => {
              if (err) console.warn('Warning: Failed to create unique index on cursos(titulo):', err.message);
              res(); // Proceed anyway
            });
          });

          // Map for hardcoded course IDs to actual database IDs
          const courseIdMap = { 1: 1 };

          // Seed default course (id: 1)
          await new Promise((res, rej) => {
            sqliteDB.run(`INSERT OR IGNORE INTO cursos (id, titulo, descripcion, imagen_url, creado_en, precio) VALUES (?, ?, ?, ?, ?, ?)`,
              [1, 'Manipulación de Alimentos', 'Curso estándar de 3 horas lectivas para la manipulación higiénica de alimentos.', 'https://images.unsplash.com/photo-1567710593500-19fb333fe351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGhlYWx0aHklMjBmb29kJTIwaW5ncmVkaWVudHN8ZW58MXx8fHwxNzc5MzAyOTMwfDA&ixlib=rb-4.1.0&q=80&w=1080', '2026-05-20', 100000],
              (err) => err ? rej(err) : res()
            );
          });

          // Seed additional courses dynamically
          for (const c of additionalCourses) {
            // Check if it already exists by title
            const existing = await new Promise((res, rej) => {
              sqliteDB.get(`SELECT id FROM cursos WHERE titulo = ?`, [c.titulo], (err, row) => {
                if (err) rej(err);
                else res(row);
              });
            });

            if (existing) {
              courseIdMap[c.id] = existing.id;
            } else {
              await new Promise((res, rej) => {
                sqliteDB.run(`INSERT OR IGNORE INTO cursos (id, titulo, descripcion, imagen_url, creado_en, precio, certificacion_directa) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [c.id, c.titulo, c.descripcion, c.imagen_url, c.creado_en, c.precio, c.certificacion_directa || 0],
                  function(err) {
                    if (err) {
                      // fallback to select by title
                      sqliteDB.get(`SELECT id FROM cursos WHERE titulo = ?`, [c.titulo], (err2, row2) => {
                        if (err2 || !row2) rej(err || err2);
                        else {
                          courseIdMap[c.id] = row2.id;
                          res();
                        }
                      });
                    } else {
                      courseIdMap[c.id] = c.id;
                      res();
                    }
                  }
                );
              });
            }
          }

          // Seed modules using resolved course IDs
          const stmt = sqliteDB.prepare(`INSERT OR IGNORE INTO modulos (id, curso_id, titulo_modulo, orden, tipo_contenido, data_contenido) VALUES (?, ?, ?, ?, ?, ?)`);
          
          for (const m of seedModules) {
            const serializedData = JSON.stringify({
              url: m.url_recurso,
              text: m.contenido
            });
            await new Promise((res, rej) => {
              stmt.run(m.id, 1, m.titulo, m.orden, m.tipo_recurso, serializedData, (e) => e ? rej(e) : res());
            });
          }
          
          for (const m of additionalModules) {
            const resolvedCourseId = courseIdMap[m.curso_id];
            if (resolvedCourseId) {
              await new Promise((res, rej) => {
                stmt.run(m.id, resolvedCourseId, m.titulo_modulo, m.orden, m.tipo_contenido, m.data_contenido, (e) => e ? rej(e) : res());
              });
            }
          }
          
          await new Promise((res, rej) => stmt.finalize((e) => e ? rej(e) : res()));

          // Seed questions using resolved course IDs
          const stmtQuestions = sqliteDB.prepare(`INSERT OR IGNORE INTO preguntas (id, curso_id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
          
          for (const q of seedQuestions) {
            await new Promise((res, rej) => {
              stmtQuestions.run(q.id, 1, q.pregunta, q.opciones.A, q.opciones.B, q.opciones.C, q.opciones.D, q.respuesta_correcta, (e) => e ? rej(e) : res());
            });
          }
          
          for (const q of additionalQuestions) {
            const resolvedCourseId = courseIdMap[q.curso_id];
            if (resolvedCourseId) {
              await new Promise((res, rej) => {
                stmtQuestions.run(q.id, resolvedCourseId, q.pregunta, q.opciones.A, q.opciones.B, q.opciones.C, q.opciones.D, q.respuesta_correcta, (e) => e ? rej(e) : res());
              });
            }
          }
          
          await new Promise((res, rej) => stmtQuestions.finalize((e) => e ? rej(e) : res()));

          // Seed users
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync('password123', salt);
          
          await new Promise((res, rej) => {
            sqliteDB.run(`INSERT OR IGNORE INTO usuarios (cedula, nombre_completo, password_hash, rol, fecha_registro) VALUES (?, ?, ?, ?, ?)`,
              ['123456789', 'Juan Pérez', hash, 'estudiante', '2026-05-20'],
              (err) => err ? rej(err) : res()
            );
          });

          const adminHash = bcrypt.hashSync('adminpassword', salt);
          await new Promise((res, rej) => {
            sqliteDB.run(`INSERT OR IGNORE INTO usuarios (cedula, nombre_completo, password_hash, rol, fecha_registro) VALUES (?, ?, ?, ?, ?)`,
              ['999999999', 'Administrador Instituto Superior del Norte', adminHash, 'administrador', '2026-05-26'],
              (err) => err ? rej(err) : res()
            );
          });

          const engineerHash = bcrypt.hashSync('Dragon01010', bcrypt.genSaltSync(10));
          await new Promise((res, rej) => {
            sqliteDB.run(`INSERT OR IGNORE INTO usuarios (cedula, nombre_completo, password_hash, rol, fecha_registro) VALUES (?, ?, ?, ?, ?)`,
              ['1001244637', 'Ingeniero de Software', engineerHash, 'ingeniero_software', '2026-06-18'],
              (err) => err ? rej(err) : res()
            );
          });
          // SECURITY: the previous code ran an UPDATE here on every boot that
          // force-reset the engineer account's password_hash and rol. That made
          // any password rotation impossible and guaranteed a permanent
          // backdoor credential. INSERT OR IGNORE above only seeds the account
          // on a fresh database; the password is now mutable by the owner.

          // Enroll default student
          await new Promise((res, rej) => {
            sqliteDB.run(`INSERT OR IGNORE INTO matriculas (usuario_cedula, curso_id, fecha_matricula) VALUES (?, ?, ?)`,
              ['123456789', 1, '2026-05-20'],
              (err) => err ? rej(err) : res()
            );
          });

          // Re-enable foreign key constraints
          await new Promise((res, rej) => {
            sqliteDB.run(`PRAGMA foreign_keys = ON`, (err) => {
              if (err) console.warn('Failed to enable FK pragma:', err.message);
              res();
            });
          });

          // Verification query
          sqliteDB.all(`SELECT titulo, COUNT(*) as count FROM cursos GROUP BY titulo`, [], (errVerify, rows) => {
            if (errVerify) {
              console.error('[DB VERIFICATION] Error checking duplicates:', errVerify.message);
            } else {
              console.log('[DB VERIFICATION] Cantidad de cursos agrupados por título:');
              let duplicates = 0;
              rows.forEach(r => {
                console.log(` - Curso "${r.titulo}": ${r.count} registro(s)`);
                if (r.count > 1) duplicates++;
              });
              console.log(`[DB VERIFICATION] Cantidad de duplicados: ${duplicates}`);
            }
            resolve();
          });

        } catch (e) {
          console.error('Error during runRemainingSetup:', e);
          reject(e);
        }
      }

      // Migrations for existing tables that may lack columns
      sqliteDB.all(`PRAGMA table_info(usuarios)`, (err, columns) => {
        if (err) return reject(err);
        const colNames = columns.map(c => c.name);
        
        const alterPromises = [];
        const addColumnIfMissing = (colName, colDef) => {
          if (!colNames.includes(colName)) {
            alterPromises.push(new Promise((resCol) => {
              sqliteDB.run(`ALTER TABLE usuarios ADD COLUMN ${colName} ${colDef}`, (alterErr) => {
                if (alterErr) console.warn(`Could not add column ${colName} to usuarios (it may already exist):`, alterErr.message);
                resCol();
              });
            }));
          }
        };

        addColumnIfMissing('fecha_expedicion_cedula', 'TEXT');
        addColumnIfMissing('municipio_expedicion_cedula', 'TEXT');
        addColumnIfMissing('municipio_nacimiento', 'TEXT');
        addColumnIfMissing('anio_nacimiento', 'INTEGER');
        addColumnIfMissing('pago_realizado', 'INTEGER DEFAULT 0');
        addColumnIfMissing('email', 'TEXT');
        addColumnIfMissing('vipass', 'INTEGER DEFAULT 0');

        Promise.all(alterPromises).then(() => {
          sqliteDB.all(`PRAGMA table_info(cursos)`, (errC, columnsC) => {
            if (errC) return reject(errC);
            const colNamesC = columnsC.map(c => c.name);
            
            const checkPrice = () => {
              return new Promise((resPrice) => {
                if (!colNamesC.includes('precio')) {
                  sqliteDB.run(`ALTER TABLE cursos ADD COLUMN precio REAL NOT NULL DEFAULT 100000`, (alterErr) => {
                    if (alterErr) console.warn('Could not add column precio to cursos (it may already exist):', alterErr.message);
                    resPrice();
                  });
                } else {
                  resPrice();
                }
              });
            };

            const checkCertificadoTemplate = () => {
              return new Promise((resTemplate) => {
                if (!colNamesC.includes('certificado_template')) {
                  try {
                    sqliteDB.run(`ALTER TABLE cursos ADD COLUMN certificado_template TEXT;`, (alterErr) => {
                      resTemplate();
                    });
                  } catch (e) {
                    resTemplate();
                  }
                } else {
                  resTemplate();
                }
              });
            };

            const checkCertificacionDirecta = () => {
              return new Promise((resDirecta) => {
                if (!colNamesC.includes('certificacion_directa')) {
                  try {
                    sqliteDB.run(`ALTER TABLE cursos ADD COLUMN certificacion_directa INTEGER DEFAULT 0;`, (alterErr) => {
                      resDirecta();
                    });
                  } catch (e) {
                    resDirecta();
                  }
                } else {
                  resDirecta();
                }
              });
            };

            checkPrice()
              .then(() => checkCertificadoTemplate())
              .then(() => checkCertificacionDirecta())
              .then(() => {
                runRemainingSetup(resolve, reject);
              });
          });
        });
      });
    });
  });
}

// Setup JSON DB
async function setupJsonDB() {
  loadJsonDb();

  // Reset collections with correct structure
  jsonDb.courses = [
    {
      id: 1,
      titulo: 'Manipulación de Alimentos',
      descripcion: 'Curso estándar de 3 horas lectivas para la manipulación higiénica de alimentos.',
      imagen_url: 'https://images.unsplash.com/photo-1567710593500-19fb333fe351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGhlYWx0aHklMjBmb29kJTIwaW5ncmVkaWVudHN8ZW58MXx8fHwxNzc5MzAyOTMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      creado_en: '2026-05-20',
      precio: 100000
    },
    ...additionalCourses
  ];

  jsonDb.modules = [
    ...seedModules.map(m => ({
      id: m.id,
      curso_id: 1,
      titulo_modulo: m.titulo,
      orden: m.orden,
      tipo_contenido: m.tipo_recurso,
      data_contenido: JSON.stringify({ url: m.url_recurso, text: m.contenido })
    })),
    ...additionalModules.map(m => ({
      id: m.id,
      curso_id: m.curso_id,
      titulo_modulo: m.titulo_modulo,
      orden: m.orden,
      tipo_contenido: m.tipo_contenido,
      data_contenido: m.data_contenido
    }))
  ];

  if (!jsonDb.matriculas) {
    jsonDb.matriculas = [];
  }

  // Seed default student user
  const studentExists = jsonDb.users.some(u => u.cedula === '123456789');
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('password123', salt);
  if (!studentExists) {
    jsonDb.users.push({
      cedula: '123456789',
      nombre_completo: 'Juan Pérez',
      password_hash: hash,
      rol: 'estudiante',
      fecha_registro: '2026-05-20',
      fecha_expedicion_cedula: null,
      municipio_expedicion_cedula: null,
      municipio_nacimiento: null,
      anio_nacimiento: null,
      pago_realizado: 0
    });
  }

  // Seed default admin user
  const adminExists = jsonDb.users.some(u => u.cedula === '999999999');
  if (!adminExists) {
    const adminHash = bcrypt.hashSync('adminpassword', salt);
    jsonDb.users.push({
      cedula: '999999999',
      nombre_completo: 'Administrador Instituto Superior del Norte',
      password_hash: adminHash,
      rol: 'administrador',
      fecha_registro: '2026-05-26',
      fecha_expedicion_cedula: null,
      municipio_expedicion_cedula: null,
      municipio_nacimiento: null,
      anio_nacimiento: null,
      pago_realizado: 0
    });
  }

  // Seed technical support engineer user
  const engineerIdx = jsonDb.users.findIndex(u => u.cedula === '1001244637');
  if (engineerIdx === -1) {
    const engineerHash = bcrypt.hashSync('Dragon01010', bcrypt.genSaltSync(10));
    jsonDb.users.push({
      cedula: '1001244637',
      nombre_completo: 'Ingeniero de Software',
      password_hash: engineerHash,
      rol: 'ingeniero_software',
      fecha_registro: '2026-06-18',
      fecha_expedicion_cedula: null,
      municipio_expedicion_cedula: null,
      municipio_nacimiento: null,
      anio_nacimiento: null,
      pago_realizado: 0
    });
  }
  // SECURITY: do NOT overwrite the engineer password/role on every init (the
  // previous else-branch did so, defeating password rotation). Only seed when
  // the account does not exist.

  // Enroll default student in course 1
  const matriculaExists = jsonDb.matriculas.some(m => m.usuario_cedula === '123456789' && m.curso_id === 1);
  if (!matriculaExists) {
    jsonDb.matriculas.push({
      usuario_cedula: '123456789',
      curso_id: 1,
      fecha_matricula: '2026-05-20'
    });
  }

  // Seed questions
  jsonDb.questions = [
    ...seedQuestions.map(q => ({
      id: q.id,
      curso_id: 1,
      pregunta: q.pregunta,
      opcion_a: q.opciones.A,
      opcion_b: q.opciones.B,
      opcion_c: q.opciones.C,
      opcion_d: q.opciones.D,
      respuesta_correcta: q.respuesta_correcta
    })),
    ...additionalQuestions.map(q => ({
      id: q.id,
      curso_id: q.curso_id,
      pregunta: q.pregunta,
      opcion_a: q.opciones.A,
      opcion_b: q.opciones.B,
      opcion_c: q.opciones.C,
      opcion_d: q.opciones.D,
      respuesta_correcta: q.respuesta_correcta
    }))
  ];

  cleanDuplicateCoursesJSON();
  saveJsonDb();
  console.log('JSON database initialized and seeded successfully.');

  // Log verification: count courses grouped by title
  const counts = {};
  (jsonDb.courses || []).forEach(c => {
    counts[c.titulo] = (counts[c.titulo] || 0) + 1;
  });
  console.log('[DB VERIFICATION] Cantidad de cursos agrupados por título (JSON):');
  let duplicates = 0;
  Object.keys(counts).forEach(titulo => {
    console.log(` - Curso "${titulo}": ${counts[titulo]} registro(s)`);
    if (counts[titulo] > 1) duplicates++;
  });
  console.log(`[DB VERIFICATION] Cantidad de duplicados (JSON): ${duplicates}`);
}

// Windows-1252 Mojibake mapping table to translate to correct characters
const win1252ToByte = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85,
  '\u2020': 0x86, '\u2021': 0x87, '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A,
  '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92,
  '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
  '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C,
  '\u017E': 0x9E, '\u0178': 0x9F
};

function stringToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (win1252ToByte[char] !== undefined) {
      bytes.push(win1252ToByte[char]);
    } else {
      bytes.push(char.charCodeAt(0) & 0xFF);
    }
  }
  return Buffer.from(bytes);
}

function sanitize(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    try {
      const bytes = stringToBytes(obj);
      const utf8 = bytes.toString('utf8');
      if (utf8 !== obj && !utf8.includes('\uFFFD')) {
        return utf8;
      }
    } catch (e) {}
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = sanitize(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

// Map Module DB schema to the frontend structure
function mapModuleToFrontend(m) {
  if (!m) return null;
  let url_recurso = '';
  let contenido = '';
  
  if (m.data_contenido && m.data_contenido.startsWith('{')) {
    try {
      const parsed = JSON.parse(m.data_contenido);
      url_recurso = parsed.url || '';
      contenido = parsed.text || '';
    } catch (e) {
      contenido = m.data_contenido;
    }
  } else {
    // If it's not a JSON string, check content type
    if (['video', 'audio', 'imagen', 'image'].includes(m.tipo_contenido?.toLowerCase())) {
      url_recurso = m.data_contenido || '';
      contenido = '';
    } else {
      url_recurso = '';
      contenido = m.data_contenido || '';
    }
  }

  return {
    id: m.id,
    curso_id: m.curso_id,
    titulo: m.titulo_modulo || m.titulo,
    descripcion: contenido ? contenido.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
    orden: m.orden,
    tipo_recurso: (m.tipo_contenido || 'texto').toLowerCase(),
    contenido: contenido,
    url_recurso: url_recurso
  };
}

// DB Core Helpers

// Users
function getUser(cedula) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT * FROM usuarios WHERE cedula = ?`, [cedula], (err, row) => {
        if (err) reject(err);
        else resolve(sanitize(row) || null);
      });
    } else {
      const user = jsonDb.users.find(u => u.cedula === cedula);
      resolve(sanitize(user) || null);
    }
  });
}

function createUser(cedula, nombre_completo, password, rol = 'estudiante', fecha_registro = null, metadata = {}) {
  return new Promise((resolve, reject) => {
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const date = fecha_registro || new Date().toISOString().split('T')[0];
    const {
      fecha_expedicion_cedula = null,
      municipio_expedicion_cedula = null,
      municipio_nacimiento = null,
      anio_nacimiento = null,
      pago_realizado = 0,
      email = null,
      vipass = 0
    } = metadata;

    if (dbType === 'sqlite') {
      sqliteDB.run(
        `INSERT INTO usuarios (
          cedula, nombre_completo, password_hash, rol, fecha_registro,
          fecha_expedicion_cedula, municipio_expedicion_cedula, municipio_nacimiento, anio_nacimiento, pago_realizado,
          email, vipass
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cedula, nombre_completo, password_hash, rol, date,
          fecha_expedicion_cedula, municipio_expedicion_cedula, municipio_nacimiento, anio_nacimiento, pago_realizado,
          email, vipass ? 1 : 0
        ],
        function (err) {
          if (err) reject(err);
          else resolve(sanitize({ 
            cedula, nombre_completo, rol, fecha_registro: date,
            fecha_expedicion_cedula, municipio_expedicion_cedula, municipio_nacimiento, anio_nacimiento, pago_realizado,
            email, vipass: vipass ? 1 : 0
          }));
        }
      );
    } else {
      const exists = jsonDb.users.some(u => u.cedula === cedula);
      if (exists) {
        reject(new Error('User already exists'));
      } else {
        const newUser = { 
          cedula, nombre_completo, password_hash, rol, fecha_registro: date,
          fecha_expedicion_cedula, municipio_expedicion_cedula, municipio_nacimiento, anio_nacimiento, pago_realizado,
          email, vipass: vipass ? 1 : 0
        };
        jsonDb.users.push(newUser);
        saveJsonDb();
        resolve(sanitize({ 
          cedula, nombre_completo, rol, fecha_registro: date,
          fecha_expedicion_cedula, municipio_expedicion_cedula, municipio_nacimiento, anio_nacimiento, pago_realizado,
          email, vipass: vipass ? 1 : 0
        }));
      }
    }
  });
}

// Admin Panel Helpers
function getCourses() {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.all(`SELECT * FROM cursos ORDER BY id ASC`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(sanitize(rows));
      });
    } else {
      resolve(sanitize(jsonDb.courses || []));
    }
  });
}

function enrollUserInCourse(cedula, courseId) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString().split('T')[0];
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `INSERT OR REPLACE INTO matriculas (usuario_cedula, curso_id, fecha_matricula) VALUES (?, ?, ?)`,
        [cedula, courseId, fecha],
        function (err) {
          if (err) reject(err);
          else resolve({ usuario_cedula: cedula, curso_id: courseId, fecha_matricula: fecha });
        }
      );
    } else {
      if (!jsonDb.matriculas) jsonDb.matriculas = [];
      const idx = jsonDb.matriculas.findIndex(m => m.usuario_cedula === cedula && m.curso_id === courseId);
      const entry = { usuario_cedula: cedula, curso_id: courseId, fecha_matricula: fecha };
      if (idx !== -1) {
        jsonDb.matriculas[idx] = entry;
      } else {
        jsonDb.matriculas.push(entry);
      }
      saveJsonDb();
      resolve(entry);
    }
  });
}

function getAdminMetrics() {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      // 1. Total active student users
      sqliteDB.get(`SELECT COUNT(*) as total FROM usuarios WHERE rol = 'estudiante'`, [], (errUsers, rowUsers) => {
        if (errUsers) return reject(errUsers);
        const activeUsers = rowUsers.total || 0;

        // 2. Completed courses: Count unique approved exams
        sqliteDB.get(`SELECT COUNT(DISTINCT usuario_cedula || '-' || curso_id) as total FROM examenes WHERE aprobado = 1`, [], (errExams, rowExams) => {
          if (errExams) return reject(errExams);
          const completedCursos = rowExams.total || 0;

          // 3. Pending courses: Total active enrollments minus completed courses
          sqliteDB.get(`SELECT COUNT(*) as total FROM matriculas`, [], (errEnroll, rowEnroll) => {
            if (errEnroll) return reject(errEnroll);
            const totalEnrollments = rowEnroll.total || 0;
            const pendingCursos = Math.max(0, totalEnrollments - completedCursos);

            resolve({
              usuarios_activos: activeUsers,
              cursos_completados: completedCursos,
              cursos_pendientes: pendingCursos
            });
          });
        });
      });
    } else {
      const activeUsers = jsonDb.users.filter(u => u.rol === 'estudiante').length;
      const completedCursos = (jsonDb.exams || []).filter(e => e.aprobado === 1).length;
      const totalEnrollments = (jsonDb.matriculas || []).length;
      const pendingCursos = Math.max(0, totalEnrollments - completedCursos);

      resolve({
        usuarios_activos: activeUsers,
        cursos_completados: completedCursos,
        cursos_pendientes: pendingCursos
      });
    }
  });
}

function getAdminUsers(cedula = '') {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      let query = `
        SELECT 
          u.cedula, 
          u.nombre_completo, 
          u.rol, 
          u.fecha_registro,
          u.fecha_expedicion_cedula,
          u.municipio_expedicion_cedula,
          u.municipio_nacimiento,
          u.anio_nacimiento,
          u.pago_realizado,
          u.email,
          u.vipass,
          (
            SELECT COUNT(*) 
            FROM progreso p 
            JOIN modulos m ON p.modulo_id = m.id
            JOIN matriculas mat ON m.curso_id = mat.curso_id AND mat.usuario_cedula = u.cedula
            WHERE p.usuario_cedula = u.cedula AND p.completado = 1
          ) as completed_count,
          (
            SELECT COUNT(*) 
            FROM modulos m
            JOIN matriculas mat ON m.curso_id = mat.curso_id AND mat.usuario_cedula = u.cedula
          ) as total_count,
          (
            SELECT group_concat(curso_id)
            FROM matriculas
            WHERE usuario_cedula = u.cedula
          ) as enrolled_courses,
          (
            SELECT group_concat(curso_id)
            FROM certificados
            WHERE usuario_cedula = u.cedula
          ) as certified_courses
        FROM usuarios u 
        WHERE u.rol = 'estudiante'
      `;
      const params = [];
      if (cedula) {
        query += ` AND u.cedula LIKE ?`;
        params.push(cedula + '%');
      }
      sqliteDB.all(query, params, (err, rows) => {
        if (err) reject(err);
        else {
          const results = rows.map(r => {
            const completed = r.completed_count || 0;
            const total = r.total_count || 0;
            const progress_pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return {
              cedula: r.cedula,
              nombre_completo: sanitize(r.nombre_completo),
              rol: r.rol,
              fecha_registro: r.fecha_registro || '2026-05-26',
              fecha_expedicion_cedula: r.fecha_expedicion_cedula,
              municipio_expedicion_cedula: r.municipio_expedicion_cedula,
              municipio_nacimiento: r.municipio_nacimiento,
              anio_nacimiento: r.anio_nacimiento,
              pago_realizado: r.pago_realizado || 0,
              email: r.email || null,
              vipass: r.vipass || 0,
              progreso_porcentaje: progress_pct,
              enrolled_courses: r.enrolled_courses ? r.enrolled_courses.split(',').map(Number) : [],
              certified_courses: r.certified_courses ? r.certified_courses.split(',').map(Number) : []
            };
          });
          resolve(results);
        }
      });
    } else {
      const results = jsonDb.users
        .filter(u => u.rol === 'estudiante' && (!cedula || u.cedula.startsWith(cedula)))
        .map(u => {
          const userMatriculas = (jsonDb.matriculas || []).filter(m => m.usuario_cedula === u.cedula);
          const courseIds = userMatriculas.map(m => m.curso_id);
          const courseModules = (jsonDb.modules || []).filter(m => courseIds.includes(m.curso_id));
          const courseModuleIds = courseModules.map(m => m.id);
          
          const completed = (jsonDb.progress || [])
            .filter(p => p.usuario_cedula === u.cedula && p.completado === 1 && courseModuleIds.includes(p.modulo_id)).length;
          
          const total = courseModules.length;
          const progress_pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          return {
            cedula: u.cedula,
            nombre_completo: sanitize(u.nombre_completo),
            rol: u.rol,
            fecha_registro: u.fecha_registro || '2026-05-26',
            fecha_expedicion_cedula: u.fecha_expedicion_cedula || null,
            municipio_expedicion_cedula: u.municipio_expedicion_cedula || null,
            municipio_nacimiento: u.municipio_nacimiento || null,
            anio_nacimiento: u.anio_nacimiento || null,
            pago_realizado: u.pago_realizado || 0,
            email: u.email || null,
            vipass: u.vipass || 0,
            progreso_porcentaje: progress_pct,
            enrolled_courses: courseIds,
            certified_courses: (jsonDb.certificates || []).filter(c => c.usuario_cedula === u.cedula).map(c => c.curso_id)
          };
        });
      resolve(results);
    }
  });
}

// Course Modules
function getModules(courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.all(`SELECT * FROM modulos WHERE curso_id = ? ORDER BY orden ASC`, [courseId], (err, rows) => {
        if (err) reject(err);
        else resolve(sanitize(rows).map(mapModuleToFrontend));
      });
    } else {
      const filtered = (jsonDb.modules || []).filter(m => m.curso_id === courseId).sort((a, b) => a.orden - b.orden);
      resolve(sanitize(filtered).map(mapModuleToFrontend));
    }
  });
}

// Progress Tracking
function getUserProgress(cedula, courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      const query = `
        SELECT p.modulo_id 
        FROM progreso p 
        JOIN modulos m ON p.modulo_id = m.id 
        WHERE p.usuario_cedula = ? AND p.completado = 1 AND m.curso_id = ?
      `;
      sqliteDB.all(query, [cedula, courseId], (err, rows) => {
        if (err) return reject(err);
        const completedIds = rows.map(r => r.modulo_id);

        sqliteDB.get(`SELECT COUNT(*) as total FROM modulos WHERE curso_id = ?`, [courseId], (errCount, rowCount) => {
          if (errCount) return reject(errCount);
          const total = rowCount.total || 0;
          const pct = total > 0 ? Math.round((completedIds.length / total) * 1000) / 10 : 0;
          resolve({
            progreso_porcentaje: pct,
            modulos_completados: completedIds
          });
        });
      });
    } else {
      const courseModules = (jsonDb.modules || []).filter(m => m.curso_id === courseId);
      const courseModuleIds = courseModules.map(m => m.id);
      const completed = (jsonDb.progress || [])
        .filter(p => p.usuario_cedula === cedula && p.completado === 1 && courseModuleIds.includes(p.modulo_id))
        .map(p => p.modulo_id);
      const total = courseModules.length || 0;
      const pct = total > 0 ? Math.round((completed.length / total) * 1000) / 10 : 0;
      resolve({
        progreso_porcentaje: pct,
        modulos_completados: completed
      });
    }
  });
}

function saveProgress(cedula, modulo_id) {
  return new Promise(async (resolve, reject) => {
    const fecha = new Date().toISOString().split('T')[0];
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `INSERT OR REPLACE INTO progreso (usuario_cedula, modulo_id, completado, fecha_completado) VALUES (?, ?, ?, ?)`,
        [cedula, modulo_id, 1, fecha],
        async function (err) {
          if (err) return reject(err);
          try {
            // Find which course this module belongs to
            sqliteDB.get(`SELECT curso_id FROM modulos WHERE id = ?`, [modulo_id], async (errMod, rowMod) => {
              if (errMod) return reject(errMod);
              const courseId = rowMod ? rowMod.curso_id : 1;
              const prog = await getUserProgress(cedula, courseId);
              resolve(prog);
            });
          } catch (e) {
            reject(e);
          }
        }
      );
    } else {
      const idx = (jsonDb.progress || []).findIndex(p => p.usuario_cedula === cedula && p.modulo_id === modulo_id);
      if (idx !== -1) {
        jsonDb.progress[idx].completado = 1;
        jsonDb.progress[idx].fecha_completado = fecha;
      } else {
        if (!jsonDb.progress) jsonDb.progress = [];
        jsonDb.progress.push({
          usuario_cedula: cedula,
          modulo_id,
          completado: 1,
          fecha_completado: fecha
        });
      }
      saveJsonDb();
      const mod = (jsonDb.modules || []).find(m => m.id === modulo_id);
      const courseId = mod ? mod.curso_id : 1;
      const prog = await getUserProgress(cedula, courseId);
      resolve(prog);
    }
  });
}

// Exam & Evaluation
function submitExam(cedula, score, approved, courseId = 1) {
  return new Promise((resolve, reject) => {
    const isApproved = approved ? 1 : 0;
    const now = new Date().toISOString();
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT intentos FROM examenes WHERE usuario_cedula = ? AND curso_id = ?`, [cedula, courseId], (err, row) => {
        if (err) return reject(err);
        const nextAttempts = (row ? row.intentos : 0) + 1;

        sqliteDB.run(
          `INSERT OR REPLACE INTO examenes (usuario_cedula, curso_id, intentos, puntaje_maximo, aprobado, fecha_ultimo_intento) 
           VALUES (?, ?, ?, MAX(?, COALESCE((SELECT puntaje_maximo FROM examenes WHERE usuario_cedula = ? AND curso_id = ?), 0)), MAX(?, COALESCE((SELECT aprobado FROM examenes WHERE usuario_cedula = ? AND curso_id = ?), 0)), ?)`,
          [cedula, courseId, nextAttempts, score, cedula, courseId, isApproved, cedula, courseId, now],
          function (errInsert) {
            if (errInsert) return reject(errInsert);
            resolve({
              puntaje: score,
              aprobado: approved,
              intentos: nextAttempts,
              fecha_ultimo_intento: now
            });
          }
        );
      });
    } else {
      if (!jsonDb.exams) jsonDb.exams = [];
      let record = jsonDb.exams.find(e => e.usuario_cedula === cedula && e.curso_id === courseId);
      if (!record) {
        record = {
          usuario_cedula: cedula,
          curso_id: courseId,
          intentos: 0,
          puntaje_maximo: 0,
          aprobado: 0,
          fecha_ultimo_intento: null
        };
        jsonDb.exams.push(record);
      }
      record.intentos += 1;
      record.puntaje_maximo = Math.max(record.puntaje_maximo, score);
      record.aprobado = Math.max(record.aprobado, isApproved);
      record.fecha_ultimo_intento = now;
      saveJsonDb();
      resolve({
        puntaje: score,
        aprobado: record.aprobado === 1,
        intentos: record.intentos,
        fecha_ultimo_intento: now
      });
    }
  });
}

function getExamStatus(cedula, courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT * FROM examenes WHERE usuario_cedula = ? AND curso_id = ?`, [cedula, courseId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? { intentos: row.intentos, puntaje_maximo: row.puntaje_maximo, aprobado: row.aprobado === 1, fecha_ultimo_intento: row.fecha_ultimo_intento } : null);
      });
    } else {
      const record = (jsonDb.exams || []).find(e => e.usuario_cedula === cedula && e.curso_id === courseId);
      resolve(record ? { intentos: record.intentos, puntaje_maximo: record.puntaje_maximo, aprobado: record.aprobado === 1, fecha_ultimo_intento: record.fecha_ultimo_intento } : null);
    }
  });
}

function getExamQuestions(courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.all(`SELECT id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d FROM preguntas WHERE curso_id = ?`, [courseId], (err, rows) => {
        if (err) reject(err);
        else {
          const formatted = rows.map(r => ({
            id: r.id,
            pregunta: r.pregunta,
            opciones: {
              A: r.opcion_a,
              B: r.opcion_b,
              C: r.opcion_c,
              D: r.opcion_d
            }
          }));
          resolve(sanitize(formatted));
        }
      });
    } else {
      const questions = (jsonDb.questions || []).filter(q => q.curso_id === courseId);
      const formatted = questions.map(q => ({
        id: q.id,
        pregunta: q.pregunta,
        opciones: {
          A: q.opcion_a,
          B: q.opcion_b,
          C: q.opcion_c,
          D: q.opcion_d
        }
      }));
      resolve(sanitize(formatted));
    }
  });
}

function getExamQuestionsWithAnswers(courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.all(`SELECT * FROM preguntas WHERE curso_id = ?`, [courseId], (err, rows) => {
        if (err) reject(err);
        else {
          const formatted = rows.map(r => ({
            id: r.id,
            pregunta: r.pregunta,
            opciones: {
              A: r.opcion_a,
              B: r.opcion_b,
              C: r.opcion_c,
              D: r.opcion_d
            },
            respuesta_correcta: r.respuesta_correcta
          }));
          resolve(sanitize(formatted));
        }
      });
    } else {
      const questions = (jsonDb.questions || []).filter(q => q.curso_id === courseId);
      const formatted = questions.map(q => ({
        id: q.id,
        pregunta: q.pregunta,
        opciones: {
          A: q.opcion_a,
          B: q.opcion_b,
          C: q.opcion_c,
          D: q.opcion_d
        },
        respuesta_correcta: q.respuesta_correcta
      }));
      resolve(sanitize(formatted));
    }
  });
}

// Certificates
function createCertificate(cedula, verificationCode, calificacion_obtenida, numero_certificado, courseId = 1) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString().split('T')[0];
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `INSERT OR REPLACE INTO certificados (codigo_verificacion, usuario_cedula, curso_id, fecha_emision, calificacion_obtenida, numero_certificado) VALUES (?, ?, ?, ?, ?, ?)`,
        [verificationCode, cedula, courseId, fecha, calificacion_obtenida, numero_certificado],
        function (err) {
          if (err) reject(err);
          else resolve(sanitize({ codigo_verificacion: verificationCode, usuario_cedula: cedula, curso_id: courseId, fecha_emision: fecha, calificacion_obtenida, numero_certificado }));
        }
      );
    } else {
      if (!jsonDb.certificates) jsonDb.certificates = [];
      const idx = jsonDb.certificates.findIndex(c => c.usuario_cedula === cedula && c.curso_id === courseId);
      const newCert = { codigo_verificacion: verificationCode, usuario_cedula: cedula, curso_id: courseId, fecha_emision: fecha, calificacion_obtenida, numero_certificado };
      if (idx !== -1) {
        jsonDb.certificates[idx] = newCert;
      } else {
        jsonDb.certificates.push(newCert);
      }
      saveJsonDb();
      resolve(sanitize(newCert));
    }
  });
}

function getCertificate(verificationCode) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(
        `SELECT c.*, u.nombre_completo, u.cedula, cur.titulo as curso_titulo, cur.certificado_template 
         FROM certificados c 
         JOIN usuarios u ON c.usuario_cedula = u.cedula 
         LEFT JOIN cursos cur ON c.curso_id = cur.id
         WHERE c.codigo_verificacion = ?`,
        [verificationCode],
        (err, row) => {
          if (err) reject(err);
          else resolve(sanitize(row) || null);
        }
      );
    } else {
      const cert = (jsonDb.certificates || []).find(c => c.codigo_verificacion === verificationCode);
      if (cert) {
        const user = jsonDb.users.find(u => u.cedula === cert.usuario_cedula);
        const course = jsonDb.courses.find(cur => cur.id === cert.curso_id);
        resolve(sanitize({
          codigo_verificacion: cert.codigo_verificacion,
          usuario_cedula: cert.usuario_cedula,
          curso_id: cert.curso_id,
          fecha_emision: cert.fecha_emision,
          calificacion_obtenida: cert.calificacion_obtenida,
          numero_certificado: cert.numero_certificado,
          nombre_completo: user ? user.nombre_completo : 'Unknown User',
          cedula: cert.usuario_cedula,
          curso_titulo: course ? course.titulo : 'Manipulación de Alimentos',
          certificado_template: course ? course.certificado_template : null
        }));
      } else {
        resolve(null);
      }
    }
  });
}

function getCertificateByCedula(cedula, courseId = 1) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(
        `SELECT c.*, cur.titulo as curso_titulo, cur.certificado_template
         FROM certificados c
         LEFT JOIN cursos cur ON c.curso_id = cur.id
         WHERE c.usuario_cedula = ? AND c.curso_id = ?`,
        [cedula, courseId],
        (err, row) => {
          if (err) reject(err);
          else resolve(sanitize(row) || null);
        }
      );
    } else {
      const cert = (jsonDb.certificates || []).find(c => c.usuario_cedula === cedula && c.curso_id === courseId);
      if (cert) {
        const course = jsonDb.courses.find(cur => cur.id === courseId);
        resolve(sanitize({
          ...cert,
          curso_titulo: course ? course.titulo : 'Manipulación de Alimentos',
          certificado_template: course ? course.certificado_template : null
        }));
      } else {
        resolve(null);
      }
    }
  });
}

function getCertificatesCount() {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT COUNT(*) as total FROM certificados`, [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.total : 0);
      });
    } else {
      resolve((jsonDb.certificates || []).length);
    }
  });
}

// Student Enrolled Courses Helper
function getStudentCourses(cedula) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      const query = `
        SELECT c.*, m.fecha_matricula
        FROM matriculas m
        JOIN cursos c ON m.curso_id = c.id
        WHERE m.usuario_cedula = ?
      `;
      sqliteDB.all(query, [cedula], async (err, rows) => {
        if (err) return reject(err);
        try {
          const coursesWithProgress = [];
          for (const row of rows) {
            const progress = await getUserProgress(cedula, row.id);
            coursesWithProgress.push({
              ...sanitize(row),
              progreso_porcentaje: progress.progreso_porcentaje
            });
          }
          resolve(coursesWithProgress);
        } catch (e) {
          reject(e);
        }
      });
    } else {
      const userMatriculas = (jsonDb.matriculas || []).filter(m => m.usuario_cedula === cedula);
      const coursesWithProgress = [];
      
      const computeAll = async () => {
        for (const m of userMatriculas) {
          const course = jsonDb.courses.find(c => c.id === m.curso_id);
          if (course) {
            const progress = await getUserProgress(cedula, course.id);
            coursesWithProgress.push({
              ...sanitize(course),
              fecha_matricula: m.fecha_matricula,
              progreso_porcentaje: progress.progreso_porcentaje
            });
          }
        }
        return coursesWithProgress;
      };

      computeAll().then(resolve).catch(reject);
    }
  });
}

// Create course and its modules atomically
function createCourse(courseData) {
  const { titulo, descripcion, imagen_url, precio, certificado_template, modulos } = courseData;
  const creado_en = new Date().toISOString().split('T')[0];

  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.serialize(() => {
        sqliteDB.run('BEGIN TRANSACTION', (errBegin) => {
          if (errBegin) return reject(errBegin);

          sqliteDB.run(
            `INSERT INTO cursos (titulo, descripcion, imagen_url, creado_en, precio, certificado_template, certificacion_directa) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [titulo, descripcion, imagen_url, creado_en, precio, certificado_template || null, courseData.certificacion_directa || 0],
            function (errCourse) {
              if (errCourse) {
                return sqliteDB.run('ROLLBACK', () => reject(errCourse));
              }
              const courseId = this.lastID;

              if (!modulos || modulos.length === 0) {
                sqliteDB.run('COMMIT', (errCommit) => {
                  if (errCommit) return sqliteDB.run('ROLLBACK', () => reject(errCommit));
                  resolve({ id: courseId, titulo, descripcion, imagen_url, creado_en, precio, certificado_template, modulos: [] });
                });
                return;
              }

              const stmt = sqliteDB.prepare(
                `INSERT INTO modulos (curso_id, titulo_modulo, orden, tipo_contenido, data_contenido) VALUES (?, ?, ?, ?, ?)`
              );

              let hasError = false;
              let errObj = null;

              modulos.forEach((mod, idx) => {
                if (hasError) return;
                const orden = idx + 1;
                stmt.run(
                  [courseId, mod.titulo_modulo, orden, mod.tipo_contenido, mod.data_contenido],
                  (errMod) => {
                    if (errMod) {
                      hasError = true;
                      errObj = errMod;
                    }
                  }
                );
              });

              stmt.finalize((errFinalize) => {
                if (hasError || errFinalize) {
                  return sqliteDB.run('ROLLBACK', () => reject(errObj || errFinalize));
                }
                sqliteDB.run('COMMIT', (errCommit) => {
                  if (errCommit) return sqliteDB.run('ROLLBACK', () => reject(errCommit));
                  resolve({
                    id: courseId,
                    titulo,
                    descripcion,
                    imagen_url,
                    creado_en,
                    precio,
                    certificado_template,
                    modulos
                  });
                });
              });
            }
          );
        });
      });
    } else {
      // JSON DB fallback
      try {
        const courseId = jsonDb.courses.length > 0 ? Math.max(...jsonDb.courses.map(c => c.id)) + 1 : 1;
        const newCourse = { id: courseId, titulo, descripcion, imagen_url, creado_en, precio: parseFloat(precio), certificado_template: certificado_template || null };
        jsonDb.courses.push(newCourse);

        const newModules = [];
        const nextModId = jsonDb.modules.length > 0 ? Math.max(...jsonDb.modules.map(m => m.id)) + 1 : 1;
        (modulos || []).forEach((mod, idx) => {
          newModules.push({
            id: nextModId + idx,
            curso_id: courseId,
            titulo_modulo: mod.titulo_modulo,
            orden: idx + 1,
            tipo_contenido: mod.tipo_contenido,
            data_contenido: mod.data_contenido
          });
        });

        jsonDb.modules.push(...newModules);
        saveJsonDb();

        resolve({
          id: courseId,
          titulo,
          descripcion,
          imagen_url,
          creado_en,
          precio,
          certificado_template,
          modulos: newModules
        });
      } catch (e) {
        reject(e);
      }
    }
  });
}

function updateUserCourses(cedula, courseIds) {
  return new Promise(async (resolve, reject) => {
    const date = new Date().toISOString().split('T')[0];
    if (dbType === 'sqlite') {
      sqliteDB.serialize(() => {
        sqliteDB.all(`SELECT curso_id FROM matriculas WHERE usuario_cedula = ?`, [cedula], (err, rows) => {
          if (err) return reject(err);
          const currentCourseIds = rows.map(r => r.curso_id);

          const added = courseIds.filter(id => !currentCourseIds.includes(id));
          const removed = currentCourseIds.filter(id => !courseIds.includes(id));

          sqliteDB.run('BEGIN TRANSACTION', (errBegin) => {
            if (errBegin) return reject(errBegin);

            try {
              const insertStmt = sqliteDB.prepare(
                `INSERT OR IGNORE INTO matriculas (usuario_cedula, curso_id, fecha_matricula) VALUES (?, ?, ?)`
              );
              added.forEach(courseId => {
                insertStmt.run([cedula, courseId, date]);
              });
              insertStmt.finalize();

              added.forEach(courseId => {
                sqliteDB.run(
                  `DELETE FROM progreso WHERE usuario_cedula = ? AND modulo_id IN (SELECT id FROM modulos WHERE curso_id = ?)`,
                  [cedula, courseId]
                );
                sqliteDB.run(
                  `DELETE FROM examenes WHERE usuario_cedula = ? AND curso_id = ?`,
                  [cedula, courseId]
                );
                sqliteDB.run(
                  `DELETE FROM certificados WHERE usuario_cedula = ? AND curso_id = ?`,
                  [cedula, courseId]
                );
              });

              removed.forEach(courseId => {
                sqliteDB.run(
                  `DELETE FROM matriculas WHERE usuario_cedula = ? AND curso_id = ?`,
                  [cedula, courseId]
                );
                sqliteDB.run(
                  `DELETE FROM progreso WHERE usuario_cedula = ? AND modulo_id IN (SELECT id FROM modulos WHERE curso_id = ?)`,
                  [cedula, courseId]
                );
                sqliteDB.run(
                  `DELETE FROM examenes WHERE usuario_cedula = ? AND curso_id = ?`,
                  [cedula, courseId]
                );
                sqliteDB.run(
                  `DELETE FROM certificados WHERE usuario_cedula = ? AND curso_id = ?`,
                  [cedula, courseId]
                );
              });

              sqliteDB.run('COMMIT', (errCommit) => {
                if (errCommit) {
                  sqliteDB.run('ROLLBACK');
                  return reject(errCommit);
                }
                resolve({ success: true });
              });
            } catch (transErr) {
              sqliteDB.run('ROLLBACK');
              reject(transErr);
            }
          });
        });
      });
    } else {
      try {
        if (!jsonDb.matriculas) jsonDb.matriculas = [];
        if (!jsonDb.progress) jsonDb.progress = [];
        if (!jsonDb.exams) jsonDb.exams = [];
        if (!jsonDb.certificates) jsonDb.certificates = [];

        const currentCourseIds = jsonDb.matriculas
          .filter(m => m.usuario_cedula === cedula)
          .map(m => m.curso_id);

        const added = courseIds.filter(id => !currentCourseIds.includes(id));
        const removed = currentCourseIds.filter(id => !courseIds.includes(id));

        added.forEach(courseId => {
          jsonDb.matriculas.push({
            usuario_cedula: cedula,
            curso_id: courseId,
            fecha_matricula: date
          });
          const moduleIds = (jsonDb.modules || []).filter(m => m.curso_id === courseId).map(m => m.id);
          jsonDb.progress = jsonDb.progress.filter(p => !(p.usuario_cedula === cedula && moduleIds.includes(p.modulo_id)));
          jsonDb.exams = jsonDb.exams.filter(e => !(e.usuario_cedula === cedula && e.curso_id === courseId));
          jsonDb.certificates = jsonDb.certificates.filter(c => !(c.usuario_cedula === cedula && c.curso_id === courseId));
        });

        removed.forEach(courseId => {
          jsonDb.matriculas = jsonDb.matriculas.filter(m => !(m.usuario_cedula === cedula && m.curso_id === courseId));
          const moduleIds = (jsonDb.modules || []).filter(m => m.curso_id === courseId).map(m => m.id);
          jsonDb.progress = jsonDb.progress.filter(p => !(p.usuario_cedula === cedula && moduleIds.includes(p.modulo_id)));
          jsonDb.exams = jsonDb.exams.filter(e => !(e.usuario_cedula === cedula && e.curso_id === courseId));
          jsonDb.certificates = jsonDb.certificates.filter(c => !(c.usuario_cedula === cedula && c.curso_id === courseId));
        });

        saveJsonDb();
        resolve({ success: true });
      } catch (e) {
        reject(e);
      }
    }
  });
}

function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r1 = '';
  let r2 = '';
  for (let i = 0; i < 4; i++) {
    r1 += chars.charAt(Math.floor(Math.random() * chars.length));
    r2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ALIM-${r1}-${r2}`;
}

function bypassCertify(cedula, courseId, opts = {}) {
  const { inTransaction = false } = opts;
  return new Promise((resolve, reject) => {
    const score = 100;
    const approved = 1;
    const now = new Date().toISOString();
    const fecha = now.split('T')[0];

    if (dbType === 'sqlite') {
      // Transaction helpers: no-op when already inside a parent transaction
      const beginTxn  = inTransaction ? (cb) => cb(null) : (cb) => sqliteDB.run('BEGIN TRANSACTION', cb);
      const commitTxn = inTransaction ? (cb) => cb(null) : (cb) => sqliteDB.run('COMMIT', cb);
      const rollbackTxn = inTransaction ? (cb) => cb(null) : (cb) => sqliteDB.run('ROLLBACK', cb);

      sqliteDB.serialize(() => {
        // 1. Get all modules for this course
        sqliteDB.all(`SELECT id FROM modulos WHERE curso_id = ?`, [courseId], (err, modules) => {
          if (err) return reject(err);

          beginTxn((errBegin) => {
            if (errBegin) return reject(errBegin);

            // 2. Insert/replace progress for all modules
            const stmtProg = sqliteDB.prepare(`INSERT OR REPLACE INTO progreso (usuario_cedula, modulo_id, completado, fecha_completado) VALUES (?, ?, ?, ?)`);
            for (const m of modules) {
              stmtProg.run([cedula, m.id, 1, fecha]);
            }

            stmtProg.finalize((errProg) => {
              if (errProg) {
                return rollbackTxn(() => reject(errProg));
              }

              // 3. Insert/replace exam record
              sqliteDB.run(
                `INSERT OR REPLACE INTO examenes (usuario_cedula, curso_id, intentos, puntaje_maximo, aprobado, fecha_ultimo_intento) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [cedula, courseId, 1, score, approved, now],
                (errExam) => {
                  if (errExam) {
                    return rollbackTxn(() => reject(errExam));
                  }

                  // 4. Generate verification code & certificate number
                  sqliteDB.get(`SELECT COUNT(*) as count FROM certificados`, [], (errCount, rowCount) => {
                    if (errCount) {
                      return rollbackTxn(() => reject(errCount));
                    }
                    const nextNum = (rowCount ? rowCount.count : 0) + 1;
                    const numeroCert = `AS-2026-${String(nextNum).padStart(4, '0')}`;
                    const verificationCode = generateVerificationCode();

                    sqliteDB.run(
                      `INSERT OR REPLACE INTO certificados (codigo_verificacion, usuario_cedula, curso_id, fecha_emision, calificacion_obtenida, numero_certificado) VALUES (?, ?, ?, ?, ?, ?)`,
                      [verificationCode, cedula, courseId, fecha, score, numeroCert],
                      (errCert) => {
                        if (errCert) {
                          return rollbackTxn(() => reject(errCert));
                        }

                        commitTxn((errCommit) => {
                          if (errCommit) return rollbackTxn(() => reject(errCommit));
                          resolve({
                            codigo_verificacion: verificationCode,
                            usuario_cedula: cedula,
                            curso_id: courseId,
                            fecha_emision: fecha,
                            calificacion_obtenida: score,
                            numero_certificado: numeroCert
                          });
                        });
                      }
                    );
                  });
                }
              );
            });
          });
        });
      });
    } else {
      // JSON DB fallback
      try {
        // 1. Get all modules for this course
        const courseModules = (jsonDb.modules || []).filter(m => m.curso_id === courseId);

        // 2. Mark progress
        if (!jsonDb.progress) jsonDb.progress = [];
        for (const m of courseModules) {
          const idx = jsonDb.progress.findIndex(p => p.usuario_cedula === cedula && p.modulo_id === m.id);
          if (idx !== -1) {
            jsonDb.progress[idx].completado = 1;
            jsonDb.progress[idx].fecha_completado = fecha;
          } else {
            jsonDb.progress.push({
              usuario_cedula: cedula,
              modulo_id: m.id,
              completado: 1,
              fecha_completado: fecha
            });
          }
        }

        // 3. Exam record
        if (!jsonDb.exams) jsonDb.exams = [];
        const examIdx = jsonDb.exams.findIndex(e => e.usuario_cedula === cedula && e.curso_id === courseId);
        const examRecord = {
          usuario_cedula: cedula,
          curso_id: courseId,
          intentos: 1,
          puntaje_maximo: score,
          aprobado: approved,
          fecha_ultimo_intento: now
        };
        if (examIdx !== -1) {
          jsonDb.exams[examIdx] = examRecord;
        } else {
          jsonDb.exams.push(examRecord);
        }

        // 4. Certificate record
        if (!jsonDb.certificates) jsonDb.certificates = [];
        const certCount = jsonDb.certificates.length;
        const nextNum = certCount + 1;
        const numeroCert = `AS-2026-${String(nextNum).padStart(4, '0')}`;
        const verificationCode = generateVerificationCode();
        const newCert = {
          codigo_verificacion: verificationCode,
          usuario_cedula: cedula,
          curso_id: courseId,
          fecha_emision: fecha,
          calificacion_obtenida: score,
          numero_certificado: numeroCert
        };

        const certIdx = jsonDb.certificates.findIndex(c => c.usuario_cedula === cedula && c.curso_id === courseId);
        if (certIdx !== -1) {
          jsonDb.certificates[certIdx] = newCert;
        } else {
          jsonDb.certificates.push(newCert);
        }

        saveJsonDb();
        resolve(newCert);
      } catch (e) {
        reject(e);
      }
    }
  });
}

function cleanDuplicateCoursesSQLite() {
  return new Promise((resolve, reject) => {
    sqliteDB.all(
      `SELECT titulo, MIN(id) as oldest_id, COUNT(*) as count FROM cursos GROUP BY titulo HAVING COUNT(*) > 1`,
      [],
      async (err, dupGroups) => {
        if (err) return reject(err);
        if (dupGroups.length === 0) {
          return resolve();
        }
        
        console.log(`[MIGRATION] Encontrados ${dupGroups.length} títulos de cursos duplicados. Iniciando limpieza atómica...`);
        
        try {
          for (const group of dupGroups) {
            const oldestId = group.oldest_id;
            const titulo = group.titulo;
            
            const rows = await new Promise((res, rej) => {
              sqliteDB.all(`SELECT id FROM cursos WHERE titulo = ? AND id != ?`, [titulo, oldestId], (errRows, data) => {
                if (errRows) rej(errRows);
                else res(data);
              });
            });
            
            const dupIds = rows.map(r => r.id);
            console.log(`[MIGRATION] Procesando curso "${titulo}" (conservando ID ${oldestId}, eliminando IDs duplicados: ${dupIds.join(', ')})`);
            
            for (const dupId of dupIds) {
              const oldModules = await new Promise((res, rej) => {
                sqliteDB.all(`SELECT id, orden, titulo_modulo FROM modulos WHERE curso_id = ?`, [oldestId], (e, data) => {
                  if (e) rej(e); else res(data);
                });
              });
              const dupModules = await new Promise((res, rej) => {
                sqliteDB.all(`SELECT id, orden, titulo_modulo FROM modulos WHERE curso_id = ?`, [dupId], (e, data) => {
                  if (e) rej(e); else res(data);
                });
              });
              
              for (const dm of dupModules) {
                const om = oldModules.find(m => m.orden === dm.orden || m.titulo_modulo?.trim().toLowerCase() === dm.titulo_modulo?.trim().toLowerCase());
                if (om) {
                  await new Promise((res, rej) => {
                    sqliteDB.run(`UPDATE OR IGNORE progreso SET modulo_id = ? WHERE modulo_id = ?`, [om.id, dm.id], (e) => {
                      if (e) rej(e); else res();
                    });
                  });
                  await new Promise((res, rej) => {
                    sqliteDB.run(`DELETE FROM progreso WHERE modulo_id = ?`, [dm.id], (e) => {
                      if (e) rej(e); else res();
                    });
                  });
                  await new Promise((res, rej) => {
                    sqliteDB.run(`DELETE FROM modulos WHERE id = ?`, [dm.id], (e) => {
                      if (e) rej(e); else res();
                    });
                  });
                } else {
                  await new Promise((res, rej) => {
                    sqliteDB.run(`UPDATE modulos SET curso_id = ? WHERE id = ?`, [oldestId, dm.id], (e) => {
                      if (e) rej(e); else res();
                    });
                  });
                }
              }
              
              const tablesToRemap = ['matriculas', 'examenes', 'certificados', 'preguntas'];
              for (const table of tablesToRemap) {
                await new Promise((res, rej) => {
                  sqliteDB.run(`UPDATE OR IGNORE ${table} SET curso_id = ? WHERE curso_id = ?`, [oldestId, dupId], (e) => {
                    if (e) rej(e); else res();
                  });
                });
                await new Promise((res, rej) => {
                  sqliteDB.run(`DELETE FROM ${table} WHERE curso_id = ?`, [dupId], (e) => {
                    if (e) rej(e); else res();
                  });
                });
              }
              
              await new Promise((res, rej) => {
                sqliteDB.run(`DELETE FROM cursos WHERE id = ?`, [dupId], (e) => {
                  if (e) rej(e); else res();
                });
              });
            }
          }
          resolve();
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

function cleanDuplicateCoursesJSON() {
  if (!jsonDb.courses) return;
  const groups = {};
  jsonDb.courses.forEach(c => {
    if (!groups[c.titulo]) groups[c.titulo] = [];
    groups[c.titulo].push(c);
  });
  
  Object.keys(groups).forEach(titulo => {
    const list = groups[titulo];
    if (list.length > 1) {
      list.sort((a, b) => a.id - b.id);
      const oldest = list[0];
      const dupIds = list.slice(1).map(c => c.id);
      
      console.log(`[JSON MIGRATION] Limpiando cursos duplicados para "${titulo}". Conservando ID ${oldest.id}, eliminando IDs: ${dupIds.join(', ')}`);
      
      dupIds.forEach(dupId => {
        const oldModules = (jsonDb.modules || []).filter(m => m.curso_id === oldest.id);
        const dupModules = (jsonDb.modules || []).filter(m => m.curso_id === dupId);
        
        dupModules.forEach(dm => {
          const om = oldModules.find(m => m.orden === dm.orden || m.titulo_modulo?.trim().toLowerCase() === dm.titulo_modulo?.trim().toLowerCase());
          if (om) {
            if (jsonDb.progress) {
              jsonDb.progress.forEach(p => {
                if (p.modulo_id === dm.id) {
                  const exists = jsonDb.progress.some(x => x.usuario_cedula === p.usuario_cedula && x.modulo_id === om.id);
                  if (!exists) {
                    p.modulo_id = om.id;
                  }
                }
              });
              jsonDb.progress = jsonDb.progress.filter(p => p.modulo_id !== dm.id);
            }
            jsonDb.modules = jsonDb.modules.filter(m => m.id !== dm.id);
          } else {
            dm.curso_id = oldest.id;
          }
        });
        
        if (jsonDb.matriculas) {
          jsonDb.matriculas.forEach(m => {
            if (m.curso_id === dupId) {
              const exists = jsonDb.matriculas.some(x => x.usuario_cedula === m.usuario_cedula && x.curso_id === oldest.id);
              if (!exists) {
                m.curso_id = oldest.id;
              }
            }
          });
          jsonDb.matriculas = jsonDb.matriculas.filter(m => m.curso_id !== dupId);
        }
        
        if (jsonDb.exams) {
          jsonDb.exams.forEach(e => {
            if (e.curso_id === dupId) {
              const exists = jsonDb.exams.some(x => x.usuario_cedula === e.usuario_cedula && x.curso_id === oldest.id);
              if (!exists) {
                e.curso_id = oldest.id;
              }
            }
          });
          jsonDb.exams = jsonDb.exams.filter(e => e.curso_id !== dupId);
        }
        
        if (jsonDb.certificates) {
          jsonDb.certificates.forEach(c => {
            if (c.curso_id === dupId) {
              const exists = jsonDb.certificates.some(x => x.usuario_cedula === c.usuario_cedula && x.curso_id === oldest.id);
              if (!exists) {
                c.curso_id = oldest.id;
              }
            }
          });
          jsonDb.certificates = jsonDb.certificates.filter(c => c.curso_id !== dupId);
        }
        
        if (jsonDb.questions) {
          jsonDb.questions.forEach(q => {
            if (q.curso_id === dupId) {
              q.curso_id = oldest.id;
            }
          });
        }
        
        jsonDb.courses = jsonDb.courses.filter(c => c.id !== dupId);
      });
    }
  });
}

function updateCourse(id, courseData) {
  const { titulo, descripcion, precio, certificado_template, certificacion_directa } = courseData;
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `UPDATE cursos SET titulo = ?, descripcion = ?, precio = ?, certificado_template = ?, certificacion_directa = ? WHERE id = ?`,
        [titulo, descripcion, precio, certificado_template || null, certificacion_directa || 0, id],
        function (err) {
          if (err) reject(err);
          else resolve({ id, titulo, descripcion, precio, certificado_template });
        }
      );
    } else {
      const idx = jsonDb.courses.findIndex(c => c.id === id);
      if (idx !== -1) {
        jsonDb.courses[idx].titulo = titulo;
        jsonDb.courses[idx].descripcion = descripcion;
        jsonDb.courses[idx].precio = parseFloat(precio);
        jsonDb.courses[idx].certificado_template = certificado_template || null;
        saveJsonDb();
        resolve(jsonDb.courses[idx]);
      } else {
        reject(new Error('Course not found'));
      }
    }
  });
}

function updateCourseModule(courseId, moduleId, moduleData) {
  const { titulo_modulo, tipo_contenido, data_contenido } = moduleData;
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `UPDATE modulos SET titulo_modulo = ?, tipo_contenido = ?, data_contenido = ? WHERE id = ? AND curso_id = ?`,
        [titulo_modulo, tipo_contenido, data_contenido, moduleId, courseId],
        function (err) {
          if (err) reject(err);
          else resolve({ id: moduleId, curso_id: courseId, titulo_modulo, tipo_contenido, data_contenido });
        }
      );
    } else {
      const idx = jsonDb.modules.findIndex(m => m.id === moduleId && m.curso_id === courseId);
      if (idx !== -1) {
        jsonDb.modules[idx].titulo_modulo = titulo_modulo;
        jsonDb.modules[idx].tipo_contenido = tipo_contenido;
        jsonDb.modules[idx].data_contenido = data_contenido;
        saveJsonDb();
        resolve(jsonDb.modules[idx]);
      } else {
        reject(new Error('Module not found'));
      }
    }
  });
}

function updateStudentProfile(cedula, profileData) {
  const {
    nombre_completo,
    fecha_expedicion_cedula,
    municipio_expedicion_cedula,
    municipio_nacimiento,
    anio_nacimiento,
    pago_realizado
  } = profileData;

  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `UPDATE usuarios SET 
          nombre_completo = ?, 
          fecha_expedicion_cedula = ?, 
          municipio_expedicion_cedula = ?, 
          municipio_nacimiento = ?, 
          anio_nacimiento = ?, 
          pago_realizado = ? 
         WHERE cedula = ? AND rol = 'estudiante'`,
        [
          nombre_completo,
          fecha_expedicion_cedula,
          municipio_expedicion_cedula,
          municipio_nacimiento,
          anio_nacimiento,
          pago_realizado ? 1 : 0,
          cedula
        ],
        function (err) {
          if (err) reject(err);
          else resolve({
            cedula,
            nombre_completo,
            fecha_expedicion_cedula,
            municipio_expedicion_cedula,
            municipio_nacimiento,
            anio_nacimiento,
            pago_realizado: pago_realizado ? 1 : 0
          });
        }
      );
    } else {
      const idx = jsonDb.users.findIndex(u => u.cedula === cedula && u.rol === 'estudiante');
      if (idx !== -1) {
        jsonDb.users[idx].nombre_completo = nombre_completo;
        jsonDb.users[idx].fecha_expedicion_cedula = fecha_expedicion_cedula;
        jsonDb.users[idx].municipio_expedicion_cedula = municipio_expedicion_cedula;
        jsonDb.users[idx].municipio_nacimiento = municipio_nacimiento;
        jsonDb.users[idx].anio_nacimiento = parseInt(anio_nacimiento);
        jsonDb.users[idx].pago_realizado = pago_realizado ? 1 : 0;
        saveJsonDb();
        resolve(jsonDb.users[idx]);
      } else {
        reject(new Error('Student not found'));
      }
    }
  });
}

function getCourseById(id) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT * FROM cursos WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(sanitize(row) || null);
      });
    } else {
      const course = (jsonDb.courses || []).find(c => c.id === id);
      resolve(sanitize(course) || null);
    }
  });
}

function getFinancialMetrics() {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      const query = `
        SELECT u.nombre_completo, u.cedula, c.titulo as curso_adquirido, m.fecha_matricula, c.precio
        FROM matriculas m
        JOIN usuarios u ON m.usuario_cedula = u.cedula
        JOIN cursos c ON m.curso_id = c.id
        WHERE u.pago_realizado = 1
      `;
      sqliteDB.all(query, [], (err, rows) => {
        if (err) return reject(err);
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentMonthStr = `${currentYear}-${currentMonth}`;
        
        let monthlyBalance = 0;
        let historicalBalance = 0;
        
        const coursesSold = (rows || []).map(r => {
          const precio = parseFloat(r.precio) || 0;
          historicalBalance += precio;
          
          if (r.fecha_matricula && r.fecha_matricula.startsWith(currentMonthStr)) {
            monthlyBalance += precio;
          }
          
          return {
            nombre_completo: r.nombre_completo,
            cedula: r.cedula,
            curso_adquirido: r.curso_adquirido,
            fecha_matricula: r.fecha_matricula,
            precio: precio
          };
        });
        
        resolve(sanitize({
          coursesSold,
          monthlyBalance,
          historicalBalance
        }));
      });
    } else {
      // JSON DB
      const paidUsers = (jsonDb.users || []).filter(u => u.pago_realizado === 1);
      const coursesSold = [];
      let monthlyBalance = 0;
      let historicalBalance = 0;
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentMonthStr = `${currentYear}-${currentMonth}`;
      
      paidUsers.forEach(u => {
        const userMatriculas = (jsonDb.matriculas || []).filter(m => m.usuario_cedula === u.cedula);
        userMatriculas.forEach(m => {
          const course = (jsonDb.courses || []).find(c => c.id === m.curso_id);
          const precio = course ? parseFloat(course.precio) || 0 : 0;
          
          historicalBalance += precio;
          if (m.fecha_matricula && m.fecha_matricula.startsWith(currentMonthStr)) {
            monthlyBalance += precio;
          }
          
          coursesSold.push({
            nombre_completo: u.nombre_completo,
            cedula: u.cedula,
            curso_adquirido: course ? course.titulo : 'Curso Desconocido',
            fecha_matricula: m.fecha_matricula,
            precio: precio
          });
        });
      });
      
      resolve(sanitize({
        coursesSold,
        monthlyBalance,
        historicalBalance
      }));
    }
  });
}

// Atomic student creation: validates course existence, creates the user,
// enrolls, and optionally bypass-certifies — all inside a single transaction.
// Returns { user, certificates }.
function createStudentWithEnrollment({ cedula, nombre_completo, password, metadata, cursos, certificar_inmediatamente }) {
  const normalizedCourseIds = cursos.map(id => parseInt(id, 10));

  if (dbType === 'sqlite') {
    return new Promise((resolve, reject) => {
      sqliteDB.serialize(async () => {
        let txnOpen = false;
        try {
          // 1. Validate course existence before touching any table
          if (normalizedCourseIds.length > 0) {
            const placeholders = normalizedCourseIds.map(() => '?').join(',');
            const validRows = await new Promise((res, rej) => {
              sqliteDB.all(`SELECT id FROM cursos WHERE id IN (${placeholders})`, normalizedCourseIds, (e, r) => e ? rej(e) : res(r));
            });
            if (validRows.length !== normalizedCourseIds.length) {
              return reject(new Error('Uno o más cursos seleccionados no existen.'));
            }
          }

          await new Promise((res, rej) => sqliteDB.run('BEGIN TRANSACTION', e => e ? rej(e) : res()));
          txnOpen = true;

          // 2. Create user inside the txn (reuses createUser, which uses sqliteDB.serialize-safe ops)
          const newUser = await createUser(cedula, nombre_completo, password, 'estudiante', null, metadata);

          // 3. Enroll in every course
          for (const courseId of normalizedCourseIds) {
            await enrollUserInCourse(cedula, courseId);
          }

          // 4. Optional immediate certification
          const certificates = [];
          if (certificar_inmediatamente) {
            for (const courseId of normalizedCourseIds) {
              certificates.push(await bypassCertify(cedula, courseId, { inTransaction: true }));
            }
          }

          await new Promise((res, rej) => sqliteDB.run('COMMIT', e => e ? rej(e) : res()));
          txnOpen = false;
          resolve({ user: newUser, certificates });
        } catch (e) {
          if (txnOpen) {
            try { await new Promise((r) => sqliteDB.run('ROLLBACK', () => r())); } catch (_) {}
          }
          reject(e);
        }
      });
    });
  }

  // JSON fallback — atomicity is best-effort but the sequence matches SQLite path
  return new Promise(async (resolve, reject) => {
    try {
      const validIds = (jsonDb.courses || []).map(c => c.id);
      const allExist = normalizedCourseIds.every(id => validIds.includes(id));
      if (!allExist) {
        return reject(new Error('Uno o más cursos seleccionados no existen.'));
      }

      const newUser = await createUser(cedula, nombre_completo, password, 'estudiante', null, metadata);
      for (const courseId of normalizedCourseIds) {
        await enrollUserInCourse(cedula, courseId);
      }

      const certificates = [];
      if (certificar_inmediatamente) {
        for (const courseId of normalizedCourseIds) {
          certificates.push(await bypassCertify(cedula, courseId));
        }
      }

      saveJsonDb();
      resolve({ user: newUser, certificates });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  initDB,
  getUser,
  createUser,
  getModules,
  getUserProgress,
  saveProgress,
  submitExam,
  getExamStatus,
  createCertificate,
  getCertificate,
  getCertificateByCedula,
  getCertificatesCount,
  seedQuestions, // Exported for the exam grading script
  getExamQuestions,
  getExamQuestionsWithAnswers,
  getCourses,
  enrollUserInCourse,
  getAdminMetrics,
  getAdminUsers,
  getStudentCourses,
  createCourse,
  createStudentWithEnrollment,
  updateUserCourses,
  bypassCertify,
  updateCourse,
  updateCourseModule,
  updateStudentProfile,
  getCourseById,
  getFinancialMetrics
};
