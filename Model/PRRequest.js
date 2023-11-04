const mongoose = require("mongoose")

const Schema = mongoose.Schema;
//password reset request handling DB
const PRRequestSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false,
        required: true
    },

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

module.exports = mongoose.model("PRRequest", PRRequestSchema)