<script setup>
import Layout from "@/components/Layout.vue";
import {computed, onBeforeMount, ref} from "vue";
import {requireImg} from "@/utils/common";
import { useRoute } from "vue-router";

const route = useRoute()
const active = ref(0)
const navList = ref([{
  name: '报名',
  value: 0,
  path: ['/match-sign-up']
}, {
  name: '对阵',
  value: 1,
  path: ['/match-against', '/match-against-detail', '/match-against-fight']
}, {
  name: '助威记录',
  value: 2,
  path: ['/match-cheer']
}, {
  name: '往期记录',
  value: 3,
  path: ['/match-history']
}])

const changeActive = (val) => {
  active.value = val
}

onBeforeMount(() => {
  const currNav = navList.value.find(item => item.path.includes(route.path))
  active.value = currNav ? currNav.value : 0
})

</script>

<template>
  <Layout :style="{
      '--bg-tab1':requireImg('/home/t0.png',true),
      '--bg-tab2':requireImg('/home/t1.png',true),
      '--bg-header':requireImg('/level/3.png',true),
      '--bg-battle':requireImg('/bg/bg-login-pc.png',true),
    }">
    <template #item>
      <div class="bg bg-battle"></div>
      <div class="detail-container">
        <div class="nav">
          <router-link class="nav-item" v-for="(i,index) in navList" :class="{'active':active===i.value}" :key="index"
              @click="changeActive(i.value)" :to="i.path[0]">
            <span>{{ i.name }}</span>
          </router-link>
        </div>
        <slot></slot>
      </div>
    </template>
  </Layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.bg-battle {
  background-image: var(--bg-battle);
}

.nav {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  margin-bottom: 20px;
  @include mobile{
    justify-content: space-evenly;
  }


  &-item {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "PingFang Regular", sans-serif;
    cursor: pointer;
    background: #27263d;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px));
    flex-shrink: 0;

    width: 170px;
    height: 48px;
    font-size: 16px;
    margin-right: 20px;

    @include mobile{
      width: 22%;
      margin-right: 0;
    }

    span {
      filter: drop-shadow(0px 0px 4.3px #FF4545A6);
      font-size: 16px;
    }


    @include mobile {
      height: 40px;
    }

    &.active {
      background: linear-gradient(to right, rgb(143, 5, 202), rgb(11, 11, 96));
    }

  }
}

/* 响应式调整 */
@media (max-width: 768px) {
}
</style>
