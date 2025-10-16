<script setup>
import {computed, onBeforeMount, onMounted, onUnmounted, ref, reactive, nextTick} from "vue";
import {requireImg} from "@/utils/common";
import {useStore} from "@/store"
import useWebSocketHeartbeat from '../../composables/useWebSocketHeartbeat'
import Detail from './Detail.vue';
import { useRouter } from "vue-router";
import Decimal from 'decimal.js'
import ChooseOddsDialog from './components/ChooseOddsDialog.vue'
import FightBox from './components/FightBox.vue'
import bgm from "@/assets/music/main_battle.mp3";
import {ElMessage} from "element-plus";
import Countdown from "./components/Countdown.vue";

const router = useRouter()
const store = useStore()

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
  connect(`ws://121.229.204.223:8090/ws/fight/${stageGroupFightId}/${userId}`)
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
    musica.src = bgm
    musica.loop = true
    musica.load()
    musica.play()
})

onUnmounted(() => {
  musica.pause()
  musica.currentTime = 0
})

</script>
<template>
  <Detail>
    <div class="against-fight-container" :style="{
        '--bg-level':requireImg('/level/3.png',true),
        '--bg-round-num':requireImg('/v2/smelt/jg-bg.png',true),
      }">
      <!-- 倒计时 -->
      <Countdown
        v-if="showCountdown"
        :target-time="targetDate"
        :server-timestamp="serverTimeOffset"
        :show-status="false"
        @finish="handleStopCountdown"
      />
      <!-- 头部 -->
      <div class="against-fight-header">
        <div class="against-fight-header-top">
          <div class="back" @click="handleClickBack">
            <img :src="requireImg('/v2/roll/room/back.png')" alt="">
            返回
          </div>
          <span class="tw-flex tw-items-center tw-gap-1.5 tw-cursor-pointer" @click="changeSet('music')">
            <span
              class="tw-relative tw-inline-flex tw-h-[0.875rem] md:tw-h-6 tw-w-[1.75rem] md:tw-w-11 tw-items-center tw-rounded-full tw-bg-[#300000] tw-transition-colors tw-overflow-hidden">
              <div class="tw-absolute tw-inset-0 tw-rounded-full tw-pointer-events-none" style="border: 2px solid transparent; background: #FFB8B8 ; 
              mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
              -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor; mask-composite: exclude;">
              </div>

              <span
                class="tw-relative tw-inline-block tw-h-[0.625rem] md:tw-h-4 tw-w-[0.625rem] md:tw-w-4 tw-transform tw-rounded-full tw-transition-transform"
                :class="{
                  'tw-translate-x-[1.125rem] md:tw-translate-x-[1.625rem]': !localSet.music,
                  'tw-translate-x-[0.25rem] md:tw-translate-x-[0.375rem]': localSet.music,
                  'tw-bg-white tw-border-2 tw-border-[#FFB8B8]': localSet.music
                }" :style="!localSet.music ? 'background: #FFB8B8;' : ''">
              </span>
            </span>
            <span class="tw-text-xs md:tw-text-sm">关闭音效</span>
          </span>
        </div>
        <!-- 队伍信息 -->
        <div class="against-fight-header-content">
          <div class="team-info">
            <img :src="fightData.teamAvatar" alt="" class="team-avatar">
            <div>
              <p class="alias-name">{{ fightData.team?.aliasName }}</p>
              <p class="team-name">{{ fightData.teamName }}</p>
              <p class="team-score">
                <img :src="requireImg('/coin1.png',false)" alt="">
                <span>{{currTeamScore}}</span>
              </p>
            </div>
          </div>
          <div class="round-num">
            <div class="round-num-bg rotate1"></div>
            <div class="round-num-bg rotate2"></div>
            <div class="round-num-bg rotate3"></div>
            <h3>{{ currRound }} / {{ totalRound }}</h3>
          </div>
          <div class="team-info team-info-right">
            <img :src="fightData.opponentTeamAvatar" alt="" class="team-avatar">
            <div>
              <p class="alias-name">{{ fightData.opponentTeam?.aliasName }}</p>
              <p class="team-name">{{ fightData.opponentTeamName }}</p>
              <p class="team-score">
                <img :src="requireImg('/coin1.png',false)" alt="">
                <span>{{currOpponentTeamScore}}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- 中间 -->
      <div class="against-fight-main">
        <!-- 左边 -->
        <div class="against-fight-main-left">
          <div class="fight-main-wrap">
            <el-scrollbar max-height="40vh" ref="teamScrollRef">
              <div class="team-member">
                <div
                  :class="['team-member-item', {'magnify': currTeamPlayer?.index === index } ]"
                  v-for="(item, index) in fightData.team?.stageRecordStartList"
                  :key="item.userId">
                    <div class="team-member-item-top">
                      <img :src="item.userAvatar" alt="" class="user-avatar">
                      <div class="team-member-item-result">
                        <div class="user-probability">
                          <img :src="requireImg('/v2/user/nav1-a.png',false)" alt="">
                          <span v-if="item.animationEnd">{{item.data}}</span>
                          <span v-else>0</span>
                        </div>
                        <div class="user-score">
                          <img :src="requireImg('/coin1.png',false)" alt="">
                          <span v-if="item.animationEnd">{{item.score}}</span>
                          <span v-else>0</span>
                        </div>
                      </div>
                    </div>
                    <p>{{ item.userName }}</p>
                </div>
              </div>
            </el-scrollbar>
            <div class="team-fight">
              <div class="team-fight-status" v-if="fightData.status === 2">游戏已结束</div>
              <div class="team-fight-status" v-else-if="fightData.status === 0 || currTeamPlayer.data.status === 0 || showCountdown || !currTeamGameStart">等待游戏开始...</div>
              <div class="team-fight-status" v-else-if="currTeamPlayer.data.status === 1 && !currTeamPlayer.data.data">用户选择中...</div>
              <div class="team-fight-status" v-else-if="currTeamPlayer.data.status === 1 && currTeamPlayer.data.data && !currOpponentTeamPlayer.data.data">用户已选择</div>
              <div class="team-fight-status" v-else-if="currTeamPlayer.data.status === 1 && currTeamPlayer.data.data && currOpponentTeamPlayer.data.data && currTeamWaitingNextRoundText">{{ currTeamWaitingNextRoundText }}</div>
              <FightBox
                v-else-if="currTeamPlayer.data.status === 1 && currTeamPlayer.data.data && currOpponentTeamPlayer.data.data"
                ref="currTeamFightBoxRef"
                :fightResult="currTeamPlayer.data"
                :localSet="localSet"
                @scrollEnd="handleScrollEnd('currTeam')" />
              <div class="team-fight-status" v-else>系统错误</div>
            </div>
          </div>
        </div>
        <!-- VS -->
        <div class="vs-container">
          <p class="vs">VS</p>
        </div>
        <!-- 右边 -->
         <div class="against-fight-main-right">
          <div class="fight-main-wrap">
            <el-scrollbar max-height="40vh" ref="opponentTeamScrollRef">
              <div class="team-member">
                <div
                  :class="['team-member-item', {'magnify': currOpponentTeamPlayer?.index === index } ]"
                  v-for="(item, index) in fightData.opponentTeam?.stageRecordStartList"
                  :key="item.userId">
                    <div class="team-member-item-top team-member-item-top-reverse">
                      <img :src="item.userAvatar" alt="" class="user-avatar">
                      <div class="team-member-item-result">
                        <div class="user-probability">
                          <img :src="requireImg('/v2/user/nav1-a.png',false)" alt="">
                          <span v-if="item.animationEnd">{{item.data}}</span>
                          <span v-else>0</span>
                        </div>
                        <div class="user-score">
                          <img :src="requireImg('/coin1.png',false)" alt="">
                          <span v-if="item.animationEnd">{{item.score}}</span>
                          <span v-else>0</span>
                        </div>
                      </div>
                    </div>
                    <p>{{ item.userName }}</p>
                </div>
              </div>
            </el-scrollbar>
            <div class="team-fight">
              <div class="team-fight-status" v-if="fightData.status === 2">游戏已结束</div>
              <div class="team-fight-status" v-else-if="fightData.status === 0 || currOpponentTeamPlayer.data.status === 0 || showCountdown || !currOpponentTeamGameStart">等待游戏开始...</div>
              <div class="team-fight-status" v-else-if="currOpponentTeamPlayer.data.status === 1 && !currOpponentTeamPlayer.data.data">用户选择中...</div>
              <div class="team-fight-status" v-else-if="currOpponentTeamPlayer.data.status === 1 && currOpponentTeamPlayer.data.data && !currTeamPlayer.data.data">用户已选择</div>
              <div class="team-fight-status" v-else-if="currOpponentTeamPlayer.data.status === 1 && currOpponentTeamPlayer.data.data && currTeamPlayer.data.data && currOpponentTeamWaitingNextRoundText">{{ currOpponentTeamWaitingNextRoundText }}</div>
              <FightBox
                v-else-if="currOpponentTeamPlayer.data.status === 1 && currOpponentTeamPlayer.data.data && currTeamPlayer.data.data && !currOpponentTeamWaitingNextRoundText"
                ref="currOpponentTeamFightBoxRef"
                :fightResult="currOpponentTeamPlayer.data"
                :localSet="localSet"
                @scrollEnd="handleScrollEnd('currOpponentTeam')" />
              <div class="team-fight-status" v-else>系统错误</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ChooseOddsDialog ref="chooseOddsDialogRef" :start-second="chooseCountdownValue" @choose="handleChooseOdds"/>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.back {
  display: flex;
  height: fit-content;
  margin: 12px 0 0 0;
  cursor: pointer;
  z-index: 2;
  align-items: center;
  color: #FFF5F5CC;
  position: relative;
;
  @include mobile {
    display: none;
  }

  img {
    height: 24px;
    margin-right: 8px;

  }
}
.against-fight-header {
  width: 94%;
  margin: 0 auto;
  background-color: rgba($color: #111, $alpha: 0.86);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  .against-fight-header-top {
    display: flex;
    justify-content: space-between;
  }
  .against-fight-header-content {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    .team-info {
      display: flex;
      align-items: center;
      padding: 10px;
      .team-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-right: 12px;
        border: 1px solid #9006e5;
      }
      .alias-name {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 12px;
        background-color: rgba($color: #c01e1e, $alpha: 0.3);
        padding: 0 6px;
        color: #b38181;
      }
      .team-name {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 14px;
        color: #dddddd;
        padding-left: 4px;
        margin-bottom: 2px;
      }
      .team-score {
        display: flex;
        align-items: center;
        padding-left: 4px;
        img {
          width: 10px;
          height: 13px;
          margin-right: 3px;
        }
        span {
          font-size: 13px;
        }
      }
    }
    .team-info-right {
      flex-direction: row-reverse;
      img {
        margin-right: 0;
        margin-left: 12px;
      }
      p {
        text-align: right;
      }
      .team-name {
        padding-right: 4px;
      }
    }
    .round-num {
      width: 60px;
      height: 70px;
      margin-right: 16px;
      position: relative;
      h3 {
        width: 100%;
        text-align: center;
        position: absolute;
        z-index: 2;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 24px;
        color: #fff;
      }
      .round-num-bg {
        width: 60px;
        height: 70px;
        background-image: var(--bg-round-num);
        background-size: contain;
        background-repeat: no-repeat;
        position: absolute;
        z-index: 1;
      }
      .rotate1 {
        animation: rotate1 2s linear infinite;
      }
      .rotate2 {
        animation: rotate2 2s linear infinite;
      }
      .rotate3 {
        animation: rotate3 2s linear infinite;
      }
    }
  }
}
.against-fight-main {
  width: 94%;
  margin: 0 auto;
  padding: 16px 0;
  display: flex;
  justify-content: space-between;
  .against-fight-main-left, .against-fight-main-right {
    width: 50%;
  }
  .fight-main-wrap {
    display: flex;
    justify-content: space-between;
    .team-member {
      padding: 14px 0;
      .team-member-item {
        padding-bottom: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        .team-member-item-top {
          display: flex;
          align-items: end;
        }
        .user-avatar {
          width: 42px;
          height: 42px;
          border: 1px solid #ea9918;
          border-radius: 8px;
        }
        p {
          font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
          font-size: 13px;
        }
        .team-member-item-result {
          background-color: #771818;
          border-radius: 4px;
          height: 28px;
          margin-left: 3px;
          .user-probability, .user-score {
            display: flex;
            align-items: center;
            padding: 0 4px 0 3px;
            height: 14px;
            line-height: 14px;
            img {
              width: 10px;
              height: 10px;
              margin-right: 2px;
            }
            span {
              font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
              font-size: 12px;
              color: #eee;
            }
          }
        }
        .team-member-item-top-reverse {
          flex-direction: row-reverse;
          .team-member-item-result {
            margin-left: 0;
            margin-right: 3px;
          }
        }
      }
      .magnify {
        overflow: visible;
        img {
          width: 60px;
          height: 60px;
          animation: smooth 2s infinite;
        }
        p {
          font-size: 16px;
          text-shadow:  0px 0px 6px rgb(247, 219, 77);
        }
      }
    }
    .team-fight {
      flex: 1;
      background-image: var(--bg-level);
      background-color: rgba(50, 50, 50, 0.66);
      background-position: bottom;
      background-repeat: repeat-x;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 16px 6px;
      max-width: 360px;
      box-sizing: border-box;
      padding: 16px 8px;
      .team-fight-status {
        width: 100%;
        color: #ddd;
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .against-fight-main-right .fight-main-wrap {
    flex-direction: row-reverse;
  }
}
.vs-container {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 5;
  .vs {
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    color: #f29614;
    font-size: 28px;
    @include mobile {
      position: absolute;
      transform: translateX(-50%);
      font-size: 20px;
    }
  }
}

@keyframes rotate1 {
  from {
    transform: rotateZ(0deg);
  }

  to {
    transform: rotateZ(360deg);
  }
}
@keyframes rotate2 {
  from {
    transform: rotateZ(180deg);
  }

  to {
    transform: rotateZ(-180deg);
  }
}
@keyframes rotate3 {
  from {
    transform: rotateZ(90deg);
  }

  to {
    transform: rotateZ(270deg);
  }
}
@keyframes smooth {
  0% {
    box-shadow: 0px 0px 5px rgba(255, 255, 255, 0.6);
  }

  50% {
    box-shadow: 0px 0px 27px rgba(255, 255, 255, 0.6);
  }

  100% {
    box-shadow: 0px 0px 5px rgba(255, 255, 255, 0.6);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
}
</style>