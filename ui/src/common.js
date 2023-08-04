import axios from 'axios'
import CommonService from './services/common'
import moment from 'moment-timezone'


export const title = 'OBS Browser'
export const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:20000'

export const httpRequest = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-type': 'application/json'
  }
})

export const httpRequestWithAuth = (token, account) => {
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-type': 'application/json',
      'Token': token,
      'Account': encodeURI(account)
    }
  })
}

export const httpRequestPutFileWithAuth = (token, account, url, data, res) => {
  return axios({
    baseURL: baseUrl,
    method: 'PUT',
    headers: {
      'Content-type': 'application/octet-stream',
      'Token': token,
      'Account': encodeURI(account),
      'X-Custom-Data': encodeURI(JSON.stringify(data))
    },
    onUploadProgress: (event) => {
      event.percent = event.loaded / event.total * 100 | 0
      res.onProgress(event)
    },
    url,
    data: res.file,
    withCredentials: true,
  })
}

export const setToken = (token) => {
  localStorage.setItem('token', token)
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const removeToken = () => {
  localStorage.removeItem('token')
}

export const setAccount = (account) => {
  localStorage.setItem('account', account)
}

export const getAccount = () => {
  return localStorage.getItem('account')
}

export const removeAccount = () => {
  localStorage.removeItem('account')
}

export const getResponseError = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }

  return 'network error'
}

export const getResponseStatus = (error) => {
  if (error.response && error.response.status) {
    return error.response.status
  }

  return 500
}

export const getResponseJson = (res) => {
  if (res && res.data) {
    return res.data
  }

  return {}
}

export const authAccount = (callback) => {
  const commonService = new CommonService()
  commonService.authAccount().then((response) => {
    const {isAdmin} = response['data']
    callback(null, isAdmin)
  }).catch(err => {
    callback(new Error(getResponseError(err)))
  })
}

export const formatDate = (date) => {
  return moment(date).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
}

export const formatSize = (size) => {
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




