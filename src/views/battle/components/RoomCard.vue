<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {requireImg} from "@/utils/common";
import { useStore } from "@/store";
import {ElMessage} from "element-plus";
import {joinRoomApi, prepareFightApi, beginFightApi} from "@/api/battle"
import FightBox from "./FightBox.vue"
import FightResult from "./FightResult.vue"

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
  }
});

const store = useStore()
const currUserId = computed(() => store.userInfo.userId)
const allReady = computed(() => props.isAllReady)
const emit = defineEmits(['start', 'roundEnd'])
const FightBoxRef = ref(null)
const FightResultRef = ref(null)

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

const handleJoin = () => {
  if (props.roomOwnerId === currUserId.value) {
    ElMessage.warning('房主无法加入自己创建的对战！')
    return
  }
  joinRoomApi({fightId: props.roomId}).then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg)
    }
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

const startAnimation = () => {
  FightBoxRef.value?.startAnimation()
}

const handleScrollEnd = () => {
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
        <div class="tw-flex tw-justify-between tw-items-center tw-mb-6 tw-relative tw-z-10">
          <div v-if="cardData.status === 0" class="waiting-player">等待玩家加入</div>
          <div class="user-info" v-else>
            <div class="user">
              <img class="avatar" :src="cardData.avatar" alt="">
              <span class="nick-name">{{ cardData.nickName }}</span>
            </div>
            <div class="price">
              <img :src="requireImg('/coin1.png',false)" alt="">
              <div>{{ cardData.awardTotalPrices }}</div>
            </div>
          </div>
          <div class="tw-absolute tw-h-[2px] tw-bg-gradient-to-r tw-from-transparent tw-via-[#FF7A21] tw-to-transparent tw-w-full tw-bottom-[-12px]"></div>
        </div>
      </div>
      <!-- 中间 -->
      <FightBox
        ref="FightBoxRef"
        v-if="roomStatus === 1"
        :roundNumber="roundNumber"
        :fightResult="fightResult"
        :currPlayerId="cardData.playerId"
        @scrollEnd="handleScrollEnd" />
      <div class="card-main" v-if="roomStatus === 0">
        <div class="player-status">
          <div class="join-btn" v-if="cardData.status === 0" @click="handleJoin">加入</div>
          <div v-else-if="cardData.status === 1">
            <div class="join-btn" v-if="cardData.playerId === currUserId" @click="handlePrepare">准备</div>
            <p v-else>已入座</p>
          </div>
          <div v-else-if="cardData.status === 2">
            <!-- 当前用户为房主，且所有座位都已准备就绪 -->
            <div class="join-btn" v-if="(roomOwnerId === currUserId) && (currUserId === cardData.playerId) && (roomStatus === 0) && allReady" @click="handleStartGame">开始游戏</div>
            <p v-else>已准备就绪</p>
          </div>
        </div>
      </div>
      <div class="card-main" v-if="roomStatus === 2">
        <div class="player-status">
          <p v-if="winnerIds && winnerIds.includes(cardData.playerId)" class="winner">胜利</p>
          <p v-else class="loser">失败</p>
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
  background-image: var(--bg-card);
  background-color: rgba(50, 50, 50, 0.66);
  background-position: bottom;
  background-repeat: repeat-x;
  border-radius: 12px;
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
    justify-content: center;
    align-items: center;
    .user {
      display: flex;
      justify-content: center;
      align-items: center;
      img.avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        border: 1px solid #f2a814;
        margin-right: 8px;
      }
      .nick-name {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 24px;
        margin-top: 12px;
      }
    }
  }
  .price {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #271201;
    background-color: rgba($color: #ec851e, $alpha: 0.4);
    padding: 0 6px;
    border-radius: 4px;
    margin-left: 8px;
    margin-top: 16px;
    img {
      width: 8px;
      margin-right: 4px;
    }
  }
  .waiting-player {
    width: 100%;
    height: 48px;
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
      color: #f83904;
    }
    .join-btn {
      width: 70px;
      height: 32px;
      line-height: 32px;
      border-radius: 6px;
      font-size: 14px;
      text-align: center;
      background: linear-gradient(90.15deg, #b43304 -4.19%, #FF952A 99.85%);
    }
    .winner {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      font-size: 28px;
    }
    .loser {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      color: #eee;
      font-size: 28px;
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  
}
</style>
