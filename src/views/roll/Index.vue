<script setup>

import Layout from "@/components/Layout.vue";
import {onMounted, ref} from "vue";
import {getRollListApi} from "@/api/roll";
import {useDebounceFn} from "@vueuse/core";
import {useStore} from "@/store";
import {goto, requireImg} from "@/utils/common";
import BaseButton from "@/components/Btn/BaseButton.vue";

const store = useStore()
const loading = ref(true)

const scrollRef = ref()
const listRef = ref()
const list = ref([])

const active = ref(0)
const form = ref({
  rollName: '',
  page: 1,
  rollStatus: 0,
  rollType: null,
  userId: '',
  size: 12
})
const isComplete = ref(false)

const navList = ref([{
  'name': '全部roll房',
  'value': 0
}, {
  'name': '我参与的',
  'value': 1
}, {
  'name': '已结束',
  'value': 2
}])
const changeActive = (val) => {
  active.value = val
  if (active.value === 0) {
    form.value.userId = null
    form.value.rollStatus = 0
  } else if (active.value === 1) {
    form.value.userId = store.userInfo.userId
    form.value.rollStatus = null
  } else if (active.value === 2) {
    form.value.userId = null
    form.value.rollStatus = 1
  }
  form.value.page = 1
  list.value = []
  isComplete.value = false
  getList()
}

const handleSearch = () => {
  form.value.page = 1
  isComplete.value = false
  getList()
}


const debouncedGetList = useDebounceFn(() => {
  if (!isComplete.value) {
    form.value.page += 1
    getList()
  }
}, 300)

const getList = () => {
  loading.value = true
  getRollListApi(form.value).then(res => {
    if (res.data && res.data.length) {
      if (form.value.page === 1) {
        list.value = []
      }
      list.value.push(...res.data)
    } else {
      isComplete.value = true
    }
  }).finally(() => {
    loading.value = false
  })
}

const onScroll = (e) => {
  let scrollBarHeight = scrollRef.value.$el.querySelector(".el-scrollbar__bar:last-child .el-scrollbar__thumb").clientHeight || 200
  if (listRef.value && e.scrollTop) {
    if (e.scrollTop + scrollBarHeight + 500 >= listRef.value.clientHeight) {
      debouncedGetList()
    }
  }

}

const parseImgList = (jsonStr) => {
  try {
    return JSON.parse(jsonStr)
  } catch (error) {
    return []
  }
}


const enterRoom = (id) => {
  goto(`/roll/${id}`)
}


onMounted(() => {
  getList()
})

</script>

<template>
  <Layout :style="{
      '--bg-card':requireImg('/roll/bg-card.png',true),
      '--bg-card-title':requireImg('/roll/bg-card-title.png',true),
      '--bg-roll':requireImg('/v2/bg/bg-roll.png',true),
    }">
    <template #item>
      <div class="bg bg-roll">
        <img :src="requireImg('/v2/roll/fish.png',false)" alt="">
      </div>
      <div class="roll">
        <div class="content">
          <div class="nav">
            <div class="nav-item" v-for="(i,index) in navList" :class="{'active':active===i.value}" :key="index"
                 @click="changeActive(i.value)">
              <span>{{ i.name }}</span>
            </div>
            <div class="search" v-show="store.isPC">
              <el-input placeholder="请输入房间名称进行搜索" v-model="form.rollName"></el-input>
              <div class="btn" @click="handleSearch">搜索</div>
            </div>
          </div>
          <div class="search" v-show="!store.isPC">
            <el-input placeholder="请输入房间名称进行搜索" v-model="form.rollName"></el-input>
            <div class="btn" @click="handleSearch">搜索</div>
          </div>

        </div>
      </div>
      <div class="roll" v-loading="loading" style="flex: 1">
        <div class="content">
          <el-scrollbar max-height="800px" @scroll="onScroll" ref="scrollRef">
            <div ref="listRef" class="list">
              <div class="list-item" v-for="(i,index) in list" :key="index">
                <div class="title">{{ i.rollName }}</div>
                <div class="enter">
                  <div class="enter-time">
                    <el-countdown
                        format="D天HH时mm分"
                        :value="new Date(i.endTime)"
                        style="--el-statistic-content-color:  #FFFFFFB2;--el-statistic-content-font-size: 12px"
                        v-if="new Date(i.endTime) > new Date()"/>

                    <div v-else style="color: #FFFFFFb2;font-size: 12px">已结束</div>
                  </div>
                  <BaseButton name="进入房间"  class="enter-btn" @click="enterRoom(i.id)" :font-size="store.isPC?null:'12px'"/>
                </div>
                <img class="bg1" :src="requireImg('/v2/roll/item-bg.png',false)" alt="">
                <img class="bg2" :src="requireImg('/v2/roll/item-bg2.png',false)" alt="">
                <img class="bx" :src="requireImg('/v2/roll/bx.png',false)" alt="">
                <img class="wq" :src="parseImgList(i.ornamentsList)[0].imgUrl" alt="">
              </div>
            </div>
          </el-scrollbar>

        </div>
      </div>
    </template>
  </Layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.bg-roll {
  background-image: var(--bg-roll);

  img {
    position: fixed;
    bottom: 0;
    right: 0;
    opacity: .5;
  }
}

.roll {
  margin-top: 18px;
  font-size: 16px;

  .content {
    padding: 20px 20px 80px;
    width: 100%;
    box-sizing: border-box;
    z-index: 3;
    @include mobile {
      padding:0 20px ;
    }

    .nav {
      display: flex;
      align-items: center;
      margin-top: 30px;
      @include mobile{
        justify-content: space-evenly;
      }


      &-item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "PingFang Regular", sans-serif;
        cursor: pointer;
        background: #FFF5F5;
        flex-shrink: 0;

        width: 153px;
        height: 48px;
        border-radius: 30px;
        font-size: 16px;
        margin-right: 32px;

        @include mobile{
          width: 104px;
          margin-right: 0;
        }

        span {
          filter: drop-shadow(0px 0px 4.3px #FF4545A6);
          font-size: 16px;
        }


        @include mobile {
          height: 40px;
        }

        &:first-child {
          background: linear-gradient(90.15deg, #FF3C2A -4.19%, rgba(149, 0, 0, 0) 99.85%);

        }

        &:nth-child(2) {
          background: linear-gradient(90.15deg, #FF952A -4.19%, rgba(149, 87, 0, 0) 99.85%);

        }

        &:nth-child(3) {
          background: linear-gradient(90.15deg, #A27A7A -4.19%, rgba(152, 116, 116, 0) 99.85%);

        }

        &.active {
          position: relative;

          &::after {
            content: '';
            position: absolute;
            width: 40px;
            height: 4px;
            border-radius: 34px;
            background: white;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);

          }
        }

      }
    }

    .search {
      display: flex;
      width: 100%;
      justify-content: center;
      height: 45px;
      @include mobile{
        margin-top: 21px;
      }
      .el-input {
        max-width: 237px;
        --el-input-bg-color: #FFF1F145;
        --el-input-text-color: #fff;
        --el-input-border-color: transparent;
        --el-input-border-radius: 41px;
        --el-input-focus-border-color: #FF952A;
        @include mobile {
          max-width:100%;

        }

      }

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #210F0B;
        margin-left: 10px;
        cursor: pointer;
        width: 76px;
        height: 41px;
        border-radius: 25px;
        gap: 4px;
        border: 1px solid #FC523A
      }
    }

    .list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: auto;
      grid-gap: 30px;
      margin-top: 20px;
      @include maxWidth(756px) {
        //grid-template-columns: repeat(1, 1fr);
        display: flex;
        flex-direction: column;
        align-items: center;

        &-item {
          width: 100%;
        }
      }


      &-item {
        max-width: 480px;
        height: 168px;
        border-radius: 12px;
        padding: 24px;

        background: #4A1D13;
        display: flex;
        flex-direction: column;
        position: relative;
        @include mobile{
          height: 112px;
          padding: 12px;
        }


        .bg1{
          position: absolute;
          top:0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;

        }
        .bg2{
          position: absolute;
          right: 0;
          bottom: 0;
          height: 100%;
          z-index: 0;

        }
        .bx{
          position: absolute;
          right: 30px;
          top: 50%;
          transform: translateY(-50%);
          width: 155px;
          height: 155px;
          @include mobile{
            width: 100px;
            height: 100px;
          }

        }
        .wq{
          position: absolute;
          right:  40px;
          top: 50%;
          transform: translateY(-50%);
          width: 150px;
          @include mobile{
            width: 90px;
          }
        }

        .title {
          font-size: 20px;
          color: #fff;
          @include mobile {
            font-size: 16px;
          }
        }

        .enter {
          display: flex;
          flex-direction: column;
          font-size: 14px;
          @include mobile {
            font-size: 12px;
            padding-bottom: 50px;
          }

          &-time {
            margin: 12px 0 16px;
            @include mobile {
              margin: 5px 0;
            }
          }


          &-btn {
            width: 104px;
            height: 41px;
            @include mobile {
              width: 80px;
              height: 28px;
            }


          }
        }
      }


    }
  }
}
</style>
