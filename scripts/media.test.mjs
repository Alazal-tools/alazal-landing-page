import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {validateMedia,renderMediaPage,renderArticlePage} from './media-document.mjs';

const empty=()=>({videos:[],podcast:{title:'بودكاست معلم',episodes:[]},articles:[]});
const article={slug:'test-article',title:'عنوان المقال',author:'كاتب الاختبار',date:'2026-09-23',text:'الفقرة الأولى.\n\nالفقرة الثانية.\nسطر جديد.'};
const video={id:'HJ-sBMqVRq4',title:'فيديو الاختبار',date:'2023-12-22',duration:'1:35:42'};

test('The local hub includes videos and a live podcast playlist without story code',async()=>{
  const data=JSON.parse(await readFile('data/media.json','utf8'));
  const html=await readFile('media.html','utf8');
  validateMedia(data);
  assert.deepEqual(data.videos.map(v=>v.id).sort(),['HJ-sBMqVRq4','QOQ37m_o0us'].sort());
  assert.equal(data.podcast.episodes.length,1);
  assert.equal(data.podcast.episodes[0].id,'3vOQ5U0JVq4');
  assert.equal(data.podcast.episodes[0].season,1);
  assert.equal(data.podcast.episodes[0].episode,1);
  assert.equal(data.podcast.playlistId,'PLODw1CMx1wDc');
  assert(html.includes('data-playlist-src="https://www.youtube.com/embed/videoseries?list=PLODw1CMx1wDc'));
  assert(html.includes('قائمة الحلقات'));
  assert(!html.includes('الحلقات قريباً.'));
  assert.equal(data.articles.length,1);
  assert.equal(data.articles[0].author,'محمد صالح');
  assert(html.includes('href="articles/muallim-beyond-education.html"'));
  assert(!html.includes('youtube-link') && !html.includes('href="https://www.youtube.com/watch'));
  assert.equal((html.match(/<button class="video-poster"/g)||[]).length,2);
  for(const id of data.videos.map(v=>v.id))assert(html.includes(`data-video="${id}"`));
  assert.equal((html.match(/<iframe\b/g)||[]).length,1);
  assert(!html.includes('video-play-label'));
  const redirect=await readFile('podcast/index.html','utf8');
  assert(redirect.includes('https://www.youtube.com/playlist?list=PLODw1CMx1wDc'));
  assert(redirect.includes('location.replace('));
  assert(html.includes('href="podcast/"'));
  assert(!/brand-scene\.js|public\/story\.js|arrival\.js/.test(html));
  assert(html.includes('referrer" content="strict-origin-when-cross-origin'));
  assert(html.indexOf('dataset.mediaTab')<html.indexOf('rel="stylesheet"'));
  assert(gzipSync(await readFile('public/media.js')).length<4*1024);
  for(const [,url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if(!/^(https?:|#)/.test(url))await access(decodeURIComponent(url.split(/[?#]/)[0]));
  }
  const index=await readFile('index.html','utf8');
  assert(index.includes('class="hero-media-link" href="media.html"'));
  assert(index.includes('id="content"') && index.includes('href="articles/muallim-beyond-education.html"'));
  assert(index.indexOf('id="content"')>index.indexOf('id="registration"') && index.indexOf('id="content"')<index.indexOf('id="locations"'));
  for(const [,attributes] of index.matchAll(/<img\b([^>]*i\.ytimg\.com[^>]*)>/g))assert(attributes.includes('loading="lazy"'),'Defer landing-page video thumbnails');
  assert(!index.includes('<iframe'),'Keep video players off the initial landing page');
  const publishedArticle=await readFile(`articles/${data.articles[0].slug}.html`,'utf8');
  assert(publishedArticle.includes('datetime="2026-09-27"'));
  for(const paragraph of data.articles[0].text.split(/\n\s*\n/)) {
    const escape=value=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    assert(publishedArticle.includes(escape(paragraph).replace(/\n/g,'<br/>')),'Keep every supplied paragraph in the generated article');
  }
});

test('Future content is ordered by publication date and podcast season/episode, with incremental loading',()=>{
  const data=empty();
  data.videos=[video,{...video,id:'QOQ37m_o0us',title:'الأحدث',date:'2024-09-04'}];
  data.podcast.episodes=Array.from({length:8},(_,i)=>({...video,id:`episode___${i}`,season:1,episode:8-i,title:`الحلقة ${8-i}`}));
  data.articles=[article];
  const html=renderMediaPage(data);
  assert(html.indexOf('data-video="QOQ37m_o0us"')<html.indexOf('data-video="HJ-sBMqVRq4"'));
  assert(html.indexOf('الموسم 1 · الحلقة 1')<html.indexOf('الموسم 1 · الحلقة 8'));
  assert(html.includes('data-load-more hidden'));
  assert(html.includes('href="articles/test-article.html"'));
  assert(html.includes('كاتب الاختبار'));
});

test('Article pages retain the author/date, paragraph breaks and safe plain-text content',()=>{
  const html=renderArticlePage({...article,title:'عنوان <script>alert(1)</script>',author:'كاتب <img>',text:'فقرة <script>alert(2)</script>\n\nثانية & ثالثة.\nسطر جديد.'});
  assert(html.includes('datetime="2026-09-23"'));
  assert(html.includes('بقلم كاتب &lt;img&gt;'));
  assert(html.includes('<p>فقرة &lt;script&gt;alert(2)&lt;/script&gt;</p>'));
  assert(html.includes('<p>ثانية &amp; ثالثة.<br/>سطر جديد.</p>'));
  assert(!html.includes('<script>alert('));
  assert(html.includes('href="../media.html#articles"'));
});

test('Content validation rejects duplicate destinations, invalid dates and unsafe article paths',()=>{
  assert.throws(()=>validateMedia({...empty(),videos:[video,video]}),/Duplicate video/);
  assert.throws(()=>validateMedia({...empty(),videos:[{...video,id:video.id+'\n'}]}),/YouTube ID/);
  assert.throws(()=>validateMedia({...empty(),articles:[{...article,date:'2026-02-30'}]}),/YYYY-MM-DD/);
  for(const slug of ['../escape','<script>','test\n','test/name'])assert.throws(()=>validateMedia({...empty(),articles:[{...article,slug}]}),/safe slug/);
  assert.throws(()=>validateMedia({...empty(),articles:[article,article]}),/Duplicate article/);
  assert.throws(()=>validateMedia({...empty(),podcast:{title:'معلم',episodes:[{...video,episode:0,season:1}]}}),/positive integers/);
});
