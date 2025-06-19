<script setup>
import {ref} from "vue";
import {goto, requireImg} from "@/utils/common";
import {useRoute} from "vue-router";

const list = ref([{
  name: '首页',
  path: '/',
  routeName:'Home',
  icon: requireImg('nav/home.png'),
  activeIcon: requireImg('nav/home-active.png'),
}, {
  name: '经典玩法',
  path: '/upgrade',
  routeName: 'upgradeShopping',
  icon: requireImg('nav/wanfa.png'),
  activeIcon: requireImg('nav/wanfa-active.png'),
}, {
  name: 'Roll',
  path: '/roll',
  routeName:'Roll',
  icon: requireImg('nav/roll.png'),
  activeIcon: requireImg('nav/roll-active.png'),
}, {
  name: '我的',
  path: '/userMobile',
  routeName:'UserMobile',
  icon: requireImg('nav/user.png'),
  activeIcon: requireImg('nav/user-active.png'),
},
])
const route=useRoute()
console.log(route.name)
</script>

<template>
  <div class="bottom_nav">
    <div class="item" v-for="item in list" :key="item.name" >
      <div class="each" @click="goto(item.path)">
        <img :src="route.name===item.routeName?item.activeIcon:item.icon" alt="">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bottom_nav {
  display: flex;
  align-items: center;
  width: 100%;
  height: 60px;
  z-index: 100;
  position: fixed;
  bottom: 0;
  left: 0;
  background-color: black;

  .item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .each {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 12px;

      img {
        width: 20px;
        height: 20px;
        margin-bottom: 5px;
      }
    }
  }
}
</style>
