const ExpAuthData = require("../Model/User")
const PasswaordResetReq = require("../Model/PRRequest")
const bcrypt = require("bcrypt")
const saltRounds = 10
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require('uuid');
const API_KEY = process.env.BREVO_API_KEY
const Password_Link = process.env.PASSWORD_Link
let SibApiV3Sdk = require('sib-api-v3-sdk');


function generateAccessToken(id, name) {
    return jwt.sign({ userId: id, name: name }, "QWERTYUIOPASDFGHJKLMNBVCXZ!#@$%^&*147852369")
}

exports.postAuthData = async (req, res, next) => {
    const Name = req.body.name
    const email = req.body.email
    const password = req.body.password
    try {
        const existMail = await ExpAuthData.findOne({ where: { email } })
        if (existMail) {
            res.status(409).json({ message: "Email Already Exist" })
        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    throw new Error("Somthing Wnet wrong")
                } else {
                    const User = await ExpAuthData.create({
                        Name: Name,
                        email: email,
                        password: hash
                    })
                    res.status(201).json({ message: "User Register Successfully", user: User })
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
        const User = await ExpAuthData.findOne({ where: { email } })
        if (!User) {
            res.status(404).json({ message: "Email Not Exist", success: false })
        } else {
            const hash = User.password
            bcrypt.compare(password, hash, (err, result) => {
                if (err) {
                    throw new Error({ message: "Somthing Went Wrong" })
                }
                if (result) {
                    res.status(200).json({ message: "Successfully Login", success: true, user: User, tokenId: generateAccessToken(User.id, User.Name) })
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
    res.send("Work Fine")
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
        await PasswaordResetReq.create({
            id: uuid,
            isActive: true,
            userId: userId
        })
        const result = await apiInstance.sendTransacEmail({
            Sender,
            to: receivers,
            subject: "Tetsing Mail",
            textContent: "This is testing mail",
            htmlContent: `<a href=${Password_Link}/${uuid}>Reset Passwaord</a>`
        })
        console.log({ result: result, message: "Successfull" })
        res.end()
    } catch (err) {
        console.log(err, "<<<<<<<<<<ERRRR")
    }
}

exports.getResetPassword = async (req, res, next) => {
    const uuid = req.params.uuid
    try {
        const User = await PasswaordResetReq.findOne({ where: { id: uuid } })
        const isActive = User.dataValues.isActive
        const userId = User.dataValues.userId
        if (isActive) {
            return res.render("ResetPassword", { userId: userId })
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
    const { password, confirmpassword, userId } = req.body
    console.log(id,"req.req.params.uuid")

    try {
        const user = await ExpAuthData.findOne({ where: { id: userId } })
        if (!user) {
            return res.status(404), json({ message: "User Not Found" })
        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    throw new Error(" Somthing Went Wrong")
                } else {
                    await user.update({
                        password: hash
                    }, {
                        where: { id: userId }
                    })
                    const u =await PasswaordResetReq.update({
                        isActive:false
                    },{
                        where:{userId:id}
                    })
                    console.log(u,"userknknv")

                }
                res.status(200).json({ message: "Password Successfully Updated" })
            })
        }
    } catch (err) {
        console.log(err, " err from postUpdatePassword")
        res.status(500).json({ message: "Server Error" })
    }

}