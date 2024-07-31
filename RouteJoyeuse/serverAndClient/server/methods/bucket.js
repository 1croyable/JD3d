const config = require('../config/config.js');
const cos = config.cos;
const getAuto = config.getAuto;

function checkFileExists(bucket, region, objectKey) {
    return new Promise((resolve, reject) => {
        cos.headObject({
            Bucket: bucket,
            Region: region,
            Key: objectKey,
        }, function (err, data) {
            if (data) {
                resolve(true);
            } else if (err.statusCode == 404) {
                resolve(false);
            }
            else {
                reject(err);
            }
        }
        );
    }
    )
}

function uploadFileToCOS(bucket, region, key, buffer) {
    return new Promise((resolve, reject) => {
        cos.putObject({
            Bucket: bucket,
            Region: region,
            Key: key,
            Body: buffer,
        }, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function getSignedURL(bucket, region, key) {
    return new Promise(async (resolve, reject) => {
        const Authorization = await getAuto(key);
        cos.getObjectUrl({
            Bucket: bucket,
            Region: region,
            Key: key,
            Expires: 60,
        }, function (err, url) {
            if (err) {
                reject(err);
            } else {
                resolve(url)
            }
        });
    });
}

function deleteFile(bucket, region, key) {
    return new Promise((resolve, reject) => {
        cos.deleteObject({
            Bucket: bucket,
            Region: region,
            Key: key,
        },function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

function getBuffer(bucket, region, key) {
    return new Promise((resolve, reject) => {
        cos.getObject({
            Bucket: bucket,
            Region: region,
            Key: key,
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.Body);
            }
        });
    });
}

module.exports = { checkFileExists, uploadFileToCOS, getSignedURL, deleteFile, getBuffer }