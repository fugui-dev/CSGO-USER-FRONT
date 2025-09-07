<script setup>
import {computed, onMounted, ref} from "vue";
import {getHistoryMatchListApi} from "@/api/champion";
import {requireImg} from "@/utils/common";
import Detail from './Detail.vue';
import luckyStar from '@/assets/openBox/luckyStar.png'
import titleYinhua from '@/assets/openBox/titleYinhua.png'
import {useRouter} from 'vue-router';

const loading = ref(false)
const historyMatchList = ref([])
const router = useRouter()

// 获取往期比赛列表
const getHistoryMatchList = () => {
  loading.value = true
  getHistoryMatchListApi().then(res => {
    if (res.data && res.data.length) {
      historyMatchList.value = res.data
    }
  }).finally(() => {
    loading.value = false
  })
}

const handleEnter = (id) => {
  window.sessionStorage.setItem('historyMatchId', id)
  router.push('/match-history-detail')
}

onMounted(() => {
  getHistoryMatchList()
})

</script>

<template>
  <Detail>
    <div class="history-container" v-loading="loading">
      <div class="history-list">
        <div class="matching" v-for="matchData in historyMatchList" :key="matchData.id">
          <button class="enter-btn" @click="handleEnter(matchData.id)">查看</button>
          <img :src="requireImg('/center/bg-item.png')" alt="" class="match-logo">
          <div class="matching-content">
            <div class="match-name">
              <img :src="titleYinhua" alt="">
              <div>{{ matchData.name }}</div>
            </div>
            <div class="match-desc">{{ matchData.description }}</div>
            <div class="time">
              <img :src="luckyStar" alt="">
              <div class="label">活动时间</div>
              <div class="match-time">{{ matchData.startTime }} - {{ matchData.endTime }}</div>
            </div>
            <div class="time">
              <img :src="luckyStar" alt="">
              <div class="label">报名时间</div>
              <div class="match-signup-time">{{ matchData.signUpStartTime }} - {{ matchData.signUpEndTime }}</div>
            </div>
            <div class="match-price">
              <img :src="luckyStar" alt="" class="star">
              <div class="label">报名费用</div>
              <img :src="requireImg('/coin1.png',false)" alt="" id="price-img">
              <div>{{ matchData.amount }}</div>
            </div>
            <div class="team-scale">
              <div class="max-team-num">最多<span>{{ matchData.maxTeamNum }}</span>队</div>
              <div class="team-size">每队<span>{{ matchData.teamSize }}</span>人</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.history-container {
  .matching {
    background: url('@/assets/openBox/headerBg.png') no-repeat;
    background-size: 100% 92%;
    background-position: right bottom;
    display: flex;
    width: 92%;
    position: relative;
    margin: 0 auto;
    margin-top: 50px;
    transform: translateX(10px);
    .enter-btn {
      position: absolute;
      z-index: 2;
      right: 50px;
      top: 20%;
      background-color: #7d2fb1;
      border-radius: 8px;
      padding: 4px 45px;
      font-size: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      box-shadow: 3px 4px 12px rgba(95, 95, 88, 0.8);
    }
    .match-logo {
      width: 180px;
      height: 180px;
      transform: translate(-30%, 25%);
    }
    .matching-content {
      flex: 1;
      transform: translate(-5%, -10%);
      .match-name {
        display: flex;
        align-items: center;
        transform: translateX(-13%);
        img {
          width: 30px;
          transform: translateY(12%);
          margin-right: 10px;
        }
        div {
          font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
          font-size: 36px;
          text-shadow:  0px 0px 10px rgb(247, 219, 77);
        }
      }
      .match-desc {
        font-size: 14px;
        color: #eee;
        margin: 10px 0;
      }
      .time {
        display: flex;
        font-size: 16px;
        img {
          width: 22px;
          height: 22px;
          transform: translateY(10%);
          margin-right: 4px;
        }
      }
      .label {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        margin-right: 12px;
      }
      .match-time, .match-signup-time {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        text-shadow:  0px 0px 4px rgb(247, 219, 77);
      }
      .match-price {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 16px;
        display: flex;
        align-items: center;
        img {
          width: 10px;
          height: 16px;
          margin-right: 5px;
        }
        .star {
          width: 22px;
          height: 22px;
          transform: translateY(10%);
          margin-right: 4px;
        }
      }
      .team-scale {
        display: flex;
        justify-content: flex-end;
        .max-team-num, .team-size {
          font-size: 16px;
          font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
          margin-right: 10px;
          span {
            display: inline-block;
            background-color: #7d2fb1;
            width: 28px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            font-size: 14px;
            border-radius: 50%;
            margin: 0 4px;
            text-shadow:  0px 0px 10px rgb(247, 219, 77);
          }
        }
      }
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .history-container {
    .matching {
      .match-logo {
        width: 80px;
        height: 80px;
      }
      .match-name {
        div {
          font-size: 26px !important;
        }
      }
      .enter-btn {
        right: 10px !important;
        top: 8% !important;
        padding: 3px 25px !important;
      }
    }
  }
}
</style>
