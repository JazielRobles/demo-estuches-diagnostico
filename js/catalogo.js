(function(){
  const Store=window.DemoStore;
  const $=(selector)=>document.querySelector(selector);
  const $$=(selector)=>[...document.querySelectorAll(selector)];
  const params=new URLSearchParams(location.search);
  const initialCategory=params.get("categoria");
  const initialTechnology=params.get("tecnologia");
  let storedCompare=[];
  try{storedCompare=JSON.parse(localStorage.getItem("medica-demo-compare")||"[]")}catch{}
  const state={
    category:["Estudiantes","Profesionales"].includes(initialCategory)?initialCategory:"all",
    technologies:new Set(["LED","Halógeno"].includes(initialTechnology)?[initialTechnology]:[]),
    search:"",sort:"default",favoritesOnly:false,
    compare:new Set((Array.isArray(storedCompare)?storedCompare:[]).filter((id)=>Store.getProduct(id)).slice(0,3))
  };
  function normalize(value){return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
  function products(){
    const items=Store.products.filter((p)=>(state.category==="all"||p.category===state.category)
      &&(!state.technologies.size||state.technologies.has(p.technology))
      &&(!state.favoritesOnly||Store.getFavorites().has(p.id))
      &&(!state.search||normalize(p.name+" "+p.id+" "+p.category+" "+p.technology).includes(normalize(state.search))));
    if(state.sort==="az")items.sort((a,b)=>a.name.localeCompare(b.name,"es"));
    if(state.sort==="za")items.sort((a,b)=>b.name.localeCompare(a.name,"es"));
    return items;
  }
  function render(){
    const items=products();
    $("#result-count").textContent=items.length+" de "+Store.products.length+" productos de muestra";
    $("#product-grid").innerHTML=items.map((p)=>Store.card(p,{compareSet:state.compare})).join("");
    $("#empty-state").hidden=items.length>0;
    const pills=[];
    if(state.category!=="all")pills.push({kind:"category",label:state.category});
    state.technologies.forEach((value)=>pills.push({kind:"technology",label:value,value}));
    if(state.search)pills.push({kind:"search",label:'Buscar: "'+state.search+'"'});
    if(state.favoritesOnly)pills.push({kind:"favorites",label:"Favoritos"});
    $("#active-filters").innerHTML=pills.map((p)=>'<button type="button" data-clear="'+p.kind+'" data-value="'+Store.esc(p.value||"")+'">'+Store.esc(p.label)+' <span>Quitar</span></button>').join("");
    renderCompare();
  }
  function renderCompare(){
    const count=state.compare.size;
    document.body.classList.toggle("compare-open",count>0);
    $("#compare-bar").hidden=count===0;
    $("#compare-count").textContent=count+" "+(count===1?"opción":"opciones");
    $("#compare-chips").innerHTML=[...state.compare].map((id)=>'<span>'+Store.getProduct(id).name+'</span>').join("");
    $("#open-compare").disabled=count<2;
    $("#open-compare").textContent=count<2?'Elige otra opción':'Comparar opciones';
    try{localStorage.setItem("medica-demo-compare",JSON.stringify([...state.compare]))}catch{}
  }
  function syncControls(){
    $$('input[name="category"]').forEach((input)=>input.checked=input.value===state.category);
    $$('input[name="technology"]').forEach((input)=>input.checked=state.technologies.has(input.value));
    $("#favorites-only").checked=state.favoritesOnly;
    $("#search-input").value=state.search;
    $("#sort-select").value=state.sort;
  }
  function reset(){
    state.category="all";state.technologies.clear();state.search="";state.sort="default";state.favoritesOnly=false;
    syncControls();render();history.replaceState(null,"","catalogo.html");
  }
  function closeFilters(){
    $("#filter-panel").classList.remove("open");$("#filter-overlay").classList.remove("visible");
    setTimeout(()=>{if(!$("#filter-panel").classList.contains("open"))$("#filter-overlay").hidden=true},240);
    document.body.classList.remove("locked");
    syncFilterAccessibility();$("#open-filters").focus();
  }
  function openFilters(){
    $("#filter-overlay").hidden=false;requestAnimationFrame(()=>$("#filter-overlay").classList.add("visible"));
    $("#filter-panel").classList.add("open");document.body.classList.add("locked");syncFilterAccessibility();$("#close-filters").focus();
  }
  const smallScreen=matchMedia("(max-width: 800px)");
  function syncFilterAccessibility(){
    const hidden=smallScreen.matches&&!$("#filter-panel").classList.contains("open");
    $("#filter-panel").inert=hidden;
    $("#filter-panel").setAttribute("aria-hidden",String(hidden));
  }
  smallScreen.addEventListener("change",syncFilterAccessibility);
  $("#open-filters").addEventListener("click",openFilters);
  $("#close-filters").addEventListener("click",closeFilters);
  $("#filter-overlay").addEventListener("click",closeFilters);
  $("#clear-filters").addEventListener("click",reset);
  $("#empty-reset").addEventListener("click",reset);
  $("#search-input").addEventListener("input",(event)=>{state.search=event.target.value.trim();render()});
  $("#sort-select").addEventListener("change",(event)=>{state.sort=event.target.value;render()});
  $$('input[name="category"]').forEach((input)=>input.addEventListener("change",()=>{state.category=input.value;render()}));
  $$('input[name="technology"]').forEach((input)=>input.addEventListener("change",()=>{
    state.technologies=new Set($$('input[name="technology"]:checked').map((node)=>node.value));render();
  }));
  $("#favorites-only").addEventListener("change",(event)=>{state.favoritesOnly=event.target.checked;render()});
  document.addEventListener("demo:favoritechange",()=>{if(state.favoritesOnly)render()});
  document.addEventListener("click",(event)=>{
    const compare=event.target.closest("[data-compare]");
    if(compare){
      const id=compare.dataset.compare;
      if(state.compare.has(id))state.compare.delete(id);
      else if(state.compare.size>=3){Store.notify("Puedes comparar hasta tres opciones");return}
      else state.compare.add(id);
      render();return;
    }
    const pill=event.target.closest("[data-clear]");
    if(!pill)return;
    if(pill.dataset.clear==="category")state.category="all";
    if(pill.dataset.clear==="technology")state.technologies.delete(pill.dataset.value);
    if(pill.dataset.clear==="search")state.search="";
    if(pill.dataset.clear==="favorites")state.favoritesOnly=false;
    syncControls();render();
  });
  $("#clear-compare").addEventListener("click",()=>{state.compare.clear();render()});
  $("#open-compare").addEventListener("click",()=>{
    if(state.compare.size<2)return;
    const selected=[...state.compare].map(Store.getProduct);
    const row=(label,value)=>'<tr><th>'+label+'</th>'+selected.map((p)=>'<td>'+value(p)+'</td>').join("")+'</tr>';
    $("#compare-table").innerHTML='<thead><tr><th>Detalle</th>'+selected.map((p)=>'<th>'+p.name+'</th>').join("")+'</tr></thead><tbody>'+
      row("Etapa",(p)=>p.category)+row("Tecnología",(p)=>p.technology)+row("Fotografía",()=>'<span class="muted">Pendiente</span>')+row("Precio",()=>'<span class="muted">Por definir</span>')+'</tbody>';
    $("#compare-dialog").showModal();
  });
  $("#close-compare").addEventListener("click",()=>$("#compare-dialog").close());
  $("#compare-dialog").addEventListener("click",(event)=>{if(event.target===$("#compare-dialog"))$("#compare-dialog").close()});
  document.addEventListener("keydown",(event)=>{
    if(event.key==="Escape"&&$("#filter-panel").classList.contains("open"))closeFilters();
    if(event.key!=="Tab"||!$("#filter-panel").classList.contains("open"))return;
    const focusable=[...$("#filter-panel").querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')].filter((node)=>node.getClientRects().length);
    if(!focusable.length)return;
    if(event.shiftKey&&document.activeElement===focusable[0]){event.preventDefault();focusable[focusable.length-1].focus()}
    if(!event.shiftKey&&document.activeElement===focusable[focusable.length-1]){event.preventDefault();focusable[0].focus()}
  });
  syncFilterAccessibility();syncControls();render();
})();
