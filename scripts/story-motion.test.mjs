import test from 'node:test';
import assert from 'node:assert/strict';
import {pointOnScene,storyState,flightPoint} from '../src/story-motion.js';
test('Scene flights reach the next scene without position jumps or invalid indexes',()=>{
  for(let i=0;i<4;i++){
    const before=storyState(i+1-.000001),after=storyState(i+1);
    assert.equal(before.to,after.from);
    const end=flightPoint({...pointOnScene(i,1),size:90},{...pointOnScene(i+1,0),size:80},before.flight,.15);
    const start=pointOnScene(i+1,after.phase);
    assert(Math.hypot(end.x-start.x,end.y-start.y)<.0001);
  }
  assert.equal(storyState(-10).from,0);
  assert.equal(storyState(99).from,4);
  assert.equal(storyState(99).to,4);
});
test('All four object paths keep the point inside its art region on any screen size',()=>{
  for(let i=0;i<4;i++)for(let t=0;t<=1;t+=.005){
    const p=pointOnScene(i,t);
    assert(p.x>=.09&&p.x<=.91&&p.y>=.05&&p.y<=.85,`Path ${i} at ${t} leaves the artwork`);
  }
});
