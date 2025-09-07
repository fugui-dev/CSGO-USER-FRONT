<script setup>
import {computed, onMounted, ref} from "vue";
import {getMatchCheerListApi} from "@/api/champion";
import {requireImg} from "@/utils/common";
import Detail from './Detail.vue';

const loading = ref(false)
const cheerList = ref([])

const getMatchCheerList = () => {
  loading.value = true
  const matchId = Number(window.sessionStorage.getItem('matchId'))
  getMatchCheerListApi({
    matchId: matchId
  }).then(res => {
    if (res.data && res.data.length) {
      cheerList.value = res.data
    }
  }).finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  getMatchCheerList()
})

</script>

<template>
  <Detail>
    <div class="cheer-container" v-loading="loading">
      <div class="cheer-list" v-if="cheerList.length">
        <div class="cheer-list-header">
          <div>队伍</div>
          <div>助威用户</div>
          <div>助威金额</div>
        </div>
        <div :class="['cheer-list-item', index % 2 === 1 ? 'highlight' : 'non-highlight']" v-for="(item, index) in cheerList" :key="item.id">
          <div class="cheer-list-item-left">
            <img :src="item.teamAvatar" alt="">
            <span>{{ item.teamName }}</span>
          </div>
          <div class="cheer-list-item-center">
            <img :src="item.userAvatar" alt="">
            <span>{{ item.userName }}</span>
          </div>
          <div class="cheer-list-item-right">
            <img :src="requireImg('/coin1.png',false)" alt="">
            <span>{{ item.amount }}</span>
          </div>
        </div>
      </div>
      <div class="empty-box" v-else>
        <p>暂无数据</p>
      </div>
    </div>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.cheer-container {
  position: relative;
  .cheer-list {
    width: 94%;
    margin: 0 auto;
  }
  .cheer-list-header {
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
  .cheer-list-item {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 3px;
    padding: 5px 10px;
    .cheer-list-item-left {
      display: flex;
      align-items: center;
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
    .cheer-list-item-center {
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 38px;
        height: 38px;
        border-radius: 6px;
        border: 1px solid #380bcd;
        margin-right: 4px;
        white-space: nowrap; /* 防止文本换行 */
        overflow: hidden; /* 隐藏溢出的内容 */
        text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
        max-width: 120px;
      }
      span {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 13px;
      }
    }
    .cheer-list-item-right {
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
  position: relative;
}

/* 响应式调整 */
@media (max-width: 768px) {
}
</style>
