import test from 'node:test';
import assert from 'node:assert/strict';
import { createMetaPixel, loadMetaLibrary } from '../src/meta-pixel.js';

function fixture(pixelId = '123456789012345') {
  let finish;
  let loads = 0;
  const calls = [], events = [];
  const ready = new Promise(resolve => { finish = () => resolve((...args) => calls.push(args)); });
  const pixel = createMetaPixel({pixelId, load: () => { loads++; return ready; }, onEvent: e => events.push(e)});
  return {pixel,calls,events,finish,loads:()=>loads};
}
test('missing ID and denied consent never load Meta or retain earlier clicks', async () => {
  const disabled = fixture('');
  disabled.pixel.setConsent(true);
  assert.equal(disabled.loads(), 0);
  const f = fixture();
  f.pixel.track('Contact', {facility:'girls',channel:'whatsapp'});
  f.pixel.setConsent(false);
  assert.equal(f.loads(), 0);
  f.pixel.setConsent(true);
  f.finish(); await Promise.resolve();
  assert.deepEqual(f.events.map(e=>e.name), ['PageView']);
});
test('one SDK load/init/PageView and scoped, sanitized events after consent', async () => {
  const f = fixture();
  f.pixel.setConsent(true); f.pixel.setConsent(true);
  f.pixel.track('Contact', {facility:'boys',channel:'whatsapp',phone:'private',origin:'hospital',email:'private'});
  f.finish(); await Promise.resolve();
  assert.equal(f.loads(), 1);
  assert.equal(f.calls.filter(c=>c[0]==='init').length,1);
  assert.deepEqual(f.calls.find(c=>c[0]==='set'), ['set','autoConfig',false,'123456789012345']);
  assert.deepEqual(f.calls.find(c=>c[2]==='Contact'), ['trackSingle','123456789012345','Contact',{facility:'boys',channel:'whatsapp'}]);
  f.pixel.setConsent(true);
  assert.equal(f.events.filter(e=>e.name==='PageView').length,1);
  f.pixel.track('GetDirections',{facility:'girls',channel:'map'},true);
  assert.equal(f.calls.at(-1)[0],'trackSingleCustom');
  f.pixel.track('Lead',{email:'private'});
  assert(!f.events.some(e=>e.name==='Lead'));
});
test('withdrawal while the SDK downloads drops pending hits; regrant is safe', async () => {
  const f = fixture();
  f.pixel.setConsent(true);
  f.pixel.track('Contact',{facility:'institute'});
  f.pixel.setConsent(false);
  f.finish(); await Promise.resolve();
  assert.deepEqual(f.calls,[]);
  assert.deepEqual(f.events,[]);
  f.pixel.setConsent(true);
  assert.deepEqual(f.events.map(e=>e.name),['PageView']);
  f.pixel.setConsent(false);
  assert.deepEqual(f.calls.at(-1),['consent','revoke']);
  f.pixel.track('Contact',{facility:'institute'});
  assert.equal(f.events.length,1);
});
test('SDK failure cannot break navigation or leak queued events', async () => {
  const pixel = createMetaPixel({pixelId:'123456789012345',load:()=>Promise.reject(new Error('blocked'))});
  pixel.setConsent(true);
  pixel.track('Contact',{facility:'institute'});
  await new Promise(resolve=>setImmediate(resolve));
  pixel.setConsent(false);
});
test('local dry run records allowed events without loading a Meta script', () => {
  const events=[];
  const pixel=createMetaPixel({pixelId:'',debug:true,load:()=>assert.fail('Unexpected network'),onEvent:e=>events.push(e)});
  pixel.setConsent(true);
  pixel.track('ViewContent',{facility:'girls',student_name:'private'});
  assert.deepEqual(events.map(e=>e.name),['PageView','ViewContent']);
  assert.deepEqual(events[1].data,{facility:'girls'});
});
test('the real loader injects one asynchronous SDK and queues no unsolicited events', async () => {
  const win={},scripts=[];
  const doc={
    querySelector:()=>scripts[0],
    createElement:()=>({dataset:{},listeners:{},addEventListener(type,fn){this.listeners[type]=fn;}}),
    head:{append(script){scripts.push(script);script.isConnected=true;}},
  };
  const promise=loadMetaLibrary(win,doc);
  assert.equal(scripts.length,1);
  assert.equal(scripts[0].async,true);
  assert.equal(scripts[0].src,'https://connect.facebook.net/en_US/fbevents.js');
  assert.equal(win.fbq.queue.length,0);
  assert.equal(win.fbq.disablePushState,true);
  scripts[0].listeners.load();
  assert.equal(await promise,win.fbq);
});
