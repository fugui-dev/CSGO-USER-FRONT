<script setup>
import Layout from "@/components/Layout.vue";
import {computed, onMounted, ref} from "vue";
import {getMatchStageApi} from "@/api/champion";
import {requireImg, isNotEmptyObj} from "@/utils/common";
import {ElMessage} from "element-plus";
import luckyStar from '@/assets/openBox/luckyStar.png'
import Detail from './Detail.vue';
import { useRouter } from "vue-router";

const router = useRouter()
const loading = ref(false)
const levelData = ref([])
const statusMap = {
  '0': '未开始',
  '1': '进行中',
  '2': '已结束'
}
const statusColor = computed(() => {
  return (status) => {
    switch (status) {
      case 0: return '#FF952A';
      case 1: return '#FF3C2A';
      case 2: return '#602bCF';
      default: return '#AAAAAA';
    }
  }
})

// 获取比赛阶段
const getMatchStageList = () => {
  loading.value = true
  const matchId = Number(window.sessionStorage.getItem('matchId'))
  getMatchStageApi({
    matchId: matchId
  }).then(res => {
    if (res.data && res.data.length) {
      levelData.value = res.data
    }
  }).finally(() => {
    loading.value = false
  })
}

const handleJump = (type) => {
  window.sessionStorage.setItem('againstType', type)
  router.push('/match-against-detail')
}

onMounted(() => {
  getMatchStageList()
})

</script>

<template>
  <Detail>
    <div class="against-container" v-loading="loading" :style="{
      '--bg-level-8':requireImg('/level/3.png',true),
    }">
      <div class="match-list">
        <div class="match-list-item" v-for="item in levelData" :key="item.id" @click="handleJump(item.type)">
          <div class="match-list-item-status" :style="{ backgroundColor: statusColor(item.status) }">{{ statusMap[item.status] }}</div>
          <div class="match-list-item-title">{{ item.name }}</div>
          <div class="time">
            <img :src="luckyStar" alt="">
            <div class="label">活动时间</div>
            <div class="match-time">{{ item.startTime }} - {{ item.endTime }}</div>
          </div>
        </div>
      </div>
    </div>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.match-list {
  width: 94%;
  margin: 0 auto;
}
.match-list-item {
  background-color: rgba(50, 50, 50, 0.66);
  background-position: bottom;
  background-repeat: repeat-x;
  background-image: var(--bg-level-8);
  border-radius: 12px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  cursor: pointer;
  .match-list-item-status {
    width: 120px;
    height: 28px;
    line-height: 28px;
    font-size: 14px;
    display: flex;
    justify-content: center;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
  .match-list-item-title {
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    font-size: 28px;
    color: rgb(241, 231, 245);
    margin: 18px 0;
  }
  .time {
    display: flex;
    font-size: 16px;
    margin-bottom: 12px;
    img {
      width: 22px;
      height: 22px;
      transform: translateY(10%);
      margin-right: 4px;
    }
  }
  .label {
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    margin-right: 12px;
  }
  .match-time, .match-signup-time {
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    text-shadow:  0px 0px 4px rgb(247, 219, 77);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
}
</style>
