(function(){
  const preference=matchMedia("(prefers-reduced-motion: reduce)");
  if(!("IntersectionObserver" in window))return;
  const selector=".product-card,.list-item,#main-product-art";
  const dynamicRoots=["#featured-products","#product-grid","#related-products","#suggested-products","#list-items"];
  let observer=null;
  let changes=null;

  function enter(target){
    if(!target.classList.contains("motion-in")){
      target.classList.add("motion-in");
      if(target.animate)target.animate([
        {transform:"translate3d(0,22px,0) scale(.985)"},
        {transform:"translate3d(0,0,0) scale(1)"}
      ],{duration:680,easing:"cubic-bezier(.2,.7,.2,1)"});
    }
    target.classList.add("motion-active");
  }

  function candidates(node){
    if(node.nodeType!==1)return [];
    return [...(node.matches(selector)?[node]:[]),...node.querySelectorAll(selector)];
  }
  function observe(node){
    if(!observer)return;
    candidates(node).forEach((target)=>{
      if(target.dataset.motionObserved)return;
      target.dataset.motionObserved="true";
      target.classList.add("motion-item");
      observer.observe(target);
      const rect=target.getBoundingClientRect();
      if(rect.top<innerHeight+45&&rect.bottom>-45)enter(target);
    });
  }
  function release(node){
    if(!observer)return;
    candidates(node).forEach((target)=>observer.unobserve(target));
  }
  function start(){
    if(preference.matches||observer)return;
    observer=new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        if(entry.isIntersecting)enter(entry.target);
        else entry.target.classList.remove("motion-active");
      });
    },{threshold:.04,rootMargin:"0px 0px 45px 0px"});
    document.documentElement.classList.add("motion-enhanced");
    observe(document.body);
    changes=new MutationObserver((records)=>{
      records.forEach((record)=>{
        record.removedNodes.forEach(release);
        record.addedNodes.forEach(observe);
      });
    });
    dynamicRoots.forEach((selector)=>{
      const root=document.querySelector(selector);
      if(root)changes.observe(root,{childList:true});
    });
  }
  function stop(){
    if(!observer)return;
    changes.disconnect();
    observer.disconnect();
    observer=null;
    changes=null;
    document.documentElement.classList.remove("motion-enhanced");
    document.querySelectorAll("[data-motion-observed]").forEach((target)=>{
      delete target.dataset.motionObserved;
      target.classList.remove("motion-item","motion-in","motion-active");
    });
  }
  preference.addEventListener("change",()=>preference.matches?stop():start());
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden)document.documentElement.dataset.motionPaused="true";
    else delete document.documentElement.dataset.motionPaused;
  });

  const finePointer=matchMedia("(hover: hover) and (pointer: fine)");
  let pointerFrame=0;
  let pendingPointer=null;
  function applyPointer(){
    const current=pendingPointer;
    pointerFrame=0;
    if(!current)return;
    const target=current.card||current.button;
    if(!target.isConnected)return;
    const rect=target.getBoundingClientRect();
    const x=Math.max(-.5,Math.min(.5,(current.x-rect.left)/rect.width-.5));
    const y=Math.max(-.5,Math.min(.5,(current.y-rect.top)/rect.height-.5));
    if(current.card){
      target.style.setProperty("--tilt-x",(-y*4)+"deg");
      target.style.setProperty("--tilt-y",(x*4)+"deg");
      target.style.setProperty("--photo-x",(x*12)+"px");
      target.style.setProperty("--photo-y",(y*12)+"px");
    }else{
      target.style.setProperty("--magnet-x",(x*10)+"px");
      target.style.setProperty("--magnet-y",(y*7)+"px");
    }
  }
  document.addEventListener("pointermove",(event)=>{
    if(preference.matches||!finePointer.matches||!(event.target instanceof Element))return;
    const card=event.target.closest(".product-card");
    const button=card?null:event.target.closest(".button:not(:disabled)");
    if(!card&&!button)return;
    pendingPointer={card,button,x:event.clientX,y:event.clientY};
    if(!pointerFrame)pointerFrame=setTimeout(applyPointer,16);
  },{passive:true});
  document.addEventListener("pointerout",(event)=>{
    if(!(event.target instanceof Element))return;
    const next=event.relatedTarget;
    const card=event.target.closest(".product-card");
    if(card&&!(next instanceof Node&&card.contains(next))){
      if(pendingPointer?.card===card){pendingPointer=null;clearTimeout(pointerFrame);pointerFrame=0}
      ["--tilt-x","--tilt-y","--photo-x","--photo-y"].forEach((name)=>card.style.removeProperty(name));
    }
    const button=event.target.closest(".button");
    if(button&&!(next instanceof Node&&button.contains(next))){
      if(pendingPointer?.button===button){pendingPointer=null;clearTimeout(pointerFrame);pointerFrame=0}
      button.style.removeProperty("--magnet-x");
      button.style.removeProperty("--magnet-y");
    }
  });
  start();
})();
