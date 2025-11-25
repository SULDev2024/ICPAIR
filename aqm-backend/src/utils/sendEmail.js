const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendVerificationEmail(to, token) {
  const verifyUrl = `http://localhost:5000/api/users/verify?token=${token}`;


  await transporter.sendMail({
    from: `"TynysAI" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Подтверждение регистрации",
    html: `
      <h3>Подтверждение Email</h3>
      <p>Пожалуйста, подтвердите свою регистрацию, нажав на ссылку ниже:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `
  });
}

module.exports = sendVerificationEmail;
