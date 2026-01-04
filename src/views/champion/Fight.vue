<script setup>
import {computed, onBeforeMount, onMounted, onUnmounted, ref, reactive, nextTick} from "vue";
import {requireImg, getWebSocketUrl} from "@/utils/common";
import {useStore} from "@/store"
import useWebSocketHeartbeat from '../../composables/useWebSocketHeartbeat'
import Detail from './Detail.vue';
import { useRouter } from "vue-router";
import Decimal from 'decimal.js'
import ChooseOddsDialog from './components/ChooseOddsDialog.vue'
import FightBox from './components/FightBox.vue'
import bgm from "@/assets/music/main_battle.mp3";
import {ElMessage} from "element-plus";
import WaitCountdown from "./components/waitCountdown.vue";
import FightItem from "./components/fightItem.vue";
import FightMember from "./components/fightMember.vue";
import FightGameDetail from "./components/fightGameDetail.vue";
import { useUserInfo } from "@/composables/useUesrInfo.js";

const router = useRouter()
const store = useStore()
const { fetchUserInfo } = useUserInfo()

const musica = new Audio(bgm)
const stageGroupFightId = Number(window.sessionStorage.getItem('stageGroupFightId'))
const fightData = ref({})
const currTeamPlayer = ref({
  index: -1,
  data: {}
})
const currOpponentTeamPlayer = ref({
  index: -1,
  data: {}
})
const currTeamFightBoxRef = ref()
const currOpponentTeamFightBoxRef = ref()
const currTeamScore = ref(0)
const currOpponentTeamScore = ref(0)
const teamScrollRef = ref(null)
const opponentTeamScrollRef = ref(null)
const currRound = ref(1)
const totalRound = ref(10)
const chooseOddsDialogRef = ref(null)
const chooseCountdownValue = ref()
const currUserStageRecordId = ref(-1)
const currTeamWaitingNextRoundText = ref('')
const currOpponentTeamWaitingNextRoundText = ref('')
const showCountdown = ref(false)
const targetDate = ref(0)
const serverTimeOffset = ref(0) // 服务器时间戳
const currTeamGameStart = ref(false)
const currOpponentTeamGameStart = ref(false)
const localSet = reactive({
  music: true
})

const { ws, isConnected, connect, disconnect } = useWebSocketHeartbeat({
  pingInterval: 30000,
  onOpen: () => {
    console.log('WebSocket连接已建立，时间:', new Date().toISOString())
  },
  onMessage: (res) => {
    const startTime = performance.now()
    console.log('收到原始消息时间:', new Date().toISOString())
    console.log('消息内容:', res.data)
    
    const data = JSON.parse(res.data)
    const parseTime = performance.now()
    console.log('消息解析耗时:', parseTime - startTime, 'ms')
    console.log('解析后时间:', new Date().toISOString())
    console.log('消息类型:', data.type)
    
    if (data.data === 'pong') {
      return
    }

    // 获取初始化记录和当前进度
    if (data.type === 'CURRENT_PROGRESS') {
      // 存储服务器时间戳
      serverTimeOffset.value = data.timestamp
      
      if (data.data.code === 200 && data.data.data) {
        fightData.value = data.data.data
        totalRound.value = data.data.data.team.stageRecordStartList.length
        // 进入详情或刷新后，基于服务端当前数据重算总分
        recomputeTotals()
        // 检查是否需要展示倒计时
        checkFirstRoundStartTime(data.timestamp)
        // 检测整场游戏的进度
        checkProgress()
      }
    }
    // 对战开始
    if (data.type === 'FIGHT_START') {
      console.log('处理FIGHT_START消息，时间:', new Date().toISOString())
      // 设置整场游戏状态为进行中
      fightData.value.status = 1
      console.log('FIGHT_START: 设置 fightData.status = 1')
    }
    // 回合开始
    if (data.type === 'ROUND_START') {
      console.log('处理ROUND_START消息，时间:', new Date().toISOString())
      console.log('ROUND_START 处理前的状态:')
      console.log('currTeamPlayer.value:', currTeamPlayer.value)
      console.log('currTeamPlayer.data:', currTeamPlayer.value.data)
      console.log('currTeamGameStart.value:', currTeamGameStart.value)
      console.log('showCountdown.value:', showCountdown.value)
      
      // 停止倒计时，因为回合已经开始了
      showCountdown.value = false
      // 设置游戏开始状态
      currTeamGameStart.value = true
      currOpponentTeamGameStart.value = true
      // 设置整场游戏状态为进行中
      fightData.value.status = 1
      // 清空等待下一轮提示文案
      currTeamWaitingNextRoundText.value = ''
      currOpponentTeamWaitingNextRoundText.value = ''
      // ROUND_START会发送两次数据，代表当前队伍玩家和对手队伍玩家
      // 每次都要在两个队伍中都查找一次，确保双方状态都被更新
      console.log('处理ROUND_START消息，更新双方状态:', {
        userId: data.data.userId,
        userStatus: data.data.userStatus,
        opponentUserId: data.data.opponentUserId,
        opponentUserStatus: data.data.opponentUserStatus
      })
      
      // 更新当前用户状态
      findFightingUserByUserId(data.data.userId, data.data.userStatus)
      
      // 更新对方用户状态
      if (data.data.opponentUserId && data.data.opponentUserStatus !== undefined) {
        findFightingUserByUserId(data.data.opponentUserId, data.data.opponentUserStatus)
      }
      
      console.log('ROUND_START 处理后的状态:')
      console.log('currTeamPlayer.value:', currTeamPlayer.value)
      console.log('currTeamPlayer.data:', currTeamPlayer.value.data)
      console.log('currTeamPlayer.data.status:', currTeamPlayer.value.data?.status)
      console.log('currTeamPlayer.data.data:', currTeamPlayer.value.data?.data)
      console.log('currTeamGameStart.value:', currTeamGameStart.value)
      console.log('showCountdown.value:', showCountdown.value)
      console.log('fightData.status:', fightData.value.status)
      console.log('currOpponentTeamPlayer.data:', currOpponentTeamPlayer.value.data)
      console.log('currOpponentTeamPlayer.data.status:', currOpponentTeamPlayer.value.data?.status)
      console.log('currOpponentTeamGameStart.value:', currOpponentTeamGameStart.value)
      
      // 检查是否两个用户都已经处理完成
      const teamUserList = fightData.value.team?.stageRecordStartList || []
      const opponentTeamUserList = fightData.value.opponentTeam?.stageRecordStartList || []
      const currTeamPlayerIndex = teamUserList.findIndex(item => item.userId === data.data.userId)
      const currOpponentTeamPlayerIndex = opponentTeamUserList.findIndex(item => item.userId === data.data.userId)
      
      // 如果当前用户在我方队伍，检查对方是否已处理
      if (currTeamPlayerIndex > -1) {
        const opponentUserId = data.data.opponentUserId
        const opponentIndex = opponentTeamUserList.findIndex(item => item.userId === opponentUserId)
        if (opponentIndex > -1 && opponentTeamUserList[opponentIndex].status === 1) {
          // 对方已处理，可以调用checkRemainTime
          checkRemainTime(new Date(data.data.endTime), 'ROUND_START', data.timestamp)
        }
      }
      // 如果当前用户在对方队伍，检查我方是否已处理
      else if (currOpponentTeamPlayerIndex > -1) {
        const myUserId = data.data.opponentUserId
        const myIndex = teamUserList.findIndex(item => item.userId === myUserId)
        if (myIndex > -1 && teamUserList[myIndex].status === 1) {
          // 我方已处理，可以调用checkRemainTime
          checkRemainTime(new Date(data.data.endTime), 'ROUND_START', data.timestamp)
        }
      }
    }
    // 回合对战结果
    if (data.type === 'ROUND_RESULT') {
      console.log('处理ROUND_RESULT消息，时间:', new Date().toISOString())
      // 遍历 设置当前回合的对战结果数据
      setCurrFightResult(data.data)
      // 判断当前回合游戏剩余的时间能做些什么
      checkRemainTime(new Date(data.data.endTime), 'ROUND_RESULT', data.timestamp)
    }
    // 等待对手选择
    if (data.type === 'ROUND_WAITING') {
      console.log('处理ROUND_WAITING消息，时间:', new Date().toISOString())
      // 遍历 设置当前回合的对战结果数据
      setCurrFightResult(data.data)
    }
    if (data.type === 'FIGHT_END') {
      console.log('处理FIGHT_END消息，时间:', new Date().toISOString())
      currTeamGameStart.value = false
      currOpponentTeamGameStart.value = false
      // 清空等待下一轮提示文案
      currTeamWaitingNextRoundText.value = ''
      currOpponentTeamWaitingNextRoundText.value = ''
      // 设置对战结束
      fightData.value.status = data.data.status
      // 对战结束后再基于最终数据重算一次总分
      recomputeTotals()
      // 更新用户信息（因为对战结束可能会有奖励或结算）
      fetchUserInfo()
      currTeamPlayer.value = {
        index: -1,
        data: {}
      }
      currOpponentTeamPlayer.value = {
        index: -1,
        data: {}
      }
    }
    if (data.type === 'ERROR') {
      console.log('处理ERROR消息，时间:', new Date().toISOString())
      ElMessage.error(data.data)
    }
    
    const endTime = performance.now()
    console.log('消息处理完成，总耗时:', endTime - startTime, 'ms')
  },
  onClose: () => {
    console.log('WebSocket连接已关闭，时间:', new Date().toISOString())
  },
  onError: (error) => {
    console.error('WebSocket连接错误，时间:', new Date().toISOString(), error)
  }
})

const handleClickBack = () => {
  router.back()
}

// 检查是否需要展示倒计时
const checkFirstRoundStartTime = (serverTimestamp) => {
  const firstRoundData = fightData.value.team.stageRecordStartList.find(item => item.round === 1)
  
  if (!firstRoundData || !firstRoundData.startTime) {
    console.log('未找到第一轮数据或开始时间，不显示倒计时')
    showCountdown.value = false
    return
  }
  
  targetDate.value = new Date(firstRoundData.startTime)
  
  // 检查目标时间是否有效
  if (isNaN(targetDate.value.getTime())) {
    console.log('目标时间无效，不显示倒计时')
    showCountdown.value = false
    return
  }
  
  // 使用服务器时间戳作为当前时间
  const serverTime = new Date(serverTimestamp)
  console.log('第一轮开始时间:', firstRoundData.startTime)
  console.log('目标时间:', targetDate.value)
  console.log('服务器时间:', serverTime)
  console.log('目标时间 > 服务器时间:', targetDate.value > serverTime)
  
  if (targetDate.value > serverTime) {
    console.log('显示倒计时')
    showCountdown.value = true
  } else {
    console.log('不显示倒计时')
    showCountdown.value = false
  }
}

const changeAllAnimationStatus = () => {
  const teamUserList = fightData.value.team?.stageRecordStartList
  const opponentTeamUserList = fightData.value.opponentTeam?.stageRecordStartList

  teamUserList.forEach((item) => {
    item.animationEnd = true
  });
  opponentTeamUserList.forEach((item) => {
    item.animationEnd = true
  });
}

// 初始化时，检测整场游戏的进度
const checkProgress = () => {
  const status = fightData.value.status
  switch (status) {
    // 未开始
    case 0: break
    // 进行中
    case 1: 
      if (targetDate.value > new Date()) return
      // 定位到正在对战的两个用户
      findFightingUserByCurrRound(fightData.value.recordRound)
      // 判断当前回合游戏剩余的时间能做些什么
      checkRemainTime(new Date(currTeamPlayer.value.data.endTime), 'CURRENT_PROGRESS', data.timestamp)
      break
    // 已结束
    case 2: 
      // 更改所有数据的动画状态
      changeAllAnimationStatus()
      break
    default:
  }
}

// 定位到正在对战的两个用户
const findFightingUserByCurrRound = (currRoundNum) => {
  currRound.value = currRoundNum
  const teamUserList = fightData.value.team?.stageRecordStartList
  const opponentTeamUserList = fightData.value.opponentTeam?.stageRecordStartList

  teamUserList.forEach((item, index) => {
    if (item.round === currRoundNum) {
      currTeamGameStart.value = true
      currTeamPlayer.value.data = item
      currTeamPlayer.value.index = index
      nextTick(() => {
        scrollToTarget(teamScrollRef.value, teamUserList, currTeamPlayer.value.index)
      })
    }
    // 修改前 currRound-1 轮的动画状态
    if (item.round < currRoundNum) {
      item.animationEnd = true
    }
  });
  opponentTeamUserList.forEach((item, index) => {
    if (item.round === currRoundNum) {
      currOpponentTeamGameStart.value = true
      currOpponentTeamPlayer.value.data = item
      currOpponentTeamPlayer.value.index = index
      nextTick(() => {
        scrollToTarget(opponentTeamScrollRef.value, opponentTeamUserList, currOpponentTeamPlayer.value.index)
      })
    }
    // 修改前 currRound-1 轮的动画状态
    if (item.round < currRoundNum) {
      item.animationEnd = true
    }
  });
}

// 定位到即将对战的两个用户
const findFightingUserByUserId = (userId, userStatus) => {
  const teamUserList = fightData.value.team?.stageRecordStartList || []
  const opponentTeamUserList = fightData.value.opponentTeam?.stageRecordStartList || []
  const currTeamPlayerIndex = teamUserList.findIndex(item => item.userId === userId)
  const currOpponentTeamPlayerIndex = opponentTeamUserList.findIndex(item => item.userId === userId)
  
  console.log('findFightingUserByUserId:', {
    userId,
    userStatus,
    currTeamPlayerIndex,
    currOpponentTeamPlayerIndex,
    teamUserListLength: teamUserList.length,
    opponentTeamUserListLength: opponentTeamUserList.length
  })
  

  // 说明用户在team里
  if (currTeamPlayerIndex > -1) {
    // 更新用户状态
    teamUserList[currTeamPlayerIndex].status = userStatus

    currTeamGameStart.value = true
    currTeamPlayer.value.index = currTeamPlayerIndex
    currTeamPlayer.value.data = teamUserList[currTeamPlayer.value.index]
    currRound.value = currTeamPlayer.value.data.round

    // 将前 currRound - 1 轮的滚动状态置为已滚动结束
    teamUserList.forEach(item => {
      if (item.round < currRound.value) {
        item.animationEnd = true
      }
    })

    nextTick(() => {
      scrollToTarget(teamScrollRef.value, teamUserList, currTeamPlayer.value.index)
    })
  }
  // 说明用户在opponentTeam里
  if (currOpponentTeamPlayerIndex > -1) {
    // 更新用户状态
    opponentTeamUserList[currOpponentTeamPlayerIndex].status = userStatus

    currOpponentTeamGameStart.value = true
    currOpponentTeamPlayer.value.index = currOpponentTeamPlayerIndex
    currOpponentTeamPlayer.value.data = opponentTeamUserList[currOpponentTeamPlayer.value.index]
    currRound.value = currOpponentTeamPlayer.value.data.round

    // 将前 currRound - 1 轮的滚动状态置为已滚动结束
    opponentTeamUserList.forEach(item => {
      if (item.round < currRound.value) {
        item.animationEnd = true
      }
    })

    nextTick(() => {
      scrollToTarget(opponentTeamScrollRef.value, opponentTeamUserList, currOpponentTeamPlayer.value.index)
    })
  }
  
  // 如果当前用户在我方队伍，同时设置对方队伍的对战用户
  if (currTeamPlayerIndex > -1) {
    // 找到对方队伍中相同回合的用户
    const opponentUser = opponentTeamUserList.find(item => item.round === currRound.value)
    if (opponentUser) {
      currOpponentTeamPlayer.value.index = opponentTeamUserList.findIndex(item => item.userId === opponentUser.userId)
      currOpponentTeamPlayer.value.data = opponentUser
      currOpponentTeamGameStart.value = true
    }
  }
  // 如果当前用户在对方队伍，同时设置我方队伍的对战用户
  else if (currOpponentTeamPlayerIndex > -1) {
    // 找到我方队伍中相同回合的用户
    const teamUser = teamUserList.find(item => item.round === currRound.value)
    if (teamUser) {
      currTeamPlayer.value.index = teamUserList.findIndex(item => item.userId === teamUser.userId)
      currTeamPlayer.value.data = teamUser
      currTeamGameStart.value = true
    }
  }
}

// 设置当前回合的对战结果
const setCurrFightResult = (userResult) => {
  const teamUserList = fightData.value.team?.stageRecordStartList
  const opponentTeamUserList = fightData.value.opponentTeam?.stageRecordStartList
  console.log(22)
  console.log(teamUserList)
  console.log(opponentTeamUserList)
  teamUserList.forEach((item, index) => {
    if (item.userId === userResult.userId) {
      console.log(33)
      teamUserList[index] = userResult
      currTeamPlayer.value.data = userResult
      currTeamScore.value = teamUserList.reduce((prev, next) => {
        return new Decimal(next.score || '0').plus(prev).toNumber()
      }, 0)
    }
  });
  opponentTeamUserList.forEach((item, index) => {
    if (item.userId === userResult.userId) {
      console.log(44)
      opponentTeamUserList[index] = userResult
      currOpponentTeamPlayer.value.data = userResult
      currOpponentTeamScore.value = opponentTeamUserList.reduce((prev, next) => {
        return new Decimal(next.score || '0').plus(prev).toNumber()
      }, 0)
    }
  });
}

// 依据当前 fightData 重新计算双方总分（用于进入详情/刷新后初始化、或对战结束兜底）
const recomputeTotals = () => {
  const teamUserList = fightData.value.team?.stageRecordStartList || []
  const opponentTeamUserList = fightData.value.opponentTeam?.stageRecordStartList || []
  currTeamScore.value = teamUserList.reduce((prev, next) => {
    return new Decimal(next.score || '0').plus(prev).toNumber()
  }, 0)
  currOpponentTeamScore.value = opponentTeamUserList.reduce((prev, next) => {
    return new Decimal(next.score || '0').plus(prev).toNumber()
  }, 0)
}

// 用户头像滚动到目标位置
const scrollToTarget = (scrollRef, list, targetIndex) => {
  if (!scrollRef) return;

  const container = scrollRef.$el.querySelector('.el-scrollbar__wrap');
  const items = scrollRef.$el.querySelectorAll('.team-member-item');
  let targetPosition = 0
  for (let i = 0; i < targetIndex; i++) {
    const itemHeight = items[i].offsetHeight
    targetPosition = new Decimal(targetPosition).plus(itemHeight).toNumber()
  }
  container.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  })
}

const showChooseOddsDialog = (timeDiff) => {
  const currUserId = store.userInfo.userId
  const currTeamPlayerData = currTeamPlayer.value.data
  const currOpponentTeamPlayerData = currOpponentTeamPlayer.value.data

  if (currUserId === currTeamPlayerData.userId && !currTeamPlayerData.data) {
    chooseOddsDialogRef.value.open()
    currUserStageRecordId.value = currTeamPlayerData.id
    chooseCountdownValue.value = Math.floor((timeDiff - 30000) / 1000)
  }
  if (currUserId === currOpponentTeamPlayerData.userId && !currOpponentTeamPlayerData.data) {
    chooseOddsDialogRef.value.open()
    currUserStageRecordId.value = currOpponentTeamPlayerData.id
    chooseCountdownValue.value = Math.floor((timeDiff - 30000) / 1000)
  }
}

// 播放动画
const playAnimation = () => {
  console.log('playAnimation 开始执行')
  console.log('currTeamPlayer.value.index:', currTeamPlayer.value.index)
  console.log('currOpponentTeamPlayer.value.index:', currOpponentTeamPlayer.value.index)
  console.log('currTeamFightBoxRef.value:', currTeamFightBoxRef.value)
  console.log('currOpponentTeamFightBoxRef.value:', currOpponentTeamFightBoxRef.value)
  
  if (currTeamPlayer.value.index > -1) {
    nextTick(() => {
      if (currTeamFightBoxRef.value && currTeamFightBoxRef.value.startAnimation) {
        console.log('执行我方startAnimation')
        currTeamFightBoxRef.value.startAnimation()
      } else {
        console.log('currTeamFightBoxRef.value 未定义或没有startAnimation方法')
        console.log('currTeamFightBoxRef.value:', currTeamFightBoxRef.value)
        console.log('currTeamFightBoxRef.value.startAnimation:', currTeamFightBoxRef.value?.startAnimation)
      }
    })
  } else {
    console.log('currTeamPlayer.value.index 不是 > -1，跳过我方动画')
  }
  
  if (currOpponentTeamPlayer.value.index > -1) {
    nextTick(() => {
      if (currOpponentTeamFightBoxRef.value && currOpponentTeamFightBoxRef.value.startAnimation) {
        console.log('执行对方startAnimation')
        currOpponentTeamFightBoxRef.value.startAnimation()
      } else {
        console.log('currOpponentTeamFightBoxRef.value 未定义或没有startAnimation方法')
        console.log('currOpponentTeamFightBoxRef.value:', currOpponentTeamFightBoxRef.value)
        console.log('currOpponentTeamFightBoxRef.value.startAnimation:', currOpponentTeamFightBoxRef.value?.startAnimation)
      }
    })
  } else {
    console.log('currOpponentTeamPlayer.value.index 不是 > -1，跳过对方动画')
  }
}

// 判断当前回合游戏剩余的时间能做些什么(能调用这个函数说明游戏还在进行中)
const checkRemainTime = (endTime, type, messageTimestamp) => {
  // 使用消息时间戳而不是当前时间，避免时间不对等问题
  const messageTime = new Date(messageTimestamp)
  const timeDiff = endTime - messageTime
  console.log('endTime:', endTime)
  console.log('messageTime:', messageTime)
  console.log('timeDiff:', timeDiff / 1000, '秒')
  console.log(Number.isNaN(timeDiff))
  if (Number.isNaN(timeDiff)) return

  const currTeamPlayerData = currTeamPlayer.value.data
  const currOpponentTeamPlayerData = currOpponentTeamPlayer.value.data

  console.log('checkRemainTime 开始执行，type:', type)
  console.log('currTeamPlayerData:', currTeamPlayerData)
  console.log('currOpponentTeamPlayerData:', currOpponentTeamPlayerData)
  
  // 检查玩家数据是否存在
  if (!currTeamPlayerData) {
    console.log('我方玩家数据不存在，直接返回')
    return
  }
  
  // 对于 ROUND_START 消息，如果对方玩家数据不存在，需要等待第二个消息
  if (type === 'ROUND_START' && !currOpponentTeamPlayerData) {
    console.log('ROUND_START 消息：对方玩家数据不存在，等待第二个消息')
    return
  }
  
  // 对于其他消息类型，如果对方玩家数据不存在，也直接返回
  if (type !== 'ROUND_START' && !currOpponentTeamPlayerData) {
    console.log('对方玩家数据不存在，直接返回')
    return
  }
  
  console.log('通过数据检查，继续执行')
  console.log('timeDiff:', timeDiff / 1000, '秒')

  // 根据消息类型决定行为
    if (type === 'ROUND_START') {
    console.log('ROUND_START 消息处理，剩余时间:', timeDiff / 1000, '秒')
    // 只有前30s可以展示选择弹窗和倒计时，并且得是当前用户才展示，否则展示"用户选择中"
    if (timeDiff > 30000 && ((timeDiff - 30000) / 1000 > 1)) {
      console.log('前30秒：显示选择弹窗')
      showChooseOddsDialog(timeDiff)
      } else {
      console.log('后30秒：ROUND_START 不处理')
      }
  } else if (type === 'CURRENT_PROGRESS') {
    console.log('CURRENT_PROGRESS 消息处理，剩余时间:', timeDiff / 1000, '秒')
    // CURRENT_PROGRESS 是第一次连接时发送的，不处理动画
    console.log('CURRENT_PROGRESS 不处理动画')
    } else if (type === 'ROUND_RESULT') {
    console.log('ROUND_RESULT 消息处理，剩余时间:', timeDiff / 1000, '秒')
    // ROUND_RESULT 是收到结果后展示动画
    if (timeDiff > 0) {
      console.log('ROUND_RESULT：开始播放动画')
      playAnimation()
  } else {
      console.log('时间已过，显示错误提示')
    ElMessage.warning('当前回合结束时间有误')
    }
  } else {
    console.log('其他消息类型:', type, '剩余时间:', timeDiff / 1000, '秒')
  }
}

const handleChooseOdds = (odds) => {
  const currUserId = store.userInfo.userId
  const params = {
    type: 'SELECT_PROBABILITY',
    data: {
      stageRecordId: currUserStageRecordId.value,
      probabilitySelect: odds,
      userId: currUserId                                             
    }
  }
  ws.value.send(JSON.stringify(params))
}

const createWs = () => {
  const userId = store.userInfo.userId;
  if (!userId || !stageGroupFightId) return
  // 连接ws
  connect(getWebSocketUrl(`/ws/fight/${stageGroupFightId}/${userId}`))
}

onBeforeMount(() => {
  createWs()
})

const test = () => {
  const currUserId = store.userInfo.userId
  const data = {}
  data.data = {
    endTime: "2025-08-30 17:09:30",
    isFight: true,
    opponentUserId: 398,
    opponentUserStatus: 1,
    stageRecordId: 3850,
    startTime: "2025-08-25 05:08:30",
    userId: 504,
    userStatus: 1
  }
  // 定位到即将对战的两个用户
  findFightingUserByUserId(data.data.userId, data.data.userStatus)
  // 判断当前回合游戏剩余的时间能做些什么(ROUND_START会推2条数据)
  checkRemainTime(new Date(data.data.endTime), 'ROUND_START', data.timestamp)
}

const test2 = () => {
  const data = {}
  data.data = {
    createTime: "2025-08-18T09:52:01",
    data: 1,
    endTime: "2025-08-31 21:03:40",
    groupFightId: 241,
    groupName: "A",
    id: 3850,
    isCaptain: false,
    isOpponentCaptain: false,
    opponentData: 1,
    opponentResult: 0,
    opponentTeamId: 9,
    opponentTotalScore: "0",
    opponentUserAvatar: "https://cfcfcs.oss-cn-beijing.aliyuncs.com/static/osse3e20c75a8df4f399fe6f3bd03e930b9lzmd-r.png",
    opponentUserId: 398,
    opponentUserName: "yufuwangmoxx",
    result: 0,
    resultData: 11,
    round: 5,
    score: "0",
    stageId: 5,
    startTime: "2025-08-18 09:52:30",
    status: 1,
    teamId: 16,
    totalRound: 16,
    totalScore: "0",
    updateTime: "2025-08-18T09:52:41",
    userAvatar: "https://cfcfcs.oss-cn-beijing.aliyuncs.com/static/osse3e20c75a8df4f399fe6f3bd03e930b9lzmd-r.png",
    userId: 504,
    userName: "yufuwang"
  }
  // 遍历 设置当前回合的对战结果数据
  setCurrFightResult(data.data)
  // 判断当前回合游戏剩余的时间能做些什么
  checkRemainTime(new Date(data.data.endTime), 'ROUND_RESULT', data.timestamp)
}

const changeSet = (set) => {
  if (set === 'music') {
    localSet.music = !localSet.music
    if (!localSet.music) {
      musica.pause()
      musica.currentTime = 0
    } else {
      musica.play()
    }
  }
}

const handleScrollEnd = (type) => {
  // 是否展示等待下一轮文案
  if (type === 'currTeam') {
    // 设置动画结束标志
    const index = currTeamPlayer.value.index
    fightData.value.team.stageRecordStartList[index].animationEnd = true

    if (currRound.value < totalRound.value) {
      currTeamWaitingNextRoundText.value = '等待下一回合开始...'
    } else {
      currTeamWaitingNextRoundText.value = '等待对战结束...'
    }
  } else {
    const index = currOpponentTeamPlayer.value.index
    fightData.value.opponentTeam.stageRecordStartList[index].animationEnd = true

    currOpponentTeamPlayer.value.data.animationEnd = true;
    if (currRound.value < totalRound.value) {
      currOpponentTeamWaitingNextRoundText.value = '等待下一回合开始...'
    } else {
      currOpponentTeamWaitingNextRoundText.value = '等待对战结束...'
    }
  }
}

const handleStopCountdown = () => {
  showCountdown.value = false
}

onMounted(() => {
  window.scrollTo({
    top: 0,    // 目标y轴位置（顶部）
    left: 0,   // 目标x轴位置（不横向滚动）
  });
  musica.src = bgm
  musica.loop = true
  musica.load()
  musica.play()
})

onUnmounted(() => {
  musica.pause()
  musica.currentTime = 0
})

import bgImg from "@/assets/images/champion/bg.webp";
</script>
<template>
  <Detail :bg="{ img: bgImg, height: '187.5vw' }">
    <template #top>
      <div class="wait-content">
        <WaitCountdown
        v-if="showCountdown"
        :target-time="targetDate"
          :server-timestamp="serverTimeOffset"
        :show-status="false"
        @finish="handleStopCountdown"
        >
          <template #count>
            <div class="wait-count">{{ currRound }}/{{ totalRound }}</div>
          </template>
        </WaitCountdown>
      </div>
      <div class="button-wrapper">
        <img
          class="back"
          @click="handleClickBack"
          src="@/assets/images/champion/game/back.png"
          alt=""
        />
        <div class="setting-item">
          <div class="setting-switch-wrapper" @click="changeSet('music')">
            <img
              class="setting-switch"
              :class="localSet.music ? '' : 'active'"
              src="@/assets/images/open/switch.png"
              alt=""
            />
          </div>
          <div class="switch-text">关闭音效</div>
              </div>
        </div>
    </template>
    <div class="against-fight-container">
      <div class="header tw-flex tw-items-center tw-justify-center">
        <FightItem
          :data="{
            aliasName: fightData.team?.aliasName,
            teamAvatar: fightData.teamAvatar,
            teamName: fightData.teamName,
            initialScore: fightData.team?.initialScore,
          }"
          :score="currTeamScore"
        />
        <div class="count">{{ currRound }}/{{ totalRound }}</div>
        <FightItem
          :data="{
            aliasName: fightData.opponentTeam?.aliasName,
            teamAvatar: fightData.opponentTeamAvatar,
            teamName: fightData.opponentTeamName,
            initialScore: fightData.opponentTeam?.initialScore,
          }"
          :score="currOpponentTeamScore"
          bg-color="rgba(124, 48, 38, 0.43)"
        />
            </div>
      <div class="detail-wrapper tw-flex tw-items-center tw-justify-center">
        <el-scrollbar max-height="344px" ref="teamScrollRef">
          <FightMember
            class="team-member-item"
            v-for="(item, index) in fightData.team?.stageRecordStartList"
            :key="item.userId"
            :data="{
              avatar: item.userAvatar,
              name: item.nickName || item.userName,
              rate: (item.animationEnd && item.data) || 0,
              score: (item.animationEnd && item.score) || 0,
              isCurrent:
                currTeamPlayer?.index === index
            }"
          />
        </el-scrollbar>
        <div class="game-detail">
          <div class="team-fight-status" v-if="fightData.status === 2">
            游戏已结束
          </div>
          <div
            class="team-fight-status"
            v-else-if="
              fightData.status === 0 ||
              currOpponentTeamPlayer.data.status === 0 ||
              showCountdown ||
              !currOpponentTeamGameStart
            "
          >
            等待游戏开始...
          </div>
          <div
            class="team-fight-status"
            v-else-if="
              currOpponentTeamPlayer.data.status === 1 &&
              !currOpponentTeamPlayer.data.data
            "
          >
            用户选择中...
            </div>
          <div
            class="team-fight-status"
            v-else-if="
              currOpponentTeamPlayer.data.status === 1 &&
              currOpponentTeamPlayer.data.data &&
              !currTeamPlayer.data.data
            "
          >
            用户已选择
          </div>
          <div
            class="team-fight-status"
            v-else-if="
              currOpponentTeamPlayer.data.status === 1 &&
              currOpponentTeamPlayer.data.data &&
              currTeamPlayer.data.data &&
              currOpponentTeamWaitingNextRoundText
            "
          >
            {{ currOpponentTeamWaitingNextRoundText }}
                        </div>
          <FightGameDetail
            v-else-if="
              currTeamPlayer.data.status === 1 &&
              currTeamPlayer.data.data &&
              currOpponentTeamPlayer.data.data
            "
                ref="currTeamFightBoxRef"
                :fightResult="currTeamPlayer.data"
                :localSet="localSet"
            @scrollEnd="handleScrollEnd('currTeam')"
          />
              <div class="team-fight-status" v-else>系统错误</div>
            </div>
        <img class="vs" src="@/assets/images/champion/history/vs.png" alt="" />
        <div class="game-detail right">
          <div class="team-fight-status" v-if="fightData.status === 2">
            游戏已结束
          </div>
          <div
            class="team-fight-status"
            v-else-if="
              fightData.status === 0 ||
              currOpponentTeamPlayer.data.status === 0 ||
              showCountdown ||
              !currOpponentTeamGameStart
            "
          >
            等待游戏开始...
        </div>
          <div
            class="team-fight-status"
            v-else-if="
              currOpponentTeamPlayer.data.status === 1 &&
              !currOpponentTeamPlayer.data.data
            "
          >
            用户选择中...
        </div>
          <div
            class="team-fight-status"
            v-else-if="
              currOpponentTeamPlayer.data.status === 1 &&
              currOpponentTeamPlayer.data.data &&
              !currTeamPlayer.data.data
            "
          >
            用户已选择
                        </div>
          <div
            class="team-fight-status"
            v-else-if="
              currOpponentTeamPlayer.data.status === 1 &&
              currOpponentTeamPlayer.data.data &&
              currTeamPlayer.data.data &&
              currOpponentTeamWaitingNextRoundText
            "
          >
            {{ currOpponentTeamWaitingNextRoundText }}
                        </div>
          <FightGameDetail
            v-else-if="
              currOpponentTeamPlayer.data.status === 1 &&
              currOpponentTeamPlayer.data.data &&
              currTeamPlayer.data.data &&
              !currOpponentTeamWaitingNextRoundText
            "
                ref="currOpponentTeamFightBoxRef"
                :fightResult="currOpponentTeamPlayer.data"
                :localSet="localSet"
            is-yellow
            @scrollEnd="handleScrollEnd('currOpponentTeam')"
          />
              <div class="team-fight-status" v-else>系统错误</div>
            </div>
        <el-scrollbar max-height="344px" ref="opponentTeamScrollRef">
          <FightMember
            class="team-member-item"
            v-for="(item, index) in fightData.opponentTeam
              ?.stageRecordStartList"
            :key="item.userId"
            :data="{
              avatar: item.userAvatar,
              name: item.nickName || item.userName,
              rate: (item.animationEnd && item.data) || 0,
              score: (item.animationEnd && item.score) || 0,
              isCurrent:
                currTeamPlayer?.index === index
            }"
          />
        </el-scrollbar>
          </div>
        </div>
    <ChooseOddsDialog
      ref="chooseOddsDialogRef"
      :start-second="chooseCountdownValue"
      @choose="handleChooseOdds"
    />
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

.wait-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 48.23vw;
        z-index: 2;

  :deep() .content {
    margin-top: 11vw;
  }

  .wait-count {
    font-size: 60px;
    color: #f2ffef;
    margin-bottom: 10px;
    @include mobile {
      font-size: 28px;
      margin-bottom: 0;
      margin-top: 60px;
    }
  }
}

.button-wrapper {
  position: absolute;
  top: 20px;
  right: 30px;
  z-index: 4;
  @include mobile {
    width: 90%;
    display: flex;
    justify-content: space-between;
    top: 60px;
  }

  .back {
    width: 72px;
    height: 40px;
    cursor: pointer;
  }

  .setting-item {
    margin-top: 40px;
    @include mobile {
      margin-top: 6px;
    }

    .setting-switch-wrapper {
      width: 71px;
      height: 26px;
      background-color: #343a3e;
      border-radius: 12px;
      cursor: pointer;
      position: relative;
      @include mobile {
        width: 60px;
        height: 20px;
        border-radius: 9px;
      }

      .setting-switch {
        width: 24px;
        height: 24px;
      position: absolute;
        top: 1px;
        left: 1px;
        transition: all 0.3s;
        @include mobile {
          width: 18px;
          height: 18px;
        }

        &.active {
          left: auto;
          right: 1px;
        }
      }
    }

    .switch-text {
      margin-top: 10px;
      font-weight: 500;
      font-size: 17px;
      color: #ffffff;
      @include mobile {
        margin-top: 3px;
        font-size: 13px;
      }
    }
  }
}

.against-fight-container {
  width: 980px;
  max-width: 980px;
  margin: 0 auto;
  padding-top: 9.5vw;
  font-family: "PingFang Medium";
  @include mobile {
    width: 98vw;
    padding-top: 34vw;
  }

  .header {
    .count {
      margin: 0 250px;
      font-size: 38px;
      font-family: Jijiati;
      @include mobile {
        margin: 0 10px;
        font-size: 28px;
      }
    }
  }

  .detail-wrapper {
    margin-top: 5vw;

    .member-wrapper {
      width: 133px;
    }

    .game-detail {
      margin-left: 20px;
      width: 264px;
      min-width: 264px;
      max-width: 264px;
      height: 344px;
      background: rgba(0, 0, 0, 0.29);
      border-radius: 16px;
      border: 3px solid rgba(86, 153, 167, 0.96);
      font-family: "PingFang Medium";
      font-weight: 500;
      font-size: 25px;
      color: #ffffff;
      line-height: normal;
      display: flex;
      justify-content: center;
      align-items: center;
      @include mobile {
        width: 28%;
        min-width: 28%;
        max-width: 28%;
        // height: 300px;
        margin-left: 8px;
        font-size: 13px;
      }

      &.right {
        margin: 0 20px 0 0;
        border: 3px solid rgba(198, 128, 102, 0.96);
        @include mobile {
          margin-right: 8px;
        }
      }
    }

    .vs {
      width: 53px;
      height: 71px;
      margin: 0 22px;
      @include mobile {
        width: 22px;
        height: 30px;
        margin: 0 8px;
      }
    }
  }
}
</style>
