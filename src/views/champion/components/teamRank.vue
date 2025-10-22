<template>
  <div class="team-rank-wrapper">
    <template v-if="data.length">
      <div class="header">
        <div>队伍</div>
        <div>胜场</div>
        <div>积分</div>
      </div>
      <div class="content">
        <div
          class="team-rank-item"
          v-for="(item, index) in data"
          :key="item.id"
        >
          <div class="rank tw-flex tw-items-center">
            <div
              class="rank-icon"
              :class="{ 'top3-icon': index <= 2 }"
              :style="{ backgroundImage: `url(${gatRankIcon(index)})` }"
            >
              <span v-if="index > 2">{{ index + 1 }}</span>
            </div>
            <div class="avatar-wrapper">
              <img
                class="avatar"
                :src="item.avatar ? item.avatar : requireImg('/v2/nav/u1.png')"
                alt=""
              />
              <img
                class="avatar-bg"
                src="@/assets/images/battle/avatar-bg.png"
                alt=""
              />
            </div>
            <div class="team-name">{{ item.name }}</div>
          </div>
          <div class="win">{{ item.winCount }}</div>
          <div class="score tw-flex tw-items-center tw-justify-center">
            <img
              src="@/assets/images/champion/game/coin.png"
              alt=""
              class="coin-image"
            />
            {{ item.totalScore }}
          </div>
        </div>
      </div>
    </template>
    <div v-else class="tw-text-white tw-text-center tw-py-10">暂无数据</div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});

import top1 from "@/assets/images/champion/top1.png";
import top2 from "@/assets/images/champion/top2.png";
import top3 from "@/assets/images/champion/top3.png";
import topBg from "@/assets/images/champion/rank-bg.png";
const gatRankIcon = (index) => {
  switch (index) {
    case 0:
      return top1;
    case 1:
      return top2;
    case 2:
      return top3;
    default:
      return topBg;
  }
};
</script>

<style scoped lang="scss">
.team-rank-wrapper {
  width: 1194px;
  background-color: #00000033;
  border-radius: 22px;
  position: relative;
  margin: 18px auto;
  padding: 9px 9px 64px 7px;
  font-family: "PingFang Medium";
  font-weight: 500;
  font-size: 22px;
  color: #ffffff;
  min-height: 300px;
  .header {
    width: 100%;
    height: 72px;
    line-height: 72px;
    text-align: center;
    background: url("@/assets/images/champion/team-rank-header-bg.png")
      no-repeat;
    background-size: 100% 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
  .content {
    width: 1162px;
    margin-left: 7px;
    .team-rank-item {
      height: 87px;
      line-height: 87px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      margin-top: 7px;
      background: rgba(0, 0, 0, 0.25);
      border-radius: 8px;
      & + .team-rank-item {
        margin-top: 10px;
      }
      .rank {
        padding-left: 32px;
        .rank-icon {
          width: 82px;
          height: 78px;
          background-size: 51px 51px;
          background-repeat: no-repeat;
          background-position: center;
          text-align: center;
          line-height: 78px;
          font-size: 30px;
          &.top3-icon {
            background-size: 100% 100%;
          }
        }
        .avatar-wrapper {
          margin-left: 28px;
          width: 79px;
          height: 71px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          .avatar {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            display: block;
          }
          .avatar-bg {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            border-radius: 50%;
            width: 100%;
            height: 100%;
          }
        }
        .team-name {
          font-size: 22px;
          color: #FFFFFF;
          margin-left: 12px;
        }
      }
      .win {
        text-align: center;
      }
      .score {
        .coin-image {
          width: 41px;
          height: 43px;
        }
      }
    }
  }
}
</style>
