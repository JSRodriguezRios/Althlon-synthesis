// Librería simple para UI toggles y helpers
const ALS = {
  qs: selector => document.querySelector(selector),
  qsa: selector => document.querySelectorAll(selector),
  on: (el, event, fn) => el.addEventListener(event, fn),
  toggleClass: (el, cls) => el.classList.toggle(cls),
};
