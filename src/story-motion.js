export const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const range = (value, start, end) => ease((value - start) / (end - start));

// Scene boundaries share a single cloud, so material passes from one model to
// the next without resetting to the logo between institutions.
export function storyState(progress, count = 5) {
  const p = clamp(progress, 0, count - .000001);
  const active = Math.floor(p), local = p - active;
  const grow = range(local, active===0?.04:0, .56);
  const gather = active === count - 1 ? 0 : range(local, .76, 1);
  return { active, local, build: grow, gather, progress: p / count };
}

export function fragmentState(chapter, build, exit=0) {
  const b=clamp(build), out=clamp(exit);
  if(chapter===4)return {
    spread:1-range(b,0,.78), assembly:0, fragments:1-range(b,.7,1),
    solid:range(b,.65,1), construction:0, orientation:0, camera:1-b,
  };
  const first=chapter===0;
  return {
    spread:first?Math.max(range(b,.06,.34),out):1,
    assembly:range(b,first?.36:0,.94)*(1-out),
    fragments:Math.max((first?range(b,.035,.18):1)*(1-range(b,.83,1)),range(out,0,.25)),
    solid:(first?1-range(b,.1,.26)+range(b,.58,.84):range(b,.58,.84))*(1-range(out,0,.3)),
    construction:b*(1-out), orientation:range(b,0,.65)*(1-out), camera:first?range(b,0,.65):1,
  };
}

export function sceneReveal(index, build, exit=0) {
  return range(build,index===3?.65:.26,.93)*(1-exit);
}
