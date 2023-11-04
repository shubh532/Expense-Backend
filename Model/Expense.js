const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ExpenseDataSchema = new Schema({
    Amount: {
        type: Number,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model("Expense", ExpenseDataSchema)