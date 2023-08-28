const Sequelize = require("sequelize")

const sequelize =require("../Util/Database")

const ExpenseData=sequelize.define("expense_data",{
    id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        autoIncrement: true,
        primaryKey:true,
    },
    Amount:{
        type:Sequelize.DOUBLE,
        allowNull:false
    },
    Description:{
        type:Sequelize.STRING,
        allowNull:false
    },
    Category:{
        type:Sequelize.STRING,
        allowNull:false
    }
})

module.exports=ExpenseData