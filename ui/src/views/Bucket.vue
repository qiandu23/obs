<template>
  <div>
    <UIHeader>
    </UIHeader>
    <el-row>
      <el-col :offset="1" :span="22">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-link type="primary" @click="listBucket"><span>Bucket</span></el-link>
            <span v-if="!isBucket"> / {{ currentBucket }}</span>
            <el-row style="float: right;">
              <el-col :span="12" v-if="!isBucket">
                <el-input placeholder="Object Prefix" v-model="prefix"
                          :style="isMobile?'margin-right:5px':'margin-right:5px;margin-top: -10px'">
                  <el-button slot="append" icon="el-icon-search" @click="clickPrefixSearch"></el-button>
                </el-input>
              </el-col>
              <el-col :span="isBucket?18:8">
                <el-select v-model="selectedStorageName" placeholder="Please Choice" @change="changeSelectedStorage"
                           :style="isMobile?'margin-left:5px;margin-right:5px'
                           :'margin-left:5px;margin-right:5px;margin-top: -10px'">
                  <el-option
                      v-for="item in storageNames"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-button type="primary" v-if="isBucket"
                           :style="isMobile?'':'margin-top: -5px'"
                           size="small" icon="el-icon-plus"
                           @click="openCreateDialog">New
                </el-button>
                <el-button type="primary" v-if="!isBucket"
                           :style="isMobile?'':'margin-top: -5px'"
                           size="small" icon="el-icon-upload"
                           @click="openUploadObjectDialog">Upload
                </el-button>
              </el-col>
            </el-row>
          </div>
          <div v-if="isBucket">
            <el-table
                :data="tableData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
                border
                style="width: 100%">
              <el-table-column
                  sortable
                  align="center"
                  prop="name"
                  label="Name">
              </el-table-column>
              <el-table-column label="Operation" align="center">
                <template slot-scope="scope">
                  <el-dropdown size="mini" @command="(command)=>handleOperationClick(command,scope.row)">
                    <el-button size="mini" type="primary">
                      Operation<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="visit" class="dropdown-item"><i
                          class="el-icon-right el-icon--left"></i>Visit
                      </el-dropdown-item>
                      <el-dropdown-item command="del" class="dropdown-item"><i class="el-icon-delete el-icon--left"></i>Delete
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="!isBucket">
            <el-table
                :data="objectData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
                border
                style="width: 100%">
              <el-table-column
                  sortable
                  align="left"
                  prop="name"
                  label="Name"
                  width="300">
              </el-table-column>
              <el-table-column
                  sortable
                  align="center"
                  prop="size"
                  label="Size"
                  width="100"
                  :formatter="row=>formatSize(row.size)">
              </el-table-column>
              <el-table-column
                  sortable
                  align="center"
                  prop="lastModified"
                  label="Last Modified"
                  :formatter="row=>formatDate(row.lastModified)">
              </el-table-column>
              <el-table-column label="Operation" align="center">
                <template slot-scope="scope">
                  <el-dropdown size="mini" @command="(command)=>handleObjectOperationClick(command,scope.row)">
                    <el-button size="mini" type="primary">
                      Operation<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="share" class="dropdown-item"><i
                          class="el-icon-share el-icon--left"></i>Share
                      </el-dropdown-item>
                      <el-dropdown-item command="del" class="dropdown-item"><i class="el-icon-delete el-icon--left"></i>Delete
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
            <div style="margin-top: 10px">
              <el-button size="mini" v-if="isTruncated" @click="nextObjectPagination">Next<i
                  class="el-icon-arrow-right el-icon--right"></i>
              </el-button>
            </div>
          </div>
        </el-card>

      </el-col>
    </el-row>

    <el-dialog :title="formTitle" :visible.sync="formVisible" :close-on-click-modal="false"
               :width="isMobile?'95%':'50%'">
      <el-form :model="form">
        <el-input v-model="form.id" type="hidden"></el-input>
        <el-form-item label="Storage" :label-width="formLabelWidth">
          <el-input v-model="selectedStorageName" maxlength="20" show-word-limit readonly="readonly"></el-input>
        </el-form-item>
        <el-form-item label="Name" :label-width="formLabelWidth">
          <el-input v-model="form.name" maxlength="20" show-word-limit :readonly="!isAdd"></el-input>
        </el-form-item>
        <el-alert
            @close="clearFormErrorMessage"
            v-show="!!formErrorMessage"
            :title="formErrorMessage"
            type="error">
        </el-alert>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="formVisible = false">Cancel</el-button>
        <el-button type="primary" @click="confirmCreateBucket">Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="Upload Objects" :visible.sync="formObjectVisible" :close-on-click-modal="false"
               @closed="closeUploadObjectDialog"
               :width="isMobile?'95%':'50%'">
      <el-form :model="form">
        <el-form-item label="Storage" :label-width="formLabelWidth">
          <el-input v-model="selectedStorageName" :readonly="true"></el-input>
        </el-form-item>
        <el-form-item label="Bucket" :label-width="formLabelWidth">
          <el-input v-model="currentBucket" :readonly="true"></el-input>
        </el-form-item>
        <el-form-item label="Prefix" :label-width="formLabelWidth">
          <el-input v-model="prefix"></el-input>
        </el-form-item>
        <el-form-item label="Object" :label-width="formLabelWidth">
          <el-upload
              ref="upload"
              action=""
              :auto-upload="false"
              :http-request="confirmUploadObject"
              :multiple="true"
              :on-exceed="exceedFile"
              :on-success="onFileUploadSuccess"
              :on-error="onFileUploadError"
          >
            <el-button slot="trigger" size="small" type="primary">Choose Files</el-button>
          </el-upload>
        </el-form-item>
        <el-alert
            @close="clearFormErrorMessage"
            v-show="!!formObjectErrorMessage"
            :title="formObjectErrorMessage"
            type="error">
        </el-alert>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="formObjectVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitFile">Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="Share Link" :visible.sync="formDownloadVisible" :close-on-click-modal="false"
               :width="isMobile?'95%':'50%'">
      <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6}"
          v-model="formDownloadUrl" :readonly="true" resize="none">
      </el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="()=>{this.formDownloadVisible=false}">Close
        </el-button>
        <el-button type="primary"><a :href="formDownloadUrl" style="color: aliceblue;text-decoration:none">Download</a>
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import UIHeader from '../components/ui-header'
import {getResponseError, getResponseJson, getResponseStatus, formatSize, formatDate, setToken} from '@/common'
import BucketService from '../services/bucket'
import CommonService from "@/services/common";
import async from 'async'
import viewportSize from "get-viewport-size";
import StorageService from "@/services/storage";
import _ from 'lodash'

const storageService = new StorageService()
const bucketService = new BucketService()
const commonService = new CommonService()
export default {
  name: 'Bucket',
  data() {
    return {
      search: '',
      tableData: [],
      objectData: [],
      isAdd: false,
      formVisible: false,
      formObjectVisible: false,
      formDownloadVisible: false,
      form: {
        id: '',
        name: '',
        storageName: ''
      },
      formLabelWidth: '100px',
      formErrorMessage: '',
      formObjectErrorMessage: '',
      formTitle: '',
      adminSelect: {
        options: [],
        selectedValue: ''
      },
      viewWidth: viewportSize().width,
      isMobile: viewportSize().width < 768,
      storageNames: [{
        value: '',
        label: 'No Storage'
      }],
      selectedStorageName: '',
      maxKeys: 200,
      isBucket: true,
      currentBucket: '',
      isTruncated: false,
      prefix: '',
      marker: '',
      nextMarker: '',
      fileLimit: 3,
      loading: null,
      monitorUpload: {
        currentFileCount: 0,
        dealFileCount: 0
      },
      formDownloadUrl: ''
    }
  },
  components: {UIHeader,},
  methods: {
    formatDate(date) {
      return formatDate(date)
    },
    formatSize(size) {
      return formatSize(size)
    },
    getTokenTimer() {
      const self = this
      return setInterval(self.updateToken, 15 * 1000)
    },
    updateToken() {
      const self = this
      commonService.updateToken().then(res => {
        const {token, message} = getResponseJson(res)
        console.info(message)
        setToken(token)
      }).catch(err => {
        let errorStatus = getResponseStatus(err)
        let errorMessage = getResponseError(err)
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }

        self.$message.error(errorMessage)
      })
    },
    clearObjectPagination() {
      const self = this
      self.isBucket = true
      self.isTruncated = false
      self.currentBucket = ''
      self.prefix = ''
      self.marker = ''
      self.nextMarker = ''
      self.objectData = []
    },
    changeSelectedStorage() {
      const self = this
      self.clearObjectPagination()
      bucketService.listBucket(self.selectedStorageName).then(res => {
        self.tableData = getResponseJson(res)
      }).catch(err => {
        let errorStatus = getResponseStatus(err)
        let errorMessage = getResponseError(err)
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }

        self.$message.error(errorMessage)
      })
    },
    handleOperationClick(command, row) {
      if (command === 'visit') {
        this.listObject(row)
      } else if (command === 'del') {
        this.deleteBucket(row)
      }
    },
    handleObjectOperationClick(command, row) {
      if (command === 'del') {
        this.deleteObject(row)
      } else if (command === 'share') {
        this.openDownloadDialog(row)
      }
    },
    openDownloadDialog(row) {
      const self = this
      bucketService.shareObject(self.selectedStorageName, self.currentBucket, row.name).then(res => {
        self.formDownloadUrl = getResponseJson(res).url
        self.formDownloadVisible = true
      }).catch(err => {
        let errorStatus = getResponseStatus(err)
        let errorMessage = getResponseError(err)
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }

        if (err) {
          self.$message.error(errorMessage)
        }
      })
    },
    openCreateDialog() {
      this.formTitle = 'New Bucket'
      this.isAdd = true
      this.form.id = ''
      this.form.name = ''
      this.form.storageName = this.selectedStorageName
      this.clearFormErrorMessage()
      this.formVisible = true
    },
    openUploadObjectDialog() {
      this.formObjectVisible = true
      this.formObjectErrorMessage = ''
    },
    confirmCreateBucket() {
      this.confirmCreateBucketUser()
    },
    confirmCreateBucketUser() {
      const self = this
      let errorStatus = 500
      const {name, storageName} = self.form
      async.waterfall([
        cb => {
          bucketService.createBucket(name, storageName).then(res => {
            const result = getResponseJson(res)
            self.$message.success(result.message)
            self.formVisible = false
            cb(null)
          }).catch(err => {
            errorStatus = getResponseStatus(err)
            cb(new Error(getResponseError(err)))
          })
        },
        cb => {
          bucketService.listBucket(storageName).then(res => {
            self.tableData = getResponseJson(res)
            cb(null)
          }).catch(err => {
            errorStatus = getResponseStatus(err)
            cb(new Error(getResponseError(err)))
          })
        }
      ], err => {
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }

        if (err) {
          self.formErrorMessage = err.message
        }
      })

    },
    clearFormErrorMessage() {
      this.formErrorMessage = ''
    },
    deleteBucket(row) {
      this.deleteBucketUser(row)
    },
    deleteBucketUser(row) {
      const self = this
      let errorStatus = 500
      let isCancel = false
      async.waterfall([
        cb => {
          self.$confirm('This operation will permanently delete the bucket. Continue?', 'Tip', {
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            type: 'warning',
            center: true,
            customClass: self.isMobile ? 'mobile-confirm-box' : 'confirm-box'
          }).then(() => {
            cb(null)
          }).catch(() => {
            isCancel = true
            self.$message({
              type: 'info',
              message: 'Delete Be Canceled'
            })
            cb(null)
          })
        },
        cb => {
          if (isCancel) return cb(null)
          bucketService.deleteBucket(row.name, self.selectedStorageName).then(res => {
            const result = getResponseJson(res)
            self.$message.success(result.message)
            cb(null)
          }).catch(err => {
            errorStatus = getResponseStatus(err)
            cb(new Error(getResponseError(err)))
          })
        },
        cb => {
          if (isCancel) return cb(null)
          bucketService.listBucket(self.selectedStorageName).then(res => {
            self.tableData = getResponseJson(res)
            cb(null)
          }).catch(err => {
            errorStatus = getResponseStatus(err)
            cb(new Error(getResponseError(err)))
          })
        }
      ], err => {
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }

        if (err) {
          self.$message.error(err.message)
        }
      })
    },
    listBucket() {
      const self = this
      bucketService.listBucket(self.selectedStorageName).then(res => {
        self.tableData = getResponseJson(res)
        self.clearObjectPagination()
      }).catch(err => {
        let errorStatus = getResponseStatus(err)
        let errorMessage = getResponseError(err)
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }

        self.$message.error(errorMessage)
      })
    },
    listObject(row) {
      const self = this
      let errorStatus = 500
      self.clearObjectPagination()
      bucketService.listObject(self.selectedStorageName, row.name, self.prefix, self.marker, self.maxKeys).then(res => {
        const result = getResponseJson(res)
        self.isBucket = false
        self.isTruncated = result['isTruncated']
        self.objectData = result['objects']
        self.marker = result['marker']
        self.nextMarker = result['nextMarker']
        self.currentBucket = row.name
      }).catch(err => {
        errorStatus = getResponseStatus(err)
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }
        if (err) {
          self.$message.error(err.message)
        }
      })
    },
    nextObjectPagination() {
      const self = this
      let errorStatus = 500
      self.isTruncated = false
      bucketService.listObject(self.selectedStorageName, self.currentBucket, self.prefix, self.nextMarker, self.maxKeys).then(res => {
        const result = getResponseJson(res)
        self.isBucket = false
        self.isTruncated = result['isTruncated']
        self.objectData = _.concat(self.objectData, result['objects'])
        self.marker = result['marker']
        self.nextMarker = result['nextMarker']
      }).catch(err => {
        errorStatus = getResponseStatus(err)
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }
        if (err) {
          self.$message.error(err.message)
        }
      })
    },
    refreshObjectList(callback) {
      const self = this
      let errorStatus = 500
      self.isTruncated = false
      self.marker = ''
      self.nextMarker = ''
      self.objectData = []
      bucketService.listObject(self.selectedStorageName, self.currentBucket, self.prefix, self.nextMarker, self.maxKeys).then(res => {
        const result = getResponseJson(res)
        self.isBucket = false
        self.isTruncated = result['isTruncated']
        self.objectData = result['objects']
        self.marker = result['marker']
        self.nextMarker = result['nextMarker']
        callback(null)
      }).catch(err => {
        errorStatus = getResponseStatus(err)
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return callback(err)
        }
        if (err) {
          callback(err)
        }
      })
    },
    clickPrefixSearch() {
      const self = this
      let errorStatus = 500
      self.isBucket = true
      self.isTruncated = false
      self.marker = ''
      self.nextMarker = ''
      self.objectData = []
      bucketService.listObject(self.selectedStorageName, self.currentBucket, self.prefix, self.marker, self.maxKeys).then(res => {
        const result = getResponseJson(res)
        self.isBucket = false
        self.isTruncated = result['isTruncated']
        self.objectData = result['objects']
        self.marker = result['marker']
        self.nextMarker = result['nextMarker']
      }).catch(err => {
        errorStatus = getResponseStatus(err)
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }
        if (err) {
          self.$message.error(err.message)
        }
      })
    },
    closeUploadObjectDialog() {
      this.$refs.upload.clearFiles()
    },
    confirmUploadObject(res) {
      const self = this
      let errorStatus = 500
      const file = res.file
      const timer = self.getTokenTimer()
      async.waterfall([
        cb => {
          bucketService.uploadObject(self.selectedStorageName, self.currentBucket, self.prefix, file, res).then(res => {
            const result = getResponseJson(res)
            self.$message.info(result.message)
            cb(null)
          }).catch(err => {
            errorStatus = getResponseStatus(err)
            if (errorStatus === 401 && err) {
              self.$router.replace(`/sign-in`)
              return
            }
            if (err) {
              return cb(err)
            }
          })
        },
        cb => {
          self.refreshObjectList(err => cb(err))
        }
      ], err => {
        clearInterval(timer)
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }

        if (err) {
          let errorMessage = getResponseError(err)
          self.$message.error(errorMessage)
          res.onError(err)
        } else {
          res.onSuccess()
        }

      })
    },
    submitFile() {
      const self = this
      const upload = this.$refs.upload
      if (upload.uploadFiles.length === 0) {
        self.$message.warning('Please choose files')
        return
      }

      if (upload.uploadFiles.length > _.uniq(_.map(upload.uploadFiles, 'name')).length) {
        self.$message.warning('File name must be unique')
        return
      }

      const files = upload.uploadFiles
      self.monitorUpload.currentFileCount = files.length
      self.monitorUpload.dealFileCount = 0
      self.loading = this.$loading({
        lock: true,
        text: `Upload Objects...`,
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.4)'
      });
      upload.submit()
    },
    onFileUploadSuccess() {
      const self = this
      self.monitorUpload.dealFileCount += 1
      if (self.monitorUpload.dealFileCount === self.monitorUpload.currentFileCount) {
        self.loading.close()
        self.formObjectVisible = false
      }
    },
    onFileUploadError() {
      const self = this
      self.monitorUpload.dealFileCount += 1
      if (self.monitorUpload.dealFileCount === self.monitorUpload.currentFileCount) {
        self.loading.close()
        self.formObjectVisible = false
      }
    },
    exceedFile() {
      this.$message.warning(`Because process performance，upload maximum ${this.fileLimit} files`)
    },
    deleteObject(row) {
      const self = this
      let errorStatus = 500
      let isCancel = false
      async.waterfall([
        cb => {
          self.$confirm('This operation will permanently delete the object. Continue?', 'Tip', {
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            type: 'warning',
            center: true,
            customClass: self.isMobile ? 'mobile-confirm-box' : 'confirm-box'
          }).then(() => {
            cb(null)
          }).catch(() => {
            isCancel = true
            self.$message({
              type: 'info',
              message: 'Delete Be Canceled'
            })
            cb(null)
          })
        },
        cb => {
          if (isCancel) return cb(null)
          bucketService.deleteObject(self.selectedStorageName, self.currentBucket, row.name).then(res => {
            const result = getResponseJson(res)
            self.$message.success(result.message)
            cb(null)
          }).catch(err => {
            errorStatus = getResponseStatus(err)
            cb(new Error(getResponseError(err)))
          })
        },
        cb => {
          if (isCancel) return cb(null)
          self.refreshObjectList(err => cb(err))
        }
      ], err => {
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }

        if (err) {
          self.$message.error(err.message)
        }
      })
    },
    initBucket() {
      const self = this
      async.waterfall([
        cb => {
          storageService.listStorageNames().then(res => {
            const result = getResponseJson(res)
            if (result.length > 0) {
              self.storageNames = []
              for (let storage of result) {
                self.storageNames.push({
                  value: storage, label: storage
                })
              }

              self.selectedStorageName = self.storageNames[0].value
            }

            cb(null)
          }).catch(err => {
            cb(err)
          })
        },
        cb => {
          if (!self.selectedStorageName) {
            return cb(null)
          }

          bucketService.listBucket(self.selectedStorageName).then(res => {
            self.tableData = getResponseJson(res)
          }).catch(err => {
            cb(err)
          })
        },
      ], err => {
        if (err) {
          let errorStatus = getResponseStatus(err)
          let errorMessage = getResponseError(err)
          if (errorStatus === 401 && err) {
            self.$router.replace(`/sign-in`)
            return
          }

          self.$message.error(errorMessage)
        }
      })
    }
  },
  mounted() {
    const self = this
    window.onresize = function () {
      self.viewWidth = viewportSize().width
      self.isMobile = self.viewWidth < 768
    }
    self.$store.commit('updateActiveIndex', '/bucket')
    self.$store.dispatch('getAdminRole', self.initBucket)
  }
}
</script>

<style>
.mobile-confirm-box {
  width: 95%;
}

.confirm-box {
  width: 50%;
}
</style>
