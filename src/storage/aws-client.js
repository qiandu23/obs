const AWS = require('aws-sdk')
const async = require('async')
const {second} = require('../common/constants')
const _ = require('lodash')

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

  createObject(bucketName, objectName, content, callback) {
    this._s3.upload({
      Bucket: bucketName,
      Key: objectName,
      Body: content
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

  getUploadUrl(bucketName, objectName, callback) {
    this._s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: objectName,
      ContentType: 'application/octet-stream'
    }, (err, url) => callback(err, url))
  }

  listObjects(bucketName, callback) {
    let isTruncated = true, list = [], marker = ''
    const self = this
    async.whilst(
      function test(cb) {
        cb(null, isTruncated)
      },
      function iter(cb) {
        let params = {Bucket: bucketName}
        if (marker) {
          params.Marker = marker
        }
        self._s3.listObjects(params, (err, data) => {
          if (err) return cb(err)
          isTruncated = data.IsTruncated
          list = _.concat(list, data.Contents)
          marker = data.NextMarker
          cb(null)
        })
      },
      function (err) {
        callback(err, list)
      }
    )

  }
}


module.exports = AwsClient
