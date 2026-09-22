import { readFile, access, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";

const html = await readFile("index.html", "utf8");
const css = await readFile("styles.css", "utf8");
const script = await readFile("script.js", "utf8");
const arrivalCss = await readFile("arrival.css", "utf8");
const district = JSON.parse(await readFile("data/district.json", "utf8"));
const { contacts } = await import('../data/places.js');
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(
  (match) => match[1],
);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, "Duplicate HTML IDs");
for (const reference of references) {
  if (reference.startsWith("#"))
    assert(
      ids.includes(reference.slice(1)),
      `Broken section link: ${reference}`,
    );
  else if (!/^(https?:|tel:)/.test(reference))
    await access(decodeURIComponent(reference));
}
for (const [, font] of (css + arrivalCss).matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g))
  await access(font);
assert(
  !/id="teachers"|class="teacher"|#teachers|public\/portraits\/|public\/teachers\//.test(
    html,
  ),
  "The landing page must not include the teacher directory or portrait images",
);
assert(
  !/teacher-search|subject-filter|filterTeachers/.test(script),
  "Removed staff directory code must not execute",
);
const storyCopies = [
  ...html.matchAll(/<div class="story-copy">([\s\S]*?)<\/div>/g),
];
assert.equal(storyCopies.length, 5, "Keep all five factual story stops");
for (const [, copy] of storyCopies) {
  const body = [...copy.matchAll(/<p>([\s\S]*?)<\/p>/g)];
  assert.equal(
    body.length,
    1,
    "Each story stop should carry one brief sentence",
  );
  assert(
    body[0][1].trim().split(/\s+/).length <= 20,
    "Story copy should stay concise",
  );
}
assert(
  !/الفصل الأول|الفصل الثاني|الفصل الثالث/.test(html),
  "Story must use dates rather than chapter labels",
);
assert.equal(
  [...html.matchAll(/data-story-to="\d+"/g)].length,
  [...html.matchAll(/data-chapter="\d+"/g)].length,
  "Every story stop needs a navigation button",
);
assert(
  !/100\+|\+100|شعب النخبة|شعبة النخبة|شعبة الأوائل|program_100plus|program_elite/.test(
    html + script,
  ),
  "Retired program content is still visible",
);
assert(
  !/https?:\/\/[^'"\s]+(?:three|gsap)/.test(html + script),
  "Runtime animation dependencies must be self-hosted",
);
const model = await readFile("public/brand-scene.js");
const analytics = await readFile('public/analytics.js');
assert(gzipSync(analytics).length < 5 * 1024, 'Local analytics integration exceeds 5 KB gzip');
assert(!/connect\.facebook\.net|facebook\.com\/tr\?/.test(html), 'Meta must load through the preference-aware module, without a duplicate snippet');
await access('analytics-config.js');
await access('privacy.html');
assert(gzipSync(await readFile('public/arrival.js')).length < 12 * 1024, 'Directions bundle exceeds the 12 KB gzip budget');
// The static district must not return to thousands of live SVG DOM nodes.
const mapBase = await readFile('public/district-base.svg', 'utf8');
assert(Buffer.byteLength(html) < 64 * 1024, 'Initial HTML exceeds the 64 KB budget');
assert([...html.matchAll(/<[a-z][\w:-]*(?:\s|>)/g)].length < 800, 'Initial DOM exceeds the 800-element budget');
assert(mapBase.includes('district-water') && mapBase.includes('street-borders') && mapBase.includes('mapped-building'), 'The deferred SVG must retain the full geographic model');
assert(html.includes('class="district-base"') && html.includes('loading="lazy"'), 'Keep the fixed-size deferred map background');
const bootstrapPosition = html.indexOf('"motion-story"');
assert(bootstrapPosition >= 0 && bootstrapPosition < html.indexOf('href="styles.css"'), 'Choose the story layout before CSS and first paint');
assert(css.includes('var(--story-height, 455svh)'), 'Reserve the story height before the animation module loads');
assert(!/<iframe\b/i.test(html), 'The location guide must not embed a map');
assert(!/class="arrival-steps"|id="arrival-next"/.test(html), 'Use the visual guide, without instruction paragraphs');
assert(district.roads.length > 500 && district.blocks.length > 200 && district.water.length, 'Keep the actual district geography');
assert.deepEqual(district.places.girls.point, [326.07, 652.54], 'Girls location must match the supplied place');
assert.deepEqual(district.places.institute.point, [209.27, 313.13], 'Institute location must match the supplied place');
assert(district.places.park.offsetMeters < 1, 'The park starting point must be on the street outside the park');
for (const start of ['bridge','mashat','hospital']) {
  for (const destination of ['institute','girls','boys']) assert(district.routes[destination][start], `Missing origin ${start}`);
}
assert(html.includes('id="arrival-origin"') && html.includes('id="destination-address"'), 'Keep origin selection and the written address');
const streetEdges = district.roads.flatMap(r => r.points.slice(1).map((b,i) => [r.points[i],b]));
function onSegment(p,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1],sq=dx*dx+dy*dy;
  if (!sq) return Math.hypot(p[0]-a[0],p[1]-a[1]) < .04;
  const t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/sq;
  return t >= -.001 && t <= 1.001 && Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy) < .04;
}
for (const [dest, starts] of Object.entries(district.routes)) {
  for (const [start, route] of Object.entries(starts)) {
    assert.deepEqual(route.points[0], district.places[start].street);
    assert.deepEqual(route.points.at(-1), district.places[dest].street);
    for (let i=1;i<route.points.length;i++) {
      assert(streetEdges.some(([a,b]) => onSegment(route.points[i-1],a,b) && onSegment(route.points[i],a,b)), `Route ${start} → ${dest} leaves the mapped street network`);
    }
  }
}
for (const name of ['شارع اكد','شارع المشاط','شارع النواب','فرع مستشفى الضرغام','مستشفى الضرغام','دجلة']) assert(html.includes(name), `Missing wayfinding label ${name}`);
for (const c of contacts) {
  assert(html.includes(`id="contact-${c.id}"`));
  assert(html.includes(`https://wa.me/${c.international}`));
  assert(html.includes(`tel:+${c.international}`));
  assert(html.includes(`https://www.instagram.com/${c.instagram}/`));
  assert(html.includes(`https://t.me/${c.telegram}`));
  if (c.direct) assert(html.includes(`https://t.me/${c.direct}`));
  if (c.facebook) assert(html.includes(`https://www.facebook.com/${c.facebook}`));
}
assert(
  gzipSync(model).length < 160 * 1024,
  "3D module exceeds the 160 KB gzip budget",
);
for (const weight of ["Regular", "Medium", "Bold"]) {
  assert(
    (await stat(`fonts/DINNextLTArabic-${weight}.woff2`)).size < 60 * 1024,
    "Font exceeds 60 KB budget",
  );
}
console.log(
  `Verified ${references.length} references, street-following routes, six contact directories, concise story, removed staff directory, and asset budgets.`,
);
