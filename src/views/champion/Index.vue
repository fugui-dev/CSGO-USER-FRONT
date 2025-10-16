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
          v-if="matchData.status === 0 || matchData.status === 1"
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
                v-if="matchData.status === 1"
                @click="handleEnter"
                class="enter-btn"
              >
                进入
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
  .match-content {
    .matching {
      margin: 0 auto;
      padding: 16px;
      width: 1162px;
      height: 286px;
      background: url("@/assets/images/champion/item-bg.png") no-repeat;
      background-size: 100% 100%;
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
  }
}
</style>
