const Sequelize = require("sequelize")

const sequelize = require("../Util/Database")


const PRRequest = sequelize.define("pr_request",{
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    isActive:{
        type:Sequelize.BOOLEAN,
        allowNull:false
    }
})

module.exports=PRRequest