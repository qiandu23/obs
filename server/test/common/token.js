const Logger = require('../../src/common/logger')
const Token = require('../../src/common/token')

describe('token function test', function () {
  let id,logger, token, username
  beforeEach(function () {
    id='test'
    username = 'test'
    logger = new Logger()
    token = new Token({logger})
  })

  it('sign token test', function (done) {
    token.signJWT(id,username, true,[],120, (err, jwt) => {
      if (err) {
        console.error(err)
        return done()
      }

      console.info(jwt)
      token.verifyJWT(jwt, username, (err, info) => {
        if (err) {
          console.error(err)
          return done()
        }

        console.info(info)

        done()
      })

    })
  })
})
