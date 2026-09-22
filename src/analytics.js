import { metaPixelId, metaProductionHosts } from '../analytics-config.js';
import { createMetaPixel, loadMetaLibrary, isMetaTrackingEnabled } from './meta-pixel.js';

const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const debug = local && new URLSearchParams(location.search).get('meta_debug') === '1';
const configured = /^\d{10,20}$/.test(metaPixelId) && metaProductionHosts.includes(location.hostname);
const eligible = configured || debug;
const key = 'alazal-meta-consent-v1';
const maxAge = 180 * 24 * 60 * 60 * 1000;
const notice = document.querySelector('#meta-privacy');
const settings = document.querySelector('#meta-settings');
const status = document.querySelector('#meta-consent-status');
let granted = false;
const events = [];
const pixel = createMetaPixel({ pixelId: metaPixelId, debug, load: loadMetaLibrary, onEvent(event) {
  if (!debug) return;
  events.push(event);
  if (events.length > 100) events.shift();
  let output = document.querySelector('#meta-debug-output');
  if (!output) {
    output = document.createElement('output');
    output.id = 'meta-debug-output';
    output.hidden = true;
    document.body.append(output);
  }
  output.textContent = JSON.stringify(events);
  console.info('[Meta local preview — not sent]', event.name, event.data);
} });

function readConsent() {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (value && ['granted', 'denied'].includes(value.choice) && Date.now() - value.at < maxAge) return value.choice;
  } catch { /* A blocked storage API must not break the site. */ }
  return null;
}
function applyConsent(choice, persist = false) {
  granted = isMetaTrackingEnabled({ eligible, preference: choice, globalPrivacyControl: navigator.globalPrivacyControl });
  pixel.setConsent(granted);
  if (persist) {
    try { localStorage.setItem(key, JSON.stringify({ choice: granted ? 'granted' : 'denied', at: Date.now() })); } catch {}
  }
  status.textContent = navigator.globalPrivacyControl
    ? 'متصفحك يطلب عدم مشاركة النشاط للإعلانات؛ قياس Meta غير مفعّل.'
    : granted ? 'قياس إعلانات Meta مفعّل.' : 'قياس إعلانات Meta غير مفعّل.';
  settings.textContent = navigator.globalPrivacyControl
    ? 'القياس متوقف بطلب المتصفح'
    : granted ? 'إيقاف قياس Meta' : 'تفعيل قياس Meta';
  settings.setAttribute('aria-pressed', String(granted));
}

if (eligible) {
  notice.hidden = false;
  settings.hidden = false;
  settings.disabled = Boolean(navigator.globalPrivacyControl);
  applyConsent(readConsent());
  settings.addEventListener('click', () => applyConsent(granted ? 'denied' : 'granted', true));
  // A decision in another tab applies here too; revocation discards queued events.
  addEventListener('storage', event => { if (event.key === key || event.key === null) applyConsent(readConsent()); });

  const viewed = new Set();
  const recent = new Map();
  const track = (name, data, custom = false) => {
    if (!granted) return;
    const id = name + JSON.stringify(data);
    if (Date.now() - (recent.get(id) || 0) < 1200) return;
    recent.set(id, Date.now());
    pixel.track(name, data, custom);
  };
  const view = facility => {
    if (!granted || viewed.has(facility)) return;
    viewed.add(facility);
    track('ViewContent', { facility });
  };
  function facilityFor(element) {
    const entry = element.closest('.contact-entry');
    if (entry) return entry.id.replace('contact-', '');
    const entity = element.closest('[data-entity]');
    if (entity) return entity.dataset.entity;
    if (element.closest('#locations')) return document.querySelector('.arrival-layout').dataset.activeDestination || 'institute';
    if (element.dataset.cta === 'institute_registration') return 'institute';
    return 'group';
  }
  document.addEventListener('click', event => {
    const element = event.target.closest('a, button, summary');
    if (!element) return;
    const selected = element.dataset.destination || element.dataset.mapDestination;
    if (selected) view(selected);
    if (element.tagName === 'SUMMARY') {
      const details = element.parentElement;
      if (!details.open && details.matches('.entity, .contact-entry')) view(facilityFor(element));
    }
    if (element.dataset.contactDestination) track('GetDirections', { facility: element.dataset.contactDestination, channel: 'map' }, true);
    if (element.tagName !== 'A') return;
    const url = new URL(element.href);
    const facility = facilityFor(element);
    if (url.protocol === 'tel:') track('Contact', { facility, channel: 'phone' });
    else if (url.hostname === 'wa.me') track('Contact', { facility, channel: 'whatsapp' });
    else if (url.hostname === 'share.google') track('GetDirections', { facility, channel: 'map' }, true);
    else {
      const host = url.hostname.replace(/^www\./, '');
      const channel = { 'instagram.com': 'instagram', 'facebook.com': 'facebook', 't.me': 'telegram' }[host];
      if (channel) track('SocialClick', { facility, channel }, true);
    }
  });
}

window.alazalMeta = Object.freeze({
  status: () => ({ configured, debug, enabled: granted, preference: readConsent() || 'default', globalPrivacyControl: Boolean(navigator.globalPrivacyControl) }),
  openSettings: () => { if (eligible) { settings.scrollIntoView({ block: 'center' }); settings.focus({ preventScroll: true }); } },
});
