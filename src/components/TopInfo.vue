<script setup>
import {onMounted, ref} from "vue";
import UAvatar from "@/components/UAvatar.vue";

import {useStore} from "@/store/index.js";
import LoginDialog from "@/components/dialogs/LoginDialog.vue";
import {goto, requireImg} from "@/utils/common";
import RechargeModal from "@/components/RechargeModal/index.vue";
import {useRoute} from "vue-router";
import Kefu from "@/components/dialogs/Kefu.vue";
import RedEnvelopeDialog from "@/components/dialogs/RedEnvelopeDialog.vue";
import CDKDialog from "@/components/dialogs/CDKDialog.vue";

const store = useStore()
const loginDialog = ref()
const rechargeModalRef = ref()
const route = useRoute()
const userNav = ref([{
  name: '个人资料',
  img: requireImg("/v2/nav/u1.png"),
  func: () => {
    goto('/user/base')
  }
}, {
  name: '饰品库存',
  img: requireImg("/v2/nav/u2.png"),
  func: () => {
    goto('/user/inventory')
  }
}, {
  name: '开箱记录',
  img: requireImg("/v2/nav/u3.png"),
  func: () => {
    goto('/user/record')
  }
}, {
  name: '推广用户',
  img: requireImg("/v2/nav/u4.png"),
  func: () => {
    goto('/user/promote')
  }
}, {
  name: '帐变记录',
  img: requireImg("/v2/nav/u5.png"),
  func: () => {
    goto('/user/log')
  }
}, {
  name: '邮件信息',
  img: requireImg("/v2/nav/u6.png"),
  func: () => {
    goto('/user/mail')
  }
}, {
  name: '退出登录',
  img: requireImg("/v2/nav/u7.png"),
  func: () => {
    store.logout()
  }
}])

const icoNav = ref([{
  name: '红包',
  img: requireImg('/v2/nav/hb.png'), func: () => {
    redEnvelopeDialogRef.value.open()
  }
},
  {
    name: 'CDK兑换',
    img: requireImg('/v2/nav/cdk.png'), func: () => {
      cdkDialogRef.value.open()
    }
  }, {
    name: '客服',
    img: requireImg('/v2/nav/kf.png'),
    func: () => {
      kefuRef.value.open()
    }
  }
])

onMounted(() => {
  if (route.query.code && !store.isLogin) {
    sessionStorage.setItem('code', route.query.code)
    loginDialog.value.open('register')
  }
})

const showPopover = defineModel('showPopover', {default: false})
const visibleChange = (v) => {
  showPopover.value = v
}
const cdkDialogRef = ref()
const redEnvelopeDialogRef = ref()
const kefuRef = ref()
</script>

<template>
  <CDKDialog ref="cdkDialogRef"/>
  <RedEnvelopeDialog ref="redEnvelopeDialogRef"/>
  <Kefu ref="kefuRef"></Kefu>
  <div class="top-info">
    <div class="is_login" v-if="store.isLogin">
      <div class="ico_nav">
        <img v-for="(i,index) in icoNav" :key="index" :title="i.name" :src="i.img" @click="i.func">
      </div>
      <div class="charge item" v-if="!store.isPC" @click="rechargeModalRef.open" style="margin-right: 5px">
        <img :src='requireImg("/v2/jine.png")' alt=""/>
        充值
      </div>
      <div v-if="store.isPC" style="display: flex">
        <div class="item">
          <img :src="requireImg('/coin1.png',false,false)" alt="">
          余额：{{ store.userInfo?.accountAmount || 0.00 }}
        </div>
        <!-- <div class="item">
          <img :src="requireImg('/coin2.png',false,false)"
               alt="">
          弹药：{{ store.userInfo?.accountCredits || 0.00 }}
        </div> -->
      </div>

      <!--      <div v-else>-->
      <!--        <div class="item coin">-->
      <!--          <img :src="requireImg('/coin1.png',false,false)" alt="">-->
      <!--          <div>{{ store.userInfo?.accountAmount || 0.00 }}</div>-->
      <!--        </div>-->
      <!--        <div class="item coin"><img :src="requireImg('/coin2.png',false,false)" alt="">-->
      <!--          <div>{{ store.userInfo?.accountCredits || 0.00 }}</div>-->
      <!--        </div>-->
      <!--      </div>-->
      <div class="charge item" v-if="store.isPC" @click="rechargeModalRef.open">
        <img :src='requireImg("/v2/jine.png",false)' alt=""/>
        充值
      </div>
      <UAvatar style="cursor: pointer;flex-shrink: 0" v-if="!store.isLogin"/>

      <el-dropdown v-else popper-class="user-popper" @visible-change="visibleChange">
        <UAvatar style="cursor: pointer;flex-shrink: 0"
                 :src="store.userInfo&&store.userInfo.avatar?store.userInfo.avatar:null" size="55"/>
        <template #dropdown>
          <el-dropdown-menu style="
          --el-bg-color-overlay:#210F0BCC;
          --el-text-color-regular:#FFF;
          --el-dropdown-menuItem-hover-color: #FFFFFFCC;
          --el-dropdown-menuItem-hover-fill: #000;min-width: 136px">
            <el-dropdown-item v-for="(i,index) in userNav" :key="index" @click="i.func">
              <div style="display: flex;align-items: center">
                <img :src="i.img" alt="" style="width: 20px;height: 20px;margin-right: 10px">
                <span>{{ i.name }}</span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="no_login" v-else>
      <div class="register_btn item" @click="goto('/register')">
        注册
      </div>
      <div class="login_btn item" @click="goto('/login')">
        登录
      </div>
    </div>
  </div>
  <LoginDialog ref="loginDialog"/>
  <RechargeModal ref="rechargeModalRef"/>
</template>
<style lang="scss">
@use "@/style" as *;

.el-popper__arrow {
  display: none;
}

.user-popper {
  background: transparent !important;
  border: none !important;
  @include mobile {
    width: 100vw;
    background: rgb(33, 15, 11) !important;
    inset: 60.6667px auto auto 0px !important;
  }

}
</style>
<style scoped lang="scss">
@use "@/style" as *;

.ico_nav {
  display: flex;

  img {
    width: 20px;
    margin-right: 12px;
    cursor: pointer;
  }
}

.top-info {
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 16px;
  @include mobile {
    font-size: 14px;
  }

  .item {
    margin-right: 20px;
    display: flex;
    align-items: center;
    @include mobile {
      margin-right: 5px !important;
    }

    &.coin {
      color: #fff;

      &:first-child {
        margin-bottom: 5px;
      }

      img {
        width: 25px;
        height: 25px;
        margin-right: 10px;
        @include mobile {
          width: 15px;
          height: 15px;
          margin-right: 5px;
        }
      }


    }
  }

  .no_login {
    cursor: pointer;
    display: flex;
    align-items: center;


    .login_btn {
      width: 70px;
      height: 27px;
      background: linear-gradient(90deg, #030106, #a70202);
      border-radius: 8px;
      border: 1px solid #ff553c;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: .3s;


      &:hover {
        filter: drop-shadow(0 0 5px #ff553c);
      }
    }

    .register_btn {
      width: 70px;
      height: 27px;
      background: linear-gradient(90deg, #030106, #a70202);
      border-radius: 8px;
      border: 1px solid #a70202;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: .3s;

      &:hover {
        filter: drop-shadow(0 0 5px #ff553c);
      }
    }
  }

  .is_login {
    display: flex;
    align-items: center;

    .item {
      margin-right: 20px;
      font-size: .8em;

      img {
        width: 18px;
        margin-right: 5px;
      }
    }

    .charge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 112px;
      height: 40px;
      background: linear-gradient(180deg, #FF553C 0%, #A70202 100%);

      border-radius: 28px;
      border: 1px solid #A70202;

      font-size: 16px;
      cursor: pointer;
      transition: .3s;
      font-weight: bold;


      &:hover {
        filter: drop-shadow(0 0 5px #FF553C);
      }

      img {
        width: 24px;
        height: 24px;
        transition: .1s;
      }
      @include mobile{
        width: 80px;
        height: 29px;
        font-size: 14px;

        img{
          width: 16px;
          height: 16px;

        }
      }
    }
  }
}
</style>
