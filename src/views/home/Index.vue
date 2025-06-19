<script setup>

import Layout from "@/components/Layout.vue";
import {useOpenPage} from "@/composables/useOpenBox.js";
import {getBoxListApi} from "@/api";
import {onMounted, ref} from "vue";
import {requireImg} from "@/utils/common";
import Banner from "@/components/Banner.vue";
const {openPage} = useOpenPage();
const handleClick = (id) => {
  openPage(id);
}
const boxList = ref([])
const getClass = (index) => {
  return ['xryd', 'lzmd', 'xyzc'][index % 3]
}
const getMarkImg = (index,l=true) => {
  let s= ['xryd.png', 'lzmd.png', 'xyzc.png'][index % 3]
  if (l){
    return requireImg('home/' + s)
  }else {
    return requireImg('home/' + s.replace('.png','-r.png'))
  }
}

const getArrowImg = (index) => {
  return requireImg('home/' + ['xryd-arrow.png', 'lzmd-arrow.png', 'xyzc-arrow.png'][index % 3])
}
const getBoxList = () => {
  getBoxListApi().then(r => {
    boxList.value = r.data
  })
}
getBoxList()


</script>

<template>
  <layout>
    <template #item>
      <Banner/>
      <div class="card item" v-for="(i,index) in boxList" :key="index" :class="getClass(index)" >
        <img :src="getMarkImg(index,true)" class="top_mark" alt="">
        <img :src="getMarkImg(index,false)" class="bottom_l" alt="" v-if="index%3!==3">
        <div class="title">
          <img :src="getArrowImg(index)" alt="">
          <h1>{{i.boxTypeName}}</h1>
          <img :src="getArrowImg(index)" alt="">
        </div>
        <div class="box">
          <div class="box-item" @click="handleClick(j.boxId)" v-for="(j,jindex) in i.boxList" :key="jindex">
            <div class="bx">
              <img :src="j.boxImg01" class="bj" alt="">
              <img :src="j.boxImg02" class="wq" alt="">
            </div>
            <div class="mz">{{j.boxName}}</div>
            <div class="btn">
              <img :src="requireImg('/coin1.png',false)" alt="">
              <div>{{j.price}}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

  </layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;

$-xryd-btn-color: rgb(138, 15, 198);
$-lzmd-btn-color: rgb(0, 218, 190);
$-xyzc-btn-color: rgb(0, 42, 255);
.item {
  font-size: 16px;
  .bottom_l {
    position: absolute;
    bottom: 0;
    height: 60%;
    max-width: 100%;
  }

  .box {
    z-index: 2;
    //grid布局，2行5列
    display: grid;
    direction: rtl;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 10px;
    grid-row-gap: 50px;
    //display: flex;
    //flex-direction: row-reverse;
    //flex-wrap: wrap;
    padding: 20px;
    box-sizing: border-box;

    &-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: .5s;
      width: 100%;

      &:hover {
        .bx {
          animation: smooth 2s infinite;
         .wq{
           //使用动画 循环播放 up_and_down
           animation: up_and_down 2s infinite;
         }
        }



      }

      .bx {
        width: 100%;
        max-width: 191px;
        max-height: 182px;
        margin-bottom: 10px;
        position: relative;
        z-index: 2;
        img{
          width: 100%;
          height: 100%;
        }
        .wq{
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 3;
          width: 45%;
          height: 45%;
        }
      }
      .mz{
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        margin-bottom: 5px;
        font-size: 22px;
      }


      .btn {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        width: 80%;
        line-height: 1.5em;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row-reverse;
        img{
          width: 18px;
          margin-right: 5px;
        }
      }
    }
  }

  @media screen and (max-width: 1280px) {
    .box {
      grid-template-columns: repeat(4, 1fr);
    }

  }
  @include mobile {
    .box {
      grid-template-columns: repeat(3, 1fr);
      .mz{
        font-size: 18px;
      }
      .btn {
        font-size: .8em;
        img{
          width: 14px;
        }
      }
    }

  }
}

.xryd.item {
  .btn {
    background-image: linear-gradient(
            to right,
            rgba(0, 0, 0, 0) 0%,
            $-xryd-btn-color 50%,
            rgba(0, 0, 0, 0)
    );

  }
}

.lzmd.item {
  .bottom_l {
    right: 0;
  }

  .box {
    direction: ltr;

    .btn {
      background-image: linear-gradient(
              to right,
              rgba(0, 0, 0, 0) 0%,
              $-lzmd-btn-color 50%,
              rgba(0, 0, 0, 0)
      );
    }
  }
}

.xyzc.item {
  .box {
    direction: ltr;

    .btn {
      background-image: linear-gradient(
              to right,
              rgba(0, 0, 0, 0) 0%,
              $-xyzc-btn-color 50%,
              rgba(0, 0, 0, 0)
      );
    }
  }
}

@keyframes up_and_down {
  0% {
    transform: translate(-50%,-50%);
  }

  50% {

    transform: translate(-50%,calc(-50% - 10px));
  }

  100% {
    transform: translate(-50%,-50%);
  }
}
@keyframes smooth {
  0% {
    filter: drop-shadow(0px 0px 0px rgba(255, 255, 255, 0.3));
  }

  50% {
    filter: drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.3));
  }

  100% {
    filter: drop-shadow(0px 0px 0px rgba(255, 255, 255, 0.3));
  }
}
</style>

