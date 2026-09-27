import {readFile,writeFile,mkdir,readdir,unlink} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {renderMediaPage,renderArticlePage,renderContentPreview,validateMedia} from './media-document.mjs';

const data=validateMedia(JSON.parse(await readFile('data/media.json','utf8')));
const landing=await readFile('index.html','utf8');
const preview=renderContentPreview(data);
await writeFile('index.html',landing.includes('<!-- content-preview:start -->')
  ? landing.replace(/<!-- content-preview:start -->[\s\S]*?<!-- content-preview:end -->/,preview)
  : landing.replace('<!-- arrival:start -->',preview+'\n      <!-- arrival:start -->'));
const versions={};
for(const [name,file] of Object.entries({styles:'styles.css',css:'media.css',script:'public/media.js',analytics:'public/analytics.js'}))versions[name]=createHash('sha256').update(await readFile(file)).digest('hex').slice(0,12);
await writeFile('media.html',renderMediaPage(data,versions));
if(data.articles.length)await mkdir('articles',{recursive:true});
for(const article of data.articles)await writeFile(`articles/${article.slug}.html`,renderArticlePage(article,versions));
// Remove only pages produced by this generator when an article is withdrawn.
// Hand-authored pages are never touched.
const generatedMarker='<!-- generated: alazal-article -->';
for(const file of await readdir('articles').catch(error=>{if(error.code==='ENOENT')return [];throw error;})) {
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(file))continue;
  const keep=data.articles.some(a=>`${a.slug}.html`===file);
  const content=await readFile(`articles/${file}`,'utf8');
  if(keep)await writeFile(`articles/${file}`,generatedMarker+'\n'+content);
  else if(content.startsWith(generatedMarker))await unlink(`articles/${file}`);
}
console.log(`Rendered media hub: ${data.videos.length} videos, ${data.podcast.episodes.length} podcast episodes, ${data.articles.length} articles.`);
