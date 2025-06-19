<script setup>
import {requireImg} from '@/utils/common'
import {computed, ref, onMounted} from 'vue'
import {useStore} from "@/store";

const props = defineProps({
  path: {
    type: String,
    required: true
  },
  showBox: {
    type: Boolean,
    default: false
  }
});
const store = useStore()
const BackgroundImg = computed(() => {
  if (props.path.startsWith('/openBox')) {
    return requireImg('/v2/bg/openBg.png')
  }
  if (props.path.startsWith('/upgrade')) {
    return requireImg('/v2/bg/up-bg.png')
  }
  if (props.path.startsWith('/smelt') && !store.isPC) {
    return requireImg('/v2/bg/up-bg.png')
  }
  if (props.path.startsWith('/user') && !store.isPC) {
    return requireImg('/v2/bg/up-bg.png')
  }
  return ''
})
</script>
<template>
  <img :src="BackgroundImg" class="tw-absolute  tw-h-[100vh] md:tw-block tw-hidden tw-w-[100vw] tw-z-[-1]"
       v-if="BackgroundImg"/>
  <div class="tw-absolute tw-h-[100vh] tw-w-[100vw]   tw-overflow-hidden tw-z-[-1] md:tw-hidden"
       :class="{'tw-pt-[11.25rem]':props.showBox,'tw-pt-[5.625rem]':!props.showBox}">
    <div
        class="tw-w-[58.3125rem] tw-h-[29.1875rem] tw-relative  tw-left-1/2 -tw-translate-x-1/2 ">
      <img :src="BackgroundImg" class="tw-w-full tw-h-full" v-if="BackgroundImg"/>
    </div>
  </div>
  <HomeBg v-if="props.path === '/'"/>
</template>
