const express = require("express")
const app = express()
const PORT = 8080
const productsRouter = require("./routes/productsRouter.js")
const cartsRouter = require("./routes/cartsRouter.js")



// MIDDLEWARES
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/productos", productsRouter)
app.use("/api/carritos", cartsRouter)

app.listen(PORT, () => {
    console.log(`el servidor esta corriendo en el puerto: ${PORT}`)
})