<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {requireImg} from "@/utils/common";
import { useStore } from "@/store";
import {ElMessage, ElMessageBox} from "element-plus";
import Decimal from 'decimal.js'
import {joinRoomApi, prepareFightApi, beginFightApi, ownerEndFightApi} from "@/api/battle"
import FightBox from "./FightBox.vue"
import FightResult from "./FightResult.vue"
import { useUserInfo } from "@/composables/useUesrInfo.js"
import coin from '@/assets/images/upgrade/coin.png'
import win from '@/assets/images/battle/win.png'
import lose from '@/assets/images/battle/lose.png'

const props = defineProps({
  cardData: {
    type: Object,
    required: true
  },
  roomId: {
    type: Number,
    required: true
  },
  roomOwnerId: {
    type: Number,
    required: true
  },
  isAllReady: {
    type: Boolean,
    required: true
  },
  roomStatus: {
    type: Number,
    required: true
  },
  roundNumber: {
    type: Number
  },
  winnerIds: {
    type: Array
  },
  playerIds: {
    type: Array
  },
  fightResult: {
    type: Array
  },
  localSet: {
    type: Object
  }
});

const store = useStore()
const { fetchUserInfo } = useUserInfo()
const currUserId = computed(() => store.userInfo.userId)
const allReady = computed(() => props.isAllReady)
const emit = defineEmits(['start', 'roundEnd', 'end'])
const FightBoxRef = ref(null)
const FightResultRef = ref(null)
const totalPrice = ref(0)

const statusMap = {
  '0': '等待中',
  '1': '进行中',
  '2': '已结束'
}

// 组装所有轮次每个卡片的结果
const playerResult = computed(() => {
  const roundNumber = props.roundNumber
  const fightResult = props.fightResult
  const playerIds = [...new Set(fightResult.map(item => item.userId))]
  const result = {}
  for (let i = 0; i < roundNumber; i++) {
    for (let j = 0; j < playerIds.length; j++) {
      // 以用户为维度，找到当前回合的数据
      const match = fightResult?.find(item => playerIds[j] === item.userId && item.fightRoundNumber === i + 1)
      if (i === 0) {
        result[playerIds[j]] = {}
        result[playerIds[j]][i + 1] = [match]
      } else {
        result[playerIds[j]][i + 1] = result[playerIds[j]][i].concat(match)
      }
    }
  }
  console.log(result)
  return result
})

// 计算每轮的汇总金额
const calcPerRoundTotalPrice = () => {
  const playerId = props.cardData.playerId
  const currRound = store.currRound
  const arr = playerResult.value[playerId][currRound]
  if (Array.isArray(arr) && arr.length) {
    totalPrice.value = arr.reduce((prev, next) => {
      return new Decimal(next.ornamentsPrice).plus(prev).toNumber()
    }, 0)
  }
}

const handleJoin = () => {
  if (props.roomOwnerId === currUserId.value) {
    ElMessage.warning('房主无法加入自己创建的对战！')
    return
  }
  joinRoomApi({fightId: props.roomId}).then(async res => {
    if (res.code === 200) {
      ElMessage.success(res.msg)
      // 更新用户信息（因为加入房间会扣费）
      console.log('加入房间成功，开始更新用户信息...')
      try {
        await fetchUserInfo()
        console.log('用户信息更新完成')
      } catch (error) {
        console.error('更新用户信息失败:', error)
      }
    } else {
      ElMessage.error(res.msg || '加入房间失败')
    }
  }).catch(err => {
    ElMessage.error('加入房间失败，请重试')
  })
}

const handlePrepare = () => {
  prepareFightApi({fightId: props.roomId}).then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg)
    }
  })
}

const handleStartGame = () => {
  beginFightApi({fightId: props.roomId}).then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg)
      emit('start')
    }
  })
}

const handleEndFight = () => {
  ElMessageBox.confirm('确定要结束对战吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ownerEndFightApi({fightId: props.roomId}).then(res => {
      if (res.code === 200) {
        ElMessage.success(res.msg)
        // 更新用户信息（因为房主结束对战会退款）
        fetchUserInfo()
        emit('end')
      } else {
        ElMessage.error(res.msg)
      }
    }).catch(err => {
      ElMessage.error('操作失败，请重试')
    })
  }).catch(() => {
    // 用户取消操作
  })
}

const startAnimation = () => {
  FightBoxRef.value?.startAnimation()
}

const handleScrollEnd = () => {
  calcPerRoundTotalPrice()
  FightResultRef.value?.startAnimation()
}

const handleMagnifyEnd = () => {
  store.setCurrRoundFlag(props.cardData.playerId, true)
  emit('roundEnd')
}

defineExpose({
  startAnimation
})

</script>
<template>
  <div>
    <div class="fight-card-container" :style="{
        '--bg-card':requireImg('/level/2.png',true)
      }">
      <!-- 头部 -->
      <div class="card-header">
        <div class="tw-flex tw-justify-between tw-items-center tw-mb-0 tw-relative tw-z-10">
          <div v-if="cardData.status === 0" class="waiting-player">等待玩家加入</div>
          <div class="user-info" v-else>
            <div class="user">
              <div class="avatar-wrap">
                <img class="avatar" :src="cardData.avatar" alt="">
              </div>
              <span class="nick-name">{{ cardData.nickName }}</span>
            </div>
            <div class="price">
              <img :src="coin" alt="">
              <div v-if="roomStatus === 2">{{ cardData.awardTotalPrices }}</div>
              <div v-else>{{ totalPrice }}</div>
            </div>
          </div>
          <!-- <div class="tw-absolute tw-h-[2px] tw-bg-gradient-to-r tw-from-transparent tw-via-[#FF7A21] tw-to-transparent tw-w-full tw-bottom-[-12px]"></div> -->
        </div>
      </div>
      <!-- 中间 -->
      <FightBox
        ref="FightBoxRef"
        v-if="roomStatus === 1"
        :roundNumber="roundNumber"
        :fightResult="fightResult"
        :currPlayerId="cardData.playerId"
        :localSet="localSet"
        @scrollEnd="handleScrollEnd" />
      <div class="card-main" v-if="roomStatus === 0">
        <div class="player-status">
          <div class="join-btn" v-if="cardData.status === 0" @click="handleJoin">加入</div>
          <div v-else-if="cardData.status === 1">
            <div class="join-btn" v-if="cardData.playerId === currUserId" @click="handlePrepare">准备</div>
            <p v-else>已入座</p>
          </div>
          <div v-else-if="cardData.status === 2">
            <!-- 房主可以结束对战（当除了房主没有其他玩家准备时） -->
            <div class="end-btn" v-if="(roomOwnerId === currUserId) && (currUserId === cardData.playerId) && (roomStatus === 0)" @click="handleEndFight">结束对战</div>
            <p v-else>已准备就绪</p>
          </div>
        </div>
      </div>
      <div class="card-main" v-if="roomStatus === 2">
        <div class="player-status">
          <div v-if="winnerIds && winnerIds.includes(cardData.playerId)" class="winner">
            <img :src="win" alt="" class="tw-w-[60%]">
          </div>
          <div v-else class="loser">
            <img :src="lose" alt="" class="tw-w-[60%]">
          </div>
        </div>
      </div>
    </div>
    <div class="fight-result-container">
      <FightResult
        ref="FightResultRef"
        :result="playerResult"
        :currPlayerId="cardData.playerId"
        :roundNumber="roundNumber"
        :fightResult="fightResult"
        :roomStatus="roomStatus"
        @magnifyEnd="handleMagnifyEnd" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.fight-card-container {
  background-image: url('@/assets/images/battle/card-bg.png');
  background-color: #1E2C30;
  background-position: 50% 50%;
  background-repeat: repeat-x;
  background-size: cover;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.card-header {
  color: #fff;
  padding: 8px 0;
  overflow: hidden;
  .user-info {
    width: 100%;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #2a3538;
    margin: 0 12px;
    padding-bottom: 4px;
    .user {
      display: flex;
      justify-content: center;
      align-items: center;
      .avatar-wrap {
        width: 44px;
        height: 44px;
        background: url('@/assets/images/battle/avatar-bg2.png') no-repeat;
        background-size: 100% 100%;
        background-position: 50% 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 6px;
      }
      img.avatar {
        width: 32px;
        height: 32px;
        border-radius: 16px;
      }
      .nick-name {
        font-size: 14px;
        white-space: nowrap; /* 防止文本换行 */
        overflow: hidden; /* 隐藏溢出的内容 */
        text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
        max-width: 100px;
        text-align: center;
      }
    }
  }
  .price {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #ffffff;
    background-color: #1A272B;
    height: 16px;
    line-height: 16px;
    border-radius: 8px;
    margin-left: 28px;
    padding: 0 10px 0 22px;
    position: relative;
    img {
      position: absolute;
      width: 16px;
      left: 0;
    }
  }
  .waiting-player {
    font-size: 14px;
    width: 100%;
    height: 48px;
    border-bottom: 1px solid #2a3538;
    margin: 0 12px;
    line-height: 48px;
    text-align: center;
  }
}
.card-main {
  .player-status {
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    p {
      color: #C99227;
      font-size: 14px;
    }
    .join-btn {
      width: 80px;
      height: 32px;
      line-height: 32px;
      font-size: 14px;
      text-align: center;
      background: url('@/assets/images/login/yellow_btn.png') no-repeat;
      background-size: cover;
    }
    .end-btn {
      width: 70px;
      height: 32px;
      line-height: 32px;
      border-radius: 6px;
      font-size: 14px;
      text-align: center;
      background: linear-gradient(90.15deg, #dc2626 -4.19%, #ef4444 99.85%);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      &:hover {
        background: linear-gradient(90.15deg, #b91c1c -4.19%, #dc2626 99.85%);
        transform: translateY(-1px);
      }
    }
    .winner {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      font-size: 28px;
      display: flex;
      justify-content: center;
      margin-top: -10%;
    }
    .loser {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      color: #eee;
      font-size: 28px;
      display: flex;
      justify-content: center;
      margin-top: -10%;
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-header {
    .user-info {
      flex-direction: column;
      justify-content: center;
      height: 100px;
      .user {
        flex-direction: column;
        justify-content: center;
        .nick-name {
          font-size: 16px;
          margin-top: 4px;
        }
      }
      .price {
        margin-left: 0;
        margin-top: 4px;
      }
    }
    .waiting-player {
      height: 100px;
      line-height: 100px;
    }
  }
}
</style>
