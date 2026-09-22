import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  PMREMGenerator,
  HemisphereLight,
  DirectionalLight,
  Shape,
  ExtrudeGeometry,
  MeshPhysicalMaterial,
  Mesh,
  Group,
  SRGBColorSpace,
  NeutralToneMapping,
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  Points,
  BoxGeometry,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {range, mix, digitalState} from './story-motion.js';

// This is the original Alazal dot extruded, not a substitute symbol.
export function createBrandScene(mount) {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setSize(360, 360);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new Scene();
  const camera = new OrthographicCamera(-1.9, 1.9, 1.9, -1.9, 0.1, 30);
  camera.position.set(0, 0, 8);
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new HemisphereLight(0xffffff, 0x100051, 0.65));
  const key = new DirectionalLight(0xffffff, 1.8);
  key.position.set(-3, 4, 5);
  const rim = new DirectionalLight(0x8effd9, 1.2);
  rim.position.set(4, 0, 2);
  scene.add(key, rim);
  const shape = new Shape();
  shape.moveTo(-1, -1);
  shape.lineTo(0.2, -1);
  shape.bezierCurveTo(0.642, -1, 1, -0.642, 1, -0.2);
  shape.lineTo(1, 1);
  shape.lineTo(-0.2, 1);
  shape.bezierCurveTo(-0.642, 1, -1, 0.642, -1, 0.2);
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, {
    depth: 0.44,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.075,
    bevelThickness: 0.075,
    curveSegments: 32,
  });
  geometry.center();
  const face = new MeshPhysicalMaterial({
    color: 0x06ffac,
    metalness: 0.12,
    roughness: 0.27,
    clearcoat: 0.6,
    clearcoatRoughness: 0.18,
    envMapIntensity: 0.5,
    transparent: true,
  });
  const edge = new MeshPhysicalMaterial({
    color: 0x00956b,
    metalness: 0.3,
    roughness: 0.25,
    clearcoat: 0.8,
    envMapIntensity: 0.5,
    transparent: true,
  });
  const object = new Group();
  const hinge = new Group();
  const solid = new Mesh(geometry, [face, edge]);
  hinge.add(solid);
  object.add(hinge);
  // The point becomes the scenery: a hinged cover, a room frame, two doors.
  const structureFace = face.clone(), structureEdge = edge.clone();
  const structureMaterials = [structureFace, structureEdge];
  const frame = new Group(), doors = new Group();
  const barGeometry = new BoxGeometry(1,1,1);
  for (const [x,y,w,h] of [[0,1.05,3.12,.12],[0,-1.05,3.12,.12],[-1.5,0,.12,2.1],[1.5,0,.12,2.1]]) {
    const bar = new Mesh(barGeometry,structureFace);
    bar.position.set(x,y,0); bar.scale.set(w,h,.17); frame.add(bar);
  }
  // A recessed back wall and four joining edges turn the frame into a room.
  for (const [x,y,w,h] of [[0,.91,2.72,.06],[0,-.91,2.72,.06],[-1.33,0,.06,1.82],[1.33,0,.06,1.82]]) {
    const bar=new Mesh(barGeometry,structureEdge);
    bar.position.set(x,y,-.7);bar.scale.set(w,h,.08);frame.add(bar);
  }
  for(const x of [-1,1])for(const y of [-1,1]) {
    const beam=new Mesh(barGeometry,structureEdge);
    beam.position.set(x*1.415,y*.98,-.35);
    beam.scale.set(.06,.06,Math.hypot(.17,.14,.7));
    beam.lookAt(x*1.33,y*.91,-.7);frame.add(beam);
  }
  const gates = [-1,1].map(sign => {
    const gate = new Mesh(geometry,structureMaterials); doors.add(gate); return {gate,sign};
  });
  object.add(frame,doors);
  // One large, deterministic scatter, followed by a real 9:16 screen assembly.
  const positions = [];
  for (let x = -0.96; x <= 0.96; x += 0.1) {
    for (let y = -0.96; y <= 0.96; y += 0.1) {
      if (x < -0.2 && y > 0.2 && Math.hypot(x + 0.2, y - 0.2) > 0.8) continue;
      if (x > 0.2 && y < -0.2 && Math.hypot(x - 0.2, y + 0.2) > 0.8) continue;
      positions.push(x, y, Math.sin(x * 18 + y * 23) * 0.2);
    }
  }
  const particlesGeometry = new BufferGeometry();
  particlesGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(positions, 3),
  );
  const burst=[], screen=[];
  const count=positions.length/3, halfW=.9405, halfH=1.672;
  const perimeter=4*(halfW+halfH);
  for(let i=0;i<count;i++) {
    const angle=i*2.3999632297;
    const radius=.25+Math.sqrt((i+.5)/count)*1.35;
    burst.push(Math.cos(angle)*radius,Math.sin(angle)*radius,Math.sin(i*1.71)*.85);
    let d=i/count*perimeter;
    if(d<2*halfW) screen.push(-halfW+d,halfH,0);
    else if((d-=2*halfW)<2*halfH) screen.push(halfW,halfH-d,0);
    else if((d-=2*halfH)<2*halfW) screen.push(halfW-d,-halfH,0);
    else {d-=2*halfW;screen.push(-halfW,-halfH+d,0);}
  }
  particlesGeometry.setAttribute('burst',new Float32BufferAttribute(burst,3));
  particlesGeometry.setAttribute('screen',new Float32BufferAttribute(screen,3));
  const particlesMaterial = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      amount: { value: 0 },
      assembly: { value: 0 },
      opacity: { value: 0 },
      density: { value: Math.min(devicePixelRatio, 1.5) },
    },
    vertexShader: `uniform float amount; uniform float assembly; uniform float opacity;
      uniform float density; attribute vec3 burst; attribute vec3 screen; varying float alpha;
      void main() {
        vec3 p = mix(mix(position, burst, amount), screen, assembly);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (3.5 + amount * 1.5 - assembly) * density;
        alpha = opacity;
      }`,
    fragmentShader: `varying float alpha;
      void main() {
        vec2 uv = gl_PointCoord;
        if (uv.x < .4 && uv.y < .4 && distance(uv, vec2(.4)) > .4) discard;
        if (uv.x > .6 && uv.y > .6 && distance(uv, vec2(.6)) > .4) discard;
        gl_FragColor = vec4(.024, 1.0, .674, alpha);
      }`,
  });
  const particles = new Points(particlesGeometry, particlesMaterial);
  object.add(particles);
  scene.add(object);
  mount.appendChild(renderer.domElement);
  const onLost = (event) => {
    event.preventDefault();
    mount.classList.remove("is-ready");
  };
  const onRestored = () => {
    render(lastPose);
    mount.classList.add("is-ready");
  };
  renderer.domElement.addEventListener("webglcontextlost", onLost);
  renderer.domElement.addEventListener("webglcontextrestored", onRestored);
  let lastPose = { x: 0.3, y: -0.42, z: 0.12 };
  function render(pose = lastPose) {
    lastPose = pose;
    object.rotation.set(pose.x, pose.y, pose.z);
    const b=pose.build||0;
    hinge.position.set(0,0,0);hinge.rotation.set(0,0,0);
    solid.position.set(0,0,0);solid.scale.set(1,1,1);
    face.opacity=edge.opacity=1;
    frame.visible=doors.visible=particles.visible=false;
    structureFace.opacity=structureEdge.opacity=1;
    if(pose.chapter===0) {
      const grow=range(b,0,.30), open=range(b,.25,.94);
      solid.scale.set(mix(1,.72,grow),mix(1,1.33,grow),mix(1,.22,grow));
      hinge.position.x=-.774*grow;solid.position.x=.774*grow;
      hinge.rotation.y=-open*2.1;
    } else if(pose.chapter===1) {
      const grow=range(b,.06,.75);
      frame.visible=b>.05;frame.scale.setScalar(mix(.12,1,grow));
      structureFace.opacity=range(b,.12,.36);
      solid.scale.set(mix(1,1.45,range(b,0,.4)),mix(1,.98,grow),mix(1,.25,grow));
      face.opacity=edge.opacity=1-range(b,.12,.42);
    } else if(pose.chapter===2) {
      const split=range(b,.08,.46), open=range(b,.46,.96);
      doors.visible=b>.06;structureFace.opacity=structureEdge.opacity=range(b,.06,.28);
      face.opacity=edge.opacity=1-range(b,.06,.28);
      gates.forEach(({gate,sign})=>{
        // Open on each outside hinge, keeping the entrance itself unobstructed.
        const angle=open*1.42;
        gate.position.set(sign*(.89*split+.688*(1-Math.cos(angle))),0,Math.sin(angle)*.688);
        gate.scale.set(mix(.55,.64,split),mix(1,1.25,split),.23);
        gate.rotation.y=sign*angle;
      });
    } else if(pose.chapter===3) {
      const digital=digitalState(b);
      face.opacity=edge.opacity=digital.solid;
      particles.visible=b>.06;
      particlesMaterial.uniforms.amount.value=digital.scatter;
      particlesMaterial.uniforms.assembly.value=digital.assemble;
      particlesMaterial.uniforms.opacity.value=(1-digital.solid)*(1-digital.assemble*.62);
    }
    solid.visible=face.opacity>.001;
    renderer.render(scene, camera);
  }
  render();
  mount.classList.add("is-ready");
  return {
    render,
    dispose() {
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        onRestored,
      );
      geometry.dispose();
      barGeometry.dispose();
      structureFace.dispose();structureEdge.dispose();
      face.dispose();
      edge.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      mount.classList.remove("is-ready");
    },
  };
}
