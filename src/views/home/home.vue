<template>
  <layout>
    <div class="home-wrapper">
      <div class="open" @click="open">
        <img :src="luckyOpenBox" alt="">
      </div>
      <div class="enter-wrapper">
        <div class="enter-item" @click="enter(item)" v-for="item in enterList">
          <img class="img" :src="item.img" alt="" />
          <div class="text">{{ item.text }}</div>
        </div>
      </div>
      <div class="enter2-wrapper">
        <div class="enter-item" @click="enter(item)" v-for="item in enterList2">
          <img class="img" :src="item.img" alt="" />
          <div class="text">{{ item.text }}</div>
        </div>
      </div>
      <div class="tip">
        <img class="icon" src="@/assets/images/home/laba.png" alt="" />
        <div class="text">
          本平台禁止成年人消费,所有盲盒均为消遣娱乐，请勿沉迷，每次开启盲盒为独立
        </div>
      </div>
    </div>
  </layout>
</template>

<script lang="ts" setup>
import Layout from "@/components/Layout.vue";
import arenaImg from "@/assets/images/home/arena.gif";
import shopImg from "@/assets/images/home/shop.gif";
import rollImg from "@/assets/images/home/roll.gif";
import item1 from "@/assets/images/home/item1.gif";
import item2 from "@/assets/images/home/item2.gif";
import item3 from "@/assets/images/home/item3.gif";
import item4 from "@/assets/images/home/item4.gif";
import item5 from "@/assets/images/home/item5.gif";
import luckyOpenBox from "@/assets/images/home/lucky_open_box.gif";
const enterList = [
  {
    img: arenaImg,
    text: "arena",
    path: "/battle",
  },
  {
    img: shopImg,
    text: "shop",
    path: "/shop",
  },
  {
    img: rollImg,
    text: "roll",
    path: "/roll",
  },
];
const enterList2 = [
  {
    img: item1,
    text: "幸运饰品",
    path: "/upgrade",
  },
  {
    img: item2,
    text: "武道会",
    path: "",
  },
  {
    img: item3,
    text: "活动",
    path: "/center",
  },
  {
    img: item4,
    text: "VIP",
    path: "",
  },
  {
    img: item5,
    text: "夺冠之路",
    path: "/champion",
  },
];
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useStore } from "@/store";
const router = useRouter();
const store = useStore();
const open = () => {
  router.push("/required");
};
const enter = (item: { img: string; text: string; path: string }) => {
  // VIP 特殊处理：需要登录才能跳转到福利中心
  if (item.text === "VIP") {
    if (!store.isLogin) {
      ElMessage("请先登录");
      router.push("/login");
      return;
    }
    router.push("/user/benefits");
    return;
  }
  
  if (item.path) {
    router.push(item.path);
  } else {
    ElMessage("敬请期待");
  }
};
</script>

<style scoped lang="scss">
@use "@/style" as *;

.home-wrapper {
  width: 100%;
  min-height: 100vh;
  background: url("@/assets/images/home/bg.png") no-repeat;
  background-size: 100% auto;
  background-position: 0 60px;
  background-color: #353b43;
  padding-top: 22vw;
  @include mobile {
    overflow: visible;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 30vw;
  }

  .open {
    margin: 0 auto;
    cursor: pointer;
    width: 54vw;
    img {
      width: 100%;
    }
    @include mobile {
      width: 70vw;
    }
  }
  .tip {
    width: 907px;
    height: 54px;
    line-height: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: url("@/assets/images/home/tip.png") no-repeat;
    background-size: 100% 100%;
    margin: 3vw auto 2vw;

    @include mobile {
      width: 80%;
      line-height: 24px;
      margin: 2vw auto;
    }

    .icon {
      width: 26px;
      height: 26px;
      margin-right: 24px;
      @include mobile {
        width: 16px;
        height: 16px;
        margin-right: 10px;
      }
    }
    .text {
      font-weight: 500;
      font-size: 17px;
      color: #b4c7c9;
      @include mobile {
        font-size: 12px;
      }
    }
  }
  .enter-wrapper {
    margin-top: 6vw;
    display: flex;
    align-items: center;
    justify-self: center;
    .enter-item {
      cursor: pointer;
      & + .enter-item {
        margin-left: 10vw;
      }
      .img {
        width: 215px;
        height: 303px;
        @include mobile {
          width: 80px;
          height: 120px;
        }
      }
      .text {
        text-align: center;
        margin-top: 23px;
        font-weight: 500;
        font-size: 23px;
        color: #f2ffef;
        opacity: 0.4;
        @include mobile {
          font-size: 12px;
          margin-top: 10px;
        }
      }
    }
  }
  .enter2-wrapper {
    margin-top: 8vw;
    display: flex;
    align-items: center;
    justify-self: center;
    padding-bottom: 4vw;
    .enter-item {
      cursor: pointer;
      & + .enter-item {
        margin-left: 5vw;
      }
      .img {
        width: 176px;
        height: 176px;
        @include mobile {
          width: 80px;
          height: 70px;
        }
      }
      .text {
        text-align: center;
        margin-top: 14px;
        font-weight: 500;
        font-size: 30px;
        color: #f2ffef;
        @include mobile {
          font-size: 14px;
        }
      }
    }
  }
}
</style>
