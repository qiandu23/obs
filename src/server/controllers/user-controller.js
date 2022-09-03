const async = require('async')
const utils = require('../../common/utils')
const {httpCode, tokenExpireTime} = require('../../common/constants')
const Account = require('../../db/sqlite/account')
const Token = require('../../common/token')

class UserController {
  constructor(options) {
    this._account = new Account({
      mgmtDb: options.mgmtDb,
      logger: options.logger
    })
    this._tokenExpireTime = tokenExpireTime
    this._token = new Token({
      logger: options.logger
    })
  }

  helloWorld(req, res) {
    const self = this
    utils.authToken(req, self._token, (err) => {
      if (err) {
        return utils.errorResponse(res, httpCode.UnauthorizedError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        message: 'hello world'
      })
    })
  }

  signInUser(req, res) {
    const self = this
    const {name, password} = req.body
    if (!name) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'account name is empty')
    }

    if (!password) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'account password is empty')
    }
    let isAuth = false
    async.waterfall([
      cb => {
        self._account.getAccountInfo(name, password, (err, account) => {
          if (err) {
            return cb(err)
          }

          isAuth = true
          cb(null, account)
        })
      },
      (account, cb) => {
        const {id, isAdmin, accessList} = account
        self._token.signJWT(id, name, isAdmin, accessList, self._tokenExpireTime, (err, token) => {
          cb(err, token, isAdmin)
        })
      },
    ], (err, token, isAdmin) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError,
          `account sign in error: ${err.message}`)
      }

      utils.okResponse(res, httpCode.OK, {
        token, isAdmin
      })
    })
  }

  signOutUser(req, res) {
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
    ], (err, accountId) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError,
          `account sign out error: ${err.message}`)
      }

      utils.okResponse(res, httpCode.OK, {
        message: `account ${accountId} sign out successfully.`
      })
    })
  }

  authAccountUser(req, res) {
    const self = this
    utils.authToken(req, self._token, (err, info) => {
      if (err) {
        return utils.errorResponse(res, httpCode.UnauthorizedError,
          `account authentication error: ${err.message}`)
      }

      const {isAdmin} = info.payload
      return utils.okResponse(res, httpCode.OK, {isAdmin})
    })
  }

  changeSelfPassword(req, res) {
    const self = this
    let isAuth = false
    const {name, oldPassword, newPassword} = req.body
    if (!oldPassword) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'account old password is empty')
    }

    if (!newPassword) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'account new password is empty')
    }

    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err, account) => {
          if (err) {
            return cb(err)
          }

          const {username} = account.payload
          isAuth = true
          cb(null, username)
        })
      },
      (account, cb) => {
        self._account.changeSelfPassword(account, oldPassword, newPassword,
          (err) => cb(err))
      }
    ], (err) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        message: `account ${name} password is modified successfully.`
      })
    })
  }

  changeSelfNickname(req, res) {
    const self = this
    let isAuth = false
    const {name,} = req.body
    if (!name) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'account name is empty')
    }

    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err, account) => {
          if (err) {
            return cb(err)
          }

          const info = account.payload
          isAuth = true
          cb(null, info)
        })
      },
      (info, cb) => {
        self._account.changeNickname(info.id, name, err => {
          if (err) return cb(err)
          self._token.signJWT(info.id, name, info.isAdmin, '', tokenExpireTime,
            (err, token) => cb(err, token))
        })
      }
    ], (err, token) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        message: `account ${name} nickname is modified successfully.`,
        token
      })
    })
  }

  updateToken(req, res) {
    const self = this
    let isAuth = false
    const {name,} = req.body
    if (!name) {
      return utils.errorResponse(res, httpCode.BadRequestError, 'account name is empty')
    }

    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err, account) => {
          if (err) {
            return cb(err)
          }

          const info = account.payload
          isAuth = true
          cb(null, info)
        })
      },
      (info, cb) => {
        self._token.signJWT(info.id, name, info.isAdmin, '', tokenExpireTime,
          (err, token) => cb(err, token))
      }
    ], (err, token) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {
        message: `account ${name} token is updated successfully.`,
        token
      })
    })
  }

  getAdminRole(req, res) {
    const self = this
    let isAuth = false

    async.waterfall([
      cb => {
        utils.authToken(req, self._token, (err, account) => {
          if (err) {
            return cb(err)
          }

          const {isAdmin} = account.payload
          isAuth = true
          cb(null, isAdmin)
        })
      },
    ], (err, isAdmin) => {
      if (err) {
        return utils.errorResponse(res, !isAuth ? httpCode.UnauthorizedError : httpCode.InternalServerError, err.message)
      }

      utils.okResponse(res, httpCode.OK, {isAdmin})
    })
  }
}

module.exports = UserController
