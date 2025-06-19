<script setup>
import {useUserInfo} from "@/composables/useUesrInfo";
import {goto, requireImg} from "@/utils/common";
import {ref, watch} from "vue";
import {useStore} from "@/store";
import CDKDialog from "@/components/dialogs/CDKDialog.vue";
import RedEnvelopeDialog from "@/components/dialogs/RedEnvelopeDialog.vue";
import RechargeModal from "@/components/RechargeModal/index.vue";
import BottomNav from "@/components/default/BottomNav.vue";
import Kefu from "@/components/dialogs/Kefu.vue";

const {userInfo, isLogin} = useUserInfo()
const store = useStore()

const cdkDialogRef=ref()
const redEnvelopeDialogRef=ref()
const rechargeModalRef=ref()
const kefuRef=ref()
const navs = ref([
  {
    name: '帐变记录',
    img: requireImg("user/n1.png"),
    func: () => {
      goto("/user/record")
    }
  },
  {
    name: '推广用户',
    img: requireImg("user/n2.png"),
    func: () => {
      goto("/user/promote")
    }
  },
  {
    name: '饰品库存',
    img: requireImg("user/n3.png"),
    func: () => {
      goto("/user/inventory")
    }
  },
  {
    name: '开箱记录',
    img: requireImg("user/n4.png"),
    func: () => {
      goto("/user/record")
    }
  },
  {
    name: '联系客服',
    img: requireImg("user/n5.png"),
    func: () => {
      kefuRef.value.open()

    }
  },
  {
    name: '帮助中心',
    img: requireImg("user/n6.png"),
    func: () => {

    }
  },
  {
    name: '红包',
    img: requireImg("user/n7.png"),
    func: () => {
      redEnvelopeDialogRef.value.open()
    }
  },
  {
    name: 'CDKey',
    img: requireImg("user/n8.png"),
    func: () => {
      cdkDialogRef.value.open()
    }
  },
])


watch(() => store.isPC, () => {
  if (store.isPC) {
    goto('/user/base')
  }
}, {
  immediate: true
})
watch(() => store.isLogin, () => {
  if (!store.isLogin) {
    goto('/login')
  }
},{
  immediate: true
    }
)
</script>

<template>
  <div class="user_m" :style="{'--bg':requireImg('/bg/bg-user-m.png',true)}">
    <div class="base" v-if="userInfo">
      <img :src="userInfo.avatar" alt="" class="avatar">
      <div class="info">
        <div class="name">{{ userInfo.nickName }}</div>
        <div class="money">
          <div>余额：{{ userInfo.accountAmount }}</div>
          <!-- <div>弹药：{{ userInfo.accountCredits }}</div> -->
        </div>
      </div>
      <div class="right">
        <div v-if="userInfo.isRealCheck!=='1'" style="font-size: 12px;margin-right: 4px;color: #09508AFF"
             @click="goto('/user/base')">未实名 >
        </div>
        <div class="charge" @click="rechargeModalRef.open">充值</div>
      </div>
    </div>
    <div class="mid">
      <div class="item" @click="goto('/user/base')">
        <div class="img">
          <img :src="requireImg('/user/stm.png')" alt="">
        </div>
        <div>Steam连接管理</div>
      </div>
      <div class="item" @click="goto('center')">
        <div class="img">
          <img :src="requireImg('/user/video.png')" alt="">
        </div>
        <div>福利中心</div>
      </div>
    </div>
    <div class="navigate">
      <div class="item" v-for="(i,index) in navs" :key="index" @click="i.func">
        <img :src="i.img" alt="">
        <div>{{i.name}}</div>
      </div>
    </div>
    <CDKDialog ref="cdkDialogRef"/>
    <RedEnvelopeDialog ref="redEnvelopeDialogRef"/>
    <RechargeModal ref="rechargeModalRef"/>
    <Kefu ref="kefuRef"/>

  </div>
  <bottom-nav/>
</template>

<style scoped lang="scss">
.user_m {
  font-size: 16px;

  display: flex;
  flex-direction: column;
  padding: 50px 15px 0;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
  background-image: var(--bg);
  background-size: 100% 100%;

  .base {
    display: flex;
    align-items: center;

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin-right: 20px;
    }

    .info {
      .name {
        font-size: 18px;
        font-weight: bold;
        color: #fff;
      }

      .money {
        color: #0096FF;
        font-size: 14px;
      }

    }

    .right {
      margin-left: auto;
      display: flex;
      align-items: center;

      .charge {
        cursor: pointer;
        width: 45px;
        height: 30px;
        background: #0096FF;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
      }
    }
  }

  .mid {
    display: flex;
    align-items: center;
    height: 40px;
    margin-top: 40px;
    justify-content: center;
    margin-bottom: 40px;

    .item {
      width: 49.9%;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-size: 18px;

      &:first-child {
        border-right: 2px #0E3864 solid;
      }

      .img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px #0E3864 solid;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 5px;

        img {
          width: 70%;
          height: 70%;
        }
      }

      &:last-child {
        .img {
          img {
            width: 60%;
            height: 50%;
          }
        }
      }
    }
  }

  .navigate {
    width: 95%;
    margin: 0 auto;
    padding: 30px 15px;
    background: rgba(0, 150, 255, 0.24);
    border-radius: 5px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 15px;
    grid-row-gap: 30px;

    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      img{
        width: 30px;
        height: 30px;
        margin-bottom: 5px;

      }
    }
  }
}


</style>
