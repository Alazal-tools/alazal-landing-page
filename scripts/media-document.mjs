// Static HTML keeps titles, links and articles readable without JavaScript.
// Entries are plain text; editorial content never becomes executable markup.
export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = value => typeof value === 'string' && value.trim().length > 0;
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
const dateLabel = date => new Intl.DateTimeFormat('ar-IQ',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date));

export function validateMedia(data) {
  if (!Array.isArray(data.videos) || !text(data.podcast?.title) || !Array.isArray(data.podcast.episodes) || !Array.isArray(data.articles)) throw new Error('Media needs videos, podcast.title, podcast.episodes and articles.');
  const ids=new Set(),episodes=new Set(),slugs=new Set();
  if (data.podcast.playlistId && !/^PL[a-zA-Z0-9_-]+$/.test(data.podcast.playlistId)) throw new Error('Invalid podcast playlist ID.');
  for (const entry of [...data.videos,...data.podcast.episodes]) {
    if (typeof entry.id!=='string' || entry.id.length!==11 || !/^[a-zA-Z0-9_-]{11}$/.test(entry.id) || !text(entry.title) || !validDate(entry.date)) throw new Error('Every video needs a YouTube ID, title and YYYY-MM-DD date.');
    if (ids.has(entry.id)) throw new Error(`Duplicate video: ${entry.id}`);
    ids.add(entry.id);
    if (entry.duration && !/^\d{1,3}:\d{2}(?::\d{2})?$/.test(entry.duration)) throw new Error(`Invalid duration: ${entry.id}`);
  }
  for (const episode of data.podcast.episodes) {
    if (!Number.isInteger(episode.season) || episode.season<1 || !Number.isInteger(episode.episode) || episode.episode<1) throw new Error('Podcast season and episode must be positive integers.');
    const number=`${episode.season}:${episode.episode}`;
    if (episodes.has(number)) throw new Error(`Duplicate podcast episode: ${number}`);
    episodes.add(number);
  }
  for (const article of data.articles) {
    if (!text(article.slug) || article.slug.trim()!==article.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) || !text(article.title) || !text(article.author) || !text(article.text) || !validDate(article.date)) throw new Error('Every article needs a safe slug, title, author, YYYY-MM-DD date and text.');
    if (slugs.has(article.slug)) throw new Error(`Duplicate article: ${article.slug}`);
    slugs.add(article.slug);
  }
  return data;
}

const playIcon='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="m8 5 11 7-11 7z"/></svg>';
const time = date => `<time datetime="${escapeHTML(date)}">${dateLabel(date)}</time>`;
const readingTime = article => `${new Intl.NumberFormat('ar-IQ').format(Math.max(1,Math.ceil(article.text.trim().split(/\s+/).length/180)))} دقائق قراءة`;

export function videoCard(video,isEpisode=false,playlist=null) {
  const title=escapeHTML(video.title);
  const label=isEpisode?`الموسم ${video.season} · الحلقة ${video.episode}`:'فيديو';
  return `<article class="media-card" id="video-${video.id}" data-media-card>
    <div class="video-frame" data-video="${video.id}"${playlist?` data-playlist="${escapeHTML(playlist)}"`:''}>
      <button class="video-poster" type="button" data-play-video aria-label="تشغيل ${title}">
        <img src="https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg" data-thumbnail="${video.id}" width="1280" height="720" loading="lazy" decoding="async" alt=""/>
        <span class="video-play" aria-hidden="true">${playIcon}</span>
        ${video.duration&&!playlist?`<span class="video-duration" dir="ltr">${escapeHTML(video.duration)}</span>`:''}
      </button>
    </div>
    <div class="media-card-meta"><span>${playlist?'قائمة الحلقات':label}</span>${playlist?'':time(video.date)}</div>
    <h3>${title}</h3>
    ${playlist?'<p class="episode-guest">شاهد جميع الحلقات من قائمة البودكاست.</p>':isEpisode&&video.guest?`<p class="episode-guest">مع ${escapeHTML(video.guest)}</p>`:''}
  </article>`;
}

function articleCard(article,index) {
  return `<article class="article-card${index===0?' article-card-featured':''}" data-media-card>
    <div class="article-card-copy"><div class="media-card-meta"><span>${index===0?'أحدث المقالات':'مقالات الأزل'}</span><span>${readingTime(article)}</span></div>
      <h3><a href="articles/${article.slug}.html">${escapeHTML(article.title)}</a></h3>
      <p class="article-excerpt">${escapeHTML(article.excerpt||article.text.split(/\n\s*\n/)[0].slice(0,170))}</p>
      <div class="article-card-footer"><p class="article-author">${escapeHTML(article.author)}<span>${time(article.date)}</span></p><a class="article-read" href="articles/${article.slug}.html">اقرأ المقال <span aria-hidden="true">←</span></a></div>
    </div>
  </article>`;
}

export function renderContentPreview(data) {
  validateMedia(data);
  const article=[...data.articles].sort((a,b)=>b.date.localeCompare(a.date))[0];
  const videos=[...data.videos].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2);
  return `<!-- content-preview:start -->
      <section class="content-preview section-space" id="content" aria-labelledby="content-preview-title">
        <div class="wrap">
          <header class="content-preview-heading"><h2 id="content-preview-title">محتوى الأزل</h2><a href="media.html">كل المحتوى <span aria-hidden="true">←</span></a></header>
          <div class="content-preview-layout">
            ${article?`<article class="content-preview-article"><p class="content-preview-meta">مقال <span aria-hidden="true">·</span> ${readingTime(article)}</p><h3><a href="articles/${article.slug}.html">${escapeHTML(article.title)}</a></h3><p class="content-preview-excerpt">${escapeHTML(article.excerpt||article.text.split(/\n\s*\n/)[0].slice(0,170))}</p><div class="content-preview-article-footer"><p>بقلم ${escapeHTML(article.author)}<span>${time(article.date)}</span></p><a class="content-preview-read" href="articles/${article.slug}.html">اقرأ المقال <span aria-hidden="true">←</span></a></div></article>`:'<a class="content-preview-read" href="media.html#articles">تصفّح المقالات <span aria-hidden="true">←</span></a>'}
            <div class="content-preview-videos"><h3>شاهد من الأزل</h3>${videos.map(video=>`<a class="content-preview-video" href="media.html#video-${video.id}"><span class="content-preview-thumbnail"><img src="https://i.ytimg.com/vi/${video.id}/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async"/><span class="content-preview-play" aria-hidden="true">${playIcon}</span></span><span class="content-preview-video-copy"><strong>${escapeHTML(video.title)}</strong>${video.duration?`<span dir="ltr">${escapeHTML(video.duration)}</span>`:''}</span></a>`).join('')}<a class="content-preview-all-videos" href="media.html#videos">كل الفيديوهات <span aria-hidden="true">←</span></a></div>
          </div>
        </div>
      </section>
      <!-- content-preview:end -->`;
}

function shell({title,description,body,prefix='',path='media.html',versions={}}) {
  const version=name=>versions[name]?`?v=${versions[name]}`:'';
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8"/>
  ${path==='media.html'?`<script>document.documentElement.dataset.mediaTab=['videos','podcast','articles'].includes(location.hash.slice(1))?location.hash.slice(1):'videos';</script>`:''}
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
  <meta name="theme-color" content="#100051"/>
  <meta name="referrer" content="strict-origin-when-cross-origin"/>
  <title>${escapeHTML(title)} — الأزل</title>
  <meta name="description" content="${escapeHTML(description)}"/>
  <meta property="og:title" content="${escapeHTML(title)} — الأزل"/>
  <meta property="og:description" content="${escapeHTML(description)}"/>
  <meta property="og:type" content="${path==='media.html'?'website':'article'}"/>
  <meta property="og:locale" content="ar_IQ"/>
  <meta property="og:url" content="https://alazalgroup.com/${path}"/>
  <link rel="canonical" href="https://alazalgroup.com/${path}"/>
  <link rel="icon" href="${prefix}favicon.ico" sizes="any"/>
  <link rel="preload" href="${prefix}fonts/DINNextLTArabic-Regular.woff2" as="font" type="font/woff2" crossorigin/>
  <link rel="preload" href="${prefix}fonts/DINNextLTArabic-Bold.woff2" as="font" type="font/woff2" crossorigin/>
  <link rel="stylesheet" href="${prefix}styles.css${version('styles')}"/>
  <link rel="stylesheet" href="${prefix}media.css${version('css')}"/>
  <script type="module" src="${prefix}public/media.js${version('script')}"></script>
  <script type="module" src="${prefix}public/analytics.js${version('analytics')}"></script>
</head>
<body class="media-page">
  <a class="skip-link" href="#main">تخطَّ إلى المحتوى</a>
  <header class="media-header wrap">
    <a class="brand" href="${prefix}index.html#home" aria-label="مجموعة الأزل — الرئيسية"><img src="${prefix}public/brand/logo-white.svg" width="43" height="44" alt=""/><span>مجموعة الأزل<small>التعليمية</small></span></a>
    <a class="media-home-link" href="${prefix}index.html#home">العودة للرئيسية <span aria-hidden="true">↖</span></a>
  </header>
  ${body}
  <div class="site-utility wrap">
    <details class="measurement-settings"><summary>الخصوصية</summary><div class="measurement-body"><a href="${prefix}privacy.html">سياسة الخصوصية ↗</a><div id="meta-privacy" hidden><p>نستخدم Meta لقياس الزيارات وتخصيص إعلانات الأزل.</p><button type="button" id="meta-settings" hidden>إيقاف قياس Meta</button><span id="meta-consent-status" class="sr-only" aria-live="polite"></span></div></div></details>
    <a href="#main" aria-label="العودة إلى أعلى الصفحة">↑</a>
  </div>
</body>
</html>`.replace(/[\t ]+$/gm,'');
}

function collection(cards,kind='videos') {
  return `<div class="media-grid media-grid-${kind}">${cards.join('\n')}</div>${cards.length>6?'<button class="media-more" type="button" data-load-more hidden>عرض المزيد <span aria-hidden="true">↓</span></button>':''}`;
}

export function renderMediaPage(data,versions) {
  validateMedia(data);
  const videos=[...data.videos].sort((a,b)=>b.date.localeCompare(a.date));
  const episodes=[...data.podcast.episodes].sort((a,b)=>a.season-b.season||a.episode-b.episode);
  const articles=[...data.articles].sort((a,b)=>b.date.localeCompare(a.date));
  const body=`<main id="main" class="media-main wrap">
    <div class="media-heading"><div><p class="eyebrow">من مجموعة الأزل</p><h1>محتوى الأزل</h1></div><p>فيديوهات، بودكاست مُعلِّم، ومقالات.</p></div>
    <nav class="media-tabs" aria-label="أقسام المحتوى" data-media-tabs>
      <a id="tab-videos" href="#videos" aria-current="page">الفيديوهات</a>
      <a id="tab-podcast" href="#podcast">بودكاست مُعلِّم</a>
      <a id="tab-articles" href="#articles">المقالات</a>
    </nav>
    <section id="videos" class="media-panel" aria-labelledby="tab-videos" data-media-panel>
      <div class="media-section-heading"><h2>الفيديوهات</h2><span>الأحدث أولاً</span></div>
      ${videos.length?collection(videos.map(v=>videoCard(v))):'<p class="media-empty">تُضاف الفيديوهات هنا قريباً.</p>'}
    </section>
    <section id="podcast" class="media-panel" aria-labelledby="tab-podcast" data-media-panel>
      <div class="media-section-heading"><h2>${escapeHTML(data.podcast.title)}</h2></div>
      ${data.podcast.playlistId?`<div class="podcast-player video-frame"><iframe data-playlist-src="https://www.youtube.com/embed/videoseries?list=${escapeHTML(data.podcast.playlistId)}&amp;rel=0&amp;playsinline=1&amp;hl=ar" title="${escapeHTML(data.podcast.title)} — قائمة الحلقات" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><a class="podcast-link" href="podcast/">جميع الحلقات على YouTube <span aria-hidden="true">↗</span></a>`:episodes.length?collection(episodes.map(v=>videoCard(v,true))):'<p class="media-empty">الحلقات قريباً.</p>'}
    </section>
    <section id="articles" class="media-panel" aria-labelledby="tab-articles" data-media-panel>
      <div class="media-section-heading"><h2>المقالات</h2>${articles.length?'<span>الأحدث أولاً</span>':''}</div>
      ${articles.length?collection(articles.map(articleCard),'articles'):'<div class="media-empty"><h3>المقالات الأولى قريباً.</h3><p>تجدون هنا مقالات الأزل عند نشرها.</p></div>'}
    </section>
    <p class="sr-only" id="media-announcement" aria-live="polite"></p>
  </main>`;
  return shell({title:'محتوى الأزل',description:'فيديوهات مجموعة الأزل التعليمية، حلقات بودكاست معلم، ومقالات الأزل.',body,versions});
}

export function renderArticlePage(article,versions) {
  // Validate through the same contract used by the hub before emitting a path.
  validateMedia({videos:[],podcast:{title:'بودكاست معلم',episodes:[]},articles:[article]});
  const paragraphs=article.text.trim().split(/\r?\n\s*\r?\n/).map(p=>`<p>${escapeHTML(p).replace(/\r?\n/g,'<br/>')}</p>`).join('\n');
  const [opening,...rest]=article.title.split('..');
  const title=rest.length?`<span class="article-title-opening">${escapeHTML(opening)}..</span> ${escapeHTML(rest.join('..').trim())}`:escapeHTML(article.title);
  const body=`<main id="main" class="article-main wrap">
    <a class="article-back" href="../media.html#articles"><span aria-hidden="true">→</span> جميع المقالات</a>
    <article class="article-document">
      <header class="article-heading"><p class="eyebrow">مقالات الأزل</p><h1>${title}</h1><div class="article-byline"><span>بقلم ${escapeHTML(article.author)}</span>${time(article.date)}<span>${readingTime(article)}</span></div></header>
      <div class="article-reading-layout"><aside class="article-margin" aria-label="عن المقال"><span class="article-margin-label">بقلم</span><strong>${escapeHTML(article.author)}</strong><span class="article-margin-rule"></span><span>مقالات الأزل</span></aside><div class="article-prose">${paragraphs}</div></div>
      <a class="article-back article-end" href="../media.html#articles">العودة إلى المقالات <span aria-hidden="true">←</span></a>
    </article>
  </main>`;
  return shell({title:article.title,description:article.excerpt||article.text.slice(0,155),body,prefix:'../',path:`articles/${article.slug}.html`,versions});
}
