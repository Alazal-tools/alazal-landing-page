// Diagnostics observe the existing integration. They do not send extra events,
// override browser protections or include cookie identifiers in the report.
export function summarizeMetaRequest(entry, pixelId) {
  let url;
  try { url = new URL(entry.name); } catch { return null; }
  if (!/(^|\.)facebook\.com$/.test(url.hostname) || !/^\/tr\/?$/.test(url.pathname)) return null;
  const id = url.searchParams.get('id');
  if (id && id !== pixelId) return null;
  return {
    event: url.searchParams.get('ev') || 'Meta event request',
    httpStatus: entry.responseStatus || 'not exposed by browser',
    completed: entry.responseEnd > 0,
  };
}

export function showPixelDiagnostics(api) {
  const panel = document.createElement('section');
  panel.id = 'pixel-diagnostics';
  panel.dir = 'ltr';
  panel.setAttribute('aria-label', 'Meta Pixel diagnostic report');
  panel.style.cssText = 'position:fixed;inset:auto 16px 16px auto;z-index:1000;width:min(580px,calc(100vw - 32px));max-height:80svh;overflow:auto;background:#100051;color:#fff;padding:20px;border:1px solid #06ffac;font:14px/1.5 system-ui;text-align:left;box-shadow:0 8px 40px #0008';
  panel.innerHTML = `<h2 style="font-size:20px;color:#06ffac;margin:0 0 8px">Meta Pixel diagnostic report</h2>
    <p data-summary aria-live="polite"></p>
    <p style="font-size:12px;margin:8px 0">This view checks your browser. A queued event or completed request does not confirm it appears in Meta Events Manager.</p>
    <div style="display:flex;gap:12px;margin:12px 0">
      <button type="button" data-copy style="padding:8px;border:1px solid #06ffac">Copy report</button>
      <button type="button" data-close style="padding:8px;border:1px solid #06ffac">Close</button>
    </div>
    <textarea id="pixel-diagnostics-report" readonly aria-label="Diagnostic report" style="width:100%;height:240px;resize:vertical;padding:10px;background:#080027;color:white;border:1px solid #ffffff40;font:12px/1.6 monospace"></textarea>`;
  document.body.append(panel);
  const report = panel.querySelector('textarea');
  let observer;
  const requests = [];
  const pixelId = api.diagnostics().pixelId;
  function observe(entries) {
    for (const entry of entries) {
      const item = summarizeMetaRequest(entry, pixelId);
      if (item) requests.push(item);
    }
    if (requests.length > 50) requests.splice(0, requests.length - 50);
  }
  if ('PerformanceObserver' in window) {
    observer = new PerformanceObserver(list => observe(list.getEntries()));
    observer.observe({ type: 'resource', buffered: true });
  } else observe(performance.getEntriesByType('resource'));
  function render() {
    const state = api.diagnostics();
    let sdkPixel;
    try { sdkPixel = window.fbq?.getState?.().pixels?.find(p => String(p.id) === pixelId); } catch {}
    const summary = state.debug ? 'Local dry run: no real Meta requests are expected.'
      : !state.configured ? 'Tracking is not configured for this hostname.'
      : !state.enabled ? state.globalPrivacyControl ? 'The browser requests that advertising tracking stay off.' : 'Tracking is off in this browser. The footer control shows its current setting.'
      : state.sdk === 'failed' ? 'The Meta library failed to load. Check browser/network blocking.'
      : state.sdk !== 'loaded' ? 'Waiting for the Meta library to load.'
      : requests.length ? 'Meta event requests are visible below. Confirm receipt in Test events.'
      : 'The library loaded, but no Meta event request is visible yet.';
    panel.querySelector('[data-summary]').textContent = summary;
    report.value = JSON.stringify({
      ...state,
      sdkPixelRegistered: Boolean(sdkPixel),
      sdkEventCount: sdkPixel?.eventCount ?? null,
      networkRequests: requests,
      eventsManagerReceipt: 'Not observable from this page; confirm in Meta Test events.',
    }, null, 2);
  }
  render();
  const timer = setInterval(render, 1000);
  panel.querySelector('[data-close]').addEventListener('click', () => { clearInterval(timer); observer?.disconnect(); panel.remove(); });
  panel.querySelector('[data-copy]').addEventListener('click', async event => {
    try { await navigator.clipboard.writeText(report.value); event.target.textContent = 'Copied'; }
    catch { report.focus(); report.select(); event.target.textContent = 'Press Ctrl+C'; }
  });
}
