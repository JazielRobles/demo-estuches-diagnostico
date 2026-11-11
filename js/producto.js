(function(){
  const Store=window.DemoStore;
  const id=new URLSearchParams(location.search).get("id");
  const product=Store.getProduct(id);
  const mount=document.querySelector("#product-content");
  if(!product){
    mount.innerHTML='<section class="not-found"><div class="container"><span class="eyebrow">PRODUCTO NO ENCONTRADO</span><h1>Volvamos al catálogo.</h1><p>El enlace puede haber cambiado o esta ficha aún no está disponible.</p><a class="button button-primary" href="catalogo.html">Explorar catálogo</a></div></section>';
    document.querySelector(".related-section").hidden=true;
    return;
  }
  document.title=product.name+" | Tu marca";
  document.querySelector("#breadcrumb-name").textContent=product.name;
  const galleryTones=[product.tone,"linen","mist"];
  const visual=(tone)=>Store.visual({...product,tone},"detail-art");
  mount.innerHTML='<section class="detail-section"><div class="container detail-grid"><div class="detail-gallery"><div id="main-product-art">'+visual(galleryTones[0])+'</div><div class="gallery-thumbs">'+galleryTones.map((tone,index)=>'<button type="button" data-gallery="'+index+'" class="'+(index===0?"active":"")+'" aria-label="Ver imagen de muestra '+(index+1)+'"><span>FOTO '+(index+1)+'</span></button>').join("")+'</div><span class="gallery-note">Visuales de muestra. Las fotografías del cliente se integrarán aquí.</span></div><div class="detail-info"><span class="eyebrow">'+product.category.toUpperCase()+' / '+product.technology.toUpperCase()+'</span><h1>'+product.name+'</h1><p class="detail-lead">Una ficha clara para conocer cada producto antes de elegir. El nombre, las características y las imágenes finales se completarán con el catálogo del negocio.</p><div class="detail-price"><span>Precio</span><strong>Por definir</strong><small>Disponibilidad pendiente de confirmar</small></div><div class="detail-points"><div><span>DATOS</span> Espacio para características principales</div><div><span>CONTENIDO</span> Espacio para contenido del estuche</div><div><span>USO</span> Espacio para detalles de uso</div></div><div class="purchase-actions"><div class="quantity-control large"><button type="button" id="qty-minus" aria-label="Reducir cantidad">−</button><span id="qty-value">1</span><button type="button" id="qty-plus" aria-label="Aumentar cantidad">+</button></div><button type="button" id="detail-add" class="button button-primary" data-add="'+product.id+'" data-quantity="1">Añadir a mi lista</button><button type="button" class="round-button detail-favorite" data-favorite="'+product.id+'" aria-label="Añadir a favoritos">Guardar</button></div><p class="detail-note">Esta es una demostración. La página no procesa pagos.</p><div class="detail-accordions"><details open><summary>Descripción <span>Ocultar</span><span>Ver más</span></summary><p>El contenido descriptivo final se presentará aquí de forma breve y fácil de recorrer.</p></details><details><summary>Características <span>Ocultar</span><span>Ver más</span></summary><p>Las especificaciones aprobadas por el cliente aparecerán en este apartado.</p></details><details><summary>Disponibilidad <span>Ocultar</span><span>Ver más</span></summary><p>El precio, las existencias y los tiempos se configurarán cuando se reciba la información definitiva.</p></details></div></div></div></section>';
  document.querySelector("#related-products").innerHTML=Store.products.filter((p)=>p.id!==product.id).slice(0,3).map(Store.card).join("");
  let quantity=1;
  function updateQty(){document.querySelector("#qty-value").textContent=quantity;document.querySelector("#detail-add").dataset.quantity=quantity}
  document.querySelector("#qty-minus").addEventListener("click",()=>{quantity=Math.max(1,quantity-1);updateQty()});
  document.querySelector("#qty-plus").addEventListener("click",()=>{quantity=Math.min(99,quantity+1);updateQty()});
  document.querySelectorAll("[data-gallery]").forEach((button)=>button.addEventListener("click",()=>{
    document.querySelector("#main-product-art").innerHTML=visual(galleryTones[Number(button.dataset.gallery)]);
    document.querySelectorAll("[data-gallery]").forEach((node)=>node.classList.toggle("active",node===button));
  }));
  const favorite=document.querySelector(".detail-favorite");
  if(Store.getFavorites().has(product.id)){favorite.classList.add("active");favorite.textContent="Guardado";favorite.setAttribute("aria-pressed","true");favorite.setAttribute("aria-label","Quitar de favoritos")}
  else favorite.setAttribute("aria-pressed","false");
})();
