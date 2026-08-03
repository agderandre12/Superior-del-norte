const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { Writable } = require('stream');
require('dotenv').config();

/**
 * Visual identity tokens — single source of truth for the institutional palette.
 * STRICT PROHIBITION: the color orange must never appear in any rendered asset.
 */
const ISN_BLUE = '#0F2C59';
const ISN_GOLD = '#D4AF37';
const ISN_INK = '#0a2a55';
const ISN_BG_SOFT = '#F7F9FA';
const ISN_GREY_TEXT = '#475569';
const ISN_GREY_LINE = '#CBD5E1';

/**
 * Institutional default expedition place. Used ONLY as a fallback for legacy
 * records that predate the municipio/departamento capture at enrollment; it is
 * never a hardcoded value embedded in the document body. Centralised here so
 * the three documents (Notas, Acta, Diploma) share a single source of truth.
 */
const INSTITUTION_MUNICIPIO = 'Medellín';
const INSTITUTION_DEPARTAMENTO = 'Antioquia';

/**
 * Canonical signing authorities for all Bachillerato Académico documents.
 */
const RECTOR = { nombre: 'STEVEN CARDENAS LEON', cargo: 'Rector' };
const SECRETARIA = { nombre: 'LUISA FERNANDA AVILA GONZÁLEZ', cargo: 'Secretaria Académica' };

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

/**
 * The 9 mandatory knowledge areas for the Bachillerato Académico (CLEI VI).
 */
const BACHILLER_AREAS = [
  { nombre: 'Matemáticas', ihs: 2 },
  { nombre: 'Lenguaje Castellano', ihs: 2 },
  { nombre: 'Sociales', ihs: 1 },
  { nombre: 'Biología', ihs: 1 },
  { nombre: 'Inglés', ihs: 1 },
  { nombre: 'Informática', ihs: 1 },
  { nombre: 'Ética y Educación Religiosa', ihs: 1 },
  { nombre: 'Artes y Educación Física', ihs: 1 },
  { nombre: 'Comportamiento', ihs: null }
];

/**
 * Resolves the institutional asset path, returning null when the file is absent.
 * @param {string} filename
 * @returns {string|null}
 */
function getAssetPath(filename) {
  const p = path.join(__dirname, '..', 'assets', filename);
  return fs.existsSync(p) ? p : null;
}

/**
 * Simple hash-based seed generator for deterministic pseudo-random values.
 * @param {string} seedStr
 * @returns {Function}
 */
function seedRandom(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = (h << 5) - h + seedStr.charCodeAt(i);
    h |= 0;
  }
  return function () {
    let t = h += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pure function: maps a quantitative grade to its qualitative Colombian
 * performance label (DRY — single source of truth shared by every generator).
 *   4.1 – 4.5  -> ALTO
 *   4.6 – 5.0  -> SUPERIOR
 * @param {number} grade
 * @returns {string}
 */
function mapQualitativeGrade(grade) {
  return grade >= 4.6 ? 'SUPERIOR' : 'ALTO';
}

/**
 * Pure function: generates deterministic-within-call random quantitative
 * grades (one decimal, range 4.1–5.0) for the 9 mandatory areas and derives
 * their qualitative mapping. Centralised here per KISS/DRY.
 * @param {string} [seed]
 * @returns {Array<{area:string, ihs:number|null, cuantitativo:string, cualitativo:string}>}
 */
function generateBachilleratoGrades(seed) {
  const rand = seed ? seedRandom(String(seed)) : Math.random;
  return BACHILLER_AREAS.map((area) => {
    const raw = rand() * (5.0 - 4.1) + 4.1;
    const rounded = Math.round(raw * 10) / 10;
    return {
      area: area.nombre,
      ihs: area.ihs,
      cuantitativo: rounded.toFixed(1),
      cualitativo: mapQualitativeGrade(rounded)
    };
  });
}

/**
 * Identifies whether a course record corresponds to the Bachillerato Académico
 * titulation (direct certification + "Bachiller" in the title).
 * @param {Object} course
 * @returns {boolean}
 */
function isHighSchoolCourse(course) {
  if (!course || course.certificacion_directa !== 1) return false;
  return String(course.titulo || '').toLowerCase().includes('bachiller');
}

/**
 * Formats a YYYY-MM-DD date string into Spanish long-form components.
 * @param {string} dateStr
 * @returns {{day:(string|number), month:string, year:(string|number)}}
 */
function formatSpanishDate(dateStr) {
  if (!dateStr) return { day: '', month: '', year: '' };
  const d = new Date(dateStr + 'T12:00:00');
  if (isNaN(d.getTime())) return { day: '', month: '', year: '' };
  return { day: d.getDate(), month: MESES_ES[d.getMonth()], year: d.getFullYear() };
}

/**
 * Extracts the sequential degree number from a certificado registry code.
 * @param {string} numeroCertificado
 * @returns {string}
 */
function extractDegreeSeq(numeroCertificado) {
  if (!numeroCertificado) return '0001';
  const digits = String(numeroCertificado).replace(/[^0-9]+$/, '');
  return digits.split('-').pop() || '0001';
}

/**
 * Draws a hyperrealistic handwritten signature using stylized bezier strokes
 * (semi-transparent ink flow). Evokes a physically hand-signed document and
 * deliberately avoids generic text boxes or "digital checkboxes".
 *
 * Two distinct variants keep the Rector and Secretaria signatures visually
 * unique but deterministic for the same signatory.
 *
 * @param {PDFKit.PDFDocument} doc
 * @param {'rector'|'secretaria'} variant
 * @param {number} x          top-left x of the signature bounding box
 * @param {number} y          baseline anchor y
 * @param {number} scale      uniform scale applied to the 170×60 unit glyph
 */
function drawSignature(doc, variant, x, y, scale = 1.0) {
  const filename = variant === 'rector' ? 'firma1.png' : 'firma2.png';
  const imgPath = getAssetPath(filename);
  if (!imgPath) {
    console.warn(`Signature asset not found: ${filename}`);
    return;
  }

  // Set design bounding box for the signature images.
  // Increased by ~33% to 160 x 60 for an impressive and readable rendering.
  const targetWidth = 160 * scale;
  const targetHeight = 60 * scale;

  doc.image(imgPath, x, y, {
    fit: [targetWidth, targetHeight],
    align: 'center',
    valign: 'bottom'
  });
}

/**
 * Renders a parallel signature block (stylized signature + name + charge)
 * centered over a column starting at `x` with the given `width`.
 *
 * @param {PDFKit.PDFDocument} doc
 * @param {'rector'|'secretaria'} variant
 * @param {Object} authority   { nombre, cargo }
 * @param {number} x
 * @param {number} width
 * @param {number} lineY       y of the solid signature rule
 */
function renderSignatureBlock(doc, variant, authority, x, width, lineY) {
  // Draw the real signature image centered above the signature line
  const sigW = 160;
  const sigH = 60;
  const sigX = x + (width - sigW) / 2;
  const sigY = lineY - sigH - 5; // sitting 5 units above the line to prevent collision

  drawSignature(doc, variant, sigX, sigY, 1.0);

  doc.moveTo(x, lineY).lineTo(x + width, lineY)
    .lineWidth(1).strokeColor('#94A3B8').stroke();

  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8.5)
    .text(authority.nombre, x, lineY + 5, { width, align: 'center' });
  doc.fillColor(ISN_GREY_TEXT).font('Helvetica-Oblique').fontSize(7.5)
    .text(authority.cargo, x, lineY + 16, { width, align: 'center' });
  doc.font('Helvetica').fontSize(7.5).fillColor('#64748B')
    .text('Instituto Superior del Norte', x, lineY + 26, { width, align: 'center' });
}

/**
 * Draws the decorative premium frame (blue outer + gold inner + corner marks).
 * Works for both portrait and landscape since it reads doc.page dimensions.
 *
 * @param {PDFKit.PDFDocument} doc
 */
function renderPremiumFrame(doc) {
  const { width, height } = doc.page;
  doc.rect(18, 18, width - 36, height - 36).lineWidth(4).stroke(ISN_BLUE);
  doc.rect(26, 26, width - 52, height - 52).lineWidth(1.5).stroke(ISN_GOLD);
  const c = 18;
  const s = 16;
  doc.lineWidth(1).strokeColor(ISN_GOLD);
  doc.rect(22, 22, s, s).stroke();
  doc.rect(width - 22 - s, c, s, s).stroke();
  doc.rect(22, height - 22 - s, s, s).stroke();
  doc.rect(width - 22 - s, height - 22 - s, s, s).stroke();
}

/**
 * Draws a structured grades table with a navy header band, zebra rows and a
 * hairline grid. Returns the y-coordinate directly below the table.
 *
 * @param {PDFKit.PDFDocument} doc
 * @param {number} x
 * @param {number} y
 * @param {number[]} colWidths
 * @param {string[]} headers
 * @param {Array<Array<string>>} rows
 * @param {number} rowHeight
 * @returns {number} bottom y
 */
function drawGradesTable(doc, x, y, colWidths, headers, rows, rowHeight) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const headerHeight = rowHeight + 4;

  doc.fillColor(ISN_BLUE).rect(x, y, totalWidth, headerHeight).fill();
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
  let cx = x;
  headers.forEach((h, i) => {
    doc.text(h, cx + 3, y + 8, { width: colWidths[i] - 6, align: 'center' });
    cx += colWidths[i];
  });

  let ry = y + headerHeight;
  rows.forEach((row, idx) => {
    if (idx % 2 === 1) {
      doc.fillColor(ISN_BG_SOFT).rect(x, ry, totalWidth, rowHeight).fill();
    }
    doc.fillColor('#1E293B');
    cx = x;
    row.forEach((cell, i) => {
      const align = i === 0 ? 'left' : 'center';
      const weight = i >= 2 ? 'Helvetica-Bold' : 'Helvetica';
      doc.font(weight).fontSize(9);
      doc.text(String(cell), cx + 6, ry + 7, { width: colWidths[i] - 12, align });
      cx += colWidths[i];
    });
    ry += rowHeight;
  });

  doc.lineWidth(1).strokeColor(ISN_BLUE).rect(x, y, totalWidth, ry - y).stroke();
  doc.lineWidth(0.5).strokeColor(ISN_GREY_LINE);
  let vx = x;
  for (let i = 0; i < colWidths.length; i++) {
    vx += colWidths[i];
    doc.moveTo(vx, y).lineTo(vx, ry).stroke();
  }
  let hy = y + headerHeight;
  for (let r = 0; r < rows.length; r++) {
    hy += rowHeight;
    doc.moveTo(x, hy).lineTo(x + totalWidth, hy).stroke();
  }

  doc.y = ry + 12;
  return ry;
}

/**
 * Renders the two-symbol institutional header (Escudo de Colombia + logo)
 * centered horizontally on the page.
 *
 * @param {PDFKit.PDFDocument} doc
 * @param {number} y
 * @param {number} gap
 */
function renderInstitutionalHeader(doc, y, gap = 320) {
  const escudoPath = getAssetPath('escudo_colombia.png');
  const logoPath = getAssetPath('logo instituto superior del norte.png');
  const { width } = doc.page;
  const imgH = 62;
  let leftW = 0;
  let rightW = 0;
  if (escudoPath) {
    const img = doc.openImage(escudoPath);
    leftW = imgH * (img.width / img.height);
    doc.image(img, width / 2 - gap / 2 - leftW / 2, y, { height: imgH });
  }
  if (logoPath) {
    const img = doc.openImage(logoPath);
    rightW = imgH * (img.width / img.height);
    doc.image(img, width / 2 + gap / 2 - rightW / 2, y, { height: imgH });
  }
}

/**
 * Renders the Escudo de Colombia as a centralized watermark background.
 * @param {PDFKit.PDFDocument} doc
 */
function renderWatermarkEscudo(doc) {
  const escudoPath = getAssetPath('escudo_colombia.png');
  if (escudoPath) {
    const { width, height } = doc.page;
    const img = doc.openImage(escudoPath);
    const wmH = 340;
    const wmW = wmH * (img.width / img.height);
    doc.save();
    doc.fillOpacity(0.06);
    doc.opacity(0.06);
    doc.image(img, (width - wmW) / 2, (height - wmH) / 2, { width: wmW, height: wmH });
    doc.restore();
  }
}

/**
 * Renders the High School header with the logo centered, a stylized blue ornament on the left,
 * and centered institutional typography. The Escudo is now rendered as a watermark.
 * The "Secretaría de Educación Municipal" entity is resolved from the student's
 * expedition municipality (captured at enrollment), falling back to the
 * institutional default for legacy records.
 * @param {PDFKit.PDFDocument} doc
 * @param {string} [municipio] municipio de expedición del estudiante
 */
function renderHighSchoolHeader(doc, municipio) {
  const { width } = doc.page;
  const margin = doc.page.margins.left || 50;
  const municipioSecretaria = municipio || INSTITUTION_MUNICIPIO;

  // 1. Stylized ornamental frame in Corporate Blue (#0F2C59) in the top left
  doc.save();
  doc.strokeColor(ISN_BLUE).lineWidth(2);
  doc.moveTo(25, 65).lineTo(25, 25).lineTo(65, 25).stroke();
  doc.moveTo(30, 60).lineTo(30, 30).lineTo(60, 30).stroke();
  doc.rect(34, 34, 6, 6).fillColor(ISN_BLUE).fill();
  doc.restore();

  // 2. Centered Logo of "Instituto Superior del Norte"
  const logoPath = getAssetPath('logo instituto superior del norte.png');
  if (logoPath) {
    const logoW = 75;
    const logoX = (width - logoW) / 2;
    doc.image(logoPath, logoX, 35, { width: logoW });
  }

  // 3. Centered institutional text box
  doc.y = 135;
  doc.fillColor('#1E293B').font('Helvetica-Bold').fontSize(7.5)
    .text('REPÚBLICA DE COLOMBIA', margin, doc.y, { width: width - margin * 2, align: 'center', characterSpacing: 1 });
  
  // Short and subtle spacing after REPÚBLICA DE COLOMBIA
  doc.y = 147;
  doc.font('Helvetica').fontSize(7)
    .text('MINISTERIO DE EDUCACIÓN NACIONAL', margin, doc.y, { width: width - margin * 2, align: 'center', characterSpacing: 0.5 });

  // Wider margin-bottom before INSTITUTO SUPERIOR DEL NORTE
  doc.y = 168;
  doc.fillColor(ISN_BLUE).font('Times-Bold').fontSize(14)
    .text('INSTITUTO SUPERIOR DEL NORTE', margin, doc.y, { width: width - margin * 2, align: 'center' });

  // Resolution below
  doc.y = 188;
  doc.fillColor(ISN_GREY_TEXT).font('Helvetica-Oblique').fontSize(7.5)
    .text(`Resolución N° 10-50-2373 — Secretaría de Educación Municipal de ${municipioSecretaria}`, margin, doc.y, { width: width - margin * 2, align: 'center' });
}

/**
 * Draws the double perimetral line border in Gold and corner ornaments in Blue.
 * @param {PDFKit.PDFDocument} doc
 */
function renderDiplomaBorders(doc) {
  const { width, height } = doc.page;
  doc.save();

  // Double gold perimetral line (#D4AF37)
  doc.strokeColor(ISN_GOLD).lineWidth(1);
  doc.rect(20, 20, width - 40, height - 40).stroke();
  doc.rect(24, 24, width - 48, height - 48).stroke();

  // Corner ornaments in Corporate Blue (#0F2C59)
  doc.strokeColor(ISN_BLUE).lineWidth(2);

  // Top-left corner
  doc.moveTo(20, 50).lineTo(20, 20).lineTo(50, 20).stroke();
  doc.moveTo(24, 46).lineTo(24, 24).lineTo(46, 24).stroke();

  // Top-right corner
  doc.moveTo(width - 50, 20).lineTo(width - 20, 20).lineTo(width - 20, 50).stroke();
  doc.moveTo(width - 46, 24).lineTo(width - 24, 24).lineTo(width - 24, 46).stroke();

  // Bottom-left corner
  doc.moveTo(20, height - 50).lineTo(20, height - 20).lineTo(50, height - 20).stroke();
  doc.moveTo(24, height - 46).lineTo(24, height - 24).lineTo(46, height - 24).stroke();

  // Bottom-right corner
  doc.moveTo(width - 50, height - 20).lineTo(width - 20, height - 20).lineTo(width - 20, height - 50).stroke();
  doc.moveTo(width - 46, height - 24).lineTo(width - 24, height - 24).lineTo(width - 24, height - 46).stroke();

  doc.restore();
}

// ---------------------------------------------------------------------------
// DOCUMENT 1 — Certificado de Notas (CLEI VI / Grado 11º)
// ---------------------------------------------------------------------------

/**
 * Renders the Certificado de Notas onto the current page of `doc`.
 * @param {PDFKit.PDFDocument} doc
 * @param {Object} studentData
 * @param {Object} certData
 * @private
 */
function _renderGradesCertificate(doc, studentData, certData) {
  // Shrink the bottom margin (default 60) so the anchored verification code at
  // height-45 stays within the content area and never spills onto a 2nd page.
  doc.page.margins.bottom = 30;
  const { width } = doc.page;
  const margin = 80;
  const ciudad = (certData && certData.ciudad_expedicion) || INSTITUTION_MUNICIPIO;

  renderPremiumFrame(doc);
  renderHighSchoolHeader(doc, ciudad);
  renderWatermarkEscudo(doc);

  doc.y = 225;
  doc.fillColor(ISN_BLUE).font('Times-Bold').fontSize(20)
    .text('CERTIFICADO DE NOTAS', margin, doc.y, { width: width - margin * 2, align: 'center' });

  doc.moveDown(0.2);
  doc.fillColor(ISN_GOLD).font('Helvetica-Bold').fontSize(10)
    .text('CLEI VI  ·  GRADO 11°', margin, doc.y, { width: width - margin * 2, align: 'center', characterSpacing: 2 });

  // 1. Reduced intro margin from 1.5 to 0.8
  doc.moveDown(0.8);
  const textoCertifica = `El suscrito Rector del Instituto Superior del Norte, certifica que el(la) estudiante ${String(studentData.nombre_completo || '').toUpperCase()}, identificado(a) con Cédula de Ciudadanía N° ${studentData.cedula || ''}, cursó y aprobó las áreas obligatorias del conocimiento correspondientes al Ciclo Lectivo Especial Integrado (CLEI VI), equivalente al grado undécimo (11°) de Educación Media Académica.`;
  doc.fillColor('#1E293B')
    .font('Helvetica')
    .fontSize(10)
    .text(textoCertifica, margin, doc.y, { width: width - margin * 2, align: 'center', lineGap: 4 });

  doc.moveDown(1.2);
  const tableX = margin;
  const colWidths = [182, 40, 115, 115];
  const headers = ['ÁREAS', 'I.H.S', 'DESEMPEÑO CUANTITATIVO', 'DESEMPEÑO CUALITATIVO'];
  const grades = (certData && certData.grades) ? certData.grades : generateBachilleratoGrades(studentData && studentData.cedula);
  const rows = grades.map((g) => [g.area, g.ihs === null ? '—' : String(g.ihs), g.cuantitativo, g.cualitativo]);
  // 2. Compacted table row height from 22 to 18
  const tableBottom = drawGradesTable(doc, tableX, doc.y, colWidths, headers, rows, 18);

  // Promotion concept badge
  doc.y = tableBottom;
  doc.moveDown(1);
  const badgeW = 300;
  const badgeX = (width - badgeW) / 2;
  doc.fillColor(ISN_BG_SOFT).roundedRect(badgeX, doc.y, badgeW, 26, 6).fill();
  doc.lineWidth(1).strokeColor(ISN_GOLD).roundedRect(badgeX, doc.y, badgeW, 26, 6).stroke();
  doc.fillColor(ISN_BLUE).font('Helvetica-Bold').fontSize(10)
    .text('CONCEPTO DE PROMOCIÓN: APROBADO', badgeX, doc.y + 8, { width: badgeW, align: 'center' });

  doc.y += 26;
  // 3. Reduced margin before scale from 1.5 to 0.6
  doc.moveDown(0.6);
  doc.fillColor(ISN_GREY_TEXT).font('Helvetica-Oblique').fontSize(8)
    .text(
      'Escala Nacional de Valoración:  BÁSICO (3.0 – 3.9)   ·   ALTO (4.0 – 4.5)   ·   SUPERIOR (4.6 – 5.0).   ' +
      'I.H.S = Intensidad Horaria Semanal.',
      margin, doc.y, { width: width - margin * 2, align: 'center' }
    );

  // 4. Anchored bottom section (signature block, date, verification code)
  const { day, month, year } = formatSpanishDate(certData && certData.fecha_emision);
  const sigW = 280;
  const sigX = (width - sigW) / 2;
  const sigLineY = doc.page.height - 125;
  renderSignatureBlock(doc, 'rector', RECTOR, sigX, sigW, sigLineY);

  // Date of issue (anchored)
  const dateY = doc.page.height - 75;
  doc.fillColor(ISN_GREY_TEXT).font('Helvetica').fontSize(9)
    .text(
      `Se expide en la ciudad de ${ciudad}, Colombia${day ? `, a los ${day} días del mes de ${month} de ${year}` : ''}.`,
      margin, dateY, { width: width - margin * 2, align: 'center' }
    );

  // Verification Code (anchored lower to force it strictly onto the first page)
  const codeY = doc.page.height - 45;
  doc.fillColor('#64748B').font('Courier').fontSize(7.5)
    .text(
      `Código de Verificación: ${certData && certData.codigo_verificacion ? certData.codigo_verificacion : ''}`,
      margin, codeY, { width: width - margin * 2, align: 'center' }
    );
}

// ---------------------------------------------------------------------------
// DOCUMENT 2 — Acta de Grado
// ---------------------------------------------------------------------------

/**
 * Renders the Acta de Grado onto the current page of `doc`.
 * @param {PDFKit.PDFDocument} doc
 * @param {Object} studentData
 * @param {Object} certData
 * @private
 */
function _renderGraduationAct(doc, studentData, certData) {
  const { width } = doc.page;
  const margin = 95;
  const seq = extractDegreeSeq(certData && certData.numero_certificado);
  const { day, month, year } = formatSpanishDate(certData && certData.fecha_emision);
  // Expedition place — dynamic, with institutional fallback for legacy records.
  const ciudad = (certData && certData.ciudad_expedicion) || INSTITUTION_MUNICIPIO;
  const departamento = (certData && certData.departamento_expedicion) || INSTITUTION_DEPARTAMENTO;

  renderPremiumFrame(doc);
  renderHighSchoolHeader(doc, ciudad);
  renderWatermarkEscudo(doc);

  // Separator line below header

  doc.y = 210;
  doc.fillColor(ISN_BLUE).font('Times-Bold').fontSize(13)
    .text(`ACTA GENERAL DE GRADUACIÓN N° ${seq}`,
      margin, doc.y, { width: width - margin * 2, align: 'center', characterSpacing: 1.5 });

  const bodyOpts = { width: width - margin * 2, align: 'center', lineGap: 3 };

  doc.y = 235;
  doc.fillColor('#1E293B').font('Helvetica').fontSize(9);
  doc.text(
    `En la ciudad de ${ciudad}, departamento de ${departamento}, República de Colombia${day ? `, a los ${day} días del mes de ${month} de ${year}` : ''}, ` +
    `se reunieron formalmente en la sede del Instituto Superior del Norte el Rector y la Secretaria Académica, ` +
    `con el fin de formalizar y certificar el grado del estudiante del nivel de Educación Media Académica que ` +
    `completó satisfactoriamente la totalidad de los estudios exigidos por el plan institucional.`,
    margin, doc.y, bodyOpts
  );

  doc.moveDown(0.8);
  doc.text(
    `En virtud de lo dispuesto en el Decreto 3011 de 1997 del Ministerio de Educación Nacional, reglamentado por el ` +
    `Decreto 1075 de 2015, y previa verificación del cumplimiento de las intensidades horarias, la carpeta ` +
    `académica y el reporte del sistema de gestión académica, se constató que el graduando aprobó satisfactoriamente ` +
    `el programa formativo. En consecuencia, se autorizó el registro y foliación del respectivo título.`,
    margin, doc.y, bodyOpts
  );

  // Prominent student graduando display
  doc.moveDown(1.5);
  doc.fillColor(ISN_BLUE).font('Helvetica-Bold').fontSize(15)
    .text(String(studentData.nombre_completo || '').toUpperCase(), { align: 'center' });
  doc.moveDown(0.7);

  // Registro académico integrado de forma narrativa dentro del cuerpo legal
  // del acta (sin recuadros): documento, título, libro, folio y registro.
  doc.fillColor('#1E293B').font('Helvetica').fontSize(9);
  doc.text(
    `identificado(a) con Cédula de Ciudadanía N° ${studentData.cedula || ''}, a quien se le otorga el título de ` +
    `Bachiller Académico, quedando inscrito en el Tomo General de Bachilleres bajo el Folio N° ${seq}, ` +
    `conforme al Acta de Graduación N° ${seq} y al Registro N° ${(certData && certData.numero_certificado) || ''} ` +
    `del libro oficial de diplomas de la institución.`,
    margin, doc.y, bodyOpts
  );
  doc.moveDown(0.8);

  doc.fillColor('#1E293B').font('Helvetica').fontSize(9);
  doc.text(
    `Por lo tanto, se procedió a expedir y hacer entrega formal del respectivo Diploma de Bachiller Académico, ` +
    `el cual acredita al graduando ante la sociedad como egresado idóneo de esta institución.`,
    margin, doc.y, bodyOpts
  );
  doc.moveDown(0.6);
  doc.text(
    `En constancia de lo anterior, se suscribe la presente acta académica de grado por duplicado en la ciudad de ` +
    `${ciudad}, ante los directivos oficiales que al pie firman.`,
    margin, doc.y, bodyOpts
  );

  // Parallel signatures
  const sigLineY = doc.page.height - 140;
  const colGap = 60;
  const colW = (width - margin * 2 - colGap) / 2;
  renderSignatureBlock(doc, 'rector', RECTOR, margin, colW, sigLineY);
  renderSignatureBlock(doc, 'secretaria', SECRETARIA, margin + colW + colGap, colW, sigLineY);

  doc.fillColor('#64748B').font('Helvetica').fontSize(7.5)
    .text(
      `Instituto Superior del Norte   ·   Registro: ${(certData && certData.numero_certificado) || ''}   ·   ` +
      `Verificación: ${(certData && certData.codigo_verificacion) || ''}`,
      margin, doc.page.height - 80, { width: width - margin * 2, align: 'center' }
    );
}

// ---------------------------------------------------------------------------
// DOCUMENT 3 — Diploma de Bachiller
// ---------------------------------------------------------------------------

/**
 * Renders the Diploma de Bachiller (landscape) onto the current page of `doc`.
 * @param {PDFKit.PDFDocument} doc
 * @param {Object} studentData
 * @param {Object} certData
 * @private
 */
function _renderHighSchoolDiploma(doc, studentData, certData) {
  doc.page.margins.bottom = 30;
  const { width, height } = doc.page;

  // ⬇️ MEJORA 1: Ampliamos el padding lateral de 80 a 95 para dar más aire en los costados
  const margin = 95;
  const seq = extractDegreeSeq(certData && certData.numero_certificado);
  const { day, month, year } = formatSpanishDate(certData && certData.fecha_emision);
  // Diploma expedition city — captured at enrollment; falls back to the
  // institutional default for legacy records (idempotent rendering).
  const ciudad = (certData && certData.ciudad_expedicion) || INSTITUTION_MUNICIPIO;
  const departamento = (certData && certData.departamento_expedicion) || INSTITUTION_DEPARTAMENTO;

  // Fondo (Escudo sutil en marca de agua)
  renderWatermarkEscudo(doc);

  // Marcos y esquinas doradas/azules
  renderDiplomaBorders(doc);

  // ⬇️ MEJORA 2: Bajamos el logo a Y=65 para despegarlo del borde superior
  const logoPath = getAssetPath('logo instituto superior del norte.png');
  if (logoPath) {
    const logoW = 75;
    doc.image(logoPath, (width - logoW) / 2, 65, { width: logoW });
  }

  // ⬇️ MEJORA 3: Distribución vertical absoluta milimétrica para evitar amontonamientos

  // Encabezado Nacional
  doc.y = 160;
  doc.fillColor(ISN_BLUE).font('Times-Bold').fontSize(11)
    .text('REPÚBLICA DE COLOMBIA', margin, doc.y, { width: width - margin * 2, align: 'center', characterSpacing: 3 });

  doc.y = 182;
  doc.font('Times-Bold').fontSize(24).fillColor(ISN_BLUE)
    .text('Instituto Superior del Norte', margin, doc.y, { width: width - margin * 2, align: 'center' });

  doc.y = 214;
  doc.fillColor(ISN_GREY_TEXT).font('Helvetica').fontSize(7.5)
    .text(`RESOLUCIÓN N° 10-50-2373 DE LA SECRETARÍA DE EDUCACIÓN MUNICIPAL DE ${ciudad.toUpperCase()}`,
      margin, doc.y, { width: width - margin * 2, align: 'center', characterSpacing: 0.5 });

  // Confiere a
  doc.y = 290;
  const name = String(studentData.nombre_completo || '').toUpperCase();
  const tamanoFuente = name.length > 30 ? 16 : 20;
  doc.font('Times-Bold').fontSize(tamanoFuente).fillColor(ISN_BLUE);

  // ESTA ES LA ÚNICA LÍNEA DE TEXTO QUE NECESITAMOS PARA EL NOMBRE.
  // YA SE ESTÁ CENTRANDO CORRECTAMENTE.
  doc.text(name, margin, doc.y, { width: width - margin * 2, align: 'center' });

  // Calculamos nameW y nameX SOLO para la línea dorada inferior,
  // no para volver a escribir el texto.
  const nameW = doc.widthOfString(name);
  const nameX = (width - nameW) / 2;
  // nameY ya es doc.y después de la primera escritura, no necesitamos sumarle 4.

  // Línea dorada inferior del nombre
  // Usamos doc.y (la posición actual) para la línea dorada.
  doc.moveTo(nameX, doc.y + 1).lineTo(nameX + nameW, doc.y + 1)
    .lineWidth(1.2).strokeColor(ISN_GOLD).stroke();

  // Identificación
  doc.y = 332;
  doc.fillColor('#1E293B').font('Helvetica').fontSize(10.5)
    .text(`Identificado(a) con Cédula de Ciudadanía N° ${studentData.cedula || ''}`,
      margin, doc.y, { width: width - margin * 2, align: 'center' });

  // Atribución del título
  doc.y = 380;
  doc.fillColor(ISN_GREY_TEXT).font('Helvetica-Bold').fontSize(9)
    .text('EL TÍTULO DE', margin, doc.y, { width: width - margin * 2, align: 'center', characterSpacing: 2 });

  // Título obtenido — jerarquía visual reforzada (mayor tamaño de fuente).
  doc.y = 398;
  doc.fillColor(ISN_BLUE).font('Times-Bold').fontSize(40)
    .text('Bachiller Académico', margin, doc.y, { width: width - margin * 2, align: 'center' });

  // Texto legal narrativo: los datos de registro (Acta, Folio y Registro) se
  // integran de forma orgánica dentro de la redacción — sin recuadros.
  const registro = (certData && certData.numero_certificado) || '';
  doc.y = 470;
  doc.fillColor(ISN_GREY_TEXT).font('Helvetica').fontSize(10.5)
    .text(
      'Por haber cursado y aprobado la totalidad de los estudios correspondientes al nivel de Educación Media ' +
      'Académica, según los planes de estudio y programas vigentes de la institución, en cumplimiento de lo ' +
      'dispuesto en el Decreto 3011 de 1997 y el Decreto 1075 de 2015 del Ministerio de Educación Nacional. ' +
      `En constancia de ello, el presente título queda inscrito bajo el Acta de Graduación N° ${seq}, ` +
      `Folio N° ${seq} y Registro N° ${registro} del libro oficial de diplomas de la institución.`,
      margin, doc.y, { width: width - margin * 2, align: 'center', lineGap: 4 }
    );

  // ⬇️ MEJORA 5: Ambas firmas en la misma línea, proporcionadas y con espaciado anti-colisiones lateral
  const sigLineY = height - 125;
  const colGap = 50;
  const colW = (width - margin * 2 - colGap) / 2;

  renderSignatureBlock(doc, 'rector', RECTOR, margin, colW, sigLineY);
  renderSignatureBlock(doc, 'secretaria', SECRETARIA, margin + colW + colGap, colW, sigLineY);

  // Fecha de expedición inferior — ciudad dinámica de expedición.
  doc.fillColor(ISN_GREY_TEXT).font('Helvetica-Oblique').fontSize(8.5)
    .text(
      `Dado en la ciudad de ${ciudad}, departamento de ${departamento}, Colombia${day ? `, a los ${day} días del mes de ${month} de ${year}` : ''}.`,
      margin, height - 55, { width: width - margin * 2, align: 'center' }
    );

  // Código de verificación en el borde inferior
  doc.fillColor('#94A3B8').font('Courier').fontSize(7.5)
    .text(
      `Código de Verificación: ${(certData && certData.codigo_verificacion) || ''}`,
      margin, height - 38, { width: width - margin * 2, align: 'center' }
    );
}

// ---------------------------------------------------------------------------
// Public stream-based generators (single-document)
// ---------------------------------------------------------------------------

function generateGradesCertificatePDF(stream, studentData, certData) {
  const doc = new PDFDocument({
    size: 'letter',
    layout: 'portrait',
    margins: { top: 60, bottom: 60, left: 80, right: 80 }
  });
  doc.pipe(stream);
  _renderGradesCertificate(doc, studentData || {}, certData || {});
  doc.end();
}

function generateGraduationActPDF(stream, studentData, certData) {
  const doc = new PDFDocument({
    size: 'letter',
    layout: 'portrait',
    margins: { top: 60, bottom: 60, left: 80, right: 80 }
  });
  doc.pipe(stream);
  _renderGraduationAct(doc, studentData || {}, certData || {});
  doc.end();
}

function generateHighSchoolDiplomaPDF(stream, studentData, certData) {
  const doc = new PDFDocument({
    size: 'letter',
    layout: 'portrait',
    margins: { top: 60, bottom: 30, left: 80, right: 80 }
  });
  doc.pipe(stream);
  _renderHighSchoolDiploma(doc, studentData || {}, certData || {});
  doc.end();
}

/**
 * Renders the full three-document ecosystem into a single multi-page PDF
 * binary stream (the "packaged" deliverable).
 *
 * Page 1 — Certificado de Notas (portrait)
 * Page 2 — Acta de Grado (portrait)
 * Page 3 — Diploma de Bachiller (landscape)
 *
 * @param {WritableStream} stream
 * @param {Object} studentData
 * @param {Object} certData
 */
function generateHighSchoolDocumentPackPDF(stream, studentData, certData) {
  const doc = new PDFDocument({
    size: 'letter',
    layout: 'portrait',
    margins: { top: 60, bottom: 60, left: 80, right: 80 }
  });
  doc.pipe(stream);

  // Generate the random grade set once so all pages stay internally consistent.
  const enriched = { ...(certData || {}), grades: generateBachilleratoGrades(studentData && studentData.cedula) };

  _renderGradesCertificate(doc, studentData || {}, enriched);
  doc.addPage({ size: 'letter', layout: 'portrait', margins: { top: 60, bottom: 60, left: 80, right: 80 } });
  _renderGraduationAct(doc, studentData || {}, certData || {});
  doc.addPage({ size: 'letter', layout: 'portrait', margins: { top: 60, bottom: 30, left: 80, right: 80 } });
  _renderHighSchoolDiploma(doc, studentData || {}, certData || {});

  doc.end();
}

/**
 * Generic helper that materializes any stream-based pdfkit generator into an
 * in-memory Buffer (used for email attachments). DRY wrapper over the Writable
 * accumulator pattern.
 *
 * @param {Function} generator  stream-based pdfService generator
 * @param {...*} args           forwarded arguments (studentData, certData, …)
 * @returns {Promise<Buffer>}
 */
function pdfToBuffer(generator, ...args) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });
    stream.on('finish', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
    try {
      generator(stream, ...args);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Generates the default institutional certificate layout via pdfkit.
 * Streams the PDF directly to the provided writable stream.
 *
 * @param {WritableStream} stream - Target writable stream (e.g. Express Response)
 * @param {Object} data - { nombre_completo, cedula, fecha_emision, codigo_verificacion, ... }
 */
function generateDefaultCertificatePDF(stream, data) {
  const doc = new PDFDocument({
    size: 'letter',
    layout: 'landscape',
    margins: { top: 40, bottom: 40, left: 40, right: 40 }
  });

  doc.pipe(stream);

  // 1. Draw outer gold/emerald borders
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .lineWidth(4)
    .stroke('#0F2C59'); // Principal Blue

  doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56)
    .lineWidth(1.5)
    .stroke('#D4AF37'); // Gold accent

  // 2. Add decorative corners
  doc.rect(24, 24, 20, 20).lineWidth(1).stroke('#D4AF37');
  doc.rect(doc.page.width - 44, 24, 20, 20).lineWidth(1).stroke('#D4AF37');
  doc.rect(24, doc.page.height - 44, 20, 20).lineWidth(1).stroke('#D4AF37');
  doc.rect(doc.page.width - 44, doc.page.height - 44, 20, 20).lineWidth(1).stroke('#D4AF37');

  // 3. Official Logo
  const logoPath = path.join(__dirname, '..', 'assets', 'logo instituto superior del norte.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, doc.page.width / 2 - 50, 82, { width: 100 });
  }

  // 4. Header Text
  doc.y = 198;
  doc.fontSize(28)
    .font('Times-Bold')
    .fillColor('#0F2C59')
    .text('CERTIFICADO DE APROBACIÓN', { align: 'center' });

  doc.moveDown(0.3);
  doc.fontSize(11)
    .font('Helvetica-Bold')
    .fillColor('#D4AF37')
    .text(`REGISTRO N°: ${data.numero_certificado || ''}`, { align: 'center', characterSpacing: 1 });

  doc.moveDown(0.4);
  doc.fontSize(20)
    .font('Helvetica-Bold')
    .fillColor('#0F2C59')
    .text((data.curso_titulo || 'PROGRAMA FORMATIVO').toUpperCase(), { align: 'center', characterSpacing: 0.8 });

  doc.moveDown(1.0);
  doc.fontSize(13)
    .font('Helvetica')
    .fillColor('#475569')
    .text('Se otorga el presente documento de certificación y participación a:', { align: 'center' });

  // Student Name
  doc.moveDown(0.8);
  doc.fontSize(28)
    .font('Helvetica-Bold')
    .fillColor(ISN_BLUE)
    .text((data.nombre_completo || '').toUpperCase(), { align: 'center' });

  // Student ID
  doc.moveDown(0.4);
  doc.fontSize(13)
    .font('Helvetica')
    .fillColor('#1E293B')
    .text(`Cédula de Identidad N°: ${data.cedula || ''}`, { align: 'center' });

  // Course Details — dynamic per-course achievement text. Falls back to a
  // generic, course-agnostic statement (never the hardcoded food-hygiene text)
  // so every course reads correctly out of the box.
  doc.moveDown(0.9);
  const logroText = (data.certificado_logro && String(data.certificado_logro).trim())
    ? String(data.certificado_logro).trim()
    : 'Por haber cursado y aprobado satisfactoriamente la totalidad de los requisitos académicos y la evaluación de conocimientos correspondiente al programa formativo.';
  doc.fontSize(11)
    .font('Helvetica')
    .fillColor('#475569')
    .text(logroText, { align: 'center' });

  // Hours intensity & Grade
  doc.moveDown(0.7);
  doc.fontSize(10)
    .font('Helvetica-Oblique')
    .fillColor('#64748B')
    .text('Intensidad Horaria: 3 Horas Lectivas', { align: 'center' });

  // ----- Footer: Rector handwritten signature, centered on its rule -----
  // Anchored to the page bottom so a long achievement text can never collide
  // with this block; the verification metadata sits still lower.
  const colW = 250;
  const firmaX = (doc.page.width - colW) / 2;
  const lineY = doc.page.height - 115;

  // Real Rector signature image enlarged and resting its baseline on the rule
  // (bottom edge aligned to lineY) so it no longer floats above it.
  const firmaFit = [160, 56];
  const firmaRectorPath = getAssetPath('firma1.png');
  if (firmaRectorPath) {
    doc.image(firmaRectorPath, firmaX + (colW - firmaFit[0]) / 2, lineY - firmaFit[1], {
      fit: firmaFit,
      align: 'center',
      valign: 'bottom'
    });
  }
  doc.moveTo(firmaX, lineY).lineTo(firmaX + colW, lineY).lineWidth(1).stroke('#94A3B8');
  doc.fontSize(10).font('Helvetica-Bold').fillColor(ISN_BLUE)
    .text(RECTOR.nombre, firmaX, lineY + 6, { width: colW, align: 'center' });
  doc.fontSize(9).font('Helvetica-Oblique').fillColor('#64748B')
    .text(`${RECTOR.cargo} — Instituto Superior del Norte`, firmaX, lineY + 20, { width: colW, align: 'center' });

  // Footer Verification Metadata — verification code only. The public verify
  // URL was removed from the document body by design; third parties validate
  // diplomas directly via the /verify portal.
  doc.fontSize(9)
    .font('Courier')
    .fillColor('#64748B')
    .text(`CÓDIGO DE VERIFICACIÓN: ${data.codigo_verificacion || ''}`, 40, doc.page.height - 65, { align: 'center' });

  doc.end();
}

/**
 * Renders an interpolated HTML template to a PDF Buffer using headless Chromium.
 *
 * @param {string} htmlContent - Fully interpolated HTML string
 * @returns {Promise<Buffer>}  - PDF buffer ready for streaming or email attachment
 */
async function generateHTMLCertificatePDF(htmlContent) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (e) {
    throw new Error('puppeteer no está instalado. Ejecute npm install en el backend.');
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'letter',
      landscape: true,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Main dispatcher: generates a certificate PDF to the given stream.
 * If an interpolated HTML template is provided, renders it via Puppeteer;
 * otherwise falls back to the default pdfkit institutional layout.
 *
 * @param {WritableStream} stream    - Target writable stream
 * @param {Object} data              - Certificate data
 * @param {string|null} htmlTemplate - Interpolated HTML template (optional)
 * @returns {Promise<void>}
 */
async function generateCertificatePDF(stream, data, htmlTemplate = null) {
  if (htmlTemplate) {
    const pdfBuffer = await generateHTMLCertificatePDF(htmlTemplate);
    return new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
      stream.end(pdfBuffer);
    });
  }
  generateDefaultCertificatePDF(stream, data);
}

module.exports = {
  generateCertificatePDF,
  generateDefaultCertificatePDF,
  generateHTMLCertificatePDF,
  // Bachillerato Académico ecosystem (native pdfkit)
  generateGradesCertificatePDF,
  generateGraduationActPDF,
  generateHighSchoolDiplomaPDF,
  generateHighSchoolDocumentPackPDF,
  pdfToBuffer,
  // Pure domain helpers (centralized per KISS/DRY)
  generateBachilleratoGrades,
  mapQualitativeGrade,
  isHighSchoolCourse
};
