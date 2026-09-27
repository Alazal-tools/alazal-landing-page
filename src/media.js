const tabs=[...document.querySelectorAll('[data-media-tabs] a')];
const panels=[...document.querySelectorAll('[data-media-panel]')];
let playing;

function stopPlayer() {
  if(!playing)return;
  playing.querySelector('iframe')?.remove();
  playing.querySelector('[data-play-video]').hidden=false;
  playing=null;
}

function selectPanel(id,updateURL=false) {
  if(!panels.some(panel=>panel.id===id))id='videos';
  if(panels.find(panel=>!panel.hidden)?.id!==id)stopPlayer();
  panels.forEach(panel=>{panel.hidden=panel.id!==id;});
  document.documentElement.dataset.mediaTab=id;
  tabs.forEach(tab=>{
    const selected=tab.hash===`#${id}`;
    tab.setAttribute('aria-selected',String(selected));
    tab.tabIndex=selected?0:-1;
    tab.removeAttribute('aria-current');
  });
  if(updateURL&&location.hash!==`#${id}`)history.pushState(null,'',`#${id}`);
}

if(tabs.length) {
  document.querySelector('[data-media-tabs]').setAttribute('role','tablist');
  tabs.forEach(tab=>{
    tab.setAttribute('role','tab');tab.setAttribute('aria-controls',tab.hash.slice(1));
    tab.addEventListener('click',event=>{event.preventDefault();selectPanel(tab.hash.slice(1),true);});
    tab.addEventListener('keydown',event=>{
      let index=tabs.indexOf(tab);
      // The tablist follows Arabic's right-to-left visual order.
      if(event.key==='ArrowLeft')index=(index+1)%tabs.length;
      else if(event.key==='ArrowRight')index=(index+tabs.length-1)%tabs.length;
      else if(event.key==='Home')index=0;
      else if(event.key==='End')index=tabs.length-1;
      else if(event.key===' '){event.preventDefault();tab.click();return;}
      else return;
      event.preventDefault();tabs[index].focus();selectPanel(tabs[index].hash.slice(1),true);
    });
  });
  panels.forEach(panel=>{panel.setAttribute('role','tabpanel');panel.tabIndex=0;});
  selectPanel(location.hash.slice(1));
  addEventListener('hashchange',()=>selectPanel(location.hash.slice(1)));
  addEventListener('popstate',()=>selectPanel(location.hash.slice(1)));
  document.querySelectorAll('a[href="#main"]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();
    const main=document.querySelector('#main');main.tabIndex=-1;
    main.scrollIntoView({behavior:event.detail===0||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    main.focus({preventScroll:true});
  }));
}

// A poster loads first. The familiar YouTube player is created only in response
// to a click, and replacing it stops the old video's audio immediately.
document.querySelectorAll('[data-play-video]').forEach(poster=>poster.addEventListener('click',event=>{
  const frame=poster.closest('[data-video]'),id=frame.dataset.video;
  if(!/^[a-zA-Z0-9_-]{11}$/.test(id))return;
  event.preventDefault();stopPlayer();
  const player=document.createElement('iframe');
  const url=new URL(`https://www.youtube.com/embed/${id}`);
  url.search=new URLSearchParams({autoplay:'1',rel:'0',playsinline:'1',hl:'ar',origin:location.origin}).toString();
  player.src=url.href;
  player.title=poster.closest('article').querySelector('h3').textContent;
  player.allow='autoplay; encrypted-media; picture-in-picture; fullscreen; web-share';
  player.allowFullscreen=true;player.referrerPolicy='strict-origin-when-cross-origin';
  poster.hidden=true;frame.append(player);playing=frame;player.focus();
}));

for(const image of document.querySelectorAll('[data-thumbnail]')) {
  const fallback=()=>{if(image.dataset.fallback)return;image.dataset.fallback='true';image.src=`https://i.ytimg.com/vi/${image.dataset.thumbnail}/hqdefault.jpg`;};
  image.addEventListener('error',fallback,{once:true});
  image.addEventListener('load',()=>{if(image.naturalWidth<200)fallback();});
  if(image.complete&&image.naturalWidth<200)fallback();
}

for(const panel of panels) {
  const cards=[...panel.querySelectorAll('[data-media-card]')],button=panel.querySelector('[data-load-more]');
  if(!button)continue;
  let count=6;
  const reveal=()=>{cards.forEach((card,i)=>card.hidden=i>=count);button.hidden=count>=cards.length;};
  reveal();
  button.addEventListener('click',()=>{
    const firstNew=cards[count];count+=6;reveal();
    document.querySelector('#media-announcement').textContent=`عرض ${Math.min(count,cards.length)} من ${cards.length}`;
    // Preserve keyboard position when the final load-more button disappears.
    if(firstNew){firstNew.tabIndex=-1;firstNew.focus({preventScroll:true});}
  });
}
