const User = require('../models/user.model');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new Error('Email already in use');
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  return user;
}

async function loginUser({ email, password }) {
    const user = await User.findOne({ email})
      // Populate the 'role' field
      .populate({
        path: 'role',
        // Within the 'role' document, populate the 'capabilities' field
        populate: {
          path: 'permissions',
          model: 'Permission' // Specify the model name for clarity
        }
      })
      .exec(); 

  
  if (!user) throw new Error('Invalid credentials');
  if (!user.password) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');

  const payload = { id: user._id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  return { user, token };
}
async function getProfile({ email }) {
    const user = await User.findOne({ email})
      // Populate the 'role' field
      .populate({
        path: 'role',
        // Within the 'role' document, populate the 'capabilities' field
        populate: {
          path: 'permissions',
          model: 'Permission' // Specify the model name for clarity
        }
      })
      .exec(); 

  return { user };
}
async function checkAuth(id) {
    const user = await User.findById(id).lean();
    const isAuthenticated = !!user;
    return { isAuthenticated,user };
}
module.exports = { registerUser, loginUser ,getProfile, checkAuth };  