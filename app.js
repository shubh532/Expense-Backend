require('dotenv').config()
const path = require("path")
const ServerAndDataBase = require("./Util/Database")
const express = require("express")
const bodyparser = require('body-parser')
const cors = require("cors")
const Routes = require("./Routes/AuthRoutes")
const ExpenseRoutes = require('./Routes/ExpenseRoutes')
const PurchaseRoute = require("./Routes/purchase")
const app = express()
const helmet = require("helmet")
const Compression = require("compression")

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors())
app.use(bodyparser.json())

app.use(Routes)
app.use(ExpenseRoutes)
app.use("/purchase", PurchaseRoute)


app.use(helmet())
app.use(Compression())

ServerAndDataBase(() => app.listen(4000))
