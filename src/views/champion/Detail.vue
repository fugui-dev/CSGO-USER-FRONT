<script setup>
import Layout from "@/components/Layout.vue";
import { computed, onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import activeTypeBg from "@/assets/images/champion/tab-active-bg.png";
import typeBg from "@/assets/images/champion/tab-bg.png";

const route = useRoute();
const active = ref(0);
const navList = ref([
  {
    name: "报名",
    value: 0,
    path: ["/match-sign-up"],
  },
  {
    name: "对阵",
    value: 1,
    path: ["/match-against", "/match-against-detail", "/match-against-fight"],
  },
  {
    name: "助威记录",
    value: 2,
    path: ["/match-cheer"],
  },
  {
    name: "往期记录",
    value: 3,
    path: ["/match-history", "/match-history-detail"],
  },
]);

const changeActive = (val) => {
  active.value = val;
};

onBeforeMount(() => {
  const currNav = navList.value.find((item) => item.path.includes(route.path));
  active.value = currNav ? currNav.value : 0;
});
import bgImg from "@/assets/images/champion/level-bg.webp";
const props = defineProps({
  bg: {
    type: Object,
    default: () => ({ img: bgImg, height: "187vw" }),
  },
});
</script>

<template>
  <Layout>
    <div
      class="detail-layout-wrapper"
      :style="{
        backgroundImage: `url(${bg.img})`,
        maxHeight: `${bg.height}`,
      }"
    >
      <div class="detail-content">
        <slot name="top"></slot>
        <div class="nav-wrapper tw-flex tw-items-center">
          <router-link
            class="nav-item"
            :style="{
              backgroundImage:
                active === i.value ? `url(${activeTypeBg})` : `url(${typeBg})`,
            }"
            v-for="(i, index) in navList"
            :class="{ active: active === i.value }"
            :key="index"
            @click="changeActive(i.value)"
            :to="i.path[0]"
          >
            <span>{{ i.name }}</span>
          </router-link>
        </div>
        <div>
          <slot></slot>
        </div>
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;
.detail-layout-wrapper {
  padding: 66px 0 30px;
  background-repeat: no-repeat;
  background-size: 100% auto;
  background-color: #4d3337;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  @include mobile {
    background-size: 100% 100%;
  }
  .detail-content {
    flex: 1;
    overflow: auto;
    position: relative;
    &::-webkit-scrollbar {
      display: none;
    }
    .nav-wrapper {
      margin-top: 20px;
      margin-left: 32px;
      gap: 10px 12px;
      @include mobile {
        gap: 6px;
        margin-left: 8px;
        margin-right: 8px;
      }
      .nav-item {
        width: 139px;
        height: 40px;
        text-align: center;
        line-height: 40px;
        background-size: 100% 100%;
        font-weight: 500;
        font-size: 17px;
        color: #ffffff;
        cursor: pointer;
        @include mobile {
          background-repeat: no-repeat;
          width: 100px;
          height: 32px;
          line-height: 32px;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
