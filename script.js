/* ============================================================
   ALAZAL EDUCATION GROUP — Landing Page Behavior
   ============================================================ */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Subject / Teacher data ---------- */
  const SUBJECTS = [
    { id: 'all',       label: 'الجميع',         icon: 'grid' },
    { id: 'physics',   label: 'الفيزياء',       icon: 'atom' },
    { id: 'math',      label: 'الرياضيات',      icon: 'sigma' },
    { id: 'chemistry', label: 'الكيمياء',       icon: 'flask' },
    { id: 'biology',   label: 'الأحياء',         icon: 'dna' },
    { id: 'arabic',    label: 'اللغة العربية',   icon: 'pen' },
    { id: 'english',   label: 'الإنكليزية',      icon: 'globe' },
    { id: 'french',    label: 'الفرنسية',        icon: 'book' },
    { id: 'islamic',   label: 'الإسلامية',       icon: 'moon' },
    { id: 'social',    label: 'الاجتماعيات',     icon: 'map' },
  ];

  const SUBJECT_LABEL = Object.fromEntries(SUBJECTS.map(s => [s.id, s.label]));

  const TEACHERS = [
    // Physics
    { name: 'حكمت حسن', subject: 'physics', image: 'حكمت-حسن.png', badge: '+100' },
    { name: 'حسن عبدالكاظم', subject: 'physics', image: 'حسن-عبدالكاظم.png' },
    { name: 'محمد العبد', subject: 'physics', image: 'محمد-العبد.png' },
    { name: 'حيدر مجيد', subject: 'physics', image: 'حيدر-مجيد.png' },
    { name: 'حسن القزويني', subject: 'physics', image: 'حسن-القزويني.png' },
    { name: 'محمد الساعدي', subject: 'physics', image: 'محمد-الساعدي.png' },
    // Math
    { name: 'قصي هاشم', subject: 'math', image: 'قصي-هاشم.png', badge: '+100' },
    { name: 'صالح العبادي', subject: 'math', image: 'صالح-العبادي.png', badge: '+100' },
    { name: 'حيدر سعدون', subject: 'math', image: 'حيدر-سعدون.png' },
    { name: 'ضياء العوادي', subject: 'math', image: 'ضياء-العوادي.png' },
    { name: 'همام الشمسي', subject: 'math', image: 'همام-شمسي.png' },
    { name: 'حيدر العامري', subject: 'math', image: 'حيدر-العامري.png' },
    { name: 'نادية السعدي', subject: 'math', image: 'نادية-السعدي.png' },
    { name: 'علي نجم', subject: 'math', image: 'علي-نجم.png' },
    { name: 'علي المشاط', subject: 'math', image: 'علي-المشاط.png' },
    { name: 'محمد نمير', subject: 'math', image: 'محمد-نمير.png' },
    // Chemistry
    { name: 'خالد الانباري', subject: 'chemistry', image: 'خالد-الانباري.png', badge: '+100' },
    { name: 'محمد الخليفة', subject: 'chemistry', image: 'محمد-الخليفة-الاصلي.png' },
    { name: 'طارق الوائلي', subject: 'chemistry', image: 'طارق-الوائلي.png' },
    { name: 'وسام نعمة', subject: 'chemistry', image: 'وسام-نعمة.png' },
    { name: 'محمد حسون', subject: 'chemistry', image: 'محمد-حسون.png' },
    { name: 'زينب الشالجي', subject: 'chemistry', image: 'زينب-الشالجي.png' },
    { name: 'همسة محمد', subject: 'chemistry', image: 'همسة-محمد.png' },
    // Biology
    { name: 'د. حيدر ناصر', subject: 'biology', image: 'حيدر-ناصر.png', badge: '+100' },
    { name: 'غالب كاظم', subject: 'biology', image: 'غالب-كاظم.png' },
    { name: 'د. سندس صالح', subject: 'biology', image: 'سندس-صالح.png' },
    // Arabic
    { name: 'د. نجم عبدالواحد', subject: 'arabic', image: 'نجم-عبدالواحد.png', badge: '+100' },
    { name: 'عبدالهادي العبيدي', subject: 'arabic', image: 'عبدالهادي-العبيدي.png' },
    { name: 'علي الدبيسي', subject: 'arabic', image: 'علي-الدبيسي.png' },
    { name: 'منتظر الوردي', subject: 'arabic', image: 'منتظر-الوردي.png' },
    { name: 'ضرغام الشمري', subject: 'arabic', image: 'ضرغام-الشمري.png' },
    { name: 'محمد الجوراني', subject: 'arabic', image: 'محمد-الجوراني.png' },
    { name: 'عبدالكريم نجف', subject: 'arabic', image: 'عبدالكريم-نجف.png' },
    { name: 'جاسب هاشم', subject: 'arabic', image: 'جاسب.png' },
    // English
    { name: 'قسور الخزرجي', subject: 'english', image: 'قسور-الخزرجي.png', badge: '+100' },
    { name: 'علي الجبوري', subject: 'english', image: 'علي-الجبوري.png' },
    { name: 'حيدر القريشي', subject: 'english', image: 'حيدر-القريشي.png' },
    { name: 'وسن منذر', subject: 'english', image: 'وسن-منذر.png' },
    { name: 'مصطفى الطائي', subject: 'english', image: 'مصطفى-الطائي.png' },
    { name: 'زهراء ماجد', subject: 'english', image: 'زهراء ماجد.png' },
    // Single-member subjects
    { name: 'عبدالرسول الحسني', subject: 'french', image: 'عبدالرسول-الحسني.png', badge: '+100' },
    { name: 'ورود دانيال', subject: 'islamic', image: 'ورود-دانيال.png' },
    { name: 'كفاح اسماعيل', subject: 'social', image: 'كفاح-اسماعيل.png' },
  ];

  /* ---------- Inline SVG icon library (used by tabs) ---------- */
  const ICONS = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    atom: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="1.5" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/></svg>',
    sigma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5H6l7 7-7 7h12"/></svg>',
    flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6L4 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2L14 9V3"/><path d="M7 15h10"/></svg>',
    dna: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4c0 6 16 8 16 16M20 4c0 6-16 8-16 16"/><path d="M7 5h10M7 19h10M8 9h8M8 15h8"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 4h7a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4Z"/><path d="M20 4h-7a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h8Z"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="m9 4-6 3v13l6-3 6 3 6-3V4l-6 3Z"/><path d="M9 4v13M15 7v13"/></svg>',
  };

  /* ============================================================
     Nav — scroll tint + mobile menu
     ============================================================ */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'فتح القائمة');
    navMenu.hidden = true;
  };
  const openMenu = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'إغلاق القائمة');
    navMenu.hidden = false;
  };
  navToggle.addEventListener('click', () => {
    navToggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      navToggle.focus();
    }
  });

  /* ============================================================
     Active nav-link highlighting
     ============================================================ */
  const sections = ['home', 'story', 'entities', 'teachers', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const navLinks = nav.querySelectorAll('.nav__links a');
  const linkFor = hash => Array.from(navLinks).find(a => a.getAttribute('href') === `#${hash}`);

  if ('IntersectionObserver' in window) {
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('is-active'));
          const link = linkFor(e.target.id);
          if (link) link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    sections.forEach(s => navObs.observe(s));
  }

  /* ============================================================
     Genesis Point — curved traversal through the hero.
     Path: starts small above the 2010 chip, swoops around the text
     (never across it), grows, rotates, then is "absorbed" by the stats.
     ============================================================ */
  const point = document.getElementById('genesisPoint');
  const genesisOrbit = document.getElementById('genesisOrbit');
  const hero = document.getElementById('home');
  const timelineSection = document.getElementById('timeline');
  const timelineBeacon = document.getElementById('timelineBeacon');
  const timelineOrbit = document.querySelector('.timeline__orbit');
  const firstTlItem = document.querySelector('.tl-item:first-child');

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  // Waypoints: simple vertical descent + growth, then absorbed into the stats.
  // Stays horizontally centered the whole way — no rotation, no horizontal arc.
  // Initial "top" is deliberately 24% so the orbit rings (150 px radius)
  // never scrape the top of the viewport (would otherwise look like a line).
  const HERO_PATH = [
    { p: 0.00, top: 11, left: 50, size: 70,  opa: 1 },    // ABOVE the 2010 chip
    { p: 0.35, top: 42, left: 50, size: 130, opa: 1 },    // growing as it descends
    { p: 0.70, top: 72, left: 50, size: 200, opa: 1 },    // largest, just above stats
    { p: 0.88, top: 83, left: 50, size: 130, opa: 0.55 }, // shrinking into stats
    { p: 1.00, top: 88, left: 50, size: 20,  opa: 0    }, // absorbed
  ];

  function samplePath(p) {
    p = clamp(p, 0, 1);
    for (let i = 0; i < HERO_PATH.length - 1; i++) {
      const a = HERO_PATH[i], b = HERO_PATH[i + 1];
      if (p <= b.p) {
        const t = (p - a.p) / (b.p - a.p);
        const et = t * t * (3 - 2 * t); // smoothstep easing
        return {
          top:  lerp(a.top,  b.top,  et),
          left: lerp(a.left, b.left, et),
          size: lerp(a.size, b.size, et),
          opa:  lerp(a.opa,  b.opa,  et),
        };
      }
    }
    return HERO_PATH[HERO_PATH.length - 1];
  }

  if (point && hero && !prefersReducedMotion) {
    // Mouse parallax inside the hero
    let parallaxRaf = null;
    hero.addEventListener('mousemove', e => {
      if (parallaxRaf) return;
      parallaxRaf = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width - 0.5;
        const my = (e.clientY - rect.top) / rect.height - 0.5;
        point.style.setProperty('--mx', mx.toFixed(3));
        point.style.setProperty('--my', my.toFixed(3));
        parallaxRaf = null;
      });
    });
    hero.addEventListener('mouseleave', () => {
      point.style.setProperty('--mx', 0);
      point.style.setProperty('--my', 0);
    });
  }

  /* ============================================================
     Scroll-linked: genesis-point fade + timeline beacon descent.
     ============================================================ */
  // Measure the distance the beacon must travel (from its rest slot above
  // the timeline title down to the 2010 marker). Cached, refreshed on resize.
  let beaconTravel = 0;
  const measureBeaconTravel = () => {
    if (!timelineBeacon || !firstTlItem) return;
    // Temporarily freeze beacon at rest to measure.
    const saved = timelineBeacon.style.getPropertyValue('--tl-progress');
    timelineBeacon.style.setProperty('--tl-progress', '0');
    timelineBeacon.style.visibility = 'hidden'; // avoid flash
    // Force layout
    const bRect = timelineBeacon.getBoundingClientRect();
    const mRect = firstTlItem.getBoundingClientRect();
    beaconTravel = Math.max(0, (mRect.top + 18) - (bRect.top + bRect.height / 2));
    timelineBeacon.style.setProperty('--tl-travel', beaconTravel + 'px');
    timelineBeacon.style.visibility = '';
    if (saved) timelineBeacon.style.setProperty('--tl-progress', saved);
  };

  if (!prefersReducedMotion) {
    let scrollRaf = null;

    const updateScrollLinked = () => {
      const vh = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const isMobile = window.innerWidth < 768;

      // 1. Genesis point: grow as user scrolls, then absorbed by the stats.
      //    Same path on desktop and mobile (sizes scaled for screen).
      if (point && hero) {
        const p = clamp(scrollY / (vh * 0.85), 0, 1);
        const s = samplePath(p);

        // Mobile keeps the same trajectory but with smaller sizes.
        const size = isMobile ? s.size * 0.55 : s.size;

        point.style.setProperty('--gp-top',  s.top  + '%');
        point.style.setProperty('--gp-left', s.left + '%');
        point.style.setProperty('--gp-size', size + 'px');
        point.style.setProperty('--gp-opa',  s.opa.toFixed(3));
        point.setAttribute('data-hidden', p >= 0.995 ? 'true' : 'false');

        if (genesisOrbit) {
          genesisOrbit.setAttribute('data-hidden', p >= 0.995 ? 'true' : 'false');
        }

        // Energize the stats once the shape starts being absorbed.
        const statsEl = document.querySelector('.hero__stats');
        if (statsEl) {
          if (p >= 0.72) statsEl.classList.add('is-energized');
          else statsEl.classList.remove('is-energized');
        }
      }

      // 2. Timeline beacon.
      //    Desktop — descends to meet the 2010 marker as scroll advances.
      //    Mobile  — stays static above the title; orbits keep moving.
      if (timelineBeacon && timelineSection && firstTlItem) {
        const secRect = timelineSection.getBoundingClientRect();
        const sectionVisible = secRect.top < vh * 0.95 && secRect.bottom > vh * 0.2;
        timelineBeacon.setAttribute('data-hidden', sectionVisible ? 'false' : 'true');

        if (sectionVisible) {
          if (isMobile) {
            // Static beacon — pin to 0 so CSS rest transform applies.
            timelineBeacon.style.setProperty('--tl-progress', '0');
            if (timelineOrbit) {
              timelineOrbit.classList.add('is-visible');
              timelineOrbit.removeAttribute('data-fade');
            }
          } else {
            const startAt = vh * 0.55;
            const endAt = vh * 0.05;
            let p;
            if (secRect.top >= startAt) p = 0;
            else if (secRect.top <= endAt) p = 1;
            else p = (startAt - secRect.top) / (startAt - endAt);
            timelineBeacon.style.setProperty('--tl-progress', p.toFixed(3));

            if (timelineOrbit) {
              if (p < 0.55 && secRect.top < vh * 0.8) {
                timelineOrbit.classList.add('is-visible');
                timelineOrbit.removeAttribute('data-fade');
              } else {
                timelineOrbit.setAttribute('data-fade', 'true');
              }
            }
          }
        } else if (timelineOrbit) {
          timelineOrbit.classList.remove('is-visible');
        }
      }

      scrollRaf = null;
    };

    const onScrollLinked = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(updateScrollLinked);
    };
    window.addEventListener('scroll', onScrollLinked, { passive: true });
    window.addEventListener('resize', () => {
      measureBeaconTravel();
      onScrollLinked();
    });
    // Re-measure once fonts + images have settled.
    window.addEventListener('load', () => {
      measureBeaconTravel();
      updateScrollLinked();
    });
    measureBeaconTravel();
    updateScrollLinked();
  } else {
    if (point) point.setAttribute('data-hidden', 'true');
    if (timelineBeacon) timelineBeacon.setAttribute('data-hidden', 'true');
  }

  /* ============================================================
     Reveal-on-scroll (timeline items, entity cards)
     ============================================================ */
  const revealTargets = document.querySelectorAll('.tl-item, .entity');
  revealTargets.forEach((el, i) => el.style.setProperty('--i', i));

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(el => revealObs.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ============================================================
     TEACHERS — tabs + grid
     ============================================================ */
  const tabsEl = document.getElementById('subjectTabs');
  const gridEl = document.getElementById('teachersGrid');

  if (tabsEl && gridEl) {
    // Build subject tabs with counts
    const counts = TEACHERS.reduce((acc, t) => {
      acc[t.subject] = (acc[t.subject] || 0) + 1;
      return acc;
    }, {});
    counts.all = TEACHERS.length;

    const indicator = tabsEl.querySelector('.tabs__indicator');
    tabsEl.innerHTML = '';
    SUBJECTS.forEach((s, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      btn.setAttribute('aria-controls', 'teachersGrid');
      btn.setAttribute('data-subject', s.id);
      btn.tabIndex = idx === 0 ? 0 : -1;
      btn.innerHTML = `${ICONS[s.icon] || ''}<span>${s.label}</span><span class="tab__count">${counts[s.id] || 0}</span>`;
      tabsEl.appendChild(btn);
    });
    if (indicator) tabsEl.appendChild(indicator);

    const tabEls = Array.from(tabsEl.querySelectorAll('.tab'));

    const renderGrid = (subjectId) => {
      const list = subjectId === 'all'
        ? TEACHERS
        : TEACHERS.filter(t => t.subject === subjectId);

      if (!list.length) {
        gridEl.innerHTML = '<p class="teachers__empty">لا يوجد أساتذة في هذه المادة.</p>';
        return;
      }

      const frag = document.createDocumentFragment();
      list.forEach((t, i) => {
        const card = document.createElement('article');
        card.className = 'teacher';
        card.style.setProperty('--i', i);

        const frame = document.createElement('div');
        frame.className = 'teacher__frame';

        if (t.badge) {
          const b = document.createElement('span');
          b.className = 'teacher__badge';
          b.title = 'ضمن كادر برنامج 100+';
          b.setAttribute('aria-label', 'من كادر برنامج 100+');
          const bImg = document.createElement('img');
          bImg.src = 'public/1.png';
          bImg.alt = '';
          bImg.setAttribute('aria-hidden', 'true');
          b.appendChild(bImg);
          frame.appendChild(b);
        }

        if (t.image) {
          const img = document.createElement('img');
          img.src = `public/teachers/${t.image}`;
          img.alt = t.name;
          img.loading = 'lazy';
          img.decoding = 'async';
          frame.appendChild(img);
        } else {
          // No portrait available — show the full name inside the frame.
          const fb = document.createElement('div');
          fb.className = 'teacher__fallback';
          const nm = document.createElement('span');
          nm.className = 'teacher__fallback-name';
          nm.textContent = t.name;
          fb.appendChild(nm);
          frame.appendChild(fb);
        }

        const name = document.createElement('p');
        name.className = 'teacher__name';
        name.textContent = t.name;

        const subj = document.createElement('p');
        subj.className = 'teacher__subject';
        subj.textContent = SUBJECT_LABEL[t.subject] || '';

        card.appendChild(frame);
        card.appendChild(name);
        card.appendChild(subj);
        frag.appendChild(card);
      });

      gridEl.innerHTML = '';
      gridEl.appendChild(frag);

      // Trigger the reveal transition on the next frame (the browser needs
      // one paint with the "off" state before the "on" state fires).
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          gridEl.querySelectorAll('.teacher').forEach(el => el.classList.add('is-in'));
        });
      });
    };

    const selectTab = (subjectId, { focus = false } = {}) => {
      tabEls.forEach(t => {
        const isSel = t.getAttribute('data-subject') === subjectId;
        t.setAttribute('aria-selected', isSel ? 'true' : 'false');
        t.tabIndex = isSel ? 0 : -1;
        if (isSel && focus) t.focus();
      });

      if (prefersReducedMotion) {
        renderGrid(subjectId);
      } else {
        gridEl.classList.add('is-fading');
        window.setTimeout(() => {
          renderGrid(subjectId);
          gridEl.classList.remove('is-fading');
        }, 180);
      }
    };

    tabsEl.addEventListener('click', e => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      selectTab(btn.getAttribute('data-subject'));
    });

    tabsEl.addEventListener('keydown', e => {
      const current = tabEls.findIndex(t => t.getAttribute('aria-selected') === 'true');
      if (current === -1) return;
      let next = current;
      // RTL: right arrow → previous, left arrow → next (match visual order)
      if (e.key === 'ArrowLeft') next = (current + 1) % tabEls.length;
      else if (e.key === 'ArrowRight') next = (current - 1 + tabEls.length) % tabEls.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabEls.length - 1;
      else return;
      e.preventDefault();
      selectTab(tabEls[next].getAttribute('data-subject'), { focus: true });
      // Keep focused tab visible when horizontally scrollable
      tabEls[next].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });

    // Initial render: all teachers
    renderGrid('all');
  }

  /* ============================================================
     FOOTER — contact cards with WhatsApp + social links
     ============================================================ */
  const CONTACTS = [
    {
      name: 'معهد الأزل الأهلي',
      phone: '07818041198',
      whatsapp: '9647818041198',
      instagram: 'alazal.institute',
      tgChannel: 'alazalinstitutee',
      tgContact: 'alazal_institute',
      facebook: 'Alazal.institute',
    },
    {
      name: 'ثانوية الأزل الأهلية للبنات',
      phone: '07700330666',
      whatsapp: '9647700330666',
      instagram: 'alazal_schools',
      tgChannel: 'alazal_schools',
      tgContact: 'az_sup',
      facebook: 'alazal_schools',
    },
    {
      name: 'ثانوية الأزل الأهلية للبنين',
      phone: '07731999246',
      whatsapp: '9647731999246',
      instagram: 'alazal_schools',
      tgChannel: 'alazal_schools',
      tgContact: 'az_sup',
      facebook: 'alazal_schools',
    },
    {
      name: 'منصة الأزل التعليمية',
      phone: '07818041198',
      whatsapp: '9647818041198',
      instagram: 'alazalplatform',
      tgChannel: 'alazalplatform',
      facebook: 'alazalplatform',
    },
    {
      name: 'مكتبة الأزل',
      phone: '07705433370',
      whatsapp: '9647705433370',
      instagram: 'alazallibrary',
      tgChannel: 'alazallibrary',
      tgContact: 'al_azal',
      facebook: 'libraryalazal',
    },
    {
      name: 'دار الأزل',
      phone: '07705433370',
      whatsapp: '9647705433370',
      instagram: 'Dar_alazal',
      tgChannel: 'alazallibrary',
      tgContact: 'az_p_p',
    },
  ];

  const SOCIAL_ICONS = {
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35M12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.34-.2-3.58.94.95-3.5-.22-.35a9.44 9.44 0 0 1-1.44-5.03c0-5.22 4.25-9.48 9.48-9.48 2.53 0 4.91.99 6.7 2.78a9.45 9.45 0 0 1 2.78 6.7 9.48 9.48 0 0 1-9.5 9.46m8.08-17.52A11.41 11.41 0 0 0 12.05.5C5.76.5.66 5.6.66 11.88c0 2.01.52 3.96 1.52 5.69L.55 23.5l6.06-1.59a11.39 11.39 0 0 0 5.45 1.39h.01c6.28 0 11.38-5.1 11.38-11.39 0-3.04-1.18-5.9-3.33-8.05"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.56 9.88v-7H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.88h-2.33v7A10 10 0 0 0 22 12"/></svg>',
  };

  const contactsEl = document.getElementById('contacts');
  if (contactsEl) {
    const frag = document.createDocumentFragment();
    CONTACTS.forEach(c => {
      const card = document.createElement('article');
      card.className = 'contact-card';

      const h = document.createElement('h3');
      h.textContent = c.name;
      card.appendChild(h);

      const phoneLink = document.createElement('a');
      phoneLink.className = 'contact-card__phone';
      phoneLink.href = `tel:${c.phone}`;
      phoneLink.innerHTML = `${SOCIAL_ICONS.phone}<span>${c.phone}</span>`;
      card.appendChild(phoneLink);

      const links = document.createElement('div');
      links.className = 'social-links';

      if (c.whatsapp) {
        const a = document.createElement('a');
        a.href = `https://wa.me/${c.whatsapp}`;
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'is-whatsapp';
        a.setAttribute('aria-label', `واتساب ${c.name}`);
        a.innerHTML = SOCIAL_ICONS.whatsapp;
        links.appendChild(a);
      }
      if (c.instagram) {
        const a = document.createElement('a');
        a.href = `https://instagram.com/${c.instagram.replace(/^@/, '')}`;
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', `انستغرام ${c.name}`);
        a.innerHTML = SOCIAL_ICONS.instagram;
        links.appendChild(a);
      }
      if (c.tgChannel) {
        const a = document.createElement('a');
        a.href = `https://t.me/${c.tgChannel.replace(/^@/, '')}`;
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', `قناة تلغرام ${c.name}`);
        a.innerHTML = SOCIAL_ICONS.telegram;
        links.appendChild(a);
      }
      if (c.tgContact && c.tgContact !== c.tgChannel) {
        const a = document.createElement('a');
        a.href = `https://t.me/${c.tgContact.replace(/^@/, '')}`;
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', `تلغرام ${c.name}`);
        a.innerHTML = SOCIAL_ICONS.telegram;
        a.style.opacity = '0.85';
        links.appendChild(a);
      }
      if (c.facebook) {
        const a = document.createElement('a');
        a.href = `https://facebook.com/${c.facebook.replace(/^@/, '')}`;
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', `فيسبوك ${c.name}`);
        a.innerHTML = SOCIAL_ICONS.facebook;
        links.appendChild(a);
      }

      card.appendChild(links);
      frag.appendChild(card);
    });
    contactsEl.appendChild(frag);
  }

})();
