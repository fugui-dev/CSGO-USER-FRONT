<script setup>
import Layout from "@/components/Layout.vue";
import { computed, onMounted, ref } from "vue";
import { getMatchStageApi } from "@/api/champion";
import { requireImg, isNotEmptyObj } from "@/utils/common";
import { ElMessage } from "element-plus";
import luckyStar from "@/assets/openBox/luckyStar.png";
import Detail from "./Detail.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const loading = ref(false);
const levelData = ref([]);
const statusMap = {
  0: "未开始",
  1: "进行中",
  2: "已结束",
};
const statusColor = computed(() => {
  return (status) => {
    switch (status) {
      case 0:
        return "#FF952A";
      case 1:
        return "#FF3C2A";
      case 2:
        return "#602bCF";
      default:
        return "#AAAAAA";
    }
  };
});

// 获取比赛阶段
const getMatchStageList = () => {
  loading.value = true;
  const matchId = Number(window.sessionStorage.getItem("matchId"));
  getMatchStageApi({
    matchId: matchId,
  })
    .then((res) => {
      if (res.data && res.data.length) {
        levelData.value = res.data;
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleJump = (type) => {
  window.sessionStorage.setItem("againstType", type);
  router.push("/match-against-detail");
};

onMounted(() => {
  getMatchStageList();
});
import roundBg from "@/assets/images/match/round-bg.png";
import bg4 from "@/assets/images/match/4bg.png";
import bg8 from "@/assets/images/match/8bg.png";
import finalBg from "@/assets/images/match/final-bg.png";
import grayBg from "@/assets/images/match/gray-bg.png";
import roundIng from "@/assets/images/match/round-ing.png";
import ing4 from "@/assets/images/match/4ing.png";
import ing8 from "@/assets/images/match/8ing.png";
import finalIng from "@/assets/images/match/final-ing.png";
import end from "@/assets/images/match/end.png";
import pending from "@/assets/images/match/pending.png";
import roundName from "@/assets/images/match/round-name.png";
import name4 from "@/assets/images/match/4name.png";
import name8 from "@/assets/images/match/8name.png";
import finalName from "@/assets/images/match/final-name.png";

const getImage = (item) => {
  switch (item.type) {
    case 1:
      return {
        bg: item.status === 0 ? grayBg : roundBg,
        statusImg:
          item.status === 0 ? pending : item.status === 1 ? roundIng : end,
        name: roundName,
      };
    case 2:
      return {
        bg: item.status === 0 ? grayBg : bg8,
        statusImg: item.status === 0 ? pending : item.status === 1 ? ing8 : end,
        name: name8,
      };
    case 3:
      return {
        bg: item.status === 0 ? grayBg : bg4,
        statusImg: item.status === 0 ? pending : item.status === 1 ? ing4 : end,
        name: name4,
      };
    case 4:
      return {
        bg: item.status === 0 ? grayBg : finalBg,
        statusImg:
          item.status === 0 ? pending : item.status === 1 ? finalIng : end,
        name: finalName,
      };
    default:
      return {
        bg: roundBg,
        statusImg:
          item.status === 0 ? pending : item.status === 1 ? roundIng : end,
        name: roundName,
      };
  }
};
import bgImg from "@/assets/images/champion/match-bg.webp";
</script>
<template>
  <Detail :bg="{ img: bgImg, height: '187vw' }">
    <div class="against-container" v-loading="loading">
      <div
        class="match-list-item"
        :style="{
          background: `url(${getImage(item).bg}) no-repeat`,
          'background-size': '100% 100%',
        }"
        v-for="item in levelData"
        :key="item.id"
        @click="handleJump(item.type)"
      >
        <img :src="getImage(item).name" class="name-image" alt="" />
        <div class="time">
          活动时间：{{ item.startTime }}-{{ item.endTime }}
        </div>
        <img
          :src="getImage(item).statusImg"
          class="status-image"
          :class="item.status === 1 ? 'ing' : ''"
          alt=""
        />
      </div>
    </div>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;
.against-container {
  width: 1018px;
  margin: 0 auto;
  padding-top: 16px;
  .match-list-item {
    width: 100%;
    height: 210px;
    margin-top: 24px;
    overflow: hidden;
    padding-left: 45px;
    position: relative;
    cursor: pointer;
    .name-image {
      margin-top: 33px;
      width: 129px;
      height: 35px;
    }
    .time {
      margin-top: 14px;
      font-weight: 500;
      font-size: 26px;
      color: #ffffff;
    }
    .status-image {
      position: absolute;
      right: 0;
      top: 0;
      width: 118px;
      height: 124px;
      &.ing {
        width: 204px;
        height: 203px;
        right: 70px;
        bottom: 0;
      }
    }
  }
}
</style>
