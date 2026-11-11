const products = [
  {id:"WA95001",name:"Estuche de diagnóstico Pocket Jr 2.5V",short:"Pocket Jr 2.5V",category:"Estudiantes",technology:"Halógeno",price:5090,oldPrice:5790,image:"pocket-jr.png",color:"Negro",description:"Un equipo compacto y ligero para comenzar a explorar con seguridad.",features:["Otoscopio y oftalmoscopio Pocket Jr","Dos mangos incluidos","Estuche suave para transportarlo"]},
  {id:"WA92871BLK",name:"Estuche de diagnóstico Pocket LED Onix",short:"Pocket LED Onix",category:"Estudiantes",technology:"LED",price:5390,oldPrice:6290,image:"pocket-onix.png",color:"Onix",description:"Instrumentos de bolsillo con iluminación LED para acompañarte desde la formación hasta la consulta.",features:["Iluminación LED SureColor","Otoscopio y oftalmoscopio de bolsillo","Mangos, espéculos y estuche suave"]},
  {id:"WA92871PUR",name:"Estuche de diagnóstico Pocket LED Violeta",short:"Pocket LED Violeta",category:"Estudiantes",technology:"LED",price:5390,oldPrice:6290,image:"pocket-violeta.png",color:"Violeta",description:"La practicidad de la línea Pocket LED en una variante con personalidad.",features:["Iluminación LED","Otoscopio y oftalmoscopio","Mangos y estuche suave"]},
  {id:"WA92871WHI",name:"Estuche de diagnóstico Pocket LED Nieve",short:"Pocket LED Nieve",category:"Estudiantes",technology:"LED",price:5390,oldPrice:6290,image:"pocket-blanco.png",color:"Nieve",description:"Diseño compacto y luz LED para una exploración cómoda y precisa.",features:["Iluminación LED","Formato ligero y portátil","Estuche suave incluido"]},
  {id:"WA92871BLU",name:"Estuche de diagnóstico Pocket LED Azul",short:"Pocket LED Azul",category:"Estudiantes",technology:"LED",price:5390,oldPrice:6290,image:"pocket-azul.png",color:"Azul",description:"Una opción portátil para llevar tus instrumentos esenciales a todas partes.",features:["Iluminación LED","Otoscopio y oftalmoscopio","Mangos y estuche suave"]},
  {id:"WA92880BLK",name:"Estuche de diagnóstico Pocket LED Plus Onix",short:"Pocket LED Plus Onix",category:"Estudiantes",technology:"LED",price:6490,oldPrice:7390,image:"plus-onix.png",color:"Onix",description:"La línea Pocket LED Plus para quienes buscan ampliar su equipo de exploración.",features:["Tecnología LED","Otoscopio y oftalmoscopio","Estuche de transporte"]},
  {id:"WA92880PUR",name:"Estuche de diagnóstico Pocket LED Plus Violeta",short:"Pocket LED Plus Violeta",category:"Estudiantes",technology:"LED",price:6490,oldPrice:7390,image:"plus-violeta.png",color:"Violeta",description:"Un kit de bolsillo versátil con acabado violeta.",features:["Tecnología LED","Diseño de bolsillo","Estuche de transporte"]},
  {id:"WA92880BLU",name:"Estuche de diagnóstico Pocket LED Plus Azul",short:"Pocket LED Plus Azul",category:"Estudiantes",technology:"LED",price:6490,oldPrice:7390,image:"plus-azul.png",color:"Azul",description:"Diseñado para acompañarte en exploraciones frecuentes.",features:["Tecnología LED","Otoscopio y oftalmoscopio","Estuche de transporte"]},
  {id:"WA97200-MC",name:"MacroView con oftalmoscopio Coaxial y estuche",short:"MacroView + Coaxial",category:"Profesionales",technology:"Halógeno",price:17190,oldPrice:null,image:"macroview.png",color:"Negro",description:"Una combinación profesional de otoscopio MacroView y oftalmoscopio Coaxial.",features:["Otoscopio MacroView","Oftalmoscopio Coaxial","Mango recargable y estuche rígido"]},
  {id:"WA97200-C",name:"Estuche recargable de Halógeno 3.5V",short:"Recargable Halógeno 3.5V",category:"Profesionales",technology:"Halógeno",price:7690,oldPrice:9090,image:"recargable.png",color:"Negro",description:"Un sistema recargable para el uso continuo en la práctica clínica.",features:["Iluminación halógena 3.5V","Mango recargable","Estuche rígido"]},
  {id:"WA97200-CL",name:"Estuche de diagnóstico recargable LED 3.5V",short:"Recargable LED 3.5V",category:"Profesionales",technology:"LED",price:9690,oldPrice:11590,image:"halogeno.png",color:"Negro",description:"Equipo profesional recargable con tecnología LED.",features:["Iluminación LED 3.5V","Sistema recargable","Estuche de transporte"]},
  {id:"WA97210-C",name:"Estuche recargable con iluminador nasal 3.5V",short:"Recargable + iluminador nasal",category:"Profesionales",technology:"Halógeno",price:9590,oldPrice:11490,image:"nasal.png",color:"Negro",description:"Un equipo de exploración más completo para consulta profesional.",features:["Iluminación halógena 3.5V","Iluminador nasal incluido","Sistema recargable"]}
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const money = (value) => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0}).format(value);
const icon = (name) => '<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"/></svg>';
const image = (product) => "assets/" + product.image;
const escapeHTML = (value) => String(value).replace(/[&<>"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const store = {
  read(key,fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}},
  write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
};
const state = {category:"all",search:"",technology:new Set(),maxPrice:25000,saleOnly:false,sort:"featured",favorites:new Set(store.read("pulso-favorites",[])),cart:store.read("pulso-cart",{})};
let lastFocused = null;
let toastTimer;
const normalize = (value) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const productById = (id) => products.find((item) => item.id === id);
const cartQuantity = () => Object.values(state.cart).reduce((total,quantity) => total + quantity,0);

function renderProducts(){
  let list = products.filter((p) => {
    const text = normalize(p.name+" "+p.id+" "+p.color+" "+p.technology);
    return (state.category==="all" || p.category===state.category)
      && (!state.search || text.includes(normalize(state.search)))
      && (!state.technology.size || state.technology.has(p.technology))
      && p.price <= state.maxPrice
      && (!state.saleOnly || !!p.oldPrice);
  });
  if(state.sort==="price-asc") list.sort((a,b)=>a.price-b.price);
  if(state.sort==="price-desc") list.sort((a,b)=>b.price-a.price);
  if(state.sort==="name") list.sort((a,b)=>a.name.localeCompare(b.name,"es"));
  $("#result-count").textContent = "Mostrando " + list.length + " de " + products.length + " estuches";
  $("#empty-state").hidden = list.length>0;
  $("#product-grid").innerHTML = list.map((p) => `
    <article class="product-card">
      <div class="product-image">
        ${p.oldPrice ? '<span class="product-badge">OFERTA</span>' : '<span class="product-badge new">PROFESIONAL</span>'}
        <button type="button" class="favorite ${state.favorites.has(p.id)?"active":""}" data-favorite="${p.id}" aria-label="${state.favorites.has(p.id)?"Quitar de":"Añadir a"} favoritos: ${p.short}" aria-pressed="${state.favorites.has(p.id)}">${icon("heart")}</button>
        <img src="${image(p)}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-body">
        <div class="product-meta"><span>${p.id}</span><span>${p.technology}</span></div>
        <h3>${p.name}</h3><p class="product-subtitle">${p.category} · ${p.color}</p>
        <div class="price-line"><strong>${money(p.price)}</strong>${p.oldPrice ? "<del>"+money(p.oldPrice)+"</del>" : ""}</div>
        <div class="product-actions"><button class="add-button" type="button" data-add="${p.id}">Añadir a selección ${icon("arrow")}</button><button class="quick-view" type="button" data-view="${p.id}" aria-label="Ver detalles de ${p.short}">${icon("eye")}</button></div>
      </div>
    </article>`).join("");
  renderFilterPills();
}

function renderFilterPills(){
  const pills=[];
  if(state.category!=="all") pills.push({label:state.category,kind:"category"});
  if(state.search) pills.push({label:'Buscar: "'+state.search+'"',kind:"search"});
  state.technology.forEach((value)=>pills.push({label:value,kind:"technology",value}));
  if(state.maxPrice<25000) pills.push({label:"Hasta "+money(state.maxPrice),kind:"price"});
  if(state.saleOnly) pills.push({label:"Ofertas",kind:"sale"});
  $("#active-filters").innerHTML=pills.map((pill)=>'<button type="button" data-remove-filter="'+pill.kind+'" data-value="'+escapeHTML(pill.value||"")+'">'+escapeHTML(pill.label)+" "+icon("close")+"</button>").join("");
}
function setCategory(category){
  state.category=category;
  $$(".category-tab").forEach((tab)=>{const active=tab.dataset.category===category;tab.classList.toggle("active",active);tab.setAttribute("aria-selected",String(active))});
  renderProducts();
}
function resetFilters(){
  state.search="";state.technology.clear();state.maxPrice=25000;state.saleOnly=false;state.sort="featured";
  $("#search-input").value="";$("#price-range").value="25000";$("#price-display").textContent=money(25000);$("#sale-only").checked=false;$("#sort-select").value="featured";
  $$('input[name="technology"]').forEach((input)=>input.checked=false);
  setCategory("all");
}
function toast(message){
  const node=$("#toast");node.textContent=message;node.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove("show"),2800);
}
function refreshCart(){
  const count=cartQuantity();
  $("#cart-count").textContent=count;$("#drawer-count").textContent="("+count+")";
  const selected=Object.entries(state.cart).filter(([id,qty])=>qty>0 && productById(id));
  $("#cart-items").innerHTML=selected.length ? selected.map(([id,qty])=>{
    const p=productById(id);
    return `<div class="cart-item"><img src="${image(p)}" alt=""><div><h3>${p.name}</h3><p>${p.id} · ${p.technology}</p><strong>${money(p.price*qty)}</strong><div class="cart-item-bottom"><div class="qty-control"><button type="button" data-quantity="${id}" data-delta="-1" aria-label="Reducir cantidad de ${p.short}">−</button><span>${qty}</span><button type="button" data-quantity="${id}" data-delta="1" aria-label="Aumentar cantidad de ${p.short}">+</button></div><button type="button" class="remove-item" data-remove-item="${id}" aria-label="Quitar ${p.short}">${icon("trash")}</button></div></div></div>`;
  }).join("") : '<div class="cart-empty">'+icon("bag")+'<h3>Tu selección está vacía</h3><p>Agrega los estuches que te interesan y prepara una solicitud en un solo mensaje.</p></div>';
  const total=selected.reduce((sum,[id,qty])=>sum+productById(id).price*qty,0);
  $("#cart-subtotal").textContent=money(total);
  store.write("pulso-cart",state.cart);
}
function addToCart(id){
  const p=productById(id);if(!p)return;
  state.cart[id]=(state.cart[id]||0)+1;refreshCart();toast(p.short+" añadido a tu selección");
}
function changeQuantity(id,delta){
  if(!productById(id))return;
  state.cart[id]=Math.max(0,(state.cart[id]||0)+delta);
  if(!state.cart[id])delete state.cart[id];
  refreshCart();
}
function showOverlay(){const overlay=$("#overlay");overlay.hidden=false;requestAnimationFrame(()=>overlay.classList.add("visible"));document.body.classList.add("locked")}
function hideOverlay(){const overlay=$("#overlay");overlay.classList.remove("visible");setTimeout(()=>{if(!overlay.classList.contains("visible"))overlay.hidden=true},250);document.body.classList.remove("locked")}
function closePanels(){
  $("#cart-drawer").classList.remove("open");$("#cart-drawer").setAttribute("aria-hidden","true");
  $("#product-modal").classList.remove("open");$("#product-modal").setAttribute("aria-hidden","true");
  $("#filters").classList.remove("open");hideOverlay();
  if(lastFocused){lastFocused.focus();lastFocused=null}
}
function openCart(){
  lastFocused=document.activeElement;closePanels();lastFocused=document.activeElement;
  showOverlay();$("#cart-drawer").classList.add("open");$("#cart-drawer").setAttribute("aria-hidden","false");$("#close-cart").focus();
}
function openModal(id){
  const p=productById(id);if(!p)return;
  lastFocused=document.activeElement;closePanels();lastFocused=document.activeElement;
  $("#modal-content").innerHTML=`<div class="modal-grid"><div class="modal-image"><img src="${image(p)}" alt="${p.name}"></div><div class="modal-details"><div class="product-meta"><span>${p.id}</span><span>${p.technology} · ${p.category}</span></div><h2 id="modal-title">${p.name}</h2><p>${p.description}</p><div class="price-line"><strong>${money(p.price)}</strong>${p.oldPrice?"<del>"+money(p.oldPrice)+"</del>":""}</div><ul>${p.features.map((feature)=>"<li>"+icon("check")+feature+"</li>").join("")}</ul><button type="button" class="button button-primary full" data-add="${p.id}">Añadir a selección ${icon("arrow")}</button></div></div>`;
  showOverlay();$("#product-modal").classList.add("open");$("#product-modal").setAttribute("aria-hidden","false");$("#close-modal").focus();
}
function openFilters(){lastFocused=document.activeElement;showOverlay();$("#filters").classList.add("open");$("#filters-close").focus()}
async function requestQuote(){
  const selected=Object.entries(state.cart).filter(([id,qty])=>qty>0 && productById(id));
  if(!selected.length){toast("Agrega un estuche antes de preparar la solicitud");return}
  const message="Hola, me interesan estos estuches de diagnóstico:\n"+selected.map(([id,qty])=>"• "+qty+" × "+productById(id).name+" ("+id+")").join("\n")+"\n\n¿Me pueden confirmar precio y disponibilidad?";
  try{
    await navigator.clipboard.writeText(message);
  }catch{
    const area=document.createElement("textarea");area.value=message;area.style.position="fixed";area.style.opacity="0";document.body.append(area);area.select();
    const copied=document.execCommand("copy");area.remove();
    if(!copied){toast("No se pudo copiar la solicitud");return}
  }
  toast("Solicitud copiada. Compártela con tu asesor.");
}

document.addEventListener("click",(event)=>{
  const add=event.target.closest("[data-add]");if(add){addToCart(add.dataset.add);return}
  const view=event.target.closest("[data-view]");if(view){openModal(view.dataset.view);return}
  const favorite=event.target.closest("[data-favorite]");if(favorite){const id=favorite.dataset.favorite;if(state.favorites.has(id))state.favorites.delete(id);else state.favorites.add(id);store.write("pulso-favorites",[...state.favorites]);renderProducts();toast(state.favorites.has(id)?"Guardado en favoritos":"Eliminado de favoritos");return}
  const qty=event.target.closest("[data-quantity]");if(qty){changeQuantity(qty.dataset.quantity,Number(qty.dataset.delta));return}
  const remove=event.target.closest("[data-remove-item]");if(remove){delete state.cart[remove.dataset.removeItem];refreshCart();return}
  const filter=event.target.closest("[data-remove-filter]");if(filter){const kind=filter.dataset.removeFilter;if(kind==="category")setCategory("all");if(kind==="search"){state.search="";$("#search-input").value=""}if(kind==="technology"){$$('input[name="technology"]').find((i)=>i.value===filter.dataset.value).checked=false;state.technology.delete(filter.dataset.value)}if(kind==="price"){state.maxPrice=25000;$("#price-range").value="25000";$("#price-display").textContent=money(25000)}if(kind==="sale"){state.saleOnly=false;$("#sale-only").checked=false}renderProducts();return}
  const tab=event.target.closest("[data-category]");if(tab){setCategory(tab.dataset.category);return}
  const guide=event.target.closest("[data-guide]");if(guide){setCategory(guide.dataset.guide);$("#catalogo").scrollIntoView({behavior:"smooth"});return}
});
$("#open-cart").addEventListener("click",openCart);
$("#close-cart").addEventListener("click",closePanels);
$("#continue-shopping").addEventListener("click",closePanels);
$("#close-modal").addEventListener("click",closePanels);
$("#overlay").addEventListener("click",closePanels);
$("#filter-toggle").addEventListener("click",openFilters);
$("#filters-close").addEventListener("click",closePanels);
$("#quote-button").addEventListener("click",requestQuote);
$("#clear-filters").addEventListener("click",resetFilters);
$("#empty-reset").addEventListener("click",resetFilters);
$("#search-input").addEventListener("input",(event)=>{state.search=event.target.value.trim();renderProducts()});
$("#sort-select").addEventListener("change",(event)=>{state.sort=event.target.value;renderProducts()});
$("#price-range").addEventListener("input",(event)=>{state.maxPrice=Number(event.target.value);$("#price-display").textContent=money(state.maxPrice);renderProducts()});
$("#sale-only").addEventListener("change",(event)=>{state.saleOnly=event.target.checked;renderProducts()});
$$('input[name="technology"]').forEach((input)=>input.addEventListener("change",()=>{state.technology=new Set($$('input[name="technology"]:checked').map((item)=>item.value));renderProducts()}));
$("#menu-trigger").addEventListener("click",()=>{const menu=$("#mobile-nav");const open=menu.hidden;menu.hidden=!open;$("#menu-trigger").setAttribute("aria-expanded",String(open))});
$$(".mobile-nav a").forEach((link)=>link.addEventListener("click",()=>{$("#mobile-nav").hidden=true;$("#menu-trigger").setAttribute("aria-expanded","false")}));
document.addEventListener("keydown",(event)=>{if(event.key==="Escape")closePanels()});
renderProducts();refreshCart();
