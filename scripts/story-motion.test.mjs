import test from 'node:test';
import assert from 'node:assert/strict';
import {storyState,fragmentState,sceneReveal} from '../src/story-motion.js';

test('Scene boundaries preserve the same cloud, camera and orientation in both scroll directions',()=>{
  for(let chapter=0;chapter<4;chapter++) {
    const outgoing=fragmentState(chapter,1,1);
    const incoming=fragmentState(chapter+1,0,0);
    assert.deepEqual(outgoing,incoming,`Discontinuous boundary ${chapter} → ${chapter+1}`);
    const before=storyState(chapter+1-.000001),after=storyState(chapter+1+.000001);
    const a=fragmentState(before.active,before.build,before.gather);
    const b=fragmentState(after.active,after.build,after.gather);
    for(const key of Object.keys(a))assert(Math.abs(a[key]-b[key])<.0001);
  }
});
test('The unchanged point begins solid, scatters, and finishes assembled with no further exit',()=>{
  const start=fragmentState(0,0),cloud=fragmentState(0,.34),end=fragmentState(4,1);
  assert.equal(start.solid,1);assert.equal(start.fragments,0);assert.equal(start.camera,0);
  assert.equal(cloud.solid,0);assert.equal(cloud.spread,1);assert.equal(cloud.fragments,1);
  assert.equal(end.solid,1);assert.equal(end.fragments,0);assert.equal(end.camera,0);
  assert.equal(storyState(-2).active,0);assert.equal(storyState(99).active,4);
  assert.equal(storyState(99).gather,0);assert.equal(storyState(99).build,1);
  for(let chapter=0;chapter<5;chapter++)for(let b=0;b<=1;b+=.01) {
    for(const out of [0,.25,.7,1])for(const value of Object.values(fragmentState(chapter,b,out)))assert(value>=0&&value<=1);
    assert(sceneReveal(chapter,b)>=0&&sceneReveal(chapter,b)<=1);
  }
});
