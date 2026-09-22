export const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
export const mix = (a, b, t) => a + (b - a) * t;
export const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const range = (value, start, end) => ease((value - start) / (end - start));

// Each object is built, held long enough to read, then gathered into the same
// seed before the next chapter. The final logo never gathers or moves again.
export function storyState(progress, count = 5) {
  const p = clamp(progress, 0, count - .000001);
  const active = Math.floor(p), local = p - active;
  const grow = range(local, .04, .62);
  const gather = active === count - 1 ? 0 : range(local, .84, 1);
  return { active, local, build: grow * (1 - gather), gather, progress: p / count };
}

export function digitalState(build) {
  return {
    scatter: range(build, .08, .48),
    assemble: range(build, .48, .86),
    solid: 1 - range(build, .06, .28),
    reveal: range(build, .65, .93),
  };
}

export function sceneReveal(index, build) {
  return index === 3 ? digitalState(build).reveal : range(build, index === 2 ? .38 : .26, .91);
}
