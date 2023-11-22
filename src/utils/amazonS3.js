const { Upload } = require('@aws-sdk/lib-storage');
const { S3 } = require('@aws-sdk/client-s3');
const { logger } = require('./logger');

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const uploadToS3 = async function (buffer, key) {
  const uploadparams = {
    Bucket: `${process.env.AWS_BUCKET_NAME}`,
    Body: buffer,
    Key: key,
    ACL: 'public-read',
  };
  return new Upload({
    client: s3,
    params: uploadparams,
  }).done();
};

const deleteFromS3 = async function (
  key,
  bucket = process.env.AWS_BUCKET_NAME
) {
  logger.info(`Delete S3 image - ${bucket} : ${key}`);
  return s3.deleteObject({ Bucket: bucket, Key: key });
};

module.exports = { uploadToS3, deleteFromS3 };
