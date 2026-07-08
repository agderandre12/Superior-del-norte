const bcrypt = require('bcryptjs');
const db = require('../repositories/dbRepository');
const { normalizeToUtf8, signToken } = require('../middleware/auth');

// Password policy: min 8 chars, at least one letter and one number.
const PASSWORD_POLICY = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const PASSWORD_POLICY_MSG =
  'La contraseña debe tener mínimo 8 caracteres e incluir al menos una letra y un número.';

async function login(req, res, next) {
  const { cedula, password } = req.body;

  if (!cedula || !password) {
    return res.status(400).json({ error: 'La cédula y la contraseña son obligatorias' });
  }

  if (!/^\d{6,12}$/.test(cedula)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_CEDULA', message: 'La cédula debe contener únicamente números' } });
  }

  try {
    const user = await db.getUser(cedula);
    // Use the same generic failure message for "user not found" and "bad
    // password" to avoid user-enumeration via timing or distinct messages.
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'Cédula o contraseña incorrectas' } });
    }

    // Use async compare to avoid blocking the event loop on bcrypt hashing.
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'Cédula o contraseña incorrectas' } });
    }

    const cleanNombre = normalizeToUtf8(user.nombre_completo);
    const token = signToken(
      { cedula: user.cedula, nombre_completo: cleanNombre, rol: user.rol },
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        cedula: user.cedula,
        nombre_completo: cleanNombre,
        rol: user.rol
      }
    });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  const { cedula, nombre_completo, password } = req.body;

  if (!cedula || !nombre_completo || !password) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Todos los campos son obligatorios' } });
  }

  if (!/^\d{6,12}$/.test(cedula)) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_CEDULA', message: 'La cédula debe contener únicamente números' } });
  }

  if (!PASSWORD_POLICY.test(password)) {
    return res.status(400).json({ success: false, error: { code: 'WEAK_PASSWORD', message: PASSWORD_POLICY_MSG } });
  }

  try {
    const existingUser = await db.getUser(cedula);
    if (existingUser) {
      return res.status(400).json({ success: false, error: { code: 'USER_EXISTS', message: 'El usuario ya está registrado' } });
    }

    const cleanNombreInput = normalizeToUtf8(String(nombre_completo).trim());
    const newUser = await db.createUser(cedula, cleanNombreInput, password);
    res.status(201).json({
      message: 'Usuario registrado con éxito',
      user: {
        cedula: newUser.cedula,
        nombre_completo: normalizeToUtf8(newUser.nombre_completo),
        rol: newUser.rol
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  register
};
