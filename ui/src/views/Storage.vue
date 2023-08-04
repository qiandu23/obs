<template>
  <div>
    <UIHeader>
    </UIHeader>
    <el-row>
      <el-col :offset="1" :span="22">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>Storage</span>
            <el-button type="primary"
                       :style="isMobile?'float: right;':'float: right;margin-top: -5px'"
                       size="small" icon="el-icon-plus"
                       @click="openCreateDialog">New
            </el-button>
          </div>
          <div>
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
              <el-table-column
                  align="center"
                  prop="endpoint"
                  label="Endpoint">
              </el-table-column>
              <el-table-column
                  align="center"
                  prop="region"
                  label="Region">
              </el-table-column>
              <el-table-column
                  align="center"
                  prop="accessKey"
                  label="Access Key">
              </el-table-column>
              <el-table-column
                  align="center"
                  label="Path Style">
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.pathStyle" disabled/>
                </template>
              </el-table-column>
              <el-table-column label="Operation" align="center">
                <template slot-scope="scope">
                  <el-dropdown size="mini" @command="(command)=>handleOperationClick(command,scope.row)">
                    <el-button size="mini" type="primary">
                      Operation<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="edit" class="dropdown-item"><i class="el-icon-edit el-icon--left"></i>Edit
                      </el-dropdown-item>
                      <el-dropdown-item command="del" class="dropdown-item"><i class="el-icon-delete el-icon--left"></i>Delete
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

      </el-col>
    </el-row>

    <el-dialog :title="formTitle" :visible.sync="formVisible" :close-on-click-modal="false"
               :width="isMobile?'95%':'50%'">
      <el-form :model="form">
        <el-input v-model="form.id" type="hidden"></el-input>
        <el-form-item label="Name" :label-width="formLabelWidth">
          <el-input v-model="form.name" maxlength="20" show-word-limit :readonly="!isAdd"></el-input>
        </el-form-item>
        <el-form-item label="Endpoint" :label-width="formLabelWidth">
          <el-input v-model="form.endpoint" maxlength="200" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="Access Key" :label-width="formLabelWidth">
          <el-input v-model="form.accessKey" maxlength="50" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="Secret Key" :label-width="formLabelWidth">
          <el-input v-model="form.secretKey" maxlength="100" show-word-limit show-password></el-input>
        </el-form-item>
        <el-form-item label="Path Style" :label-width="formLabelWidth">
          <el-switch v-model="form.pathStyle" />
        </el-form-item>
        <el-form-item label="Region" :label-width="formLabelWidth">
          <el-input v-model="form.region" maxlength="100" show-word-limit
                    placeholder="Optional"></el-input>
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
        <el-button type="primary" @click="confirmCreateOrUpdateStorage">Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import UIHeader from '../components/ui-header'
import {getResponseError, getResponseJson, getResponseStatus} from '@/common'
import StorageService from '../services/storage'
import async from 'async'
import viewportSize from "get-viewport-size";

const storageService = new StorageService()
export default {
  name: 'Storage',
  data() {
    return {
      search: '',
      tableData: [],
      isAdd: false,
      formVisible: false,
      form: {
        id: '',
        name: '',
        endpoint: '',
        accessKey: '',
        secretKey: '',
        pathStyle: true,
        region: ''
      },
      formLabelWidth: '100px',
      formErrorMessage: '',
      formTitle: '',
      adminSelect: {
        options: [],
        selectedValue: ''
      },
      viewWidth: viewportSize().width,
      isMobile: viewportSize().width < 768,
    }
  },
  components: {UIHeader,},
  methods: {
    handleOperationClick(command, row) {
      if (command === 'edit') {
        this.openEditDialog(row)
      } else if (command === 'del') {
        this.deleteStorage(row)
      }
    },
    openCreateDialog() {
      this.formTitle = 'New Storage'
      this.isAdd = true
      this.form.id = ''
      this.form.name = ''
      this.form.endpoint = ''
      this.form.accessKey = ''
      this.form.secretKey = ''
      this.form.pathStyle = true
      this.form.region = ''
      this.clearFormErrorMessage()
      this.formVisible = true
    },
    openEditDialog(row) {
      this.formTitle = 'Edit Storage'
      this.isAdd = false
      this.form.id = row.id
      this.form.name = row.name
      this.form.endpoint = row.endpoint
      this.form.accessKey = row.accessKey
      this.form.secretKey = row.secretKey
      this.form.pathStyle = row.pathStyle
      this.form.region = row.region
      this.clearFormErrorMessage()
      this.formVisible = true
    },
    confirmCreateOrUpdateStorage() {
      this.confirmCreateOrUpdateStorageUser()
    },
    confirmCreateOrUpdateStorageUser() {
      const self = this
      let errorStatus = 500
      async.waterfall([
        cb => {
          if (self.isAdd) {
            const {name, endpoint, accessKey, secretKey, pathStyle, region} = self.form
            storageService.createStorage(name, endpoint, accessKey, secretKey, pathStyle, region).then(res => {
              const result = getResponseJson(res)
              self.$message.success(result.message)
              self.formVisible = false
              cb(null)
            }).catch(err => {
              errorStatus = getResponseStatus(err)
              cb(new Error(getResponseError(err)))
            })
          } else {
            const {id, name, endpoint, accessKey, secretKey, pathStyle, region} = self.form
            storageService.updateStorage(id, name, endpoint, accessKey, secretKey, pathStyle, region).then(res => {
              const result = getResponseJson(res)
              self.$message.success(result.message)
              self.formVisible = false
              cb(null)
            }).catch(err => {
              errorStatus = getResponseStatus(err)
              cb(new Error(getResponseError(err)))
            })
          }
        },
        cb => {
          storageService.listStorage().then(res => {
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
    deleteStorage(row) {
      this.deleteStorageUser(row)
    },
    deleteStorageUser(row) {
      const self = this
      let errorStatus = 500
      let isCancel = false
      async.waterfall([
        cb => {
          self.$confirm('This operation will permanently delete the storage. Continue?', 'Tip', {
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
            type: 'warning',
            center: true,
            customClass: self.isMobile ? 'mobile-confirm-box' : 'confirm-box'
          }).then((action) => {
            console.info(action)
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
          storageService.deleteStorage(row.id, row.name).then(res => {
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
          storageService.listStorage().then(res => {
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
    initStorage() {
      const self = this
      storageService.listStorage().then(res => {
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
    }
  },
  mounted() {
    const self = this
    window.onresize = function () {
      self.viewWidth = viewportSize().width
      self.isMobile = self.viewWidth < 768
    }
    self.$store.commit('updateActiveIndex', '/storage')
    self.$store.dispatch('getAdminRole', self.initStorage)
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
