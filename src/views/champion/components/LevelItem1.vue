<script setup>
import { computed, ref, watch, defineEmits } from "vue";
import { requireImg } from "@/utils/common";
import { joinTeamApi } from "@/api/champion";
import { useRoute } from "vue-router";

const route = useRoute();

const props = defineProps({
  showTitle: {
    type: Boolean,
  },
  showBottomBtn: {
    type: Boolean,
  },
  btnText: {
    type: String,
  },
  label: {
    type: String,
  },
  data: {
    type: Object,
    required: true,
  },
  showStatus: {
    type: Boolean,
  },
  statusText: {
    type: String,
  },
  statusBgColor: {
    type: String,
  },
});

const emit = defineEmits(["clickBtn"]);

const handleClickBtn = (teamId) => {
  const stageGroupFightId = props.data.id;
  emit("clickBtn", stageGroupFightId, teamId);
};
</script>
<template>
  <div class="level-item tw-flex tw-items-center tw-justify-center">
    <div class="left tw-flex tw-flex-col tw-items-center">
      <div class="alias">{{ data.team.aliasName }}</div>
      <div class="avatar-wrapper">
        <img
          class="avatar"
          :src="
            data.team.teamAvatar
              ? data.team.teamAvatar
              : requireImg('/v2/nav/u1.png')
          "
          alt=""
        />
        <img
          class="avatar-bg"
          src="@/assets/images/battle/avatar-bg.png"
          alt=""
        />
      </div>
      <div class="team-name">{{ data.team.teamName }}</div>
    </div>
    <img class="vs" src="@/assets/images/champion/history/vs.png" alt="" />
    <div class="right tw-flex tw-flex-col tw-items-center">
      <div class="alias">{{ data.opponentTeam.aliasName }}</div>
      <div class="avatar-wrapper">
        <img
          class="avatar"
          :src="
            data.opponentTeam.teamAvatar
              ? data.opponentTeam.teamAvatar
              : requireImg('/v2/nav/u1.png')
          "
          alt=""
        />
        <img
          class="avatar-bg"
          src="@/assets/images/battle/avatar-bg.png"
          alt=""
        />
      </div>
      <div class="team-name">{{ data.opponentTeam.teamName }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;
.level-item {
  width: 364px;
  height: 211px;
  background: url("@/assets/images/champion/history/item-bg.png") no-repeat;
  background-size: 100% 100%;
  padding: 7px;
  font-weight: 500;
  font-size: 19px;
  color: #d4c7af;
  line-height: normal;
  .left,
  .right {
    width: 124px;
    height: 198px;
    .alias {
      margin-top: 16px;
    }
    .avatar-wrapper {
      margin-top: 24px;
      width: 58px;
      height: 52px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      .avatar {
        width: 39px;
        height: 39px;
        border-radius: 50%;
        display: block;
      }
      .avatar-bg {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 58px;
        height: 52px;
      }
    }
    .team-name {
      margin-top: 19px;
      font-size: 18px;
    }
  }
  .left {
    background: url("@/assets/images/champion/history/blue-bg.png") no-repeat;
    background-size: 100% 100%;
  }
  .right {
    background: url("@/assets/images/champion/history/red-bg.png") no-repeat;
    background-size: 100% 100%;
  }
  .vs {
    width: 74px;
    height: 80px;
    margin: 0 11px 0 18px;
  }
}
</style>
