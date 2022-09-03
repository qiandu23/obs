const async = require('async')
const {Op} = require('sequelize')
const MgmtModel = require('./models/mgmt-model')
const {adminId, adminName,adminPassword} = require('../../common/constants')

class Account {
  constructor(options) {
    this._logger = options.logger
    this._systemName = adminName
    this._accountModel = new MgmtModel({
      logger: options.logger,
      mgmtDb: options.mgmtDb
    }).getAccountModel()
  }

  createSystemAccount(callback) {
    const self = this
    async.waterfall([
      cb => {
        self._accountModel.findAll({
          where: {
            name: {
              [Op.eq]: self._systemName
            }
          }
        }).then(list => {
          if (list && list.length > 0) {
            return cb(null, true)
          }

          cb(null, false)
        }).catch(err => {
          cb(err)
        })
      },
      (isExist, cb) => {
        if (isExist) {
          self._logger.info('administrator has been exist')
          return cb(null)
        }

        self._accountModel.create({
          id: adminId,
          name: self._systemName,
          password: adminPassword,
          description: 'This is a system administrator',
          isAdmin: true,
          updateId: adminId,
        }).then(() => cb(null)).catch(err => cb(err))
      },
    ], err => callback(err))
  }

  createAccount(name, password, isAdmin, description, updateName, callback) {
    const self = this
    async.waterfall([
      cb => {
        self._accountModel.findAll({
          where: {
            name: {
              [Op.eq]: name
            }
          }
        }).then(list => {
          if (list && list.length > 0) {
            return cb(new Error(`account ${name} has been exist`))
          }

          cb(null)
        }).catch(err => cb(err))
      },
      cb => {
        self._accountModel.findOne({
          where: {
            name: {
              [Op.eq]: updateName
            }
          }
        }).then(account => {
          if (!account) {
            return cb(new Error('operation account hasn\'t been exist'))
          }

          cb(null, account.id)
        }).catch(err => cb(err))
      },
      (updateId, cb) => {
        self._accountModel.create({
          name, password, description, isAdmin, updateId
        }).then(() => cb(null)).catch(err => cb(err))
      }
    ], err => callback(err))
  }

  updateAccount(id, name, isAdmin, description, updateName, callback) {
    const self = this
    async.waterfall([
      cb => {
        self._accountModel.findAll({
          where: {
            id: {
              [Op.eq]: id
            }
          }
        }).then(list => {
          if (list.length === 0) {
            return cb(new Error('account hasn\'t been exist'))
          }

          cb(null)
        }).catch(err => cb(err))
      },
      cb => {
        self._accountModel.findOne({
          where: {
            name: {
              [Op.eq]: updateName
            }
          }
        }).then(account => {
          if (!account) {
            return cb(new Error('operation account hasn\'t been exist'))
          }

          cb(null, account.id)
        }).catch(err => cb(err))
      },
      (updateId, cb) => {
        self._accountModel.update({
          name, description, isAdmin, updateId
        }, {
          where: {
            id
          }
        }).then(() => cb(null)).catch(err => cb(err))
      }
    ], err => callback(err))
  }

  deleteAccount(id, updateName, callback) {
    const self = this
    async.waterfall([
      cb => {
        self._accountModel.findAll({
          where: {
            id: {
              [Op.eq]: id
            }
          }
        }).then(list => {
          if (list.length === 0) {
            return cb(new Error('account hasn\'t been exist'))
          }

          cb(null)
        }).catch(err => cb(err))
      },
      cb => {
        self._accountModel.findOne({
          where: {
            name: {
              [Op.eq]: updateName
            }
          }
        }).then(account => {
          if (!account) {
            return cb(new Error('operation account hasn\'t been exist'))
          }

          cb(null)
        }).catch(err => cb(err))
      },
      cb => {
        self._accountModel.destroy({
          where: {
            id
          }
        }).then(() => cb(null)).catch(err => cb(err))
      }
    ], err => callback(err))
  }

  getAccountInfo(name, password, callback) {
    const self = this
    async.waterfall([
      cb => {
        self._accountModel.findOne({
          where: {
            name: {
              [Op.eq]: name
            }
          }
        }).then(account => {
          if (!account) {
            return cb(new Error(`account ${name} hasn't been exist`))
          }

          cb(null, account)
        }).catch(err => cb(err))
      },
      (account, cb) => {
        if (account.password !== password) {
          return cb(new Error(`account ${name} password is incorrect`))
        }

        cb(null, account)
      }
    ], (err, account) => {
      if (err) return callback(err)
      callback(null, account)
    })
  }

  listAccount(callback) {
    const self = this
    async.waterfall([
      cb => {
        self._accountModel.findAll({
          where: {
            isAdmin: {
              [Op.eq]: false
            }
          },
          order: [
            ['updateDate', 'DESC']
          ]
        }).then(list => {
          cb(null, list)
        }).catch(err => cb(err))
      },
    ], (err, list) => {
      if (err) return callback(err)
      callback(null, list)
    })
  }

  changeAccountPassword(id, password, callback) {
    const self = this
    async.waterfall([
      cb => {
        self._accountModel.update({
          password
        }, {
          where: {
            id
          }
        }).then(() => cb(null)).catch(err => cb(err))
      }
    ], err => callback(err))
  }

  changeNickname(id, name, callback) {
    const self = this
    async.waterfall([
      cb => {
        self._accountModel.update({
          name
        }, {
          where: {
            id
          }
        }).then(() => cb(null)).catch(err => cb(err))
      }
    ], err => callback(err))
  }

  changeSelfPassword(name, oldPassword, newPassword, callback) {
    const self = this
    async.waterfall([
      cb => {
        self.getAccountInfo(name, oldPassword, (err, account) => cb(err, account))
      },
      (account, cb) => {
        self._accountModel.update({
          password: newPassword
        }, {
          where: {
            id: account.id
          }
        }).then(() => cb(null)).catch(err => cb(err))
      }
    ], err => callback(err))
  }
}

module.exports = Account
