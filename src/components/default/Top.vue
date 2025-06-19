<script setup>
import {computed, onMounted, ref} from "vue";
import {goto, requireImg} from "@/utils/common.js";
import {useRoute} from "vue-router";
import TopInfo from "@/components/TopInfo.vue";
import {useStore} from "@/store";

const store = useStore()
const route = useRoute()
const menus = ref([
  {
    name: '饰品军需',
    routeName: 'Home',
    path: "/",
    ico: requireImg("/nav/a1.png", false),
    icoActive: requireImg("/nav/a1a.png", false),
  }, {
    name: 'Roll福利',
    routeName: 'Roll',
    path: "/roll",
    ico: requireImg("/nav/a2.png", false),
    icoActive: requireImg("/nav/a2a.png", false)
  }, {
    name: '装备升级',
    routeName: 'upgradeShopping',
    path: "/upgrade",
    ico: requireImg("/nav/a3.png", false),
    icoActive: requireImg("/nav/a3a.png", false)
  }, {
    name: '福利中心',
    routeName: 'Center',
    path: "/center",
    ico: requireImg("/nav/a4.png", false),
    icoActive: requireImg("/nav/a4a.png", false)
  },
])
const nowMenu = computed(() => {
  let findIndex = menus.value.findIndex(i => i.routeName === route.name)
  return findIndex === -1 ? 1.5 : findIndex
})
const hoverActive = ref(nowMenu.value)

const mouseEnter = (e, index) => {
  hoverActive.value = index
}

const mouseLeave = (e, index) => {
  if (hoverActive.value === index) {
    hoverActive.value = nowMenu.value
  }
}
const topRef = ref()


const getScrollTop = () => {
  return window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
}


onMounted(() => {
  topRef.value.style.backdropFilter = "blur(0)"
  document.addEventListener("scroll", (e) => {
    if (!topRef.value) return
    if (getScrollTop() > 0) {
      topRef.value.style.backdropFilter = "blur(15px)"
    } else {
      topRef.value.style.backdropFilter = "blur(0)"
    }
  })

})
const showPopover=ref(false)

</script>

<template>
  <div ref="topRef" style="width: 100%;height: 90px;position: fixed;left: 0;top: 0;  z-index: 10;" :style="{background:showPopover&&!store.isPC?'rgb(33,15,11)':'inherit'}">
    <div class="top" v-if="true">
      <div class="top-logo" v-if="!store.isPC">
        <img :src="requireImg('/logo-sd.png',false)" alt="">
      </div>
      <div class="top-nav" v-if="store.isPC">
        <div class="menu">
          <div class="menu-item" v-for="(i,index) in menus" :key="index" :class="{active:route.name === i.routeName}"
               @click="goto(i.path)">
            <span>{{ i.name }}</span>
            <img :src="requireImg('/v2/nav/nav-active-jb.png',false)" alt="" class="jb"
                 v-show="route.name === i.routeName">
          </div>
        </div>
      </div>
      <div class="top-info">
        <TopInfo v-model:show-popover="showPopover"/>
      </div>
    </div>
    <div v-if="!store.isPC" class="mobile_menu">
        <div class="mobile_menu-item" v-for="(i,index) in menus" :key="index" :class="{active:route.name === i.routeName}"
             @click="goto(i.path)">
          <span>{{ i.name }}</span>
        </div>
    </div>
  </div>

  <div class="top-1" v-if="false" :style="{
    '--top-bg':requireImg('/top/top-bg.jpg',true),
    '--top-bg2':requireImg('/top/top-bg2.jpg',true),
    '--top-btn-bg':requireImg('/top/btn-bg.png',true),
  }">
    <div class="top-1-info">
      <img class="logo" :src="requireImg('/logo-m.png')" v-if="store.isPC" alt="">
      <img class="logo" :src="requireImg('/logo-m.png')" alt="" v-else>
      <div class="info">
        <TopInfo/>
      </div>
    </div>
    <div class="top-1-nav">
      <div class="top-1-nav-container">
        <div class="top-1-nav-item" v-for="(i,index) in menus" :key="index"
             :class="{'active':route.name === i.routeName}"
             @click="goto(i.path)" @mouseenter="mouseEnter(i,index)" @mouseleave="mouseLeave(i,index)">
          <img :src="route.name===i.routeName?i.icoActive:i.ico" alt="">
          <span>{{ i.name }}</span>
        </div>
        <div class="top-1-nav-bg" :style="{'left':hoverActive*200+'px'}"></div>
      </div>
    </div>
  </div>
</template>
<style>
.nav-popper {
  background-color: #0A0A1EFF;
  border: none;
}
</style>
<style scoped lang="scss">
@use "@/style" as *;
.mobile_menu{
  display: flex;
  width: 100%;
  &-item{
    width: 25%;
    display: flex;
    align-items: center;
    justify-content: center;
    &.active{
      color: #FFF5F5;
      filter: drop-shadow(0px 0px 2.15px #FF4545A6);
    border-bottom: 1px solid #FFF5F566;
      box-sizing: border-box;

    }
  }
}
.top-1 {
  height: 90px;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: sticky;
  left: 0;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(20px);
  @include mobile {
    height: 60px;
  }

  &-info {
    height: 60px;
    width: 100%;
    display: flex;
    align-items: center;

    position: relative;

    .logo {
      position: absolute;
      height: 80%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      filter: drop-shadow(0 0 4px rgb(138, 15, 198));
      @include mobile {
        width: 35px;
        height: 39px;
        left: 20px;
        transform: translate(0, -50%);
        filter: drop-shadow(0px 0px 3px white);
      }
    }

    .info {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);

    }
  }

  &-nav {
    height: 40px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    &-container {
      height: 40px;
      width: fit-content;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    @include mobile {
      display: none;
    }

    &-item {
      height: 100%;
      display: flex;
      font-size: 14px;
      align-items: center;
      width: 200px;
      cursor: pointer;
      transition: all .3s;
      justify-content: center;
      z-index: 2;

      img {
        height: 50%;
        margin-right: 10px;
      }

      &:hover, &.active {
        color: rgb(176, 144, 230);
      }
    }

    &-bg {
      transition: .3s;
      width: 200px;
      height: 100%;
      background-image: var(--top-btn-bg);
      background-size: 100% 100%;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
    }
  }
}

.top {
  z-index: 10;
  height: 90px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  //background-image: var(--top-bg);
  //background-size: 100% 100%;
  display: flex;
  flex-shrink: 0;
  padding: 0 50px;
  align-items: center;
  box-sizing: border-box;

  @include mobile {
    height: 60px;
  }

  div {
    height: 100%;
  }

  &-logo {
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;

    flex-shrink: 0;
    @include mobile {
      width: 60px;
      height: 60px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &-nav {
    width: fit-content;
    margin-right: 10px;

    .menu {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      height: 100%;
      width: 100%;
      margin-left: 40px;

      &-item {
        display: flex;
        align-items: center;
        color: rgb(149, 149, 149);
        font-size: 17px;
        flex-shrink: 0;
        position: relative;
        margin-right: 50px;
        cursor: pointer;
        transition: 0.3s;

        &:hover, &.active {
          color: #FFF5F5;

          span {
            filter: drop-shadow(0px 0px 4px #FF4545A6);
          }
        }

        .jb {
          position: absolute;
          right: -20px;
          top: 15%;
        }

      }
    }


  }

  &-info {
    margin-left: auto;
    height: 100%;
    width: fit-content;
    display: flex;
    flex-shrink: 0;
  }

  @include mobile {
    padding: 0 20px;
  }

}
</style>
