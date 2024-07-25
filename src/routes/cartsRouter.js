import { Router } from "express"
import { promises as fs } from "fs"
import { join } from "path"
import __dirname from "../utils/utils.js"
const carritosFilePath = join(__dirname, "../carritos.json")
const router = Router()

let carritos = []

// inicializamos y cargamos el arreglo decarritos
const initializarCarritos = async () => {
    try {
        try {
            await fs.access(carritosFilePath)
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(carritosFilePath, JSON.stringify([]))
            } else {
                throw error
            }
        }
    } catch (error) {
        console.error("error inicializando los carritos", error)
        throw new Error("error inicializando los carritos")
    }
}

const arregloCarritos = async () => {
    try {
        await initializarCarritos()
        const data = await fs.readFile(carritosFilePath, "utf-8")
        return JSON.parse(data)
    } catch (error) {
        console.error("error cargando los carritos:", error)
        throw new Error("error cargando los carritos")
    }
}

const carritosCargados = async () => {
    carritos = await arregloCarritos()
}

carritosCargados().then(() => {                           //mostramos todos los carritos
    router.get("/", (req, res) => {
        res.json(carritos)
    })

    router.get("/:cid", (req, res) => {                        //mostramos los carritos por id
        const idCarrito = parseInt(req.params.cid)
        const carrito = carritos.find(c => c.id === idCarrito)
        if (carrito) {
            res.json(carrito)
        } else {
            res.json({ message: "Carrito no encontrado, pruebe con otro id" })
        }
    })
})

    router.post("/", (req, res) => {                          //agregamos un carrito
        const { productos } = req.body
        const idCarritoMax = carritos.reduce((max, carrito) => Math.max(max, carrito.id), 0)
        const carritoNuevo = {
            id: idCarritoMax + 1,
            productos: productos || []
        }

        carritos.push(carritoNuevo)
        const guardarCarrito = async (carritos) => {
            const data = JSON.stringify(carritos, null, 2)
            try {
                await fs.writeFile(carritosFilePath, data)
            } catch (error) {
                console.log("error guardando el carrito")
                throw new Error("error guardando el carrito")
            }
        }
        guardarCarrito(carritos)
        res.json("carrito guardado!")
    })

    router.post("/:cid/productos/:pid", async (req, res) => {        //agregamos un producto a un carrito
        const idCarrito = parseInt(req.params.cid,10)
        const idProducto = parseInt(req.params.pid,10)
        let quantity = parseInt(req.body.quantity,10) || 1

        const carrito = carritos.find(carrito => carrito.id === idCarrito)
        if (!carrito) {
            return res.json({ message: `el carrito con id: ${cartId} no se ha encontrado` })
        }

        const prodEnCarrito = carrito.productos.find(producto => producto.id === idProducto)
        if (!prodEnCarrito) {
            return res.json({ message: `el producto con id: ${prodId} no se ha encontrado en el carrito` })
        }

        prodEnCarrito.quantity += quantity
        try {
            const guardarCarrito = async (carritos) => {
            const data = JSON.stringify(carritos, null, 2)
            try {
                await fs.writeFile(carritosFilePath, data)
            } catch (error) {
                console.error("error guardando carritos", error)
                throw new Error("error guardando carritos")
            }

            await guardarCarrito(carritos)
        }
            res.json({ message: `el producto con id: ${idProducto}  se ha agregado ${quantity} veces` })
        } catch (error) {
            res.json({ message: "error al guardar"})
        }
    })

export default router;