/* Afterglow Spa — booking request form: validation + submission. */
(function () {
  'use strict';

  var DEFAULT_LIMITS = { name: 80, email: 120, phone: 30, notes: 600 };
  var MIN_NAME_LENGTH = 2;
  var MIN_FILL_MS = 3000;          // faster than this is almost certainly a bot
  var REQUEST_TIMEOUT_MS = 15000;
  var MAX_DAYS_AHEAD = 180;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^[+()\d\s.-]{6,30}$/;
  var CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

  var form = document.querySelector('[data-booking-form]');
  if (!form) return;
  var statusEl = form.querySelector('[data-form-status]');
  var limits = parseLimits(form.getAttribute('data-limits'));
  var startedAt = Date.now();

  function parseLimits(json) {
    try {
      var parsed = JSON.parse(json);
      return Object.assign({}, DEFAULT_LIMITS, parsed);
    } catch (err) {
      console.warn('Afterglow: invalid field limits, using defaults.', err);
      return DEFAULT_LIMITS;
    }
  }

  function isoDate(d) {
    var local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function setupDateBounds() {
    var input = form.elements.date;
    var today = new Date();
    var max = new Date(today.getTime() + MAX_DAYS_AHEAD * 86400000);
    input.min = isoDate(today);
    input.max = isoDate(max);
  }

  function preselectTreatment() {
    var slug = new URLSearchParams(window.location.search).get('treatment');
    if (!slug) return;
    var select = form.elements.treatment;
    var match = Array.prototype.find.call(select.options, function (o) { return o.dataset.slug === slug; });
    if (match) select.value = match.value;
  }

  function optionValues(select) {
    return Array.prototype.map.call(select.options, function (o) { return o.value; }).filter(Boolean);
  }

  function value(name) {
    var el = form.elements[name];
    return el ? String(el.value).trim() : '';
  }

  /** Returns { fieldName: message } for every invalid field. */
  function validate() {
    var errors = {};
    var name = value('name');
    if (name.length < MIN_NAME_LENGTH || name.length > limits.name || CONTROL_CHARS_RE.test(name)) errors.name = 'Please enter your name.';
    var email = value('email');
    if (!EMAIL_RE.test(email) || email.length > limits.email) errors.email = 'Please enter a valid email address.';
    var phone = value('phone');
    if (phone && (!PHONE_RE.test(phone) || phone.length > limits.phone)) errors.phone = 'Please enter a valid phone number, or leave it blank.';
    if (optionValues(form.elements.treatment).indexOf(value('treatment')) === -1) errors.treatment = 'Please choose a treatment.';
    var date = value('date');
    var dateInput = form.elements.date;
    if (!date || date < dateInput.min || date > dateInput.max) errors.date = 'Please choose a date between today and the next six months.';
    if (optionValues(form.elements.time).indexOf(value('time')) === -1) errors.time = 'Please choose a preferred time.';
    if (value('notes').length > limits.notes || CONTROL_CHARS_RE.test(value('notes'))) errors.notes = 'Please keep notes under ' + limits.notes + ' characters.';
    if (!form.elements.consent.checked) errors.consent = 'Please confirm your age and that you’ve read our etiquette.';
    return errors;
  }

  function showErrors(errors) {
    var firstInvalid = null;
    ['name', 'email', 'phone', 'treatment', 'date', 'time', 'notes', 'consent'].forEach(function (field) {
      var input = form.elements[field];
      var msgEl = form.querySelector('#bk-' + field + '-error');
      var message = errors[field] || '';
      if (msgEl) msgEl.textContent = message;
      if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (message && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) firstInvalid.focus();
  }

  function setStatus(message, kind) {
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', kind === 'error');
    statusEl.classList.toggle('is-success', kind === 'success');
  }

  function payload() {
    return {
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      treatment: value('treatment'),
      date: value('date'),
      time: value('time'),
      therapist: value('therapist'),
      notes: value('notes'),
      _subject: 'Booking request — ' + value('treatment') + ' on ' + value('date'),
    };
  }

  function sendViaEmail(data) {
    var to = form.getAttribute('data-email');
    var lines = ['Name: ' + data.name, 'Email: ' + data.email, 'Phone: ' + (data.phone || '—'),
      'Treatment: ' + data.treatment, 'Date: ' + data.date, 'Time: ' + data.time,
      'Therapist preference: ' + data.therapist, '', data.notes];
    window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(data._subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    setStatus('Your email app should now open with your request ready to send.', 'success');
  }

  function sendViaEndpoint(endpoint, data, button) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS);
    button.disabled = true;
    setStatus('Sending your request…');
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    }).then(function (res) {
      if (!res.ok) throw new Error('Request failed with status ' + res.status);
      form.reset();
      setStatus('Thank you — your request is in. We’ll confirm personally, usually within a few hours.', 'success');
    }).catch(function (err) {
      console.error('Afterglow: booking request failed.', err.name);
      setStatus('Sorry, we couldn’t send that. Please try again or call us directly.', 'error');
    }).finally(function () {
      clearTimeout(timer);
      button.disabled = false;
    });
  }

  function onSubmit(event) {
    event.preventDefault();
    var isBot = value('company') !== '' || Date.now() - startedAt < MIN_FILL_MS;
    var errors = validate();
    showErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus('Please check the highlighted fields.', 'error');
      return;
    }
    if (isBot) {
      setStatus('Thank you — your request is in.', 'success');
      return;
    }
    var endpoint = form.getAttribute('data-endpoint');
    var data = payload();
    if (endpoint) sendViaEndpoint(endpoint, data, form.querySelector('[type="submit"]'));
    else sendViaEmail(data);
  }

  setupDateBounds();
  preselectTreatment();
  form.addEventListener('submit', onSubmit);
})();
