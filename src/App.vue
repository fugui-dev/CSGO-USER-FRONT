<script setup>
import { onMounted } from "vue";
import { useStore } from "@/store/index.js";
import { useUserInfo } from "@/composables/useUesrInfo.js";
import { preloadImages, requireImg } from "@/utils/common.js";
import shopBg from '@/assets/images/shop/bg.webp';
import openBoxBg from '@/assets/images/open/bg.webp';
import upgradeBg from '@/assets/images/upgrade/bg.png';
import userBg from '@/assets/images/roll/bg.png';
import userStorageBg from '@/assets/images/user/storage_bg.png';
import smeltBg from '@/assets/images/smelt/bg.png';

const store = useStore();
const { fetchUserInfo } = useUserInfo();

// 预加载常用背景图片
const preloadBackgroundImages = () => {
  const backgroundUrls = [
    shopBg,
    openBoxBg,
    upgradeBg,
    userBg,
    userStorageBg,
    smeltBg,
    requireImg("/v2/bg/openBg.png", false),
    requireImg("/v2/bg/up-bg.png", false),
  ].filter(url => url); // 过滤空值
  
  // 异步预加载，不阻塞页面渲染
  if (backgroundUrls.length > 0) {
    preloadImages(backgroundUrls).then(() => {
      console.log('背景图片预加载完成');
    }).catch(err => {
      console.warn('部分背景图片预加载失败:', err);
    });
  }
};

onMounted(async () => {
  try {
    const userInfo = localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : {};
    store.setUserInfo(userInfo);
    
    // 如果用户已登录，获取最新的用户信息
    if (userInfo && userInfo.userId) {
      await fetchUserInfo();
    }
  } catch (e) {
    console.log(e)
  }
  
  // 预加载背景图片
  preloadBackgroundImages();
  
  useStore().setIsPc(document.body.clientWidth > 1024)
  window.addEventListener('resize', () => {
    useStore().setIsPc(document.body.clientWidth > 1024)
  })
  document.addEventListener('wheel', function (e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });
  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});
})
</script>

<template>
  <router-view />
</template>

<style lang="scss">
html,
body {
  background-color: #210F0B;

  &::-webkit-scrollbar {
    display: none;
  }
}

$-pager-color: #F38901;

.el-pager li {
  background-color: rgba(0, 0, 0, 0) !important;
  border: 1px solid $-pager-color;
  color: #fff !important;
  border-radius: 0.25rem;
}

.el-pager li.is-active {
  background-color: rgba(0, 0, 0, 0) !important;
  border: 1px solid $-pager-color;
  border-radius: 0.25rem;
  color: $-pager-color !important;
}

.el-pager li:hover {
  color: $-pager-color !important;
}

.el-pagination {

  .btn-prev,
  .btn-next {
    background-color: rgba(0, 0, 0, 0) !important;
    border: 1px solid $-pager-color;
    color: #fff !important;
    border-radius: 0.25rem;

    &:hover {
      color: $-pager-color !important;
    }

    &.is-disabled {
      border-color: #666 !important;
      color: #666 !important;
      cursor: not-allowed;
    }

    .el-icon {
      color: $-pager-color !important;
    }
  }
}
</style>
