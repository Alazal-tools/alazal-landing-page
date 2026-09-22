import test from 'node:test';
import assert from 'node:assert/strict';
import {storyState,digitalState,sceneReveal} from '../src/story-motion.js';

test('Every built object returns to the same seed before the next scene',()=>{
 for(let index=0;index<4;index++) {
  assert.equal(storyState(index).build,0);
  assert(storyState(index+.7).build>.999);
  assert(storyState(index+1-.000001).build<.000001);
  assert.equal(storyState(index+1).build,0);
 }
 assert.equal(storyState(-2).active,0);
 assert.equal(storyState(99).active,4);
 assert.equal(storyState(99).build,1);
 assert.equal(storyState(99).gather,0,'The final logo stays assembled');
});
test('The platform visibly scatters before assembling its screen, with reversible safe values',()=>{
 const seed=digitalState(0),cloud=digitalState(.48),screen=digitalState(1);
 assert.deepEqual(seed,{scatter:0,assemble:0,solid:1,reveal:0});
 assert.equal(cloud.scatter,1);assert.equal(cloud.assemble,0);assert.equal(cloud.reveal,0);
 assert.deepEqual(screen,{scatter:1,assemble:1,solid:0,reveal:1});
 for(let b=0;b<=1;b+=.005) {
  for(const value of Object.values(digitalState(b)))assert(value>=0&&value<=1);
  for(let i=0;i<5;i++)assert(sceneReveal(i,b)>=0&&sceneReveal(i,b)<=1);
 }
});
