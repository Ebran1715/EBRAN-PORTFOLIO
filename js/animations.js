export function initAnimations(){
  const items=document.querySelectorAll(".reveal");
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) entry.target.classList.add("visible");
    });
  },{threshold:.15});
  items.forEach(x=>observer.observe(x));
}
