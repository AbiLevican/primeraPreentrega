import express, { json, urlencoded } from "express"
import configuracionRouter from "./routes/productsRouter.js"
import cartsRouter from "./routes/cartsRouter.js"
import viewsRouter from "./routes/viewsRouter.js"
import __dirname from "./utils/utils.js"
import handlebars from "express-handlebars"
import path from "path"
import { Server } from "socket.io"
import http from "http"

const app = express()
const PORT = 8080

// MIDDLEWARES
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname,"public")))
app.use("/api/carritos", cartsRouter)
app.use("/", viewsRouter)

app.engine("handlebars", handlebars.engine())
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "handlebars")

const httpServer = http.createServer(app)
const socketServer = new Server(httpServer)

socketServer.on("conexion", socket => {
    console.log("Conexion lograda con exito")

    socket.on("informacion", data => {
        console.log(`la data nueva es ${data}`)
    })

    socket.on("dataProducto", data => {
        console.log("Data recibida:", data)
        socketServer.emit("productoData", data) 
    })

    socket.on("borrarProducto", data => {
        console.log("Borrar producto:", data)
        socketServer.emit("productoBorrado", data) // Notificar a todos los clientes que el producto ha sido eliminado
    })
})

// Usar el enrutador de productos y pasar la instancia de Socket.IO
app.use("/api/productos", configuracionRouter(socketServer))


app.listen(PORT, () => {
    console.log(`el servidor esta corriendo en el puerto: ${PORT}`)
})