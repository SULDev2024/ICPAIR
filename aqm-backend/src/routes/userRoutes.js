const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendVerificationEmail = require('../utils/sendEmail');

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken
    });

    await sendVerificationEmail(email, verificationToken);
    res.json({ message: 'Письмо для подтверждения отправлено на email' });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Подтверждение email
router.get('/verify', async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({ where: { verificationToken: token } });
  if (!user) return res.status(400).send("Неверный или просроченный токен");

  user.isVerified = true;
  user.verificationToken = null;
  await user.save();

  res.send("Email подтверждён! Теперь вы можете войти.");
});

// Вход
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: 'Неверный email или пароль' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Неверный email или пароль' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Подтвердите email перед входом' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'Вход успешен', token, username: user.username });
});

// Повторная отправка письма
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Пользователь с таким email не найден" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email уже подтверждён" });
    }

    // Генерация нового токена
    user.verificationToken = crypto.randomBytes(32).toString('hex');
    await user.save();

    await sendVerificationEmail(email, user.verificationToken);
    res.json({ message: "Письмо повторно отправлено на email" });
  } catch (err) {
    console.error("Ошибка при повторной отправке письма:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
