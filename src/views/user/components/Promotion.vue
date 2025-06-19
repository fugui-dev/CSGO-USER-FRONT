<script setup>

import {useClipboard} from "@vueuse/core";
import {useUserInfo} from "@/composables/useUesrInfo";
import {ElMessage} from "element-plus";
import {useQRCode} from '@vueuse/integrations/useQRCode'
import {computed, ref} from "vue";
import {getPromotionDetailApi, getPromotionUnderPeopleCountApi, getStatisticsPromotionDataApi} from "@/api";
import BaseButton from "@/components/Btn/BaseButton.vue";
import {useStore} from "@/store";

const { copy, text, isSupported } = useClipboard()
const {userInfo} = useUserInfo()
const store = useStore()

const link=computed(()=>{
  return location.origin+`/#/register?code=${userInfo.value.invitationCode}`
})
const qrcode = useQRCode(link)
const summarize=ref({
  people:0,
  afterDayPre:0,
  commissions:0
})

const onCopy=(text)=>{
  console.log(text)
  if (isSupported&&copy(text)){
      ElMessage.success('复制成功')
  }else {
    ElMessage.error('复制失败')
  }

}

const getData=()=>{
  getPromotionDetailApi().then(res=>{
    summarize.value.afterDayPre=res.data.afterDayPre
    summarize.value.commissions=res.data.commissions
  })
  getPromotionUnderPeopleCountApi().then(res=>{
    summarize.value.people=res.data
  })
}

const getS=()=>{
  getStatisticsPromotionDataApi(store.userInfo?.userId).then(res=>{
    summarize.value.rebateTotal = res.data.rebateTotal
    summarize.value.rechargeTotal = res.data.rechargeTotal
    summarize.value.balancedPrice = res.data.balancedPrice
    summarize.value.unbalancedPrice = res.data.unbalancedPrice
    summarize.value.todayRechargeTotal = res.data.todayRechargeTotal
    summarize.value.todayRebateTotal = res.data.todayRebateTotal
    summarize.value.thisWeekRechargeTotal = res.data.thisWeekRechargeTotal
    summarize.value.thisWeekRebateTotal = res.data.thisWeekRebateTotal

  })
}


getData()
getS()



</script>

<template>
  <div class="promotion">
    <div class="self-title">
      <span>推广链接</span>
      <div></div>
    </div>
    <div class="promotion-item no_border">
      <div class="link">
        <div class="link-title">我的推广码:</div>
        <el-input class="link-content" readonly v-model="userInfo.invitationCode"></el-input>
        <BaseButton  font-size="14px" class="link-btn" @click="onCopy(userInfo.invitationCode)" name="复制"></BaseButton>
      </div>
    </div>
    <div class="promotion-item no_border">
      <div class="link">
        <div class="link-title">我的推广链接:</div>
        <el-input class="link-content" readonly v-model="link"></el-input>
        <BaseButton  font-size="14px" class="link-btn" @click="onCopy(link)" name="复制"></BaseButton>

      </div>
      <img :src="qrcode" alt="" class="qr">
    </div>
    <div class="self-title">
      <span>推广明细</span>
      <div></div>
    </div>
    <div class="promotion-item no_padding">
        <div class="total">
          <div class="total-item">
            <div class="item ellipsis">推广人数</div>
            <div class="item ellipsis">{{summarize.people}}</div>
          </div>
          <div class="total-item">
            <div class="item ellipsis">总返佣金额</div>
            <div class="item ellipsis">{{summarize.rebateTotal}}</div>
          </div>
          <div class="total-item">
            <div class="item ellipsis">分佣比例</div>
            <div class="item ellipsis">{{summarize.commissions}}</div>
          </div>
          <div class="total-item">
            <div class="item ellipsis">下级总充值</div>
            <div class="item ellipsis">{{summarize.rechargeTotal}}</div>
          </div>
          <div class="total-item">
            <div class="item ellipsis">已结算金额</div>
            <div class="item ellipsis">{{summarize.balancedPrice}}</div>
          </div>
          <div class="total-item">
            <div class="item ellipsis">未结算金额</div>
            <div class="item ellipsis">{{summarize.unbalancedPrice}}</div>
          </div>
          <div class="total-item">
            <div class="item ellipsis">明日预计收益</div>
            <div class="item ellipsis">{{summarize.afterDayPre}}</div>
          </div>
          <div class="total-item">
            <div class="item ellipsis">今日总充值</div>
            <div class="item ellipsis">{{summarize.todayRechargeTotal}}</div>
          </div>
          <div class="total-item">
            <div class="item ellipsis">今日总返佣</div>
            <div class="item ellipsis">{{summarize.todayRebateTotal}}</div>
          </div>
          <div class="total-item">
            <div class="item ellipsis">本周总充值</div>
            <div class="item ellipsis">{{summarize.thisWeekRechargeTotal}}</div>
          </div>
          <div class="total-item">
            <div class="item ellipsis">本周总返佣</div>
            <div class="item ellipsis">{{summarize.thisWeekRebateTotal}}</div>
          </div>
          <div class="total-item">
            <div class="item ellipsis"></div>
            <div class="item ellipsis"></div>
          </div>
        </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;
$primary-color-user: rgba(245, 76, 54, 0.6);
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
.qr{
  height: 100%;
  width: 100%;
  max-width: 150px;
  margin-left: 100px;
  margin-top: 24px;

  //@include mobile{
  //  margin: 0 auto;
  //}
  &:hover{
    //transform: scale(2) translateX(50%);
    //z-index: 20;
    //position: relative;
    //@include mobile{
    //  transform: scale(1.5);
    //}
  }
}
.promotion{
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  .el-input{
    width: 100%;
  }
  &-title {
    position: relative;
    width: fit-content;
    margin: 20px 30px;

    span {
      position: relative;
      font-size: 24px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      color: #fff;

      z-index: 2;
    }

    div {
      content: '';
      position: absolute;
      width: 140%;
      height: 10px;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      background: $primary-color-user;
      z-index: 0;
    }
  }
  &-item{
    width: 100%;
    height: fit-content;
    border-radius: 10px;
    border: 1px solid $primary-color-user;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    &.no_border{
      border: none !important;
    }
    &.no_padding{
      padding: 0;
    }
    .link{
      display: flex;
      align-items: center;
      height: 60px;
      width: 100%;
      font-size: 14px;
      &-title{
        color: #FFF5F5;

        width: 100px;
        margin-right: 5px;
      }
      &-content{
        display: flex;
        align-items: center;
        flex:1;


      }
      &-btn{
       width: 107px;height: 41px;margin-left: 20px

      }
    }
  }
}

.total{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  &-item{
    display: flex;
    flex-direction: column;
    width:25%;
    @include mobile{
      width:33.33%;
    }

    .item{
      display: flex;
      align-items: center;
      justify-content: center;
      height: 3em;
      &:first-child{
        background: #FFD9D933;
      }

    }
  }
}
.list{
  display: flex;
  flex-direction: column;
  &-item{
    display: grid;
    grid-template-columns: repeat(3,1fr);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    height: 3em;


    &:first-child{
      background: #FFD9D933;

    }
    &:last-child{
      border-bottom: none;
    }
    .item{
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

</style>
