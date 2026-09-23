import {InstancedMesh} from 'three';

// Batch only rigid boxes that share a parent and material. Animated groups and
// individually blinking lights remain independent; geometry is not simplified.
export function batchStaticBoxes(root, geometry, dynamic=new Set()) {
  const parents=new Set(),batches=[];
  root.traverse(node=>{if(node.isMesh&&node.geometry===geometry)parents.add(node.parent);});
  for(const parent of parents) {
    const materials=new Map();
    for(const mesh of [...parent.children]) {
      if(!mesh.isMesh||mesh.geometry!==geometry)continue;
      mesh.updateMatrix();mesh.matrixAutoUpdate=false;
      if(dynamic.has(mesh)||!mesh.visible)continue;
      if(!materials.has(mesh.material))materials.set(mesh.material,[]);
      materials.get(mesh.material).push(mesh);
    }
    for(const [material,meshes] of materials) {
      if(meshes.length<2)continue;
      const batch=new InstancedMesh(geometry,material,meshes.length);
      meshes.forEach((mesh,i)=>{batch.setMatrixAt(i,mesh.matrix);parent.remove(mesh);});
      batch.instanceMatrix.needsUpdate=true;
      batch.matrixAutoUpdate=false;
      parent.add(batch);batches.push(batch);
    }
  }
  return batches;
}
