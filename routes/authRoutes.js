const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// @route   POST api/auth/login
// @desc    Autenticar usuário e obter token
// @access  Public
router.post('/login', login);

module.exports = router;