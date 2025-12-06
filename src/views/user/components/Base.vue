<script setup>

import UAvatar from "@/components/UAvatar.vue";
import {useStore} from "@/store";
import {ref, watch, computed} from "vue";
import {
  getSmsCodeApi,
  getUserInfoApi,
  setParentInvitationCodeApi,
  setReal,
  updateUserInfoApi,
  uploadFileApi
} from "@/api";
import BaseDialog from "@/components/dialogs/BaseDialog.vue";
import {ElMessage} from "element-plus";
import RechargeModal from "@/components/RechargeModal/index.vue";
import BaseButton from "@/components/Btn/BaseButton.vue";
import CountdownButton from "@/components/Btn/CountdownButton.vue";

const store = useStore()
const link = ref()
const invitationCode = ref()
const nickName = ref()
const dialogRef = ref()
const password = ref()
const dialogType = ref(0)
const rechargeModalRef = ref()
const code=ref(null)
const phone=ref(null)
const shiming = ref({
  idNum: '',
  realName: ''
})
const isPC = computed(()=>{
  console.log(store.isPC)
  return store.isPC
})
const getUserInfo = () => {
  getUserInfoApi().then(res => {
    store.setUserInfo(res.data)
  })
}
getUserInfo()
watch(() => store.userInfo, () => {
  link.value = store.userInfo.transactionLink
  invitationCode.value = store.userInfo.parentInvitationCode
  nickName.value = store.userInfo.nickName
}, {
  deep: true,
  immediate: true
})

const handleBindPatent = () => {
  setParentInvitationCodeApi({
    parentInvitationCode: invitationCode.value
  }).then(() => {
    getUserInfo()
    ElMessage({
      message: '绑定成功',
      type: 'success'
    })
  })

}

const updateUserInfo = (data) => {
  return new Promise((resolve, reject) => {
    updateUserInfoApi(data).then(r => {
      getUserInfo()
      resolve(r)
    }).catch(err => {
      reject(err)
    })
  })
}
const openDialog = (type) => {
  dialogRef.value.open()
  dialogType.value = type
}
const onConfirm = () => {
  let data = {}
  if (dialogType.value === 0) {
    data.nickName = nickName.value
  } else if (dialogType.value === 1) {
    data.password = password.value
  }
  if (data.nickName || data.password) {
    updateUserInfo(data).then(() => {
      dialogRef.value.close()
      password.value = null
      ElMessage({
        message: '修改成功',
        type: 'success'

      })
    })
  } else if (dialogType.value === 2) {
    setReal(shiming.value).then(() => {
      getUserInfo()
      ElMessage({
        message: '实名认证成功',
        type: 'success'
      })
      dialogRef.value.close()
    })

  } else if(dialogType.value===3){
    if (!code.value){
      ElMessage({
        message: '请输入验证码',
        type: 'warning'
      })
      return
    }
    if (!link.value){
      ElMessage({
        message: '请输入交易链接',
        type: 'warning'
      })
      return
    }
    updateUserInfo({'transactionLink':link.value,'streamSmsCode':code.value}).then(()=>{
      code.value=null
      dialogRef.value.close()
    })
  }else {
    ElMessage({
      message: '请输入内容',
      type: 'warning'
    })
  }

}

const countdownButtonRef=ref()
const getSmsCode = () => {
  const countRef = countdownButtonRef.value
  if (!store.userInfo.userName){
    ElMessage({
      message: '请绑定手机号',
      type: 'warning'
    })
    return
  }

  getSmsCodeApi({
    phoneNumber: store.userInfo.userName,
    type: 5
  }).then(res => {
    console.log(res)
  }).catch(err => {
    countRef.clearDisabled()
  })
}
const afterRead = (file) => {
  const formData = new FormData();
  formData.append('file', file.file)
  uploadFileApi(formData).then(res => {
    if (res.status === 200 && res.data.code === 200) {
      let imgUrl = res.data.url
      updateUserInfo({'avatar': imgUrl}).then(() => {
        getUserInfo()
        ElMessage({
          message: '上传头像成功',
          type: 'success'
        })
      })
    } else {
      ElMessage.error("上传头像失败")
    }
  }).catch(err => {
    ElMessage.error("上传头像失败")
  })

}
</script>

<template>
  <div class="tabs-container">
    <div class="tabs-container-item user_info" style="height: 100px">

      <div style="position: relative">
        <u-avatar :src="store.userInfo.avatar" :size="isPC ? '80' : '40'"/>
        <van-uploader :after-read="afterRead"
                      style="opacity: 0;--van-uploader-size:100px;--van-padding-xs:0px;position: absolute;left: 50%;top:50%;width: 100%;height: 100%;transform: translate(-50%,-50%)"/>
      </div>
      <div
          class="tw-text-[13px] tw-text-[#1D1F22]"
          style="display: flex;flex-direction: column;margin-left: 8px;height: 100%;justify-content: space-evenly">
        <div class="tw-flex">
          {{ store.userInfo.nickName }}
          <div class="button" style="height: fit-content" @click="openDialog(0)">编辑</div>
        </div>
        <div>ID：{{ store.userInfo.userId }}</div>
        <div class="tw-flex">
          <div>我的账户：{{ store.userInfo.accountAmount }}</div>
          <div class="button" style="height: fit-content" @click="rechargeModalRef.open">充值</div>
        </div>
      </div>
    </div>
    <div class="tabs-container-title">
      <h3>交易链接</h3>
    </div>
    <div class="tabs-container-item url-wrap">
      <div style="display: flex;align-items: center;">
        <p class="tw-text-[#1D1F22] tw-text-[12px]">{{ link }}</p>
        <BaseButton name="修改" font-size="12px" style="width: 80px;height: 26px;margin-left: 20px;color: #072523;" @click="openDialog(3)"></BaseButton>
      </div>
    </div>
    <div class="tabs-container-title">
      <h3>账号管理</h3>
    </div>
    <div class="tabs-container-item account_manage">
      <div>登录账号：{{ store.userInfo.userName }}</div>
      <div style="display:flex;align-items: center">
        <div class="tw-mr-[200px] login-pwd">登录密码：**********</div>
        <div class="button" @click="openDialog(1)">修改密码</div>
        <div class="button" @click="openDialog(2)" v-if="store.userInfo.isRealCheck!=='1'">实名认证</div>
        <div class="button" style="cursor: not-allowed" v-else>已实名</div>
      </div>
    </div>
    <div class="tabs-container-title">
      <h3>绑定上级邀请码</h3>
    </div>
    <div class="tabs-container-item" style="height: 100px">
      <div style="display: flex;align-items: center;">
        <el-input v-model="invitationCode" style="max-width: 650px" placeholder="输入上级邀请码" class="invite-code"
                  :disabled="store.userInfo.parentInvitationCode!==null && store.userInfo.parentInvitationCode!==''"/>
        <BaseButton name="修改" font-size="14px" style="width: 107px;height: 41px;margin-left: 20px" @click="handleBindPatent"
                    v-if="store.userInfo.parentInvitationCode===null || store.userInfo.parentInvitationCode===''"></BaseButton>
      </div>
    </div>
    <BaseDialog ref="dialogRef"  :show-cancel="true" :show-confirm="true" @confirm="onConfirm">
      <template #title>
        <span>{{ dialogType === 0 ? '修改昵称' : dialogType === 1 ? '修改密码' : dialogType===2? '实名认证':'修改交易链接'}}</span>
      </template>
      <template #default >
        <div style="height: 100%;display: flex;align-items: center;justify-content: center" class="base_dialog">
          <el-input v-model="nickName" style="max-width: 650px;height: 70px" placeholder="请输入昵称"
                    v-if="dialogType===0"/>
          <el-input v-model="password" type="password" style="max-width: 650px;height: 70px" placeholder="请输入密码"
                    v-if="dialogType===1"/>
          <div v-if="dialogType===2" class="base_dialog"
               style="display: flex;flex-direction: column;max-width: 650px;height: 70px;width: 100%">
            <el-input v-model="shiming.realName" style="max-width: 650px;height: 70px;margin-bottom: 15px"
                      placeholder="请输入姓名"
            />
            <el-input v-model="shiming.idNum" style="max-width: 650px;height: 70px" placeholder="请输入身份证号"
            />
          </div>
          <div v-if="dialogType===3" class="base_dialog">
            <div style="display: flex;align-items: center;margin-bottom: 10px;">
              <el-input style="flex:1;margin-right: 10px" v-model="code" placeholder="请输入验证码"/>
              <CountdownButton style="height: 100%" @click="getSmsCode()" ref="countdownButtonRef"/>
            </div>
            <el-input v-model="link" style="max-width: 850px"/>
          </div>
        </div>
      </template>
    </BaseDialog>
    <RechargeModal ref="rechargeModalRef"/>
  </div>

</template>

<style scoped lang="scss">
@use "@/style" as *;
$primary-color-user: #FF4545A6;

.url-wrap {
  @include mobile {
    flex-direction: row !important;
  }
  p {
    @include mobile {
      width: 200px;
      box-sizing: border-box;
      padding-right: 80px;
      overflow: auto;
    }
  }
}
.login-pwd {
  @include mobile {
    margin-right: 10px;
  }
}
.base_dialog{
  width: 100%;
  .el-input{
    --el-input-bg-color:none;
    background: #74705E;
    --el-input-border:0px;
    --el-input-border-color:tranparent;
    --el-input-text-color:#ffffff;
    --el-input-focus-border-color: rgba(255, 255, 255, 0.2);
    --el-input-focus-border: rgba(255, 255, 255, 0.2);
    height: 45px;
    border-radius: 5px;
  }
}
.tabs-container {
  padding: 60px 210px 60px 80px !important;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  background: url('@/assets/images/user/user_info_bg.png') no-repeat;
  background-size: 90% 90%;
  @include mobile {
    padding: 80px 60px 60px 60px !important;
    background-size: 94% 94%;
    background-position: 50% 50%;
  }

  .button {
    font-size: 12px;
    min-width: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 16px;
    height: 100%;
    color: #072523;
    width: fit-content;
    background: url('@/assets/images/login/yellow_btn.png') no-repeat;
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 8px;

    &:hover {
      opacity: .8;
    }
  }

  &-title {
    position: relative;
    width: fit-content;
    margin: 5px 0;

    h3 {
      position: relative;
      font-size: 14px;
      font-family: "Source Han Sans CN", "Microsoft YaHei", 'sans-serif';
      z-index: 2;
      color: #1D1F22;
    }
  }

  &-item {
    width: 100%;
    height: fit-content;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    padding: 6px 0;

    &.user_info {
      flex-direction: row;
      padding: 4px;
      background-color: rgba($color: #70603F, $alpha: 0.59);
    }
    &.account_manage{
      padding: 10px 0;
      font-size: 12px;
      color: #1D1F22;
    }

    .invite-code {
      background: rgba($color: #70603F, $alpha: 0.59);
      --el-disabled-bg-color: none;
      --el-disabled-text-color: #1D1F22;
      font-size: 12px;
      height: 35px;
      :deep(.el-input__wrapper) {
        box-shadow: none;
      }
    }
  }
}
</style>
