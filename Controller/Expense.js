const Expense = require("../Model/Expense")
const User = require("../Model/User")
const JsObject = require("../Util/ConvertToObj")
const mongoose = require("mongoose")
const uploadToS3 = require("../Services/AWS_S3")

exports.getData = async (req, res, next) => {
    const id = req.user.id
    const page = req.query.page
    const Items_per_page = parseInt(req.query.limit)
    const skipItems = (page - 1) * Items_per_page;
    try {
        const totalItems = Expense.countDocuments({ userId: id })
        const dataPromise = Expense.find({ userId: id }).skip(skipItems).limit(Items_per_page)
        const userPromise = User.findById({ _id: id })
        const [data, user, totalExpItems] = await Promise.all([dataPromise, userPromise, totalItems])
        const pageData = {
            currentPage: page,
            hasNextPage: Items_per_page * page < totalExpItems,
            nextPage: parseInt(page) + 1,
            hasPreviousPage: page > 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalExpItems / Items_per_page)
        }
        res.status(200).json({ pageData: pageData, ExpenseData: data, user: { primeUser: user.isprimiumUser } })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Somthing Went Wrong" })
    }
}

exports.postExpnseData = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    const { Amount, Description, Category, userId } = req.body
    const prevTotal = req.user.totalAmount
    const totalAmount = Number(prevTotal) + Number(Amount)
    const date = new Date()
    try {
        const Data = new Expense({
            Amount: Amount,
            Description: Description,
            Category: Category,
            userId: userId,
            createdAt:date
        })
        await Data.save({ session })
        //Mongo Object to Js Object
        const data = JsObject(Data)

        await User.findOneAndUpdate(
            { _id: userId },
            { totalAmount: totalAmount }
        )
        res.status(201).json({ dataValues: { ...data }, success: true, message: "Successfully Added" })
        await session.commitTransaction()
        session.endSession()
        console.log("***DONE****")
    } catch (err) {
        await session.abortTransaction()
        session.endSession()
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.deleteExpenseData = async (req, res, next) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    const id = req.params.id

    const prevTotal = req.user.totalAmount
    try {
        const data = await Expense.findById({ _id: id })

        const Amount = data.Amount
        const userId = data.userId.toString()
        const totalAmount = Number(prevTotal) - Number(Amount)

        await User.findByIdAndUpdate(
            { _id: userId },
            { totalAmount: totalAmount }
        )

        await Expense.deleteOne({ _id: id })
        res.status(200).json({ message: "Data Deleted" })
        await session.commitTransaction()
        session.endSession()
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
        await session.abortTransaction()
        session.endSession()
    }
}

exports.LeaderBoardData = async (req, res, next) => {
    try {
        const user = await User.find().sort({ totalAmount: 'desc' })
        res.status(200).json([...user])
        res.end()
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.DownloadFile = async (req, res, next) => {
    const { id } = req.user
    try {
        const data = await ExpenseData.findAll({ where: { userId: id } })
        const StringiFiedExp = JSON.stringify(data)
        const fileName = `Expense${id}${new Date()}.txt`
        const fileUrl = await uploadToS3(StringiFiedExp, fileName)
        res.status(200).json({ fileUrl: fileUrl, success: true })
    } catch (err) {
        console.log(err, "Error from Download File")
        res.status(500).json({ fileUrl: fileUrl, success: false, err: err })
    }
}