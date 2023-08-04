const async = require('async')
const _ = require('lodash')
const utils = require('../../common/utils')
const {httpCode,} = require('../../common/constants')
const Storage = require('../../db/sqlite/storage')
const Token = require('../../common/token')
const AWSClient = require('../../storage/aws-client')

class BucketController {
  constructor(options) {
    this._bucket = new Storage({
      mgmtDb: options.mgmtDb,
      logger: options.logger
    })

    this._token = new Token({
      logger: options.logger
    })

    this._logger = options.logger
    this._mgmtDb = options.mgmtDb
  }

  commonValid(res, name, storageName) {
    if (!name) {
      utils.errorResponse(res, httpCode.BadRequestError, 'bucket name is empty')
      return false
    }

    if (!storageName) {
      utils.errorResponse(res, httpCode.BadRequestError, 'storage name is empty')
      return false
    }

    return true
  }

  listBucket(req, res) {
    const self = this
    let isAuth = false
    let {storageName} = req.query
    storageName = decodeURI(storageName)

    if (!storageName) {
      utils.errorResponse(res, httpCode.BadRequestError, 'storage name is empty')
      return false
    }
    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err, account) => {
          if (err) {
            return cb(err)
          }

          const {id} = account.payload
          isAuth = true
          cb(null, id)
        })
      },
      (accountId, cb) => {
        const self = this
        utils.getAWSClientConfig(storageName, accountId, self._mgmtDb, self._logger, (err, info) => {
          if (err) return cb(err)
          cb(null, new AWSClient(info))
        })
      },
      (client, cb) => {
        client.listBuckets((err, list) => {
          if (err) return cb(err)
          const buckets = list.Buckets
          let newList = []
          _.forEach(buckets, info => {
            newList.push({
              name: info.Name
            })
          })
          cb(null, newList)
        })
      }
    ], (err, list) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, list)
    })
  }

  createBucket(req, res) {
    const self = this
    let isAuth = false
    const {name, storageName} = req.body

    const flag = self.commonValid(res, name, storageName)
    if (!flag) return

    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err, account) => {
          if (err) {
            return cb(err)
          }

          const {id} = account.payload
          isAuth = true
          cb(null, id)
        })
      },
      (accountId, cb) => {
        const self = this
        utils.getAWSClientConfig(storageName, accountId, self._mgmtDb, self._logger, (err, info) => {
          if (err) {
            return cb(err)
          }
          cb(null, new AWSClient(info))
        })
      },
      (client, cb) => {
        client.createBucket(name, err => cb(err))
      }
    ], (err) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        message: `bucket ${name} is created successfully.`
      })
    })
  }

  deleteBucket(req, res) {
    const self = this
    let isAuth = false
    const {name, storageName} = req.body

    const flag = self.commonValid(res, name, storageName)
    if (!flag) return

    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err, account) => {
          if (err) {
            return cb(err)
          }

          const {id} = account.payload
          isAuth = true
          cb(null, id)
        })
      },
      (accountId, cb) => {
        const self = this
        utils.getAWSClientConfig(storageName, accountId, self._mgmtDb, self._logger, (err, info) => {
          if (err) {
            return cb(err)
          }
          cb(null, new AWSClient(info))
        })
      },
      (client, cb) => {
        client.deleteBucket(name, err => cb(err))
      }
    ], (err) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        message: `bucket ${name} is deleted successfully.`
      })
    })
  }

  listObject(req, res) {
    const self = this
    let isAuth = false
    let {storageName, name, prefix, marker, maxKeys} = req.query
    storageName = decodeURI(storageName)
    name = decodeURI(name)
    prefix = decodeURI(prefix)
    marker = decodeURI(marker)
    maxKeys = decodeURI(maxKeys)

    if (!storageName || !utils.isNumber(maxKeys)) {
      utils.errorResponse(res, httpCode.BadRequestError, 'storage name is empty or not number')
      return false
    }

    if (!prefix || prefix === 'undefined') prefix = ''
    if (!marker || marker === 'undefined') marker = ''

    const flag = self.commonValid(res, name, storageName)
    if (!flag) return


    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err, account) => {
          if (err) {
            return cb(err)
          }

          const {id} = account.payload
          isAuth = true
          cb(null, id)
        })
      },
      (accountId, cb) => {
        const self = this
        utils.getAWSClientConfig(storageName, accountId, self._mgmtDb, self._logger, (err, info) => {
          if (err) return cb(err)
          cb(null, new AWSClient(info))
        })
      },
      (client, cb) => {
        client.listObject(name, prefix, marker, Number.parseInt(maxKeys), (err, list) => {
          if (err) return cb(err)
          const {IsTruncated, Contents, NextMarker, Marker} = list
          const objects = []
          _.forEach(Contents, info => {
            objects.push({
              name: info.Key,
              size: info.Size,
              lastModified: info.LastModified
            })
          })
          cb(null, {isTruncated: IsTruncated, objects, marker: Marker, nextMarker: NextMarker})
        })
      }
    ], (err, list) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, list)
    })
  }

  putObject(req, res) {
    const self = this
    let isAuth = false, storageName, bucket, prefix = '', file
    if (req.headers['x-custom-data']) {
      try {
        const customData = JSON.parse(decodeURI(req.headers['x-custom-data']))
        storageName = customData['storageName']
        bucket = customData['bucket']
        prefix = customData['prefix']
        file = customData['file']
      } catch (err) {
        self._logger.error(err.message)
      }
    }

    if (!storageName || !bucket) {
      utils.errorResponse(res, httpCode.BadRequestError, 'storage name is empty or bucket name is empty')
      return false
    }

    if (!file) {
      utils.errorResponse(res, httpCode.BadRequestError, 'upload file is empty')
      return false
    }

    const {name, size, type} = file
    if (!name || !(size && utils.isNumber(size))) {
      utils.errorResponse(res, httpCode.BadRequestError, 'upload file name is empty or file size is not number')
      return false
    }

    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err, account) => {
          if (err) {
            return cb(err)
          }

          const {id} = account.payload
          isAuth = true
          cb(null, id)
        })
      },
      (accountId, cb) => {
        const self = this
        utils.getAWSClientConfig(storageName, accountId, self._mgmtDb, self._logger, (err, info) => {
          if (err) return cb(err)
          cb(null, new AWSClient(info))
        })
      },
      (client, cb) => {
        client.createObject(bucket, `${prefix}${name}`, req, type, size, err => cb(err))
      }
    ], (err) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        message: `bucket ${bucket} is uploaded successfully.`
      })
    })
  }

  shareObject(req, res) {
    const self = this
    let isAuth = false
    let {bucketName, storageName, objectName} = req.query
    storageName = decodeURI(storageName)
    bucketName = decodeURI(bucketName)
    objectName = decodeURI(objectName)

    const flag = self.commonValid(res, bucketName, storageName)
    if (!flag) return

    if (!objectName) {
      utils.errorResponse(res, httpCode.BadRequestError, 'object name is empty')
      return false
    }

    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err, account) => {
          if (err) {
            return cb(err)
          }

          const {id} = account.payload
          isAuth = true
          cb(null, id)
        })
      },
      (accountId, cb) => {
        const self = this
        utils.getAWSClientConfig(storageName, accountId, self._mgmtDb, self._logger, (err, info) => {
          if (err) {
            return cb(err)
          }
          cb(null, new AWSClient(info))
        })
      },
      (client, cb) => {
        client.getDownloadUrl(bucketName, objectName, (err, url) => cb(err, url), objectName)
      }
    ], (err, url) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        url
      })
    })
  }

  deleteObject(req, res) {
    const self = this
    let isAuth = false
    const {bucketName, storageName, objectName} = req.body

    const flag = self.commonValid(res, bucketName, storageName)
    if (!flag) return

    if (!objectName) {
      utils.errorResponse(res, httpCode.BadRequestError, 'object name is empty')
      return false
    }

    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err, account) => {
          if (err) {
            return cb(err)
          }

          const {id} = account.payload
          isAuth = true
          cb(null, id)
        })
      },
      (accountId, cb) => {
        const self = this
        utils.getAWSClientConfig(storageName, accountId, self._mgmtDb, self._logger, (err, info) => {
          if (err) {
            return cb(err)
          }
          cb(null, new AWSClient(info))
        })
      },
      (client, cb) => {
        client.deleteObject(bucketName, objectName, err => cb(err))
      }
    ], (err) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        message: `object ${objectName} in bucket ${bucketName} is deleted successfully.`
      })
    })
  }
}

module.exports = BucketController
