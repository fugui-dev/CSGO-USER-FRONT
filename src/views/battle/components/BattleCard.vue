<script setup>
import {computed, ref, watch} from "vue";
import {requireImg} from "@/utils/common";

const props = defineProps({
  cardData: {
    type: Object,
    required: true
  }
});

const statusMap = {
  '0': '等待中',
  '1': '进行中',
  '2': '已结束',
  '3': '已结束', // 房主主动结束
  0: '等待中',
  1: '进行中',
  2: '已结束',
  3: '已结束' // 房主主动结束
}
const modelMap = {
  '0': '欧皇',
  '1': '非酋',
  0: '欧皇',
  1: '非酋'
}

const boxList = computed(() => {
  let arr = []
  const boxDataMap = props.cardData.boxDataMap
  for (const key in boxDataMap) {
    if (boxDataMap.hasOwnProperty(key)) {
      const num = boxDataMap[key].number;
      if (typeof num === 'number' && num >= 1) {
        for (let i = 0; i < num; i++) {
          arr.push(boxDataMap[key]);
        }
      }
    }
  }
  return arr
})

// 获取状态文本
const statusText = computed(() => {
  const status = props.cardData.status
  const text = statusMap[status] || statusMap[String(status)] || '未知'
  return text
})

// 获取模式文本
const modelText = computed(() => {
  const model = props.cardData.model
  return modelMap[model] || modelMap[String(model)] || '未知'
})

const statusColor = computed(() => {
  const status = props.cardData.status
  // 同时支持字符串和数字
  if (status === '0' || status === 0) return '#FF952A'
  if (status === '1' || status === 1) return '#FF3C2A'
  if (status === '2' || status === 2 || status === '3' || status === 3) return '#602bCF' // 状态2和3都表示已结束
  return '#AAAAAA'
})

</script>
<template>
    <div class="battle-card-container" :style="{
        '--bg-card':requireImg('/level/2.png',true),
        '--bg-box':requireImg('/v2/bg/bg-roll-room.png',true)
      }">
      <!-- 头部 -->
      <div class="card-header">
        <div class="card-status" :style="{ backgroundColor: statusColor }">{{ statusText }}</div>
        <div class="card-header-right">
          <div class="card-model">{{ modelText }}模式</div>
          <div class="card-round-number">{{ cardData.roundNumber }}回合</div>
        </div>
      </div>
      <!-- 中间 -->
      <div class="card-main">
        <div>
          <!-- 总金额 -->
          <div class="total-price">
            <img :src="requireImg('/coin1.png',false)" alt="">
            <div>{{ cardData.boxPriceTotal }}</div>
          </div>
          <!-- 座位列表 -->
          <div class="seat-list">
            <div class="seat-list-item" v-for="item in cardData.seats" :key="item.code">
              <div v-if="item.status === 0" class="empty-seat">
                <div class="horizontal-line"></div>
                <div class="vertical-line"></div>
              </div>
              <img :src="item.avatar" alt="" v-else>
            </div>
          </div>
        </div>
        <!-- 宝箱列表 -->
        <div class="card-box-list">
          <div class="card-box-list-item" v-for="(item, key) in boxList" :key="key">
            <div class="bx">
              <img :src="item.boxImg01" class="bj" alt="">
              <img :src="item.boxImg02" class="wq" alt="">
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped lang="scss">
.battle-card-container {
  background-image: var(--bg-card);
  background-color: rgba(50, 50, 50, 0.66);
  background-position: bottom;
  background-repeat: repeat-x;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  justify-content: space-between;
  .card-status {
    height: 28px;
    line-height: 28px;
    font-size: 14px;
    padding: 0 14px;
    border-top-left-radius: 12px;
    border-bottom-right-radius: 12px;
    color: #ffffff; // 确保文字颜色为白色
    font-weight: 500; // 加粗文字以便更清晰
  }
  .card-header-right {
    display: flex;
    div {
      margin-right: 8px;
      height: 28px;
      line-height: 28px;
      font-size: 14px;
    }
  }
}
.card-main {
  padding: 0 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.total-price {
  font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
  line-height: 1.5em;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
  img {
    width: 10px;
    margin-right: 3px;
  }
}
.seat-list {
  display: flex;
  justify-content: center;
  margin-top: 12px;
  flex-wrap: wrap;
  .empty-seat {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid #aaa;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(20, 20, 20, 0.66);
    margin-right: 8px;
    margin-bottom: 8px;
    .horizontal-line {
      width: 13px;
      height: 1px;
      background-color: #efefef;
    }
    .vertical-line {
      width: 1px;
      height: 13px;
      background-color: #efefef;
      transform: translateX(-7px);
    }
  }
  img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid #f2a814;
    background-color: rgba(20, 20, 20, 0.66);
    margin-right: 8px;
    margin-bottom: 8px;
  }
}
.card-box-list {
  background-image: var(--bg-box);
  margin: 4px 0 8px 0;
  padding-top: 8px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  .card-box-list-item {
    width: 50px;
    height: 30px;
    margin-bottom: 8px;
    .bx {
      width: 100%;
      max-width: 191px;
      max-height: 182px;
      margin-bottom: 3px;
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: center;
      img{
        width: 60%;
      }
      .wq{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 3;
        width: 45%;
        height: 45%;
      }
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: center;
    .card-status {
      width: 50%;
      font-size: 12px;
      border-top-left-radius: 0;
      border-bottom-right-radius: 12px;
      border-bottom-left-radius: 12px;
      text-align: center;
    }
    .card-header-right {
      margin-top: 4px;
    }
  }
}
</style>
