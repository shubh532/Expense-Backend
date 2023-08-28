const ExpenseData = require("../Model/Expense")
const User = require("../Model/User")
const sequelize = require("../Util/Database")
const uploadToS3 = require("../Services/AWS_S3")

exports.getData = async (req, res, next) => {
    const id = req.user.id
    const page = req.query.page
    const Items_per_page = parseInt(req.query.limit)
    try {
        const totalItems = ExpenseData.count({ where: { userId: id } })
        const dataPromise = ExpenseData.findAll({ where: { userId: id }, offset: (page - 1)*Items_per_page, limit: Items_per_page, order: [['createdAt', 'DESC']], })
        const userPromise = User.findOne({ where: { id: id } })
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
    const t = await sequelize.transaction()
    const { Amount, Description, Category, userId } = req.body
    const prevTotal = req.user.totalAmount
    const totalAmount = Number(prevTotal) + Number(Amount)
    try {
        const Data = await ExpenseData.create({
            Amount: Amount,
            Description: Description,
            Category: Category,
            userId: userId
        }, { transaction: t })

        await User.update(
            {
                totalAmount: totalAmount
            }, {
            where: { id: userId },
            transaction: t
        }
        )
        // console.log(Data)
        await t.commit()
        res.status(201).json({ ...Data, success: true, message: "Successfully Added" })
    } catch (err) {
        await t.rollback()
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.deleteExpenseData = async (req, res, next) => {
    const id = req.params.id
    // console.log(id,">>>>>>>>id")
    const prevTotal = req.user.totalAmount
    const t = await sequelize.transaction()
    try {
        const data = await ExpenseData.findOne({ where: { id: id }, transaction: t })
        // console.log("dta>>>>>",data)
        const Amount = data.dataValues.Amount
        const userId = data.dataValues.userId
        const totalAmount = Number(prevTotal) - Number(Amount)
        await User.update(
            { totalAmount: totalAmount },
            { where: { id: userId }, transaction: t }
        )
        t.commit()
        data.destroy()
        res.status(200).json({ message: "Data Deleted" })
    } catch (err) {
        t.rollback()
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.LeaderBoardData = async (req, res, next) => {
    try {
        const user = await User.findAll({
            order: [["totalAmount", "DESC"]]
        })
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