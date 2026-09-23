import {clamp, mix, range, storyState, sceneReveal, stickyStageTop} from './story-motion.js';

export function initStory() {
  const root = document.documentElement;
  const story = document.querySelector('#story'), stage = story.querySelector('.story-stage');
  const panels = [...story.querySelectorAll('.story-panel')];
  const arts = panels.map(p => p.querySelector('.scene-art'));
  const copies = panels.map(p => p.querySelector('.story-copy'));
  const mount = document.querySelector('#brand-object'), fallback = mount.querySelector('.object-fallback');
  const hero = document.querySelector('#home'), heroAnchor = document.querySelector('#hero-anchor');
  const finishAnchor = document.querySelector('#chapter-anchor-4');
  const buttons = [...story.querySelectorAll('[data-story-to]')];
  const bar = story.querySelector('.story-progress > span');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const shapeRatio = 2.15 / 3.8;
  let scene, frame = 0, enabled = false, storyTop = 0, travel = 1, heroAngle = 0;
  let active = -1, lastPose = '', lastState = '', previousWidth = innerWidth, previousHeight = innerHeight;
  let shownProgress=null,lastTick=0,snapNext=true;
  let heroPoint,heroBottom=0,finalPoint,centres=[],canvasSpan=480;
  const box = element => { const r = element.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2, size:element.offsetWidth}; };
  const blend = (a,b,t) => ({x:mix(a.x,b.x,t), y:mix(a.y,b.y,t), size:mix(a.size,b.size,t)});

  function measure() {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.hero-logo')).transform);
    heroAngle = -Math.atan2(matrix.b, matrix.a);
    storyTop = story.getBoundingClientRect().top + scrollY;
    travel = Math.max(1, story.offsetHeight - stage.offsetHeight);
    const stageTop=stage.getBoundingClientRect().top;
    heroPoint=box(heroAnchor);heroPoint.y+=scrollY;
    heroBottom=hero.getBoundingClientRect().bottom+scrollY;
    finalPoint=box(finishAnchor);finalPoint.y-=stageTop;
    centres=arts.map(art=>{
      const r=art.getBoundingClientRect(),span=Math.min(r.width,r.height)*.96;
      return {x:r.left+r.width/2,y:r.top+r.height/2-stageTop,size:span*shapeRatio};
    });
    canvasSpan=Math.max(...centres.map(p=>p.size/shapeRatio));
    scene?.resize(canvasSpan);
    lastState = '';
    invalidate();
  }
  function configure() {
    enabled = !reduced.matches;
    root.classList.toggle('motion-story', enabled);
    root.classList.toggle('reading-story', !enabled);
    panels.forEach(p => {
      p.style.opacity=''; p.style.visibility=''; p.removeAttribute('aria-hidden'); p.inert=false;
      p.style.setProperty('--build','1'); p.style.setProperty('--reveal','1');
    });
    copies.forEach(p => {p.style.opacity='';});
    active=-1; lastState=''; snapNext=true; measure();
  }
  function update(time) {
    frame=0;
    if(document.hidden)return;
    const raw=(scrollY-storyTop)/travel*panels.length;
    const elapsed=lastTick?Math.min(64,time-lastTick):16;lastTick=time;
    if(shownProgress===null||snapNext||!enabled||raw<0||raw>=panels.length)shownProgress=raw;
    else shownProgress=mix(shownProgress,raw,1-Math.exp(-elapsed/85));
    snapNext=false;
    const settling=Math.abs(shownProgress-raw)>.0002;
    if(!settling)shownProgress=raw;
    const state=storyState(shownProgress,panels.length);
    const entrance=enabled?range(scrollY/storyTop,.12,1):0;
    // Geometry is measured only when the layout changes. This frame performs
    // arithmetic followed by writes, so scroll never forces a layout flush.
    const stageY=enabled?stickyStageTop(scrollY,storyTop,travel):storyTop-scrollY;
    const heroNow={...heroPoint,y:heroPoint.y-scrollY};
    const centre={...centres[state.active],y:centres[state.active].y+stageY};
    const finish={...finalPoint,y:finalPoint.y+stageY};
    let point=heroNow, pose={x:0,y:0,z:heroAngle,chapter:-1,build:0};
    if(enabled) {
      point=blend(heroNow,centre,entrance);
      pose={x:0,y:0,z:mix(heroAngle,0,entrance),chapter:state.active,build:state.build*entrance,exit:state.gather};
      if(state.active===4) {
        point=blend(centre,finish,range(state.local,.38,.70));
        pose={x:0,y:0,z:0,chapter:state.local<.38?4:-1,build:range(state.local,0,.38),exit:0};
      }
      const key=[state.active,state.local.toFixed(4),entrance.toFixed(4)].join(',');
      if(key!==lastState) {
        lastState=key;
        panels.forEach((panel,i)=>{
          const current=i===state.active;
          if(!current&&i!==active&&active!==-1)return;
          if(i!==active||!current){panel.style.opacity=current?'1':'0';panel.style.visibility=current?'visible':'hidden';}
          const build=current?state.build:0;
          panel.style.setProperty('--build',String(build));
          panel.style.setProperty('--reveal',String(sceneReveal(i,build,state.gather)));
          copies[i].style.opacity=current?String((state.active===0?1:range(state.local,.015,.14))*(1-range(state.local,.85,1))): '0';
          if(current&&state.active===4)copies[i].style.opacity=String(range(state.local,.015,.14));
        });
        bar.style.transform=`scaleX(${clamp(raw/panels.length)})`;
      }
      if(state.active!==active) {
        active=state.active;
        stage.dataset.chapter=String(active);
        panels.forEach((p,i)=>{p.inert=i!==active;p.setAttribute('aria-hidden',String(i!==active));});
        buttons.forEach((b,i)=>i===active?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
      }
    }
    const visible=point.y+point.size>0&&point.y-point.size<innerHeight&&(enabled||heroBottom>scrollY);
    mount.style.visibility=visible?'visible':'hidden';
    // The dot is the material of the story, not an unexplained navigation button.
    if(visible) {
      mount.style.transform=`translate3d(${point.x-180}px,${point.y-180}px,0) scale(${point.size/(shapeRatio*360)})`;
      fallback.style.transform=`rotate(${-pose.z}rad)`;
      fallback.style.opacity=enabled&&state.active<4?String(1-range(state.build,.14,.48)):'1';
      const poseKey=Object.values(pose).map(n=>n.toFixed(4)).join(',');
      if(scene&&poseKey!==lastPose&&scene.render(pose,time,!settling))lastPose=poseKey;
    }
    root.classList.add('object-active');
    if(settling)invalidate();
  }
  function invalidate(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
  buttons.forEach(b=>b.addEventListener('click',event=>{
    measure();
    const index=Number(b.dataset.storyTo);snapNext=event.detail===0;
    scrollTo({top:storyTop+travel*(index+(index===4?.74:.66))/panels.length,behavior:reduced.matches||event.detail===0?'instant':'smooth'});
  }));
  reduced.addEventListener('change',configure);
  addEventListener('scroll',invalidate,{passive:true});
  addEventListener('resize',()=>{
    if(innerWidth!==previousWidth||Math.abs(innerHeight-previousHeight)>100){previousWidth=innerWidth;previousHeight=innerHeight;measure();}
    else invalidate();
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)invalidate();});
  document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(hero);
  configure();
  const load=async()=>{
    try {
      const url=new URL('brand-scene.js',import.meta.url);url.search=new URL(import.meta.url).search;
      const {createBrandScene}=await import(url.href);
      scene=createBrandScene(mount);scene.resize(canvasSpan);lastPose='';invalidate();
    } catch {mount.dataset.rendering='fallback';}
  };
  const observer=new IntersectionObserver(entries=>{
    if(!entries.some(e=>e.isIntersecting))return;
    observer.disconnect();
    if('requestIdleCallback' in window)requestIdleCallback(load,{timeout:900});else setTimeout(load,100);
  },{rootMargin:'200px'});
  observer.observe(hero);observer.observe(story);
}
