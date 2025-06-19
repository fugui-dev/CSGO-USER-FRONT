<script setup>

import {getBoxRecordApi} from "@/api";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";


import leavel1 from '@/assets/leavel/1.png';
import leavel2 from '@/assets/leavel/2.png';
import leavel3 from '@/assets/leavel/3.png';
import leavel4 from '@/assets/leavel/4.png';
import price from '@/assets/box/price.png';
import {useStore} from "@/store";
import {useOpenPage} from "@/composables/useOpenBox";
import UAvatar from "@/components/UAvatar.vue";
import {requireImg} from "@/utils/common";

const level = {
  1: {
    color: '#f2a105',
    img: requireImg("/v2/level/1.png")
  },
  2: {
    color: '#FC7F53',
    img: requireImg("/v2/level/2.png")
  },
  3: {
    color: '#B26DFF',
    img: requireImg("/v2/level/3.png")
  },
  4: {
    color: '#4589FF',
    img: requireImg("/v2/level/4.png")
  }
}

const store = useStore()
const router = useRouter()
const routePath = router.currentRoute.value.path
const list = ref([])
const pause = ref(false)
const form = ref({
  status: [0],
  source: [1],
  page: 1,
  size: 20,
  orderByFie: 0
})
const runningNo = ref([])

const getList = async (no) => {
  getBoxRecordApi(form.value).then(async res => {
    let flag=false
    if (res.data && res.data.length) {

      for (const item of res.data) {
        console.log(routePath, router.currentRoute.value.path)
        if (routePath !== router.currentRoute.value.path){
          flag=true
          break
        }
        if (runningNo.value.findIndex(x=>no==x)===-1) {
          flag=true
          break
        }
        list.value.unshift(item)
        await new Promise(resolve => {
          setTimeout(async () => {
            while (pause.value) {
              console.log('暂停滚动')
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
            resolve()
          }, 3000)
        })
      }
      if (!flag){
        getList(no).then()
      }
    }

  })
}
onMounted(async () => {
  getBoxRecordApi(form.value).then(res => {
    list.value = res.data || []
    runningNo.value=[0]
    getList(0).then()
  })
})

const hoverIn = () => {
  pause.value = true
}
const hoverOut = () => {
  pause.value = false
}

const {openPage} = useOpenPage();
const handleClick = (id) => {
  openPage(id);
}
const active = ref(0)

const navs = ref([{
  name: '全部战报',
}, {
  name: '精选战报'
}])

const handleClickNav = (index) => {
  active.value = index
  if (index === 0) {
    form.value.ornamentLevelIds = []
    delete form.value.ornamentLevelIds
  } else {
    form.value.ornamentLevelIds = [1]
  }
  let timestamp= new Date().getTime()
  getBoxRecordApi(form.value).then(res => {

    list.value = res.data || []
    runningNo.value=[timestamp]
    getList(timestamp).then()
  })
}


</script>

<template>
  <div class="rolling" :class="{'pc':store.isPC}">
    <TransitionGroup name="list" tag="div" class="rolling-container" :class="{'pc':store.isPC}" @mouseenter="hoverIn"
                     @mouseleave="hoverOut">
      <div class="navs">
        <div class="navs-item" v-for="(i,index) in navs" :key="index" :class="{active:active===index}"
             @click="handleClickNav(index)">{{ i.name }}
        </div>
      </div>
      <div class="item" v-for="(i,index) in list" :key="i.id"
           :title="i.ornamentName" @click="openPage(i.boxId)">
        <img :src="i.imageUrl" class="qiang">
        <img :src="level[i.ornamentsLevelId || 4].img" alt="" class="lv"
             :style="{filter:`drop-shadow(0 0 2px ${level[i.ornamentsLevelId || 4].color})`}">
        <div style="display: flex;align-items:center">
          <div
              :style="{width:'8px',height:'8px',borderRadius:'50%',background:level[i.ornamentsLevelId || 4].color,marginRight:'5px'}"></div>
          <div class="ellipsis">{{ i.ornamentName }}</div>
        </div>
        <div class="avatar">
          <UAvatar class="ico" :src="i.avatar"></UAvatar>
          <div class="name">

            {{ i.holderUserNickName }}
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>


<style scoped lang="scss">
@use "@/style" as *;

.navs {
  display: flex;
  align-items: center;
  justify-content: space-around;
  font-size: 13px;
  width: 100%;
  @include mobile{
    display: none;
  }
  &-item {
    cursor: pointer;
    &.active {
      background: linear-gradient(180deg, #FFF8F7 0%, #FF4C30 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

  }

}

.rolling {
  font-size: 16px;
  display: flex;
  align-items: center;
  width: 100%;
  height: 90px;
  padding: 0 5px;
  box-sizing: border-box;
  overflow: auto;
  position: sticky;
  top: 90px;
  z-index: 5;


  @include mobile {
    top: 20px;
    z-index: 5;
  }

  &.pc {
    width: 160px;
    height: 100%;
    overflow: hidden;
    margin-left: 20px;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  &-container {
    display: flex;
    align-items: center;
    height: fit-content;
    width: 100%;
    border-radius: 5px;

    &.pc {
      height: 100%;
      flex-direction: column;


      .item {
        width: 100%;
        height: 110px;
        margin-bottom: 10px;

        .lv {
          height: 75%;
        }

        .qiang {
          width: auto;
          height: 75%;
        }
      }
    }

    .item {

      background-size: 100% 100%;
      margin-right: 5px;
      flex-shrink: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-direction: column;
      width: 95px;
      height: 87px;
      font-size: .7em;
      position: relative;
      overflow: hidden;

      .avatar {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.71);
        z-index: 7;
        display: flex;
        flex-direction: column;
        align-items: center;
        top: -100%;
        transition: .3s;
        border-radius: 5px;

        .ico {
          width: 60px;
          height: 60px;
        }

        .name {
          width: 100%;
          text-align: center;
        }
      }

      &:hover {
        .avatar {
          top: 0;
        }
      }

      .lv {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 80%;

      }

      .qiang {
        width: 80%;
        margin-top: 5px;
        z-index: 6;

      }


      div {
        margin-bottom: 5px;
        width: 92%;
      }
    }
  }

}

.list-move, /* 对移动中的元素应用的过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.pc {
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }
}


/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.list-leave-active {
  position: absolute;
}
</style>

