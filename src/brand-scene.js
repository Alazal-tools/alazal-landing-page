import {
  WebGLRenderer, Scene, PerspectiveCamera, OrthographicCamera,
  HemisphereLight, DirectionalLight, Shape, ExtrudeGeometry,
  MeshPhongMaterial, MeshBasicMaterial, Mesh, Group, SRGBColorSpace,
  NeutralToneMapping, BoxGeometry, PlaneGeometry, InstancedMesh, Object3D,
  DynamicDrawUsage, TextureLoader, CanvasTexture, DoubleSide,
} from 'three';
import {clamp, range, mix, fragmentState} from './story-motion.js';
import {batchStaticBoxes} from './scene-performance.js';

// The original dot is never stretched: rigid rotation and uniform scale only.
export function createBrandScene(mount) {
  const renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setSize(480,480,false);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=SRGBColorSpace;renderer.toneMapping=NeutralToneMapping;renderer.toneMappingExposure=1.04;
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new Scene(), logoCamera=new OrthographicCamera(-1.9,1.9,1.9,-1.9,.1,40);
  logoCamera.position.z=8;
  const camera=new PerspectiveCamera(34,1,.1,40);camera.position.z=9.5;
  scene.add(new HemisphereLight(0xe9fff7,0x100051,1.2));
  const key=new DirectionalLight(0xffffff,2.2),rim=new DirectionalLight(0x06ffac,1.2);
  key.position.set(-3,5,6);rim.position.set(4,1,-2);scene.add(key,rim);
  const resources=new Set(),textures=[];
  const keep=value=>(resources.add(value),value);
  // Direct lighting preserves the beveled forms without environment-map
  // generation or layered physical-material shaders on a small mobile canvas.
  const material=(color,extra={})=>keep(new MeshPhongMaterial({color,shininess:35,specular:0x263d38,...extra}));
  const teal=material(0x06ffac,{shininess:75,specular:0x8fdbc2});
  const edge=material(0x00956b,{shininess:60});
  const navy=material(0x221268),dark=material(0x100051),mint=material(0xcbf5e7);
  const ink=material(0x09002e),paper=material(0xb6d4ca,{shininess:5}),glass=material(0x007d65,{shininess:70});
  const shape=new Shape();
  shape.moveTo(-1,-1);shape.lineTo(.2,-1);shape.bezierCurveTo(.642,-1,1,-.642,1,-.2);
  shape.lineTo(1,1);shape.lineTo(-.2,1);shape.bezierCurveTo(-.642,1,-1,.642,-1,.2);shape.closePath();
  const dotGeometry=keep(new ExtrudeGeometry(shape,{depth:.44,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.075,bevelThickness:.075,curveSegments:32}));dotGeometry.center();
  const fragmentGeometry=keep(new ExtrudeGeometry(shape,{depth:.44,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.075,bevelThickness:.075,curveSegments:5}));fragmentGeometry.center();
  const cube=keep(new BoxGeometry(1,1,1)),plane=keep(new PlaneGeometry(1,1));
  const dotFace=keep(teal.clone()),dotEdge=keep(edge.clone());
  dotFace.transparent=dotEdge.transparent=true;
  const world=new Group(),dot=new Mesh(dotGeometry,[dotFace,dotEdge]);scene.add(world);world.add(dot);
  const parts=[[],[],[],[]],models=[];
  function block(parent,w,h,d,x,y,z,mat=navy) {
    const mesh=new Mesh(cube,mat);mesh.scale.set(w,h,d);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  function assembly(index,parent,delay=0) {
    parts[index].push({node:parent,position:parent.position.clone(),rotation:parent.rotation.clone(),delay});return parent;
  }
  function textured(parent,texture,w,h,x,y,z) {
    const mat=keep(new MeshBasicMaterial({map:texture,transparent:true,side:DoubleSide,toneMapped:false}));
    const mesh=new Mesh(plane,mat);mesh.scale.set(w,h,1);mesh.position.set(x,y,z);
    mesh.updateMatrix();mesh.matrixAutoUpdate=false;parent.add(mesh);return mesh;
  }
  const loader=new TextureLoader();
  function texture(url) {
    const value=loader.load(url,()=>draw());value.colorSpace=SRGBColorSpace;
    value.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(value);return value;
  }
  function label(text,small=false) {
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,768,192);ctx.fillStyle='#cbf5e7';ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction='rtl';
    ctx.font=`500 ${small?66:82}px DIN, sans-serif`;ctx.fillText(text,384,100);
    const value=new CanvasTexture(canvas);value.colorSpace=SRGBColorSpace;textures.push(value);return value;
  }
  // Rasterize the supplied vector path explicitly: direct SVG → WebGL uploads
  // are inconsistent between browsers. This preserves the original silhouette.
  const logoCanvas=document.createElement('canvas');logoCanvas.width=512;logoCanvas.height=526;
  const logoTexture=new CanvasTexture(logoCanvas);logoTexture.colorSpace=SRGBColorSpace;textures.push(logoTexture);
  // Use the complete supplied mark on surfaces. Its dot shares the exact same
  // parent/texture as the letters, including while a cover opens or assembles.
  fetch('public/brand/logo-white.svg').then(response=>response.text()).then(source=>{
    if(disposed)return;
    const svg=new DOMParser().parseFromString(source,'image/svg+xml');
    const ctx=logoCanvas.getContext('2d');ctx.scale(512/2980,526/3064);
    svg.querySelectorAll('path').forEach(path=>{ctx.fillStyle=path.getAttribute('fill')||'#fff';ctx.fill(new Path2D(path.getAttribute('d')));});
    logoTexture.needsUpdate=true;draw();
  }).catch(()=>{});
  const libraryTexture=texture('public/images/library.webp');

  // 2010: a hardback with page block, spine, hinged cover and turning leaves.
  const book=new Group();models.push(book);world.add(book);
  const bookBase=new Group();book.add(bookBase);
  block(bookBase,2.32,2.94,.12,0,0,-.22,dark);block(bookBase,2.1,2.72,.3,.02,0,-.02,paper);
  for(let i=0;i<13;i++)block(bookBase,2.09,.013,.006,.02,1.28-i*.21,.135,mint);
  block(bookBase,.1,2.94,.44,-1.13,0,-.04,teal);textured(bookBase,libraryTexture,1.9,2.53,.03,0,.145);assembly(0,bookBase);
  const cover=new Group();cover.position.x=-1.15;book.add(cover);
  block(cover,2.32,2.94,.12,1.15,0,.25,navy);block(cover,.035,2.7,.018,.1,0,.321,teal);
  textured(cover,logoTexture,1.28,1.316,1.15,-.06,.316);textured(cover,label('مكتبة ودار الأزل'),1.65,.412,1.15,-1.03,.32);
  const leaves=[];
  for(let i=0;i<5;i++) {
    const leaf=new Group();leaf.position.set(-1.05,0,.15+i*.012);book.add(leaf);
    block(leaf,2.06,2.64,.012,1.03,0,0,paper);
    for(let l=0;l<7;l++)block(leaf,1.25-l%3*.15,.016,.008,1.06,.8-l*.22,.009,glass);
    leaves.push(leaf);
  }

  // 2012: a tiered lecture hall, assembled row by row from the fragments.
  const hall=new Group();models.push(hall);world.add(hall);
  const roomBase=new Group();hall.add(roomBase);
  block(roomBase,4.25,.16,3.12,0,-1.23,0,navy);block(roomBase,4.25,2.42,.15,0,-.06,-1.52,dark);
  block(roomBase,.09,2.42,1.45,-2.08,-.06,-.84,navy);block(roomBase,3.08,1.48,.10,.2,.04,-1.4,teal);
  block(roomBase,2.94,1.34,.12,.2,.04,-1.33,ink);textured(roomBase,logoTexture,.72,.74,.2,-.16,-1.26);
  for(const x of [-1.96,1.96])block(roomBase,.025,2.15,.02,x,-.08,-1.425,teal);
  assembly(1,roomBase);
  const seatLights=[];
  for(let row=0;row<3;row++) {
    const riser=new Group();hall.add(riser);const z=-.36+row*.7,floor=-1.11+row*.13;
    const lights=new Group();riser.add(lights);seatLights.push({light:lights,row});
    block(riser,3.85,.12+row*.13,.67,0,floor-.12,z,navy);
    for(let col=0;col<4;col++) {
      const x=(col-1.5)*.91;block(riser,.66,.065,.36,x,floor+.6,z-.1,mint);
      for(const side of [-1,1])block(riser,.04,.56,.04,x+side*.25,floor+.28,z-.11,glass);
      block(riser,.46,.075,.35,x,floor+.27,z+.26,dark);block(riser,.46,.38,.075,x,floor+.43,z+.44,navy);
      block(lights,.44,.025,.018,x,floor+.61,z+.486,teal);
      block(riser,.045,.25,.045,x,floor+.1,z+.24,glass);
    }
    assembly(1,riser,.07+row*.1);
  }

  // Two symbolic school wings, not a substitute for the geographic map.
  const campus=new Group();models.push(campus);world.add(campus);
  const courtyard=new Group();campus.add(courtyard);
  block(courtyard,4.7,.18,3.1,0,-1.36,0,navy);block(courtyard,.92,.018,2.4,0,-1.257,.1,glass);
  for(let z=-.8;z<1.45;z+=.28)block(courtyard,.66,.02,.035,0,-1.24,z,teal);assembly(2,courtyard);
  for(const [side,date,name] of [[-1,'2020','ثانوية البنات'],[1,'2024','ثانوية البنين']]) {
    const wing=new Group();wing.position.x=side*1.32;campus.add(wing);
    block(wing,1.62,2.04,1.45,0,-.29,-.33,dark);
    for(let level=0;level<3;level++) {
      block(wing,1.78,.11,1.6,0,-1.27+level*.73,-.33,navy);
      for(let col=0;col<3;col++) {const x=(col-1)*.42;block(wing,.29,.38,.045,x,-.84+level*.64,.416,glass);block(wing,.29,.025,.06,x,-1.01+level*.64,.448,teal);}
    }
    block(wing,1.79,.12,1.63,0,.84,-.33,teal);
    textured(wing,label(name,true),1.5,.375,0,1.14,.16);textured(wing,label(date),.72,.18,0,.52,.444);assembly(2,wing,side<0?.06:.21);
  }
  const monument=new Group();monument.position.set(0,-.32,.2);campus.add(monument);
  block(monument,.7,.16,.7,0,-.92,0,teal);block(monument,.12,.75,.12,0,-.5,0,glass);assembly(2,monument,.14);
  const monumentMark=new Mesh(dotGeometry,[dotFace,dotEdge]);
  monumentMark.position.y=.07;monumentMark.scale.setScalar(.33);monument.add(monumentMark);

  // The platform uses the original, larger DOM device. Only the arriving and
  // departing fragments are WebGL; there is no second phone or screen texture.

  const batches=batchStaticBoxes(world,cube);

  // Lit 3D fragments, one instanced draw call, with real depth and rotation.
  const count=innerWidth<600?120:180,fragments=new InstancedMesh(fragmentGeometry,teal,count);
  fragments.instanceMatrix.setUsage(DynamicDrawUsage);fragments.frustumCulled=false;world.add(fragments);
  const dummy=new Object3D(),seeds=[],bursts=[];
  for(let i=0;i<count;i++) {
    const angle=i*2.3999632297,radius=.25+Math.sqrt((i+.5)/count)*2.6;
    seeds.push([Math.sin(i*7.31)*.9,Math.cos(i*3.13)*.9,Math.sin(i*1.37)*.21]);
    bursts.push([Math.cos(angle)*radius,Math.sin(angle)*radius*.85,Math.sin(i*1.71)*1.6]);
  }
  const destination=(chapter,i)=>{
    const t=i/count;
    if(chapter===0)return [(t%.5)*4.2-1.05,Math.sin(i*2.4)*1.3,.22];
    if(chapter===1)return [((i%4)-1.5)*.91,-.35+Math.floor(i/4)%3*.13,-.46+(Math.floor(i/4)%3)*.7];
    if(chapter===2)return [(i%2?1:-1)*1.32+Math.sin(i*2.1)*.7,Math.cos(i*1.1)*.98-.2,.46];
    const edge=i%4,along=Math.floor(i/4)/Math.ceil(count/4);
    // Project to the edges of the flat 9:16 device (88% of the square stage).
    const h=2*Math.tan(34*Math.PI/360)*9.5*.88,w=h*9/16;
    return edge===0?[-w/2+along*w,h/2,0]:edge===1?[w/2,h/2-along*h,0]:edge===2?[w/2-along*w,-h/2,0]:[-w/2,-h/2+along*h,0];
  };
  // Fixed destinations and trigonometry are prepared once, not allocated for
  // every fragment on every frame of a transition.
  const targets=Array.from({length:4},(_,chapter)=>Array.from({length:count},(_,i)=>destination(chapter,i)));
  let lastPose={x:0,y:0,z:0,chapter:-1,build:0},lost=false,disposed=false;
  let renderedChapter=-2,renderedConstruction=-1,cameraSpread=-1,lastRender=-Infinity,renderSize=480;
  const ready=()=>{mount.classList.add('is-ready');document.documentElement.classList.add('webgl-story');};
  function draw() {
    if(lost||disposed||document.hidden)return;
    const p=lastPose,b=clamp(p.build||0),chapter=p.chapter,physical=chapter>=0&&chapter<=4&&(b>.0001||chapter>0);
    const phase=fragmentState(chapter,b,p.exit||0),c=phase.construction;
    const visibleChapter=physical?chapter:-1,changedChapter=renderedChapter!==visibleChapter;
    if(changedChapter){models.forEach((model,i)=>model.visible=physical&&chapter===i);renderedChapter=visibleChapter;}
    world.rotation.set(0,0,0);world.position.set(0,0,0);dot.position.set(0,0,0);dot.scale.setScalar(1);dot.rotation.set(p.x||0,p.y||0,p.z||0);fragments.visible=false;
    dotFace.opacity=dotEdge.opacity=1;dot.visible=true;
    if(physical) {
      const expand=phase.orientation;
      if(chapter===0)world.position.x=range(c,.45,1)*.85;
      world.rotation.set(mix(0,chapter===1?.36:chapter===2?.28:chapter===0?.13:0,expand),mix(0,chapter===0?-.36:chapter===1?-.46:chapter===2?-.38:0,expand),0);
      if(cameraSpread!==phase.camera){cameraSpread=phase.camera;camera.fov=mix(29.54,34,phase.camera);camera.position.z=mix(7.5,9.5,phase.camera);camera.updateProjectionMatrix();}
      if(changedChapter||renderedConstruction!==c)for(const part of parts[chapter]||[]) {
        const amount=range(c,.24+part.delay,.70+part.delay);part.node.visible=amount>.001;part.node.position.copy(part.position);
        part.node.position.y+=(1-amount)*(part.delay%.2>.08?-2.5:2.5);part.node.position.z-=(1-amount)*2;
        part.node.rotation.copy(part.rotation);part.node.rotation.y+=(1-amount)*.75;part.node.scale.setScalar(Math.max(.001,amount));
      }
      renderedConstruction=c;
      if(chapter===0) {
        const opening=range(c,.55,1)*1.85;
        cover.visible=c>.24;cover.scale.setScalar(Math.max(.001,range(c,.24,.64)));cover.rotation.y=-opening;
        leaves.forEach((leaf,i)=>{const turn=range(c,.63+i*.038,.85+i*.03);leaf.visible=c>.6;leaf.rotation.y=-turn*(1.5-i*.19);});
      } else if(chapter===1) {
        seatLights.forEach(({light,row})=>{light.visible=c>.35+row*.12;});
      } else if(chapter===2)monumentMark.rotation.y=range(c,.45,1)*.18;
      dot.rotation.set(0,chapter===0?(1-range(b,.08,.8))*expand*4.4:0,0);
      const solid=chapter===0?1-range(b,.1,.26):phase.solid;
      dotFace.opacity=dotEdge.opacity=solid;
      dot.visible=solid>.001&&(chapter===0||chapter===4);
      const scatter=phase.spread,assemble=phase.assembly,shardScale=phase.fragments;
      fragments.visible=shardScale>.001;
      if(fragments.visible) {
        // Scroll-driven rotation reaches the same pose at both sides of every
        // boundary, and retraces that pose when scrolling backwards.
        const spin=assemble*.22+(1-scatter)*.18,cos=Math.cos(spin),sin=Math.sin(spin),target=targets[Math.min(chapter,3)];
        for(let i=0;i<count;i++) {
          const from=seeds[i],burst=bursts[i],to=target[i];
          const bx=burst[0]*cos-burst[2]*sin,bz=burst[0]*sin+burst[2]*cos;
          dummy.position.set(mix(mix(from[0],bx,scatter),to[0],assemble),mix(mix(from[1],burst[1],scatter),to[1],assemble),mix(mix(from[2],bz,scatter),to[2],assemble));
          dummy.rotation.set(i*.73+spin,i*.39+spin*2,i*.11);dummy.scale.setScalar((.023+(i%5)*.006)*shardScale);dummy.updateMatrix();fragments.setMatrixAt(i,dummy.matrix);
        }
        fragments.instanceMatrix.needsUpdate=true;
      }
      renderer.render(scene,camera);
    } else renderer.render(scene,logoCamera);
  }
  // The story controller owns the only animation clock. A held scene schedules
  // no frames; textures and context restoration may redraw once when ready.
  function render(pose,time,settled){
    lastPose=pose;
    // Keep the existing 30 fps GPU budget, in sync with the controller rather
    // than running a second clock. Always draw the final pose of a scroll.
    if(!settled&&time-lastRender<32)return false;
    lastRender=time;draw();return true;
  }
  function resize(span){
    const size=Math.round(clamp(span,320,480));
    if(size===renderSize)return;
    renderSize=size;renderer.setSize(size,size,false);draw();
  }
  const onLost=event=>{event.preventDefault();lost=true;mount.classList.remove('is-ready');document.documentElement.classList.remove('webgl-story');};
  const onRestored=()=>{lost=false;draw();ready();};
  renderer.domElement.addEventListener('webglcontextlost',onLost);renderer.domElement.addEventListener('webglcontextrestored',onRestored);
  mount.appendChild(renderer.domElement);draw();ready();
  return {render,resize,dispose(){
    disposed=true;renderer.domElement.removeEventListener('webglcontextlost',onLost);renderer.domElement.removeEventListener('webglcontextrestored',onRestored);
    batches.forEach(batch=>batch.dispose());resources.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());fragments.dispose();renderer.dispose();renderer.domElement.remove();
    mount.classList.remove('is-ready');document.documentElement.classList.remove('webgl-story');
  }};
}
