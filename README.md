# Tienda médica — vista previa multipágina

Demo de una tienda de estuches de diagnóstico, diseñada para mostrar una experiencia completa antes de recibir la identidad y el catálogo del cliente.

## Páginas

- `index.html`: portada, categorías y selección destacada.
- `catalogo.html`: búsqueda, filtros, favoritos y comparación.
- `producto.html?id=demo-01`: ficha de producto con galería de muestra, cantidad y detalles.
- `guia.html`: guía con selector interactivo y preguntas frecuentes.
- `lista.html`: selección persistente, edición de cantidades y copia al portapapeles.

Los estilos comunes están en `css/base.css`, la dirección visual azul en `css/refresh.css` y los movimientos en `css/motion.css`. Cada página carga además su CSS y JavaScript específicos. Los datos de muestra están en `js/data.js`; las funciones compartidas y los efectos al desplazarse están en `js/site.js` y `js/motion.js`. No se usan librerías de interfaz.

Las tarjetas permanecen visibles aunque una animación no se ejecute; los movimientos respetan la preferencia del sistema de reducir movimiento y los fondos animados de las tarjetas se pausan fuera de pantalla.

La tipografía combina Plus Jakarta Sans para lectura y controles con DM Serif Display para titulares. Los efectos de cursor se limitan a dispositivos con mouse y se actualizan en intervalos cortos.

## Contenido pendiente

Logo, productos, fotografías, descripciones, precios, disponibilidad y contacto deben sustituirse con los materiales aprobados por el cliente. Los registros `demo-01` a `demo-08` son únicamente muestras de interfaz. Esta versión no procesa pagos ni envía pedidos.

Abrir `index.html` en el navegador para revisión local.

Demo pública: https://jazielrobles.github.io/demo-estuches-diagnostico/
