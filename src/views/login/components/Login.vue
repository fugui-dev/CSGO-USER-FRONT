<script setup>

import {goto, requireImg} from "@/utils/common";
import {ref} from "vue";
import {getSmsCodeApi, getUserInfoApi, loginApi, loginPhoneApi} from "@/api";
import CountdownButton from "@/components/Btn/CountdownButton.vue";
import {Switch} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import {useStore} from "@/store";
import BaseButton from "@/components/Btn/BaseButton.vue";

const store=useStore()
const loginPwdFormRef = ref()
const loginPhoneFormRef = ref()
const countdownButtonRef = ref()
const isPwd = ref(true)
const checked1=ref(false)
const loginPwdForm = ref({
  username: '18656265620',
  password: '123456',
  checked1: false,
  checked2: false
})


if (import.meta.env.PROD) {
  loginPwdForm.value.username = ''
  loginPwdForm.value.password = ''
}


const loginPhoneForm = ref({
  phoneNumber: '',
  code: null,
  checked1: false,
})

const loginPwdFormRules = ref({
  username: [
    {required: true, message: '请输入手机号', trigger: 'blur'},
    {pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 16, message: '密码长度在 6 到 16 个字符之间', trigger: 'blur'}
  ],
  checked1: [
    {
      validator: (rule, value, callback) => {
        if (!checked1.value) {
          callback(new Error('请阅读并同意用户协议和隐私政策'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

const loginPhoneFormRules = ref({
  phoneNumber: [
    {required: true, message: '请输入手机号', trigger: 'blur'},
    {pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur'}
  ],
  code: [
    {required: true, message: '请输入验证码', trigger: 'blur'},
  ],
  checked1: [
    {
      validator: (rule, value, callback) => {
        if (!checked1.value) {
          callback(new Error('请阅读并同意用户协议和隐私政策'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
})

const loginPwdFormSubmit = () => {
  loginPwdFormRef.value.validate(valid => {
    if (valid) {
      console.log('submit!', loginPwdForm)
      loginApi(loginPwdForm.value).then(res => {
        localStorage.setItem('token', res.token)
        getUserInfoApi().then(res => {
          store.setUserInfo(res.data)
          ElMessage.success("登录成功")
          goto('/')
        })
      })
    } else {
      console.log('error submit!!');
      return false;
    }
  });
}

const loginPhoneFormSubmit = () => {
  loginPhoneFormRef.value.validate(valid => {
    if (valid) {
      console.log('submit!', loginPwdForm)
      loginPhoneApi(loginPhoneForm.value).then(res => {
        localStorage.setItem('token', res.token)
        getUserInfoApi().then(res => {
          store.setUserInfo(res.data)
          ElMessage.success("登录成功")
          goto('/')
        })
      })
    } else {
      console.log('error submit!!');
      return false;
    }
  })
}

const getSmsCode = (type) => {
  const countRef = countdownButtonRef.value
  const formRef = loginPhoneFormRef.value
  formRef.validateField('phoneNumber', (valid) => {
    if (!valid) {
      countRef.clearDisabled()
    } else {
      getSmsCodeApi({
        phoneNumber: loginPhoneForm.value.phoneNumber,
        type: type
      }).then(res => {
        console.log(res)
      }).catch(err => {
        countRef.clearDisabled()
      })
    }
  })
}

</script>

<template>
  <div class="login_block" :style="{
    '--login-btn':requireImg('/center/bg-btn.png',true),
  }">
    <div class="type">
      <div>登录</div>
      <div>|</div>
      <div>{{ isPwd ? '密码' : '手机号' }}登录</div>

    </div>
    <el-form class="form" :model="loginPwdForm" v-show="isPwd" :rules="loginPwdFormRules" ref="loginPwdFormRef">
      <el-form-item label="" prop="username">
        <el-input v-model="loginPwdForm.username" placeholder="请输入手机号"/>
      </el-form-item>
      <el-form-item label="" prop="password" style="margin-bottom: 5px;">
        <div style="display: flex;flex-direction: column;width: 100%;align-items: flex-end">
          <el-input type="password" show-password v-model="loginPwdForm.password" placeholder="请输入密码"/>
        </div>
      </el-form-item>
      <el-form-item prop="checked1">
        <div style="display: flex;align-items: center;width: 100%">
          <el-checkbox size="large" v-model="checked1"/>
          <div class="checkbox_note" @click="checked1=!checked1">
            确认已年满18周岁。<a href="">用户协议</a> 和 <a href="">隐私政策</a>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <el-form class="form" :model="loginPhoneForm" v-show="!isPwd" :rules="loginPhoneFormRules" ref="loginPhoneFormRef">
      <el-form-item label="" prop="phoneNumber">
        <el-input v-model="loginPhoneForm.phoneNumber" placeholder="请输入手机号"/>
      </el-form-item>
      <el-form-item label="" prop="code" style="margin-bottom: 5px;">
        <div style="display: flex;flex-direction: column;width: 100%;align-items: flex-end">
          <div style="display: flex;align-items: center;width: 100%">
            <el-input style="flex:1;margin-right: 10px" v-model="loginPhoneForm.code" placeholder="请输入验证码"/>
            <CountdownButton @click="getSmsCode('2')" ref="countdownButtonRef"/>
          </div>
        </div>
      </el-form-item>
      <el-form-item prop="checked1">
        <div style="display: flex;align-items: center;width: 100%">
          <el-checkbox size="large" v-model="checked1"/>
          <div class="checkbox_note" @click="checked1=!checked1">
            确认已年满18周岁。<a href="">用户协议</a> 和 <a href="">隐私政策</a>
          </div>
        </div>
      </el-form-item>

    </el-form>
    <el-form-item>
      <BaseButton name="登录" @click="isPwd?loginPwdFormSubmit():loginPhoneFormSubmit()"/>
    </el-form-item>
    <el-form-item>
      <div class="change_type" @click="isPwd=!isPwd">
        <el-icon ><Switch /></el-icon>
        <div>切换登录方式</div>
      </div>
    </el-form-item>
    <el-form-item class="form" style="margin-top: auto;">
      <div style="width: 100%;text-align: center;cursor: pointer" @click="goto('register')">没有账号，点击注册>></div>
    </el-form-item>
  </div>
</template>

<style scoped lang="scss">
.login_block {
  font-family: "PingFang Medium", "Microsoft YaHei", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 200px 46px 161px;


  .title {
    line-height: 40px;
    font-size: 18px;

  }

  .logo {
    width: 95px;
  }

  .type {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 14px;
    color: #fff;
    margin-bottom: 38px;

    div {
      margin-right:19px;
      cursor: pointer;
      font-size: 36px;
    }

    div:nth-child(2) {
      color: #FFFFFFB2;
      font-size: 20px;
    }
    div:nth-child(3) {
      font-size: 20px;
      color: #FFFFFFB2;
    }

  }
  .form{
    width: 100%;
  }
  .el-input{
    height: 56px;
    --el-input-bg-color:rgba(255,255,255,.2);
    --el-input-text-color:#fff;
  }
  .checkbox_note{
    font-size: 12px;
    margin-left: 3px;
    cursor: pointer;
    color: #FFF5F5B2;

    a {
      text-decoration:underline;
    }
  }
  .change_type{
    display: flex;
    margin-left: auto;
    font-size: 12px;
    align-items: center;
    cursor: pointer;
  }
  .login_btn{
    width: 278px;
    height: 60px;
    background: var(--login-btn);
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #fff;
    cursor: pointer;
    transition: .2s;
    -webkit-user-select: none;
    &:hover{
      opacity: .85;
    }
  }
  .base_button{
    width: 366px;
  }
}
</style>
