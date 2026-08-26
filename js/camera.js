export function initCamera(ctx){
  if(!ctx?.camera) return;
  const camera=ctx.camera;
  const target={x:0,y:2.4,z:10,rx:0,ry:0};
  const mouse={x:0,y:0};
  addEventListener("pointermove",e=>{
    mouse.x=(e.clientX/innerWidth-.5);
    mouse.y=(e.clientY/innerHeight-.5);
  });
  const sections=[...document.querySelectorAll(".scene-section")];
  const sectionIndexes=new Map(["monitoring","response","experience","skills","projects","education","contact"].map((id,index)=>[id,index]));
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    const index=sectionIndexes.get(visible.target.id);
    if(index !== undefined) ctx.setSection?.(index);
  },{threshold:[.35,.6,.8]});
  sections.forEach(section=>observer.observe(section));
  function update(){
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    const p=scrollY/max;
    target.z=10-p*27;
    target.y=2.4+Math.sin(p*Math.PI)*1.2;
    target.x=Math.sin(p*Math.PI*1.6)*2.4;
    target.ry=Math.sin(p*Math.PI)*.13;
  }
  addEventListener("scroll",update,{passive:true}); update();
  function loop(){
    camera.position.x += (target.x+mouse.x*.45-camera.position.x)*.035;
    camera.position.y += (target.y-mouse.y*.35-camera.position.y)*.035;
    camera.position.z += (target.z-camera.position.z)*.035;
    camera.rotation.y += (target.ry-camera.rotation.y)*.035;
    requestAnimationFrame(loop);
  }
  loop();
}
