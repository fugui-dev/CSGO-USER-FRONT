<script setup>
import Layout from "@/components/Layout.vue";
import { computed, onBeforeMount, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getMatchInfoApi } from "@/api/champion";
import { ElMessage } from "element-plus";
import activeTypeBg from "@/assets/images/champion/tab-active-bg.png";
import typeBg from "@/assets/images/champion/tab-bg.png";

const route = useRoute();
const router = useRouter();
const active = ref(0);
const matchData = ref({});
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
    name: "奖励领取",
    value: 3,
    path: ["/match-reward"],
  },
  {
    name: "往期记录",
    value: 4,
    path: ["/match-history", "/match-history-detail"],
  },
]);

const changeActive = (val) => {
  active.value = val;
};

// 检查是否可以进入
const checkCanEnter = () => {
  if (!matchData.value || !matchData.value.status) {
    return false;
  }
  
  // 如果状态是1（进行中），可以进入
  if (matchData.value.status === 1) {
    return true;
  }
  
  // 如果状态是2（已结束），检查是否到了关闭时间
  if (matchData.value.status === 2) {
    if (!matchData.value.closeTime) {
      // 如果没有设置关闭时间，默认不允许进入
      return false;
    }
    const now = new Date();
    const closeTime = new Date(matchData.value.closeTime);
    // 如果当前时间还没到关闭时间，可以进入
    return now < closeTime;
  }
  
  // 其他状态不允许进入
  return false;
};

onBeforeMount(() => {
  const currNav = navList.value.find((item) => item.path.includes(route.path));
  active.value = currNav ? currNav.value : 0;
});

onMounted(() => {
  // 获取比赛信息并检查是否可以进入
  getMatchInfoApi()
    .then((res) => {
      if (res.code === 200 && res.data) {
        matchData.value = res.data;
        if (!checkCanEnter()) {
          ElMessage.warning("比赛已关闭，无法进入");
          router.push("/");
        }
      }
    })
    .catch((err) => {
      console.error("获取比赛信息失败:", err);
      ElMessage.error("获取比赛信息失败");
      router.push("/");
    });
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
