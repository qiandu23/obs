const Logger = require('../../../src/common/logger')
const Connection = require('../../../src/db/sqlite/connection')
const Storage = require('../../../src/db/sqlite/storage')
const async = require('async')
const constants = require('../../../src/common/constants')
const {adminId} = require('../../../src/common/constants')
const storageInfo = constants.testStorage

describe('storage table function test', function () {
  let logger, connection, storage, mgmtDb
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

  it('create,get,update,list and delete storage', function (done) {
    this.timeout(0)
    const {name, endpoint, accessKey, secretKey} = storageInfo
    let id = ''
    async.waterfall([
      cb => storage.createStorage(name, endpoint, accessKey, secretKey, constants.adminId, err => cb(err)),
      cb => storage.getStorageInfo(name, adminId, (err, info) => {
        if (err) return cb(err)
        logger.info(info)
        id = info.id
        cb(null)
      }),
      (cb) => storage.updateStorage(id, name, accessKey, 'ChangeMe',
        constants.adminId, err => cb(err)),
      cb => storage.listStorage(adminId, (err, list) => {
        if (err) return cb(err)
        logger.info(list)
        cb(null)
      }),
      cb => storage.deleteStorage(id, err => cb(err)),
    ], err => {
      if (err) logger.error(err)
      done(null)
    })
  })
})
