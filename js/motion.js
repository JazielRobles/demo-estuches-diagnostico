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
  start();
})();
