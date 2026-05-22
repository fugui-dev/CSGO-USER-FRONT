<script setup>
import Layout from "@/components/Layout.vue";
import { computed, onMounted, ref } from "vue";
import { requireImg } from "@/utils/common";
import { getMatchInfoApi } from "@/api/champion";
import { isNotEmptyObj } from "@/utils/common";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import luckyStar from "@/assets/openBox/luckyStar.png";
import titleYinhua from "@/assets/openBox/titleYinhua.png";
import Countdown from "./components/Countdown.vue";
import WaitCountdown from "./components/WaitCountdown.vue";

const router = useRouter();

const loading = ref(true);
const matchData = ref({});
const targetDate = ref(0);
const isGameOpen = computed(() => isNotEmptyObj(matchData.value));

// 检查是否应该显示比赛内容（包括状态为2但还没到关闭时间的情况）
const shouldShowContent = computed(() => {
  if (!matchData.value || !matchData.value.status) {
    return false;
  }
  
  // 状态为0（未开始）或1（进行中）时显示
  if (matchData.value.status === 0 || matchData.value.status === 1) {
    return true;
  }
  
  // 状态为2（已结束）时，检查是否到了关闭时间
  if (matchData.value.status === 2) {
    if (!matchData.value.closeTime) {
      // 如果没有设置关闭时间，不显示
      return false;
    }
    const now = new Date();
    const closeTime = new Date(matchData.value.closeTime);
    // 如果当前时间还没到关闭时间，显示内容
    return now < closeTime;
  }
  
  return false;
});

// 检查是否可以进入（状态为1，或状态为2但还没到关闭时间）
const canEnter = computed(() => {
  if (!matchData.value || !matchData.value.status) {
    return false;
  }
  
  // 状态为1（进行中）时可以进入
  if (matchData.value.status === 1) {
    return true;
  }
  
  // 状态为2（已结束）时，检查是否到了关闭时间
  if (matchData.value.status === 2) {
    if (!matchData.value.closeTime) {
      return false;
    }
    const now = new Date();
    const closeTime = new Date(matchData.value.closeTime);
    // 如果当前时间还没到关闭时间，可以进入
    return now < closeTime;
  }
  
  return false;
});

const getMatchInfo = () => {
  loading.value = true;
  return getMatchInfoApi()
    .then((res) => {
      console.log('getMatchInfo API 响应:', res);
      if (res.code === 200) {
        matchData.value = res.data;
        targetDate.value = new Date(res.data.signUpStartTime);
        console.log('设置 matchId 到 sessionStorage:', res.data.id);
        window.sessionStorage.setItem("matchId", res.data.id);
        console.log('sessionStorage 中的 matchId:', window.sessionStorage.getItem("matchId"));
        return res.data;
      } else {
        console.log('API 返回错误:', res.msg);
        throw new Error(res.msg || '获取比赛信息失败');
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleStopCountdown = () => {
  getMatchInfo();
};

const handleEnter = () => {
  // 确保 matchId 已经设置
  const currentMatchId = window.sessionStorage.getItem("matchId");
  console.log('点击进入按钮，当前 matchId:', currentMatchId);
  
  if (!currentMatchId || currentMatchId === '0') {
    console.log('matchId 未设置或为0，重新获取比赛信息');
    getMatchInfo().then(() => {
      const newMatchId = window.sessionStorage.getItem("matchId");
      console.log('重新获取后的 matchId:', newMatchId);
      if (newMatchId && newMatchId !== '0') {
        router.push("/detail");
      } else {
        ElMessage.error("比赛信息获取失败，请刷新页面重试");
      }
    });
  } else {
    router.push("/detail");
  }
};

const goToIntroduction = () => {
  router.push("/champion-intro");
};

onMounted(() => {
  getMatchInfo();
});
</script>

<template>
  <Layout>
    <div class="match-container" v-loading="loading">
      <template v-if="isGameOpen">
        <!-- 倒计时 -->
        <WaitCountdown
          v-if="matchData.status === 0"
          :target-time="targetDate"
          :show-status="false"
          @finish="handleStopCountdown"
        />
        <div
          class="match-content"
          :style="{ marginTop: matchData.status === 0 ? '-9.5vw' : '10vw' }"
          v-if="shouldShowContent"
        >
          <div class="matching tw-flex">
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
                  <div class="tw-flex tw-mr-[8px]">最多<div class="num">{{ matchData.maxTeamNum }}</div>队</div>
                  <div class="tw-flex">每队<div class="num">{{ matchData.teamSize }}</div>人</div>
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
              <div class="button-group">
                <div
                  v-if="canEnter"
                  @click="handleEnter"
                  class="enter-btn"
                >
                  进入
                </div>
                <div
                  @click="goToIntroduction"
                  class="intro-btn"
                >
                  玩法介绍
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;
.match-container {
  width: 100%;
  padding-top: 68px;
  padding-bottom: 300px;
  background: url("@/assets/images/champion/bg.webp") no-repeat;
  background-size: 100% auto;
  min-height: 100vh;
  font-family: "PingFang Medium";
  font-weight: 500;
  @include mobile {
    background-size: 100% 100%;
  }
  .match-content {
    .matching {
      margin: 0 auto;
      padding: 16px;
      width: 1162px;
      height: 286px;
      background: url("@/assets/images/champion/item-bg.png") no-repeat;
      background-size: 100% 100%;
      @include mobile {
        width: 90%;
        height: auto;
      }
      .left {
        width: 223px;
        height: 253px;
        background: url("@/assets/images/champion/item-left-bg.png") no-repeat;
        background-size: 100% 100%;
        @include mobile {
          width: 20vw;
          height: 20vw;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .image {
          width: 153px;
          height: 198px;
          margin-top: 33px;
          margin-left: 35px;
          @include mobile {
            width: 15vw;
            height: 18vw;
            margin-top: 0;
            margin-left: 0;
          }
        }
      }
      .right {
        margin-left: 38px;
        font-size: 20px;
        @include mobile {
          margin-left: 10px;
          font-size: 13px;
        }
        .title {
          margin-top: 10px;
          font-size: 30px;
          color: #ffffff;
          @include mobile {
            font-size: 18px;
            flex-direction: column;
          }
          .num-wrapper {
            font-size: 22px;
            line-height: 37px;
            @include mobile {
              font-size: 14px;
              line-height: 22px;
            }
            .num {
              margin: 0 8px;
              text-align: center;
              width: 37px;
              height: 37px;
              background: #cf9627;
              border-radius: 50%;
              @include mobile {
                width: 22px;
                height: 22px;
              }
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
            @include mobile {
              width: 90px;
              height: 30px;
              line-height: 30px;
              font-size: 14px;
            }
            .fee-image {
              width: 41px;
              height: 43px;
              margin-top: -3px;
              margin-left: -3px;
              display: inline-block;
              @include mobile {
                width: 30px;
                height: 30px;
              }
            }
          }
        }
        .button-group {
          display: flex;
          gap: 20px;
          justify-content: flex-end;
          margin-top: 20px;
          @include mobile {
            gap: 10px;
          }
        }
        
        .enter-btn {
          text-align: center;
          width: 140px;
          height: 50px;
          line-height: 50px;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 107, 53, 0.3);
          border-radius: 25px;
          font-weight: 500;
          font-size: 18px;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;

          @include mobile {
            width: 90px;
            height: 30px;
            line-height: 26px;
            border-radius: 15px;
            font-size: 14px;
          }
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
          }
        }
        
        .intro-btn {
          text-align: center;
          width: 140px;
          height: 50px;
          line-height: 50px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          font-weight: 500;
          font-size: 18px;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s ease;

          @include mobile {
            width: 90px;
            height: 30px;
            line-height: 26px;
            border-radius: 15px;
            font-size: 14px;
          }
          
          &:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
          }
        }
      }
    }
  }
}
</style>
