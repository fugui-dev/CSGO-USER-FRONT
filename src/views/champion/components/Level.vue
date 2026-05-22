<script setup>
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { requireImg } from "@/utils/common";
import LevelItem from "./LevelItem1.vue";

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

const championData = ref({});

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

// 晋级赛数据处理
const upgradeData = computed(() => {
  let res = {};
  for (let i = 2; i <= 4; i++) {
    const data = props.data.find((item) => item.type === i);
    res[i] = [];
    data.stageGroupList.forEach((item) => {
      const roundData = item.stageGroupFightList.filter(
        (ele) => ele.round === 1
      );
      res[i] = res[i].concat(...roundData);
    });
  }
  // 八强
  if (res[2].length < 4) {
    for (let j = res[2].length; j < 4; j++) {
      res[2].push({
        team: {
          teamName: "暂无队伍",
        },
        opponentTeam: {
          teamName: "暂无队伍",
        },
      });
    }
  }
  // 四强
  if (res[3].length < 2) {
    for (let j = res[3].length; j < 2; j++) {
      res[3].push({
        team: {
          teamName: "暂无队伍",
        },
        opponentTeam: {
          teamName: "暂无队伍",
        },
      });
    }
  }
  // 决赛
  if (res[4].length < 1) {
    for (let j = res[4].length; j < 1; j++) {
      res[4].push({
        team: {
          teamName: "暂无队伍",
          result: false,
        },
        opponentTeam: {
          teamName: "暂无队伍",
          result: false,
        },
      });
    }
  }
  // 冠军数据处理
  if (res[4][0]?.team?.result) {
    championData.value = {
      avatar: res[4][0].team.teamAvatar,
      name: res[4][0].team.teamName,
    };
  } else if (res[4][0]?.opponentTeam?.result) {
    championData.value = {
      avatar: res[4][0].opponentTeam.teamAvatar,
      name: res[4][0].opponentTeam.teamName,
    };
  } else {
    championData.value = {
      avatar: requireImg("/v2/nav/u1.png"),
      name: res[4][0].team.teamName,
    };
  }
  console.log(championData.value);
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
  
  const data = props.data.find((item) => item.type === 1);
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
  return res;
});
import round1 from "@/assets/images/champion/history/round1.png";
import round2 from "@/assets/images/champion/history/round2.png";
import round3 from "@/assets/images/champion/history/round3.png";
const headerImage = (index) => {
  switch (index) {
    case 0:
      return round3;
    case 1:
      return round2;
    case 2:
      return round1;
    default:
      return round1;
  }
};
</script>
<template>
  <div class="level-container">
    <div class="champion-wrapper">
      <img class="champion" :src="championData.avatar" alt="" />
    </div>
    <LevelItem
      :data="item"
      v-for="(item, index) in upgradeData[4]"
      :key="index"
      class="level-item-wrap"
    />
    <img src="@/assets/images/champion/history/top.png" class="top" alt="" />
    <div class="level-stage">
      <img
        src="@/assets/images/champion/history/4bg.png"
        class="header-bg"
        alt=""
      />
      <img
        src="@/assets/images/champion/history/4header.png"
        class="header"
        alt=""
      />
      <div class="level-detail tw-flex tw-items-center tw-justify-center">
        <LevelItem
          :data="item"
          :showTitle="true"
          v-for="(item, index) in upgradeData[3]"
          :key="index"
        />
      </div>
    </div>
    <img src="@/assets/images/champion/history/top.png" class="top" alt="" />
    <div class="level-stage">
      <img
        src="@/assets/images/champion/history/8bg.png"
        class="header-bg"
        alt=""
      />
      <img
        src="@/assets/images/champion/history/8header.png"
        class="header"
        alt=""
      />
      <div class="level-detail tw-flex tw-items-center tw-justify-center">
        <LevelItem
          :data="item"
          :showTitle="true"
          v-for="(item, index) in upgradeData[2]"
          :key="index"
        />
      </div>
    </div>
    <!-- 第三轮：分为两部分（最上面） -->
    <template v-if="(groupData.round3Qualified && groupData.round3Qualified.length) || (groupData.round3Loser && groupData.round3Loser.length)">
      <img src="@/assets/images/champion/history/top.png" class="top" alt="" />
      <div class="level-stage">
        <img
          src="@/assets/images/champion/history/round-bg.png"
          class="header-bg"
          alt=""
        />
        <img :src="headerImage(0)" class="header" alt="" />
        
        <!-- 第一部分：胜者组4支直接晋级队伍 -->
        <div class="bracket-group" v-if="groupData.round3Qualified && groupData.round3Qualified.length">
          <div class="bracket-group-title qualified-bracket">
            <span>直接晋级（胜者组4支）</span>
          </div>
          <div class="qualified-teams">
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
        </div>
        
        <!-- 第二部分：败者组第三轮对战 -->
        <div class="bracket-group" v-if="groupData.round3Loser && groupData.round3Loser.length">
          <div class="bracket-group-title loser-bracket">
            <span>败者组第三轮</span>
          </div>
          <div class="level-detail tw-flex tw-items-center tw-justify-center">
            <LevelItem
              :data="item"
              :showTitle="false"
              v-for="(item, index) in groupData.round3Loser"
              :key="'loser3-' + index"
            />
          </div>
        </div>
      </div>
    </template>
    
    <!-- 第二轮：分为胜者组和败者组（中间） -->
    <template v-if="(groupData.round2Winner && groupData.round2Winner.length) || (groupData.round2Loser && groupData.round2Loser.length)">
      <img src="@/assets/images/champion/history/top.png" class="top" alt="" />
      <div class="level-stage">
        <img
          src="@/assets/images/champion/history/round-bg.png"
          class="header-bg"
          alt=""
        />
        <img :src="headerImage(1)" class="header" alt="" />
        
        <!-- 胜者组 -->
        <div class="bracket-group" v-if="groupData.round2Winner && groupData.round2Winner.length">
          <div class="bracket-group-title winner-bracket">
            <span>胜者组</span>
          </div>
          <div class="level-detail tw-flex tw-items-center tw-justify-center">
            <LevelItem
              :data="item"
              :showTitle="false"
              v-for="(item, index) in groupData.round2Winner"
              :key="'winner-' + index"
            />
          </div>
        </div>
        
        <!-- 败者组 -->
        <div class="bracket-group" v-if="groupData.round2Loser && groupData.round2Loser.length">
          <div class="bracket-group-title loser-bracket">
            <span>败者组</span>
          </div>
          <div class="level-detail tw-flex tw-items-center tw-justify-center">
            <LevelItem
              :data="item"
              :showTitle="false"
              v-for="(item, index) in groupData.round2Loser"
              :key="'loser-' + index"
            />
          </div>
        </div>
      </div>
    </template>
    
    <!-- 第一轮：16进8（最下面） -->
    <template v-if="groupData.round1 && groupData.round1.length">
      <img src="@/assets/images/champion/history/top.png" class="top" alt="" />
      <div class="level-stage">
        <img
          src="@/assets/images/champion/history/round-bg.png"
          class="header-bg"
          alt=""
        />
        <img :src="headerImage(2)" class="header" alt="" />
        <div class="level-detail tw-flex tw-items-center tw-justify-center">
          <LevelItem
            :data="item"
            :showTitle="false"
            v-for="(item, index) in groupData.round1"
            :key="'round1-' + index"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;
.level-container {
  margin-top: 20px;
  @include mobile {
    margin-top: -10px;
  }
  .champion-wrapper {
    margin: 0 auto;
    width: 316px;
    height: 391px;
    background: url("@/assets/images/champion/history/champion.png") no-repeat;
    background-size: 100% 100%;
    position: relative;
    overflow: hidden;
    z-index: 1;
    @include mobile {
      width: 128px;
      height: 160px;
    }
    .champion {
      width: 191px;
      height: 191px;
      margin-top: 81px;
      margin-left: 61px;
      border-radius: 50%;
      @include mobile {
        width: 78px;
        height: 78px;
        margin: 32px auto 0;
      }
    }
  }
  .level-item-wrap {
    margin: -147px auto 0;
    position: relative;
    z-index: 2;
    @include mobile {
      margin-top: -50px;
    }
  }
  .top {
    margin: 9px auto 10px;
    width: 37px;
    height: 39px;
  }
  .level-stage {
    width: 1018px;
    background-color: #00000033;
    border-radius: 22px;
    position: relative;
    margin: 0 auto;
    padding: 9px 7px 41px;
    @include mobile {
      width: 100%;
      padding: 9px 7px 18px;
    }
    .header-bg {
      position: absolute;
      top: 9px;
      left: 50%;
      transform: translateX(-50%);
      width: 1004px;
      height: 72px;
      @include mobile {
        width: 100%;
        height: 50px;
      }
    }
    .header {
      margin: 15px auto 0;
      width: 177px;
      height: 43px;
      position: relative;
      z-index: 1;
      @include mobile {
        height: 32px;
        margin-top: 8px;
      }
    }
    .level-detail {
      gap: 35px 119px;
      margin-top: 46px;
      overflow: hidden;
      flex-wrap: wrap;
      @include mobile {
        gap: 8px;
        margin-top: 30px;
      }
    }
  }
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
