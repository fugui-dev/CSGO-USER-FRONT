<script setup>
import { computed, ref, watch } from "vue";
import { requireImg } from "@/utils/common";

const props = defineProps({
  cardData: {
    type: Object,
    required: true,
  },
});

const statusMap = {
  0: "等待中",
  1: "进行中",
  2: "已结束",
};
const modelMap = {
  0: "欧皇",
  1: "非酋",
};

const boxList = computed(() => {
  let arr = [];
  const boxDataMap = props.cardData.boxDataMap;
  for (const key in boxDataMap) {
    if (boxDataMap.hasOwnProperty(key)) {
      const num = boxDataMap[key].number;
      if (typeof num === "number" && num >= 1) {
        for (let i = 0; i < num; i++) {
          arr.push(boxDataMap[key]);
        }
      }
    }
  }
  return arr;
});

const statusColor = computed(() => {
  switch (props.cardData.status) {
    case "0":
      return "#FF952A";
    case "1":
      return "#FF3C2A";
    case "2":
      return "#602bCF";
    default:
      return "#AAAAAA";
  }
});
</script>
<template>
  <div class="battle-card-container">
    <!-- 头部 -->
    <div class="card-header">
      <div class="card-status" :style="{ backgroundColor: statusColor }">
        {{ statusMap[cardData.status] }}
      </div>
      <div class="card-header-right">
        <div class="card-model">{{ modelMap[cardData.model] }}模式</div>
        <div class="card-round-number">{{ cardData.roundNumber }}回合</div>
      </div>
    </div>
    <!-- 中间 -->
    <div class="card-main">
      <div>
        <!-- 总金额 -->
        <div class="total-price">
          <img
            src="@/assets/images/battle/battle-coin.png"
            class="coin"
            alt=""
          />
          <div>{{ cardData.boxPriceTotal }}</div>
        </div>
        <!-- 座位列表 -->
        <div class="seat-list">
          <div
            class="seat-list-item"
            v-for="item in cardData.seats"
            :key="item.code"
          >
            <div v-if="item.status === 0" class="empty-seat">
              <div class="horizontal-line"></div>
              <div class="vertical-line"></div>
            </div>
            <div class="avatar-wrapper" v-else>
              <img class="avatar" :src="item.avatar" alt="" />
              <img
                class="avatar-bg"
                src="@/assets/images/battle/avatar-bg.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      <!-- 宝箱列表 -->
      <div class="card-box-list">
        <div
          class="card-box-list-item"
          v-for="(item, key) in boxList"
          :key="key"
        >
          <div class="bx">
            <img :src="item.boxImg01" class="bj" alt="" />
            <img :src="item.boxImg02" class="wq" alt="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.battle-card-container {
  width: 331px;
  min-height: 368px;
  background: url("@/assets/images/battle/battle-bg.png") no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  margin-left: -10px;
  padding: 20px 30px 0;
  &:nth-child(3) {
    margin-left: 0px;
  }
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
  }
  .card-header-right {
    display: flex;
    div {
      margin-right: 8px;
      font-weight: 500;
      font-size: 17px;
      color: #ffcc69;
    }
  }
}
.card-main {
  padding-bottom: 20px;
  flex: 1;
}
.total-price {
  line-height: 29px;
  font-weight: 500;
  font-size: 19px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 22px;
  .coin {
    width: 29px;
    height: 29px;
    margin-right: 10px;
  }
}
.seat-list {
  display: flex;
  justify-content: center;
  margin-top: 15px;
  .empty-seat {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    border: 1px solid #aaa;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(20, 20, 20, 0.66);
    margin-right: 6px;
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
  .avatar-wrapper {
    width: 58px;
    height: 58px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-right: 6px;
    .avatar {
      width: 39px;
      height: 39px;
      border-radius: 50%;
      display: block;
    }
    .avatar-bg {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 58px;
      height: 58px;
    }
  }
}
.card-box-list {
  margin: 20px 0 0;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  .card-box-list-item {
    width: 60px;
    height: 47px;
    margin-bottom: 12px;
    margin-left: 1px;
    .bx {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: center;
      img {
        width: 100%;
      }
      .wq {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 3;
        width: 50%;
      }
    }
  }
}
</style>
