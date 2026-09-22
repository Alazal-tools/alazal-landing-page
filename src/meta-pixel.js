// Existing visitor opt-outs and browser privacy signals override the default.
export function isMetaTrackingEnabled({ eligible, preference, globalPrivacyControl }) {
  return Boolean(eligible) && preference !== 'denied' && !globalPrivacyControl;
}

// The small transport is separate from the page so preferences and delivery can be
// tested without sending any real visitors or test traffic to Meta.
export function createMetaPixel({ pixelId, load, debug = false, onEvent = () => {} }) {
  let consent = false;
  let loading;
  let send;
  let initialized = false;
  let pageViewSent = false;
  let pending = [];
  let loadError = false;
  const valid = /^\d{10,20}$/.test(pixelId);

  function deliver(event) {
    if (event.name === 'PageView') {
      if (pageViewSent) return;
      pageViewSent = true;
    }
    if (!debug) send(event.custom ? 'trackSingleCustom' : 'trackSingle', pixelId, event.name, event.data);
    onEvent(event);
  }
  function flush() {
    if (!consent || (!debug && !send)) return;
    if (!initialized) {
      if (!debug) {
        send('set', 'autoConfig', false, pixelId);
        send('init', pixelId);
      }
      initialized = true;
    }
    if (!debug) send('consent', 'grant');
    deliver({ name: 'PageView', data: {}, custom: false });
    pending.splice(0).forEach(deliver);
  }
  return {
    setConsent(granted) {
      consent = Boolean(granted) && (valid || debug);
      if (!consent) {
        pending = [];
        if (send) send('consent', 'revoke');
        return;
      }
      if (debug || send) return flush();
      if (!loading) {
        loadError = false;
        loading = load().then(command => {
        send = command;
        flush();
        }).catch(() => { loading = null; pending = []; loadError = true; });
      }
    },
    track(name, data = {}, custom = false) {
      if (!consent || !['ViewContent', 'Contact', 'GetDirections', 'SocialClick', 'RegistrationFormOpen'].includes(name)) return;
      // Only fixed catalogue identifiers/channel names enter the event payload.
      // Never forward form values, phone numbers, addresses or route origins.
      const allowedFacilities = ['group', 'institute', 'schools', 'girls', 'boys', 'platform', 'library', 'publisher'];
      const safe = {};
      if (allowedFacilities.includes(data.facility)) safe.facility = data.facility;
      if (['whatsapp', 'phone', 'telegram', 'instagram', 'facebook', 'map'].includes(data.channel)) safe.channel = data.channel;
      if (name === 'RegistrationFormOpen') {
        if (!['school-general', 'school-elite', 'institute-general', 'institute-100', 'institute-challenge'].includes(data.form_id)) return;
        safe.form_id = data.form_id;
        custom = true;
      }
      const event = { name, data: safe, custom };
      if (debug || send) deliver(event);
      else if (pending.length < 30) pending.push(event);
    },
    status: () => ({
      sdk: debug ? 'dry-run' : loadError ? 'failed' : send ? 'loaded' : loading ? 'loading' : 'not-loaded',
      initialized, pageViewQueued: pageViewSent, pendingEvents: pending.length,
    }),
  };
}

export function loadMetaLibrary(win = window, doc = document) {
  return new Promise((resolve, reject) => {
    if (!win.fbq) {
      const fbq = function () {
        if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
        else fbq.queue.push(arguments);
      };
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      win.fbq = fbq;
      win._fbq = fbq;
    }
    // Section/hash navigation is still the same landing-page visit.
    win.fbq.disablePushState = true;
    if (win.fbq.callMethod) return resolve(win.fbq);
    // No init/event is queued until the library is ready and consent rechecked.
    let script = doc.querySelector('script[data-alazal-pixel]');
    if (!script) {
      script = doc.createElement('script');
      script.async = true;
      script.dataset.alazalPixel = '';
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    }
    script.addEventListener('load', () => resolve(win.fbq), { once: true });
    script.addEventListener('error', () => { script.remove(); reject(new Error('Pixel unavailable')); }, { once: true });
    if (!script.isConnected) doc.head.append(script);
  });
}
