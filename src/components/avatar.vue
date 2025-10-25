<template>
  <div class="avatar-wrapper" :style="{ width: width + 'px', height: width + 'px' }">
    <img
        class="avatar"
        :src="src"
        :style="{ width: inWidth + 'px', height: inWidth + 'px' }"
        alt=""
      />
      <img
        class="avatar-bg"
        :src="bg"
        alt=""
      />
  </div>
</template>

<script setup>
import { requireImg } from "@/utils/common";
import defaultBg from '@/assets/images/champion/avatar-rank-bg.png';
const props = defineProps({
  src: {
    type: String,
    default: requireImg('/v2/nav/u1.png')
  },
  bg: {
    type: String,
    default: defaultBg
  },
  width: {
    type: Number,
    default: 74
  },
  inWidth: {
    type: Number,
    default: 51
  }
});
</script>

<style scoped lang="scss">
.avatar-wrapper {
  width: 74px;
  height: 66px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  .avatar {
    width: 51px;
    height: 51px;
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
    z-index: -1;
  }
}
</style>
