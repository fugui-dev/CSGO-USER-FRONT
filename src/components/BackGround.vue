<script setup>
import { requireImg } from "@/utils/common";
import { computed, ref, onMounted } from "vue";
import { useStore } from "@/store";
import upgradeBg from '@/assets/images/upgrade/bg.png';
import userBg from '@/assets/images/roll/bg.png';
import userStorageBg from '@/assets/images/user/storage_bg.png';
import smeltBg from '@/assets/images/smelt/bg.png';
import luckyBg from '@/assets/images/upgrade/lucky_bg.webp';
import homeBg from '@/assets/images/home/bg.png';

const props = defineProps({
  path: {
    type: String,
    required: true,
  },
  showBox: {
    type: Boolean,
    default: false,
  },
});
const store = useStore();
const BackgroundImg = computed(() => {
  if (props.path.startsWith("/openBox")) {
    return requireImg("/v2/bg/openBg.png");
  }
  if (props.path.startsWith("/upgrade/open")) {
    return upgradeBg;
  }
  if (props.path.startsWith("/upgrade")) {
    return luckyBg;
  }
  if (props.path.startsWith("/smelt")) {
    return smeltBg;
  }
  if (props.path.startsWith("/user/base") || props.path.startsWith("/user/promote")) {
    return userBg;
  }
  if (props.path.startsWith("/user/inventory") || props.path.startsWith("/user/record") || props.path.startsWith("/user/log") || props.path.startsWith("/user/mail") || props.path.startsWith("/user/benefits")) {
    return userStorageBg;
  }
  if (props.path === "/user-agreement" || props.path === "/privacy-agreement" || props.path === "/faq" || props.path === "/about-us" || props.path === "/probability-fairness" || props.path === "/anti-money-laundering" || props.path === "/decomposition-notice") {
    return luckyBg;
  }

  return "";
});
</script>
<template>
  <img
    :src="BackgroundImg"
    class="tw-absolute tw-h-[100vh] md:tw-block tw-hidden tw-w-[100vw] tw-z-[-1]"
    v-if="BackgroundImg"
    loading="eager"
    decoding="async"
  />
  <img
    :src="BackgroundImg"
    class="tw-absolute md:tw-block tw-hidden tw-w-[100vw] tw-z-[-1]"
    :class="{'tw-h-auto tw-min-h-[100vh]': path === '/user-agreement'}"
    v-if="path.startsWith('/upgrade/open') || path === '/upgrade' || path.startsWith('/user') || path.startsWith('/smelt') || path === '/user-agreement' || path === '/privacy-agreement' || path === '/faq' || path === '/about-us' || path === '/probability-fairness' || path === '/anti-money-laundering' || path === '/decomposition-notice'"
    loading="eager"
    decoding="async"
  />
  <div
    class="tw-absolute tw-h-[100vh] tw-w-[100vw] tw-overflow-hidden tw-z-[-1] md:tw-hidden"
    :class="{
      'tw-pt-[3rem]': props.showBox,
      'tw-pt-[5.625rem]': !props.showBox,
    }"
  >
    <div
      class="tw-w-[58.3125rem] tw-h-[29.1875rem] tw-relative tw-left-1/2 -tw-translate-x-1/2"
    >
      <img
        :src="BackgroundImg"
        class="tw-w-full tw-h-full mobile-match"
        v-if="BackgroundImg"
        loading="eager"
        decoding="async"
      />
    </div>
  </div>
  <HomeBg v-if="props.path === '/required'" />
</template>
<style scoped lang="scss">
@use "@/style" as *;

.mobile-match {
  @include mobile {
    height:1300px;
  }
}
</style>
