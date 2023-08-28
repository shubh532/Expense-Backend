const express = require("express")

const PurchaseRoute = express.Router()

const Authenticate = require("../Middleware/authorization")

const PurchaseController = require("../Controller/purchase")

PurchaseRoute.get("/premiummembership", Authenticate, PurchaseController.purschasepremium)
PurchaseRoute.post("/updatetransactionstatus", Authenticate, PurchaseController.updateTransactionEtatus)
PurchaseRoute.post("/failedpayment", Authenticate, PurchaseController.updateFailedStatus)

module.exports = PurchaseRoute