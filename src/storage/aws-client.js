const AWS = require('aws-sdk')
const async = require('async')
const {second, storageInfo, dogInfo} = require('../common/constants')
const fs = require('fs')
const fsExtra = require('fs-extra')
const path = require('path')
const _ = require('lodash')

class AwsClient {
  constructor(options = {}, isInternal = false, isDog = false) {
    if (isDog) {
      this._s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        endpoint: dogInfo.endpoint,
        s3ForcePathStyle: true,
        accessKeyId: dogInfo.accessKey,
        secretAccessKey: dogInfo.secretKey,
        httpOptions: {
          timeout: 15 * second,
          connectTimeout: 5 * second,
        }
      })
    } else {
      this._s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        endpoint: !isInternal ? storageInfo.endpoint : storageInfo.internalEndpoint,
        s3ForcePathStyle: true,
        accessKeyId: storageInfo.accessKey,
        secretAccessKey: storageInfo.secretKey,
        httpOptions: {
          timeout: 15 * second,
          connectTimeout: 5 * second,
        }
      })
    }

    this._logger = options.logger
  }

  downloadObject(bucketName, objectName, downloadPath, downloadName, callback) {
    const self = this
    fsExtra.ensureDirSync(downloadPath)
    async.waterfall([
      cb => {
        self._s3.getObject({Bucket: bucketName, Key: objectName}, (err, data) => {
          if (err) return cb(err)
          cb(null, data.Body)
        })
      },
      (data, cb) => {
        const fileName = path.resolve(downloadPath, downloadName)
        fsExtra.outputFile(fileName, data).then(() => cb()).catch(err => cb(err))
      }
    ], err => {
      if (err) return callback(err)
      callback()
    })
  }

  headObject(bucketName, objectName, callback) {
    this._s3.headObject({
      Bucket: bucketName,
      Key: objectName,
    }, (err, data) => callback(err, data))
  }

  deleteObject(bucketName, objectName, callback) {
    this._s3.deleteObject({
      Bucket: bucketName,
      Key: objectName,
    }, (err) => callback(err))
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

  putObject(bucketName, objectName, uploadFile, callback) {
    this._s3.putObject({
      Bucket: bucketName,
      Key: objectName,
      Body: fs.createReadStream(uploadFile)
    }, err => callback(err))
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
