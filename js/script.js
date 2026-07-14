// Variables Globales
let productosAPI = [];
let carrito = JSON.parse(localStorage.getItem('carrito1337tech')) || [];

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    validarFormulario();
    actualizarUI();
    
    // Event listeners para botones del carrito
    document.getElementById('btn-vaciar-carrito').addEventListener('click', vaciarCarrito);
    document.getElementById('btn-finalizar-compra').addEventListener('click', finalizarCompra);
});

// ==========================================
// FASE 2: FETCH API & RENDERIZADO
// ==========================================
function cargarProductos() {
    fetch('productos.json')
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar los productos');
            return response.json();
        })
        .then(productos => {
            productosAPI = productos; // Guardamos en memoria para usar luego
            renderizarProductos(productos);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            document.getElementById('productos-container').innerHTML = '<p class="text-danger text-center w-100">No se pudieron cargar los productos.</p>';
        });
}

function renderizarProductos(productos) {
    const contenedor = document.getElementById('productos-container');
    contenedor.innerHTML = ''; 

    productos.forEach(producto => {
        const article = document.createElement('article');
        article.classList.add('product-card');
        article.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.titulo}">
            <div class="product-info">
                <h3>${producto.titulo}</h3>
                <p class="price">$${producto.precio.toLocaleString('es-AR')}</p>
                <button class="btn btn-primary" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
            </div>
        `;
        contenedor.appendChild(article);
    });
}

// ==========================================
// FASE 3: LÓGICA DEL CARRITO & LOCALSTORAGE
// ==========================================
window.agregarAlCarrito = function(id) {
    const productoEncontrado = productosAPI.find(prod => prod.id === id);
    if (!productoEncontrado) return;

    // Verificar si ya está en el carrito
    const itemEnCarrito = carrito.find(item => item.id === id);
    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...productoEncontrado, cantidad: 1 });
    }

    guardarStorage();
    actualizarUI();
    
    // Feedback visual opcional (usando el Offcanvas de Bootstrap)
    const offcanvas = new bootstrap.Offcanvas(document.getElementById('carritoOffcanvas'));
    offcanvas.show();
};

window.cambiarCantidad = function(id, delta) {
    const item = carrito.find(prod => prod.id === id);
    if (!item) return;

    item.cantidad += delta;
    if (item.cantidad <= 0) {
        eliminarDelCarrito(id);
    } else {
        guardarStorage();
        actualizarUI();
    }
}

window.eliminarDelCarrito = function(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarStorage();
    actualizarUI();
}

function vaciarCarrito() {
    if(confirm('¿Estás seguro que deseas vaciar el carrito?')) {
        carrito = [];
        guardarStorage();
        actualizarUI();
    }
}

function finalizarCompra() {
    if (carrito.length === 0) {
        alert('El carrito está vacío. ¡Agregá algunos productos primero!');
        return;
    }
    alert('¡Gracias por tu compra en 1337tech! Nos pondremos en contacto a la brevedad.');
    carrito = [];
    guardarStorage();
    actualizarUI();
    
    // Cerrar offcanvas
    const offcanvasEl = document.getElementById('carritoOffcanvas');
    const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    if (offcanvas) offcanvas.hide();
}

function actualizarUI() {
    // 1. Actualizar el numerito (badge)
    const contador = document.getElementById('contador-carrito');
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    contador.innerText = totalItems;

    // 2. Renderizar lista del carrito
    const contenedorCarrito = document.getElementById('carrito-items');
    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = '<p class="text-muted text-center mt-4">El carrito está vacío.</p>';
    } else {
        contenedorCarrito.innerHTML = '';
        carrito.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'border-bottom', 'pb-2', 'mb-2');
            div.innerHTML = `
                <div class="d-flex align-items-center gap-2">
                    <img src="${item.imagen}" alt="${item.titulo}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                    <div>
                        <h6 class="mb-0 text-truncate" style="max-width: 150px;" title="${item.titulo}">${item.titulo}</h6>
                        <small class="text-muted">$${item.precio.toLocaleString('es-AR')}</small>
                    </div>
                </div>
                <div class="d-flex flex-column align-items-end gap-1">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                        <span class="btn btn-outline-secondary disabled">${item.cantidad}</span>
                        <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                    </div>
                    <button class="btn btn-link text-danger p-0" style="font-size: 0.8rem; text-decoration: none;" onclick="eliminarDelCarrito(${item.id})">Eliminar</button>
                </div>
            `;
            contenedorCarrito.appendChild(div);
        });
    }

    // 3. Actualizar el total de dinero
    const spanTotal = document.getElementById('carrito-total');
    const dineroTotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    spanTotal.innerText = `$${dineroTotal.toLocaleString('es-AR')}`;
}

function guardarStorage() {
    localStorage.setItem('carrito1337tech', JSON.stringify(carrito));
}

// ==========================================
// VALIDACIÓN DE FORMULARIO
// ==========================================
function validarFormulario() {
    const form = document.querySelector('.contact-form form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        const nombre = form.querySelector('input[name="nombre"]').value.trim();
        const email = form.querySelector('input[name="email"]').value.trim();
        const mensaje = form.querySelector('textarea[name="mensaje"]').value.trim();

        if (nombre === '' || email === '' || mensaje === '') {
            e.preventDefault();
            alert('Por favor, completá todos los campos requeridos.');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            e.preventDefault();
            alert('Por favor, ingresá un correo electrónico válido.');
            return;
        }
    });
}
