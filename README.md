# Alazal

A new Arabic landing page built around the existing Alazal identity: DIN Next LT Arabic, navy `#100051`, teal `#06ffac`, and the original geometric logo.

## Run

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4198. Set `PORT` to use another port.

## Build and check

```sh
npm run build
npm test
```

The site remains plain HTML, CSS, and JavaScript. `public/brand-scene.js` is the committed, self-hosted Three.js bundle; ordinary static hosting needs no Node runtime or build step. Rebuild it after editing `src/brand-scene.js`. Existing CNAME, analytics IDs, and registration destinations are preserved.

## Design and motion

- The teal dot is an extruded version of the original brand shape. It starts at the original dot's exact center, width, and rotation, then moves through five dated story stops and returns to the final logo. Its initial position does not respond to the cursor.
- Scrolling remains native. The five scenes use unfolding print layers, assembling classroom strips, two architectural portals, a dimensional platform screen, and a return to the complete logo. At the digital threshold, a lightweight custom shader briefly scatters the original dot into particles. Year buttons and a skip link provide direct navigation. WebGL renders only when the pose changes, with pixel density capped at 1.5.
- Phones, compact screens and landscape screens retain the same five scrolling scenes and persistent 3D point. Responsive compositions fit the available height. Reduced-motion preferences and the reading-mode button show all stops in ordinary document flow. The page and institution disclosures work without JavaScript. A CSS brand shape remains if WebGL fails.
- The institute, schools, digital platform, and library keep their original contact destinations. The two special-program promotions have been removed.
- The landing page omits the teacher directory, portraits, search and subject filters. Original source assets remain available for future pages but are not loaded by the landing page.
- Navy is the primary page background. A teal statement section reveals its words in reading order; the final invitation is teal too. The original white logo variant is preserved.
- SVG logo variants follow the original supplied raster silhouette; fonts are WOFF2 conversions of the supplied DIN files. Photos are resized from the supplied photography, with originals retained.

The design applies the user-supplied [Landing Page Design skill](https://github.com/elayadesign/ai-design-skills/blob/main/skills/landing-page-design/SKILL.md), with the original identity taking precedence over generic skill tokens. [ThreeUI paper compositions](https://threeui.com/three-js/3d-paper) and [Canvas UI reveals](https://canvasui.dev/components) informed bespoke implementations; their components are not copied or runtime dependencies. See `DESIGN-NOTES.md` for the story and motion rationale.

## Validation

`npm test` checks local asset links, section anchors, the absence of the staff directory, concise one-sentence story stops, story navigation, removal of retired promotions, and font/3D transfer budgets. Visual checks cover desktop and mobile, all five story stops, initial and final dot alignment, reading mode, institution selection, and keyboard navigation.

The latest content direction uses five short headlines and one sentence per stop. Scroll travel is shortened to match the lighter story. The platform is represented by a branded screen without teacher portraits.

## Interactive arrival guide

The brand-coloured district model uses actual Kadhimiya streets, blocks, park and Tigris geometry. Visitors select one of three facilities and one of eight starting places; walking directions follow the mapped streets and are drawn with arrows and a travelling point. The written address, phone and WhatsApp update with the destination. The park starting point is on the public street in front of it. Zoom controls and dragging reveal smaller street details.

The illustrated entrance insets remain on desktop and are omitted on phones to keep the entire map unobstructed. The written boys' address specifies the entrance to the left of Harir Clinics when facing it. All six group entities have complete contact disclosures below. See [LOCATION-SOURCES.md](LOCATION-SOURCES.md) for geographic verification, routing limitations and data maintenance.

## Meta advertising measurement

Meta Pixel `28576937971945403` is configured in `analytics-config.js`. See [META-PIXEL-SETUP.md](META-PIXEL-SETUP.md) for Test Events, event meanings and retargeting audiences. The independent small module loads Meta only after advertising consent on approved production domains; it does not block story initialization. It includes a local dry run and a visitor-facing privacy notice. Existing Google Analytics and Clarity remain separate.

## Performance

The initial head script chooses the motion/reduced-motion layout before paint; CSS reserves the complete story height before the module loads. The fixed-size `public/district-base.svg` contains the original streets, blocks, river and park geometry, unchanged, and loads lazily. Route overlays, labels, pins and zoom remain interactive. The build regenerates both layers from the same district data and colours.

Directions load near their viewport as one bundled module (`public/arrival.js`); early interactions wait for initialization and are replayed. Rebuild after editing the arrival source or data. The 3D bundle loads only when the hero or story is nearby. Animation frames batch geometry reads before writes, cache DOM references and skip unchanged scene styles. No animations, photographs, fonts, map detail or contact information were removed.

For local Web Vitals diagnostics, run `node scripts/perf-server.mjs . 4200` and open `http://127.0.0.1:4200/?moduleDelay=600#story`. This opt-in server records native layout-shift clusters, LCP, long tasks and resource sizes in the hidden `#perf-report` output. The optional delay reproduces a late main-module response. The probe is never part of the published page; lab values are not field metrics. Regression checks enforce the initial HTML/DOM budgets and the pre-paint story layout.

Local validation on 2026-09-20 compared commit `46359ac` with this version using identical no-store instrumentation and a 600 ms main-module response delay at `#story`. Phone CLS (390×844) fell from 0.78294 to 0.00000 in two completed optimized runs; desktop CLS (1280×720) fell from 0.11935 to 0.00000. Optimized phone LCP was 124–168 ms. Initial HTML fell from 417,739 to 50,263 bytes (88.0%); live map SVG nodes fell from 4,321 to 62 before route hydration (98.6%). These are specific measured improvements, not a claim that every performance metric is 90% faster. All five story scenes were checked on desktop and at 320×568, along with reading mode, map zoom, destination/origin changes, matching map geometry and browser errors.
