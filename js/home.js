document.querySelector("#featured-products").innerHTML=window.DEMO_PRODUCTS.slice(0,3).map(window.DemoStore.card).join("");
if(!matchMedia("(prefers-reduced-motion: reduce)").matches){
  const visual=document.querySelector(".hero-visual");
  visual.addEventListener("pointermove",(event)=>{
    if(event.pointerType==="touch")return;
    const rect=visual.getBoundingClientRect();
    visual.style.setProperty("--hero-x",((event.clientX-rect.left)/rect.width-.5)*14+"px");
    visual.style.setProperty("--hero-y",((event.clientY-rect.top)/rect.height-.5)*11+"px");
  });
  visual.addEventListener("pointerleave",()=>{
    visual.style.setProperty("--hero-x","0px");
    visual.style.setProperty("--hero-y","0px");
  });
}
