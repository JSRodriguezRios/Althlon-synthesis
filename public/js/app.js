// Lógica de interacción en la página
// Selecciones
const planSelect     = ALS.qs('#planSelect');
const durationSelect = ALS.qs('#durationSelect');
const paymentBox     = ALS.qs('#paymentBox');

// Tarifas mensuales
const prices = { platinium: 25, oro: 18, bronce: 12 };

// Función que recalcula el total
function updatePayment() {
  const plan     = planSelect.value;
  const durValue = durationSelect.value;
  const months   = durValue === '1_mes' ? 1
                 : durValue === '6_meses' ? 6
                 : 12;
  const total    = prices[plan] * months;
  paymentBox.textContent = `Total a pagar: $${total.toFixed(2)}`;
}

// Escucha cambios y calcula al cargar
ALS.on(planSelect, 'change', updatePayment);
ALS.on(durationSelect, 'change', updatePayment);
updatePayment();

window.addEventListener('DOMContentLoaded', () => {
  const subscribeForm = ALS.qs('#subscribeForm');
  ALS.on(subscribeForm, 'submit', async e => {
    e.preventDefault();
    const email = ALS.qs('#email').value;
    const plan = ALS.qs('#planSelect').value;
    const duration = ALS.qs('#durationSelect').value;

    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, plan, duration })
    });
    const result = await response.json();
    alert(result.message);
  });
});
