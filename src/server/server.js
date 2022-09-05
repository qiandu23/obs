const express = require('express')
const http = require('http')
const async = require('async')
const fs = require('fs-extra')
const path = require('path')
const cors = require('cors')
const bodyParser = require('body-parser')
const {staticDirectoryList, serverInfo} = require('../common/constants')
const UserController = require('./controllers/user-controller')
const StorageController = require('./controllers/storage-controller')
const BucketController = require('./controllers/bucket-controller')
const Connection = require('../db/sqlite/connection')
const Account = require('../db/sqlite/account')

class Server {
  constructor(options) {
    this._logger = options.logger
    this._server = null
    const {host, port, baseUrl} = serverInfo
    this._host = host
    this._port = port
    this._baseUrl = baseUrl
    this._homeDir = process.env.HOME_DIR ? process.env.HOME_DIR : process.cwd()
    this._mgmtDb = null
  }

  _connectManagementDatabase(callback) {
    const self = this
    const connection = new Connection({
      logger: self._logger
    })

    connection.connect((err, mgmtDb) => callback(err, mgmtDb))
  }

  _initApp(callback) {
    const self = this
    let app = express()
    fs.ensureDirSync(path.join(self._homeDir, 'dist'))
    async.waterfall([
      cb => {
        self._connectManagementDatabase((err, mgmtDb) => {
          if (err) {
            return cb(err)
          }

          self._mgmtDb = mgmtDb
          cb(null)
        })
      },
      cb => {
        const account = new Account({mgmtDb: self._mgmtDb, logger: self._logger})
        account.createSystemAccount(err => cb(err))
      }], err => {
      if (err) {
        return callback(err)
      }

      callback(null, app)
    })
  }

  _initMiddleware(app, callback) {
    const self = this
    app.use(cors({
      origin: true,
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Account', 'Token'],
      credentials: true
    }))

    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
    for (let staticDirectory of staticDirectoryList) {
      app.use(staticDirectory, express.static(path.join(self._homeDir, 'dist')))
    }

    callback(null, app)
  }

  _initApiRouter(app, callback) {
    const self = this
    const userController = new UserController({logger: self._logger, mgmtDb: self._mgmtDb})
    const storageController = new StorageController({logger: self._logger, mgmtDb: self._mgmtDb})
    const bucketController = new BucketController({logger: self._logger, mgmtDb: self._mgmtDb})

    app.get('/api/test', userController.helloWorld.bind(userController))

    app.post('/api/user/sign-in', userController.signInUser.bind(userController))
    app.get('/api/user/sign-out', userController.signOutUser.bind(userController))
    app.get('/api/user/auth-account', userController.authAccountUser.bind(userController))
    app.get('/api/user/get-admin-role', userController.getAdminRole.bind(userController))
    app.post('/api/user/change-password', userController.changeSelfPassword.bind(userController))
    app.post('/api/user/change-nickname', userController.changeSelfNickname.bind(userController))
    app.post('/api/user/update-token', userController.updateToken.bind(userController))

    app.get('/api/storage/list-storage', storageController.listStorage.bind(storageController))
    app.get('/api/storage/list-storage-names', storageController.listStorageNames.bind(storageController))
    app.post('/api/storage/create-storage', storageController.createStorage.bind(storageController))
    app.put('/api/storage/update-storage', storageController.updateStorage.bind(storageController))
    app.delete('/api/storage/delete-storage', storageController.deleteStorage.bind(storageController))

    app.get('/api/bucket/list-bucket', bucketController.listBucket.bind(bucketController))
    app.get('/api/bucket/list-object', bucketController.listObject.bind(bucketController))
    app.post('/api/bucket/create-bucket', bucketController.createBucket.bind(bucketController))
    app.delete('/api/bucket/delete-bucket', bucketController.deleteBucket.bind(bucketController))

    app.use('*', express.static(path.join(self._homeDir, 'dist')))
    callback(null, app)
  }

  _runServer(app, callback) {
    const self = this
    self._server = http.createServer(app)
    self._server.listen(self._port, self._host, (err) => {
      return callback(err)
    })

    self._server.on('error', (err) => {
      self._logger.warn(`server error: ${err.message}`)
    })
  }

  _handleException(err) {
    if (err) {
      this._logger.error(err)
      this._logger.warn(err.message)
    }
  }

  _handleSignal(signal) {
    if (signal) {
      this._logger.info(`receive signal: ${signal}`)
    }

    process.exit()
  }

  start(callback) {
    const self = this

    async.waterfall([
      self._initApp.bind(self),
      self._initMiddleware.bind(self),
      self._initApiRouter.bind(self),
      self._runServer.bind(self),], (err) => {
      if (err) {
        return callback(err)
      }

      self._logger.info(`server is started, endpoint: ${self._baseUrl}`)
      process.on('SIGINT', self._handleSignal.bind(self))
      process.on('SIGTERM', self._handleSignal.bind(self))
      process.on('exit', self._handleSignal.bind(self))
      process.on('uncaughtException', self._handleException.bind(self))

      let version = 'unknown'
      try {
        version = fs.readJsonSync(path.join(self._homeDir, 'version.json')).version
        self._logger.info(`version: ${version}`)
      } catch (e) {
        self._logger.warn('invalid version file')
      }

      callback()
    })
  }
}

module.exports = Server
