const authService = require('../services/auth.service');
const jwt = require('jsonwebtoken');

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
async function checkAuthStatus(req, res) {
  	 const auth = req.headers.authorization;
      if (!auth) return res.status(200).json({ isAuthenticated: false,user:null });
	 const parts = auth.split(' ');
	 if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid authorization format' });
	 const token = parts[1];
  try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = payload;
    const { isAuthenticated, user } = await authService.checkAuth(req.user.id);
    res.json({ isAuthenticated,user });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
} 
async function fetchProfile(req, res) {
  try {
    const {user } = await authService.getProfile(req.body);
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}
async function logout(req, res) {
  try {
   // const { user, token } = await authService.loginUser(req.body);
    res.json({ message: 'logout successfullly' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}
module.exports = { register, login,logout ,fetchProfile,checkAuthStatus};
