const authService = require('../services/auth.service');

async function register(req, res) {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { user, token } = await authService.loginUser(req.body);
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

module.exports = { register, login };
