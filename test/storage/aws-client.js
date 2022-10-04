const Logger = require('../../src/common/logger')
const Connection = require('../../src/db/sqlite/connection')
const Storage = require('../../src/db/sqlite/storage')
const AWSClient = require('../../src/storage/aws-client')
const async = require('async')
const {adminId} = require('../../src/common/constants')
const fs=require('fs')

describe('aws client function test',
  function () {
    let logger, connection, storage, mgmtDb,
      storageName = 'aliyun-test', bucketName = 'qiandu-test1', objectName = 'test.txt'
    beforeEach(function (done) {
      logger = new Logger()
      connection = new Connection({logger})
      async.waterfall([
        cb => {
          connection.connect((err, db) => {
            mgmtDb = db
            cb(err)
          })
        },
        cb => {
          storage = new Storage({
            logger, mgmtDb
          })
          cb(null)
        }
      ], err => {
        done(err)
      })
    })

    afterEach(done => {
      connection.close(mgmtDb, err => done(err))
    })

    it('list buckets', function (done) {
      this.timeout(0)
      async.waterfall([
        cb => storage.getStorageInfo(storageName, adminId, (err, info) => {
          if (err) return cb(err)
          cb(null, info)
        }),
        (info, cb) => {
          const awsClient = new AWSClient(info)
          awsClient.listBuckets((err, data) => cb(err, data))
        }
      ], (err, list) => {
        if (err) {
          logger.error(err)
          return
        }
        logger.info(list)
        done()
      })
    })

    it('create and delete bucket, meanwhile create,head and delete object', function (done) {
      this.timeout(0)
      async.waterfall([
        cb => storage.getStorageInfo(storageName, adminId, (err, info) => {
          if (err) return cb(err)
          cb(null, info)
        }),
        (info, cb) => {
          const awsClient = new AWSClient(info)
          awsClient.createBucket(bucketName, (err, data) => {
            if (err) return cb(err)
            logger.info(data)
            cb(null, info)
          })
        },
        (info, cb) => {
          const awsClient = new AWSClient(info)
          awsClient.createObject(bucketName, objectName, fs.createReadStream('5GB.txt'), (err, data) => {
            if (err) return cb(err)
            logger.info(data)
            cb(null, info)
          })
        },
        (info, cb) => {
          const awsClient = new AWSClient(info)
          awsClient.headObject(bucketName, objectName, (err, data) => {
            if (err) return cb(err)
            logger.info(data)
            cb(null, info)
          })
        },
        (info, cb) => {
          const awsClient = new AWSClient(info)
          awsClient.deleteObject(bucketName, objectName, (err, data) => {
            if (err) return cb(err)
            logger.info(data)
            cb(null, info)
          })
        },
        (info, cb) => {
          const awsClient = new AWSClient(info)
          awsClient.deleteBucket(bucketName, (err, data) => {
            if (err) return cb(err)
            logger.info(data)
            cb(null)
          })
        }
      ], err => {
        if (err) logger.error(err)
        done()
      })
    })
  })
