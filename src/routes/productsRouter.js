import { Router } from "express"
import { promises as fs } from "fs" 
import { join } from "path"
import __dirname from "../utils/utils.js"

const productosFilePath = join(__dirname, "../productos.json")
const router = Router()

let productos = []

// inicializamos y cargamos el arreglo de productos
const initializarproductos = async () => {
    try {
        try {
            await fs.access(productosFilePath)
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(productosFilePath, JSON.stringify([]))
            } else {
                throw error
            }
        }
    } catch (error) {
        console.log("error inicializando los productos:", error)
        throw new Error("error inicializando los productos")
    }
}


const arregloProductos = async () => {
    try {
        await initializarproductos()
        const data = await fs.readFile(productosFilePath, "utf-8")
        return JSON.parse(data)
    } catch (error) {
        console.log("error cargando los productos:", error)
        throw new Error("error cargando los productos:")
    }
}

const productosCargados = async () => {
    productos = await arregloProductos()
}

productosCargados().then(() => {                                   //mostramos el arreglo entero de productos
    router.get("/", (req, res) => {
        const limit = parseInt(req.query.limit, 10)
        if (Number.isInteger(limit) && limit > 0) {
            res.json(productos.slice(0, limit))
            
        } else {
            res.json(productos)
        }
    })
})

router.get("/:pid", (req, res) => {                                //mostramos un producto determinado mediante id
    const idProducto = parseInt(req.params.pid)
    const producto = productos.find(producto => producto.id === idProducto)
    if (producto) {
        res.json(producto)
    } else {
        res.json({ message: "Producto no encontrado, intenta otra vez" })
    }
})

const configuracionRouter = (io) => {                    //agregamos un producto nuevo
    router.post("/", async (req, res) => {
        const { title, description, price, code, stok, status} = req.body
        if (!title || !description || price <= 0 || !code || stok < 0 ) {
            return res.json({ message: "La información esta incompleta" })
        }
        const idProductoMax = productos.reduce((max, producto) => Math.max(max, producto.id), 0)
        const nuevoProducto = {
            id: idProductoMax + 1,
            title,
            description,
            price,
            code,
            stok,
            status: status ?? true
        }
        productos.push(nuevoProducto)

        try {
            const guardarProducto = async (productos) => {
                const data = JSON.stringify(productos, null, 2)
                try {
                    await fs.writeFile(productosFilePath, data)
                } catch (error) {
                    console.log("error:", error)
                    throw new Error("error guardando el producto")
                }
            }
            
            await guardarProducto(productos)
            res.json(nuevoProducto)
            io.emit('dataProducto', nuevoProducto)

        } catch (error) {
            res.json({ message: "El producto no pudo guardarse", error: error.message})
        }
    })

    router.put("/:pid", async (req, res) => {                         //actualizamos un producto
        const idProducto = parseInt(req.params.pid, 10)
        const indexProducto = productos.findIndex(producto => producto.id === idProducto)

        if (indexProducto !== -1) {
            const producto = productos[indexProducto]
            const { title, description, price, code, stok, status} = req.body
            producto.title = title ?? producto.title
            producto.description = description ?? producto.description
            producto.price = price ?? producto.price
            producto.code = code ?? producto.code
            producto.stok = stok ?? producto.stok
            producto.status = status ?? producto.status

            try {
                const guardarProducto = async (productos) => {
                    const data = JSON.stringify(productos, null, 2)
                    try {
                        await fs.writeFile(productosFilePath, data)
                    } catch (error) {
                        console.log("error:", error)
                        throw new Error("error guardando el producto")
                    }
                }
                
                await guardarProducto(productos)
                res.json("producto actualizado exitosamente")
                io.emit('dataProducto', producto)

            } catch (error) {
                res.json({ message: "no se pudo actualizar el producto"})
            }
        } else {
            res.json({ message: "producto no encontrado" })
        }
    })

    router.delete("/:pid", async (req, res) => {                         //borramos un producto mediante su id
        const idProducto = parseInt(req.params.pid, 10)
        const indexProducto = productos.findIndex(producto => producto.id === idProducto)
        if (indexProducto!== -1) {
            const productoBorrado = productos.splice(indexProducto, 1)

            try {
                const guardarProducto = async (productos) => {
                    const data = JSON.stringify(productos, null, 2)
                    try {
                        await fs.writeFile(productosFilePath, data)
                    } catch (error) {
                        console.log("error:", error)
                        throw new Error("error guardando el producto")
                    }
                }

                await guardarProducto(productos)
                res.json({ message: `Producto con id: ${idProducto} ha sido eliminado correctamente` })
                io.emit('productoBorrado', { id: idProducto })

            } catch (error) {
                res.json({ message: "el producto no se pudo eliminar"})
            }
        } else {
            res.json({ message: "el id no coincide con ningun producto" })
        }
    })
    return router
}

export default configuracionRouter