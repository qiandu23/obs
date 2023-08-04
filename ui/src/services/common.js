import {httpRequest, httpRequestWithAuth, getToken, getAccount} from '@/common'


class CommonService {
  signIn(username, password) {
    return httpRequest.post('/api/user/sign-in', {
      name: username,
      password: password
    })
  }

  signOut() {
    return httpRequestWithAuth(getToken(), getAccount()).get('/api/user/sign-out')
  }

  authAccount() {
    return httpRequestWithAuth(getToken(), getAccount()).get('/api/user/auth-account')
  }

  getAdminRole() {
    return httpRequestWithAuth(getToken(), getAccount()).get('/api/user/get-admin-role')
  }

  changePassword(name, oldPassword, newPassword) {
    return httpRequestWithAuth(getToken(), getAccount()).post('/api/user/change-password', {
      name, oldPassword, newPassword
    })
  }

  changeNickname(name) {
    return httpRequestWithAuth(getToken(), getAccount()).post('/api/user/change-nickname', {
      name
    })
  }

  updateToken() {
    return httpRequestWithAuth(getToken(), getAccount()).post('/api/user/update-token', {
      name: getAccount()
    })
  }
}

export default CommonService
