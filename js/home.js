document.querySelector("#featured-products").innerHTML=window.DEMO_PRODUCTS.slice(0,3).map(window.DemoStore.card).join("");
if(!matchMedia("(prefers-reduced-motion: reduce)").matches){
  const visual=document.querySelector(".hero-visual");
  let frame=0;
  let next=null;
  const update=()=>{
    if(next){
      visual.style.setProperty("--hero-x",next.x+"px");
      visual.style.setProperty("--hero-y",next.y+"px");
      visual.style.setProperty("--spot-x",next.spotX+"%");
      visual.style.setProperty("--spot-y",next.spotY+"%");
    }
    frame=0;
  };
  visual.addEventListener("pointermove",(event)=>{
    if(event.pointerType==="touch")return;
    const rect=visual.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width;
    const y=(event.clientY-rect.top)/rect.height;
    next={x:(x-.5)*20,y:(y-.5)*16,spotX:Math.round(x*100),spotY:Math.round(y*100)};
    if(!frame)frame=setTimeout(update,16);
  });
  visual.addEventListener("pointerleave",()=>{
    if(frame)clearTimeout(frame);
    frame=0;next=null;
    visual.style.setProperty("--hero-x","0px");
    visual.style.setProperty("--hero-y","0px");
    visual.style.setProperty("--spot-x","75%");
    visual.style.setProperty("--spot-y","25%");
  });
}
