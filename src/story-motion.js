export const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const mix=(a,b,t)=>a+(b-a)*t;
export const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
// Each path belongs to a physical scene: page turn, classroom reveal, school
// passage and screen entry. Keep these control points aligned with the SVGs.
const paths=[
  [[.72,.22],[.66,.14],[.45,.12],[.32,.20]],
  [[.18,.11],[.39,.11],[.61,.11],[.82,.11]],
  [[.50,.78],[.50,.57],[.50,.34],[.50,.13]],
  [[.83,.32],[.83,.27],[.83,.21],[.83,.16]],
];
export function pointOnScene(index,phase){
  const points=paths[index];
  if(!points)return {x:.5,y:.5};
  // One deliberate action followed by a pause, rather than constant wandering.
  const t=ease(phase/.72),u=1-t;
  const coord=k=>u**3*points[0][k]+3*u*u*t*points[1][k]+3*u*t*t*points[2][k]+t**3*points[3][k];
  return {x:coord(0),y:coord(1)};
}
export function storyState(progress,count=5){
  const p=clamp(progress,0,count-.00001),from=Math.floor(p),to=Math.min(count-1,from+1);
  const phase=clamp((p-from)/.68);
  const flight=from===to?0:ease((p-from-.68)/.32);
  return {from,to,phase,flight,active:flight>.5?to:from,progress:p/count};
}
export function flightPoint(from,to,t,arc){
  return {x:mix(from.x,to.x,t),y:mix(from.y,to.y,t)-Math.sin(t*Math.PI)*arc,size:mix(from.size,to.size,t)};
}
