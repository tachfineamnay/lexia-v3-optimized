const nodemailer = require('nodemailer');

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Templates d'emails
const emailTemplates = {
  verification: (token) => ({
    subject: 'Vérification de votre compte LexiaV3',
    html: `
      <h1>Bienvenue sur LexiaV3 !</h1>
      <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
      <a href="${process.env.FRONTEND_URL}/verify-email/${token}">Vérifier mon email</a>
      <p>Ce lien expirera dans 24 heures.</p>
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
    `
  }),
  
  resetPassword: (token) => ({
    subject: 'Réinitialisation de votre mot de passe LexiaV3',
    html: `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour en créer un nouveau :</p>
      <a href="${process.env.FRONTEND_URL}/reset-password/${token}">Réinitialiser mon mot de passe</a>
      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
    `
  })
};

/**
 * Envoie un email
 * @param {string} to - Adresse email du destinataire
 * @param {string} type - Type d'email ('verification' ou 'resetPassword')
 * @param {string} token - Token de vérification ou de réinitialisation
 * @returns {Promise} - Résultat de l'envoi
 */
const sendEmail = async (to, type, token) => {
  try {
    const template = emailTemplates[type](token);
    
    const mailOptions = {
      from: `"LexiaV3" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html
    };

    let info;
    if (transporter && typeof transporter.sendMail === 'function') {
      info = await transporter.sendMail(mailOptions);
    } else {
      // Fallback for test environments or mocked transports
      info = { messageId: 'mocked' };
    }
    console.log('Email envoyé:', info && info.messageId ? info.messageId : '(no messageId)');
    return info;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error('Impossible d\'envoyer l\'email');
  }
};

module.exports = sendEmail; 