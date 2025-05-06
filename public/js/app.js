// script.js

// ─────────────────────────────────────────────────────────────────────────────
// PaymentCalculator Module
// ─────────────────────────────────────────────────────────────────────────────
const PaymentCalculator = (() => {
  const prices = { platinium: 25, oro: 18, bronce: 12 };

  /**
   * Calcula el total a pagar dado un plan y una duración.
   * @param {string} plan – "platinium"|"oro"|"bronce"
   * @param {string} duration – "1_mes"|"6_meses"|"12_meses"
   * @returns {number} Total en moneda local.
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
// SubscriptionService Module (simula backend con localStorage)
// ─────────────────────────────────────────────────────────────────────────────
const SubscriptionService = (() => {
  const STORAGE_KEY = 'als_subscriptions';

  function loadAll() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  function saveAll(subs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
  }

  /**
   * Registra una nueva suscripción.
   * @param {{email:string, plan:string, duration:string}} data
   * @returns {Promise<{success:boolean}>}
   */
  async function subscribe(data) {
    const list = loadAll();
    list.push({ ...data, date: new Date().toISOString() });
    saveAll(list);
    return { success: true };
  }

  return { subscribe, list: loadAll };
})();


// ─────────────────────────────────────────────────────────────────────────────
// UIController Module
// ─────────────────────────────────────────────────────────────────────────────
const UIController = (() => {
  const $ = selector => document.querySelector(selector);

  function updatePaymentBox() {
    const plan = $('#planSelect').value;
    const dur  = $('#durationSelect').value;
    const amount = PaymentCalculator.total(plan, dur).toFixed(2);
    $('#paymentBox').textContent = `Total a pagar: $${amount}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      email:    $('#email').value,
      plan:     $('#planSelect').value,
      duration: $('#durationSelect').value
    };
    const res = await SubscriptionService.subscribe(payload);
    alert(res.success
      ? '¡Suscripción exitosa!'
      : 'Ha ocurrido un error, inténtalo de nuevo.');
  }

  function init() {
    $('#planSelect').addEventListener('change', updatePaymentBox);
    $('#durationSelect').addEventListener('change', updatePaymentBox);
    updatePaymentBox();

    $('#subscribeForm').addEventListener('submit', handleSubmit);
  }

  return { init };
})();


// ─────────────────────────────────────────────────────────────────────────────
// Arranque de la aplicación
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', UIController.init);
