const async = require('async')
const {Op} = require('sequelize')
const MgmtModel = require('./models/mgmt-model')
const {encrypt, decrypt} = require('../../common/utils')
const _ = require('lodash')

class Storage {
  constructor(options) {
    this._logger = options.logger
    this._storageModel = new MgmtModel({
      logger: options.logger,
      mgmtDb: options.mgmtDb
    }).getStorageModel()
  }

  createStorage(name, endpoint, accessKey, secretKey, updateId, callback) {
    const self = this
    accessKey = encrypt(accessKey)
    secretKey = encrypt(secretKey)
    async.waterfall([
      cb => {
        self._storageModel.findAll({
          where: {
            name: {
              [Op.eq]: name
            }
          }
        }).then(list => {
          if (list && list.length > 0) {
            return cb(new Error(`storage ${name} has been exist`))
          }

          cb(null)
        }).catch(err => cb(err))
      },
      cb => {
        self._storageModel.create({
          name, endpoint, accessKey, secretKey, updateId,
        }).then(() => cb(null)).catch(err => cb(err))
      }
    ], err => callback(err))
  }

  updateStorage(id, endpoint, accessKey, secretKey, updateId, callback) {
    const self = this
    accessKey = encrypt(accessKey)
    secretKey = encrypt(secretKey)
    async.waterfall([
      cb => {
        self._storageModel.findAll({
          where: {
            id: {
              [Op.eq]: id
            }
          }
        }).then(list => {
          if (list.length === 0) {
            return cb(new Error('storage hasn\'t been exist'))
          }

          cb(null)
        }).catch(err => cb(err))
      },
      cb => {
        self._storageModel.update({
          endpoint, accessKey, secretKey, updateId,
        }, {
          where: {
            id
          }
        }).then(() => cb(null)).catch(err => cb(err))
      }
    ], err => callback(err))
  }

  deleteStorage(id, callback) {
    const self = this
    async.waterfall([
      cb => {
        self._storageModel.findAll({
          where: {
            id: {
              [Op.eq]: id
            }
          }
        }).then(list => {
          if (list.length === 0) {
            return cb(new Error('storage hasn\'t been exist'))
          }

          cb(null)
        }).catch(err => cb(err))
      },
      cb => {
        self._storageModel.destroy({
          where: {
            id
          }
        }).then(() => cb(null)).catch(err => cb(err))
      }
    ], err => callback(err))
  }

  getStorageInfo(name, updateId, callback) {
    const self = this
    async.waterfall([
      cb => {
        self._storageModel.findOne({
          where: {
            name: {
              [Op.eq]: name
            },
            updateId: {
              [Op.eq]: updateId
            },
          }
        }).then(storage => {
          if (!storage) {
            return cb(new Error(`storage ${name} hasn't been exist`))
          }

          cb(null, storage)
        }).catch(err => cb(err))
      },
    ], (err, storage) => {
      if (err) return callback(err)
      let {id, name, endpoint, accessKey, secretKey} = storage
      accessKey = decrypt(accessKey)
      secretKey = decrypt(secretKey)
      callback(null, {id, name, endpoint, accessKey, secretKey})
    })
  }

  listStorage(updateId, callback) {
    const self = this
    async.waterfall([
      cb => {
        self._storageModel.findAll({
          where: {
            updateId: {
              [Op.eq]: updateId
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
      let newList = []
      _.forEach(list, function (info) {
        let {id, name, endpoint, accessKey, secretKey} = info
        accessKey = decrypt(accessKey)
        secretKey = decrypt(secretKey)
        newList.push({id, name, endpoint, accessKey, secretKey})
      })
      callback(null, newList)
    })
  }
}

module.exports = Storage
