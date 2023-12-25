const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');
const http = require('http');
const app = express();
const port = 5500;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'eugeniaprevato15@gmail.com',
    pass: process.env.GMAIL_PASSWORD, // Usa GMAIL_PASSWORD invece di GMAIL_USER
  },
});

const resetTokens = new Map();

app.get('/logodue.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/logodue.html'));
});

app.get('/registrazione.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/registrazione.html'));
});

app.get('/registrati.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/registrati.html'));
});

app.get('/cliccaqui.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/cliccaqui.html'));
});

app.post('/registrati.html', (req, res) => {
  res.redirect('/home.html');
});

app.post('/cliccaqui.html', (req, res) => {
  res.redirect('/home.html');
});

app.get('/recuperaccount.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/recuperaccount.html'));
});

app.post('/recuperaccount.html', (req, res) => {
  const email = req.body.email;
  const token = crypto.randomBytes(20).toString('hex');
  resetTokens.set(email, { token, timestamp: Date.now() });
  const resetLink = `http://localhost:5500/reset-password/${token}`;
  const mailOptions = {
    from: 'eugeniaprevato15@gmail.com',
    to: email,
    subject: 'Reset Password',
    text: `Hai richiesto il reset della password. Clicca sul link seguente per reimpostare la tua password: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Errore durante l\'invio dell\'email di reset: ' + error.message);
    } else {
      console.log('Email inviata: ' + info.response);
      res.redirect('/home.html');
    }
  });
});

app.get('/reset-password/:token', (req, res) => {
  const token = req.params.token;
  if (resetTokens.has(token)) {
    res.sendFile(path.join(__dirname, '/reset-password.html'));
  } else {
    res.status(400).send('Link di reset password non valido o scaduto.');
  }
});

app.post('/reset-password/:token', (req, res) => {
  const token = req.params.token;
  const newPassword = req.body.password;

  if (resetTokens.has(token)) {
    resetTokens.delete(token);
    res.redirect('/home.html');
  } else {
    res.status(400).send('Link di reset password non valido o scaduto.');
  }
});

app.listen(port, () => {
  console.log('Server listening at http://localhost:' + port);
});
