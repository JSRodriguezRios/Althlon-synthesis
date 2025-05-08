// server.js
require('dotenv').config();
const express = require('express');
const path    = require('path');
const fs      = require('fs').promises;
const { OrderService } = require('./paypalService');

const app    = express();
const PORT   = process.env.PORT || 3000;
const disk   = process.env.RENDER_DISK_PATH || path.join(__dirname, 'data');
const csv    = path.join(disk, 'subscriptions.csv');

// Inicializa el CSV
(async function initStorage() {
  await fs.mkdir(disk, { recursive: true });
  try {
    await fs.access(csv);
  } catch {
    await fs.writeFile(csv,
      `Timestamp,Email,Plan,Duration,OrderID,TransactionID,Status\n`
    );
    console.log('📂 subscriptions.csv creado');
  }
})();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Crear orden
app.post('/api/orders', async (req, res) => {
  const { plan, duration } = req.body;
  if (!plan || !duration) {
    return res.status(400).json({ error: 'Plan y duración son requeridos.' });
  }
  try {
    const order = await OrderService.createOrder(plan, duration);
    res.json(order);
  } catch (err) {
    console.error('❌ createOrder:', err);
    res.status(500).json({ error: 'Error al crear orden.' });
  }
});

// Capturar & registrar
app.post('/api/orders/:orderID/capture', async (req, res) => {
  const { orderID } = req.params;
  const { userEmail, plan, duration } = req.body;
  if (!userEmail || !plan || !duration) {
    return res.status(400).json({ error: 'Faltan datos para capturar pago.' });
  }
  try {
    const capture = await OrderService.captureOrder(orderID);
    const status  = capture.status;
    const txId    = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id || capture.id;
    const line    = `${new Date().toISOString()},${userEmail},${plan},${duration},${orderID},${txId},${status}\n`;
    await fs.appendFile(csv, line);
    if (status === 'COMPLETED') return res.json(capture);
    return res.status(400).json({ error: `Pago no completado (Estado: ${status})` });
  } catch (err) {
    console.error('❌ captureOrder:', err);
    res.status(500).json({ error: 'Error al capturar pago.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`ENV: ${process.env.NODE_ENV}`);
  console.log(`PayPal ID loaded: ${!!process.env.PAYPAL_CLIENT_ID}`);
  console.log(`Disk path: ${disk}`);
});

