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

// 分组赛数据处理
const groupData = computed(() => {
  const data = props.data.find((item) => item.type === 1);
  let res = new Array(3).fill(null).map(() => []);
  data.stageGroupList.forEach((item) => {
    for (let i = 0; i < 3; i++) {
      const roundData = item.stageGroupFightList.filter(
        (ele) => ele.round === i + 1
      );
      res[i] = res[i].concat(...roundData);
    }
  });
  for (let i = 0; i < 3; i++) {
    if (res[i].length < 8) {
      for (let j = res[i].length; j < 8; j++) {
        res[i].push({
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
  }
  return res.reverse();
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
    <template v-for="(round, roundIndex) in groupData" :key="roundIndex">
      <img src="@/assets/images/champion/history/top.png" class="top" alt="" />
      <div class="level-stage">
        <img
          src="@/assets/images/champion/history/round-bg.png"
          class="header-bg"
          alt=""
        />
        <img :src="headerImage(roundIndex)" class="header" alt="" />
        <div class="level-detail tw-flex tw-items-center tw-justify-center">
          <LevelItem
            :data="item"
            :showTitle="false"
            v-for="(item, index) in round"
            :key="index"
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
</style>
