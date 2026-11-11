(function(){
  const Store=window.DemoStore;
  function render(){
    const entries=Object.entries(Store.getCart()).filter(([id,qty])=>qty>0&&Store.getProduct(id));
    const count=entries.reduce((sum,[,qty])=>sum+qty,0);
    document.querySelector("#item-count").textContent="("+count+")";
    document.querySelector("#summary-count").textContent=count;
    document.querySelector("#list-items").innerHTML=entries.length?entries.map(([id,qty])=>{
      const p=Store.getProduct(id);
      return '<article class="list-item"><a href="producto.html?id='+id+'" class="list-item-art">'+Store.visual(p)+'</a><div class="list-item-copy"><span>'+p.category+' · '+p.technology+'</span><a href="producto.html?id='+id+'"><h3>'+p.name+'</h3></a><p>Precio por definir</p><div class="list-item-actions"><div class="quantity-control"><button type="button" data-qty="'+id+'" data-delta="-1" aria-label="Reducir cantidad de '+p.name+'">−</button><span>'+qty+'</span><button type="button" data-qty="'+id+'" data-delta="1" aria-label="Aumentar cantidad de '+p.name+'">+</button></div><button type="button" class="remove-link" data-remove="'+id+'">Quitar</button></div></div></article>';
    }).join(""):'<div class="list-empty"><div class="empty-decoration">TU LISTA<br>COMIENZA AQUÍ</div><h3>Tu lista espera por ti.</h3><p>Explora el catálogo y agrega las opciones que quieras tener cerca.</p><a href="catalogo.html" class="button button-primary">Ir al catálogo</a></div>';
  }
  document.querySelector("#suggested-products").innerHTML=Store.products.slice(3,6).map(Store.card).join("");
  document.querySelector("#copy-selection").addEventListener("click",Store.copySelection);
  document.addEventListener("demo:cartchange",render);
  render();
})();
