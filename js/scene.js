import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export function initScene(){
  const canvas = document.querySelector("#webgl");
  const fallback = document.querySelector("#webgl-fallback");
  let renderer;
  try{
    renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:"high-performance"});
  }catch(e){
    fallback.hidden = false;
    canvas.style.display = "none";
    return {scene:null,camera:null,renderer:null};
  }
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x171716);
  scene.fog = new THREE.FogExp2(0x171716, 0.035);

  const camera = new THREE.PerspectiveCamera(48, innerWidth/innerHeight, .1, 100);
  camera.position.set(0,2.4,10);

  const hemi = new THREE.HemisphereLight(0xd6a15d,0x080807,.65);
  scene.add(hemi);
  const key = new THREE.PointLight(0xd6a15d,18,28);
  key.position.set(3,5,4); scene.add(key);
  const rim = new THREE.PointLight(0x7fa99b,9,25);
  rim.position.set(-7,2,-5); scene.add(rim);

  const world = new THREE.Group();
  scene.add(world);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50,50),
    new THREE.MeshStandardMaterial({color:0x171716,metalness:.8,roughness:.72})
  );
  floor.rotation.x=-Math.PI/2; floor.position.y=-2; world.add(floor);

  // NOC room: floor lanes, ceiling strips and server racks.
  const rackMat = new THREE.MeshStandardMaterial({color:0x101820,metalness:.75,roughness:.35});
  const darkMat = new THREE.MeshStandardMaterial({color:0x070b10,metalness:.5,roughness:.55});
  for(let z=-18; z<10; z+=4){
    for(let x=-9; x<=9; x+=6){
      const rack = new THREE.Mesh(new THREE.BoxGeometry(2.2,6,1.1),rackMat);
      rack.position.set(x,-2+3,z);
      world.add(rack);
      for(let y=-4.3;y<=4.3;y+=.72){
        const server = new THREE.Mesh(new THREE.BoxGeometry(1.8,.18,.98),darkMat);
        server.position.set(x,y,z-.04);
        world.add(server);
        const led = new THREE.Mesh(new THREE.SphereGeometry(.035,8,8),new THREE.MeshBasicMaterial({color:Math.random()>.15?0xd6a15d:0xd86f62}));
        led.position.set(x+.72,y+.12,z-.57);
        world.add(led);
      }
    }
  }

  // Cinematic reference panels for server rooms, hardware and network infrastructure.
  const imageGroup = new THREE.Group();
  world.add(imageGroup);
  const imageLoader = new THREE.TextureLoader();
  const imagePanels = [
    {url:"https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=75",position:[-6,2.5,-7],rotation:[0,.22,.02],scale:1},
    {url:"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=75",position:[6,1.2,-13],rotation:[0,-.2,-.02],scale:.82},
    {url:"https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=1000&q=75",position:[-1,4.8,-19],rotation:[-.08,.05,0],scale:.72},
    {url:"https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1000&q=75",position:[5,3.8,-8.5],rotation:[0,-.16,-.025],scale:.86}
  ];
  imageLoader.load(imagePanels[0].url,texture=>{
    texture.colorSpace=THREE.SRGBColorSpace;
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(34,20),
      new THREE.MeshBasicMaterial({map:texture,color:0x8d7355,transparent:true,opacity:.14,depthWrite:false,fog:true})
    );
    backdrop.position.set(0,5,-25);
    imageGroup.add(backdrop);
  });
  imagePanels.forEach((panel,index)=>{
    panel.phase=index*1.8;
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(4.7*panel.scale,3.05*panel.scale,.12),
      new THREE.MeshStandardMaterial({color:0x2a241d,metalness:.85,roughness:.28,transparent:true,opacity:.78})
    );
    frame.position.set(...panel.position);
    frame.rotation.set(...panel.rotation);
    frame.userData={baseY:panel.position[1],baseRotationZ:panel.rotation[2],phase:panel.phase};
    imageGroup.add(frame);
    imageLoader.load(panel.url,texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;
      const image = new THREE.Mesh(
        new THREE.PlaneGeometry(4.35*panel.scale,2.7*panel.scale),
        new THREE.MeshBasicMaterial({map:texture,color:0xffffff,transparent:true,opacity:.38,fog:true})
      );
      image.position.set(panel.position[0],panel.position[1],panel.position[2]-.08);
      image.rotation.set(...panel.rotation);
      image.userData={baseY:panel.position[1],baseRotationZ:panel.rotation[2],phase:panel.phase};
      imageGroup.add(image);
    });
  });

  // Floating network nodes.
  const nodeGroup = new THREE.Group(); world.add(nodeGroup);
  for(let i=0;i<38;i++){
    const node = new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),new THREE.MeshBasicMaterial({color:0xd6a15d}));
    node.position.set((Math.random()-.5)*22,Math.random()*9-1,(Math.random()-.5)*24-4);
    nodeGroup.add(node);
  }

  // Particle field.
  const count = matchMedia("(max-width:700px)").matches ? 700 : 1500;
  const pos = new Float32Array(count*3);
  for(let i=0;i<count;i++){
    pos[i*3]=(Math.random()-.5)*34;
    pos[i*3+1]=Math.random()*18-5;
    pos[i*3+2]=(Math.random()-.5)*34-8;
  }
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const particles = new THREE.Points(pgeo,new THREE.PointsMaterial({color:0xd6a15d,size:.025,transparent:true,opacity:.55}));
  world.add(particles);

  const visualGroup = new THREE.Group();
  world.add(visualGroup);
  const visualSets = [];
  const visualColors = [0xd6a15d,0x7fa99b,0xc98b57,0xd86f62,0xb9a58b,0xf4efe6,0xd6a15d];
  const visualDepths = [4.5,1.2,-2,-5.3,-8.5,-11.8,-15.2];

  visualDepths.forEach((z,index)=>{
    const group = new THREE.Group();
    const color = visualColors[index];
    const material = new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.45,metalness:.5,roughness:.3,transparent:true,opacity:0});
    const frameMaterial = new THREE.MeshStandardMaterial({color:0x101820,metalness:.8,roughness:.25,transparent:true,opacity:0});
    const boxBodyMaterial = new THREE.MeshStandardMaterial({color:0x0b1320,emissive:color,emissiveIntensity:.2,metalness:.65,roughness:.28,transparent:true,opacity:0});
    const boxMaterial = new THREE.LineBasicMaterial({color,transparent:true,opacity:0});
    const boxBody = new THREE.Mesh(new THREE.BoxGeometry(2.2,1.55,.65),boxBodyMaterial);
    const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2,1.55,.65)),boxMaterial);
    group.add(boxBody);
    group.add(box);

    if(index === 0){
      group.add(new THREE.Mesh(new THREE.BoxGeometry(4.8,2.7,.16),frameMaterial));
      const bars = new THREE.Group();
      for(let i=0;i<8;i++){
        const bar = new THREE.Mesh(new THREE.BoxGeometry(.24,.35+(i%4)*.3,.08),material);
        bar.position.set(-1.65+i*.47,-.45,.14); bars.add(bar);
      }
      group.add(bars);
    }else if(index === 1){
      for(let i=0;i<3;i++){
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(.22,3.7,.22),material);
        pillar.position.set((i-1)*1.2,0,0); group.add(pillar);
      }
      group.add(new THREE.Mesh(new THREE.TorusGeometry(1.5,.035,8,64),material));
    }else if(index === 2){
      for(let i=0;i<10;i++){
        const node = new THREE.Mesh(new THREE.SphereGeometry(.13,12,12),material);
        const angle = i/10*Math.PI*2;
        node.position.set(Math.cos(angle)*1.8,Math.sin(angle)*1.8,0); group.add(node);
      }
      group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.65,1),material));
    }else if(index === 3){
      for(let i=0;i<4;i++){
        const cube = new THREE.Mesh(new THREE.BoxGeometry(.75,.75,.75),material);
        cube.position.set((i-1.5)*.95,Math.sin(i)*.45,0); cube.rotation.set(i*.3,i*.45,0); group.add(cube);
      }
    }else if(index === 4){
      group.add(new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.35,.16,48),frameMaterial));
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.28,48),material);
      cap.position.y=.22; group.add(cap);
      group.add(new THREE.Mesh(new THREE.TorusGeometry(1.35,.035,8,48),material));
    }else if(index === 5){
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6,.05,8,64),material);
      ring.rotation.x=Math.PI/2; group.add(ring);
      group.add(new THREE.Mesh(new THREE.SphereGeometry(.55,24,24),material));
    }else{
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25,.06,8,64),material);
      ring.rotation.x=Math.PI/2; group.add(ring);
      const point = new THREE.Mesh(new THREE.SphereGeometry(.2,16,16),material);
      point.position.set(1.25,0,0); group.add(point);
    }

    group.position.set(2.6,index%2 ? 1.1 : .5,z);
    group.rotation.set(0,index*.22,0);
    const motionChildren=group.children.filter(child=>child !== box && child !== boxBody).map(child=>{
      const finalPosition=child.position.clone();
      child.position.set(0,0,0);
      return {child,finalPosition};
    });
    visualGroup.add(group);
    visualSets.push({group,material,frameMaterial,boxBodyMaterial,boxMaterial,motionChildren,baseY:group.position.y,baseRotationY:index*.22,motionStart:0});
  });

  function setSection(index){
    visualSets.forEach((set,setIndex)=>{
      const active = setIndex === index;
      set.material.opacity = active ? 1 : .08;
      set.frameMaterial.opacity = active ? .92 : .04;
      set.boxBodyMaterial.opacity = active ? .28 : .04;
      set.boxMaterial.opacity = active ? .9 : .08;
      if(active){
        set.motionStart = performance.now();
        set.group.scale.setScalar(.72);
        set.group.rotation.y = set.baseRotationY + Math.PI * 2.4;
        set.motionChildren.forEach(item=>item.child.position.set(0,0,0));
      }else{
        set.motionStart = 0;
        set.group.scale.setScalar(1);
        set.group.rotation.y = set.baseRotationY;
      }
    });
  }
  setSection(0);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.55,.75,.88);
  composer.addPass(bloom);

  function resize(){
    const dpr=Math.min(devicePixelRatio,1.6);
    renderer.setPixelRatio(dpr);
    renderer.setSize(innerWidth,innerHeight,false);
    composer.setSize(innerWidth,innerHeight);
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize",resize); resize();

  const clock=new THREE.Clock();
  function tick(){
    const t=clock.getElapsedTime();
    particles.rotation.y=t*.006;
    imageGroup.children.forEach((panel,index)=>{
      panel.position.y=panel.userData.baseY+Math.sin(t*.18+panel.userData.phase)*.12;
      panel.rotation.z=panel.userData.baseRotationZ+Math.sin(t*.12+panel.userData.phase)*.012;
    });
    nodeGroup.children.forEach((n,i)=>{n.position.y += Math.sin(t*.6+i)*.0006});
    visualSets.forEach((set,i)=>{
      if(!set.motionStart) return;
      const progress=Math.min(1,(performance.now()-set.motionStart)/2200);
      const eased=1-Math.pow(1-progress,3);
      set.group.rotation.y=set.baseRotationY + Math.PI*2.4*(1-eased);
      set.group.scale.setScalar(.72+.28*eased);
      set.motionChildren.forEach(item=>item.child.position.lerpVectors(new THREE.Vector3(0,0,0),item.finalPosition,eased));
      if(progress >= 1) set.motionStart=0;
    });
    key.position.x=3+Math.sin(t*.35)*2;
    rim.position.x=-7+Math.cos(t*.25)*2;
    composer.render();
    requestAnimationFrame(tick);
  }
  tick();

  return {THREE,scene,camera,renderer,composer,world,key,rim,setSection};
}
