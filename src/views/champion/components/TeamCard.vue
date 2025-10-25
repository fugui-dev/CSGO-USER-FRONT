<script setup>
import {computed, ref, watch} from "vue";
import {requireImg} from "@/utils/common";
import {joinTeamApi} from "@/api/champion"
import { useRoute } from 'vue-router'
import {useStore} from "@/store"

const route = useRoute()
const store = useStore()

const props = defineProps({
  cardData: {
    type: Object,
    required: true
  },
  isMy: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['onInvite'])

const handleInvite = () => {
  emit('onInvite')
}

const handleJoinTeam = () => {
  const matchId = Number(window.sessionStorage.getItem('matchId'))
  const teamId = props.cardData.id
  joinTeamApi({matchId, teamId}).then(res => {
    if (res.code === 200) {
      ElMessage.success(res.msg)
    }
  })
}

</script>
<template>
  <div class="team-card-container">
    <img src="@/assets/images/champion/team/team-icon.png" alt="" class="match-logo">
    <!-- 头部 -->
    <div class="card-header">
      <div class="card-header-left">
        <div class="avatar-wrapper">
          <img
            class="avatar"
            :src="cardData.avatar"
            alt=""
          />
          <img
            class="avatar-bg"
            src="@/assets/images/champion/avatar-rank-bg.png"
            alt=""
          />
        </div>
        <div class="card-header-info">
          <div class="team-name">{{ cardData.name }}</div>
          <div class="people-num">人数：{{ cardData.memberCount }}/{{ cardData.maxMemberCount }}</div>
        </div>
      </div>
      <div class="card-header-btn" v-if="cardData.status === 0 && isMy" @click="handleInvite">邀请用户</div>
      <div class="card-header-btn" v-if="cardData.status === 0 && !isMy" @click="handleJoinTeam">加入队伍</div>
      <div class="card-header-btn disabled" v-else-if="cardData.status === 1">集结完成</div>
      <div class="card-header-btn disabled" v-else-if="cardData.status === 2">队伍已解散</div>
    </div>
    <div class="split" />
    <!-- 中间 -->
    <div class="card-main">
      <!-- 队伍列表 -->
      <div class="card-box-list">
        <div class="card-box-list-item" v-for="(item, key) in cardData.matchUserList" :key="key">
          <div class="avatar-wrapper">
            <img
              class="avatar"
              :src="item.userAvatar"
              alt=""
            />
            <img
              class="avatar-bg"
              src="@/assets/images/champion/avatar-rank-bg.png"
              alt=""
            />
            <div class="captain" v-if="item.isCaptain">队</div>
          </div>
          <div class="user-name">{{ item.userName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.team-card-container {
  position: relative;
  margin-top: 36px;
  box-sizing: border-box;
  width: 1162px;
  height: 286px;
  border-radius: 8px;
  background-color: #38383894;
}
.match-logo {
  width: 133px;
  height: 151px;
  position: absolute;
  z-index: 2;
  left: 0;
  top: -24px;
}
.avatar-wrapper {
  width: 79px;
  height: 79px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  &+.avatar-wrapper {
    margin-left: 11px;
  }
  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: block;
  }
  .avatar-bg {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 16px 173px;
  height: 140px;
  .card-header-left {
    display: flex;
    .avatar-wrapper {
      margin-left: 28px;
    }
    .card-header-info {
      margin-left: 12px;
      
      .team-name {
        font-family: Jijiati;
        font-weight: 400;
        font-size: 24px;
        color: #FFFFFF;
      }
      .people-num {
        font-weight: 500;
        font-size: 22px;
        color: #FFFFFF;
        margin-top: 8px;
      }
    }
  }
  .card-header-btn {
    background-image: url("@/assets/images/recharge/qrcode.png");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    width: 293px;
    height: 70px;
    text-align: center;
    font-weight: 500;
    font-size: 24px;
    color: #072523;
    line-height: 64px;
    cursor: pointer;
    &disabled {
      background-image: url('@/assets/images/champion/team/status-bg.png');
      color: #E8B253;
    }
  }
}
.split {
  margin: 0 auto;
  width: 1104px;
  height: 1px;
  background: #604E40;
  box-shadow: 0px 1px 0px 0px #8D8171;
}
.card-box-list {
  display: flex;
  flex-wrap: wrap;
  padding: 14px 14px 14px 60px;
  .card-box-list-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 10px;
    .captain {
      position: absolute;
      top: -5px;
      right: -1px;
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      background: #FF931F;
      box-shadow: 1px 1px 0px 0px #3B2E1F;
      border-radius: 50%;
      border: 1px solid rgba(214,92,18,0.71);
      font-weight: 500;
      font-size: 20px;
      color: #FFFFFF;
    }
    .user-name {
      white-space: nowrap; /* 防止文本换行 */
      overflow: hidden; /* 隐藏溢出的内容 */
      text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
      max-width: 80px;
      font-size: 17px;
      margin-top: 6px;
    }
  }
}
</style>