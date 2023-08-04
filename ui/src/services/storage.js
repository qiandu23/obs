import {httpRequestWithAuth, getToken, getAccount} from '@/common'

class StorageService {
  listStorage() {
    return httpRequestWithAuth(getToken(), getAccount()).get('/api/storage/list-storage')
  }

  listStorageNames() {
    return httpRequestWithAuth(getToken(), getAccount()).get('/api/storage/list-storage-names')
  }

  createStorage(name, endpoint, accessKey, secretKey, pathStyle, region) {
    return httpRequestWithAuth(getToken(), getAccount()).post('/api/storage/create-storage', {
      name, endpoint, accessKey, secretKey, pathStyle, region,
    })
  }

  updateStorage(id, name, endpoint, accessKey, secretKey, pathStyle, region) {
    return httpRequestWithAuth(getToken(), getAccount()).put('/api/storage/update-storage', {
      id, name, endpoint, accessKey, secretKey, pathStyle, region,
    })
  }

  deleteStorage(id, name) {
    return httpRequestWithAuth(getToken(), getAccount())({
      method: 'delete',
      url: '/api/storage/delete-storage',
      data: {id, name}
    })
  }
}

export default StorageService
