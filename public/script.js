// script.js

// ─────────────────────────────────────────────────────────────────────────────
// PaymentCalculator Module
// ─────────────────────────────────────────────────────────────────────────────
const PaymentCalculator = (() => {
  const prices = { platinium: 25, oro: 18, bronce: 12 };

  /**
   * @param {string} plan    – 'platinium'|'oro'|'bronce'
   * @param {string} duration– '1_mes'|'6_meses'|'12_meses'
   * @returns {number} total a cobrar
   */
  function total(plan, duration) {
    const months = duration === '1_mes'
      ? 1
      : duration === '6_meses'
        ? 6
        : 12;
    return prices[plan] * months;
  }

  return { total };
})();


// ─────────────────────────────────────────────────────────────────────────────
// PayPal Client Module
// ─────────────────────────────────────────────────────────────────────────────
const paypal = require('@paypal/checkout-server-sdk');

/**
 * Construye y devuelve un cliente REST de PayPal.
 * Usa credenciales desde las env vars:
 *   PAYPAL_CLIENT_ID
 *   PAYPAL_CLIENT_SECRET
 */
const PayPalClient = (() => {
  const env = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
  return new paypal.core.PayPalHttpClient(env);
})();


// ─────────────────────────────────────────────────────────────────────────────
// OrderService Module
// ─────────────────────────────────────────────────────────────────────────────
const OrderService = (() => {
  /**
   * Crea una orden en PayPal para el plan y duración indicados.
   * @returns {Promise<object>} datos de la orden (incluye id y links)
   */
  async function createOrder(plan, duration) {
    const amount = PaymentCalculator.total(plan, duration).toFixed(2);

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount
        }
      }]
    });

    const response = await PayPalClient.execute(request);
    return response.result;  // { id, status, links, ... }
  }

  /**
   * Captura (autoriza) la orden en PayPal tras el flujo de aprobación.
   * @param {string} orderId – ID de la orden creada
   * @returns {Promise<object>} detalles de la captura
   */
  async function captureOrder(orderId) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({}); 
    const response = await PayPalClient.execute(request);
    return response.result; // { id, status, purchase_units, ... }
  }

  return { createOrder, captureOrder };
})();


// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
module.exports = { PaymentCalculator, OrderService };
