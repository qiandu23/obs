const Logger = require('../../../src/common/logger')
const Connection = require('../../../src/db/sqlite/connection')
const Account = require('../../../src/db/sqlite/account')
const async = require('async')
const constants = require('../../../src/common/constants')
const accountInfo = constants.testAccount

describe('account table function test', function () {
  let logger, connection, account, mgmtDb
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
        account = new Account({
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

  it('create system account', function (done) {
    async.waterfall([
      cb => account.createSystemAccount(err => cb(err)),
    ], err => done(err))
  })

  it('create,get,update,list and delete account', function (done) {
    this.timeout(0)
    const {name, password, isAdmin, description} = accountInfo
    let id = ''
    async.waterfall([
      cb => account.createAccount(name, password, isAdmin, description, constants.adminName, err => cb(err)),
      cb => account.getAccountInfo(name, password, (err, info) => {
        if (err) return cb(err)
        logger.info(info)
        id = info.id
        cb(null)
      }),
      (cb) => account.updateAccount(id, name, isAdmin, 'I am updated.',
        constants.adminName, err => cb(err)),
      cb => account.listAccount((err, list) => {
        if (err) return cb(err)
        logger.info(list)
        cb(null)
      }),
      cb => account.deleteAccount(id, constants.adminName, err => cb(err)),
    ], err => {
      if (err) logger.error(err)
      done(null)
    })
  })
})
