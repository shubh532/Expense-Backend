const jwt = require("jsonwebtoken")
const User = require("../Model/User")

const secreateKey = "QWERTYUIOPASDFGHJKLMNBVCXZ!#@$%^&*147852369"
const Authenticate = (req, res, next) => {
    try {
        const tokenId = req.header("Authorization")
        // console.log("token>>> ", tokenId)
        const user = jwt.verify(tokenId, secreateKey)
        // console.log("user>>.. ",user)
        User.findByPk(user.userId).then(user => {
            // console.log("user>>", JSON.stringify(user))
            if(user){
                req.user = user
                next()
            }
        }).catch(err => { throw new Error(err) })

    } catch (err) {
        console.log(err)
        return res.status(401).json({ success: false })
    }
}

module.exports= Authenticate