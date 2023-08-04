const axios = require('axios')
const {requestTimeout} = require('../../src/common/constants')
const {getResponseError} = require('../../src/common/utils')
const {serverInfo, adminName, adminPassword} = require('../../src/common/constants')

describe('user api function test', function () {
  let accountName = adminName
  let accountPassword = adminPassword
  const {baseUrl} = serverInfo
  let headers = {
    'Content-type': 'application/json',
    'Token': '',
    'Account': encodeURI(accountName)
  }

  beforeEach(function (done) {
    let config = {
      url: `${baseUrl}/api/user/sign-in`,
      method: 'POST',
      timeout: requestTimeout,
      data: {
        name: accountName,
        password: accountPassword
      }
    }

    axios(config).then(response => {
      const {token} = response['data']
      headers['Token'] = token
      done()
    }).catch(err => {
      console.info(getResponseError(err))
      done(err)
    })
  })

  it('user get admin role', function (done) {
    let config = {
      url: `${baseUrl}/api/user/get-admin-role`,
      method: 'GET',
      timeout: requestTimeout,
      headers
    }

    axios(config).then(response => {
      const {isAdmin} = response['data']
      console.info(`admin role: ${isAdmin}`)
      done()
    }).catch(err => {
      console.info(getResponseError(err))
      done(err)
    })
  })
})
