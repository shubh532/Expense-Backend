require('dotenv').config()
const fs = require("fs")
const path = require("path")
const express = require("express")
const bodyparser = require('body-parser')
const cors = require("cors")
const User = require("./Model/User")
const Expense = require('./Model/Expense')
const Order = require("./Model/Order")
const ResetPassWordReq = require("./Model/PRRequest")
const Routes = require("./Routes/AuthRoutes")
const ExpenseRoutes = require('./Routes/ExpenseRoutes')
const PurchaseRoute = require("./Routes/purchase")
const Authsequelize = require("./Util/Database")
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

User.hasMany(Expense)
Expense.belongsTo(User)

User.hasMany(Order)
Order.belongsTo(User)

User.hasMany(ResetPassWordReq)
ResetPassWordReq.belongsTo(User)

Authsequelize.sync()
    .then(app.listen(4000, 'localhost', () => {
        console.log("click on http://localhost:4000")
    })
    )
    .catch(err => console.log(err, "err occure form app.js"))
