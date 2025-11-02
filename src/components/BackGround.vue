<script setup>
import { requireImg } from "@/utils/common";
import { computed, ref, onMounted } from "vue";
import { useStore } from "@/store";
import upgradeBg from '@/assets/images/upgrade/bg.png';
import userBg from '@/assets/images/roll/bg.png';
import userStorageBg from '@/assets/images/user/storage_bg.png';
import smeltBg from '@/assets/images/smelt/bg.png';

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
    return requireImg("/v2/bg/up-bg.png");
  }
  if (props.path.startsWith("/smelt")) {
    return smeltBg;
  }
  if (props.path.startsWith("/user/base") || props.path.startsWith("/user/promote")) {
    return userBg;
  }
  if (props.path.startsWith("/user/inventory") || props.path.startsWith("/user/record") || props.path.startsWith("/user/log") || props.path.startsWith("/user/mail")) {
    return userStorageBg;
  }

  return "";
});
</script>
<template>
  <img
    :src="BackgroundImg"
    class="tw-absolute tw-h-[100vh] md:tw-block tw-hidden tw-w-[100vw] tw-z-[-1]"
    v-if="BackgroundImg"
  />
  <img
    :src="BackgroundImg"
    class="tw-absolute md:tw-block tw-hidden tw-w-[100vw] tw-z-[-1]"
    v-if="path.startsWith('/upgrade/open') || path.startsWith('/user') || path.startsWith('/smelt')"
  />
  <div
    class="tw-absolute tw-h-[100vh] tw-w-[100vw] tw-overflow-hidden tw-z-[-1] md:tw-hidden"
    :class="{
      'tw-pt-[11.25rem]': props.showBox,
      'tw-pt-[5.625rem]': !props.showBox,
    }"
  >
    <div
      class="tw-w-[58.3125rem] tw-h-[29.1875rem] tw-relative tw-left-1/2 -tw-translate-x-1/2"
    >
      <img
        :src="BackgroundImg"
        class="tw-w-full tw-h-full"
        v-if="BackgroundImg"
      />
    </div>
  </div>
  <HomeBg v-if="props.path === '/required'" />
</template>
