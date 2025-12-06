<script setup>

import Layout from "@/components/Layout.vue";
import {useRoute} from "vue-router";
import {computed, ref, watchEffect} from "vue";
import {goto, requireImg} from "@/utils/common";
import {useStore} from "@/store";
import Base from "@/views/user/components/Base.vue";
import Inventory from "@/views/user/components/Inventory.vue";
import Promotion from "@/views/user/components/Promotion.vue";
import BoxRecords from "@/views/user/components/BoxRecords.vue";
import AmountRecords from "@/views/user/components/AmountRecords.vue";
import Mail from "@/views/user/components/Mail.vue";
import email from '@/assets/images/user/email.png';
import record from '@/assets/images/user/record.png';
import share from '@/assets/images/user/share.png';
import openRecord from '@/assets/images/user/open_record.png';
import storage from '@/assets/images/user/storage.png';
import userInfo from '@/assets/images/user/user_info.png';

const route = useRoute()
const store = useStore()
const path = computed(() => {
  return route.params.type
})
const active = ref('base')
const tabs = ref([
  {
    label: '个人资料',
    value: 'base',
    icon: userInfo
  },
  {
    label: '饰品库存',
    value: 'inventory',
    icon: storage
  },
  {
    label: '开箱记录',
    value: 'record',
    icon: openRecord
  },
  {
    label: '推广用户',
    value: 'promote',
    icon: share
  },
  {
    label: '帐变记录',
    value: 'log',
    icon: record
  },
  {
    label: '邮件信息',
    value: 'mail',
    icon: email
  }
])


const onClickTab = (item) => {
  goto('/user/' + item.name)
}

watchEffect(() => {
  active.value = path.value
})


</script>

<template>
  <Layout  :show-box="store.isPC">
    <template #item>
      <div class="user">
        <van-tabs v-model:active="active" class="tabs" @click-tab="onClickTab">
          <van-tab v-for="(i,index) in tabs" :title="i.label" :name="i.value" :key="index">
            <template #title>

              <div class="tab-item">
                <img :src="i.icon" alt="">

                <span>{{ i.label }}</span>
              </div>
            </template>


            <Base v-show="active==='base'"/>
            <Inventory v-if="active==='inventory'"/>
            <BoxRecords v-if="active==='record'"/>
            <Promotion v-if="active==='promote'"/>
            <AmountRecords v-if="active==='log'"/>
            <Mail v-if="active==='mail'"/>
          </van-tab>
        </van-tabs>
      </div>

    </template>
  </Layout>
</template>
<style lang="scss">
@use "@/style" as *;
.user{
  .self-title{
    position: relative;
    width: fit-content;
    margin: 20px 0;

    span {
      position: relative;
      font-size: 16px;
      font-family: "Source Han Sans CN", "Microsoft YaHei", 'sans-serif';
      filter: drop-shadow(0px 0px 4.3px #FF4545A6);


      z-index: 2;
    }

    div {
      content: '';
      position: absolute;
      width: 91px;
      height: 10px;
      bottom: -7px;
      left: 0;
      background: linear-gradient(90deg, #F34A34 0%, rgba(141, 43, 30, 0) 100%);

      z-index: 0;
    }
  }
  .el-input{
    --el-input-bg-color:none;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
    --el-input-border:0px;
    --el-input-border-color:tranparent;
    --el-input-text-color:#ffffffaa;
    --el-input-focus-border-color: rgba(255, 255, 255, 0.2);
    --el-input-focus-border: rgba(255, 255, 255, 0.2);
    height: 45px;
    border-radius: 5px;
  }
  .nav{
    display: flex;
    align-items: center;
    margin-top: 29px;
    flex-wrap: wrap;
    @include mobile {
      margin-top: 11px;
      flex-wrap: nowrap;
      justify-content: space-evenly;
    }

    &-item {
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "PingFang Regular", sans-serif;
      cursor: pointer;
      background: linear-gradient(to right, #122c2e, #214147);
      flex-shrink: 0;
      width: 120px;
      height: 36px;
      border-radius: 30px;
      font-size: 14px;
      margin-right: 10px;
      @include mobile {
        margin: 0;
      }
      span{
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &.active {
        background: linear-gradient(to right, #175e64, #508594);
        span {
          filter: drop-shadow(2px 2px 10px black);
          color: white;
        }
      }

    }
  }
}
</style>
<style scoped lang="scss">
@use "@/style" as *;

.user {

  font-size: 16px;
  .nav{
    display: flex;
    align-items: center;
    margin-top: 33px;
    flex-wrap: wrap;
    @include mobile {
      margin-top: 0;
      flex-wrap: nowrap;
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
      @include mobile {
        font-size: 20px;
        height: 40px;
        width: 30%;
        margin: 0;
      }

      &:first-child {
        background: linear-gradient(90.15deg, #FF3C2A -4.19%, rgba(149, 0, 0, 0) 99.85%);
      }

      &:nth-child(2) {
        background: linear-gradient(90.15deg, #FF952A -4.19%, rgba(149, 87, 0, 0) 99.85%);
      }

      &:last-child {
        background: linear-gradient(90.15deg, #A27A7A -4.19%, rgba(152, 116, 116, 0) 99.85%);
      }

      &.active {
        span {
          filter: drop-shadow(2px 2px 10px black);
          color: white;
          border-bottom: 3px solid white;
        }
      }

    }
  }


  .tabs {
    width: 100%;
    z-index: 3;
    --van-tabs-nav-background: trasparent;
    --van-tab-active-text-color: #fff;
    --van-tabs-line-height:100px;
    .tab-item{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      position: relative;
      @include mobile {
        font-size: 13px;
      }

      img{
        width: 36px;
        margin-bottom: 10px;
        height: 42px;
        @include mobile {
          width: 26px;
          height: 32px;
          margin-bottom: 4px;
        }
      }
    }

    :deep(.van-tab) {
      z-index: 6;
    }

    :deep(.van-tab--grow) {
      @include mobile {
        padding: 0 5px;
      }
    }

    :deep(.van-tabs__line) {
      background: none;
      position: relative;
      width: 100px;
      height: 10px;
      &::after {
        display: inline-block;
        content: "";
      }
    }

    :deep(.van-tab__text) {
      font-size: 16px;
      transform: translateY(5px);
      color: #FFFBD4;
      span {
        font-family: 'Jijiati' !important;
      }
    }

    :deep(.van-tab--active) {
      background: linear-gradient(180deg, rgba(255, 225, 225, 0) 12.92%, rgba($color: #DCD9BF, $alpha: 0.38) 87.52%);
    }

  }

  .tabs-container {
    padding: 20px;
    display: flex;
    flex-direction: column;

  }
}
</style>
