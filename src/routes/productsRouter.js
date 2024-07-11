const express = require("express")
const router = express.Router()
const fs = require("fs")
const path = require("path")
const productosFilePath = path.join(__dirname, "../../productos.json")

    
const arregloProductos = () => {                                  //inicializamos 
    if (!fs.existsSync(productosFilePath)) {
        fs.writeFileSync(productosFilePath, JSON.stringify([]))
    }
    const data = fs.readFileSync(productosFilePath, "utf-8")
    return JSON.parse(data)
}
let productos = arregloProductos()

// GET -------------------------------------------------------------------------------------------
router.get("/", (req, res) => {                //mostramos el arreglo de productos
    res.json(productos)
})

router.get("/:pid", (req, res) => {                             //pedimos un producto por su id
    const idProducto = parseInt(req.params.pid)
    const producto = productos.find((producto) => producto.id === idProducto)
    if (producto) {
        res.json(producto)
    } else {
        res.json("El id ingresado no es correcto" )
    }
})

// POST----------------------------------------------------------------------------------------
router.post("/", (req, res) => {
    const { title, description, price, code, stok, status } = req.body
    let idProductoMax = productos.reduce((max, producto) => producto.id > max ? producto.id : max, 0 )
    if (!title || !description || price <= 0 ||!code ||  stok <= 0 ){
        res.json( "la informacion ingresada no es correcta" )
    } else {
    const productoNuevo = {
        id: idProductoMax + 1,                                //agregamos un producto
        title,
        description,
        price,
        code,
        stok,
        status: status ?? true
    }

    productos.push(productoNuevo)
    guardarProducto = (productos) => {
    const data = JSON.stringify(productos, null, 2)
    fs.writeFileSync(productosFilePath, data)
    }
    res.json("Nuevo producto agregado exitodamente")
    }
})

// PUT-----------------------------------------------------------------------------------------------------
router.put("/:pid", (req, res) => {
    const idProducto = parseInt(req.params.pid)
    const producto = productos.find((producto) => producto.id === idProducto)

    if (producto) {
        const { title, description, price, code, stok, status } = req.body      //actualizamos un producto mediante
        producto.title = title ?? producto.title                                //su id
        producto.description = description ?? producto.description
        producto.price = price ?? producto.price
        producto.code = code ?? producto.code
        producto.stock = stok ?? producto.stok
        producto.status = status ?? producto.status

        guardarProducto = (productos) => {
        const data = JSON.stringify(productos, null, 2)
        fs.writeFileSync(productosFilePath, data)
    }
        res.json("Producto actualizado correctamente")
    } else {
        res.json("el id ingresado en incorrecto")
    }
})

// DELETE----------------------------------------------------------------------------------------------------
    router.delete("/:pid", (req, res) => {
    const idProducto = parseInt(req.params.pid)
    productos = productos.filter((producto) => producto.id !== idProducto)        //borramos un producto mediante
    guardarProducto = (productos) => {                                            //su id
    const data = JSON.stringify(productos, null, 2)
    fs.writeFileSync(productosFilePath, data)
}
    res.json(`Producto con id: ${idProducto}, eliminado correctamente` )
})

module.exports = router