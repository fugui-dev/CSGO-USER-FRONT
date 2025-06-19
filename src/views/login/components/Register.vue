<script setup>

import {goto, requireImg} from "@/utils/common";
import {ref} from "vue";
import {getSmsCodeApi, registerApi} from "@/api";
import CountdownButton from "@/components/Btn/CountdownButton.vue";
import {ElMessage} from "element-plus";
import {useRoute} from "vue-router";
import BaseButton from "@/components/Btn/BaseButton.vue";


const route=useRoute()
const registerFormRef = ref()
const countdownButtonRef = ref()

const checked1=ref(false)

const registerForm = ref({
  phoneNumber: '',
  code: '',
  password: '',
  checked1: false,
  parentInvitationCode: '',
  nickName: ''
})
if (route.query.code){
  registerForm.value.parentInvitationCode=route.query.code
}

const registerFormRules = ref({
  phoneNumber: [
    {required: true, message: '请输入手机号', trigger: 'blur'},
    {pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur'}
  ],
  code: [
    {required: true, message: '请输入验证码', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 16, message: '密码长度在 6 到 16 个字符'}],
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
  ],
  nickName: [
    {required: true, message: '请输入昵称', trigger: 'blur'}
  ]
})


const getSmsCode = (type) => {
  const countRef = countdownButtonRef.value
  const formRef = registerFormRef.value
  formRef.validateField('phoneNumber', (valid) => {
    if (!valid) {
      countRef.clearDisabled()
    } else {
      getSmsCodeApi({
        phoneNumber: registerForm.value.phoneNumber,
        type: type
      }).then(res => {
        console.log(res)
      }).catch(err => {
        countRef.clearDisabled()
      })
    }
  })
}

const registerFormSubmit = () => {
  registerFormRef.value.validate(valid => {
    if (valid) {
      registerApi(registerForm.value).then(res => {
        ElMessage.success('注册成功,请登录！')
        registerFormRef.value.resetFields()
        goto('/login')
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
      <div>注册</div>
    </div>
    <el-form :model="registerForm" :rules="registerFormRules" ref="registerFormRef">
      <el-form-item style="margin-bottom: 32px;margin-top: 16px">
        <div style="color: #FFF5F5B2;font-size: 14px;line-height: 1.2em">
          根据相关规定，同时为了保护您的账号安全。请使用您本人实名手机号进行平台注册，非实名手机号将影响您的饰品提取！
        </div>
      </el-form-item>
      <el-form-item label="" prop="phoneNumber">
        <el-input v-model="registerForm.phoneNumber" placeholder="请输入手机号"/>
      </el-form-item>
      <el-form-item label="" prop="code">
        <div style="display: flex;flex-direction: column;width: 100%;align-items: flex-end">
          <div style="display: flex;align-items: center;width: 100%">
            <el-input style="flex:1;margin-right: 10px" v-model="registerForm.code" placeholder="请输入验证码"/>
            <CountdownButton @click="getSmsCode('1')" ref="countdownButtonRef"/>
          </div>

        </div>
      </el-form-item>
      <el-form-item label="" prop="password">
        <div style="display: flex;flex-direction: column;width: 100%;align-items: flex-end">
          <el-input type="password" show-password v-model="registerForm.password" placeholder="请输入密码"/>
        </div>
      </el-form-item>
      <el-form-item label="" prop="nickName">
        <div style="display: flex;flex-direction: column;width: 100%;align-items: flex-end">
          <el-input v-model="registerForm.nickName" placeholder="请输入昵称"/>
        </div>
      </el-form-item>
      <el-form-item label="" prop="parentInvitationCode" style="margin-bottom: 5px;">
        <div style="display: flex;flex-direction: column;width: 100%;align-items: flex-end">
          <el-input v-model="registerForm.parentInvitationCode" placeholder="请输入邀请码（选填）"/>
        </div>
      </el-form-item>
      <el-form-item prop="checked1">
        <div style="display: flex;align-items: baseline">
          <el-checkbox size="large" v-model="checked1"/>
          <div class="checkbox_note" @click="checked1=!checked1">
            确认已年满18周岁。<a href="">用户协议</a> 和 <a href="">隐私政策</a>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <el-form-item>
      <BaseButton name="注册" @click="registerFormSubmit"></BaseButton>
    </el-form-item>
    <el-form-item class="form" style="margin-top: auto;">
      <div style="width: 100%;text-align: center;cursor: pointer" @click="goto('/login')">已有账号，点击登录>></div>
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
  padding: 160px 46px 161px;


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
