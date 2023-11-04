const mongoose = require("mongoose")

const ServerAndDataBase = async (server) => {
    console.log("Connecting & Starting Server......")
    try {
        await mongoose.connect(process.env.DBURL)
        server()
        console.log("DB Connected & Server Started")

    } catch (err) {
        console.log(err, "***********NOT CONNECTED***********")
    }
}

module.exports = ServerAndDataBase;