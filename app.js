// Replace these clearly marked sample records when the client provides the catalog.
const sampleProducts = [
  {id:"DEMO-01",name:"Producto de muestra 01",category:"Estudiantes",technology:"LED",tone:"sage"},
  {id:"DEMO-02",name:"Producto de muestra 02",category:"Estudiantes",technology:"Halógeno",tone:"blue"},
  {id:"DEMO-03",name:"Producto de muestra 03",category:"Profesionales",technology:"LED",tone:"sand"},
  {id:"DEMO-04",name:"Producto de muestra 04",category:"Profesionales",technology:"Halógeno",tone:"lavender"},
  {id:"DEMO-05",name:"Producto de muestra 05",category:"Estudiantes",technology:"LED",tone:"ice"},
  {id:"DEMO-06",name:"Producto de muestra 06",category:"Profesionales",technology:"LED",tone:"mint"}
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const icon = (name) => '<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"/></svg>';
const esc = (value) => String(value).replace(/[&<>"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const normalize = (value) => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const productById = (id) => sampleProducts.find((product)=>product.id===id);
const storage = {
  read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}},
  write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
};
const storedCart = storage.read("dx-demo-cart",{});
const state = {
  category:"all",technology:new Set(),search:"",sort:"default",onlyFavorites:false,
  favorites:new Set(storage.read("dx-demo-favorites",[]).filter((id)=>productById(id))),
  compare:new Set(storage.read("dx-demo-compare",[]).filter((id)=>productById(id)).slice(0,3)),
  cart:Object.fromEntries(Object.entries(storedCart).filter(([id,qty])=>productById(id)&&Number.isInteger(qty)&&qty>0))
};
let activePanel=null;
let previousFocus=null;
let toastTimer=null;
const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function notify(message){
  const node=$("#toast");
  node.textContent=message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>node.classList.remove("show"),3000);
}

function filteredProducts(){
  const list=sampleProducts.filter((product)=>{
    const text=normalize(product.name+" "+product.id+" "+product.category+" "+product.technology);
    return (state.category==="all"||product.category===state.category)
      && (!state.technology.size||state.technology.has(product.technology))
      && (!state.search||text.includes(normalize(state.search)))
      && (!state.onlyFavorites||state.favorites.has(product.id));
  });
  if(state.sort==="az")list.sort((a,b)=>a.name.localeCompare(b.name,"es"));
  if(state.sort==="za")list.sort((a,b)=>b.name.localeCompare(a.name,"es"));
  return list;
}

function renderCatalog(){
  const list=filteredProducts();
  $("#result-label").textContent="Mostrando "+list.length+" de "+sampleProducts.length+" elementos";
  $("#empty-state").hidden=list.length>0;
  $("#product-grid").innerHTML=list.map((p)=>`
    <article class="product-card" data-id="${p.id}">
      <div class="product-art" data-tone="${p.tone}">
        <span class="art-corner">${p.id}</span>
        <span class="art-symbol">${icon("image")}</span>
        <span class="art-label">IMAGEN PENDIENTE</span>
        <button type="button" class="art-view" data-view="${p.id}" aria-label="Ver detalle de ${p.name}">${icon("eye")}</button>
      </div>
      <div class="product-info">
        <div class="product-meta"><span>${p.category.toUpperCase()}</span><span>${p.technology}</span></div>
        <h3>${p.name}</h3><p>Nombre y detalles editables</p>
        <div class="product-price"><span>PRECIO PENDIENTE</span><button type="button" class="${state.favorites.has(p.id)?"active":""}" data-favorite="${p.id}" aria-label="${state.favorites.has(p.id)?"Quitar de":"Añadir a"} favoritos: ${p.name}" aria-pressed="${state.favorites.has(p.id)}">${icon("heart")}</button></div>
        <div class="product-actions"><button type="button" class="product-add" data-add="${p.id}">Añadir a mi lista ${icon("arrow")}</button><button type="button" class="product-compare ${state.compare.has(p.id)?"active":""}" data-compare="${p.id}" aria-label="${state.compare.has(p.id)?"Quitar de":"Añadir a"} comparación: ${p.name}" aria-pressed="${state.compare.has(p.id)}">${icon("compare")}</button></div>
      </div>
    </article>`).join("");
  renderFilterPills();
  updateHeader();
}

function renderFilterPills(){
  const pills=[];
  if(state.category!=="all")pills.push({kind:"category",label:state.category});
  state.technology.forEach((value)=>pills.push({kind:"technology",label:value,value}));
  if(state.search)pills.push({kind:"search",label:'Buscar: "'+state.search+'"'});
  if(state.onlyFavorites)pills.push({kind:"favorites",label:"Favoritos"});
  $("#active-filters").innerHTML=pills.map((pill)=>'<button type="button" data-clear="'+pill.kind+'" data-value="'+esc(pill.value||"")+'">'+esc(pill.label)+" "+icon("close")+"</button>").join("");
}

function updateHeader(){
  const favorites=state.favorites.size;
  $("#favorites-count").textContent=favorites;
  $("#favorites-count").hidden=favorites===0;
  $("#favorites-trigger").classList.toggle("active",state.onlyFavorites);
  $("#favorites-trigger").setAttribute("aria-pressed",String(state.onlyFavorites));
  const count=Object.values(state.cart).reduce((sum,qty)=>sum+qty,0);
  $("#cart-count").textContent=count;
  $("#drawer-count").textContent="("+count+")";
}

function setCategory(category){
  state.category=category;
  $$('input[name="category"]').forEach((input)=>input.checked=input.value===category);
  renderCatalog();
}

function resetFilters(){
  state.category="all";state.technology.clear();state.search="";state.sort="default";state.onlyFavorites=false;
  $$('input[name="category"]').forEach((input)=>input.checked=input.value==="all");
  $$('input[name="technology"]').forEach((input)=>input.checked=false);
  $("#search-input").value="";$("#sort-select").value="default";
  renderCatalog();
}

function renderCart(){
  const selected=Object.entries(state.cart).filter(([id,qty])=>qty>0&&productById(id));
  $("#cart-items").innerHTML=selected.length?selected.map(([id,qty])=>{
    const p=productById(id);
    return `<div class="cart-item"><div class="cart-art">${icon("image")}</div><div><h3>${p.name}</h3><p>${p.id} · Precio pendiente</p><div class="cart-item-row"><div class="qty-control"><button type="button" data-qty="${id}" data-delta="-1" aria-label="Reducir cantidad de ${p.name}">−</button><span>${qty}</span><button type="button" data-qty="${id}" data-delta="1" aria-label="Aumentar cantidad de ${p.name}">+</button></div><button type="button" class="remove-item" data-remove-item="${id}" aria-label="Quitar ${p.name}">${icon("trash")}</button></div></div></div>`;
  }).join(""):'<div class="cart-empty">'+icon("bag")+'<h3>Tu lista está vacía</h3><p>Guarda las opciones que te interesen y vuelve a ellas cuando quieras.</p></div>';
  storage.write("dx-demo-cart",state.cart);
  updateHeader();
}

function addToCart(id){
  const product=productById(id);if(!product)return;
  state.cart[id]=(state.cart[id]||0)+1;
  renderCart();notify(product.name+" añadido a tu lista");
}
function changeQuantity(id,delta){
  if(!productById(id))return;
  const next=(state.cart[id]||0)+delta;
  if(next<=0)delete state.cart[id];else state.cart[id]=next;
  renderCart();
}
function toggleFavorite(id){
  if(!productById(id))return;
  if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);
  storage.write("dx-demo-favorites",[...state.favorites]);
  renderCatalog();
  notify(state.favorites.has(id)?"Guardado en favoritos":"Quitado de favoritos");
}
function toggleCompare(id){
  if(!productById(id))return;
  if(state.compare.has(id))state.compare.delete(id);
  else if(state.compare.size>=3){notify("Puedes comparar hasta 3 opciones");return}
  else state.compare.add(id);
  storage.write("dx-demo-compare",[...state.compare]);
  renderCatalog();renderCompareTray();
}
function renderCompareTray(){
  const count=state.compare.size;
  $("#compare-tray").hidden=count===0;
  $("#compare-count").textContent=count+" "+(count===1?"opción seleccionada":"opciones seleccionadas");
  $("#compare-mini-list").innerHTML=[...state.compare].map((id)=>'<span title="'+esc(productById(id).name)+'">'+id.slice(-2)+'</span>').join("");
  $("#open-compare").disabled=count<2;
  $("#open-compare").innerHTML=count<2?"Elige otra opción "+icon("plus"):"Comparar "+icon("arrow");
}

function showOverlay(){
  const overlay=$("#overlay");
  overlay.hidden=false;
  requestAnimationFrame(()=>overlay.classList.add("visible"));
  document.body.classList.add("locked");
}
function hideOverlay(){
  const overlay=$("#overlay");
  overlay.classList.remove("visible");
  setTimeout(()=>{if(!overlay.classList.contains("visible"))overlay.hidden=true},270);
  document.body.classList.remove("locked");
}
function closePanel(restore=true){
  if(activePanel){
    activePanel.classList.remove("open");
    if(activePanel.hasAttribute("aria-hidden"))activePanel.setAttribute("aria-hidden","true");
  }
  activePanel=null;hideOverlay();
  if(restore&&previousFocus){previousFocus.focus();previousFocus=null}
}
function openPanel(panel,focusTarget){
  if(activePanel)closePanel(false);
  previousFocus=document.activeElement;
  activePanel=panel;
  showOverlay();
  panel.classList.add("open");
  if(panel.hasAttribute("aria-hidden"))panel.setAttribute("aria-hidden","false");
  focusTarget.focus();
}

function showProduct(id){
  const p=productById(id);if(!p)return;
  $("#modal-content").innerHTML=`<div class="modal-grid"><div class="modal-art"><div class="hero-placeholder"><span class="placeholder-symbol">${icon("image")}</span><strong>Imagen pendiente</strong><small>Espacio reservado para ${p.name}</small></div></div><div class="modal-details"><span class="overline">${p.category.toUpperCase()} / ${p.id}</span><h2 id="modal-title">${p.name}</h2><p>Esta ficha de muestra enseña cómo se presentará la información definitiva del producto.</p><ul class="modal-placeholder-list"><li>${icon("image")} Imagen principal <small>POR AGREGAR</small></li><li>${icon("layers")} Descripción y características <small>POR AGREGAR</small></li><li>${icon("bag")} Precio y disponibilidad <small>POR AGREGAR</small></li></ul><button class="button button-dark full" type="button" data-add="${p.id}">Añadir a mi lista ${icon("arrow")}</button></div></div>`;
  openPanel($("#product-modal"),$("#close-modal"));
}

function showComparison(){
  if(state.compare.size<2){notify("Selecciona al menos 2 opciones");return}
  const list=[...state.compare].map(productById);
  const row=(label,render)=>'<tr><td>'+label+'</td>'+list.map((p)=>'<td>'+render(p)+'</td>').join("")+'</tr>';
  $("#compare-content").innerHTML=`<span class="overline">VISTA COMPARATIVA</span><h2 id="compare-title">Compara tus opciones.</h2><p>Estos datos son de demostración; las fichas reales se agregarán con el catálogo del cliente.</p><div class="compare-table-wrap"><table class="compare-table"><thead><tr><th>Detalle</th>${list.map((p)=>'<th>'+p.name+'</th>').join("")}</tr></thead><tbody>${row("Uso",(p)=>p.category)}${row("Tecnología",(p)=>p.technology)}${row("Imagen",()=>'<span class="pending">Pendiente</span>')}${row("Precio",()=>'<span class="pending">Pendiente</span>')}</tbody></table></div>`;
  openPanel($("#compare-modal"),$("#close-compare"));
}

async function copyList(){
  const selected=Object.entries(state.cart).filter(([id,qty])=>qty>0&&productById(id));
  if(!selected.length){notify("Agrega una opción antes de copiar la lista");return}
  const text="Lista de interés — vista previa\n"+selected.map(([id,qty])=>"• "+qty+" × "+productById(id).name+" ("+id+")").join("\n")+"\n\nProductos y precios finales pendientes de confirmación.";
  try{await navigator.clipboard.writeText(text)}
  catch{
    const area=document.createElement("textarea");
    area.value=text;area.style.position="fixed";area.style.opacity="0";
    document.body.append(area);area.select();
    const copied=document.execCommand("copy");area.remove();
    if(!copied){notify("No se pudo copiar la lista");return}
  }
  notify("Lista copiada al portapapeles");
}

// Catalog and panel controls
document.addEventListener("click",(event)=>{
  const target=event.target;
  const categoryCard=target.closest("[data-category-card]");
  if(categoryCard){setCategory(categoryCard.dataset.categoryCard);$("#catalogo").scrollIntoView({behavior:reducedMotion?"auto":"smooth"});return}
  const add=target.closest("[data-add]");if(add){addToCart(add.dataset.add);return}
  const view=target.closest("[data-view]");if(view){showProduct(view.dataset.view);return}
  const favorite=target.closest("[data-favorite]");if(favorite){toggleFavorite(favorite.dataset.favorite);return}
  const compare=target.closest("[data-compare]");if(compare){toggleCompare(compare.dataset.compare);return}
  const qty=target.closest("[data-qty]");if(qty){changeQuantity(qty.dataset.qty,Number(qty.dataset.delta));return}
  const remove=target.closest("[data-remove-item]");if(remove){delete state.cart[remove.dataset.removeItem];renderCart();return}
  const pill=target.closest("[data-clear]");
  if(pill){
    if(pill.dataset.clear==="category")state.category="all";
    if(pill.dataset.clear==="technology")state.technology.delete(pill.dataset.value);
    if(pill.dataset.clear==="search"){state.search="";$("#search-input").value=""}
    if(pill.dataset.clear==="favorites")state.onlyFavorites=false;
    $$('input[name="category"]').forEach((input)=>input.checked=input.value===state.category);
    $$('input[name="technology"]').forEach((input)=>input.checked=state.technology.has(input.value));
    renderCatalog();return;
  }
});
$("#open-cart").addEventListener("click",()=>{renderCart();openPanel($("#cart-drawer"),$("#close-cart"))});
$("#close-cart").addEventListener("click",()=>closePanel());
$("#continue-shopping").addEventListener("click",()=>closePanel());
$("#close-modal").addEventListener("click",()=>closePanel());
$("#close-compare").addEventListener("click",()=>closePanel());
$("#overlay").addEventListener("click",()=>closePanel());
$("#open-filters").addEventListener("click",()=>openPanel($("#filter-panel"),$("#close-filters")));
$("#close-filters").addEventListener("click",()=>closePanel());
$("#open-compare").addEventListener("click",showComparison);
$("#clear-compare").addEventListener("click",()=>{state.compare.clear();storage.write("dx-demo-compare",[]);renderCatalog();renderCompareTray()});
$("#copy-list").addEventListener("click",copyList);
$("#reset-filters").addEventListener("click",resetFilters);
$("#empty-reset").addEventListener("click",resetFilters);
$("#favorites-trigger").addEventListener("click",()=>{
  state.onlyFavorites=!state.onlyFavorites;renderCatalog();
  $("#catalogo").scrollIntoView({behavior:reducedMotion?"auto":"smooth"});
});
$("#search-input").addEventListener("input",(event)=>{state.search=event.target.value.trim();renderCatalog()});
$("#sort-select").addEventListener("change",(event)=>{state.sort=event.target.value;renderCatalog()});
$$('input[name="category"]').forEach((input)=>input.addEventListener("change",()=>setCategory(input.value)));
$$('input[name="technology"]').forEach((input)=>input.addEventListener("change",()=>{
  state.technology=new Set($$('input[name="technology"]:checked').map((checked)=>checked.value));
  renderCatalog();
}));
$("#mobile-menu-button").addEventListener("click",()=>{
  const menu=$("#mobile-nav");menu.hidden=!menu.hidden;
  $("#mobile-menu-button").setAttribute("aria-expanded",String(!menu.hidden));
});
$$(".mobile-nav a").forEach((link)=>link.addEventListener("click",()=>{
  $("#mobile-nav").hidden=true;$("#mobile-menu-button").setAttribute("aria-expanded","false");
}));
document.addEventListener("keydown",(event)=>{
  if(event.key==="Escape"&&activePanel)closePanel();
  if(event.key!=="Tab"||!activePanel)return;
  const focusable=$$('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])').filter((node)=>activePanel.contains(node)&&node.getClientRects().length);
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
});

// Motion details remain decorative and respect reduced-motion settings.
if(!reducedMotion){
  document.documentElement.classList.add("js-motion");
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add("in-view");observer.unobserve(entry.target)}});
    },{threshold:.08,rootMargin:"0px 0px 50px 0px"});
    $$(".reveal").forEach((node)=>observer.observe(node));
  }else $$(".reveal").forEach((node)=>node.classList.add("in-view"));
  const showcase=$("#hero-showcase");
  showcase.addEventListener("pointermove",(event)=>{
    if(event.pointerType==="touch")return;
    const rect=showcase.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
    showcase.style.setProperty("--glow-x",Math.round(x*100)+"%");
    showcase.style.setProperty("--glow-y",Math.round(y*100)+"%");
    showcase.style.transform="perspective(1000px) rotateX("+((.5-y)*4)+"deg) rotateY("+((x-.5)*4)+"deg)";
  });
  showcase.addEventListener("pointerleave",()=>showcase.style.transform="");
  $("#product-grid").addEventListener("pointermove",(event)=>{
    if(event.pointerType==="touch")return;
    const card=event.target.closest(".product-card");if(!card)return;
    const rect=card.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
    card.style.setProperty("--rx",((.5-y)*3)+"deg");card.style.setProperty("--ry",((x-.5)*3)+"deg");
  });
  $("#product-grid").addEventListener("pointerout",(event)=>{
    const card=event.target.closest(".product-card");
    if(card&&!card.contains(event.relatedTarget)){card.style.removeProperty("--rx");card.style.removeProperty("--ry")}
  });
}

renderCatalog();
renderCart();
renderCompareTray();
