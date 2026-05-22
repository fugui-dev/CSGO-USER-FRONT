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

// 计算对局得分（totalScore + initialScore，助威系数后的分数）
const getTeamScore = (team) => {
  if (!team) return '0'
  const totalScore = parseFloat(team.totalScore || 0)
  const initialScore = parseFloat(team.initialScore || 0)
  return (totalScore + initialScore).toFixed(2)
}

// 判断队伍是否获胜
const isWinner = (team) => {
  return team?.result === true
}

// 判断对战是否已结束
const isFightEnded = computed(() => {
  return props.data?.status === 2
})

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
      
      <div class="left tw-flex tw-flex-col tw-items-center" :class="{ 'winner': isFightEnded && isWinner(data.team) }">
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
          <!-- 胜负标识 -->
          <div class="win-badge" v-if="isFightEnded && isWinner(data.team)">
            <span>胜</span>
          </div>
          <div class="lose-badge" v-else-if="isFightEnded && !isWinner(data.team)">
            <span>负</span>
          </div>
        </div>
        <div class="team-name">{{ data.team.teamName }}</div>
        <!-- 显示积分数额（助威系数后） -->
        <div class="team-score" v-if="isFightEnded">
          积分: {{ getTeamScore(data.team) }}
        </div>
        <div class="level-item-btn" v-if="showBottomBtn" @click.stop="handleClickBtn(data.team.teamId)">{{ btnText }}</div>
      </div>
      <img class="vs" src="@/assets/images/champion/history/vs.png" alt="" />
      <div class="right tw-flex tw-flex-col tw-items-center" :class="{ 'winner': isFightEnded && isWinner(data.opponentTeam) }">
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
          <!-- 胜负标识 -->
          <div class="win-badge" v-if="isFightEnded && isWinner(data.opponentTeam)">
            <span>胜</span>
          </div>
          <div class="lose-badge" v-else-if="isFightEnded && !isWinner(data.opponentTeam)">
            <span>负</span>
          </div>
        </div>
        <div class="team-name">{{ data.opponentTeam.teamName }}</div>
        <!-- 显示积分数额（助威系数后） -->
        <div class="team-score" v-if="isFightEnded">
          积分: {{ getTeamScore(data.opponentTeam) }}
        </div>
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
  @include mobile {
    width: 40%;
    height: 100px;
  }
  
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
    @include mobile {
      width: 40%;
      height: 90px;
    }
    
    .alias {
      margin-top: 12px;
      font-size: 14px;
      color: #ffffff;
      font-weight: bold;
      @include mobile {
        margin-top: 3px;
        font-size: 12px;
      }
    }
    
    .avatar-wrapper {
      margin-top: 18px;
      width: 48px;
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      @include mobile {
        margin-top: 3px;
      }
      
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
      
      .win-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4;
        box-shadow: 0 2px 6px rgba(76, 175, 80, 0.5);
        
        span {
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
      }
      
      .lose-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #f44336, #d32f2f);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4;
        box-shadow: 0 2px 6px rgba(244, 67, 54, 0.5);
        
        span {
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
      }
    }
    
    .team-name {
      margin-top: 15px;
      font-size: 15px;
      color: #ffffff;
      font-weight: bold;
      @include mobile {
        margin-top: 3px;
        font-size: 12px;
      }
    }
    
    .team-score {
      margin-top: 8px;
      font-size: 13px;
      color: #FFD700;
      font-weight: bold;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      @include mobile {
        margin-top: 2px;
        font-size: 11px;
      }
    }
    
    &.winner {
      .team-name {
        color: #FFD700;
        text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
      }
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
      @include mobile {
        height: 18px;
        line-height: 18px;
        border-radius: 9px;
        margin-top: 2px;
        padding: 0 4px;
      }
      
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
    @include mobile {
      width: 30px;
      height: 32px;
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  // .level-item {
  //   width: 90%;
  //   height: auto;
  //   flex-direction: column;
  //   padding: 12px;
  //   margin: 4px;
    
  //   .left,
  //   .right {
  //     width: 100%;
  //     height: auto;
  //     margin: 6px 0;
  //   }
    
  //   .vs {
  //     margin: 12px 0;
  //   }
  // }
}
</style>