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
import TeamCountdown from "./components/TeamCountdown.vue";
import Level from "./components/Level.vue";
import {getMatchInfoApi, handleInviteApi} from "@/api/champion";
import { useRoute } from 'vue-router';
import Detail from './Detail.vue';
import DraggableButton from "./components/DraggableButton.vue";
import bgImg from "@/assets/images/champion/team/bg.webp";
import TeamMember from "./components/teamMember.vue";
import ChampoinTeam from "./components/championTeam.vue";
import championTeamBg from "@/assets/images/champion/champion-team-bg.webp";

const route = useRoute()
const store = useStore()

const matchId = computed(() => {
  const id = Number(window.sessionStorage.getItem('matchId'));
  console.log('SignUp.vue 获取 matchId:', id);
  return id;
})
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
}, {
  'name': '总冠军',
  'value': 3
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
const championTeamInfo = ref({}) // 总冠军队伍信息

const userInfo = computed(() => store.userInfo)

// 获取比赛详情
const getMatchInfo = () => {
  loading.value = true
  getMatchInfoApi().then(res => {
    if (res.code === 200) {
      matchData.value = res.data
      targetDate.value = new Date(res.data.signUpEndTime)
    }
  }).catch(err => {
    console.error('获取比赛详情失败:', err)
    ElMessage.error('获取比赛详情失败')
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
  } else if (active.value === 2) {
    getMatchStageList()
  } else if (active.value === 3) {
    getChampionTeamInfo()
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
const auditScrollRef= ref()
const invitedScrollRef= ref()
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

// 获取冠军队伍
const getChampionTeamInfo = () => {
  loading.value = true
  getTeamListApi({
    matchId: matchId.value,
    champion: true
  }).then(res => {
    if (res.data && res.data.length) {
      championTeamInfo.value = res.data[0]
    } else {
      championTeamInfo.value = {}
    }
  }).finally(() => {
    loading.value = false
  })
}

const handleStopCountdown = () => {
  getMatchInfo()
}

// 根据当前tab动态设置背景
const specialBg = computed(() => {
  if (active.value === 3) {
    return {
      img: championTeamBg,
      height: "134.95vw",
    };
  }
  return {
    img: bgImg,
    height: '187.5vw'
  };
})

onMounted(() => {
  getList()
  getMatchInfo()
})
</script>

<template>
  <Detail :bg="specialBg">
    <template #top v-if="matchData.status === 1 && targetDate > new Date()">
      <TeamCountdown
        :target-time="targetDate"
        :show-status="false"
        @finish="handleStopCountdown"
        >
        <div v-if="userInfo.userType === '01'" @click="handleClickCreateTeam"
        class="submit-btn">创建队伍</div>
      </TeamCountdown>
    </template>
    <div class="signup-container" v-loading="loading">
      <div class="group-wrapper">
        <div
          class="goup-item"
          v-for="(i, index) in navList"
          :key="'nav' + index"
          :class="{ active: active === i.value }"
          @click="changeActive(i.value)"
        >
          {{ i.name }}
        </div>
      </div>
      <div class="main-list" :style="{ marginTop: matchData.status === 1 && targetDate > new Date() ? '27vw' : '50px' }">
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
          <TeamCard :isMy="true" :cardData="teamInfo" @onInvite="showSearchUserDialog" v-if="isShowTeamInfo"/>
          <!-- 主播且队长权限 -->
          <div class="auth-1" v-if="isShowAuditList">
            <div class="sub-nav">
              <div class="submit-btn nav-item" :class="subActive === i.value ? '' : 'disable-btn'" v-for="(i,index) in subNavList" :key="'tab' + index"
                  @click="changeSubActive(i.value)">{{ i.name }}</div>
            </div>
            <!-- 主播且队长：待审批用户列表 -->
            <div class="audit-list" v-if="subActive === 0">
              <el-scrollbar max-height="800px" @scroll="onAuditScroll" ref="auditScrollRef">
                <div ref="auditListRef">
                  <TeamMember :data="auditList || []" is-audit is-leader @audit="(status, id) => handleAudit(status, id)"/>
                </div>
              </el-scrollbar>
            </div>
            <!-- 主播且队长：已邀请用户列表 -->
            <div class="audit-list" v-if="subActive === 1">
              <el-scrollbar max-height="800px" @scroll="onInvitedScroll" ref="invitedScrollRef">
                <div ref="invitedListRef">
                  <TeamMember :data="invitedList || []" is-leader />
                </div>
              </el-scrollbar>
            </div>
          </div>
          <!-- 普通用户权限 邀请列表 -->
          <div class="auth-2" v-else>
            <div class="audit-list">
              <el-scrollbar max-height="800px" @scroll="onAuditScroll" ref="auditScrollRef">
                <div ref="invitedListRef">
                  <TeamMember :data="invitedList || []" @reply="(status, id) => handleInvite(status, id)"/>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
        <!-- 晋级图 -->
        <Level v-if="active === 2 && levelData.length" :data="levelData"/>
        <!-- 总冠军 -->
        <ChampoinTeam v-if="active === 3" :data="championTeamInfo" />
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
:deep() {
  .detail-content {
    z-index: auto;

    .nav-wrapper {
      position: relative;
      z-index: 3;
    }
  }
}
.submit-btn {
  text-align: center;
  margin: 30px auto 0;
  width: 302px;
  height: 81px;
  line-height: 70px;
  background: url("@/assets/images/recharge/qrcode.png") no-repeat;
  background-size: 100% 100%;
  font-weight: 500;
  font-size: 24px;
  color: #072523;
  cursor: pointer;
  border: 0;
  @include mobile {
    width: 50%;
    height: 36px;
    line-height: 32px;
    font-size: 16px;
    margin-top: 18px;
  }
  &.disable-btn {
    background-image: url('@/assets/images/champion/team/status-bg.png');
    color: #E8B253;
  }
}
.signup-container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  .group-wrapper {
    height: 60px;
    margin-top: 56px;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 3;
    @include mobile {
      margin-top: 180px;
    }
    .goup-item {
      width: 159px;
      height: 63px;
      line-height: 57px;
      text-align: center;
      font-weight: 500;
      font-size: 18px;
      color: #ffffff;
      cursor: pointer;
      @include mobile {
        font-size: 16px;
        width: 140px;
      }
      
      &.active {
        color: #8fedd8;
        background: url("@/assets/images/header/active-menu.png") no-repeat;
        background-size: 100% 63px;
      }
    }
  }
  .main-list {
    width: 1162px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
    @include mobile {
      width: 96%;
      margin-top: 20px !important;
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
      margin-top: 40px;
      .nav-item {
        margin: 0 0 0 16px;
        @include mobile {
          margin-left: 8px;
        }
        &+ .nav-item {
          margin: 0 0 0 26px;
          @include mobile {
            margin-left: 8px;
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
    margin-top: -10px;
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
    height: 500px;
    border-radius: 8px;
    background-color: #38383894;
    font-weight: 500;
    font-size: 19px;
    color: #C4C4C4;
    display: flex;
    align-items: center;
    justify-content: center;
    @include mobile {
      width: 100%;
      height: 300px;
    }
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
