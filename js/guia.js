(function(){
  let stage="Estudiantes",tech="";
  function update(){
    const params=new URLSearchParams({categoria:stage});
    if(tech)params.set("tecnologia",tech);
    document.querySelector("#selector-link").href="catalogo.html?"+params.toString();
    document.querySelector("#selector-summary").textContent=stage+" · "+(tech||"Todas las tecnologías");
    const result=document.querySelector(".selector-result");
    result.classList.remove("changed");
    void result.offsetWidth;
    result.classList.add("changed");
  }
  document.querySelectorAll("[data-stage]").forEach((button)=>button.addEventListener("click",()=>{
    stage=button.dataset.stage;
    document.querySelectorAll("[data-stage]").forEach((node)=>{node.classList.toggle("active",node===button);node.setAttribute("aria-pressed",String(node===button))});
    update();
  }));
  document.querySelectorAll("[data-tech]").forEach((button)=>button.addEventListener("click",()=>{
    tech=button.dataset.tech;
    document.querySelectorAll("[data-tech]").forEach((node)=>{node.classList.toggle("active",node===button);node.setAttribute("aria-pressed",String(node===button))});
    update();
  }));
})();
