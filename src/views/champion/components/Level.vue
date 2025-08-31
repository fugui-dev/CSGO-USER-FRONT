<script setup>
import {computed, onBeforeMount, onMounted, ref, watch} from "vue";
import {requireImg} from "@/utils/common";
import {joinTeamApi} from "@/api/champion"
import { useRoute } from 'vue-router'
import LevelItem from "./LevelItem.vue";

const route = useRoute()

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
});

const roundColor = computed(() => {
  return (index) => {
    switch (index) {
      case 0: return '#FF952A';
      case 1: return '#FF3C2A';
      case 2: return '#602bCF';
      default: return '#FF952A';
    }
  }
})

// 晋级赛数据处理
const upgradeData = computed(() => {
  let res = {}
  for (let i = 2; i <= 4; i++) {
    const data = props.data.find(item => item.type === i)
    res[i] = []
    data.stageGroupList.forEach(item => {
      const roundData = item.stageGroupFightList.filter(ele => ele.round === 1)
      res[i] = res[i].concat(...roundData)
    });
  }
  return res
})

// 分组赛数据处理
const groupData = computed(() => {
  const data = props.data.find(item => item.type === 1)
  let res = new Array(3).fill(null).map(() => [])
  data.stageGroupList.forEach(item => {
    for (let i = 0; i < 3; i++) {
      const roundData = item.stageGroupFightList.filter(ele => ele.round === i + 1)
      res[i] = res[i].concat(...roundData)
    }
  });
  return res
})

</script>
<template>
    <div class="level-container" :style="{
        '--bg-level-2':requireImg('/level/1.png',true),
        '--bg-level-4':requireImg('/level/3.png',true),
        '--bg-level-8':requireImg('/level/4.png',true),
        '--bg-level-16':requireImg('/level/2.png',true),
      }">
      <div class="level-main">
        <div class="level-1"></div>
        <div class="level-2 common-level">
          <LevelItem
              :data="item"
              :showTitle="true"
              v-for="(item, index) in upgradeData[4]"
              :key="index"
              class="level-item-wrap" />
        </div>
        <div class="level-4 common-level">
          <LevelItem
              :data="item"
              :showTitle="true"
              v-for="(item, index) in upgradeData[3]"
              :key="index"
              class="level-item-wrap" />
        </div>
        <!-- 八强 -->
        <div class="level-8 common-level">
          <LevelItem
              :data="item"
              :showTitle="true"
              v-for="(item, index) in upgradeData[2]"
              :key="index"
              class="level-item-wrap" />
        </div>
      </div>
      <!-- 分组赛 -->
      <div class="level-group">
        <div class="level-group-title">
          <span>分组赛</span>
        </div>
        <div class="level-group-round" v-for="(item, index) in groupData" :key="index">
          <div class="level-group-round-header">
            <h2 :style="{ backgroundColor: roundColor(index) }">第 {{ index + 1 }} 回合</h2>
          </div>
          <div class="level-group-round-list">
            <LevelItem
              :data="subItem"
              :showTitle="true"
              v-for="(subItem, subIndex) in item"
              :key="subIndex"
              class="level-item-wrap" />
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped lang="scss">
.level-container {
  .common-level {
    background-color: rgba(50, 50, 50, 0.66);
    background-position: bottom;
    background-repeat: repeat-x;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    margin-top: 20px;
  }
  .level-2 {
    background-image: var(--bg-level-2);
  }
  .level-4 {
    background-image: var(--bg-level-4);
  }
  .level-8 {
    background-image: var(--bg-level-8);
  }
}
.level-group {
  .level-group-round {
    background-image: var(--bg-level-16);
    background-color: rgba(50, 50, 50, 0.66);
    background-position: bottom;
    background-repeat: repeat-x;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  .level-group-round-header {
    display: flex;
    justify-content: center;
    h2 {
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      padding: 0 28px;
      border-bottom-left-radius: 15px;
      border-bottom-right-radius: 15px;
    }
  }
  .level-group-round-list {
    display: flex;
    flex-wrap: wrap;
    cursor: pointer;
  }
}
.level-group-title {
  background: var(--bg-tab1);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  width: 94%;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  span {
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
  }
}
.level-item-wrap {
  width: 25%;
  margin: 0 auto;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .level-group {
    .level-group-round-list {
      .level-item-wrap {
        width: 50%;
      }
    }
  }
}
</style>