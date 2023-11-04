const express = require("express")
const ExpenseRoutes = express.Router()
const Authentication = require("../Middleware/authorization")

const ExpnseController = require("../Controller/Expense")

ExpenseRoutes.get("/getExpense_data", Authentication, ExpnseController.getData)
ExpenseRoutes.post("/postExpense",Authentication, ExpnseController.postExpnseData)
ExpenseRoutes.delete("/deleteExpense/:id",Authentication, ExpnseController.deleteExpenseData)
ExpenseRoutes.get("/leaderBoard", ExpnseController.LeaderBoardData)
// ExpenseRoutes.get("/downloadfile", Authentication, ExpnseController.DownloadFile)

module.exports = ExpenseRoutes