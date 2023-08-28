const Sequelize = require("sequelize")

const DB = process.env.DB
const Db_Name = process.env.DB_Name
const DB_Host = process.env.DB_Host
const DB_User = process.env.DB_User
const DB_passWord = process.env.DB_passWord

const sequelize = new Sequelize(Db_Name, DB_User, DB_passWord, {
    dialect: DB,
    host: DB_Host
});

module.exports =sequelize