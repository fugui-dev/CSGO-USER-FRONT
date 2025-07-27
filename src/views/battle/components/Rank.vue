<script setup>
import {ref, watch} from "vue";
import {requireImg} from "@/utils/common";
import RankList from "./RankList.vue";

const props = defineProps({
  rankData: {
    type: Object,
    required: true
  }
});

const currBannerData = ref({})

const handleTabChange = (tabPaneName) => {
  switch (tabPaneName) {
    case '0': 
      currBannerData.value = 
        props.rankData.todayFightRanking && props.rankData.todayFightRanking.length
          ? props.rankData.todayFightRanking[0] : {}
      break
    case '1':
      currBannerData.value = 
        props.rankData.yesterdayFightRanking && props.rankData.yesterdayFightRanking.length
          ? props.rankData.yesterdayFightRanking[0] : {}
      break
    default:
      currBannerData.value = {}
  }
}

watch(() => props.rankData, (newValue) => {
  if (newValue.todayFightRanking && newValue.todayFightRanking.length) {
    currBannerData.value = newValue.todayFightRanking[0];
  }
}, {
  deep: true
})

</script>
<template>
    <div class="rank-container" :style="{
        '--bg-banner':requireImg('/v2/bg/openBg.png',true),
        '--bg-winner-avatar': requireImg('/avatarBorder.png',true)
      }">
      <!-- banner区域 -->
      <div class="rank-banner">
        <div class="rank-banner-mask"></div>
        <div class="rank-winner" v-if="currBannerData.nickName">
          <div class="winner-avatar">
            <img :src="currBannerData.avatar" alt="">
          </div>
          <div class="avatar-bg"></div>
          <p>{{ currBannerData.nickName }}</p>
          <div class="price-container">
            <img :src="requireImg('/coin1.png',false)" alt="">
            <div>{{ currBannerData.totalBoxPrice }}</div>
          </div>
        </div>
      </div>
      <!-- tab区域 -->
      <div class="rank-list-wrap">
        <el-tabs type="border-card" class="rank-list-container" @tab-change="handleTabChange">
          <el-tab-pane label="今日战力排行">
            <RankList :rank-list="rankData.todayFightRanking || []"/>
            <p class="my-total-price">我的今日战力：{{ rankData.todayTotalBoxPrice ? rankData.todayTotalBoxPrice : 0 }}</p>
          </el-tab-pane>
          <el-tab-pane label="昨日战力排行">
            <RankList :rank-list="rankData.yesterdayFightRanking || []"/>
            <p class="my-total-price">我的昨日战力：{{ rankData.yesterdayTotalBoxPrice ? rankData.yesterdayTotalBoxPrice : 0 }}</p>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
</template>

<style scoped lang="scss">
.rank-container {
  width: 280px;
}
.rank-banner {
  background-image: var(--bg-banner);
  background-size: cover;
  background-repeat: no-repeat;
  width: 100%;
  height: 158px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
  .rank-banner-mask {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1;
    background-color: rgba($color: #010612, $alpha: 0.45);
  }
  .rank-winner {
    position: absolute;
    z-index: 2;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
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
        width: 60px;
        height: 60px;
        border-radius: 50%;
        transform: translate(-3px, 3px);
      }
    }
    .avatar-bg {
      // TODO
      background-image: url('/public/avatarBg.png');
      background-size: contain;
      background-repeat: no-repeat;
      width: 140px;
      height: 40px;
      margin-top: -20%;
    }
    p {
      font-size: 14px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      height: 18px;
      line-height: 18px;
    }
    .price-container {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      height: 18px;
      line-height: 18px;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 10px;
        margin-right: 3px;
      }
    }
  }
}
.rank-list-wrap {
  width: 100%;
  .my-total-price {
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    text-align: center;
  }
  ::v-deep .el-tabs__content {
    padding: 0;
  }
  ::v-deep .el-tabs--border-card {
    background-color: #202020;
    border: none;
    outline: none;
    .el-tabs__header {
      background-color: #3e1313;
      border: none;
      outline: none;
      height: 36px;
      .el-tabs__nav {
        width: 100%;
      }
      .el-tabs__item {
        height: 38px;
        width: 51%;
      }
      .el-tabs__item:hover {
        color: #ffffff;
        outline: none;
      }
      .el-tabs__item.is-active {
        outline: none;
        background-color: #202020;
        border: none;
        color: #ffffff;
      }
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .rank-container {
    width: 100%;
  }
}
</style>
