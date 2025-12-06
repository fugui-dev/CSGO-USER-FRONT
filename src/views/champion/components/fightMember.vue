<script setup>
import { requireImg } from "@/utils/common";
const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});
</script>
<template>
  <div class="member tw-flex tw-flex-col tw-items-center">
    <div class="avatar-wrapper">
      <img
        class="avatar"
        :class="data.isCurrent ? 'highLight' : ''"
        :src="data.avatar ? data.avatar : requireImg('/v2/nav/u1.png')"
        alt=""
      />
      <img
        class="avatar-bg"
        src="@/assets/images/battle/avatar-bg.png"
        alt=""
      />
    </div>
    <div class="member-name">{{ data.name }}</div>
    <div class="data tw-flex tw-items-center">
      <img src="@/assets/images/champion/game/coin.png" alt="" class="image" />
      {{ data.rate }}
    </div>
    <div class="data tw-flex tw-items-center">
      <img src="@/assets/images/champion/game/money.png" alt="" class="image" />
      {{ data.score }}
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;
.member {
  width: 133px;
  font-family: "PingFang Medium";
  font-weight: 500;
  font-size: 18px;
  color: #ffffff;
  line-height: normal;
  @include mobile {
    width: 100%;
    font-size: 12px;
  }
  .avatar-wrapper {
    margin-top: 15px;
    width: 74px;
    height: 66px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    @include mobile {
      width: 48px;
      height: 44px;
    }
    .avatar {
      width: 51px;
      height: 51px;
      border-radius: 50%;
      display: block;
      @include mobile {
        width: 30px;
        height: 30px;
      }
      &.highLight {
        animation: smooth 2s infinite;
      }
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
  .member-name {
    text-align: center;
    width: 130px;
    height: 27px;
    line-height: 25px;
    background: #564b39;
    border-radius: 6px;
    border: 2px solid #c89063;
    @include mobile {
      white-space: nowrap; /* 防止文本换行 */
      overflow: hidden; /* 隐藏溢出的内容 */
      text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
      max-width: 60px;
    }
  }
  .data {
    margin-top: 8px;
    font-size: 18px;
    color: #564b39;
    width: 100%;
    @include mobile {
      font-size: 12px;
      margin-top: 3px;
    }
    .image {
      width: 31px;
      height: 33px;
      margin-right: 6px;
      @include mobile {
        width: 18px;
        height: 19px;
        margin-right: 4px;
      }
    }
  }
}
@keyframes smooth {
  0% {
    box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.6);
  }

  50% {
    box-shadow: 0px 0px 30px rgba(255, 255, 255, 0.6);
  }

  100% {
    box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.6);
  }
}
</style>
