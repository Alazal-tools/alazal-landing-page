import { contacts, destinations } from '../data/places.js';
import { routes, points } from '../data/routes.js';

export function initArrival() {
  const section = document.querySelector('#locations');
  if (!section) return;
  const $ = selector => section.querySelector(selector);
  const $$ = selector => [...section.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const traveller = $('#route-traveller');
  const line = $('#district-route');
  const defaults = { institute: 'square', girls: 'institute', boys: 'park' };
  let destination = 'institute';
  let origin = defaults[destination];
  let animation;
  let routeAnimation;
  let userSelectedOrigin = false;
  const path = coords => 'M' + coords.map(p => p.join(',')).join('L');
  const viewport = $('#district-viewport');
  const model = $('.district-model');
  let zoom = 1, panX = 0, panY = 0, drag = null;
  function camera() {
    const maxX = (zoom - 1) * viewport.clientWidth / 2;
    const maxY = (zoom - 1) * viewport.clientHeight / 2;
    panX = Math.max(-maxX, Math.min(maxX, panX));
    panY = Math.max(-maxY, Math.min(maxY, panY));
    model.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    viewport.classList.toggle('is-zoomed', zoom > 1);
    viewport.dataset.zoom = zoom.toFixed(2);
    $('#map-zoom-out').disabled = zoom === 1;
    $('#map-zoom-in').disabled = zoom === 2.5;
  }
  function resetCamera() { zoom = 1; panX = panY = 0; camera(); }
  $('#map-zoom-in').addEventListener('click', () => {zoom = Math.min(2.5, zoom + .5); camera();});
  $('#map-zoom-out').addEventListener('click', () => {zoom = Math.max(1, zoom - .5); camera();});
  viewport.addEventListener('pointerdown', event => {
    if (zoom === 1 || event.target.closest('button, a') || event.button !== 0) return;
    drag = {x:event.clientX, y:event.clientY, panX, panY};
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag) return;
    panX = drag.panX + event.clientX - drag.x;
    panY = drag.panY + event.clientY - drag.y;
    camera();
  });
  const release = () => {drag = null; viewport.classList.remove('is-dragging');};
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  new ResizeObserver(camera).observe(viewport);
  const mobileLayout = matchMedia('(max-width: 560px)');
  const insets = $$('[data-inset]');
  function placeInsets() {
    const container = mobileLayout.matches ? $('#mobile-arrival-detail') : model;
    insets.forEach(inset => container.appendChild(inset));
    resetCamera();
  }
  mobileLayout.addEventListener('change', placeInsets);
  placeInsets();

  function drawRoute(animate) {
    animation?.cancel(); routeAnimation?.cancel();
    const coords = routes[destination][origin];
    const d = path(coords);
    line.setAttribute('d', d);
    $('#district-route-shadow').setAttribute('d', d);
    const length = line.getTotalLength();
    const start = line.getPointAtLength(0);
    const end = line.getPointAtLength(length);
    const arrows = [];
    for (let distance = 38; distance < length - 14; distance += 65) {
      const point = line.getPointAtLength(distance);
      const ahead = line.getPointAtLength(distance + 2);
      const angle = Math.atan2(ahead.y-point.y,ahead.x-point.x)*180/Math.PI;
      arrows.push(`<path d="M-4-4L0 0L-4 4" transform="translate(${point.x} ${point.y}) rotate(${angle})"/>`);
    }
    $('#route-directions').innerHTML = arrows.join('');
    $('#route-origin').setAttribute('cx', start.x);
    $('#route-origin').setAttribute('cy', start.y);
    // The small dashed links distinguish street access from a place's pin.
    $('#route-connectors').innerHTML = `<path d="M${points[origin].join(',')}L${coords[0].join(',')}M${coords.at(-1).join(',')}L${points[destination].join(',')}"/>`;
    traveller.removeAttribute('transform');
    traveller.style.transform = `translate(${end.x}px, ${end.y}px)`;
    if (!animate || reducedMotion.matches) return;
    const frames = Array.from({length: 90}, (_, index) => {
      const p = line.getPointAtLength(length * index / 89);
      return {transform: `translate(${p.x}px, ${p.y}px)`};
    });
    const timing = {duration: 1900, easing: 'linear'};
    animation = traveller.animate(frames, timing);
    routeAnimation = line.animate([
      {strokeDasharray: `${length} ${length}`, strokeDashoffset:length},
      {strokeDasharray: `${length} ${length}`, strokeDashoffset:0},
    ], timing);
  }
  function render(animate = true) {
    const d = destinations[destination];
    const contact = contacts.find(c => c.id === destination);
    $('.arrival-layout').dataset.activeDestination = destination;
    $('.arrival-layout').dataset.origin = origin;
    $('#arrival-origin').querySelector('[value="institute"]').disabled = destination === 'institute';
    $('#arrival-origin').value = origin;
    $$('[data-destination]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.destination === destination)));
    $$('[data-map-destination]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mapDestination === destination)));
    $$('[data-inset]').forEach(el => {el.hidden = el.dataset.inset !== destination;});
    $$('[data-landmark]').forEach(b => {
      if (b.dataset.landmark === origin) b.setAttribute('aria-current','location');
      else b.removeAttribute('aria-current');
    });
    $('#destination-title').textContent = d.fullName;
    $('#destination-address').textContent = contact.address;
    $('#destination-phone').textContent = contact.phone;
    $('#destination-phone').href = `tel:+${contact.international}`;
    $('#destination-whatsapp').href = `https://wa.me/${contact.international}`;
    $('#destination-location').href = d.link;
    $('#destination-location').setAttribute('aria-label', d.linkLabel);
    if (animate) $('#arrival-announcement').textContent = `مسار المشي من ${$('#arrival-origin').selectedOptions[0].textContent} إلى ${d.fullName}. ${contact.address}`;
    drawRoute(animate);
  }
  function selectDestination(id) {
    destination = id;
    if (!userSelectedOrigin || !routes[id][origin]) origin = defaults[id];
    resetCamera(); render();
  }
  $$('[data-destination]').forEach(b => b.addEventListener('click', () => selectDestination(b.dataset.destination)));
  $$('[data-map-destination]').forEach(b => b.addEventListener('click', () => selectDestination(b.dataset.mapDestination)));
  $$('[data-landmark]').forEach(b => b.addEventListener('click', () => {origin = b.dataset.landmark; userSelectedOrigin = true; render();}));
  $('#arrival-origin').addEventListener('change', event => {origin = event.target.value;userSelectedOrigin = true;resetCamera();render();});
  $('#replay-arrival').addEventListener('click', () => {resetCamera();drawRoute(true);});
  document.querySelectorAll('[data-contact-destination]').forEach(b => b.addEventListener('click', () => selectDestination(b.dataset.contactDestination)));
  reducedMotion.addEventListener('change', () => {animation?.cancel();routeAnimation?.cancel();});
  render(false);
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {drawRoute(true);observer.disconnect();}
  }, {threshold:.4});
  observer.observe($('.district-model'));
}
