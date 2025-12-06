<script setup>
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { requireImg } from "@/utils/common";
import { useRoute } from "vue-router";
import { useStore } from "@/store";
import LevelItem from "./components/LevelItem.vue";
import CheerDialog from "./components/CheerDialog.vue";
import { getMatchStageApi } from "@/api/champion";
import Detail from "./Detail.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const type = Number(window.sessionStorage.getItem("againstType"));
const statusMap = {
  0: "未开始",
  1: "进行中",
  2: "已结束",
};
const levelData = ref([]);
const currLevelData = ref({});
const loading = ref(false);
const cheerDialogRef = ref();
const currClickStageGroupFightId = ref(-1);
const currClickTeamId = ref(-1);

const roundColor = computed(() => {
  return (index) => {
    switch (index) {
      case 0:
        return "#FF952A";
      case 1:
        return "#FF3C2A";
      case 2:
        return "#602bCF";
      default:
        return "#FF952A";
    }
  };
});
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

const handleClickBack = () => {
  router.back();
};

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
        currLevelData.value = res.data.find((item) => item.type === type);
        console.log(currLevelData.value);
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

// 晋级赛数据处理
const upgradeData = computed(() => {
  let res = {};
  if (levelData.value.length > 0) {
    for (let i = 2; i <= 4; i++) {
      const data = levelData.value.find((item) => item.type === i);
      res[i] = [];
      data.stageGroupList.forEach((item) => {
        const roundData = item.stageGroupFightList.filter(
          (ele) => ele.round === 1
        );
        res[i] = res[i].concat(...roundData);
      });
    }
  }
  return res;
});

// 分组赛数据处理
const groupData = computed(() => {
  let res = new Array(3).fill(null).map(() => []);
  if (levelData.value.length > 0) {
    const data = levelData.value.find((item) => item.type === 1);
    data.stageGroupList.forEach((item) => {
      for (let i = 0; i < 3; i++) {
        const roundData = item.stageGroupFightList.filter(
          (ele) => ele.round === i + 1
        );
        res[i] = res[i].concat(...roundData);
      }
    });
  }
  console.log(res);
  return res;
});

const handleJump = (id) => {
  window.sessionStorage.setItem("stageGroupFightId", id);
  router.push("/match-against-fight");
};

const handleClickCheer = (stageGroupFightId, teamId) => {
  currClickStageGroupFightId.value = stageGroupFightId;
  currClickTeamId.value = teamId;
  cheerDialogRef.value.open();
};

onMounted(() => {
  getMatchStageList();
});
</script>
<template>
  <Detail>
    <div
      class="against-detail-container"
      :style="{
        '--bg-level': requireImg('/level/3.png', true),
      }"
    >
      <div class="back" @click="handleClickBack">
        <img :src="requireImg('/v2/roll/room/back.png')" alt="" />
        返回
      </div>
      <!-- 分组赛 -->
      <div class="against-detail-group" v-if="type === 1">
        <div class="level-group-title">
          <span>{{ currLevelData.name }}</span>
          <div
            class="match-status"
            :style="{ backgroundColor: statusColor(currLevelData.status) }"
          >
            {{ statusMap[currLevelData.status] }}
          </div>
        </div>
        <div
          class="level-group-round"
          v-for="(item, index) in groupData"
          :key="index"
        >
          <div class="level-group-round-header">
            <h2 :style="{ backgroundColor: roundColor(index) }">
              第 {{ index + 1 }} 回合
            </h2>
          </div>
          <div class="level-group-round-list" v-if="item.length">
            <LevelItem
              :data="subItem"
              :showTitle="true"
              :showBottomBtn="subItem.status === 0"
              btnText="助威"
              :showStatus="true"
              :statusText="statusMap[subItem.status]"
              :statusBgColor="statusColor(subItem.status)"
              v-for="(subItem, subIndex) in item"
              :key="subIndex"
              @click="handleJump(subItem.id)"
              @clickBtn="handleClickCheer"
              class="level-item-wrap"
            />
          </div>
          <div class="empty-box" v-else>
            <p>暂无数据</p>
          </div>
        </div>
      </div>
      <!-- 对抗赛 -->
      <div class="against-detail-main" v-else>
        <div class="level-group-title">
          <span>{{ currLevelData.name }}</span>
          <div
            class="match-status"
            :style="{ backgroundColor: statusColor(currLevelData.status) }"
          >
            {{ statusMap[currLevelData.status] }}
          </div>
        </div>
        <div
          class="common-level"
          v-if="upgradeData[type] && upgradeData[type].length"
        >
          <LevelItem
            :data="item"
            :showTitle="true"
            :showBottomBtn="item.status === 0"
            btnText="助威"
            v-for="(item, index) in upgradeData[type]"
            :key="index"
            @click="handleJump(item.id)"
            @clickBtn="handleClickCheer"
            class="level-item-wrap"
          />
        </div>
        <div class="empty-box" v-else>
          <p>暂无数据</p>
        </div>
      </div>
    </div>
    <CheerDialog
      ref="cheerDialogRef"
      :teamId="currClickTeamId"
      :stageGroupFightId="currClickStageGroupFightId"
    />
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.back {
  display: flex;
  height: fit-content;
  margin: 12px 0 0 0;
  cursor: pointer;
  z-index: 2;
  align-items: center;
  color: #fff5f5cc;
  position: relative;
  @include mobile {
    display: none;
  }

  img {
    height: 24px;
    margin-right: 8px;
  }
}
.against-detail-container {
  width: 94%;
  margin: 0 auto;
  position: relative;
  .common-level {
    background-color: rgba(50, 50, 50, 0.66);
    background-position: bottom;
    background-repeat: repeat-x;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;
  }
}
.empty-box {
  font-family: "titleFont", "Microsoft YaHei", "sans-serif";
  font-size: 18px;
  color: #eee;
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 4;
}
.against-detail-group {
  .level-group-round {
    background-image: var(--bg-level);
    background-color: rgba(50, 50, 50, 0.66);
    background-position: bottom;
    background-repeat: repeat-x;
    border-radius: 12px;
    margin-bottom: 20px;
    position: relative;
  }
  .level-group-round-header {
    display: flex;
    justify-content: center;
    h2 {
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      padding: 0 28px;
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }
  }
  .level-group-round-list {
    display: flex;
    flex-wrap: wrap;
    cursor: pointer;
    padding: 10px 10px 20px 10px;
  }
}
.level-group-title {
  background: var(--bg-tab1);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  width: 94%;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 20px;
  position: relative;
  margin-bottom: 20px;
  span {
    font-family: "titleFont", "Microsoft YaHei", "sans-serif";
  }
  .match-status {
    position: absolute;
    font-family: "titleFont", "Microsoft YaHei", "sans-serif";
    font-size: 14px;
    padding: 0 8px 2px 8px;
    border-radius: 4px;
    left: 50%;
    top: 50%;
    transform: translate(38%, 50%);
  }
}
.level-item-wrap {
  width: 24%;
  margin: 10px auto 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .level-item-wrap {
    width: 48%;
  }
}
</style>
