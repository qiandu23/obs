const {Sequelize} = require('sequelize')
const {dbInfo} = require('../../common/constants')

class Connection {
  constructor(options) {
    this._logger = options.logger
  }

  connect(callback) {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbInfo.storage,
      logging: false,
    })

    sequelize.authenticate().then(() => callback(null, sequelize)).catch(err => callback(err))
  }

  close(sequelize, callback) {
    sequelize.close().then(() => callback()).catch(err => callback(err))
  }
}

module.exports = Connection
