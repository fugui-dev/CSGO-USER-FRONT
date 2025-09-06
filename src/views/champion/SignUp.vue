<script setup>
import Layout from "@/components/Layout.vue";
import {computed, onMounted, ref} from "vue";
import {getTeamListApi, getAuditListApi, auditUserApi, getInviteListApi, getMatchStageApi} from "@/api/champion";
import {requireImg, isNotEmptyObj} from "@/utils/common";
import {ElMessage} from "element-plus";
import TeamCard from './components/TeamCard.vue'
import MyTeamCard from './components/MyTeamCard.vue'
import CreateTeamDialog from "./components/CreateTeamDialog.vue";
import SearchUserDialog from "./components/SearchUserDialog.vue";
import {useDebounceFn} from "@vueuse/core";
import {useStore} from "@/store";
import Countdown from "./components/Countdown.vue";
import Level from "./components/Level.vue";
import {getMatchInfoApi, handleInviteApi} from "@/api/champion";
import { useRoute } from 'vue-router';
import Detail from './Detail.vue';
import DraggableButton from "./components/DraggableButton.vue";

const route = useRoute()
const store = useStore()

const matchId = computed(() => Number(window.sessionStorage.getItem('matchId')))
const loading = ref(false)
const auditListRef = ref()
const list = ref([]) // 所有队伍列表
const teamInfo = ref({}) // 我的队伍
const auditList = ref([]) // 待审批用户列表
const invitedList = ref([]) // 已邀请用户列表
const active = ref(0)
const navList = ref([{
  'name': '所有队伍',
  'value': 0
}, {
  'name': '我的队伍',
  'value': 1
}, {
  'name': '晋级图',
  'value': 2
}])
const subActive = ref(0)
const subNavList = ref([{
  'name': '待审批',
  'value': 0
}, {
  'name': '已邀请',
  'value': 1
}])
const auditForm = ref({
  matchId: -1,
  pageNum: 1,
  pageSize: 12
})
const isAuditComplete = ref(false)
const invitedForm = ref({
  invite: false, // false为已邀请列表
  matchId: '',
  pageNum: 1,
  pageSize: 12
})
const isInvitedComplete = ref(false)
const createTeammDialogRef = ref(null)
const searchUserDialogRef = ref(null)
const matchData = ref({})
const targetDate = ref(0)
const isShowAuditList = ref(false) // 是否展示待审批和已邀请列表（主播+队长权限）
const isShowTeamInfo = ref(false) // 是否展示我的队伍卡片
const levelData = ref([])

const userInfo = computed(() => store.userInfo)

// 获取比赛详情
const getMatchInfo = () => {
  loading.value = true
  getMatchInfoApi().then(res => {
    if (res.code === 200) {
      matchData.value = res.data
      targetDate.value = new Date(res.data.signUpEndTime)
    }
  }).finally(() => {
    loading.value = false
  })
}

const changeActive = (val) => {
  active.value = val
  if (active.value === 0) {
    getList()
  } else if (active.value === 1) {
    getMyTeam()
    // 当前用户为主播才可以审批
    if (userInfo.value.userType === '01') {
      getAuditList()
    } else {
      getInvitedList(true)
    }
  } else {
    getMatchStageList()
  }
}

// 获取所有队伍列表
const getList = () => {
  loading.value = true
  getTeamListApi({
    matchId: matchId.value,
    champion: false
  }).then(res => {
    if (res.data && res.data.length) {
      list.value = res.data
    }
  }).finally(() => {
    loading.value = false
  })
}

// 获取我的队伍
const getMyTeam = () => {
  loading.value = true
  const userId = store.userInfo.userId
  getTeamListApi({
    matchId: matchId.value,
    champion: false,
    userId: userId
  }).then(res => {
    if (res.data && res.data.length) {
      teamInfo.value = res.data[0]
      console.log(teamInfo.value)
      checkStatus()
    }
  }).finally(() => {
    loading.value = false
  })
}

// 点击打开创建队伍弹窗
const handleClickCreateTeam = () => {
  createTeammDialogRef.value.open()
}

const checkStatus = () => {
  const findUser = teamInfo.value.matchUserList.find(item => item.userId === store.userInfo.userId)
  // 当前用户为主播且是队长，才展示待审批用户列表
  if (findUser && findUser.isCaptain) {
    isShowAuditList.value = store.userInfo.userType === '01'
  } else {
    isShowAuditList.value = false
  }
  // 是否展示我的队伍信息
  isShowTeamInfo.value = isNotEmptyObj(teamInfo.value)
}

const changeSubActive = (val) => {
  subActive.value = val
  if (subActive.value === 0) {
    getAuditList()
  } else if (subActive.value === 1) {
    getInvitedList(false)
  }
}

const debouncedGetAuditList = useDebounceFn(() => {
  if (!isAuditComplete.value) {
    auditForm.value.pageNum += 1
    getAuditList()
  }
}, 300)

// 获取待审批用户列表
const getAuditList = () => {
  loading.value = true
  auditForm.value.matchId = matchData.value.id
  getAuditListApi(auditForm.value).then(res => {
    if (res.data && res.data.length) {
      if (auditForm.value.pageNum === 1) {
        auditList.value = []
      }
      auditList.value.push(...res.data)
    } else {
      isAuditComplete.value = true
    }
  }).finally(() => {
    loading.value = false
  })
}

const onAuditScroll = (e) => {
  if (subActive.value === 0) {
    let scrollBarHeight = auditScrollRef.value.$el.querySelector(".el-scrollbar__bar:last-child .el-scrollbar__thumb").clientHeight || 200
    if (auditListRef.value && e.scrollTop) {
      if (e.scrollTop + scrollBarHeight + 500 >= auditListRef.value.clientHeight) {
        debouncedGetAuditList()
      }
    }
  }
}

const debouncedGetInvitedList = useDebounceFn(() => {
  if (!isInvitedComplete.value) {
    invitedForm.value.pageNum += 1
    if (isShowAuditList.value) {
      getInvitedList(false)
    } else {
      getInvitedList(true)
    }
  }
}, 300)

// 获取已邀请用户列表
const getInvitedList = (type) => {
  loading.value = true
  invitedForm.value.matchId = matchData.value.id
  invitedForm.value.invite = type // type为true表示被邀请，为false表示邀请列表
  getInviteListApi(invitedForm.value).then(res => {
    if (res.data && res.data.length) {
      if (invitedForm.value.pageNum === 1) {
        invitedList.value = []
      }
      invitedList.value.push(...res.data)
    } else {
      isInvitedComplete.value = true
    }
  }).finally(() => {
    loading.value = false
  })
}

const onInvitedScroll = (e) => {
  if (subActive.value === 1) {
    let scrollBarHeight = invitedScrollRef.value.$el.querySelector(".el-scrollbar__bar:last-child .el-scrollbar__thumb").clientHeight || 200
    if (invitedListRef.value && e.scrollTop) {
      if (e.scrollTop + scrollBarHeight + 500 >= invitedListRef.value.clientHeight) {
        debouncedGetInvitedList()
      }
    }
  }
}

// 审批用户
const handleAudit = (type, id) => {
  auditUserApi({
    id: id,
    status: type
  }).then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg)
      getAuditList()
    }
  })
}

// 处理邀请
const handleInvite = (type, id) => {
  handleInviteApi({
    inviteId: id,
    status: type
  }).then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg)
      getInvitedList(true)
    }
  })
}

// 点击邀请 搜索用户
const showSearchUserDialog = () => {
  const currUserInfo = store.userInfo
  // 当前用户是队长且主播才可以邀请用户
  if (currUserInfo.userId === teamInfo.value.captainUserId && currUserInfo.userType === '01') {
    searchUserDialogRef.value.open()
  } else {
    ElMessage.warning('当前用户是队长且主播才可以邀请用户')
  }
}

const handleCloseSearchUserDialog = () => {
  subActive.value = 1
  getInvitedList(false)
}

// 获取比赛阶段
const getMatchStageList = () => {
  loading.value = true
  getMatchStageApi({
    matchId: matchId.value
  }).then(res => {
    if (res.data && res.data.length) {
      levelData.value = res.data
    }
  }).finally(() => {
    loading.value = false
  })
}

const handleStopCountdown = () => {
  getMatchInfo()
}

onMounted(() => {
  getList()
  getMatchInfo()
})

</script>

<template>
  <Detail>
    <div class="signup-container" v-loading="loading" :style="{
      '--bg-tab1':requireImg('/home/t0.png',true),
      '--bg-tab2':requireImg('/home/t1.png',true),
      '--bg-header':requireImg('/level/3.png',true),
      }">
      <!-- 创建队伍 -->
      <DraggableButton
        text="创建队伍"
        @click="handleClickCreateTeam"
        v-if="userInfo.userType === '01'" />
      <!-- 头部 -->
      <div class="signup-header" v-if="matchData.status === 1 && targetDate > new Date()">
        <h3>战队集结中</h3>
        <!-- 倒计时 -->
        <Countdown
          :target-time="targetDate"
          :show-status="false"
          @stop="handleStopCountdown"
        />
      </div>
      
      <div class="main-list">
        <div class="nav">
          <div class="nav-item" v-for="(i,index) in navList" :class="{'active':active===i.value}" :key="index"
              @click="changeActive(i.value)">
            <span>{{ i.name }}</span>
          </div>
        </div>
        <!-- 所有队伍 -->
        <div class="team-list" v-loading="loading" style="flex: 1" v-if="active === 0">
          <div class="content">
            <div class="team-list-container" v-if="list.length">
              <TeamCard :cardData="i" v-for="(i,index) in list" :key="index"/>
            </div>
            <div class="empty-box" v-else>
              <p>暂无数据</p>
            </div>
          </div>
        </div>
        <!-- 我的队伍 -->
        <div class="my-team" v-loading="loading" v-if="active === 1">
          <MyTeamCard :cardData="teamInfo" @onInvite="showSearchUserDialog" v-if="isShowTeamInfo"/>
          <!-- 主播且队长权限 -->
          <div class="auth-1" v-if="isShowAuditList">
            <div class="sub-nav">
              <div class="sub-nav-item" v-for="(i,index) in subNavList" :class="{'sub-active':subActive===i.value}" :key="index"
                  @click="changeSubActive(i.value)">
                <span>{{ i.name }}</span>
              </div>
            </div>
            <!-- 主播且队长：待审批用户列表 -->
            <div class="audit-list" v-if="subActive === 0">
              <el-scrollbar max-height="800px" @scroll="onAuditScroll" ref="auditScrollRef">
                <div ref="auditListRef" class="audit-list-container" v-if="auditList && auditList.length">
                  <div :class="['audit-list-item', index % 2 === 1 ? 'highlight' : 'non-highlight']" v-for="(item, index) in auditList" :key="item.userId">
                    <div class="audit-list-item-left">
                      <div class="serial-num">{{ index + 1 }}</div>
                      <img class="avatar" :src="item.userAvatar" alt="">
                      <span class="nick-name">{{ item.nickName }}</span>
                    </div>
                    <div class="audit-btn-wrap" v-if="item.status === 0">
                      <div class="audit-btn" @click="handleAudit(1, item.id)">同意</div>
                      <div class="audit-btn" @click="handleAudit(2, item.id)">拒绝</div>
                    </div>
                    <div class="audit-status" v-else>
                      <div v-if="item.status === 1">已接受邀请</div>
                      <div v-if="item.status === 2">已拒绝邀请</div>
                    </div>
                  </div>
                </div>
                <div class="empty-box" v-else>
                  <p>暂无数据</p>
                </div>
              </el-scrollbar>
            </div>
            <!-- 主播且队长：已邀请用户列表 -->
            <div class="audit-list" v-if="subActive === 1">
              <el-scrollbar max-height="800px" @scroll="onInvitedScroll" ref="invitedScrollRef">
                <div ref="invitedListRef" class="audit-list-container" v-if="invitedList && invitedList.length">
                  <div :class="['audit-list-item', index % 2 === 1 ? 'highlight' : 'non-highlight']" v-for="(item, index) in invitedList" :key="item.invitedUserId">
                    <div class="audit-list-item-left">
                      <div class="serial-num">{{ index + 1 }}</div>
                      <img class="avatar" :src="item.invitedUserAvatar" alt="">
                      <span class="nick-name">{{ item.invitedUserName }}</span>
                    </div>
                    <div class="audit-status">
                      <div v-if="item.status === 0">未接受邀请</div>
                      <div v-if="item.status === 1">已接受邀请</div>
                      <div v-if="item.status === 2">已拒绝邀请</div>
                    </div>
                  </div>
                </div>
                <div class="empty-box" v-else>
                  <p>暂无数据</p>
                </div>
              </el-scrollbar>
            </div>
          </div>
          <!-- 普通用户权限 邀请列表 -->
          <div class="auth-2" v-else>
            <div class="audit-list">
              <el-scrollbar max-height="800px" @scroll="onAuditScroll" ref="auditScrollRef">
                <div ref="invitedListRef" class="audit-list-container" v-if="invitedList && invitedList.length">
                  <div :class="['audit-list-item', index % 2 === 1 ? 'highlight' : 'non-highlight']" v-for="(item, index) in invitedList" :key="item.userId">
                    <div class="audit-list-item-left">
                      <div class="serial-num">{{ index + 1 }}</div>
                      <img class="avatar" :src="item.invitedUserAvatar" alt="">
                      <span class="nick-name">{{ item.invitedUserName }}</span>
                    </div>
                    <div class="audit-btn-wrap" v-if="item.status === 0">
                      <div class="audit-btn" @click="handleInvite(1, item.id)">同意邀请</div>
                      <div class="audit-btn" @click="handleInvite(2, item.id)">拒绝邀请</div>
                    </div>
                    <div class="audit-status" v-else>
                      <div v-if="item.status === 1">已接受邀请</div>
                      <div v-if="item.status === 2">已拒绝邀请</div>
                    </div>
                  </div>
                </div>
                <div class="empty-box" v-else>
                  <p>暂无数据</p>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
        <!-- 晋级图 -->
        <Level v-if="active === 2 && levelData.length" :data="levelData"/>
      </div>
    </div>
    <CreateTeamDialog ref="createTeammDialogRef" />
    <SearchUserDialog
      ref="searchUserDialogRef"
      :teamId="teamInfo.id"
      :matchId="teamInfo.matchId"
      @close="handleCloseSearchUserDialog"/>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.signup-container {
  width: 96%;
  display: flex;
  flex-direction: column;
  max-width: 1024px;
  margin: 6px auto;
  box-sizing: border-box;
  position: relative;
  .signup-header {
    position: relative;
    h3 {
      background: var(--bg-header);
      background-size: 100% 100%;
      width: 120px;
      height: 30px;
      font-size: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom-right-radius: 15px;
      border-bottom-left-radius: 15px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      position: absolute;
      left: 50%;
      top: 8px;
      z-index: 2;
      transform: translateX(-60px);
    }
  }
  .main-list {
    .nav {
      display: flex;
      align-items: center;
      margin-top: 30px;
      @include mobile{
        justify-content: space-evenly;
      }


      &-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "PingFang Regular", sans-serif;
        cursor: pointer;
        background: #FFF5F5;
        flex-shrink: 0;

        width: 153px;
        height: 48px;
        border-radius: 30px;
        font-size: 16px;
        margin-right: 32px;

        @include mobile{
          width: 104px;
          margin-right: 0;
        }

        span {
          filter: drop-shadow(0px 0px 4.3px #FF4545A6);
          font-size: 16px;
        }


        @include mobile {
          height: 40px;
        }

        &:first-child {
          background: linear-gradient(90.15deg, #FF3C2A -4.19%, rgba(149, 0, 0, 0) 99.85%);

        }

        &:nth-child(2) {
          background: linear-gradient(90.15deg, #FF952A -4.19%, rgba(149, 87, 0, 0) 99.85%);

        }

        &:nth-child(3) {
          background: linear-gradient(90.15deg, #A27A7A -4.19%, rgba(152, 116, 116, 0) 99.85%);

        }

        &.active {
          position: relative;

          &::after {
            content: '';
            position: absolute;
            width: 40px;
            height: 4px;
            border-radius: 34px;
            background: white;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);

          }
        }

      }
    }
    .battle-list {
      .battle-list-container {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 12px;
        padding: 16px 0;
      }
    }
  }
  .my-team {
    .sub-nav {
      display: flex;
      align-items: center;
      margin-top: 30px;
      @include mobile{
        justify-content: space-evenly;
      }


      &-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "PingFang Regular", sans-serif;
        cursor: pointer;
        background: #FFF5F5;
        flex-shrink: 0;

        width: 153px;
        height: 48px;
        border-radius: 30px;
        font-size: 16px;
        margin-right: 32px;

        @include mobile{
          width: 104px;
          margin-right: 0;
        }

        span {
          filter: drop-shadow(0px 0px 4.3px #FF4545A6);
          font-size: 16px;
        }


        @include mobile {
          height: 40px;
        }

        &:first-child {
          // background: linear-gradient(90.15deg, #FF3C2A -4.19%, rgba(149, 0, 0, 0) 99.85%);
          background: var(--bg-tab1);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          width: 48%;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          span {
            font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
          }
        }

        &:nth-child(2) {
          // background: linear-gradient(90.15deg, #FF952A -4.19%, rgba(149, 87, 0, 0) 99.85%);
          background: var(--bg-tab2);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          width: 48%;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          span {
            font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
          }
        }

        &.sub-active {
          position: relative;

          &::after {
            content: '';
            position: absolute;
            width: 40px;
            height: 4px;
            border-radius: 34px;
            background: white;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);

          }
        }

      }
    }
  }
  .highlight {
    background: linear-gradient(to right, rgb(143, 5, 202), rgb(11, 11, 96));
  }
  .non-highlight {
    background: linear-gradient(to right, rgb(105, 94, 116), rgb(24, 24, 36));
  }
  .audit-list {
    padding: 16px 0;
  }
  .audit-list-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 8px;
    .audit-list-item-left {
      display: flex;
      align-items: center;
      .serial-num {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid #aaa;
        background-color: #444;
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 18px;
        color: #eee;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 12px;
      }
      img.avatar {
        width: 34px;
        height: 34px;
        border-radius: 6px;
        border: 1px solid #f2a814;
        margin-right: 8px;
      }
      .nick-name {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 15px;
        white-space: nowrap; /* 防止文本换行 */
        overflow: hidden; /* 隐藏溢出的内容 */
        text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
        max-width: 120px;
      }
    }
    .audit-btn-wrap {
      display: flex;
      align-items: center;
      .audit-btn {
        background: linear-gradient(to right, rgb(151, 84, 214), rgb(38, 52, 156));
        border-radius: 5px;
        padding: 0 20px;
        font-size: 14px;
        height: 26px;
        line-height: 26px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        box-shadow: 3px 4px 12px rgba(95, 95, 88, 0.8);
        margin-right: 12px;
      }
    }
    .audit-status {
      display: flex;
      align-items: center;
      padding-right: 10px;
      div {
        font-size: 15px;
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        color: #7f0fe2;
      }
    }
  }
  .empty-box {
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    font-size: 18px;
    color: #eee;
    text-align: center;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@keyframes up_and_down {
  0% {
    transform: translate(-50%,-50%);
  }

  50% {

    transform: translate(-50%,calc(-50% - 10px));
  }

  100% {
    transform: translate(-50%,-50%);
  }
}
@keyframes smooth {
  0% {
    filter: drop-shadow(0px 0px 0px rgba(255, 255, 255, 0.3));
  }

  50% {
    filter: drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.3));
  }

  100% {
    filter: drop-shadow(0px 0px 0px rgba(255, 255, 255, 0.3));
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content-wrap {
    flex-direction: column;
    .battle-list-container {
      grid-template-columns: 1fr 1fr !important;
    }
  }
}
</style>
