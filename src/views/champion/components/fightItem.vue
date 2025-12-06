<script setup>
import { requireImg } from "@/utils/common";
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  bgColor: {
    type: String,
    default: "rgba(18, 56, 72, 0.58)",
  },
});
</script>
<template>
  <div
    class="level-item tw-flex tw-flex-col tw-items-center"
    :style="{ backgroundColor: bgColor }"
  >
    <div class="alias">{{ data.aliasName }}</div>
    <div class="avatar-wrapper">
      <img
        class="avatar"
        :src="data.teamAvatar ? data.teamAvatar : requireImg('/v2/nav/u1.png')"
        alt=""
      />
      <img
        class="avatar-bg"
        src="@/assets/images/battle/avatar-bg.png"
        alt=""
      />
    </div>
    <div class="team-name">{{ data.teamName }}</div>
    <div class="score-section">
      <div class="score tw-flex tw-items-center tw-justify-center">
        <img
          src="@/assets/images/champion/game/money.png"
          alt=""
          class="coin-image"
        />
        {{ score }}
      </div>
      <div class="initial-score" v-if="data.initialScore">
        <img
          src="@/assets/images/champion/game/coin.png"
          alt=""
          class="coin-icon"
        />
        <span class="label">助威:</span>
        <span class="value">{{ data.initialScore }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;
.level-item {
  width: 158px;
  height: 252px;
  border-radius: 6px;
  font-family: "PingFang Medium";
  font-weight: 500;
  font-size: 22px;
  color: #d4c7af;
  line-height: normal;
  @include mobile {
    width: 120px;
    height: 180px;
  }
  .alias {
    margin-top: 10px;
    font-size: 24px;
    @include mobile {
      font-size: 13px;
      margin-top: 6px;
    }
  }
  .avatar-wrapper {
    margin-top: 22px;
    width: 74px;
    height: 67px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    @include mobile {
      width: 60px;
      height: 54px;
      margin-top: 4px;
    }
    .avatar {
      width: 51px;
      height: 51px;
      border-radius: 50%;
      display: block;
      @include mobile {
        width: 36px;
        height: 36px;
      }
    }
    .avatar-bg {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  .team-name {
    margin-top: 12px;
    @include mobile {
      margin-top: 4px;
      font-size: 13px;
    }
  }
  .score-section {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    @include mobile {
      margin-top: 4px;
    }
    
    .score {
      @include mobile {
        font-size: 14px;
      }
      .coin-image {
        width: 31px;
        height: 33px;
        margin-right: 5px;
        @include mobile {
          width: 25px;
          height: 26px;
        }
      }
    }
    
    .initial-score {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #ffd700;
      
      .coin-icon {
        width: 14px;
        height: 14px;
        margin-right: 4px;
      }
      
      .label {
        color: #cccccc;
        margin-right: 4px;
      }
      
      .value {
        color: #ffd700;
        font-weight: bold;
      }
    }
  }
}
</style>
