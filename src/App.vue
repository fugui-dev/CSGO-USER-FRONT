<script setup>
import { onMounted } from "vue";
import { useStore } from "@/store/index.js";

onMounted(() => {
  try {
    useStore().setUserInfo(localStorage.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : {})
  } catch (e) {
    console.log(e)
  }
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
