<script setup>
import Layout from "@/components/Layout.vue";
import {ref, computed, reactive, onBeforeMount, provide, nextTick, onMounted, onUnmounted
} from "vue";
import {goto, requireImg, deepClone, getWebSocketUrl} from "@/utils/common";
import {getHistoryDetailApi, saveFightBoutApi, endFightApi} from "@/api/battle";
import { useRoute, useRouter } from 'vue-router';
import { useStore } from "@/store";
import { ElMessage } from 'element-plus';
import RoomCard from './components/RoomCard.vue'
import CountdownModal from './components/CountdownModal.vue'
import useWebSocketHeartbeat from '../../composables/useWebSocketHeartbeat'
import bgm from "@/assets/music/main_battle.mp3";
import { useUserInfo } from "@/composables/useUesrInfo.js";
import back from '@/assets/images/upgrade/back.png'
import coin from '@/assets/images/upgrade/coin.png'
import { getBoxInfo } from "@/views/openBox/server/api";
import boxItem from '@/views/openBox/components/boxItem.vue'

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
const previousAllReady = ref(false) // 之前是否所有座位都已准备就绪
const autoStartTimer = ref(null) // 自动开始游戏的定时器
const CountdownModalRef = ref(null)
const winnerIds = ref([])
const musica = new Audio(bgm)

const playerIds = computed(() => roomData.value.seatList.map(item => item.playerId))
const statusColor = computed(() => {
  switch (roomData.value.status) {
    case 0: return '#C99227';
    // case 1: return '#FF3C2A';
    case 1: return '#602bCF';
    case 2: return '#994141';
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
        
        // 先保存之前的状态，再更新数据
        const previousStatus = roomData.value?.status
        const currentStatus = data.data.fight.status
        
        roomData.value = data.data.fight
        fightBoxVOList.value = data.data.fightBoxVOList
        winnerIds.value = data.data.winnerIds
        // 检查是否所有座位都已准备就绪
        const newAllReady = data.data.fight.seatList && data.data.fight.seatList.every(seat => seat.status === 2)
        
        // 如果从"未全部准备"变为"全部准备"，且房间状态还是等待中，显示3秒倒计时
        // 所有用户（包括观战者）都应该看到倒计时
        if (!previousAllReady.value && newAllReady && currentStatus === 0) {
          // 清除之前的定时器（如果有）
          if (autoStartTimer.value) {
            clearTimeout(autoStartTimer.value)
            autoStartTimer.value = null
          }
          // 显示3秒倒计时（所有用户包括观战者都能看到）
          showBeginAnimation()
        }
        
        previousAllReady.value = newAllReady
        isAllReady.value = newAllReady
        
        const currentRound = data.data.currentRound
        fightResult.value = data.data.fightResult
        
        // 检查房间状态是否从等待中(0)变为进行中(1)，说明游戏刚开始
        const isGameJustStarted = previousStatus === 0 && currentStatus === 1
        
        // 有对战结果说明2种情况：（1）游戏开始（2）对战进行中，有人进入观战，此时currentRound有值
        if (Array.isArray(fightResult.value) && fightResult.value.length > 0) {
          reCalcBoxList()
          if (currentRound === null || currentRound === undefined) {
            // 游戏刚开始，所有用户（包括房主和观战者）都应该显示倒计时
            if (isGameJustStarted) {
              showBeginAnimation()
            } else {
              // 非房主（包括观战者），游戏现在开始（处理其他用户进入的情况）
              const userId = store.userInfo.userId;
              if (userId !== data.data.fight.userId) {
                showBeginAnimation()
              }
            }
          }
        }
        
        // 如果currentRound为null或undefined，说明房间还在等待中，回合数应该为1
        if (currentRound === null || currentRound === undefined) {
          store.setCurrRound(1)
          // 如果游戏刚开始（状态从0变为1），需要触发游戏开始逻辑
          if (isGameJustStarted) {
            // 倒计时结束后会调用 handleStartGame，这里不需要重复调用
            return
          }
          return
        }
        
        // 如果currentRound < 0，表示对战已结束
        if (currentRound < 0) {
          store.setCurrRound(data.data.fight.roundNumber)
          // 对战已结束
          disconnect()
          return
        }
        
        // 如果currentRound有值且 >= 0，使用服务器返回的回合数（这是正确的房间回合数）
        // 这样可以确保从其他房间返回时，显示的是当前房间的实际回合数
        store.setCurrRound(currentRound)
        
        // 如果房间正在进行中，启动游戏逻辑
        if (data.data.fight.status === 1 && currentRound > 0) {
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

// 饰品列表弹窗相关
const ornamentListVisible = ref(false)
const ornamentListData = ref([])
const currentBoxName = ref('')
const loadingOrnaments = ref(false)

// 点击箱子查看饰品列表
const handleClickBoxItem = async (item) => {
  if (!item || !item.boxId) {
    return
  }
  
  loadingOrnaments.value = true
  currentBoxName.value = item.boxName || ''
  ornamentListVisible.value = true
  
  try {
    const res = await getBoxInfo({boxId: item.boxId})
    if (res.code === 200 && res.data && res.data.boxOrnamentsList && res.data.boxOrnamentsList.length) {
      // 数据格式映射：将API返回的数据格式转换为boxItem组件需要的格式
      ornamentListData.value = res.data.boxOrnamentsList.map(ornament => ({
        ...ornament,
        ornamentName: ornament.name || '',
        ornamentLevelImg: ornament.levelImg || '',
        exteriorName: ornament.exteriorName || '',
        // oddsResult 已经是百分比格式（如 0.01 表示 0.01%），需要格式化为字符串
        oddsResult: ornament.oddsResult ? parseFloat(ornament.oddsResult).toFixed(2) : null,
        // 确保价格字段被传递（boxPrice 或 usePrice）
        boxPrice: ornament.boxPrice || null,
        usePrice: ornament.usePrice || null
      }))
    } else {
      ElMessage.warning('该箱子暂无饰品数据')
      ornamentListVisible.value = false
    }
  } catch (error) {
    ElMessage.error('获取饰品列表失败')
    ornamentListVisible.value = false
  } finally {
    loadingOrnaments.value = false
  }
}

// 关闭饰品列表弹窗
const closeOrnamentList = () => {
  ornamentListVisible.value = false
  ornamentListData.value = []
  currentBoxName.value = ''
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
  connect(getWebSocketUrl(`/ws/fight/room/${userId}/${fightId}`))
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
  
  // 如果是游戏刚开始（第1回合），也需要保存回合数到后端
  // 确保用户重新进入时能获取到正确的回合数
  // 后端有保护机制，相同或更小的回合数不会覆盖，所以可以安全调用
  // 注意：这个逻辑主要用于处理游戏刚开始时的情况（通过WebSocket消息或倒计时结束触发）
  // 如果是通过 ownerCall 进入的回合，已经在 ownerCall 中保存了，这里不会重复保存（因为第1回合只在刚开始时调用）
  if (roomData.value.status === 1 && roomData.value.id && store.currRound === 1) {
    const fightId = roomData.value.id
    saveFightBoutApi({
      fightId: fightId,
      boutNum: 1
    }).catch(err => {
      console.error('保存第1回合数失败:', err)
      // 即使失败也不影响游戏进行
    })
  }
  
  startAnimation()
}

onBeforeMount(() => {
  // 进入房间时，先重置回合数为1，避免显示上一个房间的回合数
  store.setCurrRound(1)
  store.clearCurrRoundFlag()
  
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
  // 清理定时器
  if (autoStartTimer.value) {
    clearTimeout(autoStartTimer.value)
    autoStartTimer.value = null
  }
  // 离开房间时，重置回合数和回合标志，避免影响下一个房间
  store.setCurrRound(1)
  store.clearCurrRoundFlag()
  // 断开WebSocket连接
  disconnect()
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
  
  // 判断是否是最后一回合
  const isLastRound = currRound >= roomData.value.roundNumber
  
  if (!isLastRound) {
    // 不是最后一回合，进入下一回合
    // 清除回合标志
    store.clearCurrRoundFlag()
    // 更新到下一回合
    const nextRound = ++currRound
    store.setCurrRound(nextRound)
    
    // 在回合开始时，立即调用接口保存新回合数到后端
    // 这样即使有用户离开后重新进入，也能获取到最新的回合数
    // 注意：最后一回合开始时也会在这里保存
    saveFightBoutApi({
      fightId: fightId,
      boutNum: nextRound
    }).then(res => {
      if (res.code === 200) {
        handleStartGame()
      }
    }).catch(err => {
      console.error('保存回合数失败:', err)
      // 即使接口调用失败，也继续游戏
      handleStartGame()
    })
  } else {
    // 最后一回合结束，结束游戏
    // 注意：最后一回合开始时已经在上面保存了回合数，所以这里直接结束即可
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
        <!-- 顶部 -->
        <div class="room-banner-top">
          <div class="back tw-text-[#B1C5C7] tw-text-[14px]" @click="handleClickBack">
            <img :src="back" alt="" class="tw-w-[2rem] tw-h-[1.8rem]">
            返回
          </div>
          <span class="tw-flex tw-items-center tw-gap-1.5 tw-cursor-pointer" @click="changeSet('music')">
            <span
              class="tw-relative tw-inline-flex tw-h-[0.875rem] md:tw-h-5 tw-w-[1.5rem] md:tw-w-11 tw-items-center tw-rounded-full tw-bg-[#202020] tw-transition-colors tw-overflow-hidden">
              <div class="tw-absolute tw-inset-0 tw-rounded-full tw-pointer-events-none" style=" 
              mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
              -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor; mask-composite: exclude;">
              </div>

              <span
                class="tw-relative tw-inline-block tw-h-[0.625rem] md:tw-h-4 tw-w-[0.625rem] md:tw-w-4 tw-transform tw-rounded-full tw-transition-transform"
                :class="{
                  'tw-translate-x-[1.125rem] md:tw-translate-x-[1.625rem]': !localSet.music,
                  'tw-translate-x-[0.25rem] md:tw-translate-x-[0.375rem]': localSet.music,
                  'tw-bg-[#187178]': localSet.music
                }" :style="!localSet.music ? 'background: #EFEFEF;' : ''">
              </span>
            </span>
            <span class="tw-text-xs md:tw-text-sm">关闭音效</span>
          </span>
        </div>
        <!-- banner -->
        <div class="room-banner">
          <div class="room-banner-center">
            <div class="room-status" :style="{ backgroundColor: statusColor }">{{ statusMap[roomData.status] }}</div>
            <div class="round-num">
              <!-- <div class="round-num-bg rotate1"></div>
              <div class="round-num-bg rotate2"></div>
              <div class="round-num-bg rotate3"></div> -->
              <h3 v-if="roomData.status === 2"><span class="tw-text-[#C99227]">{{ roomData.roundNumber }}</span>/{{ roomData.roundNumber }}</h3>
              <h3 v-else><span class="tw-text-[#C99227]">{{ currRound }}</span>/{{ roomData.roundNumber }}</h3>
            </div>
            <div class="room-model">{{ modelMap[roomData.model] }}</div>
            <!-- 总金额 -->
            <div class="total-price">
              <img :src="coin" alt="">
              <div>{{ roomData.boxPriceTotal }}</div>
            </div>
          </div>
          <div class="box-list">
            <div class="box-item" v-for="(item, index) in boxList" :key="item.boxId" @click="handleClickBoxItem(item)">
              <div :class="['bx', (currRound === index + 1 && roomData.status !== 2) ? 'highlight' : '']">
                <img v-if="item.boxImg01" :src="item.boxImg01" class="bj" alt="" @error="$event.target.style.display = 'none'" />
                <img v-if="item.boxImg02" :src="item.boxImg02" class="wq" alt="" @error="$event.target.style.display = 'none'" />
              </div>
              <div class="mz">
                <div class="name">{{ item.boxName }}</div>
              </div>
              <div class="btn">
                <img :src="coin" alt="">
                <div>{{item.boxPrice}}</div>
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
            :fightBoxVOList="fightBoxVOList"
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
  
  <!-- 饰品列表弹窗 -->
  <van-popup class="ornament-dialog no-scrollbar" v-model:show="ornamentListVisible" :close-on-click-overlay="false" teleport="body">
    <div class="lucky-modal-wrapper tw-w-[90vw] md:tw-w-[72.5rem] tw-rounded-xl tw-bg-[#1A1A1A]/90 tw-backdrop-blur-md tw-mt-5 tw-py-4 tw-px-2 md:tw-p-5 tw-pb-3 tw-relative tw-z-10 tw-animate-modalAppear">
      <!-- 开箱背景 -->
      <div class="lucky-modal-bg"></div>
      
      <!-- 标题栏 -->
      <div class="tw-flex tw-justify-between tw-pb-4 tw-items-center tw-mb-6 tw-relative tw-z-10">
        <h3 class="tw-text-xl tw-font-bold tw-text-white tw-animate-titleSlide">{{ currentBoxName }} - 饰品列表</h3>
        
        <!-- 关闭按钮 -->
        <button 
          class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-[#2A2A2A] tw-flex tw-items-center tw-justify-center hover:tw-bg-[#3A3A3A] tw-transition-all tw-duration-300 group"
          @click="closeOrnamentList"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none"
            :style="{ stroke: 'var(--icon-color, #ffffff)' }"
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            class="tw-w-4 tw-h-4 tw-transition-colors tw-duration-300 tw-animate-spin-once"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- 内容区域 -->
      <div class="tw-overflow-hidden tw-overflow-y-auto tw-max-h-[50vh] no-scrollbar tw-transition-all tw-duration-500 tw-ease-in-out tw-my-4 tw-relative tw-z-10" v-loading="loadingOrnaments">
        <div class="box-item tw-flex tw-flex-wrap tw-justify-center tw-gap-y-2 tw-gap-x-2 md:tw-gap-6">
          <boxItem 
            v-for="(item, index) in ornamentListData" 
            :key="index"
            :box-data="item"
            :isHave="true"
          />
        </div>
      </div>
    </div>
  </van-popup>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.bg-room {
  background: url('@/assets/images/roll/bg.png') no-repeat;
  background-size: 100% 100%;
}
.room-container {
  width: 96%;
  display: flex;
  flex-direction: column;
  max-width: 1024px;
  margin: 6px auto;
  box-sizing: border-box;
  position: relative;
  .room-banner-top {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
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
  }
  .room-banner {
    background-color: rgba($color: #111, $alpha: 0.86);
    border-radius: 12px;
  }
  .room-banner-center {
    display: flex;
    justify-content: center;
    align-items: center;
    background: url('@/assets/images/battle/card-header.png') no-repeat;
    background-size: 100% 100%;
    padding: 0 12px;
    height: 60px;
    position: relative;

    .room-status {
      position: absolute;
      left: 0;
      height: 26px;
      line-height: 26px;
      font-size: 13px;
      padding: 0 14px;
    }
    .round-num {
      width: 80px;
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
        font-family: "Jijiati";
        font-size: 20px;
        color: #fff;
      }
      span {
        font-family: "Jijiati";
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
      font-family: "Jijiati";
      font-size: 20px;
      color: #eee;
    }
    .total-price {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #ffffff;
      padding: 2px 12px;
      margin-left: 8px;
      margin-top: 4px;
      img {
        width: 16px;
        margin-right: 5px;
      }
    }
  }
  .box-list {
    color: #ffffff;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    padding: 12px;
    background: url('@/assets/images/battle/card-main.png') no-repeat;
    background-size: cover;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    .box-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: .5s;
      width: 68px;
      box-sizing: border-box;
      margin: 6px;

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

      .mz {
        display: flex;
        align-items: center;
        padding: 0 8px;
        background-color: #1A272B;
        font-size: 11px;
        height: 20px;
        border-radius: 10px;
        line-height: 20px;
        margin: 2px 0;
        justify-content: center;
        width: 100%;
        box-sizing: border-box;
        .name {
          color: #ffffff;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
      }

      .btn {
        margin-top: 2px;
        width: 100%;
        font-size: 12px;
        color: #ffffff;
        background-color: #1A272B;
        height: 16px;
        line-height: 16px;
        border-radius: 8px;
        padding: 0 10px 0 20px;
        position: relative;
        img{
          position: absolute;
          width: 14px;
          left: 0;
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

/* 饰品列表弹窗样式 */
.ornament-dialog {
  background: none;
}

.lucky-modal-wrapper {
  position: relative;
  overflow: hidden;
}

.lucky-modal-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("@/assets/images/open/bg.webp") no-repeat center;
  background-size: cover;
  opacity: 0.3;
  z-index: 0;
  pointer-events: none;
}

.lucky-modal-wrapper .box-item {
  position: relative;
  z-index: 10;
}

.lucky-modal-wrapper .group {
  --icon-color: #ffffff;
}
.lucky-modal-wrapper .group:hover {
  --icon-color: #cccccc;
}

/* 动画 */
@keyframes modalAppear {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes titleSlide {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gridAppear {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes itemAppear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.tw-animate-modalAppear {
  animation: modalAppear 0.3s ease-out;
}

.tw-animate-titleSlide {
  animation: titleSlide 0.4s ease-out;
}

.tw-animate-gridAppear {
  animation: gridAppear 0.5s ease-out;
}

.tw-animate-itemAppear {
  animation: itemAppear 0.3s ease-out;
}
</style>
