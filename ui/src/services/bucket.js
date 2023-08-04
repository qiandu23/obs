import {httpRequestWithAuth, httpRequestPutFileWithAuth, getToken, getAccount} from '@/common'

class BucketService {
  listBucket(storageName) {
    return httpRequestWithAuth(getToken(), getAccount())
      .get(`/api/bucket/list-bucket?storageName=${encodeURI(storageName)}`)
  }

  createBucket(name, storageName) {
    return httpRequestWithAuth(getToken(), getAccount()).post('/api/bucket/create-bucket', {
      name, storageName
    })
  }

  deleteBucket(name, storageName) {
    return httpRequestWithAuth(getToken(), getAccount())({
      method: 'delete',
      url: '/api/bucket/delete-bucket',
      data: {name, storageName}
    })
  }

  listObject(storageName, name, prefix, marker, maxKeys) {
    return httpRequestWithAuth(getToken(), getAccount())
      .get('/api/bucket/list-object?' +
        `storageName=${encodeURI(storageName)}&name=${encodeURI(name)}&prefix=${encodeURI(prefix)}` +
        `&marker=${encodeURI(marker)}&maxKeys=${maxKeys}`)
  }

  uploadObject(storageName, bucketName, prefix, file, res) {
    const {name, size, type} = file
    return httpRequestPutFileWithAuth(getToken(), getAccount(), '/api/bucket/put-object', {
      storageName, bucket: bucketName, prefix, file: {name, size, type}
    }, res)
  }

  deleteObject(storageName, bucketName, objectName) {
    return httpRequestWithAuth(getToken(), getAccount())({
      method: 'delete',
      url: '/api/bucket/delete-object',
      data: {storageName, bucketName, objectName}
    })
  }

  shareObject(storageName, bucketName, objectName) {
    return httpRequestWithAuth(getToken(), getAccount())
      .get('/api/bucket/share-object?' +
        `storageName=${encodeURI(storageName)}&bucketName=${encodeURI(bucketName)}&objectName=${encodeURI(objectName)}`)
  }
}

export default BucketService
