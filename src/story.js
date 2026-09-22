import {clamp,mix,ease,pointOnScene,storyState,flightPoint} from './story-motion.js';

export function initStory(){
  const root=document.documentElement;
  const story=document.querySelector('#story'),stage=story.querySelector('.story-stage');
  const panels=[...story.querySelectorAll('.story-panel')],arts=panels.map(p=>p.querySelector('.scene-art'));
  const copies=panels.map(p=>p.querySelector('.story-copy'));
  const mount=document.querySelector('#brand-object'),fallback=mount.querySelector('.object-fallback');
  const hero=document.querySelector('#home'),heroAnchor=document.querySelector('#hero-anchor');
  const finishAnchor=document.querySelector('#chapter-anchor-4');
  const buttons=[...story.querySelectorAll('[data-story-to]')];
  const bar=story.querySelector('.story-progress > span');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const renderedShapeSize=(2.15/3.8)*360;
  // Original scene poses, with restrained turns; scatter has one narrative use.
  const rotations=[{x:.28,y:-.55,z:-.18},{x:-.25,y:.42,z:.25},{x:.42,y:-.4,z:-.3},{x:-.2,y:-.65,z:.18},{x:0,y:0,z:0}];
  let scene,frame=0,enabled=false,storyTop=0,travel=1,stageHeight=1,heroAngle=0;
  let active=-1,lastPose='',lastState='';
  let previousWidth=innerWidth,previousHeight=innerHeight;
  const box=element=>{const r=element.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,size:element.offsetWidth};};
  function measure(){
    const matrix=new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.hero-logo')).transform);
    heroAngle=-Math.atan2(matrix.b,matrix.a);
    storyTop=story.getBoundingClientRect().top+scrollY;
    stageHeight=stage.offsetHeight;
    travel=Math.max(1,story.offsetHeight-stageHeight);
    lastState='';
    invalidate();
  }
  function configure(){
    enabled=!reduced.matches;
    root.classList.toggle('motion-story',enabled);
    root.classList.toggle('reading-story',!enabled);
    panels.forEach(p=>{p.style.opacity='';p.style.visibility='';p.removeAttribute('aria-hidden');p.inert=false;p.style.setProperty('--phase','1');p.style.setProperty('--enter','0');p.style.setProperty('--exit','0');});
    copies.forEach(copy=>{copy.style.opacity='';});
    active=-1;lastState='';
    measure();
  }
  function update(now){
    frame=0;
    if(document.hidden)return;
    const raw=(scrollY-storyTop)/travel*panels.length;
    const state=storyState(raw,panels.length);
    const entering=enabled?ease((scrollY-storyTop*.12)/Math.max(1,storyTop*.88)):0;
    // Geometry first; art transforms never affect these stable outer boxes.
    const heroPoint=box(heroAnchor),finalPoint=box(finishAnchor);
    const artRects=arts.map(a=>a.getBoundingClientRect());
    const getPoint=(index,phase)=>{
      const r=artRects[index];
      if(index===4){
        const t=ease(phase/.65);
        return flightPoint({x:r.left+r.width*.8,y:r.top+r.height*.2,size:Math.min(60,r.width*.15)},finalPoint,t,20);
      }
      const p=pointOnScene(index,phase);
      return {x:r.left+p.x*r.width,y:r.top+p.y*r.height,size:Math.min(60,r.width*.15,r.height*.22)};
    };
    const first=getPoint(state.from,state.phase),second=getPoint(state.to,0);
    let point=heroPoint,pose={x:0,y:0,z:heroAngle,scatter:0};
    if(enabled){
      const destination=flightPoint(first,second,state.flight,24);
      point=flightPoint(heroPoint,destination,entering,36);
      const dock=state.from===4?ease(state.phase/.65):0;
      const freedom=entering*(1-dock);
      const from=rotations[state.from],to=rotations[state.to];
      pose={
        x:mix(from.x,to.x,state.flight)*freedom,
        y:mix(from.y,to.y,state.flight)*freedom,
        z:mix(heroAngle,mix(from.z,to.z,state.flight),entering)*(1-dock),
        scatter:state.from===2?Math.pow(Math.sin(state.flight*Math.PI),2)*.95:0,
      };
      const stateKey=[state.from,state.phase.toFixed(4),state.flight.toFixed(4),entering.toFixed(4)].join(',');
      if(stateKey!==lastState){
        lastState=stateKey;
        panels.forEach((panel,i)=>{
          const opacity=i===state.from?1-state.flight:i===state.to?state.flight:0;
          const phase=i===state.from?state.phase:i<state.from?1:0;
          panel.style.opacity=String(opacity);
          // Leave breathing room between headlines while the scenery dissolves.
          copies[i].style.opacity=String(i===state.from?clamp(1-state.flight*2.4):i===state.to?clamp((state.flight-.58)/.42):0);
          panel.style.visibility=opacity>.001?'visible':'hidden';
          panel.style.setProperty('--phase',String(ease(phase/.72)));
          panel.style.setProperty('--enter',String(i===state.from?1-entering:1-state.flight));
          panel.style.setProperty('--exit',String(i===state.from?state.flight:0));
        });
        bar.style.transform=`scaleX(${clamp(raw/panels.length)})`;
      }
      if(state.active!==active){
        active=state.active;stage.dataset.chapter=String(active);
        panels.forEach((p,i)=>{p.inert=i!==active;p.setAttribute('aria-hidden',String(i!==active));});
        buttons.forEach((b,i)=>i===active?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
      }
    }
    const visible=point.y+point.size>0&&point.y-point.size<innerHeight&&(enabled||hero.getBoundingClientRect().bottom>0);
    mount.style.visibility=visible?'visible':'hidden';
    mount.disabled=!enabled||state.from===4;
    mount.tabIndex=visible&&!mount.disabled?0:-1;
    if(visible){
      mount.style.transform=`translate3d(${point.x-180}px,${point.y-180}px,0) scale(${point.size/renderedShapeSize})`;
      fallback.style.transform=`rotate(${-pose.z}rad)`;
      const key=Object.values(pose).map(n=>n.toFixed(4)).join(',');
      if(scene&&key!==lastPose){scene.render(pose);lastPose=key;}
    }
    root.classList.add('object-active');
  }
  function invalidate(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
  // The point advances the story when selected, instead of playing a free toss.
  mount.addEventListener('click',event=>{
    if(!enabled||mount.disabled)return;
    const index=scrollY<storyTop?0:Math.min(panels.length-1,active+1);
    scrollTo({top:storyTop+travel*(index+.24)/panels.length,behavior:event.detail===0?'instant':'smooth'});
  });
  buttons.forEach(b=>b.addEventListener('click',event=>{
    const index=Number(b.dataset.storyTo);
    scrollTo({top:storyTop+travel*(index+.24)/panels.length,behavior:reduced.matches||event.detail===0?'instant':'smooth'});
  }));
  reduced.addEventListener('change',configure);
  addEventListener('scroll',invalidate,{passive:true});
  addEventListener('resize',()=>{
    if(innerWidth!==previousWidth||Math.abs(innerHeight-previousHeight)>100){previousWidth=innerWidth;previousHeight=innerHeight;measure();}
    else invalidate();
  });
  document.addEventListener('visibilitychange',invalidate);
  document.fonts.ready.then(measure);
  new ResizeObserver(measure).observe(hero);
  configure();
  const load=async()=>{
    try{
      const url=new URL('brand-scene.js',import.meta.url);url.search=new URL(import.meta.url).search;
      const {createBrandScene}=await import(url.href);
      scene=createBrandScene(mount);lastPose='';invalidate();
    }catch{mount.dataset.rendering='fallback';}
  };
  const observer=new IntersectionObserver(entries=>{
    if(!entries.some(e=>e.isIntersecting))return;
    observer.disconnect();
    if('requestIdleCallback' in window)requestIdleCallback(load,{timeout:900});else setTimeout(load,100);
  },{rootMargin:'200px'});
  observer.observe(hero);observer.observe(story);
}
