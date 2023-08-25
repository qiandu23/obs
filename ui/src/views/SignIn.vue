<template>
  <el-row style="margin-top: 15vh;margin-left: 15px;margin-right: 15px">
    <el-col :offset="isMobile?0:8" :span="isMobile?24:8">
      <div>
        <div style="text-align: center">
          <el-image
              class="circle"
              :src="logo"
              fit="fill"></el-image>
        </div>
        <el-form>
          <el-form-item label="Account">
            <el-input v-model="username" placeholder="Please input account"
                      @keypress.native.enter="handleSubmit"></el-input>
          </el-form-item>
          <el-form-item label="Password">
            <el-input v-model="password" placeholder="Please input password" show-password
                      @keypress.native.enter="handleSubmit"></el-input>
          </el-form-item>
          <el-alert :title="errorMessage" v-show="isShowErrorMessage"
                    type="error" @close="closeErrorTip">
          </el-alert>
          <el-form-item style="margin-top: 10px">
            <el-button type="primary" @click="handleSubmit" style="width: 100%">Sign In</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import {setToken, setAccount, getToken, removeToken, removeAccount, authAccount} from '@/common'
import sha256 from 'crypto-js/sha256'
import CommonService from '../services/common'
import logo from '../assets/logo.png'
import viewportSize from "get-viewport-size"

const commonService = new CommonService()

export default {
  name: 'SignIn',
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
      isShowErrorMessage: false,
      viewWidth: viewportSize().width,
      isMobile: viewportSize().width < 768,
      logo
    }
  },
  methods: {
    closeErrorTip() {
      this.isShowErrorMessage = false
    },
    handleSubmit() {
      const self = this
      if (self.username && self.password) {
        commonService.signIn(self.username, sha256(self.password).toString())
            .then((response) => {
              const {token, isAdmin} = response['data']
              self.isShowErrorMessage = false
              self.errorMessage = ''
              setAccount(self.username)
              setToken(token)
              if (isAdmin) {
                self.$router.replace('/storage')
              } else {
                self.$router.replace('/storage-class')
              }
            })
            .catch(function (error) {
              if (error.response && error.response.data && error.response.data.message) {
                self.isShowErrorMessage = true
                self.errorMessage = error.response.data.message
              }
            })
      } else {
        self.isShowErrorMessage = true
        self.errorMessage = 'Account or password is empty'
      }
    }
  },
  mounted() {
    const self = this
    window.onresize = function () {
      self.viewWidth = viewportSize().width
      self.isMobile = self.viewWidth < 768
    }
    if (getToken()) {
      authAccount((err, isAdmin) => {
        if (err) {
          if (err.message && err.message.includes('exp')) {
            self.errorMessage='login timeout'
          } else {
            self.errorMessage = err.message
          }

          self.isShowErrorMessage = true
          removeToken()
          removeAccount()
          return
        }

        if (isAdmin) {
          self.$router.replace('/storage')
        } else {
          self.$router.replace('/storage-class')
        }
      })

    }
  }
}
</script>

<style scoped>
.circle {
  border: 5px solid #857631;
  width: 100px;
  height: 100px;
  border-radius: 25px;
}
</style>
