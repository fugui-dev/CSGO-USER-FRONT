<script setup>
import { computed, ref, watch } from "vue";
import waitBg from "@/assets/images/battle/wait.png";
import ingBg from "@/assets/images/battle/ing.png";
import endBg from "@/assets/images/battle/end.png";

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
  3: "已结束", // 房主主动结束
  "0": "等待中",
  "1": "进行中",
  "2": "已结束",
  "3": "已结束", // 房主主动结束
};
const statusBgMap = {
  0: waitBg,
  1: ingBg,
  2: endBg,
  3: endBg, // 房主主动结束，使用已结束的背景图
  "0": waitBg,
  "1": ingBg,
  "2": endBg,
  "3": endBg, // 房主主动结束，使用已结束的背景图
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
  const status = props.cardData.status;
  // 同时支持字符串和数字
  if (status === "0" || status === 0) return "#FF952A";
  if (status === "1" || status === 1) return "#FF3C2A";
  if (status === "2" || status === 2 || status === "3" || status === 3) return "#602bCF"; // 状态2和3都表示已结束
  return "#AAAAAA";
});
</script>
<template>
  <div class="battle-card-container">
    <!-- 头部 -->
    <div class="card-header">
      <div
        class="card-status"
        :style="{ backgroundImage: `url(${statusBgMap[cardData.status] || statusBgMap[String(cardData.status)] || endBg})` }"
      >
        {{ statusMap[cardData.status] || statusMap[String(cardData.status)] || "未知" }}
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
            <div v-if="item.status === 0" class="empty-seat"></div>
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
@use "@/style" as *;
.battle-card-container {
  width: 331px;
  min-height: 368px;
  background: url("@/assets/images/battle/battle-bg.png") no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  margin-left: -10px;
  padding: 7px 30px 0 31px;
  @include mobile {
    width: 50%;
    padding: 7px 16px;
    height: auto;
    min-height: 240px;
  }
  &:nth-child(3) {
    margin-left: 0px;
  }
}
.card-header {
  display: flex;
  justify-content: space-between;
  line-height: 36px;
  @include mobile {
    line-height: 24px;
    width: 100%;
  }
  .card-status {
    text-align: center;
    width: 98px;
    height: 36px;
    line-height: 36px;
    font-size: 16px;
    color: #ffffff;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    @include mobile {
      width: auto;
      height: 24px;
      line-height: 24px;
      font-size: 12px;
      padding-right: 5px;
    }
  }
  .card-header-right {
    display: flex;
    div {
      margin-right: 8px;
      font-weight: 500;
      font-size: 17px;
      color: #ffcc69;
      @include mobile {
        font-size: 12px;
        margin-right: 0;
      }
    }
    div:nth-of-type(1) {
      @include mobile {
        margin-right: 4px;
      }
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
  margin-top: 16px;
  @include mobile {
    margin-top: 0;
    font-size: 12px;
    line-height: 22px;
  }
  .coin {
    width: 29px;
    height: 29px;
    margin-right: 10px;
    @include mobile {
      width: 15px;
      height: 15px;
      margin-right: 6px;
    }
  }
}
.seat-list {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  @include mobile {
    margin-top: 5px;
    gap: 3px;
  }
  .empty-seat {
    width: 41px;
    height: 41px;
    background: url("@/assets/images/battle/join.png") no-repeat;
    background-size: 100% 100%;
    margin-right: 6px;
    @include mobile {
      width: 26px;
      height: 26px;
      margin-right: 0;
    }
  }
  .avatar-wrapper {
    width: 58px;
    height: 58px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    @include mobile {
      width: 34px;
      height: 34px;
    }
    .avatar {
      width: 39px;
      height: 39px;
      border-radius: 50%;
      display: block;
      @include mobile {
        width: 24px;
        height: 24px;
      }
    }
    .avatar-bg {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 58px;
      height: 58px;
      @include mobile {
        width: 34px;
        height: 34px;
      }
    }
  }
}
.card-box-list {
  margin: 20px 0 0;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  @include mobile {
    margin: 5px 0 0;
  }
  .card-box-list-item {
    width: 60px;
    height: 47px;
    margin-bottom: 12px;
    margin-left: 1px;
    @include mobile {
      width: 25%;
      height: auto;
      margin-bottom: 0;
      margin-left: 0;
      gap: 2px;
    }
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
