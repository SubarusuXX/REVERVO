const AWS = require('aws-sdk');

module.exports = {

  IAM_USER_KEY: process.env.AWS_ACCESS_KEY,
  IAM_USER_SECRET: process.env.AWS_SECRET_KEY,
  BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  AWS_REGION: process.env.AWS_REGION,

  uploadToS3: function (file, filename, acl = 'public-read') {

    return new Promise((resolve) => {

      const s3bucket = new AWS.S3({
        accessKeyId: this.IAM_USER_KEY,
        secretAccessKey: this.IAM_USER_SECRET,
        region: this.AWS_REGION
      });

      const params = {
        Bucket: this.BUCKET_NAME,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      s3bucket.upload(params, function (err, data) {

        if (err) {
          console.log(err);
          return resolve({ error: true, message: err });
        }

        return resolve({ error: false, message: data });

      });

    });
  },

  deleteFileS3: function (key) {

    return new Promise((resolve) => {

      const s3bucket = new AWS.S3({
        accessKeyId: this.IAM_USER_KEY,
        secretAccessKey: this.IAM_USER_SECRET,
        region: this.AWS_REGION
      });

      s3bucket.deleteObject({
        Bucket: this.BUCKET_NAME,
        Key: key
      }, function (err, data) {

        if (err) {
          console.log(err);
          return resolve({ error: true, message: err });
        }

        return resolve({ error: false, message: data });

      });

    });

  }

};