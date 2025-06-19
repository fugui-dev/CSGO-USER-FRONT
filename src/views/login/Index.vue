<script setup>

import {requireImg} from "@/utils/common";
import {useRoute} from "vue-router";
import Login from "@/views/login/components/Login.vue";
import {useStore} from "@/store";
import LoginMini from "@/views/login/components/LoginMini.vue";
import Register from "@/views/login/components/Register.vue";
import RegisterMini from "@/views/login/components/RegisterMini.vue";

const route = useRoute()
const store = useStore()
</script>

<template>
  <div class="login" :style="{
    '--bg-login-pc': requireImg('/v2/bg/bg-login-pc.png', true),
  }">
    <div class="tw-w-full tw-h-full tw-overflow-hidden tw-relative" v-if="store.isPC">
      <video class="tw-w-full tw-h-full tw-object-cover" muted loop playsinline autoplay>
        <source :src="requireImg('/v2/v2.mp4')" type="video/mp4">
      </video>
    </div>

    <div class="bg" v-if="store.isPC"></div>
    <div class="container" v-if="store.isPC">
      <Login v-if="route.name === 'Login'"></Login>
      <Register v-if="route.name === 'Register'"></Register>
    </div>
    <div v-if="!store.isPC" style="width: 100%;height: 100%">
      <LoginMini v-if="route.name === 'Login'"></LoginMini>
      <RegisterMini v-if="route.name === 'Register'"></RegisterMini>
    </div>

  </div>

</template>

<style scoped lang="scss">
.login {
  width: 100%;
  height: 100%;
  background: rgb(1, 3, 23);
  background-size: 100% 100%;
  display: flex;
  z-index: 20;
  font-family: "PingFang M", "Microsoft YaHei", sans-serif;
  position: relative;

  :deep(.el-checkbox__inner) {
    --el-checkbox-checked-bg-color: rgb(199, 32, 23) !important;
    --el-checkbox-checked-input-border-color: rgb(199, 32, 23) !important;
    --el-checkbox-input-border-color-hover: rgb(199, 32, 23) !important;
    background-color: transparent;
  }

  .bg {
    //背景图保持高度100%，宽度为图片大小 图片保持右边完整展示 左边压缩
    background-image: var(--bg-login-pc);
    background-size: 100% 100%;
    background-position: right top;
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;

  }

  .container {
    position: absolute;
    right: 0;
    width: 500px;
    height: 100%;
    background: #200E0AE5;

  }
}
</style>
