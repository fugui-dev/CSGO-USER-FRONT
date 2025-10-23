<script setup>
import {computed, ref, watch, defineEmits} from "vue";
import {requireImg} from "@/utils/common";
import {joinTeamApi} from "@/api/champion"
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  showTitle: {
    type: Boolean
  },
  showBottomBtn: {
    type: Boolean
  },
  btnText: {
    type: String
  },
  label: {
    type: String
  },
  data: {
    type: Object,
    required: true
  },
  showStatus: {
    type: Boolean
  },
  statusText: {
    type: String
  },
  statusBgColor: {
    type: String
  }
});

const emit = defineEmits(['clickBtn'])

const handleClickBtn = (teamId) => {
  const stageGroupFightId = props.data.id
  emit('clickBtn', stageGroupFightId, teamId)
}

</script>
<template>
    <div class="level-item tw-flex tw-items-center tw-justify-center">
      <!-- 状态标签 -->
      <div
        class="level-item-status"
        v-if="showStatus"
        :style="{backgroundColor: statusBgColor}">
          {{ statusText }}
      </div>
      
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
        <div class="level-item-btn" v-if="showBottomBtn" @click.stop="handleClickBtn(data.team.teamId)">{{ btnText }}</div>
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
        <div class="level-item-btn" v-if="showBottomBtn" @click.stop="handleClickBtn(data.opponentTeam.teamId)">{{ btnText }}</div>
      </div>
    </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.level-item {
  width: 300px;
  height: 180px;
  background: url("@/assets/images/champion/history/item-bg.png") no-repeat;
  background-size: 100% 100%;
  padding: 6px;
  font-weight: 500;
  font-size: 16px;
  color: #d4c7af;
  line-height: normal;
  margin: 8px;
  position: relative;
  
  .level-item-status {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    height: 20px;
    line-height: 20px;
    font-size: 11px;
    padding: 0 12px;
    z-index: 3;
    border-radius: 10px;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    color: white;
  }
  
  .left,
  .right {
    width: 100px;
    height: 168px;
    
    .alias {
      margin-top: 12px;
      font-size: 14px;
      color: #ffffff;
      font-weight: bold;
    }
    
    .avatar-wrapper {
      margin-top: 18px;
      width: 48px;
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: block;
        z-index: 2;
      }
      
      .avatar-bg {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 48px;
        height: 44px;
        z-index: 1;
      }
    }
    
    .team-name {
      margin-top: 15px;
      font-size: 15px;
      color: #ffffff;
      font-weight: bold;
    }
    
    
    .level-item-btn {
      cursor: pointer;
      margin-top: 8px;
      font-size: 12px;
      height: 28px;
      line-height: 28px;
      text-align: center;
      border-radius: 14px;
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: white;
      font-weight: bold;
      box-shadow: 0 3px 8px rgba(255, 107, 53, 0.4);
      transition: all 0.3s ease;
      min-width: 60px;
      padding: 0 12px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 12px rgba(255, 107, 53, 0.6);
      }
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
    width: 60px;
    height: 65px;
    margin: 0 8px 0 12px;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .level-item {
    width: 90%;
    height: auto;
    flex-direction: column;
    padding: 12px;
    margin: 4px;
    
    .left,
    .right {
      width: 100%;
      height: auto;
      margin: 6px 0;
    }
    
    .vs {
      margin: 12px 0;
    }
  }
}
</style>