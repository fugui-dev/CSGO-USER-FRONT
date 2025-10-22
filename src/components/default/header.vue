<template>
  <div class="header-wrapper">
    <img class="bg" src="@/assets/images/header/bg.png" alt="" />
    <div class="header-menu">
      <div
        v-for="(item, index) in menuList"
        :key="index"
        class="menu-item"
        :class="{ active: route.path === item.path }"
        @click="toMenu(item)"
      >
        {{ item.name }}
      </div>
      <div class="top-info">
        <TopInfo v-model:show-popover="showPopover" />
      </div>
    </div>
  </div>
  <RechargeModal ref="rechargeModalRef" />
</template>

<script lang="ts" setup>
import RechargeModal from "@/components/RechargeModal/index.vue";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
import { ref } from "vue";
const rechargeModalRef = ref();
const menuList = [
  { name: "首页", path: "/" },
  { name: "ROLL房", path: "/roll" },
  { name: "个人中心", path: "/user/base" },
  { name: "分享", path: "/user/promote" },
  { name: "魔方", path: "" },
  { name: "支付", path: "" },
  { name: "免费折扣", path: "" },
];
import { ElMessage } from "element-plus";
const toMenu = (item: { name: string; path: string }) => {
  if (item.path) {
    router.push(item.path);
  } else {
    ElMessage("敬请期待");
  }
};
</script>

<style scoped lang="scss">
.header-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  margin: 0 auto;
  z-index: 10;
  .bg {
    width: 100%;
    height: 80px;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
  }
  .header-menu {
    height: 68px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 18px;
    text-align: center;
    line-height: 68px;
    .menu-item {
      width: 123px;
      height: 100%;
      cursor: pointer;
      &.active {
        background: url("@/assets/images/header/active-menu.png") no-repeat;
        background-size: 100% 100%;
      }
    }
    .top-info {
      margin-left: 20px;
    }
  }
}
</style>
