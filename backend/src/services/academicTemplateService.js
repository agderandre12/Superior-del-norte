const fs = require('fs');
const path = require('path');

/**
 * Institutional default expedition place (fallback for legacy records only).
 * Shared single source of truth for the Diploma and Acta HTML templates.
 */
const INSTITUTION_MUNICIPIO = 'Medellín';
const INSTITUTION_DEPARTAMENTO = 'Antioquia';

function getAssetAsBase64(filename) {
  try {
    const filePath = path.join(__dirname, '..', 'assets', filename);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filename).substring(1);
      const data = fs.readFileSync(filePath);
      return `data:image/${ext === 'svg' ? 'svg+xml' : ext === 'jpg' ? 'jpeg' : ext};base64,${data.toString('base64')}`;
    }
  } catch (e) {
    console.error('Error reading asset as base64:', e);
  }
  return '';
}

function getFormattedSpanishDate(dateString) {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  // Parse YYYY-MM-DD
  const dateObj = new Date(dateString + 'T12:00:00');
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return { day, month, year };
}

function generateDiplomaTemplate(student, cert, course) {
  const escudoBase64 = getAssetAsBase64('escudo_colombia.png');
  const logoBase64 = getAssetAsBase64('logo instituto superior del norte.png');
  const { day, month, year } = getFormattedSpanishDate(cert.fecha_emision);
  const certSeq = cert.numero_certificado ? cert.numero_certificado.replace('AS-2026-', '') : '0001';
  const ciudad = (student && student.ciudad_expedicion) || INSTITUTION_MUNICIPIO;
  const departamento = (student && student.departamento_expedicion) || INSTITUTION_DEPARTAMENTO;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Diploma de Bachiller</title>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Great+Vibes&family=UnifrakturMaguntia&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Montserrat', sans-serif;
          background-color: #ffffff;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
        }
        .diploma-container {
          position: relative;
          width: 1050px;
          height: 750px;
          background: #ffffff;
          padding: 30px;
          border: 15px double #0F2C59;
          box-shadow: 0 4px 30px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        }
        .gold-border-inner {
          position: absolute;
          top: 6px;
          left: 6px;
          right: 6px;
          bottom: 6px;
          border: 2px solid #D4AF37;
          pointer-events: none;
        }
        .corner-ornament {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 3px solid #D4AF37;
          pointer-events: none;
        }
        .top-left { top: 12px; left: 12px; border-right: none; border-bottom: none; }
        .top-right { top: 12px; right: 12px; border-left: none; border-bottom: none; }
        .bottom-left { bottom: 12px; left: 12px; border-right: none; border-top: none; }
        .bottom-right { bottom: 12px; right: 12px; border-left: none; border-top: none; }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 350px;
          height: auto;
          opacity: 0.04;
          z-index: 0;
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .header-images {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 200px;
          margin-bottom: 5px;
          width: 100%;
        }
        .escudo-img {
          height: 75px;
          width: auto;
        }
        .logo-img {
          height: 65px;
          width: auto;
        }

        .republica-text {
          font-family: 'Cinzel', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #0F2C59;
          letter-spacing: 5px;
          margin-top: 10px;
        }
        .institucion-text {
          font-family: 'Cinzel', serif;
          font-size: 1.7rem;
          font-weight: 900;
          color: #0F2C59;
          letter-spacing: 1px;
          margin-top: 5px;
          text-transform: uppercase;
        }
        .resolucion-text {
          font-size: 0.75rem;
          color: #475569;
          margin-top: 2px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .confiere-a {
          font-family: 'UnifrakturMaguntia', serif;
          font-size: 2.1rem;
          color: #D4AF37;
          margin: 18px 0 8px 0;
        }

        .student-name {
          font-family: 'Cinzel', serif;
          font-size: 2.3rem;
          font-weight: 900;
          color: #0F2C59;
          border-bottom: 2px solid #D4AF37;
          padding-bottom: 5px;
          display: inline-block;
          margin: 5px 0 10px 0;
          text-transform: uppercase;
        }
        .student-id {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 12px;
        }

        .titulo-de {
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .titulo-nombre {
          font-family: 'UnifrakturMaguntia', serif;
          font-size: 3.4rem;
          color: #0F2C59;
          margin: 5px 0;
          text-shadow: 1px 1px 2px rgba(15, 44, 89, 0.15);
        }

        .cuerpo-text {
          font-size: 0.85rem;
          color: #475569;
          max-width: 750px;
          line-height: 1.5;
          margin-bottom: 20px;
          font-weight: 500;
        }

        .firmas-container {
          display: flex;
          justify-content: space-between;
          width: 80%;
          margin-top: 15px;
        }
        .firma-box {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 250px;
        }
        .firma-line {
          width: 100%;
          height: 1px;
          background: #94a3b8;
          margin-top: 35px;
          margin-bottom: 6px;
        }
        .firma-grafica {
          position: absolute;
          top: -10px;
          font-family: 'Great Vibes', cursive;
          font-size: 2.3rem;
          color: #0d1e3d;
          opacity: 0.95;
          user-select: none;
          pointer-events: none;
        }
        .firma-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
        }
        .firma-charge {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
        }

        .fecha-emision-text {
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
          font-style: italic;
          margin-top: 15px;
        }
        .verificacion-codigo {
          font-family: monospace;
          font-size: 0.7rem;
          color: #94a3b8;
          position: absolute;
          bottom: 12px;
          right: 24px;
        }
      </style>
    </head>
    <body>
      <div class="diploma-container">
        <div class="gold-border-inner"></div>
        <div class="corner-ornament top-left"></div>
        <div class="corner-ornament top-right"></div>
        <div class="corner-ornament bottom-left"></div>
        <div class="corner-ornament bottom-right"></div>

        <img class="watermark" src="${escudoBase64}" alt="Watermark" />

        <div class="content" style="width: 100%;">
          <div class="header-images">
            <img class="escudo-img" src="${escudoBase64}" alt="Escudo de Colombia" />
            <img class="logo-img" src="${logoBase64}" alt="Logo Instituto" />
          </div>

          <h3 class="republica-text">REPÚBLICA DE COLOMBIA</h3>
          <h1 class="institucion-text">Instituto Superior del Norte</h1>
          <p class="resolucion-text">RESOLUCIÓN N° 10-50-2373 DE LA SECRETARÍA DE EDUCACIÓN MUNICIPAL DE ${ciudad.toUpperCase()}</p>

          <h2 class="confiere-a">Confiere a:</h2>

          <h1 class="student-name">${student.nombre_completo}</h1>
          <p class="student-id">Identificado(a) con C.C. N° ${student.cedula}</p>

          <p class="titulo-de">El Título de:</p>
          <h1 class="titulo-nombre">Bachiller Académico</h1>

          <p class="cuerpo-text">
            Por haber cursado y aprobado la totalidad de los estudios correspondientes al nivel de Educación Media Académica,
            según los planes de estudio y programas vigentes de la institución y autorizados por el Ministerio de Educación Nacional.
            En constancia de ello, el presente título queda inscrito bajo el Acta de Graduación N° ${certSeq}, Folio N° ${certSeq}
            y Registro N° ${cert.numero_certificado} del libro oficial de diplomas de la institución.
          </p>
        </div>

        <div class="firmas-container">
          <div class="firma-box">
            <span class="firma-grafica">S. Cardenas</span>
            <div class="firma-line"></div>
            <span class="firma-name">STEVEN CARDENAS LEON</span>
            <span class="firma-charge">Rector</span>
          </div>
          
          <div class="firma-box">
            <span class="firma-grafica">L. Avila</span>
            <div class="firma-line"></div>
            <span class="firma-name">LUISA FERNANDA AVILA GONZÁLEZ</span>
            <span class="firma-charge">Secretaria Académica</span>
          </div>
        </div>

        <div class="fecha-emision-text">
          Dado en la ciudad de ${ciudad}, departamento de ${departamento}, Colombia, a los ${day} días del mes de ${month} de ${year}
        </div>

        <div class="verificacion-codigo">
          Código de Verificación: ${cert.codigo_verificacion}
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateActaTemplate(student, cert, course) {
  const escudoBase64 = getAssetAsBase64('escudo_colombia.png');
  const logoBase64 = getAssetAsBase64('logo instituto superior del norte.png');
  const { day, month, year } = getFormattedSpanishDate(cert.fecha_emision);
  const certSeq = cert.numero_certificado ? cert.numero_certificado.replace('AS-2026-', '') : '0001';
  const ciudad = (student && student.ciudad_expedicion) || INSTITUTION_MUNICIPIO;
  const departamento = (student && student.departamento_expedicion) || INSTITUTION_DEPARTAMENTO;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Acta de Grado</title>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Great+Vibes&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Montserrat', sans-serif;
          background-color: #ffffff;
          padding: 40px 50px;
          font-size: 0.85rem;
          color: #1e293b;
          line-height: 1.6;
        }
        .acta-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 2px solid #0F2C59;
          padding-bottom: 15px;
        }
        .images-row {
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: center;
          margin-bottom: 10px;
        }
        .escudo-img {
          height: 60px;
          width: auto;
        }
        .logo-img {
          height: 50px;
          width: auto;
        }
        .header-title {
          font-family: 'Cinzel', serif;
          font-size: 1.3rem;
          font-weight: 900;
          color: #0F2C59;
        }
        .header-subtitle {
          font-size: 0.75rem;
          color: #475569;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .acta-title {
          font-family: 'Cinzel', serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0F2C59;
          margin: 20px 0 10px 0;
          text-align: center;
          letter-spacing: 1.5px;
        }
        
        .acta-body {
          text-align: justify;
        }
        
        .acta-body p {
          margin-bottom: 15px;
          text-indent: 30px;
        }

        .firmas-area {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
          padding: 0 40px;
        }
        .firma-box {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 230px;
        }
        .firma-line {
          width: 100%;
          height: 1px;
          background: #94a3b8;
          margin-top: 45px;
          margin-bottom: 6px;
        }
        .firma-grafica {
          position: absolute;
          top: 0px;
          font-family: 'Great Vibes', cursive;
          font-size: 2.2rem;
          color: #0d1e3d;
          opacity: 0.9;
        }
        .firma-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
        }
        .firma-charge {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          text-align: center;
        }

        .footer-note {
          margin-top: 40px;
          font-size: 0.75rem;
          color: #64748b;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="acta-header">
        <div class="images-row">
          <img class="escudo-img" src="${escudoBase64}" alt="Escudo de Colombia" />
          <img class="logo-img" src="${logoBase64}" alt="Logo Instituto" />
        </div>
        <h1 class="header-title">Instituto Superior del Norte</h1>
        <p class="header-subtitle">RESOLUCIÓN N° 10-50-2373 DE LA SECRETARÍA DE EDUCACIÓN MUNICIPAL DE ${ciudad.toUpperCase()}</p>
      </div>

      <h2 class="acta-title">ACTA GENERAL DE GRADUACIÓN N° ${certSeq}</h2>

      <div class="acta-body">
        <p>
          En la ciudad de <strong>${ciudad}, departamento de ${departamento}, República de Colombia</strong>, a los ${day} días del mes de ${month} de ${year},
          se reunieron formalmente en la sede de la Institución Educativa Instituto Superior del Norte, el Rector y la Secretaria Académica con el fin de formalizar
          y certificar el grado del estudiante del nivel de Educación Media Académica que completó satisfactoriamente sus estudios.
        </p>
        
        <p>
          Previa verificación de la carpeta de estudio, del cumplimiento de las intensidades horarias exigidas por ley, y del reporte del sistema de gestión LMS de la institución, 
          se constató que el graduando aprobó satisfactoriamente el programa formativo. En consecuencia, de conformidad con las facultades legales conferidas por el Ministerio de Educación Nacional de la República de Colombia, 
          se autorizó el registro y la foliación del respectivo título.
        </p>

        <p>
          Se deja constancia de que el(la) estudiante <strong>${student.nombre_completo}</strong>, identificado(a) con
          Cédula de Ciudadanía N° ${student.cedula}, recibe el título de <strong>Bachiller Académico</strong>, el cual queda
          inscrito en el Tomo General de Bachilleres bajo el Folio N° ${certSeq}, conforme al Acta de Graduación N° ${certSeq}
          y al Registro N° ${cert.numero_certificado} del libro oficial de diplomas de la institución.
        </p>

        <p>
          Por lo tanto, se procedió a expedir y hacer entrega formal del respectivo Diploma de Bachiller Académico,
          el cual acredita al graduando ante la sociedad y la comunidad académica del país como egresado idóneo de esta institución.
        </p>

        <p>
          En constancia de lo anterior, se suscribe la presente acta académica de grado por duplicado en la ciudad de ${ciudad},
          ante los directivos oficiales que al pie firman.
        </p>
      </div>

      <div class="firmas-area">
        <div class="firma-box">
          <span class="firma-grafica">S. Cardenas</span>
          <div class="firma-line"></div>
          <span class="firma-name">STEVEN CARDENAS LEON</span>
          <span class="firma-charge">Rector</span>
        </div>
        
        <div class="firma-box">
          <span class="firma-grafica">L. Avila</span>
          <div class="firma-line"></div>
          <span class="firma-name">LUISA FERNANDA AVILA GONZÁLEZ</span>
          <span class="firma-charge">Secretaria Académica</span>
        </div>
      </div>

      <div class="footer-note">
        Institución Educativa Instituto Superior del Norte | Código de Registro: ${cert.numero_certificado}<br>
        Código de Verificación Pública: ${cert.codigo_verificacion}
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  generateDiplomaTemplate,
  generateActaTemplate
};
