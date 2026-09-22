const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [
  ...scope.querySelectorAll(selector),
];
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
    if (link.matches('[data-registration-choice]')) return;
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

// Choose the institution before showing its forms. Without JS both remain usable.
const registrationChoices = $$('[data-registration-choice]');
function selectRegistration(choice) {
  if (!['school','institute'].includes(choice)) return;
  document.documentElement.dataset.registration = choice;
  registrationChoices.forEach(link => link.setAttribute('aria-expanded', String(link.dataset.registrationChoice === choice)));
  $$('.registration-group').forEach(group => { group.hidden = group.id !== `${choice}-registration`; });
}
registrationChoices.forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  selectRegistration(link.dataset.registrationChoice);
  history.replaceState(null, '', link.getAttribute('href'));
  if (event.detail === 0) {
    const group = $(link.getAttribute('href'));
    group.setAttribute('tabindex', '-1');
    group.focus({preventScroll:true});
  }
  $('.registration-choices').scrollIntoView({block:'start',behavior:reducedMotion.matches||event.detail===0?'instant':'smooth'});
}));
if (document.documentElement.dataset.registration) selectRegistration(document.documentElement.dataset.registration);
else $$('.registration-group').forEach(group => { group.hidden = true; });
addEventListener('hashchange', () => {
  const choice = /^#(school|institute)-registration$/.exec(location.hash);
  if (choice) selectRegistration(choice[1]);
});

const version = new URL(import.meta.url).search;
const { initStory } = await import('./public/story.js' + version);
initStory();
addEventListener('resize', () => { if (innerWidth > 760) closeMenu(); });

// Hydrate the directions close to their viewport. Story startup has no map
// dependency chain, and a fast navigation/click is replayed after hydration.
const arrivalSection = $("#locations");
let arrivalReady = false;
let arrivalLoading;
function loadArrival() {
  if (!arrivalLoading) arrivalLoading = import('./public/arrival.js').then(({ initArrival }) => {
    initArrival();
    arrivalReady = true;
    arrivalObserver.disconnect();
  }).catch(error => {
    arrivalLoading = null;
    throw error;
  });
  return arrivalLoading;
}
const arrivalObserver = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) loadArrival().catch(() => {});
}, { rootMargin: '1200px' });
arrivalObserver.observe(arrivalSection);
document.addEventListener('click', event => {
  const control = event.target.closest('#locations button, [data-contact-destination]');
  if (!control || arrivalReady) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  loadArrival().then(() => control.click()).catch(() => {});
}, true);
arrivalSection.addEventListener('change', event => {
  if (arrivalReady || event.target.id !== 'arrival-origin') return;
  const select = event.target;
  const value = select.value;
  event.stopImmediatePropagation();
  loadArrival().then(() => {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }).catch(() => {});
}, true);

$$("[data-cta]").forEach((link) =>
  link.addEventListener("click", () => {
    window.gtag?.("event", "cta_click", { cta_name: link.dataset.cta });
  }),
);

// Registration records only opening a form, never a completed enrollment.
document.addEventListener('click', event => {
  const link = event.target.closest('a[data-form-id]');
  if (!link) return;
  window.gtag?.('event', 'form_open', {site_area:'registration', form_id:link.dataset.formId, institution:link.dataset.institution});
  window.clarity?.('event', 'registration_form_open');
});
