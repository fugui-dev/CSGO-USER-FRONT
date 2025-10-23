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
      <div class="history-list" v-if="historyMatchList.length">
        <div class="match-card" v-for="matchData in historyMatchList" :key="matchData.id">
          <div class="left">
            <img
              src="@/assets/images/champion/item-left-icon.png"
              alt=""
              class="image"
            />
          </div>
          <div class="right tw-flex-1">
            <div class="title tw-flex tw-items-center tw-justify-between">
              <div>{{ matchData.name }}</div>
              <div class="num-wrapper tw-flex tw-items-center">
                最多
                <div class="num">{{ matchData.maxTeamNum }}</div>
                队 每队
                <div class="num">{{ matchData.teamSize }}</div>
                人
              </div>
            </div>
            <div class="time">
              活动时间：{{ matchData.startTime }}-{{ matchData.endTime }}
            </div>
            <div class="time">
              报名时间：{{ matchData.signUpStartTime }} -
              {{ matchData.signUpEndTime }}
            </div>
            <div class="fee tw-flex tw-items-center">
              报名费用：
              <div class="fee-num">
                <img
                  src="@/assets/images/champion/game/coin.png"
                  alt=""
                  class="fee-image"
                />
                {{ matchData.amount }}
              </div>
            </div>
            <div
              @click="handleEnter(matchData.id)"
              class="enter-btn"
            >
              查看
            </div>
          </div>
        </div>
      </div>
      <div class="empty-box" v-else>
        <p>暂无往期记录</p>
      </div>
    </div>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.history-container {
  width: 100%;
  padding-top: 68px;
  padding-bottom: 300px;
  background: url("@/assets/images/champion/bg.webp") no-repeat;
  background-size: 100% auto;
  min-height: 100vh;
  font-family: "PingFang Medium";
  font-weight: 500;
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .match-card {
    margin: 0 auto;
    padding: 16px;
    width: 1162px;
    height: 286px;
    background: url("@/assets/images/champion/item-bg.png") no-repeat;
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    
    .left {
      width: 223px;
      height: 253px;
      background: url("@/assets/images/champion/item-left-bg.png") no-repeat;
      background-size: 100% 100%;
      .image {
        width: 153px;
        height: 198px;
        margin-top: 33px;
        margin-left: 35px;
      }
    }
    .right {
      margin-left: 38px;
      font-size: 20px;
      .title {
        margin-top: 10px;
        font-size: 30px;
        color: #ffffff;
        .num-wrapper {
          font-size: 22px;
          line-height: 37px;
          .num {
            margin: 0 8px;
            text-align: center;
            width: 37px;
            height: 37px;
            background: #cf9627;
            border-radius: 50%;
          }
        }
      }
      .time {
        margin-top: 13px;
        & + .time {
          margin-top: 10px;
        }
      }
      .fee {
        margin-top: 13px;
        .fee-num {
          width: 120px;
          height: 36px;
          line-height: 36px;
          background: url("@/assets/images/champion/fee-bg.png") no-repeat;
          background-size: 100% 100%;
          font-size: 20px;
          .fee-image {
            width: 41px;
            height: 43px;
            margin-top: -3px;
            margin-left: -3px;
            display: inline-block;
          }
        }
      }
      .enter-btn {
        text-align: center;
        position: relative;
        float: right;
        right: -4px;
        width: 302px;
        height: 81px;
        line-height: 70px;
        background: url("@/assets/images/recharge/qrcode.png") no-repeat;
        background-size: 100% 100%;
        font-weight: 500;
        font-size: 24px;
        color: #072523;
        cursor: pointer;
        border: 0;
      }
    }
  }
  
  .empty-box {
    text-align: center;
    padding: 60px 20px;
    color: #aaaaaa;
    font-size: 18px;
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .history-container {
    .match-card {
      width: 90%;
      height: auto;
      flex-direction: column;
      text-align: center;
      
      .left {
        width: 100%;
        height: auto;
        background: none;
        
        .image {
          width: 100px;
          height: 100px;
          margin: 20px auto;
        }
      }
      
      .right {
        margin-left: 0;
        
        .title {
          font-size: 24px;
        }
        
        .enter-btn {
          width: 200px;
          height: 60px;
          line-height: 50px;
          font-size: 20px;
          margin: 20px auto;
          float: none;
        }
      }
    }
  }
}
</style>
