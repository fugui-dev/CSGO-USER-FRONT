<script setup>
import {computed, ref, watch} from "vue";
import {requireImg} from "@/utils/common";
import {joinRoomApi} from "@/api/battle"

const props = defineProps({
  cardData: {
    type: Object,
    required: true
  },
  roomId: {
    type: Number,
    required: true
  }
});

const statusMap = {
  '0': '等待中',
  '1': '进行中',
  '2': '已结束'
}

const handleJoin = () => {
  joinRoomApi({fightId: props.roomId}).then(res => {
    console.log(res.data)
  })
}

</script>
<template>
    <div class="room-card-container" :style="{
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
      <div class="card-main">
        <div class="player-status">
          <div class="join-btn" v-if="cardData.status === 0" @click="handleJoin">加入</div>
          <p v-else-if="cardData.status === 1">已入座</p>
          <p v-else>已准备就绪</p>
        </div>
      </div>
    </div>
</template>

<style scoped lang="scss">
.room-card-container {
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
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  
}
</style>
