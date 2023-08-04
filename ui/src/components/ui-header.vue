<template>
  <div>
    <el-row class="header" style="padding-right: 10px">
      <el-col :span="6" :offset="1" style="line-height: 20px;"><h3>OBS Browser</h3></el-col>
      <el-col :span="6" :offset="10" style="padding: 5px">
        <el-dropdown style="margin-top: 2px" @command="userOperation">
          <el-button type="info" style="background-color: #343a40;border-color: #343a40;">
            <i class="el-icon-user el-icon--left"></i>{{ isMobile ? 'Sign In' : account }}<i
              class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="change-nickname">Change Nickname</el-dropdown-item>
            <el-dropdown-item command="change-password">Change Password</el-dropdown-item>
            <el-dropdown-item command="sign-out">Sign out</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-col>
    </el-row>

    <UINav></UINav>

    <el-dialog :title="formTitle" :visible.sync="formVisible" :width="isMobile?'95%':'50%'">
      <el-form :model="form">
        <el-form-item label="Nickname" :label-width="formLabelWidth" v-show="!isPassword">
          <el-input v-model="form.nickname"></el-input>
        </el-form-item>
        <el-form-item label="Old Password" :label-width="formLabelWidth" v-show="isPassword">
          <el-input v-model="form.oldPassword" show-password></el-input>
        </el-form-item>
        <el-form-item label="New Password" :label-width="formLabelWidth" v-show="isPassword">
          <el-input v-model="form.newPassword" show-password></el-input>
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
        <el-button type="primary" @click="()=>isPassword?confirmChangePassword():confirmChangeNickname()">Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAccount,
  getResponseError,
  getResponseJson,
  getResponseStatus,
  removeAccount,
  removeToken,
  setAccount,
  setToken
} from '@/common'
import UINav from './ui-nav'
import async from 'async'
import sha256 from 'crypto-js/sha256'
import CommonService from '../services/common'
import viewportSize from "get-viewport-size";

const commonService = new CommonService()

export default {
  name: 'UIHeader',
  data() {
    return {
      account: getAccount(),
      isPassword: false,
      formTitle: '',
      formVisible: false,
      form: {
        nickname: getAccount(),
        oldPassword: '',
        newPassword: ''
      },
      formLabelWidth: '100px',
      formErrorMessage: '',
      viewWidth: viewportSize().width,
      isMobile: viewportSize().width < 768,
    }
  },
  components: {UINav},
  methods: {
    userOperation: function (command) {
      const self = this
      if (command === 'sign-out') {
        commonService.signOut().then(() => {
          removeToken()
          removeAccount()
          self.$router.replace('/sign-in')
        }).catch(err => {
          let errorStatus = getResponseStatus(err)
          if (errorStatus === 401 && err) {
            self.$router.replace(`/sign-in`)
            return
          }

          if (err) {
            self.$message.error(getResponseError(err))
          }
        })
      } else if (command === 'change-password') {
        self.openChangePasswordDialog()
      } else if (command === 'change-nickname') {
        self.openChangeNicknameDialog()
      } else if (command === 'to-dog') {
        self.toDog()
      }
    },
    openChangeNicknameDialog() {
      this.formTitle = 'Change Nickname'
      this.form.nickname = getAccount()
      this.form.oldPassword = ''
      this.form.newPassword = ''
      this.formVisible = true
      this.isPassword = false
      this.formErrorMessage = ''
    },
    openChangePasswordDialog() {
      this.formTitle = 'Change Password'
      this.form.nickname = getAccount()
      this.form.oldPassword = ''
      this.form.newPassword = ''
      this.formVisible = true
      this.isPassword = true
      this.formErrorMessage = ''
    },
    clearFormErrorMessage() {
      this.formErrorMessage = ''
    },
    confirmChangePassword() {
      const self = this
      let errorStatus = 500
      async.waterfall([
        cb => {
          const {oldPassword, newPassword} = self.form
          commonService.changePassword(self.account, sha256(oldPassword).toString(), sha256(newPassword).toString()).then(res => {
            const result = getResponseJson(res)
            self.$message.success(result.message)
            self.formVisible = false
            cb(null)
          }).catch(err => {
            errorStatus = getResponseStatus(err)
            cb(new Error(getResponseError(err)))
          })
        },
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
    confirmChangeNickname() {
      const self = this
      let errorStatus = 500
      async.waterfall([
        cb => {
          const {nickname} = self.form
          commonService.changeNickname(nickname).then(res => {
            const result = getResponseJson(res)
            setAccount(nickname)
            setToken(result.token)
            self.account = getAccount()
            self.$message.success(result.message)
            self.formVisible = false
            cb(null)
          }).catch(err => {
            errorStatus = getResponseStatus(err)
            cb(new Error(getResponseError(err)))
          })
        },
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
    authToken() {
      const self = this
      commonService.authAccount().then(() => {
        console.info('I am here.')
      }).catch(err => {
        let errorStatus = getResponseStatus(err)
        if (errorStatus === 401 && err) {
          self.$router.replace(`/sign-in`)
          return
        }

        if (err) {
          console.warn(err.message)
        }
      })
    },
  },
  mounted() {
    const self = this
    window.onresize = function () {
      self.viewWidth = viewportSize().width
      self.isMobile = self.viewWidth < 768
    }
    setInterval(self.authToken, 3 * 60 * 1000)
  }
}
</script>

<style scoped>
.header {
  background-color: #343a40;
  height: 55px;
  color: whitesmoke;
}
</style>
