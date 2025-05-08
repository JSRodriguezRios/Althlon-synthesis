// public/js/paypal.js

// Helper rápido para document.querySelector
const $ = s => document.querySelector(s);

document.addEventListener('DOMContentLoaded', () => {
  if (typeof paypal === 'undefined') {
    console.error("PayPal SDK no cargado");
    $('#payment-message').textContent = 'Error: PayPal SDK no pudo cargarse.';
    return;
  }

  paypal.Buttons({
    createOrder: async () => {
      const plan     = $('#planSelect').value;
      const duration = $('#durationSelect').value;
      const email    = $('#email').value;
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert('Por favor ingresa un correo válido');
        return Promise.reject();
      }
      $('#payment-message').textContent = 'Creando orden…';
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ plan, duration })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error creando orden');
      return data.id;
    },
    onApprove: async ({ orderID }) => {
      $('#payment-message').textContent = 'Capturando pago…';
      const userEmail = $('#email').value;
      const plan      = $('#planSelect').value;
      const duration  = $('#durationSelect').value;
      const res = await fetch(`/api/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ userEmail, plan, duration })
      });
      const details = await res.json();
      if (res.ok && details.status === 'COMPLETED') {
        alert('¡Pago completado con éxito!');
        $('#payment-message').textContent = '';
      } else {
        throw new Error(details.error || `Estado: ${details.status}`);
      }
    },
    onError: err => {
      console.error(err);
      $('#payment-message').textContent = 'Error con PayPal. Intenta de nuevo.';
    },
    onCancel: () => {
      $('#payment-message').textContent = 'Pago cancelado.';
    }
  }).render('#paypal-button-container');
});

