const AWS = require('aws-sdk')
const {second} = require('../common/constants')

class AwsClient {
  constructor(options = {}) {
    let params = {
      apiVersion: '2006-03-01',
      endpoint: options.endpoint,
      accessKeyId: options.accessKey,
      secretAccessKey: options.secretKey,
      httpOptions: {
        timeout: 15 * second,
        connectTimeout: 5 * second,
      }
    }

    if (options.region) {
      params.region = options.region
    } else {
      params.s3ForcePathStyle = true
    }

    this._s3 = new AWS.S3(params)
  }

  listBuckets(callback) {
    const self = this
    self._s3.listBuckets((err, data) => {
      if (err) return callback(err)
      callback(null, data)
    })
  }

  createBucket(bucketName, callback) {
    const self = this
    self._s3.createBucket({
      Bucket: bucketName
    }, (err, data) => {
      if (err) return callback(err)
      callback(null, data)
    })
  }

  deleteBucket(bucketName, callback) {
    const self = this
    self._s3.deleteBucket({
      Bucket: bucketName
    }, (err, data) => {
      if (err) return callback(err)
      callback(null, data)
    })
  }

  headObject(bucketName, objectName, callback) {
    this._s3.headObject({
      Bucket: bucketName,
      Key: objectName,
    }, (err, data) => callback(err, data))
  }

  createObject(bucketName, objectName, content, type, size, callback) {
    this._s3.upload({
      Bucket: bucketName,
      Key: objectName,
      Body: content,
      ContentType: type,
      ContentLength: size,
    }, (err, data) => callback(err, data))
  }

  deleteObject(bucketName, objectName, callback) {
    this._s3.deleteObject({
      Bucket: bucketName,
      Key: objectName,
    }, (err, data) => callback(err, data))
  }

  getDownloadUrl(bucketName, objectName, callback, originalFilename = '') {
    if (!originalFilename) {
      originalFilename = objectName
    }

    this._s3.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: objectName,
      ResponseContentDisposition: `attachment; filename ="${originalFilename}"`,
      Expires: 3600 * 6
    }, (err, url) => callback(err, url))
  }

  listObject(bucketName, prefix, marker, maxKeys, callback) {
    const self = this
    let params = {
      Bucket: bucketName, MaxKeys: maxKeys
    }

    if (prefix) params.Prefix = prefix
    if (marker) params.Marker = marker
    self._s3.listObjects(
      params,
      (err, data) => {
        callback(err, data)
      })
  }
}


module.exports = AwsClient
