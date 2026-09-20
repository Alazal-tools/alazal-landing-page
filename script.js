import { initArrival } from './src/arrival.js';

initArrival();
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

// Native navigation, with smooth scrolling only for pointer-initiated actions.
const menuButton = $(".menu-toggle");
const menu = $("#mobile-menu");
function closeMenu(returnFocus = false) {
  menu.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "فتح القائمة");
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
});
document.addEventListener("click", (event) => {
  if (
    !menu.hidden &&
    !menu.contains(event.target) &&
    !menuButton.contains(event.target)
  )
    closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !menu.hidden) closeMenu(true);
});
$$('a[href^="#"]').forEach((link) =>
  link.addEventListener("click", (event) => {
    const target = $(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    closeMenu();
    target.scrollIntoView({
      behavior:
        reducedMotion.matches || event.detail === 0 ? "instant" : "smooth",
      block: "start",
    });
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    history.replaceState(null, "", link.getAttribute("href"));
  }),
);
$("#year").textContent = String(new Date().getFullYear());

// The same dot passes from the opening logo to the photographs and returns
// to the exact measured dot position in the final logo. No scroll hijacking.
const root = document.documentElement;
const story = $("#story");
const stage = $(".story-stage");
const panels = $$(".story-panel");
const lastStoryIndex = panels.length - 1;
const storyRange = lastStoryIndex + 0.5;
// Orthographic projection of the beveled shape's 2.15-unit silhouette.
const renderedShapeSize = (2.15 / 3.8) * 360;
const chapterButtons = $$("[data-story-to]");
const progressBar = $(".story-progress > span");
const mount = $("#brand-object");
const hero = $("#home");
const anchors = [
  $("#hero-anchor"),
  ...panels.map((_, index) => $(`#chapter-anchor-${index}`)),
];
let scene = null;
let frame = 0;
let enhanced = false;
let storyTop = 0;
let storyTravel = 1;
let currentChapter = -1;
let heroAngle = 0;
let lastPose = "";
let motionPaused = false;
const motionButton = $("#motion-toggle");
motionButton.hidden = false;

function configureStory() {
  // Phones use the same persistent 3D object and five scenes. Layout, not
  // screen height, adapts the experience to compact and landscape viewports.
  enhanced = !reducedMotion.matches && !motionPaused;
  story.style.setProperty("--story-height", `${panels.length * 85 + 30}svh`);
  root.classList.toggle("motion-story", enhanced);
  root.classList.toggle("reading-story", !enhanced);
  panels.forEach((panel) => {
    panel.style.opacity = "";
    panel.style.visibility = "";
    $(".story-copy", panel).style.opacity = "";
    panel.removeAttribute("aria-hidden");
    panel.inert = false;
    panel.style.removeProperty("--enter");
    panel.style.removeProperty("--exit");
  });
  currentChapter = -1;
  motionButton.setAttribute("aria-pressed", String(!enhanced));
  motionButton.textContent = enhanced
    ? "قراءة دون حركة"
    : "عرض الحكاية بالحركة";
  motionButton.hidden = reducedMotion.matches;
  measure();
}
function measure() {
  const matrix = new DOMMatrixReadOnly(
    getComputedStyle($(".hero-logo")).transform,
  );
  // CSS uses a downward Y axis; the 3D scene uses an upward Y axis.
  heroAngle = -Math.atan2(matrix.b, matrix.a);
  storyTop = story.getBoundingClientRect().top + scrollY;
  storyTravel = Math.max(1, story.offsetHeight - stage.offsetHeight);
  invalidate();
}
function anchorBox(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    // The rotated bounding box is wider than the actual dot. Its unrotated
    // width preserves the supplied logo's exact original dot dimensions.
    size: element.offsetWidth,
  };
}
function setChapter(index) {
  if (index === currentChapter) return;
  currentChapter = index;
  stage.dataset.chapter = String(index);
  panels.forEach((panel, i) => {
    panel.setAttribute("aria-hidden", String(i !== index));
    panel.inert = i !== index;
  });
  chapterButtons.forEach((button, i) => {
    if (i === index) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
}
function update() {
  frame = 0;
  if (document.hidden) return;
  const p = enhanced
    ? clamp(
        ((scrollY - storyTop) / storyTravel) * storyRange - 0.25,
        0,
        lastStoryIndex,
      )
    : 0;
  if (enhanced) {
    setChapter(Math.round(p));
    panels.forEach((panel, i) => {
      const distance = p - i;
      const opacity = smooth((0.64 - Math.abs(distance)) / 0.32);
      panel.style.opacity = String(opacity);
      panel.style.visibility = opacity > 0 ? "visible" : "hidden";
      const entrance =
        i === 0
          ? 1 -
            smooth((scrollY - storyTop * 0.35) / Math.max(1, storyTop * 0.65))
          : 0;
      panel.style.setProperty(
        "--enter",
        String(Math.max(entrance, smooth((-distance - 0.06) / 0.62))),
      );
      $(".story-copy", panel).style.opacity = String(
        smooth((0.49 - Math.abs(distance)) / 0.2),
      );
      panel.style.setProperty(
        "--exit",
        String(smooth((distance - 0.08) / 0.62)),
      );
    });
    progressBar.style.transform = `scaleX(${(p + 0.08) / (lastStoryIndex + 0.08)})`;
  }

  const statement = $(".word-reveal");
  const statementTop = statement.getBoundingClientRect().top;
  const reading = clamp(
    (innerHeight * 0.82 - statementTop) / (innerHeight * 0.55),
  );
  $$(".word-reveal span").forEach((word, index, words) => {
    word.classList.toggle(
      "is-read",
      !enhanced || reading >= index / words.length,
    );
  });
  const heroBox = anchorBox(anchors[0]);
  let position = { ...heroBox };
  // Start flush with the original dot, including the logo's rotation.
  // Depth and rotation develop only after the visitor starts the story.
  let pose = { x: 0, y: 0, z: heroAngle, scatter: 0 };
  if (enhanced) {
    const transition = smooth(
      (scrollY - storyTop * 0.1) / Math.max(1, storyTop * 0.9),
    );
    const a = Math.floor(p);
    const b = Math.min(lastStoryIndex, a + 1);
    const local = smooth((p - a - 0.08) / 0.84);
    const first = anchorBox(anchors[a + 1]);
    const second = anchorBox(anchors[b + 1]);
    const point = {
      x:
        mix(first.x, second.x, local) -
        Math.sin(local * Math.PI) * (innerWidth < 761 ? 55 : 115),
      y: mix(first.y, second.y, local) - Math.sin(local * Math.PI) * 38,
      size: mix(
        first.size * (a === lastStoryIndex ? 1 : 1.18),
        second.size * (b === lastStoryIndex ? 1 : 1.18),
        local,
      ),
    };
    position = {
      x: mix(position.x, point.x, transition),
      y: mix(position.y, point.y, transition),
      size: mix(position.size, point.size, transition),
    };
    const rotations = [
      { x: 0.28, y: -0.55, z: -0.18 },
      { x: -0.25, y: 0.42, z: 0.25 },
      { x: 0.42, y: -0.4, z: -0.3 },
      { x: -0.2, y: -0.65, z: 0.18 },
      { x: 0, y: 0, z: 0 },
    ];
    const from = rotations[a];
    const to = rotations[b];
    pose = {
      x: mix(0, mix(from.x, to.x, local), transition),
      y: mix(
        0,
        mix(from.y, to.y, local) + (a + local) * Math.PI * 2,
        transition,
      ),
      z: mix(heroAngle, mix(from.z, to.z, local), transition),
      // At the digital threshold the single point briefly becomes pixels.
      scatter: a === 2 ? Math.pow(Math.sin(local * Math.PI), 2) * 0.95 : 0,
    };
  }
  const visible =
    position.y + position.size > 0 &&
    position.y - position.size < innerHeight &&
    (enhanced || hero.getBoundingClientRect().bottom > 0);
  mount.style.visibility = visible ? "visible" : "hidden";
  if (!visible) return;
  mount.style.transform = `translate3d(${position.x - 180}px,${position.y - 180}px,0) scale(${position.size / renderedShapeSize})`;
  $(".object-fallback").style.transform = `rotate(${-pose.z}rad)`;
  // Render only when the orientation changes. Translation is composited CSS.
  const poseKey = Object.values(pose)
    .map((value) => value.toFixed(4))
    .join(",");
  if (scene && poseKey !== lastPose) {
    scene.render(pose);
    lastPose = poseKey;
  }
}
function invalidate() {
  if (!frame && !document.hidden) frame = requestAnimationFrame(update);
}
chapterButtons.forEach((button) =>
  button.addEventListener("click", (event) => {
    const index = Number(button.dataset.storyTo);
    const top =
      index === 0
        ? storyTop
        : storyTop + (storyTravel * (index + 0.25)) / storyRange;
    scrollTo({
      top,
      behavior:
        reducedMotion.matches || event.detail === 0 ? "instant" : "smooth",
    });
  }),
);
addEventListener("scroll", invalidate, { passive: true });
let lastWidth = innerWidth;
let lastHeight = innerHeight;
addEventListener("resize", () => {
  if (innerWidth > 760) closeMenu();
  if (innerWidth !== lastWidth || Math.abs(innerHeight - lastHeight) > 100) {
    lastWidth = innerWidth;
    lastHeight = innerHeight;
    configureStory();
  } else measure();
});
reducedMotion.addEventListener("change", configureStory);
motionButton.addEventListener("click", () => {
  motionPaused = !motionPaused;
  configureStory();
  scrollTo({ top: storyTop, behavior: "instant" });
});
document.addEventListener("visibilitychange", invalidate);
configureStory();
root.classList.add("object-active");
document.fonts.ready.then(measure);
new ResizeObserver(measure).observe(hero);

// This optional module is the only runtime dependency. The branded CSS object
// and the full page remain usable if WebGL or this download is unavailable.
const loadScene = async () => {
  try {
    const { createBrandScene } = await import("./public/brand-scene.js");
    scene = createBrandScene(mount);
    lastPose = "";
    invalidate();
  } catch {
    mount.dataset.rendering = "fallback";
  }
};
if ("requestIdleCallback" in window)
  requestIdleCallback(loadScene, { timeout: 900 });
else setTimeout(loadScene, 100);

// Each institution retains its real contact destination. Native details also
// work with JavaScript disabled and are fully keyboard operable.
const entities = {
  institute: {
    image: "campus",
    alt: "قاعات معهد الأزل المهيأة للدراسة",
    caption: "مساحة للفهم، قبل أي شيء.",
    year: "EST. 2012",
  },
  schools: {
    image: "school",
    alt: "مبنى ثانوية الأزل الأهلية",
    caption: "يوم دراسي، نكبر فيه معاً.",
    year: "2020 / 2024",
  },
  platform: {
    image: null,
    alt: "واجهة منصة الأزل التعليمية",
    caption: "الأزل، أقرب من أي وقت.",
    year: "EST. 2026",
  },
  library: {
    image: "library",
    alt: "الكتب والملازم في مكتبة الأزل",
    caption: "أول صفحة في الحكاية.",
    year: "EST. 2010",
  },
};
$$(".entity").forEach((details) =>
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    $$(".entity").forEach((other) => {
      if (other !== details) other.open = false;
    });
    const data = entities[details.dataset.entity];
    if (data.image) $("#entity-image").src = `public/images/${data.image}.webp`;
    $("#entity-image").alt = data.alt;
    $("#entity-caption").textContent = data.caption;
    $("#entity-year").textContent = data.year;
    $(".entity-photo").classList.toggle(
      "is-platform",
      details.dataset.entity === "platform",
    );
  }),
);

$$("[data-cta]").forEach((link) =>
  link.addEventListener("click", () => {
    window.gtag?.("event", "cta_click", { cta_name: link.dataset.cta });
  }),
);
