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
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

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
  const solid = new Mesh(geometry, [face, edge]);
  object.add(solid);
  // Original, deterministic particle reassembly at the digital story stop.
  // The shader keeps the same two rounded corners as the original dot.
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
  const particlesMaterial = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      amount: { value: 0 },
      density: { value: Math.min(devicePixelRatio, 1.5) },
    },
    vertexShader: `uniform float amount; uniform float density; varying float alpha;
      void main() {
        vec3 p = position;
        float angle = p.x * 5.7 + p.y * 9.3;
        p.xy += vec2(sin(angle), cos(angle * 1.3)) * amount * .38;
        p.z += sin(angle * 2.1) * amount * .6;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (4.0 + amount * 2.0) * density;
        alpha = min(1.0, amount * 2.0);
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
    const scatter = pose.scatter || 0;
    face.opacity = edge.opacity = 1 - scatter;
    particles.visible = scatter > 0.005;
    particlesMaterial.uniforms.amount.value = scatter;
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
