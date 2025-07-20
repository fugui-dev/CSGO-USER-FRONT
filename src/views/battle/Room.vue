<script setup>
import Layout from "@/components/Layout.vue";
import {ref, computed, reactive, onBeforeMount} from "vue";
import {goto, requireImg, deepClone} from "@/utils/common";
import {getHistoryDetailApi, saveFightBoutApi, endFightApi} from "@/api/battle";
import { useRoute } from 'vue-router';
import { useStore } from "@/store";
import RoomCard from './components/RoomCard.vue'
import OpenModal from './components/OpenModal.vue'
import CountdownModal from './components/CountdownModal.vue'

const modelMap = {
  '0': '欧皇模式',
  '1': '非酋模式'
}
const statusMap = {
  '0': '等待中',
  '1': '进行中',
  '2': '已结束'
}

const route = useRoute()
const store = useStore()
const currRound = ref(1)
const roomData = ref({})
const ws = ref(null)
const fightBoxVOList = ref([])
const isAllReady = ref(false) // 是否所有座位都已准备就绪
const OpenModalRef = ref(null)
const CountdownModalRef = ref(null)
const winnerIds = ref([])

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

const handleClickBack = () => {
  goto('/battle')
}

const showBeginAnimation = () => {
  CountdownModalRef.value.open()
}

const calcFightResult = () => {

}

const reCalcBoxList = (fightResult) => {
  const userId = fightResult[0].userId
  const onePersonFightResult = fightResult.filter(item => item.userId === userId)
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

const closeWs = () => {
  ws.value.close()
  console.log('ws已关闭')
}

const createWs = () => {
  const userId = store.userInfo.userId;
  const fightId = route.params.id;
  if (!userId || !fightId) return

  ws.value = new WebSocket(`ws://121.229.204.223:8090/ws/fight/room/${userId}/${fightId}`);
  ws.value.addEventListener('open', ()=> {
      console.log('已连接服务器')
  })
  ws.value.addEventListener('message', (res)=> {
    const data = JSON.parse(res.data)
    console.log(data)
    if (data.code === 200 && data.data) {
      roomData.value = data.data.fight
      fightBoxVOList.value = data.data.fightBoxVOList
      winnerIds.value = data.data.winnerIds
      // 检查是否所有座位都已准备就绪
      isAllReady.value = data.data.fight.seatList.every(seat => seat.status === 2)
      
      const currentRound = data.data.currentRound
      const fightResult = data.data.fightResult
      // 有对战结果说明2种情况：（1）游戏开始（2）对战进行中，有人进入观战，此时currentRound有值
      if (Array.isArray(fightResult) && fightResult.length > 0) {
        reCalcBoxList(fightResult)
        if (!currentRound) {
          // 非房主，游戏现在开始
          if (userId !== data.data.fight.userId) {
            showBeginAnimation()
          }
        }
      }
      
      if (!currentRound) return
      if (currentRound < 0) {
        currRound.value = data.data.fight.roundNumber
        // 对战已结束
        closeWs()
        return
      } else {
        // 对战进行中（有人进入观战）
        currRound.value = currentRound
      }
    }
  })
}

// 获取历史对战信息
const getFinishedData = () => {
  const fightId = route.params.id;
  getHistoryDetailApi({ fightId }).then(res => {
    roomData.value = res.data.fight
    fightBoxVOList.value = res.data.fightBoxVOList
    winnerIds.value = res.data.winnerIds
    const fightResult = res.data.fightResult
    if (Array.isArray(fightResult) && fightResult.length > 0) {
      reCalcBoxList(fightResult)
    }
  })
}

// 开始倒计时
const handleStartCountdown = () => {
  isAllReady.value = false
  showBeginAnimation()
}

// 开始游戏
const handleStartGame = () => {
  
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

const localSet = reactive({
  music: true
})
const handleOpen = () => {
  OpenModalRef.value.open()
}
const handleModalClose = () => {
}

const test = () => {
  const fightId = route.params.id;
  // 存储当前回合数据
  saveFightBoutApi({
    fightId: fightId,
    boutNum: currRound.value
  }).then(res => {
    if (res.code === 200) {
      if (currRound.value < roomData.value.roundNumber) {
        currRound.value++
      } else {
        // 结束游戏
        endFightApi({ fightId }).then(res => {
          if (res.code === 200) {
            roomData.value = res.data.fight
            fightBoxVOList.value = res.data.fightBoxVOList
            winnerIds.value = res.data.winnerIds
            const fightResult = res.data.fightResult
            if (Array.isArray(fightResult) && fightResult.length > 0) {
              reCalcBoxList(fightResult)
            }
            closeWs()
            alert('游戏结束')
          }
        })
      }
    }
  })
}

</script>

<template>
  <Layout :style="{
      '--bg-room':requireImg('/v2/bg/openBg.png',true),
      '--bg-round-num':requireImg('/v2/smelt/jg-bg.png',true),
    }">
    <template #item>
      <div class="bg bg-room"></div>
      <div class="room-container">
        <!-- banner -->
        <div class="room-banner">
          <!-- 顶部 -->
          <div class="room-banner-top">
            <div class="back">
              <img :src="requireImg('/v2/roll/room/back.png')" alt="" @click="handleClickBack">
              返回
            </div>
            <div class="room-status" :style="{ backgroundColor: statusColor }">{{ statusMap[roomData.status] }}</div>
            <div @click="handleOpen">111</div>
          </div>
          <div class="room-banner-center">
            <div class="round-num">
              <div class="round-num-bg rotate1"></div>
              <div class="round-num-bg rotate2"></div>
              <div class="round-num-bg rotate3"></div>
              <h3>{{ currRound }} / {{ roomData.roundNumber }}</h3>
            </div>
            <div class="room-model">{{ modelMap[roomData.model] }}</div>
            <button @click="test">试试</button>
            <!-- 总金额 -->
            <div class="total-price">
              <img :src="requireImg('/coin1.png',false)" alt="">
              <div>{{ roomData.boxPriceTotal }}</div>
            </div>
          </div>
          <div class="box-list">
            <div class="box-item" v-for="item in boxList" :key="item.boxId">
              <div class="bx">
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
            :cardData="i" 
            :roomId="roomData.id" 
            :roomOwnerId="roomData.userId"
            :isAllReady="isAllReady"
            :roomStatus="roomData.status"
            :winnerIds="winnerIds"
            :currOrnaments="boxList[currRound-1].ornaments"
            v-for="(i,index) in roomData.seatList" 
            :key="index" 
            class="card-item"
            @start="handleStartCountdown" />
        </div>
      </div>
    </template>
  </Layout>
  <!-- <OpenModal ref="OpenModalRef" :openData="[]" :boxData="[]" :curindex="1" :localSet="localSet"
    @close="handleModalClose" @openAgain="handleOpen" /> -->
  <CountdownModal ref="CountdownModalRef" @close="handleStartGame" />
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
