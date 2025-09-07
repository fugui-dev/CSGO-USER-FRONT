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
const chooseOddsDialogRef = ref(null)
const chooseCountdownValue = ref()
const currUserStageRecordId = ref(-1)
const currTeamWaitingNextRoundText = ref('')
const currOpponentTeamWaitingNextRoundText = ref('')
const localSet = reactive({
  music: true
})

const { ws, isConnected, connect, disconnect } = useWebSocketHeartbeat({
  pingInterval: 30000,
  onOpen: () => {},
  onMessage: (res) => {
    const data = JSON.parse(res.data)
    console.log(data)
    if (data.data === 'pong') return

    // 获取初始化记录和当前进度
    if (data.type === 'CURRENT_PROGRESS') {
      if (data.data.code === 200 && data.data.data) {
        fightData.value = data.data.data
        // 检测整场游戏的进度
        checkProgress()
      }
    }
    // 回合开始
    if (data.type === 'ROUND_START') {
      // 清空等待下一轮提示文案
      currTeamWaitingNextRoundText.value = ''
      currOpponentTeamWaitingNextRoundText.value = ''
      // ROUND_START会发送两次数据，代表当前队伍玩家和对手队伍玩家
      // 定位到即将对战的两个用户
      findFightingUserByUserId(data.data.userId, data.data.userStatus)
      // 判断当前回合游戏剩余的时间能做些什么(ROUND_START会推2条数据)
      checkRemainTime(new Date(data.data.endTime), 'ROUND_START')
    }
    // 回合对战结果
    if (data.type === 'ROUND_RESULT') {
      // 遍历 设置当前回合的对战结果数据
      setCurrFightResult(data.data)
      // 判断当前回合游戏剩余的时间能做些什么
      checkRemainTime(new Date(data.data.endTime), 'ROUND_RESULT')
    }
    // 等待对手选择
    if (data.type === 'ROUND_WAITING') {
      // 遍历 设置当前回合的对战结果数据
      setCurrFightResult(data.data)
    }
    if (data.type === 'FIGHT_END') {
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
      ElMessage.error(data.data)
    }
  },
  onClose: () => {},
  onError: (error) => {}
})

const handleClickBack = () => {
  router.back()
}

// 初始化时，检测整场游戏的进度
const checkProgress = () => {
  const status = fightData.value.status
  switch (status) {
    // 未开始
    case 0: break
    // 进行中
    case 1: 
      // 定位到正在对战的两个用户
      findFightingUserByCurrRound(fightData.value.recordRound)
      // 判断当前回合游戏剩余的时间能做些什么
      checkRemainTime(new Date(currTeamPlayer.value.data.endTime), 'CURRENT_PROGRESS')
      break
    // 已结束
    case 2: break
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
      currTeamPlayer.value.data = item
      currTeamPlayer.value.index = index
      nextTick(() => {
        scrollToTarget(teamScrollRef.value, teamUserList, currTeamPlayer.value.index)
      })
    }
  });
  opponentTeamUserList.forEach((item, index) => {
    if (item.round === currRoundNum) {
      currOpponentTeamPlayer.value.data = item
      currOpponentTeamPlayer.value.index = index
      nextTick(() => {
        scrollToTarget(opponentTeamScrollRef.value, opponentTeamUserList, currOpponentTeamPlayer.value.index)
      })
    }
  });
}

// 定位到即将对战的两个用户
const findFightingUserByUserId = (userId, userStatus) => {
  const teamUserList = fightData.value.team?.stageRecordStartList
  const opponentTeamUserList = fightData.value.opponentTeam?.stageRecordStartList
  const currTeamPlayerIndex = teamUserList.findIndex(item => item.userId === userId)
  const currOpponentTeamPlayerIndex = opponentTeamUserList.findIndex(item => item.userId === userId)

  // 说明用户在team里
  if (currTeamPlayerIndex > -1) {
    // 更新用户状态
    teamUserList[currTeamPlayerIndex].status = userStatus

    currTeamPlayer.value.index = currTeamPlayerIndex
    currTeamPlayer.value.data = teamUserList[currTeamPlayer.value.index]
    currRound.value = currTeamPlayer.value.data.round
    nextTick(() => {
      scrollToTarget(teamScrollRef.value, teamUserList, currTeamPlayer.value.index)
    })
  }
  // 说明用户在opponentTeam里
  if (currOpponentTeamPlayerIndex > -1) {
    // 更新用户状态
    opponentTeamUserList[currOpponentTeamPlayerIndex].status = userStatus

    currOpponentTeamPlayer.value.index = currOpponentTeamPlayerIndex
    currOpponentTeamPlayer.value.data = opponentTeamUserList[currOpponentTeamPlayer.value.index]
    currRound.value = currOpponentTeamPlayer.value.data.round
    nextTick(() => {
      scrollToTarget(opponentTeamScrollRef.value, opponentTeamUserList, currOpponentTeamPlayer.value.index)
    })
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

const showChooseOddsDialog = () => {
  const currUserId = store.userInfo.userId
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
  if (currTeamPlayer.value.index > -1) {
    nextTick(() => {
      currTeamFightBoxRef.value.startAnimation()
    })
  }
  if (currOpponentTeamPlayer.value.index > -1) {
    nextTick(() => {
      currOpponentTeamFightBoxRef.value.startAnimation()
    })
  }
}

// 判断当前回合游戏剩余的时间能做些什么(能调用这个函数说明游戏还在进行中)
const checkRemainTime = (endTime, type) => {
  const currentTime = new Date()
  const timeDiff = endTime - currentTime
  console.log(endTime)
  console.log(currentTime)
  console.log(Number.isNaN(timeDiff))
  if (Number.isNaN(timeDiff)) return

  const currTeamPlayerData = currTeamPlayer.value.data
  const currOpponentTeamPlayerData = currOpponentTeamPlayer.value.data

  console.log(0)
  // 当前回合状态非进行中，直接返回
  // TO DO: if (currTeamPlayerData.status !== 1) return
  console.log(currTeamPlayerData)
  console.log(currOpponentTeamPlayerData)
  if (currOpponentTeamPlayerData.status !== 1) return
  console.log(1)
  console.log(timeDiff / 1000)

  // (timeDiff - 30000) / 1000 > 1 表示倒计时超过1s才可以展示弹窗
  if (timeDiff > 30000 && ((timeDiff - 30000) / 1000 > 1)) {
    console.log(2)
    // 只有 ROUND_START 和 CURRENT_PROGRESS 才可以展示弹窗，ROUND_RESULT 和 ROUND_WAITING不行
    if (type === 'ROUND_START') {
      // 只有前30s可以展示选择弹窗和倒计时，并且得是当前用户才展示，否则展示“用户选择中”
      showChooseOddsDialog()
    } else if (type === 'CURRENT_PROGRESS') {
      // 当前两个玩家都已经选择概率，播放动画
      if (currTeamPlayerData.data && currOpponentTeamPlayerData.data) {
        playAnimation()
      } else {
        showChooseOddsDialog()
      }
    } else if (type === 'ROUND_RESULT') {
      // 播放动画
      playAnimation()
    }
  } else if (timeDiff > 17000) {
    console.log(3)
    // 只有 ROUND_RESULT 和 CURRENT_PROGRESS 才可以播放动画，ROUND_START 和 ROUND_WAITING 不行
    if (!(type === 'ROUND_RESULT' || type === 'CURRENT_PROGRESS')) return

    // 动画13s，自定义缓冲时间4s，回合一共60s，剩余时间大于17s时可展示动画，否则直接展示结果
    // 播放动画
    playAnimation()
  } else if (timeDiff > 0) {
    console.log(4)
    // 只有 ROUND_RESULT 和 CURRENT_PROGRESS 才可以直接展示结果，ROUND_START 和 ROUND_WAITING 不行
    if (!(type === 'ROUND_RESULT' || type === 'CURRENT_PROGRESS')) return

    console.log(currTeamPlayer.value.index)
    console.log(currOpponentTeamPlayer.value.index)
    // 直接展示结果
    if (currTeamPlayer.value.index > -1) {
      nextTick(() => {
        currTeamFightBoxRef.value.jumpToEndPosition()
      })
    }
    if (currOpponentTeamPlayer.value.index > -1) {
      nextTick(() => {
        currOpponentTeamFightBoxRef.value.jumpToEndPosition()
      })
    }
  } else {
    ElMessage.warning('当前回合结束时间有误')
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
  checkRemainTime(new Date(data.data.endTime), 'ROUND_START')
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
  checkRemainTime(new Date(data.data.endTime), 'ROUND_RESULT')
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
    if (currRound.value < fightData.value.round) {
      currTeamWaitingNextRoundText.value = '等待下一回合开始...'
    } else {
      currTeamWaitingNextRoundText.value = '等待对战结束...'
    }
  } else {
    if (currRound.value < fightData.value.round) {
      currOpponentTeamWaitingNextRoundText.value = '等待下一回合开始...'
    } else {
      currOpponentTeamWaitingNextRoundText.value = '等待对战结束...'
    }
  }
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
            <h3>{{ currRound }} / {{ fightData.round }}</h3>
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
                          <span>{{item.data}}</span>
                        </div>
                        <div class="user-score">
                          <img :src="requireImg('/coin1.png',false)" alt="">
                          <span>{{item.score}}</span>
                        </div>
                      </div>
                    </div>
                    <p>{{ item.userName }}</p>
                </div>
              </div>
            </el-scrollbar>
            <div class="team-fight">
              <div class="team-fight-status" v-if="fightData.status === 0 || currTeamPlayer.data.status === 0">暂未开始</div>
              <div class="team-fight-status" v-else-if="fightData.status === 2">游戏已结束</div>
              <div class="team-fight-status" v-else-if="currTeamPlayer.data.status === 1 && !currTeamPlayer.data.data">用户选择中...</div>
              <div class="team-fight-status" v-else-if="currTeamPlayer.data.status === 1 && currTeamPlayer.data.data && !currOpponentTeamPlayer.data.data">用户已选择</div>
              <div class="team-fight-status" v-else-if="currTeamPlayer.data.status === 1 && currTeamPlayer.data.data && currOpponentTeamPlayer.data.data && currTeamWaitingNextRoundText">{{ currTeamWaitingNextRoundText }}</div>
              <FightBox
                v-else-if="currTeamPlayer.data.status === 1 && currTeamPlayer.data.data && currOpponentTeamPlayer.data.data"
                ref="currTeamFightBoxRef"
                :fightResult="currTeamPlayer.data"
                :localSet="localSet"
                @scrollEnd="handleScrollEnd('currTeam')" />
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
                          <span>{{item.data}}</span>
                        </div>
                        <div class="user-score">
                          <img :src="requireImg('/coin1.png',false)" alt="">
                          <span>{{item.score}}</span>
                        </div>
                      </div>
                    </div>
                    <p>{{ item.userName }}</p>
                </div>
              </div>
            </el-scrollbar>
            <div class="team-fight">
              <div class="team-fight-status" v-if="fightData.status === 0 || currOpponentTeamPlayer.data.status === 0">暂未开始</div>
              <div class="team-fight-status" v-else-if="fightData.status === 2">游戏已结束</div>
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