<script setup>

import Layout from "@/components/Layout.vue";
import {requireImg} from "@/utils/common";
import {ref, watch} from "vue";
import {getActivityListApi, getAwardApi, getNameActivityListApi, getNameAwardApi, getUserInfoApi} from "@/api";
import {ElMessage} from "element-plus";
import {useStore} from "@/store";
import Title from "@/components/Title.vue";
import BaseButton from "@/components/Btn/BaseButton.vue";

const store = useStore()
const loading = ref(false)

const list = ref([])
const RNList = ref([])


const getRNList = () => {
  getNameActivityListApi().then(res => {
    RNList.value = res.data
  })
}

const getRNAward = (index) => {
  getNameAwardApi(index).then(res => {
    ElMessage.success('领取成功')
    getUserInfoApi().then(res => {
      store.setUserInfo(res.data)
    })
    getRNList()
  })

}

const getList = () => {
  if (loading.value) return
  loading.value = true
  getActivityListApi().then(res => {
    list.value = []
    for (let i = 0; i < 3; i++) {
      let data = {}
      let item
      try {
        item = res.data[i]
        if (item) {
          const recharge =
              i === 0 ? res.data.rechargeProcess.dayTotalRecharge :
                  i === 1 ? res.data.rechargeProcess.weekTotalRecharge :
                      res.data.rechargeProcess.monthTotalRecharge
          for (let j of item) {
            data = j
            data['recharge'] = recharge
            list.value.push(data)
          }
        }


      } catch (e) {
        break
      }
      // if (i === 0) {
      //   const recharge = res.data.rechargeProcess.dayTotalRecharge
      //   for (let j of item) {
      //     if (recharge <= j.rechargeThreshold && j.status === '0') {
      //       data = j
      //       data['recharge'] = recharge
      //       break
      //     }
      //   }
      //   if (Object.keys(data).length === 0) {
      //     let length = item.length
      //     length = length - 1 < 0 ? 0 : length - 1
      //     data = res.data[i][length]
      //     data['recharge'] = recharge
      //   }
      // } else if (i === 1) {
      //   const recharge = res.data.rechargeProcess.weekTotalRecharge
      //   for (let j of res.data[i]) {
      //     if (recharge <= j.rechargeThreshold && j.status === '0') {
      //       data = j
      //       data['recharge'] = recharge
      //       break
      //     }
      //   }
      //   if (Object.keys(data).length === 0) {
      //     let length = item.length
      //     length = length - 1 < 0 ? 0 : length - 1
      //     data =item[length]
      //     data['recharge'] = recharge
      //   }
      // } else if (i === 2) {
      //   const recharge = res.data.rechargeProcess.monthTotalRecharge
      //   for (let j of item) {
      //     if (recharge <= j.rechargeThreshold && j.status === '0') {
      //       data = j
      //       data['recharge'] = recharge
      //       break
      //     }
      //   }
      //   if (Object.keys(data).length === 0) {
      //     let length = item.length
      //     length = length - 1 < 0 ? 0 : length - 1
      //     data = item[length]
      //     data['recharge'] = recharge
      //   }
      // }
      // list.value.push(data)
    }

    console.log(list.value)
  }).finally(() => {
    loading.value = false
  })
}

const getAward = (item) => {
    getAwardApi({
      bonusId: item.id
    }).then(res => {
      ElMessage.success('成功领取金币:' + res.data.toFixed(2))
      getUserInfoApi().then(res => {
        store.setUserInfo(res.data)
      })
      getList()
    })
}
watch(() => store.userInfo, () => {
  getList()
}, {
  immediate: true,
  deep: true
})
getRNList()
</script>

<template>
  <Layout :style="{
    '--bg-item':requireImg('/center/bg-item.png',true),
    '--bg-btn':requireImg('/center/bg-btn.png',true),
    '--bg-center':requireImg('/v2/bg/bg-center.png',true)
  }">
    <template #item>
      <div class="bg center-bg"></div>
      <div class="center">
        <div class="center-content">
          <div class="center-title">
            <span>新人实名福利</span>
          </div>
          <div class="center-content-fl">
            <div class="center-content-fl-item" v-for="(i,index) in RNList" :key="index">

              <div class="center-content-fl-item-name">
                <div>{{ i.name }}</div>
                <div style="white-space: nowrap">
                  <template v-if="i.ornament">
                    <!-- 饰品奖励 -->
                    {{ i.ornament.name || i.ornament.marketHashName || '饰品 x1' }}
                  </template>
                  <template v-else-if="i.name && i.name.includes('金币')">
                    <!-- 金币奖励 -->
                    金币 x{{ i.awardMoney || 0 }}
                  </template>
                  <template v-else-if="i.name && i.name.includes('弹药')">
                    <!-- 弹药奖励 -->
                    弹药 x{{ i.awardMoney || 0 }}
                  </template>
                  <template v-else>
                    <!-- 默认显示 -->
                    {{ i.awardMoney ? `奖励 x${i.awardMoney}` : '奖励' }}
                  </template>
                </div>
                <img :src="requireImg('/v2/center/bx.png',false)" alt="">
              </div>
              <BaseButton v-if="i.getStatus==0" @click="getRNAward(index+1)" class="btn_n ungetted" font-size="13px" name="立即领取">
              </BaseButton>
              <BaseButton v-else-if="i.getStatus==1" :is-gray="true"  @click="getRNAward(index+1)" class="btn_n" font-size="13px" name="已领取" style="color: #b9b9b9;">
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
      <div class="center">
        <div class="center-content">
          <div class="center-title">
            <span>充值福利</span>
          </div>
          <div class="center-content-fl">
            <div class="center-content-fl-item" v-for="(i,index) in list" :key="index">

              <div class="center-content-fl-item-name">
                <div>{{ i.name }}</div>
                <div style="white-space: nowrap">
                  金币：{{ JSON.parse(i.awardSection)[0] }} - {{ JSON.parse(i.awardSection)[1] }}
                </div>
                <img :src="requireImg('/v2/center/bx.png',false)" alt="">
              </div>

              <BaseButton :is-gray="!(i.getStatus==1&&i.recharge>=i.rechargeThreshold)"  @click="getAward(i)" class="btn_n ungetted2" font-size="12px">
                <template #name>
                  <div v-if="i.getStatus==0&&i.recharge>=i.rechargeThreshold">
                    已达到领取门槛 ({{ i.recharge }}/{{ i.rechargeThreshold }})
                  </div>
                  <div v-else-if="i.getStatus==1">已领取</div>
                  <div v-else-if="i.getStatus==0&&i.recharge<i.rechargeThreshold">未达到领取门槛
                    ({{ i.recharge }}/{{ i.rechargeThreshold }})
                  </div>
                </template>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 200px"></div>
    </template>
  </Layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;

$primary-color-user: rgb(138, 15, 198);

.center-bg{
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1;
  left: 0;
  top: 0;
  background-image: url('@/assets/images/roll/bg.png');
  background-repeat: no-repeat;
  background-size: 100% 96%;
  background-position: left bottom;
}
.center {
  z-index: 2;
  width:100%;

  &-title {
    width: 70%;
    height: 36px;
    background: url('@/assets/images/roll/title_bg.png') no-repeat;
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    margin-top: 20px;
    padding-bottom: 6px;
    box-sizing: border-box;
    span {
      font-family: "jijiati";
      font-size: 19px;
      background: linear-gradient(to bottom, #FFF3C8, #FFCE79); /* 渐变方向和颜色 */
      -webkit-background-clip: text; /* 仅限WebKit浏览器 */
      background-clip: text; /* 现代浏览器支持 */
      color: transparent; /* 文本颜色设为透明 */
    }
  }
  .btn_n{
    width: 75%;
    position: absolute;
    bottom: 16px;
    height: 26px;
    border-radius: 6px;
    background: linear-gradient(to right, #252525, #383838);
  }
  .ungetted {
    background: linear-gradient(to right, #12382b, #33492a);
  }
  .ungetted2 {
    background: linear-gradient(to right, #2e291c, #463e2b);
  }
  .center-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;

    &-title {
      position: relative;
      width: fit-content;
      margin: 20px 30px;
      align-self: flex-start;
      @include mobile {
        align-self: center;
      }

      span {
        position: relative;
        font-size: 30px;
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        color: #fff;
        z-index: 2;
        filter: drop-shadow(1px 1px 2px $primary-color-user);
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

    &-fl {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 20px;
      width: 100%;
      max-width: 900px;
      place-items: center;
      @include mobile {
        //display: flex;
        //flex-direction: column;
        //align-items: center;
        grid-template-columns: repeat(2, 1fr);
      }

      &-item {
        width: 214px;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 281px;
        border-radius: 6px;
        background-color: rgba($color: #1C2529, $alpha: 0.78);
        position: relative;
        img {
          width: 80%;
        }
        @include mobile{
          width: 161px;
          height: 210px;
          img{
            width: 100px;
          }
        }



        &-name {
          width: 200px;
          height: 100%;
          background-size: 100% 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 12px;

          div:nth-child(1) {
            color: #fff;
            filter: drop-shadow(0 0 2px black);
            font-size: 14px;
            white-space: nowrap;
            margin: 6px 0;
          }

          div:nth-child(2) {
            color: #FFFFFFCC;

            filter: drop-shadow(0 0 2px black);
            font-size: 12px;

          }
        }


        &-btn {
          height: 42px;
          width: 240px;
          background-image: var(--bg-btn);
          background-size: 100% 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          bottom: -10px;

          filter: grayscale(100%);
          cursor: no-drop;

          div {
            font-size: 20px;
            font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
            color: #fff;
            filter: drop-shadow(0 0 0px rgb(138, 15, 198));
            display: flex;
            align-items: baseline;

            div {
              font-size: 16px;

            }
          }

          &.active {
            cursor: pointer;
            filter: grayscale(0%);

          }
        }

      }

    }
  }
}
</style>
