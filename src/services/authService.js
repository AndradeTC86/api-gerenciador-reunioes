const jwt = require('jsonwebtoken');
const { users } = require('../models/database');

const SECRET = process.env.JWT_SECRET || 'segredo_mentoria_2026';

function login(email, password) {
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return null;

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: '8h' }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

module.exports = { login };
