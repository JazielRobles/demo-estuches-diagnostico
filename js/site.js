(function(){
  const products=window.DEMO_PRODUCTS||[];
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  const validIds=new Set(products.map((p)=>p.id));
  let cart=Object.fromEntries(Object.entries(read("medica-demo-cart",{})).filter(([id,qty])=>validIds.has(id)&&Number.isInteger(qty)&&qty>0));
  const storedFavorites=read("medica-demo-favorites",[]);
  let favorites=new Set((Array.isArray(storedFavorites)?storedFavorites:[]).filter((id)=>validIds.has(id)));
  let activeDrawer=false;
  let previousFocus=null;
  let toastTimer;
  const page=document.body.dataset.page||"home";
  const getProduct=(id)=>products.find((product)=>product.id===id);
  const esc=(value)=>String(value).replace(/[&<>"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const countCart=()=>Object.values(cart).reduce((sum,qty)=>sum+qty,0);

  function visual(product,extra=""){
    return '<div class="product-art tone-'+product.tone+' '+extra+'"><span class="photo-index">VISTA PREVIA / '+esc(product.id.replace("demo-",""))+'</span><div class="photo-frame"><span>FOTOGRAFÍA</span><strong>DEL PRODUCTO</strong><small>Espacio reservado para la imagen del cliente</small></div><span class="art-note">IMAGEN PENDIENTE</span></div>';
  }
  function card(product,options={}){
    const saved=favorites.has(product.id);
    const comparing=options.compareSet&&options.compareSet.has(product.id);
    return '<article class="product-card" data-id="'+product.id+'">'+
      '<a class="product-card-link" href="producto.html?id='+product.id+'" aria-label="Ver '+product.name+'">'+visual(product)+
      '<div class="product-card-copy"><span class="product-type">'+product.category+' · '+product.technology+'</span><h3>'+product.name+'</h3><p>Información del producto por completar</p><strong>Precio por definir</strong></div></a>'+
      '<div class="product-card-actions"><button class="product-favorite '+(saved?"active":"")+'" type="button" data-favorite="'+product.id+'" aria-label="'+(saved?"Quitar de":"Añadir a")+' favoritos: '+product.name+'" aria-pressed="'+saved+'">'+(saved?'Guardado':'Guardar')+'</button><button class="product-add" type="button" data-add="'+product.id+'">Añadir a mi lista</button>'+(options.compareSet?'<button class="product-compare '+(comparing?"active":"")+'" type="button" data-compare="'+product.id+'" aria-label="'+(comparing?"Quitar de":"Añadir a")+' comparación: '+product.name+'" aria-pressed="'+!!comparing+'">'+(comparing?'Comparando':'Comparar')+'</button>':"")+'</div></article>';
  }
  function renderHeader(){
    const mount=$("#site-header");if(!mount)return;
    const nav=[["home","Inicio","index.html"],["catalog","Catálogo","catalogo.html"],["guide","Guía de compra","guia.html"],["list","Mi selección","lista.html"]];
    mount.innerHTML='<div class="top-strip"><div class="container"><span>EXPERIENCIA DE COMPRA / DEMO</span><span>Estuches de diagnóstico · Próximamente con tu identidad</span></div></div>'+
    '<header class="header"><div class="container header-inner"><a class="brand" href="index.html" aria-label="Ir a inicio"><span class="brand-mark">LOGO<br>AQUÍ</span><span class="brand-name">TU MARCA<small>Equipamiento médico</small></span></a>'+
    '<nav class="main-nav" aria-label="Navegación principal">'+nav.map(([key,label,url])=>'<a href="'+url+'" '+(page===key?'aria-current="page"':'')+'>'+label+'</a>').join("")+'</nav>'+
    '<div class="header-actions"><button type="button" class="header-action" data-open-cart aria-label="Abrir mi lista">Mi lista <span class="cart-count" data-cart-count>0</span></button><button type="button" class="menu-button" id="menu-button" aria-label="Abrir menú" aria-expanded="false">Menú</button></div></div>'+
    '<nav class="mobile-nav" id="mobile-nav" aria-label="Navegación móvil" hidden>'+nav.map(([key,label,url])=>'<a href="'+url+'" '+(page===key?'aria-current="page"':'')+'>'+label+'</a>').join("")+'</nav></header>';
  }
  function renderFooter(){
    const mount=$("#site-footer");if(!mount)return;
    mount.innerHTML='<footer class="footer"><div class="container footer-grid"><div><a class="brand footer-brand" href="index.html"><span class="brand-mark">LOGO<br>AQUÍ</span><span class="brand-name">TU MARCA<small>Equipamiento médico</small></span></a><p>Un espacio diseñado para ayudar a elegir con claridad. La identidad y el catálogo definitivos se integrarán después.</p></div><div><h3>Explorar</h3><a href="catalogo.html">Catálogo</a><a href="guia.html">Guía de compra</a><a href="lista.html">Mi selección</a></div><div><h3>Información</h3><span>Logo pendiente</span><span>Productos pendientes</span><span>Precios por definir</span></div></div><div class="container footer-bottom"><span>© 2026 · Vista previa de diseño</span><span>Contenido de muestra · Sin pagos ni envíos activos</span></div></footer>';
  }
  function renderDrawerShell(){
    document.body.insertAdjacentHTML("beforeend",'<div class="drawer-overlay" id="drawer-overlay" hidden></div><aside class="cart-drawer" id="cart-drawer" aria-label="Mi selección" aria-hidden="true"><div class="drawer-head"><div><span class="eyebrow">TU SELECCIÓN</span><h2>Mi lista <small data-drawer-count>(0)</small></h2></div><button type="button" class="round-button" data-close-cart>Cerrar</button></div><div class="drawer-items" id="drawer-items"></div><div class="drawer-foot"><p>Los precios se mostrarán cuando el cliente entregue el catálogo final.</p><a class="button button-primary full" href="lista.html">Ver mi selección</a><button type="button" class="drawer-link" data-close-cart>Seguir explorando</button></div></aside><div class="toast" id="toast" role="status" aria-live="polite"></div>');
    document.body.insertAdjacentHTML("beforeend",'<div class="scroll-progress" id="scroll-progress" aria-hidden="true"></div><button class="back-to-top" id="back-to-top" type="button" hidden>Volver arriba</button>');
    $("#cart-drawer").inert=true;
  }
  function renderDrawer(){
    const entries=Object.entries(cart).filter(([id,qty])=>qty>0&&getProduct(id));
    $("#drawer-items").innerHTML=entries.length?entries.map(([id,qty])=>{
      const p=getProduct(id);
      return '<div class="drawer-item"><div class="drawer-thumb">'+visual(p)+'</div><div><a href="producto.html?id='+id+'">'+p.name+'</a><span>'+p.category+' · Precio por definir</span><div class="quantity-control"><button type="button" data-qty="'+id+'" data-delta="-1" aria-label="Reducir cantidad de '+p.name+'">−</button><span>'+qty+'</span><button type="button" data-qty="'+id+'" data-delta="1" aria-label="Aumentar cantidad de '+p.name+'">+</button></div></div><button type="button" class="remove-button" data-remove="'+id+'" aria-label="Quitar '+p.name+'">Quitar</button></div>';
    }).join(""):'<div class="drawer-empty"><span class="empty-icon">MI LISTA</span><h3>Tu lista está vacía</h3><p>Agrega opciones desde el catálogo para volver a ellas en cualquier momento.</p><a href="catalogo.html" class="text-link">Explorar catálogo</a></div>';
    $$("[data-cart-count]").forEach((node)=>node.textContent=countCart());
    $$("[data-drawer-count]").forEach((node)=>node.textContent="("+countCart()+")");
    write("medica-demo-cart",cart);
  }
  function notify(message){
    const node=$("#toast");node.textContent=message;node.classList.add("show");
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove("show"),3000);
  }
  function openCart(){
    previousFocus=document.activeElement;
    activeDrawer=true;
    renderDrawer();
    $("#drawer-overlay").hidden=false;
    requestAnimationFrame(()=>$("#drawer-overlay").classList.add("visible"));
    $("#cart-drawer").classList.add("open");
    $("#cart-drawer").setAttribute("aria-hidden","false");
    $("#cart-drawer").inert=false;
    document.body.classList.add("locked");
    $("[data-close-cart]").focus();
  }
  function closeCart(){
    if(!activeDrawer)return;
    activeDrawer=false;
    $("#cart-drawer").classList.remove("open");
    $("#cart-drawer").setAttribute("aria-hidden","true");
    $("#cart-drawer").inert=true;
    $("#drawer-overlay").classList.remove("visible");
    setTimeout(()=>{if(!activeDrawer)$("#drawer-overlay").hidden=true},260);
    document.body.classList.remove("locked");
    if(previousFocus)previousFocus.focus();
  }
  function addToCart(id,qty=1){
    if(!getProduct(id))return;
    cart[id]=(cart[id]||0)+Math.max(1,Number(qty)||1);
    renderDrawer();notify("Añadido a tu selección");
    document.dispatchEvent(new CustomEvent("demo:cartchange"));
  }
  function updateQty(id,delta){
    if(!getProduct(id))return;
    const next=(cart[id]||0)+delta;
    if(next<=0)delete cart[id];else cart[id]=next;
    renderDrawer();document.dispatchEvent(new CustomEvent("demo:cartchange"));
  }
  function removeItem(id){
    delete cart[id];renderDrawer();document.dispatchEvent(new CustomEvent("demo:cartchange"));
  }
  function toggleFavorite(id){
    if(!getProduct(id))return;
    if(favorites.has(id))favorites.delete(id);else favorites.add(id);
    write("medica-demo-favorites",[...favorites]);
    $$('[data-favorite="'+id+'"]').forEach((button)=>{
      const saved=favorites.has(id);
      button.classList.toggle("active",saved);
      button.setAttribute("aria-pressed",String(saved));
      button.setAttribute("aria-label",(saved?"Quitar de":"Añadir a")+" favoritos: "+getProduct(id).name);
      button.textContent=saved?"Guardado":"Guardar";
    });
    notify(favorites.has(id)?"Guardado en favoritos":"Quitado de favoritos");
    document.dispatchEvent(new CustomEvent("demo:favoritechange"));
  }
  async function copySelection(){
    const entries=Object.entries(cart).filter(([id,qty])=>qty>0&&getProduct(id));
    if(!entries.length){notify("Añade una opción antes de copiar la lista");return false}
    const text="Mi selección — vista previa\n"+entries.map(([id,qty])=>"• "+qty+" × "+getProduct(id).name+" ("+id+")").join("\n")+"\n\nProductos y precios finales pendientes de confirmación.";
    try{await navigator.clipboard.writeText(text)}
    catch{
      const area=document.createElement("textarea");area.value=text;area.style.position="fixed";area.style.opacity="0";document.body.append(area);area.select();
      const copied=document.execCommand("copy");area.remove();
      if(!copied){notify("No se pudo copiar la lista");return false}
    }
    notify("Lista copiada al portapapeles");return true;
  }
  function initMotion(){
    if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    if(!("IntersectionObserver" in window))return;
    const observer=new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        if(!entry.isIntersecting)return;
        const target=entry.target;
        target.classList.add("is-visible");
        if(target.animate)target.animate([
          {transform:"translate3d(0,18px,0)"},
          {transform:"translate3d(0,0,0)"}
        ],{duration:680,easing:"cubic-bezier(.2,.7,.2,1)"});
        observer.unobserve(target);
      });
    },{threshold:.08,rootMargin:"0px 0px 30px 0px"});
    $$(".reveal").forEach((node)=>observer.observe(node));
  }
  function initScrollEffects(){
    let scheduled=false;
    const update=()=>{
      const max=document.documentElement.scrollHeight-innerHeight;
      $("#scroll-progress").style.transform="scaleX("+(max>0?scrollY/max:0)+")";
      $(".header").classList.toggle("is-scrolled",scrollY>24);
      $("#back-to-top").hidden=scrollY<540;
      scheduled=false;
    };
    addEventListener("scroll",()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});
    addEventListener("resize",update);
    $("#back-to-top").addEventListener("click",()=>scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));
    update();
  }
  renderHeader();renderFooter();renderDrawerShell();renderDrawer();initMotion();initScrollEffects();
  document.addEventListener("click",(event)=>{
    const add=event.target.closest("[data-add]");if(add){addToCart(add.dataset.add,add.dataset.quantity||1);return}
    const favorite=event.target.closest("[data-favorite]");if(favorite){toggleFavorite(favorite.dataset.favorite);return}
    const qty=event.target.closest("[data-qty]");if(qty){updateQty(qty.dataset.qty,Number(qty.dataset.delta));return}
    const remove=event.target.closest("[data-remove]");if(remove){removeItem(remove.dataset.remove);return}
    if(event.target.closest("[data-open-cart]")){openCart();return}
    if(event.target.closest("[data-close-cart]")){closeCart();return}
  });
  $("#drawer-overlay").addEventListener("click",closeCart);
  $("#menu-button").addEventListener("click",()=>{
    const menu=$("#mobile-nav");menu.hidden=!menu.hidden;
    $("#menu-button").setAttribute("aria-expanded",String(!menu.hidden));
  });
  document.addEventListener("keydown",(event)=>{
    if(event.key==="Escape")closeCart();
    if(event.key!=="Tab"||!activeDrawer)return;
    const focusable=$$('button:not([disabled]),a[href]',$("#cart-drawer")).filter((node)=>node.getClientRects().length);
    if(!focusable.length)return;
    if(event.shiftKey&&document.activeElement===focusable[0]){event.preventDefault();focusable[focusable.length-1].focus()}
    if(!event.shiftKey&&document.activeElement===focusable[focusable.length-1]){event.preventDefault();focusable[0].focus()}
  });
  window.DemoStore={products,getProduct,visual,card,esc,notify,getCart:()=>({...cart}),getFavorites:()=>new Set(favorites),addToCart,updateQty,removeItem,toggleFavorite,copySelection,renderDrawer};
})();
