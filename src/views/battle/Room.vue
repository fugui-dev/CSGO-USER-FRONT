<script setup>
import Layout from "@/components/Layout.vue";
import {ref, computed, reactive, onBeforeMount, provide, nextTick, onMounted, onUnmounted
} from "vue";
import {goto, requireImg, deepClone} from "@/utils/common";
import {getHistoryDetailApi, saveFightBoutApi, endFightApi} from "@/api/battle";
import { useRoute, useRouter } from 'vue-router';
import { useStore } from "@/store";
import { ElMessage } from 'element-plus';
import RoomCard from './components/RoomCard.vue'
import CountdownModal from './components/CountdownModal.vue'
import useWebSocketHeartbeat from '../../composables/useWebSocketHeartbeat'
import bgm from "@/assets/music/main_battle.mp3";
import { useUserInfo } from "@/composables/useUesrInfo.js";

const modelMap = {
  '0': '欧皇模式',
  '1': '非酋模式'
}
const statusMap = {
  '0': '等待中',
  '1': '进行中',
  '2': '已结束',
  '3': '房主结束'
}

const route = useRoute()
const router = useRouter()
const store = useStore()
const { fetchUserInfo } = useUserInfo()
const currRound = computed(() => store.currRound)
const roomData = ref({})
const fightBoxVOList = ref([])
const fightResult = ref([])
const isAllReady = ref(false) // 是否所有座位都已准备就绪
const CountdownModalRef = ref(null)
const winnerIds = ref([])
const musica = new Audio(bgm)

const playerIds = computed(() => roomData.value.seatList.map(item => item.playerId))
const statusColor = computed(() => {
  switch (roomData.value.status) {
    case 0: return '#FF952A';
    case 1: return '#FF3C2A';
    case 2: return '#602bCF';
    default: return '#AAAAAA';
  }
})
const boxList = computed(() => {
  let arr = []
  const fightBoxList = fightBoxVOList.value
  for (const item of fightBoxList) {
    const num = item.number;
    if (typeof num === 'number' && num >= 1) {
      for (let i = 0; i < num; i++) {
        arr.push(deepClone(item));
      }
    }
  }
  return arr
})
provide('boxList', boxList)

const { ws, isConnected, connect, disconnect } = useWebSocketHeartbeat({
  pingInterval: 30000,
  onOpen: () => {},
  onMessage: (res) => {
    const data = JSON.parse(res.data)
    console.log(data)
    if (data.data !== 'pong') {
      if (data.code === 200 && data.data) {
        // 处理对战结束事件
        if (data.type === 'FIGHT_END') {
          ElMessage.info('房主已结束对战')
          // 更新用户信息（因为房主结束对战会退款）
          fetchUserInfo()
          disconnect()
          router.push('/battle')
          return
        }
        
        roomData.value = data.data.fight
        fightBoxVOList.value = data.data.fightBoxVOList
        winnerIds.value = data.data.winnerIds
        // 检查是否所有座位都已准备就绪
        isAllReady.value = data.data.fight.seatList.every(seat => seat.status === 2)
        
        const currentRound = data.data.currentRound
        fightResult.value = data.data.fightResult
        // 有对战结果说明2种情况：（1）游戏开始（2）对战进行中，有人进入观战，此时currentRound有值
        if (Array.isArray(fightResult.value) && fightResult.value.length > 0) {
          reCalcBoxList()
          if (!currentRound) {
            // 非房主，游戏现在开始
            const userId = store.userInfo.userId;
            if (userId !== data.data.fight.userId) {
              showBeginAnimation()
            }
          }
        }
        
        if (!currentRound) return
        if (currentRound < 0) {
          store.setCurrRound(data.data.fight.roundNumber)
          // 对战已结束
          disconnect()
          return
        } else {
          // 对战进行中（有人进入观战）
          store.setCurrRound(1)
          store.setCurrRound(currentRound)
          nextTick(() => {
            handleStartGame()
          })
        }
      }
    }
  },
  onClose: () => {},
  onError: (error) => {}
})

const localSet = reactive({
  music: true
})

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

const handleClickBack = () => {
  goto('/battle')
}

const showBeginAnimation = () => {
  CountdownModalRef.value.open()
}

const reCalcBoxList = () => {
  const userId = fightResult.value[0].userId
  const onePersonFightResult = fightResult.value.filter(item => item.userId === userId)
  const map = new Map()
  if (onePersonFightResult.length === boxList.value.length) {
    boxList.value.forEach(box => {
      const findItem = onePersonFightResult.find(item => {
        const arr = map.has(box.boxId) ? map.get(box.boxId) : []
        const isInclude = arr.includes(item.fightRoundNumber)
        if (!isInclude) {
          arr.push(item.fightRoundNumber)
          map.set(box.boxId, arr)
        }
        return item.boxId === box.boxId && !isInclude
      })
      if (findItem) {
        box.fightRoundNumber = findItem.fightRoundNumber
      }
    })
    boxList.value.sort((a, b) => a.fightRoundNumber - b.fightRoundNumber)
    console.log(boxList.value)
  }
}

const createWs = () => {
  const userId = store.userInfo.userId;
  const fightId = route.params.id;
  if (!userId || !fightId) return
  // 连接ws
  connect(`ws://121.229.204.223:8090/ws/fight/room/${userId}/${fightId}`)
}

// 获取历史对战信息
const getFinishedData = () => {
  const fightId = route.params.id;
  getHistoryDetailApi({ fightId }).then(res => {
    roomData.value = res.data.fight
    fightBoxVOList.value = res.data.fightBoxVOList
    winnerIds.value = res.data.winnerIds
    fightResult.value = res.data.fightResult
    if (Array.isArray(fightResult.value) && fightResult.value.length > 0) {
      reCalcBoxList()
    }
  })
}

// 开始倒计时
const handleStartCountdown = () => {
  isAllReady.value = false
  showBeginAnimation()
}

// 处理对战结束
const handleFightEnd = () => {
  // 更新用户信息（因为对战结束可能会有奖励或结算）
  fetchUserInfo()
  // 断开WebSocket连接
  disconnect()
  // 返回对战列表页面
  router.push('/battle')
}

// 定义一个响应式引用，用于存储所有组件实例的引用
const RoomCardRefs = ref([]);
const setRoomCardRefs = (el, index) => {
  if (el) {
    RoomCardRefs.value[index] = el;
  }
};

// 开启动画
const startAnimation = () => {
  for (let i = 0; i < RoomCardRefs.value.length; i++) {
    RoomCardRefs.value[i].startAnimation()
  }
}

// 开始游戏
const handleStartGame = () => {
  console.log('开始游戏: ' + store.currRound)
  startAnimation()
}

onBeforeMount(() => {
  const model = Number(route.query.model)
  // 模式1：创建房间后进入 模式2：进入等待中或进行中的房间 模式3：进入已结束的房间
  if (model === 1 || model === 2) {
    createWs()
  } else {
    getFinishedData()
  }
})

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

const handleRoundEnd = () => {
  nextTick(() => {
    const currRoundFlag = store.currRoundFlag
    const playerIds = roomData.value.seatList.map(item => item.playerId)
    const res = playerIds.every(id => id && currRoundFlag[id])
    if (res) {
      ownerCall()
    }
  })
}

// const saveDataAndGoNext = () => {
//   // 当前用户是房主
//   if (roomData.value.userId === store.userInfo.userId) {
//     ownerCall()
//   } else {
//     ordinaryCall()
//   }
// }

// 房主调用
const ownerCall = () => {
  const fightId = route.params.id;
  let currRound = store.currRound
  // 存储当前回合数据
  saveFightBoutApi({
    fightId: fightId,
    boutNum: currRound
  }).then(res => {
    if (res.code === 200) {
      if (currRound < roomData.value.roundNumber) {
        store.clearCurrRoundFlag()
        store.setCurrRound(++currRound)
        handleStartGame()
      } else {
        // 结束游戏
        endFightApi({ fightId }).then(res => {
          if (res.code === 200) {
            roomData.value = res.data.fight
            fightBoxVOList.value = res.data.fightBoxVOList
            winnerIds.value = res.data.winnerIds
            fightResult.value = res.data.fightResult
            store.setCurrRound(1)
            // 更新为结束状态
            roomData.value.status = 2
            if (Array.isArray(fightResult.value) && fightResult.value.length > 0) {
              reCalcBoxList()
            }
            // 更新用户信息（因为对战结束可能会有奖励或结算）
            fetchUserInfo()
            disconnect()
          }
        })
      }
    }
  })
}

// 普通调用
// const ordinaryCall = () => {
//   let currRound = store.currRound
//   if (currRound < roomData.value.roundNumber) {
//     store.clearCurrRoundFlag()
//     store.setCurrRound(++currRound)
//     handleStartGame()
//   } else {
//     store.setCurrRound(1)
//     // 更新为结束状态
//     roomData.value.status = 2
//     closeWs()
//   }
// }

</script>

<template>
  <Layout :style="{
      '--bg-room':requireImg('/v2/bg/openBg.png',true),
      '--bg-round-num':requireImg('/v2/smelt/jg-bg.png',true),
    }">
    <template #item>
      <div class="bg bg-room"></div>
      <div class="room-container">
        <CountdownModal ref="CountdownModalRef" :localSet="localSet" @close="handleStartGame" />
        <!-- banner -->
        <div class="room-banner">
          <!-- 顶部 -->
          <div class="room-banner-top">
            <div class="back" @click="handleClickBack">
              <img :src="requireImg('/v2/roll/room/back.png')" alt="">
              返回
            </div>
            <div class="room-status" :style="{ backgroundColor: statusColor }">{{ statusMap[roomData.status] }}</div>
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
          <div class="room-banner-center">
            <div class="round-num">
              <div class="round-num-bg rotate1"></div>
              <div class="round-num-bg rotate2"></div>
              <div class="round-num-bg rotate3"></div>
              <h3 v-if="roomData.status === 2">{{ roomData.roundNumber }} / {{ roomData.roundNumber }}</h3>
              <h3 v-else>{{ currRound }} / {{ roomData.roundNumber }}</h3>
            </div>
            <div class="room-model">{{ modelMap[roomData.model] }}</div>
            <!-- 总金额 -->
            <div class="total-price">
              <img :src="requireImg('/coin1.png',false)" alt="">
              <div>{{ roomData.boxPriceTotal }}</div>
            </div>
          </div>
          <div class="box-list">
            <div class="box-item" v-for="(item, index) in boxList" :key="item.boxId">
              <div :class="['bx', (currRound === index + 1 && roomData.status !== 2) ? 'highlight' : '']">
                <img :src="item.boxImg01" class="bj" alt="">
                <img :src="item.boxImg02" class="wq" alt="">
              </div>
              <div class="btn">
                <div>{{item.boxPrice}}</div>
                <img :src="requireImg('/coin1.png',false)" alt="">
              </div>
            </div>
          </div>
        </div>
        <!-- 对战卡片 -->
        <div class="card-list">
          <RoomCard
            :ref="el => setRoomCardRefs(el, index)"
            :cardData="i" 
            :roomId="roomData.id" 
            :roomOwnerId="roomData.userId"
            :isAllReady="isAllReady"
            :roomStatus="roomData.status"
            :roundNumber="roomData.roundNumber"
            :winnerIds="winnerIds"
            :playerIds="playerIds"
            :fightResult="fightResult"
            :localSet="localSet"
            v-for="(i,index) in roomData.seatList" 
            :key="index" 
            class="card-item"
            @start="handleStartCountdown"
            @end="handleFightEnd"
            @roundEnd="handleRoundEnd" />
        </div>
      </div>
    </template>
  </Layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.bg-room {
  background-image: var(--bg-room);
}
.room-container {
  width: 96%;
  display: flex;
  flex-direction: column;
  max-width: 1024px;
  margin: 6px auto;
  box-sizing: border-box;
  position: relative;
  .room-banner {
    background-color: rgba($color: #111, $alpha: 0.86);
    border-radius: 12px;
    padding: 0 12px 12px 12px;
  }
  .room-banner-top {
    display: flex;
    justify-content: space-between;
    .back {
      display: flex;
      height: fit-content;
      margin: 12px 0 0 0;
      cursor: pointer;
      z-index: 2;
      align-items: center;
      color: #FFF5F5CC;
    ;
      @include mobile {
        display: none;
      }

      img {
        height: 24px;
        margin-right: 8px;

      }
    }
    .room-status {
      height: 32px;
      line-height: 32px;
      font-size: 14px;
      padding: 0 28px;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      margin: 0 auto;
    }
  }
  .room-banner-center {
    display: flex;
    justify-content: center;
    align-items: center;
    .round-num {
      width: 80px;
      height: 92px;
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
        font-size: 30px;
        color: #fff;
      }
      .round-num-bg {
        width: 80px;
        height: 92px;
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
    .room-model {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      font-size: 36px;
      color: #eee;
    }
    .total-price {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #271201;
      background-color: rgba($color: #ec851e, $alpha: 0.4);
      padding: 2px 8px;
      border-radius: 6px;
      margin-left: 8px;
      margin-top: 16px;
      img {
        width: 10px;
        margin-right: 5px;
      }
    }
  }
  .box-list {
    color: #ffffff;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    .box-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: .5s;
      width: 92px;
      box-sizing: border-box;

      &:hover {
        .bx {
          animation: smooth 2s infinite;
          .wq{
            //使用动画 循环播放 up_and_down
            animation: up_and_down 2s infinite;
          }
        }
      }

      .bx {
        width: 100%;
        max-width: 191px;
        max-height: 182px;
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: center;
        img{
          width: 96%;
        }
        .wq{
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
          width: 45%;
          height: 45%;
        }
      }

      .highlight {
        width: 120%;
        animation: smooth 2s infinite;
      }

      .btn {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        width: 80%;
        line-height: 1.5em;
        font-size: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row-reverse;
        img{
          width: 10px;
          margin-right: 3px;
        }
      }
    }
  }
  .card-list {
    display: flex;
    flex-wrap: nowrap;
    padding: 10px 0;
    gap: 10px;
    .card-item {
      flex: 1;
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

/* 响应式调整 */
@media (max-width: 768px) {
  
}
</style>
