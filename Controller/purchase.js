const Razorpay = require("razorpay")

const Order = require("../Model/Order")


exports.purschasepremium = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 2000;

        rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
            if (err) {
                console.log(err,">>>>>>>>>>>>ERRR")
                throw new Error(JSON.stringify(err))
            }
            req.user.createOrder({ orderid: order.id, status: "PENDING" }).then(() => {
                return res.status(201).json({ order, key_id: rzp.key_id })
            }).catch(err => {
                throw new Error(err)
            })
        })
    } catch (err) {
        console.log("PURCHASE ERROR >>>>>", err)
        res.status(403).json({ message: "Somthing Went Galat", error: err })
    }
}

exports.updateTransactionEtatus = async (req, res) => {
    try {
        const { payment_id, order_id } = req.body
        console.log("payment_id>>>", payment_id)
        const order = await Order.findOne({ where: { orderid: order_id } })
        const promise1 = order.update({ paymentid: payment_id, status: "SUCCESSFUL" })
        const promise2 = req.user.update({ isprimiumUser: true })

        Promise.all([promise1, promise2]).then(() => {
            return res.status(202).json({ success: true, message: "Transaction Successful" })
        }).catch(err => {
            throw new Error(err)
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Somthing Went Wrong" })
    }
}


exports.updateFailedStatus = async (req, res) => {
    try {
        const { payment_id, order_id } = req.body

        const order = await Order.findOne({ where: { orderid: order_id } })
        const promise1 = order.update({ paymentid: payment_id, status: "FAILED" })
        const promise2 = req.user.update({ isprimiumUser: false })

        Promise.all([promise1, promise2]).then(() => {
            return res.status(202).json({ success: true, message: "Transaction Successful" })
        }).catch(err => {
            throw new Error(err)
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Somthing Went Wrong" })
    }
}