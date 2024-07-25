const socket = io()

document.getElementById('ingresoProducto').addEventListener('submit', function (event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())
    socket.emit('productoData', data)
    event.target.reset()
})

function agregarProducto(producto) {
    const listaProductos = document.getElementById('listaProductos')
    const item = document.createElement('li')
    item.id = `producto: ${producto.id}`
    item.innerHTML = 
    `id: ${producto.id}, 
    title: ${producto.title}, 
    description: ${producto.description},
    price: ${producto.price},
    code: ${producto.code},
    stok: ${producto.stock} 
    <button onclick="borrarProducto(${producto.id})">Eliminar</button>`
    listaProductos.appendChild(item)
}

function borrarProducto(id) {
    socket.emit('borrarProducto', { id })
}

socket.on('productoBorrado', (data) => {
    const item = document.getElementById(`producto: ${data.id}`)
    if (item) {
        item.remove()
    }
})

socket.on('dataProducto', (data) => {
    agregarProducto(data)
})