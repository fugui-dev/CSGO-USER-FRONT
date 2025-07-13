<script setup>
import Layout from "@/components/Layout.vue";
import {onMounted, ref, computed} from "vue";
import {getBattleBoxListApi, getBattleBoxDetailApi, getBattleRankingApi, getMyOwnFightListApi} from "@/api/battle";
import {goto, requireImg} from "@/utils/common";
import {useStore} from "@/store";
import RoomCard from './components/RoomCard.vue'

const modelMap = {
  '0': '欧皇模式',
  '1': '非酋模式'
}
const statusMap = {
  '0': '等待中',
  '1': '进行中',
  '2': '已结束'
}

const store = useStore()
const currentRound = ref(1)

const roomData = computed(() => store.battleRoomData )
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
  const boxDataMap = roomData.value.boxDataMap
  for (const key in boxDataMap) {
    if (boxDataMap.hasOwnProperty(key)) {
      const num = boxDataMap[key].number;
      if (typeof num === 'number' && num >= 1) {
        for (let i = 0; i < num; i++) {
          arr.push(boxDataMap[key]);
        }
      }
    }
  }
  return arr
})

const handleClickBack = () => {
  goto('/battle')
}

const createWs = () => {
  const userId = roomData.value.userId;
  const fightId = roomData.value.id;
  if (userId && fightId) {
    // const ws = new WebSocket(`ws://121.229.204.223:8090/ws/fight/room/${userId}/${fightId}`);
    // ws.addEventListener('open', ()=> {
    //     alert('已连接服务器')
    // })
  }
}

onMounted(() => {
  createWs()
})

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
            <div>111</div>
          </div>
          <div class="room-banner-center">
            <div class="round-num">
              <div class="round-num-bg rotate1"></div>
              <div class="round-num-bg rotate2"></div>
              <div class="round-num-bg rotate3"></div>
              <h3>{{ currentRound }} / {{ roomData.roundNumber }}</h3>
            </div>
            <div class="room-model">{{ modelMap[roomData.model] }}</div>
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
          <RoomCard :cardData="i" :roomId="roomData.id" v-for="(i,index) in roomData.seatList" :key="index" class="card-item" />
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
