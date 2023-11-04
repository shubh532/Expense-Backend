const User = require("../Model/User")
const PasswaordResetReq = require("../Model/PRRequest")
const bcrypt = require("bcrypt")
const saltRounds = 10
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require('uuid');
const API_KEY = process.env.BREVO_API_KEY
const Password_Link = process.env.PASSWORD_Link
let SibApiV3Sdk = require('sib-api-v3-sdk');
const mongoDb = require("mongodb")
const ObjectId = mongoDb.ObjectId;


function generateAccessToken(id, name) {
    return jwt.sign({ userId: id, name: name }, "QWERTYUIOPASDFGHJKLMNBVCXZ!#@$%^&*147852369")
}

exports.postAuthData = async (req, res, next) => {
    const Name = req.body.name
    const email = req.body.email
    const password = req.body.password
    console.log(Name, email, password, "Data")
    try {
        const existMail = await User.findOne({ email: email })
        console.log(existMail, "existMail")
        if (existMail) {
            res.status(409).json({ message: "Email Already Exist" })
        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    throw new Error("Somthing Wnet wrong")
                } else {
                    const user = new User({
                        Name: Name,
                        email: email,
                        password: hash
                    })
                    await user.save()
                    res.status(201).json({ message: "User Register Successfully", user: user })
                    console.log("User Register Successfully")
                }
            })
        }
    } catch (err) {
        res.status(500).json({ message: "Error Occurred", error: err.message })
    }
}

exports.postLoginData = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    // console.log(email, password,"sdfhbsjdfsjd")
    try {
        const user = await User.findOne({ email: email })
        if (!user) {
            res.status(404).json({ message: "Email Not Exist", success: false })
        } else {
            const hash = user.password
            bcrypt.compare(password, hash, (err, result) => {
                if (err) {
                    throw new Error({ message: "Somthing Went Wrong" })
                }
                if (result) {
                    res.status(200).json({ message: "Successfully Login", success: true, user: user, tokenId: generateAccessToken(user.id, user.Name) })
                    // console.log( user,"Successfully Login")
                } else {
                    res.status(400).json({ message: "Incorrect Password ", success: false })
                }
            })
        }
    } catch (err) {
        console.log(err, "from login route")
        res.status(500).json({ message: "Error Occurred while Login", error: err.message })
    }
}


exports.getAuthData = async (req, res, next) => {
    res.send("Work Fine and good")
}


exports.postForgotpassWord = async (req, res, next) => {
    const { email, userId } = req.body
    const uuid = uuidv4()
    let Client = SibApiV3Sdk.ApiClient.instance;
    let apiKey = Client.authentications['api-key'];
    apiKey.apiKey = API_KEY
    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const Sender = {
        email: "shubhammahulkar2000@gmail.com",
        name: "Shubham Mahulkar"
    }
    const receivers = [{
        email: email
    }]
    try {
        const ResetPass = new PasswaordResetReq({
            _id: uuid,
            isActive: true,
            userId: userId
        })
        await ResetPass.save()
        const result = await apiInstance.sendTransacEmail({
            Sender,
            to: receivers,
            subject: "Tetsing Mail",
            textContent: "This is testing mail",
            htmlContent: `<a href=${Password_Link}/${uuid}>Reset Passwaord</a>`
        })
        console.log({ result: result, message: "Successfully Reset Passwaord" })
        res.end()
    } catch (err) {
        console.log(err, "<<<<<<<<<<ERRRR")
    }
}

exports.getResetPassword = async (req, res, next) => {
    const uuid = req.params.uuid
    try {
        const User = await PasswaordResetReq.findOne({ _id: uuid })
        console.log(User, "checking Actiovtiy")
        const isActive = User.isActive
        const userId = User.userId.toString()
        if (isActive) {
            return res.render("ResetPassword", { userId: userId, requestId: uuid })
        } else {
            res.status(403).json({ message: "Unauthorized" })
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "ResetPassword Server Error" })
    }

}

exports.postUpdatePassword = async (req, res, next) => {
    const id = req.params.userId
    const { password, confirmpassword, userId, requestId } = req.body
    console.log(id, "req.req.params.uuid")

    try {
        const user = await User.findOne({ _id: userId })
        console.log(user, "><<<<<<user")
        if (!user) {
            return res.status(404), json({ message: "User Not Found" })
        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    throw new Error(" Somthing Went Wrong")
                } else {
                    await User.findByIdAndUpdate(
                        { _id: userId },
                        { password: hash }
                    )
                    console.log(userId)
                    //deletting active request status after reseting password
                    await PasswaordResetReq.findByIdAndRemove({ _id: requestId })
                }
                res.status(200).json({ message: "Password Successfully Updated" })
            })
        }
    } catch (err) {
        console.log(err, " err from postUpdatePassword")
        res.status(500).json({ message: "Server Error" })
    }

}