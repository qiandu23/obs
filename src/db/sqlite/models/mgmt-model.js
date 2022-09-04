const {Sequelize, DataTypes} = require('sequelize')

class MgmtModel {
  constructor(options) {
    this._mgmtDb = options.mgmtDb
  }

  getAccountModel() {
    const self = this
    return self._mgmtDb.define('Account', {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        field: 'id',
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'name',
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'password',
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_admin',
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: '',
        field: 'description',
      },
      updateId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        field: 'update_id',
      },
      updateDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'update_date',
      },
    }, {
      timestamps: false,
      tableName: 'account'
    })
  }

  getStorageModel() {
    const self = this
    return self._mgmtDb.define('Storage', {
      id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        field: 'id',
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'name',
      },
      endpoint: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'endpoint',
      },
      accessKey: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'access_key',
      },
      secretKey: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'secret_key',
      },
      region: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'region',
        defaultValue: '',
      },
      updateId: {
        type: DataTypes.STRING(36),
        allowNull: false,
        field: 'update_id',
      },
      updateDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'update_date',
      },
    }, {
      timestamps: false,
      tableName: 'storage'
    })
  }
}

module.exports = MgmtModel
