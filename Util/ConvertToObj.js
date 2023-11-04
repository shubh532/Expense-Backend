const JsObject = (data) => {
    return {
        Amount: data.Amount,
        Description: data.Description,
        Category: data.Category,
        userId: data.userId.toString(),
        _id: data._id.toString()

    }
}
module.exports = JsObject