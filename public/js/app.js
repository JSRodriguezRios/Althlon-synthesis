// Lógica de interacción en la página
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
