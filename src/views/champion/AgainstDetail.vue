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

// 分组赛数据处理（双败淘汰制）
const groupData = computed(() => {
  let res = {
    round1: [], // 第一轮：R1
    round2Winner: [], // 第二轮胜者组：W2
    round2Loser: [], // 第二轮败者组：L2
    round3Qualified: [], // 第三轮：胜者组4支直接晋级队伍
    round3Loser: [] // 第三轮败者组：L3
  };
  
  if (levelData.value.length > 0) {
    const data = levelData.value.find((item) => item.type === 1);
    if (data && data.stageGroupList) {
    data.stageGroupList.forEach((item) => {
        item.stageGroupFightList.forEach((fight) => {
          // 根据groupName和round分类
          if (fight.groupName === 'R1' && fight.round === 1) {
            res.round1.push(fight);
          } else if (fight.groupName === 'W2' && fight.round === 2) {
            res.round2Winner.push(fight);
          } else if (fight.groupName === 'L2' && fight.round === 2) {
            res.round2Loser.push(fight);
          } else if (fight.groupName === 'L3' && fight.round === 3) {
            res.round3Loser.push(fight);
          }
        });
      });
      
      // 获取胜者组第二轮的胜者（4支直接晋级队伍）
      res.round2Winner.forEach((fight) => {
        if (fight.status === 2) { // 已结束
          if (fight.team?.result === true) {
            res.round3Qualified.push({
              team: fight.team,
              isQualified: true
            });
          } else if (fight.opponentTeam?.result === true) {
            res.round3Qualified.push({
              team: fight.opponentTeam,
              isQualified: true
            });
          }
      }
    });
  }
  }
  console.log('双败淘汰制数据:', res);
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
      <!-- 分组赛（双败淘汰制） -->
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
        
        <!-- 第一轮：16进8 -->
        <div class="level-group-round">
          <div class="level-group-round-header">
            <h2 :style="{ backgroundColor: roundColor(0) }">
              第 1 回合
            </h2>
          </div>
          <div class="level-group-round-list" v-if="groupData.round1.length">
            <LevelItem
              :data="subItem"
              :showTitle="true"
              :showBottomBtn="subItem.status === 0"
              btnText="助威"
              :showStatus="true"
              :statusText="statusMap[subItem.status]"
              :statusBgColor="statusColor(subItem.status)"
              v-for="(subItem, subIndex) in groupData.round1"
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
        
        <!-- 第二轮：分为胜者组和败者组 -->
        <div class="level-group-round">
          <div class="level-group-round-header">
            <h2 :style="{ backgroundColor: roundColor(1) }">
              第 2 回合
            </h2>
          </div>
          
          <!-- 胜者组 -->
          <div class="bracket-group">
            <div class="bracket-group-title winner-bracket">
              <span>胜者组</span>
            </div>
            <div class="level-group-round-list" v-if="groupData.round2Winner.length">
              <LevelItem
                :data="subItem"
                :showTitle="true"
                :showBottomBtn="subItem.status === 0"
                btnText="助威"
                :showStatus="true"
                :statusText="statusMap[subItem.status]"
                :statusBgColor="statusColor(subItem.status)"
                v-for="(subItem, subIndex) in groupData.round2Winner"
                :key="'winner-' + subIndex"
                @click="handleJump(subItem.id)"
                @clickBtn="handleClickCheer"
                class="level-item-wrap"
              />
            </div>
            <div class="empty-box" v-else>
              <p>暂无数据</p>
            </div>
          </div>
          
          <!-- 败者组 -->
          <div class="bracket-group">
            <div class="bracket-group-title loser-bracket">
              <span>败者组</span>
            </div>
            <div class="level-group-round-list" v-if="groupData.round2Loser.length">
              <LevelItem
                :data="subItem"
                :showTitle="true"
                :showBottomBtn="subItem.status === 0"
                btnText="助威"
                :showStatus="true"
                :statusText="statusMap[subItem.status]"
                :statusBgColor="statusColor(subItem.status)"
                v-for="(subItem, subIndex) in groupData.round2Loser"
                :key="'loser-' + subIndex"
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
        
        <!-- 第三轮：分为两部分 -->
        <div class="level-group-round">
          <div class="level-group-round-header">
            <h2 :style="{ backgroundColor: roundColor(2) }">
              第 3 回合
            </h2>
          </div>
          
          <!-- 第一部分：胜者组4支直接晋级队伍 -->
          <div class="bracket-group">
            <div class="bracket-group-title qualified-bracket">
              <span>直接晋级（胜者组4支）</span>
            </div>
            <div class="qualified-teams" v-if="groupData.round3Qualified.length">
              <div 
                class="qualified-team-item"
                v-for="(team, index) in groupData.round3Qualified"
                :key="'qualified-' + index"
              >
                <div class="qualified-team-avatar">
                  <img
                    :src="team.team?.teamAvatar || requireImg('/v2/nav/u1.png')"
                    alt=""
                  />
                </div>
                <div class="qualified-team-name">{{ team.team?.teamName || '暂无队伍' }}</div>
              </div>
            </div>
            <div class="empty-box" v-else>
              <p>暂无数据</p>
            </div>
          </div>
          
          <!-- 第二部分：败者组第三轮对战 -->
          <div class="bracket-group">
            <div class="bracket-group-title loser-bracket">
              <span>败者组第三轮</span>
            </div>
            <div class="level-group-round-list" v-if="groupData.round3Loser.length">
              <LevelItem
                :data="subItem"
                :showTitle="true"
                :showBottomBtn="subItem.status === 0"
                btnText="助威"
                :showStatus="true"
                :statusText="statusMap[subItem.status]"
                :statusBgColor="statusColor(subItem.status)"
                v-for="(subItem, subIndex) in groupData.round3Loser"
                :key="'loser3-' + subIndex"
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
            :showStatus="true"
            :statusText="statusMap[item.status]"
            :statusBgColor="statusColor(item.status)"
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

.bracket-group {
  margin-bottom: 20px;
  
  .bracket-group-title {
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    padding: 4px 12px;
    margin-top: 12px;
    margin-bottom: 8px;
    border-radius: 6px;
    
    &.winner-bracket {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }
    
    &.loser-bracket {
      background: linear-gradient(135deg, #f44336, #d32f2f);
      color: white;
      box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
    }
    
    &.qualified-bracket {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: white;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }
  }
}

.qualified-teams {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  justify-content: center;
  
  .qualified-team-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 120px;
    
    .qualified-team-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #FFD700;
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
      margin-bottom: 8px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .qualified-team-name {
      font-size: 14px;
      color: #fff;
      text-align: center;
      font-weight: bold;
      word-break: break-word;
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .level-item-wrap {
    width: 48%;
  }
  
  .qualified-teams {
    gap: 12px;
    padding: 12px;
    
    .qualified-team-item {
      width: 80px;
      
      .qualified-team-avatar {
        width: 60px;
        height: 60px;
      }
      
      .qualified-team-name {
        font-size: 12px;
      }
    }
  }
}
</style>
