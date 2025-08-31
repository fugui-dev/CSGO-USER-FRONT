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
  }
});

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
    <div class="team-card-container" :style="{
        '--bg-btn':requireImg('/center/bg-btn.png',true)
      }">
      <img :src="requireImg('/center/bg-item.png')" alt="" class="match-logo">
      <div class="team-card-wrap">
        <!-- 头部 -->
        <div class="card-header">
          <div class="card-header-left">
            <div class="team-avatar">
              <img :src="cardData.avatar" alt="">
            </div>
            <div class="card-header-info">
              <div class="team-name">{{ cardData.name }}</div>
              <div class="people-num">人数：{{ cardData.memberCount }}/{{ cardData.maxMemberCount }}</div>
            </div>
          </div>
          <div class="card-header-btn" v-if="cardData.status === 0" @click="handleJoinTeam">加入队伍</div>
          <div class="card-header-btn" v-else-if="cardData.status === 1">集结完成</div>
          <div class="card-header-btn" v-else-if="cardData.status === 2">队伍已解散</div>
        </div>
        <div class="tw-flex tw-justify-between tw-items-center tw-mb-2 tw-relative tw-z-20">
          <div class="tw-absolute tw-h-[2px] tw-bg-gradient-to-r tw-from-transparent tw-via-[#fff] tw-to-transparent tw-w-full tw-bottom-[4px]"></div>
        </div>
        <!-- 中间 -->
        <div class="card-main">
          <!-- 队伍列表 -->
          <div class="card-box-list">
            <div class="card-box-list-item" v-for="(item, key) in cardData.matchUserList" :key="key">
              <div class="avatar-wrap">
                <img :src="item.userAvatar" alt="">
                <div class="captain" v-if="item.isCaptain">队</div>
              </div>
              <div class="user-name">{{ item.userName }}</div>
            </div>
          </div>
        </div>
      </div>
      </div>
</template>

<style scoped lang="scss">
.team-card-container {
  position: relative;
  margin-top: 20px;
  box-sizing: border-box;
}
.match-logo {
  width: 100px;
  height: 100px;
  position: absolute;
  z-index: 2;
  left: 0;
  top: -35px;
}
.team-card-wrap {
  // background: url('@/assets/upgrade/open/listbg.png') no-repeat;
  background: linear-gradient(to right, rgb(143, 5, 202), rgb(11, 11, 96));
  clip-path: polygon(0 0, 100% 0, 100% 100%, 30px 100%, 0 calc(100% - 30px));
  background-size: 100% 100%;
  margin-left: 50px;
  margin-top: 60px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 30px 16px 60px;
  .card-header-left {
    display: flex;
    .team-avatar {
      background: url('@/assets/upgrade/open/listLeft.png') no-repeat;
      background-size: contain;
      width: 46px;
      height: 46px;
      display: flex;
      justify-content: center;
      align-items: center;
      img {
        width: 44px;
        height: 44px;
        border-radius: 50%;
      }
    }
    .card-header-info {
      margin-left: 10px;
      
      .team-name {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 16px;
        padding: 0 4px;
        border-bottom: 1px solid #fff;
      }
      .people-num {
        font-size: 12px;
        margin-top: 2px;
      }
    }
  }
  .card-header-btn {
    background-image: var(--bg-btn);
    background-size: 100% 100%;
    background-repeat: no-repeat;
    width: 150px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    color: #fff;
    font-size: 14px;
    cursor: pointer;
  }
}
.card-box-list {
  display: flex;
  flex-wrap: wrap;
  padding: 0 30px 14px 20px;
  .card-box-list-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 10px;
    .avatar-wrap {
      position: relative;
    }
    img {
      width: 34px;
      height: 34px;
      border-radius: 6px;
      border: 1px solid #f2a814;
      margin-right: 8px;
    }
    .captain {
      background-color: #f45c41;
      color: #fff;
      font-size: 12px;
      padding: 0 4px;
      border-radius: 3px;
      position: absolute;
      left: -8px;
      bottom: -4px;
      z-index: 2;
    }
    .user-name {
      white-space: nowrap; /* 防止文本换行 */
      overflow: hidden; /* 隐藏溢出的内容 */
      text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
      max-width: 50px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      font-size: 14px;
    }
  }
}
</style>