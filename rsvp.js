(() => {
  if (new URLSearchParams(location.search).get('rsvp') === 'off') {
    document.querySelector('.rsvp-section')?.remove();
    return;
  }
  const form = document.getElementById('rsvp-form');
  const details = document.getElementById('rsvp-details');
  const status = document.getElementById('rsvp-status');
  const button = form.querySelector('button[type="submit"]');
  let sending = false;
  function updateAttendance() {
    const attending = form.querySelector('input[name="attending"]:checked')?.value === 'Yes';
    details.hidden = !attending;
    details.disabled = !attending;
  }
  form.addEventListener('change', updateAttendance);
  updateAttendance();
  button.disabled = !form.dataset.endpoint;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.dataset.endpoint) return;
    form.elements.namedItem('name').value = form.elements.namedItem('name').value.trim();
    if (!form.reportValidity()) return;
    sending = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    status.textContent = 'Saving your RSVP…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(form.dataset.endpoint, {
        method: 'POST', body: new URLSearchParams(new FormData(form)), signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error('Submission not confirmed');
      form.hidden = true;
      form.style.display = 'none';
      status.textContent = 'Thank you. Your RSVP has been saved!';
      status.focus({ preventScroll: true });
    } catch {
      status.textContent = 'We couldn’t confirm your RSVP. Please try again, or use the form link below.';
    } finally {
      clearTimeout(timeout);
      sending = false;
      button.disabled = false;
      button.textContent = 'Submit RSVP';
    }
  });
})();
