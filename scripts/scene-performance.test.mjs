import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Mesh,BoxGeometry,MeshStandardMaterial,Matrix4} from 'three';
import {batchStaticBoxes} from '../src/scene-performance.js';

test('Batching preserves geometry, materials and world transforms while animated lights remain independent',()=>{
  const root=new Group(),row=new Group();root.add(row);
  row.position.set(2,-1,3);row.rotation.set(.2,-.4,.1);
  const geometry=new BoxGeometry(1,1,1),material=new MeshStandardMaterial();
  const boxes=Array.from({length:4},(_,i)=>{
    const mesh=new Mesh(geometry,material);mesh.position.set(i*.8,i*.2,1);
    mesh.scale.set(.7,.08,.4);row.add(mesh);return mesh;
  });
  const light=new Mesh(geometry,material);row.add(light);
  root.updateMatrixWorld(true);const before=boxes.map(mesh=>mesh.matrixWorld.clone());
  const batches=batchStaticBoxes(root,geometry,new Set([light]));
  assert.equal(batches.length,1);assert.equal(batches[0].count,4);
  assert.equal(batches[0].geometry,geometry);assert.equal(batches[0].material,material);
  assert(row.children.includes(light),'Individually animated lights must not be batched');
  root.updateMatrixWorld(true);
  for(let i=0;i<4;i++) {
    const local=new Matrix4();batches[0].getMatrixAt(i,local);
    const actual=new Matrix4().multiplyMatrices(batches[0].matrixWorld,local);
    actual.elements.forEach((n,j)=>assert(Math.abs(n-before[i].elements[j])<1e-6));
  }
  row.rotation.y+=.6;root.updateMatrixWorld(true);
  const local=new Matrix4();batches[0].getMatrixAt(2,local);
  const actual=new Matrix4().multiplyMatrices(batches[0].matrixWorld,local);
  const expected=new Matrix4().multiplyMatrices(row.matrixWorld,boxes[2].matrix);
  actual.elements.forEach((n,j)=>assert(Math.abs(n-expected.elements[j])<1e-6));
  batches.forEach(batch=>batch.dispose());geometry.dispose();material.dispose();
});
