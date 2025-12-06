<script setup>
import { computed, onMounted, ref } from "vue";
import { getMatchStageApi, getTeamListApi } from "@/api/champion";
import Detail from "./Detail.vue";
import Level from "./components/Level.vue";
import { requireImg } from "@/utils/common";
import ChampoinTeam from "./components/championTeam.vue";
import TeamRank from "./components/teamRank.vue";

const loading = ref(false);
const levelData = ref([]);
const championTeamInfo = ref({});
const teamRankList = ref([]);
const active = ref(0);
const navList = ref([
  {
    name: "晋级图",
    value: 0,
  },
  {
    name: "总冠军",
    value: 1,
  },
  {
    name: "队伍排名",
    value: 2,
  },
]);
const matchId = computed(() =>
  Number(window.sessionStorage.getItem("historyMatchId"))
);

const changeActive = (val) => {
  active.value = val;
  if (active.value === 0) {
    getMatchStageList();
  } else if (active.value === 1) {
    getChampionTeamInfo();
  } else {
    getTeamRank();
  }
};

// 获取比赛阶段
const getMatchStageList = () => {
  loading.value = true;
  getMatchStageApi({
    matchId: matchId.value,
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

// 获取冠军队伍
const getChampionTeamInfo = () => {
  loading.value = true;
  getTeamListApi({
    matchId: matchId.value,
    champion: true,
  })
    .then((res) => {
      if (res.data && res.data.length) {
        championTeamInfo.value = res.data[0];
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

// 获取队伍排名
const getTeamRank = () => {
  loading.value = true;
  getTeamListApi({
    matchId: matchId.value,
    champion: false,
  })
    .then((res) => {
      if (res.data && res.data.length) {
        teamRankList.value = res.data;
        teamRankList.value.sort((a, b) => a.rank - b.rank);
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  getMatchStageList();
});
import championTeamBg from "@/assets/images/champion/champion-team-bg.webp";
const specialBg = computed(() => {
  if (active.value === 1) {
    return {
      img: championTeamBg,
      height: "134.95vw",
    };
  }
});
</script>

<template>
  <Detail :bg="specialBg">
    <div
      class="history-detail-container"
      v-loading="loading"
      :style="{
        '--bg-user': requireImg('/level/1.png', true),
      }"
    >
      <div class="group-wrapper">
        <div
          class="goup-item"
          v-for="(i, index) in navList"
          :key="'nav' + index"
          :class="{ active: active === i.value }"
          @click="changeActive(i.value)"
        >
          {{ i.name }}
        </div>
      </div>
      <!-- 晋级图 -->
      <Level v-if="active === 0 && levelData.length" :data="levelData" />
      <!-- 冠军队伍 -->
      <ChampoinTeam v-if="active === 1" :data="championTeamInfo" />
      <!-- 队伍排名 -->
      <div v-if="active === 2">
        <TeamRank :data="teamRankList"></TeamRank>
      </div>
    </div>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.history-detail-container {
  position: relative;
  width: 96%;
  margin: 0 auto;
  .group-wrapper {
    height: 60px;
    margin-top: 56px;
    display: flex;
    align-items: center;
    @include mobile {
      margin-top: 24px;
    }
    .goup-item {
      width: 159px;
      height: 63px;
      line-height: 57px;
      text-align: center;
      font-weight: 500;
      font-size: 18px;
      color: #ffffff;
      cursor: pointer;
      @include mobile {
        width: 33.3%;
        font-size: 16px;
      }
      &.active {
        color: #8fedd8;
        background: url("@/assets/images/header/active-menu.png") no-repeat;
        background-size: 100% 63px;
      }
    }
  }
  .level-1 {
    width: 100%;
    height: 140px;
    margin-top: 8px;
    position: relative;
    overflow: hidden;
    .rank-winner {
      position: absolute;
      z-index: 2;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .winner-avatar {
      // TODO
      // background-image: var(--bg-winner-avatar);
      background-image: url("/public/avatarBorder.png");
      background-size: contain;
      background-repeat: no-repeat;
      width: 88px;
      height: 88px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 8%;
      transform: translateX(5%);
      img {
        width: 61px;
        height: 61px;
        border-radius: 50%;
        transform: translate(-3px, 3px);
        background-color: #999;
      }
    }
    p {
      font-family: "titleFont", "Microsoft YaHei", "sans-serif";
      font-size: 15px;
    }
    .avatar-bg {
      // TODO
      background-image: url("/public/avatarBg.png");
      background-size: contain;
      background-repeat: no-repeat;
      width: 140px;
      height: 40px;
      margin-top: -16%;
    }
  }
  .user-list {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 5px;
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
    .user-list-item {
      background-image: var(--bg-user);
      border-radius: 8px;
      background-color: rgba(50, 50, 50, 0.66);
      background-position: bottom;
      background-repeat: repeat-x;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 0 4px 0;
      img {
        width: 10px;
      }
      .user-avatar {
        width: 38px;
        height: 38px;
        border: 1px solid #e39817;
        border-radius: 6px;
      }
      p {
        font-family: "titleFont", "Microsoft YaHei", "sans-serif";
        font-size: 14px;
        margin-bottom: 4px;
        white-space: nowrap; /* 防止文本换行 */
        overflow: hidden; /* 隐藏溢出的内容 */
        text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
        max-width: 54px;
      }
    }
  }
  .mz {
    display: flex;
    align-items: center;
    padding: 0;
    background: linear-gradient(
      90.47deg,
      rgba(202, 62, 39, 0) 0.31%,
      rgba(30, 30, 30) 51.13%,
      rgba(201, 61, 38, 0) 100.98%
    );
    width: 100%;
    font-size: 13px;
    height: 21px;
    line-height: 21px;
    margin: 0 0 4px 0;
    justify-content: center;
    .score {
      font-family: "titleFont", "Microsoft YaHei", "sans-serif";
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
}
</style>
