// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos de /public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Endpoint para gestionar suscripciones
app.post('/api/subscribe', (req, res) => {
  const { email, plan, duration } = req.body;
  console.log(`Nueva suscripción: ${email} · Plan: ${plan} · Duración: ${duration}`);
  // Aquí iría la lógica real de guardar la suscripción
  res.json({ success: true, message: '¡Suscripción exitosa!' });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

