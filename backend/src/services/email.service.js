const nodemailer = require("nodemailer");

// Configuració del transportador de correu
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: process.env.MAIL_USER && process.env.MAIL_PASS
    ? {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      }
    : undefined,
});
// Funció per enviar un correu electrònic
const sendEmail = async ({ to, subject, html }) => {
  if (!to) return;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to,
    subject,
    html,
  });
};
// Funcions per construir el contingut dels correus electrònics de reserva
const buildReservationCreatedEmail = ({
  nom,
  codi_reserva,
  nom_pista,
  data_reserva,
  hora_inici,
  hora_fi,
  preu_total,
  estat_pagament,
}) => {
  return `
    <h2>Reserva confirmada</h2>
    <p>Hola ${nom},</p>
    <p>La teva reserva s'ha creat correctament.</p>
    <ul>
      <li><strong>Codi de reserva:</strong> ${codi_reserva}</li>
      <li><strong>Pista:</strong> ${nom_pista}</li>
      <li><strong>Data:</strong> ${data_reserva}</li>
      <li><strong>Hora:</strong> ${hora_inici} - ${hora_fi}</li>
      <li><strong>Preu total:</strong> ${Number(preu_total).toFixed(2)} €</li>
      <li><strong>Estat del pagament:</strong> ${estat_pagament}</li>
    </ul>
    <p>Gràcies per confiar en PadelBook.</p>
  `;
};
// Funció per construir el contingut del correu electrònic de cancel·lació de reserva
const buildReservationCancelledEmail = ({
  nom,
  codi_reserva,
  nom_pista,
  data_reserva,
  hora_inici,
  hora_fi,
}) => {
  return `
    <h2>Reserva cancel·lada</h2>
    <p>Hola ${nom},</p>
    <p>La teva reserva ha estat cancel·lada correctament.</p>
    <ul>
      <li><strong>Codi de reserva:</strong> ${codi_reserva}</li>
      <li><strong>Pista:</strong> ${nom_pista}</li>
      <li><strong>Data:</strong> ${data_reserva}</li>
      <li><strong>Hora:</strong> ${hora_inici} - ${hora_fi}</li>
    </ul>
    <p>Si ha estat un error, pots tornar a fer la reserva des de la plataforma.</p>
  `;
};

module.exports = {
  sendEmail,
  buildReservationCreatedEmail,
  buildReservationCancelledEmail,
};