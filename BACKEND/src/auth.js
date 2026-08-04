const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Vérifie les identifiants admin et renvoie un token si valides.
 */
function login(username, password) {
  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    throw new Error('ADMIN_USERNAME / ADMIN_PASSWORD non configurés côté serveur.');
  }

  if (username !== validUsername || password !== validPassword) {
    return null;
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  return token;
}

/**
 * Middleware Express : bloque la requête si le token est absent/invalide.
 */
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter.' });
  }
}

module.exports = { login, requireAdmin };