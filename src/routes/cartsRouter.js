const express = require("express")
const router = express.Router()
const fs = require("fs")
const path = require("path")
const carritosFilePath = path.join(__dirname, "../../carritos.json")

const arregloCarritos = () => {
    if (!fs.existsSync(carritosFilePath)) {
        fs.writeFileSync(carritosFilePath, JSON.stringify([]))             //inicializamos
    }
    const data = fs.readFileSync(carritosFilePath, "utf-8" )
    return JSON.parse(data)
}
let carritos = arregloCarritos()

// GET--------------------------------------------------------------------------------------
router.get("/", (req, res) => {                                       //mostramos todos klos carritos
    res.json(carritos)
})

router.get("/:cid", (req, res) => {
    const idCarrito = parseInt(req.params.cid)
    const carrito = carritos.find((carrito) => carrito.id === idCarrito)       //mostramos los carritos por su id
    if (carrito) {
        res.json(carrito)
    } else {
        res.json("el id ingresado es incorrecto")
    }
})

//POST----------------------------------------------------------------------------
router.post("/", (req, res) => {
    const { productos } = req.body
    let idCarritoMax = 0
    if (carritos.length > 0) {
        idCarritoMax = carritos.reduce((max, carrito) => carrito.id > max ? carrito.id : max, 0)
    }
    const nuevoCarrito = {
        id: idCarritoMax + 1,
        productos: productos || []
    }
    carritos.push(nuevoCarrito)                                           //agregamos un carrito nuevo
    guardarCarrito = (carritos) => {
    const data = JSON.stringify(carritos, null, 2)
    fs.writeFileSync(carritosFilePath, data)
}
    res.json("nuevo carrito agregado exitosamente")
})


router.post("/:cid/producto/:pid", (req, res) => {
    const idCarrito = parseInt(req.params.cid)                     //actualizamos la cantidad de un producto mediante
    const idProducto = parseInt(req.params.pid)                    //si id y el del producto
    const { quantity } = req.body
    const carrito = carritos.find(carrito => carrito.id === idCarrito)

    if (!carrito) {
        return res.json("el id ingresado no corresponde a ningun carrito")
    }
    const producto = carrito.productos.find(producto => producto.id === idProducto)
    if (!producto) {
        return res.json("el producto no corresponde a ningun carrito")
    }
    producto.quantity += quantity
    guardarCarrito = (carritos) => {
    const data = JSON.stringify(carritos, null, 2)
    fs.writeFileSync(carritosFilePath, data)
    }
    res.json(`el producto con id: ${idProducto} del carrito con id: ${idCarrito} fue actualizado con exito`)
})

module.exports = router