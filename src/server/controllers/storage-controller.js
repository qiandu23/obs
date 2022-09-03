const async = require('async')
const utils = require('../../common/utils')
const {httpCode,} = require('../../common/constants')
const Storage = require('../../db/sqlite/storage')
const Token = require('../../common/token')

class StorageController {
  constructor(options) {
    this._storage = new Storage({
      mgmtDb: options.mgmtDb,
      logger: options.logger
    })

    this._token = new Token({
      logger: options.logger
    })
  }

  commonValid(res, name, endpoint, accessKey, secretKey) {
    if (!name) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'storage name is empty')
    }

    if (!endpoint) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'storage endpoint is empty')
    }

    if (!accessKey) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'storage accessKey is empty')
    }

    if (!secretKey) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'storage secretKey is empty')
    }
  }

  listStorage(req, res) {
    const self = this
    let isAuth = false

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
        self._storage.listStorage(accountId, (err, list) => cb(err, list))
      }
    ], (err, list) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, list)
    })
  }

  createStorage(req, res) {
    const self = this
    let isAuth = false
    const {name, endpoint, accessKey, secretKey} = req.body

    self.commonValid(res, name, endpoint, accessKey, secretKey)

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
        self._storage.createStorage(name, endpoint, accessKey, secretKey, accountId,
          (err) => cb(err))
      }
    ], (err) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        message: `storage ${name} is created successfully.`
      })
    })
  }

  updateStorage(req, res) {
    const self = this
    let isAuth = false
    const {id, name, endpoint, accessKey, secretKey} = req.body
    if (!id) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'storage id is empty')
    }

    self.commonValid(res, name, endpoint, accessKey, secretKey)

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
        self._storage.updateStorage(id, endpoint, accessKey, secretKey, accountId, (err) => cb(err))
      }
    ], (err) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        message: `storage ${name} is updated successfully.`
      })
    })
  }

  deleteStorage(req, res) {
    const self = this
    let isAuth = false
    const {id, name} = req.body
    if (!id) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'storage id is empty')
    }

    if (!name) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'storage name is empty')
    }

    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err) => {
          if (err) {
            return cb(err)
          }

          isAuth = true
          cb(null)
        })
      },
      cb => {
        self._storage.deleteStorage(id, err => cb(err))
      }
    ], (err) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        message: `storage ${name} is deleted successfully.`
      })
    })
  }
}

module.exports = StorageController
