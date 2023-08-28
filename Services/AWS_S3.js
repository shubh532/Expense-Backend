const AWS_KEY = process.env.AWS_KEY
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY
const Bucket_Name = process.env.Bucket_Name
const AWS = require("aws-sdk")


module.exports=uploadToS3 = (ExpData, fileName) => {
    let S3Bucket = new AWS.S3({
        accessKeyId: AWS_KEY,
        secretAccessKey: AWS_SECRET_KEY
    })
    let params = {
        Bucket: Bucket_Name,
        Key: fileName,
        Body: ExpData,
        ACL: "public-read"
    }
    return new Promise((resolve, reject) => {
        S3Bucket.upload(params, (err, s3Response) => {
            if (err) {
                console.log(err, "Error while Uploading File")
                reject(err)
            } else {
                console.log("Successfully Done", s3Response)
                resolve(s3Response.Location)
            }
        })
    })
}
