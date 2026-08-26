export function initProjects(){
  document.querySelectorAll(".project-card").forEach(card=>{
    card.addEventListener("pointermove",e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateX(${-y*3}deg) rotateY(${x*4}deg) translateY(-6px)`;
    });
    card.addEventListener("pointerleave",()=>card.style.transform="");
  });
}
