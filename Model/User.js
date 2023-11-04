const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    Name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isprimiumUser: {
        type: Boolean,
        default: false,
        required: true
    },
    totalAmount: {
        type: Number,
        default: 0,
        required: true
    }
})

module.exports = mongoose.model("User", UserSchema)
