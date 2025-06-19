<script setup>

import Layout from "@/components/Layout.vue";
import {goto, requireImg} from "@/utils/common";
import {ref} from "vue";
import {getBoxListApi} from "@/api";
import {useOpenPage} from "@/composables/useOpenBox";
import Title from "@/components/Title.vue";


const navs = ref([{
  path: "/upgrade",
  img: requireImg("/v2/home/nav1.png", false),
}, {
  path: "/center",
  img: requireImg("/v2/home/nav2.png", false),
}, {
  path: "/smelt",
  img: requireImg("/v2/home/nav3.png", false),
}, {
  path: "/roll",
  img: requireImg("/v2/home/nav4.png", false),
},

])

const boxList = ref([])
const getBoxList = () => {
  getBoxListApi().then(r => {
    boxList.value = r.data
  })
}
getBoxList()


const {openPage} = useOpenPage();
const handleClick = (id) => {
  openPage(id);
}


</script>

<template>
  <layout>
    <template #item>

      <div class="box_list">

        <div class="nav">
          <div class="nav-item" v-for="(i, index) in navs" :key="index" @click="goto(i.path)">
            <img :src="i.img" alt="">
          </div>
        </div>
        <div class="container">

          <div class="item" v-for="(i, index) in boxList" :key="index">
            <Title :name="i.boxTypeName"></Title>
            <div class="box">
              <div class="box-item" v-for="(j, jindex) in i.boxList" :key="jindex" @click="handleClick(j.boxId)">
                <div class="bx">
                  <img :src="j.boxImg01" class="bj" alt="">
                  <img :src="j.boxImg02" class="wq" alt="">
                </div>
                <div class="mz">
                  <div class="name">{{ j.boxName }}</div>

                </div>
                <div class="jia">
                  <img :src="requireImg('/v2/coin3.png', false)" alt="">
                  <div>{{ j.price }}</div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;


.box_list {
  width: 100%;
  display: flex;
  flex-direction: column;
  max-width: 1024px;
  margin: 0 auto;


  .nav {
    z-index: 2;
    margin-top: 270px;
    width: 100%;
    display: flex;
    justify-content: space-between;

    @include mobile {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 12px;
      margin-top: 100px;
      place-items: center;
      .nav-item {
        width: 170px;
        height: 82px;
      }
    }

    &-item {
      width: 24%;
      cursor: pointer;
      height: 130px;
      position: relative;


      img {
        width: 100%;
        height: 100%;
        z-index: 3;
        position: absolute;
      }

      &:after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(4px);
        z-index: 1;
        border-radius: 40px;
      }
    }
  }

  .container {
    display: flex;
    flex-direction: column;
    padding: 70px 20px;

    z-index: 2;
    margin: 10px 0 0;
    box-sizing: border-box;
    width: 100%;
    position: relative;

    @include mobile {
      padding: 0 5px;
    }


    .title {

      width: 361px;
      height: 86px;
      margin: 35px auto 0;
      background-size: 100% 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      font-size: 30px;


      &.t0 {
        background-image: var(--bg-t0);

        .txt {
          background: linear-gradient(0deg, #FF6DF8 0%, #4064FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      &.t1 {
        background-image: var(--bg-t1);

        .txt {
          background: linear-gradient(-90deg, #FF6DF8 0%, #FC7F53 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      &.t2 {
        background-image: var(--bg-t2);

        .txt {
          background: linear-gradient(-90deg, #FF6DF8 0%, #53FCA6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

    }

    .line {
      height: 1px;
      width: 100%;
      margin: 20px 0;
    }

    .box {
      display: grid;
      grid-gap: 10px;
      grid-template-columns: repeat(5, 1fr);
      place-items: center;

      @include maxWidth(1180px) {
        grid-template-columns: repeat(4, 1fr);
      }
      @include mobile {
        grid-template-columns: repeat(3, 1fr);
      }

      @include maxWidth(780px) {
        grid-template-columns: repeat(2, 1fr);
      }

      &-item {
        cursor: pointer;
        max-width: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;

        &:hover {
          .bx {
            .wq {
              animation: up_and_down 2s infinite;
            }
          }
        }

        .bx {
          height: 170px;
          width: 100%;
          position: relative;
          background-size: 100% 100%;

          @include mobile {
            height: 150px;
          }

          .bj {
            height: 100%;
            width: 100%;
          }

          .wq {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 50%;
            width: 50%;

          }
        }

        .mz {
          display: flex;
          align-items: center;
          padding: 0 10px;
          background: linear-gradient(90.47deg, rgba(202, 62, 39, 0) 0.31%, rgba(234, 87, 42, 0.44) 51.13%, rgba(201, 61, 38, 0) 100.98%);
          width: 100%;
          height: 40px;
          margin: 9px 0;
          justify-content: center;

          .name {
            font-family: "titleFont", "Microsoft YaHei", 'sans-serif';

          }
        }

        .jia {
          display: flex;
          align-items: center;
          height: 30px;

          img {
            height: 30px;
            width: 30px;
          }

          div {
            color: #FFD900;
            font-weight: 700;
            font-size: 16px;
            line-height: 100%;


          }

        }
      }
    }

  }
}

@keyframes up_and_down {
  0% {
    transform: translate(-50%, -50%);
  }

  50% {

    transform: translate(-50%, calc(-50% - 10px));
  }

  100% {
    transform: translate(-50%, -50%);
  }
}
</style>
