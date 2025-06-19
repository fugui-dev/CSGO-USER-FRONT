<script setup>
import {computed, ref, onMounted} from 'vue'
import {requireImg} from '@/utils/common'
import RollingShow from "@/components/RollingShow.vue";

const topRef = ref()
const maskWidth = ref(183)

const setMaskWidth = () => {
  let windowWidth = window.innerWidth;
  if (windowWidth < 1260) {
    maskWidth.value = 183
  } else {
    maskWidth.value = (windowWidth - 1280) / 2 + 183
  }
}

onMounted(() => {
  setMaskWidth()
})

window.onresize = () => {
  setMaskWidth()
}
</script>
<template>
  <img class="bgb" :src="requireImg('/v2/home/bgb.png')" alt="">
  <div class="tw-absolute tw-h-[100vh] tw-w-[100vw] tw-z-[-1]" >
    <div class="tw-relative tw-flex tw-flex-col tw-items-end" style="background: linear-gradient(180deg, rgb(33, 15, 11) 90%, rgba(255, 255, 255, 0) 100%);">
      <div class="top tw-relative" ref="topRef">
        <video id="bgVideo" muted loop playsinline autoplay>
          <source :src="requireImg('/v2/v.mp4')" type="video/mp4">
        </video>
        <div class="mask" :style="{ width: maskWidth + 'px' }"></div>
        <div class="mask2"></div>
      </div>

    </div>

  </div>
</template>
<style lang="scss" scoped>
@use "@/style" as *;

.bgb {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: -10;
}

#bgVideo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 100%;
  /* x轴居中 | y轴底部 */
  -webkit-object-position: 50% 100%;
  /* Safari兼容 */
  z-index: -1;
  position: relative;
}

.top {
  width: 100%;
  height: 550px;
  z-index: -1;
  left: 0;
  top: -20px;
  opacity: .5;
  background: #f7ba2a;
  @include mobile {
    height: 400px;
  }

  .mask {
    position: absolute;
    content: "";
    left: 0;
    top: 0;
    height: 550px;
    background: linear-gradient(90deg, rgb(33, 15, 11) 60%, rgba(255, 255, 255, 0) 100%);

    @include mobile {
      display: none;
    }
  }

  .mask2 {
    position: absolute;
    content: "";
    right: 0;
    bottom: 0;
    height: 200px;
    width: 100%;
    background: linear-gradient(0deg, rgb(33, 15, 11) 50%, rgba(255, 255, 255, 0) 100%);
    @include mobile {
      height: 300px;
    }

  }
}
</style>
