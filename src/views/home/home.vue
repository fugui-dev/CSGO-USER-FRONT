<template>
  <layout>
    <div class="home-wrapper">
      <div class="open" @click="open" />
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
import arenaImg from "@/assets/images/home/arena.png";
import shopImg from "@/assets/images/home/shop.png";
import rollImg from "@/assets/images/home/roll.png";
import item1 from "@/assets/images/home/item1.png";
import item2 from "@/assets/images/home/item2.png";
import item3 from "@/assets/images/home/item3.png";
import item4 from "@/assets/images/home/item4.png";
import item5 from "@/assets/images/home/item5.png";
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
const router = useRouter();
const open = () => {
  router.push("/required");
};
const enter = (item: { img: string; text: string; path: string }) => {
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
  height: 120vw;
  background: url("@/assets/images/home/bg.webp") no-repeat;
  background-size: 100% 135vw;
  background-position: 0 60px;
  background-color: #34393f;
  padding-top: 32vw;
  @include mobile {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    // background-size: 100% 100%;
  }

  .open {
    width: 20vw;
    height: 18vw;
    margin: 0 auto;
    cursor: pointer;
    @include mobile {
      width: 50vw;
      height: 50vw;
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
