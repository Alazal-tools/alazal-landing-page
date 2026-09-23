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

The original logo dot keeps its silhouette and proportions, with rigid rotations and uniform scaling only. It leaves the hero logo and scatters into lit 3D fragments. These build an opening book with turning pages, a tiered lecture hall, two symbolic school wings, and a volumetric phone carrying the actual platform interface on a 9:16 screen. A perspective camera and physical materials expose the objects' depth. School models are illustrations, not surveyed representations of their buildings.

Native scroll controls assembly and disassembly. Adjacent scenes share the same fragment cloud, camera and orientation at their boundary; the point no longer resets between institutions. Frame-rate-independent damping smooths scroll input in both directions. The cloud finally gathers into the original point, which lands in the final logo and stays there. Date buttons navigate to completed scenes; keyboard navigation is immediate. Visible scenes have restrained page/camera motion capped at 30 fps; rendering loops stop offscreen, in hidden tabs, at the final logo and for reduced motion. Pixel density is capped at 1.5 and fragments use one instanced draw call. Reduced motion exposes all five scenes in document flow, with photos and copy. Static images and the CSS brand point also remain when WebGL is unavailable.

DIN Next LT Arabic, navy #100051, teal #06ffac and the original logo silhouette remain fixed. Real images support five concise factual stops. Schools emphasize “Beyond Education / أبعد من التعليم”. There is no teacher directory, manifesto, everyday gallery, FAQ or large contact footer.

Registration follows the story. Visitors choose school or institute before seeing its forms. Maintain the five existing Google Forms links in `data/registration.json` and rebuild. No student records or form submissions are stored by this static site. Map destinations and contacts remain intact.

The original user references are documented in `DESIGN-NOTES.md`; no third-party animation component or runtime dependency was added.

## Validation

`npm test` verifies assets, anchors, requested removals, the five registration destinations, geographic route integrity, build budgets, Pixel behavior and the construction/scattering timeline. Motion tests verify continuous fragment/camera states at all scene boundaries in both scroll directions, bounded animation values, and the initial/final solid point. Browser checks cover desktop, narrow phones, landscape, all five scenes, screen proportions, registration choices and the location guide.

## Interactive arrival guide

The brand-coloured district model uses actual Kadhimiya streets, blocks, park and Tigris geometry. Visitors select one of three facilities and one of eight starting places; walking directions follow the mapped streets and are drawn with arrows and a travelling point. The written address, phone and WhatsApp update with the destination. The park starting point is on the public street in front of it. Zoom controls and dragging reveal smaller street details.

The illustrated entrance insets remain on desktop and are omitted on phones to keep the entire map unobstructed. The written boys' address specifies the entrance to the left of Harir Clinics when facing it. Destination-specific phone and WhatsApp links remain in the guide. See [LOCATION-SOURCES.md](LOCATION-SOURCES.md) for geographic verification, routing limitations and data maintenance.

## Meta advertising measurement

Meta Pixel `28576937971945403` is configured in `analytics-config.js`. See [META-PIXEL-SETUP.md](META-PIXEL-SETUP.md) for Test Events, event meanings and retargeting audiences. The independent small module loads Meta automatically on approved production domains while respecting saved visitor opt-outs and Global Privacy Control. The compact “الخصوصية وإعدادات القياس” disclosure contains the privacy link and tracking toggle. It does not block story initialization and includes a local dry run. Existing Google Analytics and Clarity remain separate.

## Performance

The initial head script chooses the motion/reduced-motion layout before paint; CSS reserves the complete story height before the module loads. The fixed-size `public/district-base.svg` contains the original streets, blocks, river and park geometry, unchanged, and loads lazily. Route overlays, labels, pins and zoom remain interactive. The build regenerates both layers from the same district data and colours.

Directions load near their viewport as one bundled module (`public/arrival.js`); early interactions wait for initialization and are replayed. Rebuild after editing the arrival source or data. The 3D bundle loads only when the hero or story is nearby. Animation frames batch geometry reads before writes, cache DOM references and skip unchanged scene styles. The story uses a small self-hosted controller (`src/story.js`), with pure construction/timeline helpers in `src/story-motion.js`. Its module and the stylesheet are content-versioned during the build.

For local Web Vitals diagnostics, run `node scripts/perf-server.mjs . 4200` and open `http://127.0.0.1:4200/?moduleDelay=600#story`. This opt-in server records native layout-shift clusters, LCP, long tasks and resource sizes in the hidden `#perf-report` output. The optional delay reproduces a late main-module response. The probe is never part of the published page; lab values are not field metrics. Regression checks enforce the initial HTML/DOM budgets and the pre-paint story layout.

Local validation on 2026-09-20 compared commit `46359ac` with the September 20 performance revision (before the September 22 redesign) using identical no-store instrumentation and a 600 ms main-module response delay at `#story`. Phone CLS (390×844) fell from 0.78294 to 0.00000 in two completed optimized runs; desktop CLS (1280×720) fell from 0.11935 to 0.00000. Optimized phone LCP was 124–168 ms. Initial HTML fell from 417,739 to 50,263 bytes (88.0%); live map SVG nodes fell from 4,321 to 62 before route hydration (98.6%). These are specific measured improvements, not a claim that every performance metric is 90% faster. All five story scenes were checked on desktop and at 320×568, along with reading mode, map zoom, destination/origin changes, matching map geometry and browser errors.

Earlier September 22 redesign validation: delayed startup (`?moduleDelay=600#story`) measured CLS 0 on 390×844 and 1280×720. These are local lab checks, not field performance claims. The 9:16 platform screen, date navigation, final logo alignment, phone overflow, institution chooser and bridge-to-boys-school route were checked in the browser. All 12 automated checks pass.

The subsequent construction narrative was checked at 1280x800, 390x844, 320x568 and 844x390. A local reduced-motion fixture showed all five scenes in document flow. Delayed-startup checks measured CLS 0 at 320x568 and 1280x720; the stage dimensions are reserved in CSS with container units before JavaScript loads. These are lab results, not field measurements.

The perspective 3D revision and continuous cloud transitions were checked at 1280x720, 390x844, 320x568 and 844x390. The final point aligned with its logo anchor within 0.001 px and remained aligned after further scrolling. Reduced motion retained all five static scenes without horizontal overflow. With a 600 ms main-module delay, local CLS was 0 on phone and desktop (LCP 192 ms and 188 ms respectively). The 3D bundle is 146 KB gzip; all 12 automated checks pass. These are local observations, not real-device or field benchmarks.

September 23 performance tuning preserves the dot geometry, model details, materials, screen resolution and scroll choreography. Rigid boxes sharing a parent/material are instanced together, while animated groups and blinking lights stay independent. Particle destinations are cached, unchanged construction/camera state is skipped, and only the active story panel is measured and updated. Scattering uses 25% fewer fragments (120 on phones / 180 on desktop); ambient sway and rotation are slightly quieter. The 30 fps render cap and the main assembly transitions remain unchanged.

In local two-second steady-scene samples at the same resolution, classroom draw calls fell from approximately 92 to 31 per frame; school draw calls fell from 69 to 23. The school geometry remained 2,352 rendered triangles before and after. These measurements describe rendering submissions, not a claim that the whole website is 66% faster. The batching regression test checks geometry/material identity, world transforms and independent light animation; all 13 automated checks pass.

The optimized renderer was checked on desktop and a 390x844 viewport, including the shared scatter transition, book, schools, 9:16 platform and final logo. The settled logo produced zero redraws in the local two-second probe; its anchor stayed aligned within 0.001 px. The delayed-startup phone check retained CLS 0, with no horizontal overflow or browser rendering errors. Temporary GPU instrumentation is not included in the published page.
