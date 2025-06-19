<script setup>
import {ref, watch, watchEffect} from "vue";
import {getSmsCodeApi, getUserInfoApi, loginApi, loginPhoneApi, registerApi} from "@/api/index.js";
import {useStore} from "@/store/index.js";
import {requireImg} from "@/utils/common";
import CountdownButton from "@/components/Btn/CountdownButton.vue";
import {ElMessage} from "element-plus";

const store = useStore()
const visible = ref(false);
const isRegister = ref(false);
const isPwd = ref(true);

const loginPwdFormRef = ref()
const loginPhoneFormRef = ref()
const registerFormRef = ref()

const countdownButtonRef = ref()
const countdownButtonRef2 = ref()


const loginPwdForm = ref({
  username: '18656265620',
  password: '123456',
  checked1: false,
  checked2: false
})

if (import.meta.env.PROD){
  loginPwdForm.value.username=''
  loginPwdForm.value.password=''
}


const loginPhoneForm = ref({
  phoneNumber: '',
  code: null
})

const registerForm = ref({
  phoneNumber: '',
  code: '',
  password: '',
  checked1: false,
  parentInvitationCode: '',
  nickName: ''
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
        if (!value) {
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
  ]
})

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
        if (!value) {
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

const onClickCloseBtn = () => {
  console.log(1)
  console.log(visible.value)
  visible.value = false;
}

const open = (type) => {
  visible.value = true;
  isRegister.value = type === 'register';
}
const loginPwdFormSubmit = () => {
  loginPwdFormRef.value.validate(valid => {
    if (valid) {
      console.log('submit!', loginPwdForm)
      loginApi(loginPwdForm.value).then(res => {
        localStorage.setItem('token', res.token)
        getUserInfoApi().then(res => {
          store.setUserInfo(res.data)
          visible.value = false
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
          visible.value = false
        })
      })
    } else {
      console.log('error submit!!');
      return false;
    }
  })
}

const registerFormSubmit = () => {
  registerFormRef.value.validate(valid => {
    if (valid) {
      console.log('submit!', loginPwdForm)
      registerApi(registerForm.value).then(res => {
        ElMessage.success('注册成功,请登录！')
        isPwd.value = true
        isRegister.value = false
        loginPhoneForm.value.phoneNumber = registerForm.value.phoneNumber
        loginPwdForm.value.username = registerForm.value.phoneNumber
        registerFormRef.value.resetFields()
      })
    }
  })
}

const getSmsCode = (type) => {
  const countRef = type === '1' ? countdownButtonRef2.value : countdownButtonRef.value
  const formRef = type === '1' ? registerFormRef.value : loginPhoneFormRef.value
  formRef.validateField('phoneNumber', (valid) => {
    if (!valid) {
      countRef.clearDisabled()
    } else {
      getSmsCodeApi({
        phoneNumber: type === '1' ? registerForm.value.phoneNumber : loginPhoneForm.value.phoneNumber,
        type: type
      }).then(res => {
        console.log(res)
      }).catch(err => {
        countRef.clearDisabled()
      })
    }
  })
}
watch(() => store.needLogin, () => {
  console.log(store.needLogin)
  if (store.needLogin) {
    open('login')
    store.setNeedLogin(false)
  }
}, {
  immediate: true
})

watch(()=>sessionStorage.getItem('code'),(val)=>{
  if (val!==null && val!==''){
    registerForm.value.parentInvitationCode=val
  }
},{
  immediate:true
})


defineExpose({
  open
})
</script>

<template>
  <van-popup v-if="visible" class="dialog" v-model:show="visible"
             :class="{ 'is-register':isRegister,}"
             :style="{
    '--bg':requireImg('/dialog/bg_login.png',true),
    '--bg_login_box':requireImg('/dialog/bg_login_box.png',true),
    '--bg_login_tit_btn':requireImg('/dialog/bg_login_tit_btn.png',true),
    '--bg_register':requireImg('/dialog/bg_register.png',true),
  }"
             closeable
             teleport="body" @click-close-icon="onClickCloseBtn" @closed="store.setNeedLogin(false)">
    <div class="container" :class="{'register_container':isRegister}">
      <div class="box" v-if="!isRegister">
        <div class="change_type">
          <div class="change_type-item" :class="{'active':isPwd}" @click="isPwd=true">
            <span>密码登录</span>
          </div>
          <div class="change_type-item" :class="{'active':!isPwd}" @click="isPwd=false">
            <span>短信登录</span>
          </div>
        </div>
        <el-form :model="loginPwdForm" v-show="isPwd" :rules="loginPwdFormRules" ref="loginPwdFormRef">
          <el-form-item label="" prop="username">
            <el-input v-model="loginPwdForm.username" placeholder="请输入手机号"/>
          </el-form-item>
          <el-form-item label="" prop="password" style="margin-bottom: 5px;">
            <div style="display: flex;flex-direction: column;width: 100%;align-items: flex-end">
              <el-input type="password" show-password v-model="loginPwdForm.password" placeholder="请输入密码"/>

            </div>
          </el-form-item>
<!--          <div style="font-size: 18px;margin-top: 18px;cursor: pointer;width: 100%;text-align: right">找回密码</div>-->
          <el-form-item prop="checked1">
            <div style="display: flex;align-items: baseline">
              <el-checkbox size="large" v-model="loginPwdForm.checked1"/>
              <div class="checkbox_note" @click="loginPwdForm.checked1=!loginPwdForm.checked1">
                确认已年满18周岁。<a href="">用户协议</a> 和 <a href="">隐私政策</a>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button color="#9358FFFF" size="large" style="font-size: 26px" @click="loginPwdFormSubmit">登录
            </el-button>
          </el-form-item>

        </el-form>
        <el-form :model="loginPhoneForm" v-show="!isPwd" :rules="loginPhoneFormRules" ref="loginPhoneFormRef">
          <el-form-item label="" prop="phoneNumber">
            <el-input v-model="loginPhoneForm.phoneNumber" placeholder="请输入手机号"/>
          </el-form-item>
          <el-form-item label="" prop="code">
            <div style="display: flex;flex-direction: column;width: 100%;align-items: flex-end">
              <div style="display: flex;align-items: center;width: 100%">
                <el-input style="flex:1;margin-right: 10px" v-model="loginPhoneForm.code" placeholder="请输入验证码"/>
                <CountdownButton @click="getSmsCode('2')" ref="countdownButtonRef"/>
              </div>

            </div>
          </el-form-item>
          <!--          <el-form-item prop="checked1">-->
          <!--            <div style="display: flex;align-items: baseline">-->
          <!--              <el-checkbox size="large" v-model="loginPwdForm.checked1" />-->
          <!--              <div class="checkbox_note" @click="loginPwdForm.checked1=!loginPwdForm.checked1">-->
          <!--                确认已年满18周岁。<a href="">用户协议</a> 和 <a href="">隐私政策</a>-->
          <!--              </div>-->
          <!--            </div>-->
          <!--          </el-form-item>-->
          <el-form-item>
            <el-button color="#9358FFFF" size="large" style="font-size: 26px" @click="loginPhoneFormSubmit">登录
            </el-button>
          </el-form-item>


        </el-form>
        <el-form-item>
          <div style="width: 100%;text-align: center;cursor: pointer" @click="isRegister=true">没有账号，点击注册>></div>
        </el-form-item>
      </div>
      <div class="box" v-else>
        <div class="change_type">
          <div class="change_type-item active">
            <span>注册</span>
          </div>
        </div>
        <el-form :model="registerForm" :rules="registerFormRules" ref="registerFormRef">
          <el-form-item style="margin-bottom: 10px;">
            根据相关规定，同时为了保护您的账号安全。请使用您本人实名手机号进行平台注册，非实名手机号将影响您的饰品提取！
          </el-form-item>
          <el-form-item label="" prop="phoneNumber">
            <el-input v-model="registerForm.phoneNumber" placeholder="请输入手机号"/>
          </el-form-item>
          <el-form-item label="" prop="code">
            <div style="display: flex;flex-direction: column;width: 100%;align-items: flex-end">
              <div style="display: flex;align-items: center;width: 100%">
                <el-input style="flex:1;margin-right: 10px" v-model="registerForm.code" placeholder="请输入验证码"/>
                <CountdownButton @click="getSmsCode('1')" ref="countdownButtonRef2"/>
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
              <el-checkbox size="large" v-model="registerForm.checked1"/>
              <div class="checkbox_note" @click="registerForm.checked1=!registerForm.checked1">
                确认已年满18周岁。<a href="">用户协议</a> 和 <a href="">隐私政策</a>
              </div>
            </div>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button color="#9358FFFF" size="large" style="font-size: 26px" @click="registerFormSubmit">注册
            </el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 0;">
            <div style="width: 100%;text-align: center;cursor: pointer" @click="isRegister=false">已有账号，点击登录>>
            </div>
          </el-form-item>


        </el-form>

      </div>
    </div>
  </van-popup>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.dialog {
  width: 100%;
  max-width: 1200px;
  padding: 100px 80px;
  background: none;
  background-image: var(--bg);
  background-size: 100% 100%;
  height: 729px;
  color: white;
  box-sizing: border-box;

  .container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    width: 100%;
    overflow-y: auto;

    .box {
      width: 100%;
      max-width: 500px;
      height: 100%;
      background-image: var(--bg_login_box);
      background-size: 100% 100%;
      padding: 42px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;

      .checkbox_note {
        font-size: 18px;
        margin-left: 8px;
        cursor: pointer;

        a {
          color: #9358FFFF;
        }
      }

      .change_type {
        display: flex;
        justify-content: space-evenly;
        width: 100%;
        margin-bottom: 50px;

        .change_type-item {
          cursor: pointer;
          font-size: 20px;
          width: 30%;
          display: flex;
          justify-content: center;
          line-height: 2em;

          span {
            filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.2));
            color: #9358FFFF;
            flex-shrink: 0;
          }

          &.active {
            position: relative;

            span {
              filter: drop-shadow(0 0 1px white);
              color: white;
            }

            &::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-image: var(--bg_login_tit_btn);
              background-size: 100% 100%;
              opacity: .5;
            }
          }
        }
      }

    }
  }

  @include mobile {
    padding: 100px 30px;
    background-image: var(--bg_register);
    .container {
      justify-content: center;

      .box {
        background-image: none;
      }
    }
  }

  &.is-register {
    max-width: 600px;
    height: 840px;
    background-image: var(--bg_register);
    padding-top: 60px;

    .container {
      justify-content: center;

      .box {
        background: none;
        padding: 0 20px;

        .change_type {
          margin-bottom: 20px;
        }
      }
    }
  }

}

.el-form {
  width: 100%;

  .el-form-item {
    margin-bottom: 36px;
  }

}

.el-input {
  --el-input-bg-color: transparent;
  --el-input-border-color: rgb(147, 88, 255);
  --el-color-primary: white;
  --el-input-text-color: white;
  --el-input-placeholder-color: #B1B1B1FF;
  --el-input-inner-height: 45px;
  font-size: 17px;
}

.el-checkbox {
  --el-checkbox-bg-color: transparent;
  --el-checkbox-input-border: rgb(147, 88, 255) 1px solid;
  --el-color-primary: rgb(147, 88, 255)
}

.el-button {
  width: 100%;
}
</style>
