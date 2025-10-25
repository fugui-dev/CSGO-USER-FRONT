<script setup>
import { ref } from "vue";
import {requireImg} from "@/utils/common";
import {searchUserApi, inviteUserApi} from "@/api/champion"
import {ElMessage} from "element-plus";

const props = defineProps({
  teamId: {
    type: Number
  },
  matchId: {
    type: Number
  }
});

const visible = ref(false)
const searchUserFormRef = ref()
const searchUserForm = ref({
  userName: ''
})
const searchUserFormRules = ref({
  userName: [
    {required: true, message: '请输入用户名', trigger: 'blur'}
  ]
})
const userList = ref([])
const loading = ref(false)

const open = () => {
    visible.value = true
}

const close = () => {
    visible.value = false
    userList.value = []
    searchUserForm.value.userName = ''
    emit('close')
}

const closeModal = () => {
    visible.value = false;
    userList.value = []
    searchUserForm.value.userName = ''
};

const searchUserFormSubmit = () => {
  searchUserFormRef.value.validate(valid => {
    if (valid) {
      loading.value = true
      searchUserApi(searchUserForm.value).then(res => {
        if (res.code === 200) {
          userList.value = res.rows
        }
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

const handleInvite = (inviteUserId) => {
  const teamId = props.teamId
  const matchId = props.matchId
  inviteUserApi({teamId, matchId, inviteUserId}).then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg)
      close()
    }
  })
}

defineExpose({
    open,
    close
})

</script>
<template>
  <el-dialog
    v-model="visible"
    width="1163"
    :show-close="false"
    align-center
    style="--el-dialog-bg-color: transparent"
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="search-wrapper">
      <div class="close-click" @click="closeModal" />
      <div class="title">搜索用户</div>
      <el-form :model="searchUserForm" :rules="searchUserFormRules" ref="searchUserFormRef" class="search-form">
        <el-form-item label="" prop="userName" class="user-name">
          <div class="input-wrapper">
            <el-input v-model="searchUserForm.userName"
              placeholder="请输入用户名"
              style="--el-input-placeholder-color: #ffffff"/>
            <div class="search" @click="searchUserFormSubmit">搜索</div>
          </div>
        </el-form-item>
      </el-form>
      <div class="result">
        <template v-for="(item, index) in userList" :key="'user' + item.userId">
          <div class="result-item">
            <div class="info">
              <div class="avatar-wrapper">
                <img
                  class="avatar"
                  :src="item.avatar"
                  alt=""
                />
                <img
                  class="avatar-bg"
                  src="@/assets/images/champion/avatar-rank-bg.png"
                  alt=""
                />
              </div>
              <div class="name">{{ item.nickName }}</div>
            </div>
            <div class="invite-btn" @click="handleInvite(item.userId)">邀请</div>
          </div>
          <div class="split"></div>
        </template>
        <template v-if="!userList.length" >
          <img class="split-img" src="@/assets/images/champion/team/split.png" alt="" />
          <div class="empty">暂无数据</div>
        </template>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.search-wrapper {
  height: 609px;
  background: url("@/assets/images/shop/dialog-bg.webp") no-repeat;
  background-size: 100% 100%;
  position: relative;
  line-height: normal;
  font-family: "PingFang Medium";
  font-weight: 500;
  color: #1d1f22;
  overflow: hidden;
  margin-top: 30px;
  .close-click {
    width: 70px;
    height: 70px;
    position: absolute;
    right: 32px;
    top: 37px;
    cursor: pointer;
  }
  .title {
    text-align: center;
    margin-top: 82px;
    font-weight: 500;
    font-size: 28px;
    color: #1D1F22;
  }
  .search-form {
    margin-top: 18px;
    margin-left: 133px;
  }
  .input-wrapper {
    position: relative;
    .search {
      position: absolute;
      right: 7px;
      top: 6px;
      width: 116px;
      height: 44px;
      background: url("@/assets/images/champion/team/search-bg.png") no-repeat;
      background-size: 100% 100%;
      font-size: 20px;
      color: #072523;
      line-height: 44px;
      text-align: center;
      cursor: pointer;
    }
  }
  :deep() {
    .el-input {
      width: 867px;
      height: 56px;
      font-size: 22px;
    }
    .el-input__wrapper {
      background: #74705e;
      box-shadow: none;
      padding-right: 140px;
    }
    .el-input__inner {
      background: #74705e;
      box-shadow: none;
      border-radius: 9px;
      color: #ffffff;
    }
  }
  .result {
    margin-left: 133px;
    width: 867px;
    max-height: 330px;
    overflow-y: auto;
    overflow-x: hidden;
    &::-webkit-scrollbar {
      display: none;
    }
    .result-item {
      width: 100%;
      height: 85px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .info {
        display: flex;
        align-items: center;
        .avatar-wrapper {
          width: 71px;
          height: 72px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          .avatar {
            width: 51px;
            height: 51px;
            border-radius: 50%;
            display: block;
          }
          .avatar-bg {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            border-radius: 50%;
            width: 100%;
            height: 100%;
            z-index: -1;
          }
        }
        .name {
          margin-left: 16px;
          text-overflow: ellipsis;
          max-width: 600px;
          white-space: nowrap;
          overflow: hidden;
        }
      }
      .invite-btn {
        width: 104px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background: url("@/assets/images/champion/team/invite-btn.png") no-repeat;
        background-size: 100% 100%;
        margin-right: 7px;
        cursor: pointer;
      }
    }
    .split {
      margin: 0 auto;
      width: 855px;
      height: 1px;
      background: #74705E;
      opacity: 0.28;
    }
    .split-img {
      display: block;
      margin: 0 0 0 5px;
      width: 855px;
      height: 1px;
    }
    .empty {
      text-align: center;
      margin-top: 132px;
      font-size: 22px;
      color: #74705E;
    }
  }
}
</style>
