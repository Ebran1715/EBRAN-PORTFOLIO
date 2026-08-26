import * as THREE from "three";

export function initNetwork(ctx){
  if(!ctx?.scene) return;
  const group=new THREE.Group();
  const material=new THREE.LineBasicMaterial({color:0x38bdf8,transparent:true,opacity:.18});
  for(let i=0;i<16;i++){
    const a=new THREE.Vector3((Math.random()-.5)*16,Math.random()*8-1,(Math.random()-.5)*20-5);
    const b=new THREE.Vector3((Math.random()-.5)*16,Math.random()*8-1,(Math.random()-.5)*20-5);
    const geo=new THREE.BufferGeometry().setFromPoints([a,b]);
    group.add(new THREE.Line(geo,material));
  }
  ctx.world.add(group);
}
