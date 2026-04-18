const authService = require('../services/authService');

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  const result = authService.login(email, password);

  if (!result) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  return res.status(200).json(result);
}

module.exports = { login };
