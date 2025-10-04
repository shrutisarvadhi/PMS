const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();
const SALT_ROUNDS = 10;
const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return process.env.JWT_SECRET;
};

const normaliseUsername = (username) => (typeof username === 'string' ? username.trim() : '');

const buildToken = (user) => {
  const payload = { id: user.id, username: user.username, role: user.role };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '1h' });
};

router.post('/register', async (req, res) => {
  try {
    console.log("#################",req.body);
    const username = normaliseUsername(req.body.username);
    const password = req.body.password;
    console.log(username, password);
    
   if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, password: hashedPassword });

    const token = buildToken(user);
    console.log(token);
    
    return res.status(201).json({ token, role: user.role });
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: error.errors?.[0]?.message || 'Validation error' });
    }

    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const username = normaliseUsername(req.body.username);
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.scope('withPassword').findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: INVALID_CREDENTIALS_MESSAGE });
    }

    const token = buildToken(user);

    return res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
