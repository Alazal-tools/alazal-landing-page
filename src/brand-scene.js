import {
  WebGLRenderer, Scene, PerspectiveCamera, OrthographicCamera, PMREMGenerator,
  HemisphereLight, DirectionalLight, Shape, ExtrudeGeometry, MeshPhysicalMaterial,
  MeshStandardMaterial, MeshBasicMaterial, Mesh, Group, SRGBColorSpace,
  NeutralToneMapping, BoxGeometry, PlaneGeometry, InstancedMesh, Object3D,
  DynamicDrawUsage, TextureLoader, CanvasTexture, DoubleSide,
} from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
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
  const pmrem=new PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);
  scene.environment=environment.texture;room.dispose();pmrem.dispose();
  scene.add(new HemisphereLight(0xe9fff7,0x100051,1.5));
  const key=new DirectionalLight(0xffffff,3.6),rim=new DirectionalLight(0x06ffac,2);
  key.position.set(-3,5,6);rim.position.set(4,1,-2);scene.add(key,rim);
  const resources=new Set(),textures=[];
  const keep=value=>(resources.add(value),value);
  const material=(color,extra={})=>keep(new MeshStandardMaterial({color,roughness:.32,metalness:.18,...extra}));
  const teal=keep(new MeshPhysicalMaterial({color:0x06ffac,roughness:.23,metalness:.22,clearcoat:1,clearcoatRoughness:.14}));
  const edge=material(0x00956b,{roughness:.22,metalness:.32});
  const navy=material(0x221268),dark=material(0x100051),mint=material(0xcbf5e7);
  const ink=material(0x09002e),paper=material(0xb6d4ca,{roughness:.72,metalness:0}),glass=material(0x007d65,{roughness:.17,metalness:.6});
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
  const bodyTexture=new CanvasTexture(logoCanvas);bodyTexture.colorSpace=SRGBColorSpace;textures.push(bodyTexture);
  fetch('public/brand/logo-body-white.svg').then(response=>response.text()).then(source=>{
    if(disposed)return;
    const svg=new DOMParser().parseFromString(source,'image/svg+xml');
    const ctx=logoCanvas.getContext('2d');ctx.scale(512/2980,526/3064);ctx.fillStyle='#fff';
    svg.querySelectorAll('path').forEach(path=>ctx.fill(new Path2D(path.getAttribute('d'))));
    bodyTexture.needsUpdate=true;draw();
  }).catch(()=>{});
  const libraryTexture=texture('public/images/library.webp');
  const platformTexture=texture('public/scenes/منصة الأزل/Home-Guest.webp');
  // Crop at the top; the actual screen plane is exactly 9:16.
  platformTexture.repeat.y=.8;platformTexture.offset.y=.2;

  // 2010: a hardback with page block, spine, hinged cover and turning leaves.
  const book=new Group();models.push(book);world.add(book);
  const bookBase=new Group();book.add(bookBase);
  block(bookBase,2.32,2.94,.12,0,0,-.22,dark);block(bookBase,2.1,2.72,.3,.02,0,-.02,paper);
  for(let i=0;i<13;i++)block(bookBase,2.09,.013,.006,.02,1.28-i*.21,.135,mint);
  block(bookBase,.1,2.94,.44,-1.13,0,-.04,teal);textured(bookBase,libraryTexture,1.9,2.53,.03,0,.145);assembly(0,bookBase);
  const cover=new Group();cover.position.x=-1.15;book.add(cover);
  block(cover,2.32,2.94,.12,1.15,0,.25,navy);block(cover,.035,2.7,.018,.1,0,.321,teal);
  textured(cover,bodyTexture,1.28,1.316,1.15,-.06,.316);textured(cover,label('مكتبة ودار الأزل'),1.65,.412,1.15,-1.03,.32);
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
  block(roomBase,2.94,1.34,.12,.2,.04,-1.33,ink);textured(roomBase,bodyTexture,.72,.74,.2,-.16,-1.26);
  for(const x of [-1.96,1.96])block(roomBase,.025,2.15,.02,x,-.08,-1.425,teal);
  assembly(1,roomBase);
  const seatLights=[];
  for(let row=0;row<3;row++) {
    const riser=new Group();hall.add(riser);const z=-.36+row*.7,floor=-1.11+row*.13;
    block(riser,3.85,.12+row*.13,.67,0,floor-.12,z,navy);
    for(let col=0;col<4;col++) {
      const x=(col-1.5)*.91;block(riser,.66,.065,.36,x,floor+.6,z-.1,mint);
      for(const side of [-1,1])block(riser,.04,.56,.04,x+side*.25,floor+.28,z-.11,glass);
      block(riser,.46,.075,.35,x,floor+.27,z+.26,dark);block(riser,.46,.38,.075,x,floor+.43,z+.44,navy);
      const light=block(riser,.44,.025,.018,x,floor+.61,z+.486,teal);seatLights.push({light,row,col});
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

  // The actual interface lives on a 9:16 plane inside a volumetric device.
  const phone=new Group();models.push(phone);world.add(phone);
  const phoneBody=new Group();phone.add(phoneBody);
  const outline=new Shape(),w=2.22,h=3.9,r=.2;
  outline.moveTo(-w/2+r,-h/2);outline.lineTo(w/2-r,-h/2);outline.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
  outline.lineTo(w/2,h/2-r);outline.quadraticCurveTo(w/2,h/2,w/2-r,h/2);outline.lineTo(-w/2+r,h/2);
  outline.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);outline.lineTo(-w/2,-h/2+r);outline.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
  const phoneGeometry=keep(new ExtrudeGeometry(outline,{depth:.19,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.06,bevelThickness:.035,curveSegments:12}));phoneGeometry.center();
  phoneBody.add(new Mesh(phoneGeometry,[ink,teal]));
  const screen=textured(phoneBody,platformTexture,2.07,3.68,0,0,.14);
  block(phoneBody,.06,.44,.13,1.17,.7,0,glass);block(phoneBody,.42,.06,.01,0,1.92,.136,glass);assembly(3,phoneBody);

  const batches=batchStaticBoxes(world,cube,new Set(seatLights.map(({light})=>light)));

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
    return edge===0?[-1.11+along*2.22,1.95,.1]:edge===1?[1.11,1.95-along*3.9,.1]:edge===2?[1.11-along*2.22,-1.95,.1]:[-1.11,-1.95+along*3.9,.1];
  };
  // Fixed destinations and trigonometry are prepared once, not allocated for
  // every fragment on every frame of a transition.
  const targets=Array.from({length:4},(_,chapter)=>Array.from({length:count},(_,i)=>destination(chapter,i)));
  let lastPose={x:0,y:0,z:0,chapter:-1,build:0},ticking=0,active=false,lost=false,disposed=false,previous=0;
  let renderedChapter=-2,renderedConstruction=-1,cameraSpread=-1;
  const ready=()=>{mount.classList.add('is-ready');document.documentElement.classList.add('webgl-story');};
  function draw(time=performance.now()) {
    if(lost||disposed)return;
    const p=lastPose,b=clamp(p.build||0),chapter=p.chapter,physical=chapter>=0&&chapter<=4&&(b>.0001||chapter>0);
    const phase=fragmentState(chapter,b,p.exit||0),c=phase.construction;
    const visibleChapter=physical?chapter:-1,changedChapter=renderedChapter!==visibleChapter;
    if(changedChapter){models.forEach((model,i)=>model.visible=physical&&chapter===i);renderedChapter=visibleChapter;}
    world.rotation.set(0,0,0);world.position.set(0,0,0);dot.position.set(0,0,0);dot.scale.setScalar(1);dot.rotation.set(p.x||0,p.y||0,p.z||0);fragments.visible=false;
    dotFace.opacity=dotEdge.opacity=1;dot.visible=true;
    if(physical) {
      const t=time*.001,expand=phase.orientation,drift=active?Math.sin(t*.30)*.06:0;
      if(chapter===0)world.position.x=range(c,.45,1)*.85;
      world.rotation.set(mix(0,chapter===1?.36:chapter===2?.28:.13,expand),mix(0,chapter===0?-.36:chapter===1?-.46:chapter===2?-.38:-.23,expand)+drift*expand,0);
      if(chapter===3)world.rotation.y+=Math.sin(t*.44)*.035*expand;
      if(cameraSpread!==phase.camera){cameraSpread=phase.camera;camera.fov=mix(29.54,34,phase.camera);camera.position.z=mix(7.5,9.5,phase.camera);camera.updateProjectionMatrix();}
      if(changedChapter||renderedConstruction!==c)for(const part of parts[chapter]||[]) {
        const amount=range(c,.24+part.delay,.70+part.delay);part.node.visible=amount>.001;part.node.position.copy(part.position);
        part.node.position.y+=(1-amount)*(part.delay%.2>.08?-2.5:2.5);part.node.position.z-=(1-amount)*2;
        part.node.rotation.copy(part.rotation);part.node.rotation.y+=(1-amount)*.75;part.node.scale.setScalar(Math.max(.001,amount));
      }
      renderedConstruction=c;
      let x=0,y=0,z=0,size=1,ry=0;
      if(chapter===0) {
        const opening=range(c,.55,1)*(1.85+(active?Math.sin(t*.48)*.045:0));
        cover.visible=c>.24;cover.scale.setScalar(Math.max(.001,range(c,.24,.64)));cover.rotation.y=-opening;
        leaves.forEach((leaf,i)=>{const turn=range(c,.63+i*.038,.85+i*.03);leaf.visible=c>.6;leaf.rotation.y=-turn*(1.5-i*.19)+(active?Math.sin(t*.68+i*.8)*.045*turn:0);});
        const localX=1.24,localZ=.355;
        x=-1.15+localX*Math.cos(opening)-localZ*Math.sin(opening);z=localX*Math.sin(opening)+localZ*Math.cos(opening);y=.615;size=.145;ry=-opening;
      } else if(chapter===1) {
        x=.25;y=.22;z=-1.21;size=.083;
        seatLights.forEach(({light,row,col})=>{light.visible=!active||Math.sin(t*1.2-row*.65-col*.13)>-.6;});
      } else if(chapter===2) {y=-.25;z=.2;size=.33;ry=active?t*.18:0;}
      else if(chapter===3){y=2.42;z=.03;size=.18;ry=active?Math.sin(t*.4)*.24:0;phone.rotation.y=(1-range(c,.5,1))*1.5;screen.visible=c>.6;}
      const attach=chapter===4?0:range(b,.08,.8);dot.position.set(x*attach,y*attach,z*attach);dot.scale.setScalar(mix(1,size,attach));
      dot.rotation.set(0,ry*attach+(1-attach)*expand*4.4,0);
      dotFace.opacity=dotEdge.opacity=phase.solid;
      dot.visible=dotFace.opacity>.001;
      const scatter=phase.spread,assemble=phase.assembly,shardScale=phase.fragments;
      fragments.visible=shardScale>.001;
      if(fragments.visible) {
        // The cloud's orientation is time-based and identical on both sides of
        // every boundary, including reverse scrolling and the final gathering.
        const spin=t*.065,cos=Math.cos(spin),sin=Math.sin(spin),target=targets[Math.min(chapter,3)];
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
  function loop(time) {
    ticking=0;if(!active||lost||disposed||document.hidden)return;
    if(time-previous>=32){previous=time;draw(time);}ticking=requestAnimationFrame(loop);
  }
  function setActive(value) {
    active=Boolean(value)&&!document.hidden;
    if(active&&!ticking&&!lost)ticking=requestAnimationFrame(loop);
    if(!active&&ticking){cancelAnimationFrame(ticking);ticking=0;}
  }
  function render(pose){lastPose=pose;if(!active)draw();}
  const onLost=event=>{event.preventDefault();lost=true;setActive(false);mount.classList.remove('is-ready');document.documentElement.classList.remove('webgl-story');};
  const onRestored=()=>{lost=false;draw();ready();};
  renderer.domElement.addEventListener('webglcontextlost',onLost);renderer.domElement.addEventListener('webglcontextrestored',onRestored);
  mount.appendChild(renderer.domElement);draw();ready();
  return {render,setActive,dispose(){
    setActive(false);disposed=true;renderer.domElement.removeEventListener('webglcontextlost',onLost);renderer.domElement.removeEventListener('webglcontextrestored',onRestored);
    batches.forEach(batch=>batch.dispose());resources.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());fragments.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();
    mount.classList.remove('is-ready');document.documentElement.classList.remove('webgl-story');
  }};
}
