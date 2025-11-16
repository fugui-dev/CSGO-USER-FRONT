<script setup>

import Layout from "@/components/Layout.vue";
import {goto, requireImg} from "@/utils/common";
import {ref} from "vue";
import {getBoxListApi} from "@/api";
import {useOpenPage} from "@/composables/useOpenBox";
import Title from "@/components/Title.vue";
import { ElMessage } from "element-plus";
import bgShop from '@/assets/images/home/bg_shop.png';
import nav1 from '@/assets/images/home/nav1.png';
import nav2 from '@/assets/images/home/nav2.png';
import nav3 from '@/assets/images/home/nav3.png';
import nav4 from '@/assets/images/home/nav4.png';
import coin from '@/assets/images/home/coin.png';
import arrow from '@/assets/images/home/arrow.png';

const navs = ref([{
  path: "/upgrade",
  img: nav1,
  title: '炼金',
  content: '去炼金',
  color: '#E4C162'
}, {
  path: "/center",
  img: nav2,
  title: '福利站',
  content: '去领取',
  color: '#1EBCAF'
}, {
  path: "/smelt",
  img: nav3,
  title: '熔炼',
  content: '去熔炼',
  color: '#B0D05F',
  enabled: false
}, {
  path: "/roll",
  img: nav4,
  title: 'ROLL房',
  content: '去获取',
  color: '#D280BC'
},

])

const boxList = ref([])
const getBoxList = () => {
  getBoxListApi().then(r => {
    if (r.data && Array.isArray(r.data)) {
      // 确保分类按 sort 排序（后端已排序，这里作为双重保障）
      // 每个分类下的箱子列表按价格从低到高排序
      boxList.value = r.data.map(type => ({
        ...type,
        boxList: (type.boxList || []).sort((a, b) => {
          const priceA = Number(a.price) || 0;
          const priceB = Number(b.price) || 0;
          return priceA - priceB;
        })
      }));
    } else {
      boxList.value = r.data || [];
    }
  })
}
getBoxList()


const {openPage} = useOpenPage();
const handleClick = (id) => {
  openPage(id);
}

const handleNavClick = (item) => {
  if (item.enabled === false) {
    ElMessage("敬请期待");
    return;
  }
  goto(item.path);
}


</script>

<template>
  <layout>
    <template #item>

      <div class="box_list">

        <div class="nav">
          <div class="nav-item" v-for="(i, index) in navs" :key="index" @click="handleNavClick(i)">
            <img :src="i.img" alt="">
            <div class="nav-item-content">
              <p :style="{ color: `${i.color}` }">{{ i.title }}</p>
              <div class="nav-item-go">
                <span>{{ i.content }}</span>
                <img :src="arrow" alt="" class="arrow">
              </div>
            </div>
          </div>
        </div>
        <div class="container">

          <div class="item" v-for="(i, index) in boxList" :key="index">
            <Title :name="i.boxTypeName"></Title>
            <div class="box">
              <div class="box-item" v-for="(j, jindex) in i.boxList" :key="jindex" @click="handleClick(j.boxId)">
                <div class="bx">
                  <img v-if="j.boxImg01" :src="j.boxImg01" class="bj" alt="" @error="$event.target.style.display = 'none'" />
                  <img v-if="j.boxImg02" :src="j.boxImg02" class="wq" alt="" @error="$event.target.style.display = 'none'" />
                </div>
                <div class="mz">
                  <div class="name">{{ j.boxName }}</div>

                </div>
                <div class="jia">
                  <img :src="coin" alt="" class="jia-img">
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
    margin-top: 170px;
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
        position: relative;
        .nav-item-content {
          position: absolute;
          z-index: 99;
          left: 20px;
        }
      }
    }

    &-item {
      width: 24%;
      cursor: pointer;
      height: 130px;
      position: relative;

      .nav-item-content {
        width: 100px;
        position: absolute;
        z-index: 99;
        left: 12px;
        top: 17px;
        p {
          font-size: 20px;
          font-family: 'Jijiati';
        }
        .nav-item-go {
          margin-top: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          width: 60px;
          span:nth-of-type(1) {
            font-size: 12px;
            color: #B1C5C7;
          }
          .arrow {
            width: 16px;
            height: 16px;
            position: absolute;
            right: 0;
          }
        }
      }

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
    padding: 35px 20px;

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
        background-color: rgba($color: #171718, $alpha: 0.59);

        &:hover {
          .bx {
            .wq {
              animation: up_and_down 2s infinite;
            }
          }
        }

        .bx {
          height: 158px;
          width: 88%;
          position: relative;
          background-size: 100% 100%;
          padding-top: 20px;

          @include mobile {
            height: 120px;
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
          // background: linear-gradient(90.47deg, rgba(202, 62, 39, 0) 0.31%, rgba(234, 87, 42, 0.44) 51.13%, rgba(201, 61, 38, 0) 100.98%);
          width: 132px;
          height: 28px;
          margin: 9px 0;
          justify-content: center;
          border-radius: 6px;
          background: url('@/assets/images/home/bg_box_title.png') no-repeat;

          .name {
            font-family: "PingFang-SC", "Microsoft YaHei", 'sans-serif';
            font-size: 13px;
          }
        }

        .jia {
          display: flex;
          align-items: center;
          height: 30px;
          margin-bottom: 26px;
          img {
            height: 22px;
            width: 22px;
          }

          div {
            color: #F1BA50;
            font-weight: 700;
            font-size: 13px;
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
