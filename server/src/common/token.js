const {SignJWT} = require('jose/jwt/sign')
const {jwtVerify} = require('jose/jwt/verify')
const {jwtSecret, svcName} = require('./constants')

class Token {
  constructor(options) {
    this._logger = options.logger
    this._issuer = svcName
  }

  signJWT(id, username, isAdmin, accessList, expireTime, callback) {
    const self = this
    new SignJWT({id, username, isAdmin, accessList})
      .setProtectedHeader({alg: 'HS256'})
      .setIssuedAt()
      .setIssuer(self._issuer)
      .setAudience(username)
      .setExpirationTime(`${expireTime}s`)
      .sign(jwtSecret).then(token => callback(null, token)).catch(err => callback(err))
  }

  verifyJWT(jwt, username, callback) {
    const self = this
    jwtVerify(jwt, jwtSecret, {
      issuer: self._issuer,
      audience: username
    }).then(info => callback(null, info)).catch(err => {
      callback(err)
    })
  }
}

module.exports = Token
