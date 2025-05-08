// paypalService.js

const paypal = require('@paypal/checkout-server-sdk');

// ——— Configuración de precios y duración ———
const planPrices = {
  platinium: 30,  // precio por mes en USD
  oro:       20,
  bronce:    10
};

const durationMap = {
  '1_mes':    1,
  '6_meses':  6,
  '12_meses': 12
};

// ——— Entorno de PayPal (sandbox vs live) ———
function environment() {
  const id     = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (process.env.NODE_ENV === 'live' || process.env.NODE_ENV === 'production') {
    console.log('⚙️ Usando LiveEnvironment de PayPal');
    return new paypal.core.LiveEnvironment(id, secret);
  }

  console.log('⚙️ Usando SandboxEnvironment de PayPal');
  return new paypal.core.SandboxEnvironment(id, secret);
}

// Cliente HTTP de PayPal
const client = () => new paypal.core.PayPalHttpClient(environment());

// ——— Calculadora de montos ———
const PaymentCalculator = {
  total(plan, duration) {
    const price  = planPrices[plan] || 0;
    const months = durationMap[duration] || 1;
    return price * months;
  }
};

// ——— Servicios de orden y captura ———
const OrderService = {
  async createOrder(plan, duration) {
    const amount = PaymentCalculator.total(plan, duration).toFixed(2);
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount,
          description: `Suscripción: ${plan} — Duración: ${duration}`
        }
      }]
    });

    const response = await client().execute(request);
    return response.result;
  },

  async captureOrder(orderId) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client().execute(request);
    return response.result;
  }
};

module.exports = { OrderService, PaymentCalculator };

