import nodemailer from 'nodemailer';

// Only create transporter if SMTP config is present
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const sendEmail = async ({ to, subject, html, text }) => {
  // If no transporter, just log and resolve
  if (!transporter) {
    console.log(`📧 Email not sent – SMTP not configured. To: ${to}, Subject: ${subject}`);
    console.log(`Body: ${html || text}`);
    return { messageId: 'mock' };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"UniPulse" <noreply@unipulse.com>',
    to,
    subject,
    text: text || '',
    html: html || '',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    // Log the error but don't throw – the main operation should still succeed
    console.error('Email send failed (will continue):', err.message);
    return { messageId: null, error: err.message };
  }
};