<script setup>

import UAvatar from "@/components/UAvatar.vue";
import {useStore} from "@/store";
import {ref, watch} from "vue";
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
    <div class="tabs-container-item user_info" style="height: 140px">

      <div style="position: relative">
        <u-avatar :src="store.userInfo.avatar" size="100"/>
        <van-uploader :after-read="afterRead"
                      style="opacity: 0;--van-uploader-size:100px;--van-padding-xs:0px;position: absolute;left: 50%;top:50%;width: 100%;height: 100%;transform: translate(-50%,-50%)"/>
      </div>
      <div
          style="display: flex;flex-direction: column;margin-left: 20px;height: 100%;justify-content: space-evenly">
        <div style="font-size: 1.1em" class="tw-flex">
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
      <span>交易链接</span>
      <div></div>
    </div>
    <div class="tabs-container-item">
      <div style="display: flex;align-items: center;margin-top: 10px">
        <el-input v-model="link" style="max-width: 650px" readonly/>
        <BaseButton name="修改" font-size="14px" style="width: 107px;height: 41px;margin-left: 20px" @click="openDialog(3)"></BaseButton>
      </div>
    </div>
    <div class="tabs-container-title">
      <span>账号管理</span>
      <div></div>
    </div>
    <div class="tabs-container-item account_manage">
      <div>登录账号：{{ store.userInfo.userName }}</div>
      <div style="display:flex;align-items: center">
        <div>登录密码：**********</div>
        <div class="button" @click="openDialog(1)">修改密码</div>
        <div class="button" @click="openDialog(2)" v-if="store.userInfo.isRealCheck!=='1'">实名认证</div>
        <div class="button" style="filter: grayscale(100%);cursor: not-allowed" v-else>已实名</div>
      </div>
    </div>
    <div class="tabs-container-title">
      <span>绑定上级邀请码</span>
      <div></div>
    </div>
    <div class="tabs-container-item" style="height: 100px">
      <div style="display: flex;align-items: center;">
        <el-input v-model="invitationCode" style="max-width: 650px" placeholder="输入上级邀请码"
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
$primary-color-user: #FF4545A6;


.base_dialog{
  width: 100%;
  .el-input{
    --el-input-bg-color:none;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
    --el-input-border:0px;
    --el-input-border-color:tranparent;
    --el-input-text-color:#ffffffaa;
    --el-input-focus-border-color: rgba(255, 255, 255, 0.2);
    --el-input-focus-border: rgba(255, 255, 255, 0.2);
    height: 45px;
    border-radius: 5px;
  }
}
.tabs-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  font-size: 14px;

  .button {
    font-size: 12px;
    min-width: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 16px;
    height: 100%;
    color: #FFFFFFCC;

    width: fit-content;
    background: linear-gradient(200deg, rgba(255, 225, 225, 0.2) 32.92%, rgba(255, 0, 0, 0.2) 87.52%);
    border-radius: 25px;
    border: 1px solid #FC523A;
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
    margin: 20px 0;

    span {
      position: relative;
      font-size: 16px;
      font-family: "Source Han Sans CN", "Microsoft YaHei", 'sans-serif';
      filter: drop-shadow(0px 0px 4.3px #FF4545A6);


      z-index: 2;
    }

    div {
      content: '';
      position: absolute;
      width: 91px;
      height: 10px;
      bottom: -7px;
      left: 0;
      background: linear-gradient(90deg, #F34A34 0%, rgba(141, 43, 30, 0) 100%);

      z-index: 0;
    }
  }

  &-item {
    width: 100%;
    height: fit-content;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    padding: 10px 0;



    &.user_info {
      background: linear-gradient(270deg, rgba(56, 49, 49, 0) 0%, rgba(222, 67, 32, 0.27) 100%);
      box-shadow: 0px 3.2px 27.12px 0px #500B0557;
      flex-direction: row;
      padding: 20px 20px;;
    }
    &.account_manage{
      background: linear-gradient(270deg, rgba(56, 49, 49, 0) 0%, rgba(222, 67, 32, 0.27) 100%);
      box-shadow: 0px 3.2px 27.12px 0px #500B0557;
      padding: 20px 20px;
    }


  }
}
</style>
