<script setup>
import Layout from "@/components/Layout.vue";
import {computed, onMounted, ref} from "vue";
import {requireImg} from "@/utils/common";
import {getMatchInfoApi} from "@/api/champion";
import {isNotEmptyObj} from "@/utils/common";
import {ElMessage} from "element-plus";
import {useRouter} from 'vue-router';
import luckyStar from '@/assets/openBox/luckyStar.png'
import titleYinhua from '@/assets/openBox/titleYinhua.png'
import Countdown from "./components/Countdown.vue";

const router = useRouter()

const loading = ref(true)
const matchData = ref({})
const targetDate = ref(0)
const isGameOpen = computed(() => isNotEmptyObj(matchData.value))

const getMatchInfo = () => {
  loading.value = true
  getMatchInfoApi().then(res => {
    if (res.code === 200) {
      matchData.value = res.data
      targetDate.value = new Date(res.data.signUpStartTime)
      window.sessionStorage.setItem('matchId', res.data.id)
    }
  }).finally(() => {
    loading.value = false
  })
}

const handleStopCountdown = () => {
  getMatchInfo()
}

const handleEnter = () => {
  router.push('/detail')
}

onMounted(() => {
  getMatchInfo()
})

</script>

<template>
  <Layout :style="{
      '--bg-battle':requireImg('/bg/bg-login-pc.png',true),
      '--bg-create-room': requireImg('/home/1.png',true),
      '--bg-create-room-btn': requireImg('/center/bg-btn.png',true),
    }">
    <template #item>
      <div class="bg bg-battle"></div>
      <div class="match-container" v-loading="loading" v-if="isGameOpen">
        <!-- 倒计时 -->
        <Countdown
          v-if="matchData.status === 0"
          :target-time="targetDate"
          :show-status="false"
          @stop="handleStopCountdown"
        />
        <div class="matching" v-if="matchData.status === 0 || matchData.status === 1">
          <!-- 已开始房间才能进入 -->
          <button class="enter-btn" v-if="matchData.status === 1" @click="handleEnter">进入</button>
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
    </template>
  </Layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.bg-battle {
  background-image: var(--bg-battle);
}
.match-container {
  width: 96%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1024px;
  margin: 6px auto;
  box-sizing: border-box;
  min-height: 60vh;

  .matching {
    background: url('@/assets/openBox/headerBg.png') no-repeat;
    background-size: 100% 92%;
    background-position: right bottom;
    display: flex;
    width: 92%;
    position: relative;
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

/* 响应式调整 */
@media (max-width: 768px) {
  .match-container {
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
