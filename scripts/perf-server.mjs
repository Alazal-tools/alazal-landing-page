// Local-only, opt-in lab instrumentation. No observers or reports ship to visitors.
// node scripts/perf-server.mjs [root] [port]
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 4200);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.json':'application/json','.png':'image/png','.ico':'image/x-icon'};
const probe = `<script>
(() => {
  const stats = {cls:0, shifts:[], lcp:0, lcpElement:'', longTasks:[], viewport:innerWidth+'x'+innerHeight};
  let cluster = 0, first = 0, last = 0;
  new PerformanceObserver(list => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue;
      if (e.startTime-last>1000 || e.startTime-first>5000) {cluster=0;first=e.startTime;}
      cluster+=e.value;last=e.startTime;stats.cls=Math.max(stats.cls,cluster);
      stats.shifts.push({value:e.value,at:e.startTime,sources:e.sources.map(s=>({node:s.node?.id||s.node?.className,from:s.previousRect.toJSON(),to:s.currentRect.toJSON()}))});
    }
  }).observe({type:'layout-shift',buffered:true});
  new PerformanceObserver(list => {
    for (const e of list.getEntries()) {stats.lcp=e.startTime;stats.lcpElement=e.element?.className||e.element?.tagName;}
  }).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list => {
    for (const e of list.getEntries()) stats.longTasks.push({at:e.startTime,ms:e.duration});
  }).observe({type:'longtask',buffered:true});
  addEventListener('DOMContentLoaded',()=> {
    const out=document.createElement('output');out.id='perf-report';out.hidden=true;document.body.append(out);
    function report() {
      stats.domNodes=document.querySelectorAll('*').length;
      stats.mapNodes=document.querySelectorAll('.district-svg *').length;
      stats.resources=performance.getEntriesByType('resource').filter(e=>e.name.startsWith(location.origin)).map(e=>({name:new URL(e.name).pathname,bytes:e.decodedBodySize,transfer:e.transferSize,ms:e.duration}));
      stats.blockingMs=stats.longTasks.reduce((sum,e)=>sum+Math.max(0,e.ms-50),0);
      stats.elapsed=performance.now();out.textContent=JSON.stringify(stats);
    }
    report();setInterval(report,1000);
  });
})();
</script>`;
http.createServer(async (req,res)=>{
  try {
    let url = new URL(req.url,'http://localhost').pathname;
    if(url.endsWith('/')) url+='index.html';
    const file=path.resolve(root,'.'+decodeURIComponent(url));
    const relative=path.relative(root,file);
    if(relative.startsWith('..')||path.isAbsolute(relative)||relative.split(path.sep).some(p=>p.startsWith('.')||p==='node_modules')) return res.writeHead(403).end();
    let data=await readFile(file);
    // Reproduce a late module response without changing CPU speed or rendering.
    const delay = Math.min(2000, Math.max(0, Number(new URL(req.headers.referer || 'http://localhost').searchParams.get('moduleDelay')) || 0));
    if (url === '/script.js' && delay) await new Promise(resolve=>setTimeout(resolve,delay));
    if(path.extname(file)==='.html') data=Buffer.from(data.toString().replace('<head>','<head>'+probe));
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  } catch {res.writeHead(404).end();}
}).listen(port,'127.0.0.1',()=>console.log('Performance lab: http://127.0.0.1:'+port));
