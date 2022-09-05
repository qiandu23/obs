const crypto = require('crypto')
const {svcName} = require('./constants')
const Storage = require('../db/sqlite/storage')

const iv = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d,
  0x0e, 0x0f]

const salt = svcName

const encrypt = (data) => {
  let md5 = crypto.createHash('md5').update(salt).digest('hex')
  const cipher = crypto.createCipheriv(
    'aes-128-cbc', Buffer.from(md5, 'hex'), Buffer.from(iv)
  )

  let encrypted = cipher.update(data, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  return encrypted
}

module.exports.encrypt = encrypt

const decrypt = (encryptedData) => {
  try {
    let md5 = crypto.createHash('md5').update(salt).digest('hex')
    const decipher = crypto.createDecipheriv(
      'aes-128-cbc', Buffer.from(md5, 'hex'), Buffer.from(iv)
    )
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (e) {
    return ''
  }

}

module.exports.decrypt = decrypt


module.exports.okResponse = (res, statusCode, jsonData) => {
  res.status(statusCode).json(jsonData ? jsonData : {})
}

module.exports.errorResponse = (res, statusCode, errorMessage) => {
  res.status(statusCode).json({
    message: errorMessage,
  })
}

module.exports.isNumber = (value) => {
  return /^\d+$/.test(value + '')
}

module.exports.getResponseError = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }

  return 'network error'
}

module.exports.authToken = (req, tokenInstance, callback) => {
  let {account, token} = req.headers
  if (!account) {
    return callback(new Error('account is empty'))
  }

  account = decodeURI(account)

  if (!token) {
    return callback(new Error('token is empty'))
  }

  tokenInstance.verifyJWT(token, account, (err, info) => callback(err, info))
}

module.exports.formatSize = (size) => {
  if (size / 1024 / 1024 / 1024 >= 1) {
    return Math.round(size / 1024 / 1024 / 1024 * 100) / 100 + ' GB'
  } else if (size / 1024 / 1024 > 1) {
    return Math.round(size / 1024 / 1024 * 100) / 100 + ' MB'
  } else if (size / 1024 > 1) {
    return Math.round(size / 1024 * 100) / 100 + ' KB'
  } else {
    return size + ' Byte'
  }
}

module.exports.containChinese = (value) => {
  return /.*[\u4e00-\u9fa5]+.*$/.test(value)
}

module.exports.getAWSClientConfig = (storageName, updateId, mgmtDb, logger, callback) => {
  const storage = new Storage({
    mgmtDb, logger
  })

  storage.getStorageInfo(storageName, updateId, (err, info) => {
    if (err) {
      return callback(err)
    }
    callback(null, info)
  })
}
