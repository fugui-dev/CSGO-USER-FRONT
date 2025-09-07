<script setup>
import {computed, onMounted, ref} from "vue";
import {getMatchStageApi, getTeamListApi} from "@/api/champion";
import Detail from './Detail.vue';
import Level from "./components/Level.vue";
import {requireImg} from "@/utils/common";

const loading = ref(false)
const levelData = ref([])
const championTeamInfo = ref({})
const teamRankList = ref([])
const active = ref(0)
const navList = ref([{
  'name': '晋级图',
  'value': 0
}, {
  'name': '总冠军',
  'value': 1
}, {
  'name': '队伍排名',
  'value': 2
}])
const matchId = computed(() => Number(window.sessionStorage.getItem('historyMatchId')))

const changeActive = (val) => {
  active.value = val
  if (active.value === 0) {
    getMatchStageList()
  } else if (active.value === 1) {
    getChampionTeamInfo()
  } else {
    getTeamRank()
  }
}

// 获取比赛阶段
const getMatchStageList = () => {
  loading.value = true
  getMatchStageApi({
    matchId: matchId.value
  }).then(res => {
    if (res.data && res.data.length) {
      levelData.value = res.data
    }
  }).finally(() => {
    loading.value = false
  })
}

// 获取冠军队伍
const getChampionTeamInfo = () => {
  loading.value = true
  getTeamListApi({
    matchId: matchId.value,
    champion: true
  }).then(res => {
    if (res.data && res.data.length) {
      championTeamInfo.value = res.data[0]
    }
  }).finally(() => {
    loading.value = false
  })
}

// 获取队伍排名
const getTeamRank = () => {
  loading.value = true
  getTeamListApi({
    matchId: matchId.value,
    champion: false
  }).then(res => {
    if (res.data && res.data.length) {
      teamRankList.value = res.data
      teamRankList.value.sort((a, b) => a.rank - b.rank)
    }
  }).finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  getMatchStageList()
})

</script>

<template>
  <Detail>
    <div class="history-detail-container" v-loading="loading" :style="{
        '--bg-user':requireImg('/level/1.png',true),
      }">
      <div class="nav">
        <div class="nav-item" v-for="(i,index) in navList" :class="{'active':active===i.value}" :key="index"
            @click="changeActive(i.value)">
          <span>{{ i.name }}</span>
        </div>
      </div>
      <!-- 晋级图 -->
      <Level v-if="active === 0 && levelData.length" :data="levelData"/>
      <!-- 冠军队伍 -->
      <div class="champion-team" v-if="active === 1">
        <div class="level-1">
          <div class="rank-winner">
            <div class="winner-avatar">
              <img :src="championTeamInfo.avatar" alt="">
            </div>
            <p>{{ championTeamInfo.name }}</p>
            <div class="avatar-bg"></div>
          </div>
        </div>
        <!-- 用户列表 -->
        <div class="user-list">
          <div class="user-list-item" v-for="item in championTeamInfo.matchUserList" :key="item.id">
            <img :src="item.userAvatar" alt="" class="user-avatar">
            <p>{{ item.userName }}</p>
            <div class="mz">
              <img :src="requireImg('/coin1.png',false)" alt="">
              <div class="score">{{ item.totalScore }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 队伍排名 -->
      <div class="team-rank" v-if="active === 2">
        <div class="team-rank-list" v-if="teamRankList.length">
          <div class="team-rank-list-header">
            <div>队伍</div>
            <div>胜场</div>
            <div>积分</div>
          </div>
          <div :class="['team-rank-list-item', index % 2 === 1 ? 'highlight' : 'non-highlight']" v-for="(item, index) in teamRankList" :key="item.id">
            <div class="team-rank-list-item-left">
              <div class="serial-num">{{ index + 1 }}</div>
              <img :src="item.avatar" alt="">
              <span>{{ item.name }}</span>
            </div>
            <div class="team-rank-list-item-center">
              <span>{{ item.winCount }}</span>
            </div>
            <div class="team-rank-list-item-right">
              <img :src="requireImg('/coin1.png',false)" alt="">
              <span>{{ item.totalScore }}</span>
            </div>
          </div>
        </div>
        <div class="empty-box" v-else>
          <p>暂无数据</p>
        </div>
      </div>
    </div>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.history-detail-container {
  position: relative;
  .nav {
    display: flex;
    align-items: center;
    margin-top: 30px;
    @include mobile{
      justify-content: space-evenly;
    }


    &-item {
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "PingFang Regular", sans-serif;
      cursor: pointer;
      background: #FFF5F5;
      flex-shrink: 0;

      width: 153px;
      height: 48px;
      border-radius: 30px;
      font-size: 16px;
      margin-right: 32px;

      @include mobile{
        width: 104px;
        margin-right: 0;
      }

      span {
        filter: drop-shadow(0px 0px 4.3px #FF4545A6);
        font-size: 16px;
      }


      @include mobile {
        height: 40px;
      }

      &:first-child {
        background: linear-gradient(90.15deg, #FF3C2A -4.19%, rgba(149, 0, 0, 0) 99.85%);

      }

      &:nth-child(2) {
        background: linear-gradient(90.15deg, #FF952A -4.19%, rgba(149, 87, 0, 0) 99.85%);

      }

      &:nth-child(3) {
        background: linear-gradient(90.15deg, #A27A7A -4.19%, rgba(152, 116, 116, 0) 99.85%);

      }

      &.active {
        position: relative;

        &::after {
          content: '';
          position: absolute;
          width: 40px;
          height: 4px;
          border-radius: 34px;
          background: white;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);

        }
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
      background-image: url('/public/avatarBorder.png');
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
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      font-size: 15px;
    }
    .avatar-bg {
      // TODO
      background-image: url('/public/avatarBg.png');
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
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
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
    background: linear-gradient(90.47deg, rgba(202, 62, 39, 0) 0.31%, rgba(30, 30, 30) 51.13%, rgba(201, 61, 38, 0) 100.98%);
    width: 100%;
    font-size: 13px;
    height: 21px;
    line-height: 21px;
    margin: 0 0 4px 0;
    justify-content: center;
    .score {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    }
  }
  .team-rank-list {
    width: 94%;
    margin: 20px auto;
  }
  .team-rank-list-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 3px;
    padding: 5px 10px;
    height: 46px;
    box-sizing: border-box;
    background: linear-gradient(to right, rgb(91, 21, 7), rgb(66, 1, 15));
    div {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      font-size: 14px;
      display: flex;
      align-items: center;
    }
    div:nth-of-type(2) {
      justify-content: center;
    }
    div:nth-of-type(3) {
      justify-content: end;
    }
  }
  .highlight {
    background: linear-gradient(to right, rgb(143, 5, 202), rgb(11, 11, 96));
  }
  .non-highlight {
    background: linear-gradient(to right, rgb(105, 94, 116), rgb(24, 24, 36));
  }
  .team-rank-list-item {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 3px;
    padding: 5px 10px;
    .team-rank-list-item-left {
      display: flex;
      align-items: center;
      .serial-num {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid #aaa;
        background-color: #444;
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 18px;
        color: #eee;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 12px;
      }
      img {
        width: 38px;
        height: 38px;
        border-radius: 6px;
        border: 1px solid #f2b307;
        margin-right: 4px;
      }
      span {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 13px;
        white-space: nowrap; /* 防止文本换行 */
        overflow: hidden; /* 隐藏溢出的内容 */
        text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
        max-width: 120px;
      }
    }
    .team-rank-list-item-center {
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 13px;
      }
    }
    .team-rank-list-item-right {
      display: flex;
      align-items: center;
      justify-content: end;
      padding-left: 4px;
      img {
        width: 10px;
        height: 13px;
        margin-right: 3px;
      }
      span {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 13px;
      }
    }
  }
  .team-rank-list-item:nth-of-type(2) {
    .serial-num {
      border: 1px solid #f2a814;
      color: #684412;
      background: linear-gradient(#f8debb, #fab71b);
    }
  }
  .team-rank-list-item:nth-of-type(3) {
    .serial-num {
      border: 1px solid #ccc;
      color: #ffffff;
      background: linear-gradient(#e9e7e3, #646463);
    }
  }
  .team-rank-list-item:nth-of-type(4) {
    .serial-num {
      border: 1px solid #f0edd9;
      color: #ffffff;
      background: linear-gradient(#e8dabf, #9c7315);
    }
  }
}
.empty-box {
  font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
  font-size: 18px;
  color: #eee;
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
}
</style>
