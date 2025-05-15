const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false },
  logger: true
});

async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: `"DSARENA" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: text || (html ? html.replace(/<[^>]*>/g, '') : ''),
    html,
    headers: { 'X-Priority': '1' }
  };

  try {
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}

module.exports = sendEmail;