<script setup>

import RollingShow from "@/components/RollingShow.vue";
import Banner from "@/components/Banner.vue";
import Bottom from "@/components/default/Bottom.vue";
import { requireImg } from "@/utils/common.js";
import { ref, watchEffect, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import Aside from "@/components/Aside.vue";
import Top from "@/components/default/Top.vue";
import { useStore } from "@/store";
import BottomNav from "@/components/default/BottomNav.vue";
import BackGround from "@/components/BackGround.vue";
const showBanner = defineModel("showBanner", { default: false })
const showBox = defineModel("showBox", { default: true })

const route = useRoute()

const store = useStore()


const routeConfig = {
  hideRollingShow: [
    {
      path: '/openBox',
      match: (path) => /^\/openBox\/\d+/.test(path)
    },
    {
      path: '/upgrade/open',
      match: (path) => path === '/upgrade/open'
    }
    // 可以在这里添加更多需要隐藏的路由规则
  ]
}


const shouldHideRollingShow = computed(() =>
  routeConfig.hideRollingShow.some(rule => rule.match(route.path))
)

watchEffect(() => {
  if (shouldHideRollingShow.value) {
    showBox.value = false
  } else {
    showBox.value = true
  }
})

const itemRef = ref(null)
const itemHeight = ref(0)

const updateHeight = () => {
  if (itemRef.value) {
    itemHeight.value = itemRef.value.clientHeight
  }
}


let observer = null

onMounted(() => {
  updateHeight()

  observer = new MutationObserver(updateHeight)

  if (itemRef.value) {
    observer.observe(itemRef.value, {
      childList: true,    // 监听子节点变化
      subtree: true,      // 监听所有后代节点
      attributes: true,   // 监听属性变化
      characterData: true // 监听文本变化
    })
  }
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})

const isHome=computed(() => {
  return route.path === '/'
})
</script>

<template>
  <div class="home tw-relative tw-w-full tw-flex-col" v-if="store.isPC" id="aaa">
    <Top v-if="route.path !== '/userMobile'"></Top>
    <BackGround :path="route.path" />
    <div style="display: flex;flex: 1;overflow: hidden;max-width: 1280px;margin: 0 auto;width: 100%">
      <RollingShow v-if="showBox" :style="{ marginTop: '90px', height: `${itemHeight}px` }" />
      <div id="container" class="tw-flex-1">
        <div ref="itemRef">
          <slot name="item"></slot>
        </div>
        <Bottom />
      </div>
    </div>
<!--    <Aside />-->
  </div>
  <div class="home" v-else>
    <Top v-if="route.path !== '/userMobile'"></Top>
    <BackGround :path="route.path" :showBox="showBox" />

    <div id="container" style="flex: 1;overflow-y: auto">
      <RollingShow v-if="showBox" :style="{top:isHome?'90px':'inherit'}"/>
      <slot name="item"></slot>
      <Bottom />
    </div>
  </div>
</template>

<style lang="scss">
#container {
  display: flex;
  flex-direction: column;
  padding-top: 90px;
  flex: 1;
  height: 100%;
}
</style>
