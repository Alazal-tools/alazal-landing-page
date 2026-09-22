# Alazal Meta Pixel setup

The owner-provided test Pixel **28576937971945403** is configured in `analytics-config.js`. It loads automatically on `alazalgroup.com` and `www.alazalgroup.com`, except when a visitor has opted out or the browser sends Global Privacy Control. There is no pop-up: the footer provides a clear disclosure, privacy link and tracking toggle. A Pixel ID is public; an access token is not needed for this browser integration.

This is an automatic-loading configuration, not a jurisdiction-aware consent system. A footer notice does not replace prior consent wherever it is required. See [Meta's Business Tools terms](https://www.facebook.com/legal/technology_terms) when deciding which audiences and regions to serve.

## 1. Create the Pixel in your own business

1. Open [Meta Events Manager](https://business.facebook.com/events_manager) and select the Alazal business portfolio that owns your ad account.
2. Use **Connect data → Web**. Create a dataset named **Alazal Website**, or select an existing dataset you own. Meta may label the resource “Dataset” or “Pixel.” The exact setup labels can differ between accounts.
3. Select **Meta Pixel / browser events**, then **Install code manually**. This website already contains the integration; do not paste a second base snippet or use the Event Setup Tool to duplicate its events.
4. In the dataset's **Settings**, copy the numeric **Pixel/Dataset ID**. Use the ID associated with its web Pixel, not a business ID or ad-account ID. Send that ID to the website maintainer, or put it between the quotes in `analytics-config.js`, run `npm run build`, and deploy the generated assets.
5. Under **Business settings → Data sources → Datasets → Connected assets**, connect the ad account that will advertise Alazal. This should be done by the business owner/admin.
6. Leave **automatic advanced matching** and **automatic events without code** off for this implementation. The code explicitly sends the events listed below. No Conversions API token, server setup or paid gateway is required for the browser Pixel.

## 2. Verify before spending

In [Events Manager](https://business.facebook.com/events_manager), select the dataset with ID **28576937971945403** and open **Test events**. Under browser events, enter `https://alazalgroup.com` and open the website from that screen. Keep Events Manager open in the same browser. Tracking starts automatically. If you previously declined or turned tracking off, use **تفعيل قياس Meta** in the footer. Reload the page if it was already open before starting the test.

Confirm **PageView**, select a different institution in the map to get **ViewContent**, and click its WhatsApp link to get **Contact**. Return to Test events to inspect the event names and `facility` / `channel` parameters. A contact click opens the contact destination but does not send a message automatically. Test the live site: `127.0.0.1` and `localhost` deliberately do not send real Meta traffic. If an older version remains visible after deployment, hard-refresh with **Ctrl+Shift+R**.

| Event | Meaning in this website | Useful parameters |
|---|---|---|
| `PageView` | One landing-page visit when tracking is enabled | — |
| `ViewContent` | Explicitly opens an institution's information or selects a map destination | `facility` |
| `Contact` | Clicks a WhatsApp or phone link | `facility`, `channel` |
| `GetDirections` (custom) | Clicks a contact-directory directions link or the external location link | `facility`, `channel=map` |
| `SocialClick` (custom) | Opens an Instagram, Facebook or Telegram link | `facility`, `channel` |

Facility values: `institute`, `girls`, `boys`, `schools`, `platform`, `library`, `publisher`; `group` is used for general links. Opening/closing story chapters does not create extra PageViews. Default-open disclosures do not count as explicit interest. Contact is click intent, not a completed conversation, qualified lead, enrollment or payment. The site intentionally does not emit `Lead`, `CompleteRegistration` or `Purchase` without a real completed action.

Also test **إيقاف قياس Meta** in the footer: new events stop. Reload while opted out: no Meta script should load. **تفعيل قياس Meta** restores tracking. This choice affects Meta only; the site's existing Google Analytics and Clarity remain separate. Saved opt-outs, ad blockers and browser protections mean not every visitor can be measured or retargeted.

If you see no events, check the ID, correct dataset and production domain first; then the footer tracking setting, browser blockers and Events Manager Diagnostics. Domain restrictions currently allow `alazalgroup.com` and `www.alazalgroup.com`. Other preview hosts deliberately do not send Meta traffic.

**Edge troubleshooting:** the live test on September 22, 2026 reproduced `ERR_BLOCKED_BY_CLIENT` for `https://connect.facebook.net/en_US/fbevents.js`, alongside “Tracking Prevention blocked a Script resource.” Edge's site-information panel showed **Tracking prevention for this site (Strict)**. In that state the browser prevents the Pixel library from loading. For an owner-controlled test, the owner can temporarily turn off tracking prevention for **this site only**, reload, and check Meta Test events again. Restore the original setting after testing. Do not infer successful delivery from a resource timing entry alone; inspect the Network result and confirm receipt in Meta.

For a direct browser report, open [the live Pixel diagnostic view](https://alazalgroup.com/?pixel_test=1). It shows the configured ID, saved tracking preference, Global Privacy Control, SDK load state, events passed to the SDK and observed Meta network requests. Use **Copy report** to share the result with the maintainer. This mode observes normal events and does not override an opt-out or generate extra events. A completed request or SDK event count is not proof of receipt in Events Manager; cross-origin HTTP statuses may be hidden by the browser. The view is only loaded with `pixel_test=1` and is absent from normal visits.

## 3. Create retargeting audiences

In [Meta Ads Manager audiences](https://business.facebook.com/adsmanager/audiences), choose **Create audience → Custom audience → Website**, and select **Alazal Website**. Start with these simple groups once the dataset has received real events:

- **Alazal — Website visitors — 30 days:** all website visitors.
- **Alazal — Contact intent — 30 days:** people who triggered `Contact`.
- **Alazal — Institute interest — 30 days:** `ViewContent`, refined by `facility = institute` where event-parameter rules are available. Repeat for `girls` and `boys` if useful.

Use these audiences in the ad set's Custom Audiences selection. For a strictly retargeting campaign, check whether the selected campaign's Advantage+ settings allow delivery beyond that audience: an audience used as a suggestion is not necessarily a strict inclusion rule. Audience size and availability depend on Meta's matching, eligibility and account controls. Website events alone do not provide a list of visitors' identities.

Use service-relevant creative: someone interested in the institute sees the institute's classrooms and contact option; a schools audience sees the school's facilities. Treat `Contact` as a useful intent signal, and verify actual conversations/enrollments separately before judging results. Meta limits targeting options for under-18 users; see [Meta's explanation of teen advertising restrictions](https://about.fb.com/news/2023/01/age-appropriate-ads-for-teens/).

## Maintenance and local testing

- `analytics-config.js`: public Pixel ID and allowed live domains; run `npm run build` after changing these. The build bundles the settings and versions the analytics URL to prevent stale configurations.
- `src/analytics.js`: footer tracking preference and explicit event mapping.
- `src/meta-pixel.js`: async delivery, visitor opt-out policy, event allowlist and safe parameter filtering.
- `public/analytics.js`: generated bundle; run `npm run build` after source changes.
- `privacy.html`: visitor-facing explanation of Meta and the other existing analytics tools.
- Run `npm test` for automatic startup, saved opt-outs, Global Privacy Control, pending-event revocation, one-time initialization, parameter filtering and loading-failure checks.
- Open `http://127.0.0.1:4198/?meta_debug=1` for a local dry run. It works without a Pixel ID and records event names in the browser console/hidden `#meta-debug-output`, with **no Meta network requests**. This switch is ignored on production hosts.
- `window.alazalMeta.status()` reports whether the ID/domain is configured, whether local debug and tracking are enabled, the saved preference and the browser's Global Privacy Control signal. The value `preference: 'default'` means no explicit visitor choice has been saved; it does not claim visitor consent. Status does not prove Meta has received events; use Test Events for that.

Technical reference: [Meta's official Pixel tag implementation](https://github.com/facebook/GoogleTagManager-WebTemplate-For-FacebookPixel/blob/main/template.tpl) documents the Pixel-scoped event commands, auto-configuration control and consent commands used here. [Meta Pixel documentation](https://developers.facebook.com/docs/meta-pixel/) and [Events Manager](https://business.facebook.com/events_manager) are the authoritative sources for account-specific setup and available controls.
