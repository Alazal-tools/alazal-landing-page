# Alazal Meta Pixel setup

The integration is installed in the website code. Live delivery remains OFF until your numeric Pixel ID is entered in `analytics-config.js`. A Pixel ID is public; an access token is not needed for this browser integration.

## 1. Create the Pixel in your own business

1. Open [Meta Events Manager](https://business.facebook.com/events_manager) and select the Alazal business portfolio that owns your ad account.
2. Use **Connect data → Web**. Create a dataset named **Alazal Website**, or select an existing dataset you own. Meta may label the resource “Dataset” or “Pixel.” The exact setup labels can differ between accounts.
3. Select **Meta Pixel / browser events**, then **Install code manually**. This website already contains the integration; do not paste a second base snippet or use the Event Setup Tool to duplicate its events.
4. In the dataset's **Settings**, copy the numeric **Pixel/Dataset ID**. Use the ID associated with its web Pixel, not a business ID or ad-account ID. Send that ID to the website maintainer, or put it between the quotes in `analytics-config.js` and deploy that file.
5. Under **Business settings → Data sources → Datasets → Connected assets**, connect the ad account that will advertise Alazal. This should be done by the business owner/admin.
6. Leave **automatic advanced matching** and **automatic events without code** off for this implementation. The code explicitly sends the events listed below. No Conversions API token, server setup or paid gateway is required for the browser Pixel.

## 2. Verify before spending

Open the dataset's **Test events**, enter `https://alazalgroup.com`, and open the website from that screen. Accept the site's **قياس إعلانات Meta** choice. Confirm **PageView**, select a different institution to get **ViewContent**, and click its WhatsApp link to get **Contact**. A contact click opens the contact destination but does not send a message automatically.

| Event | Meaning in this website | Useful parameters |
|---|---|---|
| `PageView` | One landing-page visit, after consent | — |
| `ViewContent` | Explicitly opens an institution's information or selects a map destination | `facility` |
| `Contact` | Clicks a WhatsApp or phone link | `facility`, `channel` |
| `GetDirections` (custom) | Clicks a contact-directory directions link or the external location link | `facility`, `channel=map` |
| `SocialClick` (custom) | Opens an Instagram, Facebook or Telegram link | `facility`, `channel` |

Facility values: `institute`, `girls`, `boys`, `schools`, `platform`, `library`, `publisher`; `group` is used for general links. Opening/closing story chapters does not create extra PageViews. Default-open disclosures do not count as explicit interest. Contact is click intent, not a completed conversation, qualified lead, enrollment or payment. The site intentionally does not emit `Lead`, `CompleteRegistration` or `Purchase` without a real completed action.

Also test **لا أوافق**: no Meta script or new events should be sent. The footer's **إعدادات إعلانات Meta** lets you change the choice. Rejection affects Meta only; the site's existing Google Analytics and Clarity remain separate. Consent blockers, ad blockers and browser protections mean not every visitor can be measured or retargeted.

If you see no events, check the ID, correct dataset and production domain first; then the consent choice, browser blockers and Events Manager Diagnostics. Domain restrictions currently allow `alazalgroup.com` and `www.alazalgroup.com`. Other preview hosts deliberately do not send Meta traffic.

## 3. Create retargeting audiences

In [Meta Ads Manager audiences](https://business.facebook.com/adsmanager/audiences), choose **Create audience → Custom audience → Website**, and select **Alazal Website**. Start with these simple groups once the dataset has received real events:

- **Alazal — Website visitors — 30 days:** all website visitors.
- **Alazal — Contact intent — 30 days:** people who triggered `Contact`.
- **Alazal — Institute interest — 30 days:** `ViewContent`, refined by `facility = institute` where event-parameter rules are available. Repeat for `girls` and `boys` if useful.

Use these audiences in the ad set's Custom Audiences selection. For a strictly retargeting campaign, check whether the selected campaign's Advantage+ settings allow delivery beyond that audience: an audience used as a suggestion is not necessarily a strict inclusion rule. Audience size and availability depend on Meta's matching, eligibility and account controls. Website events alone do not provide a list of visitors' identities.

Use service-relevant creative: someone interested in the institute sees the institute's classrooms and contact option; a schools audience sees the school's facilities. Treat `Contact` as a useful intent signal, and verify actual conversations/enrollments separately before judging results. Meta limits targeting options for under-18 users; see [Meta's explanation of teen advertising restrictions](https://about.fb.com/news/2023/01/age-appropriate-ads-for-teens/).

## Maintenance and local testing

- `analytics-config.js`: public Pixel ID and allowed live domains; changing these does not require rebuilding the bundle.
- `src/analytics.js`: consent UI and explicit event mapping.
- `src/meta-pixel.js`: consent-gated async delivery, event allowlist and safe parameter filtering.
- `public/analytics.js`: generated bundle; run `npm run build` after source changes.
- `privacy.html`: visitor-facing explanation of Meta and the other existing analytics tools.
- Run `npm test` for consent, pending-event revocation, one-time initialization, parameter filtering and loading-failure checks.
- Open `http://127.0.0.1:4198/?meta_debug=1` for a local dry run. It works without a Pixel ID and records event names in the browser console/hidden `#meta-debug-output`, with **no Meta network requests**. This switch is ignored on production hosts.
- `window.alazalMeta.status()` reports whether the ID/domain is configured, whether local debug is enabled, consent and the browser's Global Privacy Control signal. It does not prove Meta has received events; use Test Events for that.

Technical reference: [Meta's official Pixel tag implementation](https://github.com/facebook/GoogleTagManager-WebTemplate-For-FacebookPixel/blob/main/template.tpl) documents the Pixel-scoped event commands, auto-configuration control and consent commands used here. [Meta Pixel documentation](https://developers.facebook.com/docs/meta-pixel/) and [Events Manager](https://business.facebook.com/events_manager) are the authoritative sources for account-specific setup and available controls.
