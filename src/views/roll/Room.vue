<script setup>

import Layout from "@/components/Layout.vue";
import {useRoute, useRouter} from "vue-router";
import {
  getInRollApi,
  getRollDetailsApi,
  getRollOpenPrizeApi,
  getRollPlayersApi,
  getRollPrizePoolApi,
  joinRollApi
} from "@/api/roll";
import {onMounted, onUnmounted, ref} from "vue";
import {goto, requireImg} from "@/utils/common";
import {useStore} from "@/store";
import {ElMessage} from "element-plus";
import BaseDialog from "@/components/dialogs/BaseDialog.vue";
import BaseButton from "@/components/Btn/BaseButton.vue";
import NewBoxs from "@/components/Box/NewBoxs.vue";

const store = useStore()
const route = useRoute()
const router = useRouter()
const data = ref()
const active = ref(0)
const prize = ref()
const players = ref()
const openPrize = ref()
let timer = ref(null)
const myPrize = ref(null)
const pwd = ref()
const loading = ref(false)

const defaultForm = {
  page: 1,
  rollId: route.params.id,
  size: 20
}
const baseDialogRef = ref()
const pwdRef = ref()


const getDetails = () => {
  checkId()
  getRollDetailsApi(route.params.id).then(res => {
    data.value = res.data
    if (store.isLogin) {
      getInRollApi(route.params.id).then(res => {
        console.log(res)
        if (res.data) {
          getOpenPrizeList(JSON.parse(JSON.stringify(defaultForm)))
        }
      })
    }

    getPrizeList(JSON.parse(JSON.stringify(defaultForm)))
    if (data.value && data.value.endTime) {
      let now = new Date().getTime()
      let end = new Date(data.value.endTime).getTime()
      if (end > now) {
        console.log("开始倒计时", (end - now + 5000) / 1000)
        if (end - now < 1000*60*60) {
          timer.value = setTimeout(() => {
            ElMessage.success("即将开奖...")
            getDetails()
          }, end - now + 5000)
        }
      }


    }
  })
}
const checkId = () => {
  if (!route.params.id) {
    goto('/roll')
  }
}


const navList = ref([{
  'name': '包含饰品',
  'value': 0
}, {
  'name': '参与名单',
  'value': 1
}, {
  'name': '中奖名单',
  'value': 2
}])
const changeActive = (val) => {
  active.value = val
  if (active.value === 0) {
    getPrizeList(JSON.parse(JSON.stringify(defaultForm)))
  } else if (active.value === 1) {
    getPlayersList(JSON.parse(JSON.stringify(defaultForm)))
  } else if (active.value === 2) {
    getOpenPrizeList(JSON.parse(JSON.stringify(defaultForm)))
  }

}
const getPrizeList = (data) => {
  loading.value = true
  // getRollPrizePoolApi(data)
  getRollPrizePoolApi(data).then(res => {
    if (res.data === null || res.data.length === 0) {
      return
    }
    let tmp = []
    res.data.forEach(item => {
      for (let i = 0; i < item.ornamentsNum; i++) {
        tmp.push(item)
      }
    })

    if (data.page === 1) {
      prize.value = tmp
    } else {
      prize.value = [...prize.value, ...tmp]
    }
    data.page = data.page + 1
    getPrizeList(data)
  }).finally(()=>{
    loading.value=false
  })
  // getRollDetailsApi(route.params.id).then(res => {
  //   let tmp = []
  //   res.data.jackpotOrnamentsDataList.forEach(item => {
  //     for (let i = 0; i < item.ornamentsNum; i++) {
  //       tmp.push(item)
  //     }
  //   })
  //   prize.value = tmp
  // }).finally(() => {
  //   loading.value = false
  // })
}
const getPlayersList = (data) => {
  loading.value = true
  getRollPlayersApi(data).then(res => {
    if (res.data === null || res.data.length === 0) {
      return
    }
    if (data.page === 1) {
      players.value = res.data
    } else {
      players.value = [...players.value, ...res.data]
    }
    data.page = data.page + 1
    getPlayersList(data)
  }).finally(() => {
    loading.value = false
  })
}
const getOpenPrizeList = (data) => {
  loading.value = true
  getRollOpenPrizeApi(data).then(res => {
    if (res.data === null || res.data.length === 0) {
      if (store.isLogin) {
        getInRollApi(route.params.id).then(res => {
          if (res.data) {
            if (openPrize.value != null && openPrize.value.length > 0) {
              for (let item of openPrize.value) {
                if (item.holderUserId === store.userInfo.userId) {
                  myPrize.value = item
                  baseDialogRef.value.open()
                  return
                }
              }
              if (data.value.rollStatus == 1) {
                baseDialogRef.value.open()
              }
            }

          }
        }).finally(() => {
          loading.value = false
        })
      }
      return
    }
    if (data.page === 1) {
      openPrize.value = res.data
    } else {
      openPrize.value = [...openPrize.value, ...res.data]
    }
    data.page = data.page + 1
    getOpenPrizeList(data)

  }).finally(() => {
    loading.value = false
  })
}

const joinRoll = () => {
  if (data.value.hasPW) {
    pwdRef.value.open()
  } else {
    joinRollApi({
      rollId: route.params.id
    }).then(res => {
      ElMessage.success("加入成功")
    })
  }


}

const joinRollPwd = () => {
  joinRollApi({
    rollId: route.params.id,
    rollPassword: pwd.value
  }).then(res => {
    ElMessage.success("加入成功")
  })
}

onUnmounted(() => {
  clearTimeout(timer.value)
  timer.value = null
})
onMounted(() => {
  console.log(baseDialogRef.value)
})

getDetails()

</script>

<template>
  <layout :style="{
    '--roll-l':requireImg('/roll/l.png',true),
    '--btn-join':requireImg('/roll/btn-join.png',true),
    '--roll-r':requireImg('/roll/r.png',true),
    '--bg-border':requireImg('/v2/roll/room/border.png',true)
  }">
    <template #item>
      <div class="bg" :style="{backgroundImage:requireImg('/v2/bg/bg-roll-room.png',true)}"></div>
      <div class="roll_room">
        <div class="back">
          <img :src="requireImg('/v2/roll/room/back.png')" alt="" @click="goto('/roll')">
          返回
        </div>
        <div class="room" v-if="data">
          <div class="room-info" v-if="store.isPC">
            <div class="title">{{ data.rollName || '标题' }}</div>
            <div class="deadline">
              <el-countdown
                  format="D天HH时mm分ss秒"
                  :value="new Date(data.endTime)"
                  style="--el-statistic-content-color: #FFFFFFB2;--el-statistic-content-font-size: 12px"
                  v-if="new Date(data.endTime) > new Date()"/>
              <div v-else>已结束</div>
            </div>
            <div class="ico">
              <img class="bx" :src="requireImg('/v2/roll/bx.png',false)" alt="">
              <BaseButton @click="joinRoll" class="btn_n" name="参与活动"></BaseButton>
            </div>
            <div class="desc">
              <p>房间说明：</p>
              {{ data.description || '暂无描述' }}
            </div>

          </div>
          <div class="room-info" v-else style="margin-top: 20px;padding :  0 10px">
            <div style="display: flex;height: fit-content;width: 100%;justify-content: space-between;align-items: flex-end">
              <div style="display: flex;flex-direction: column">
                <div class="title" style="font-size: 16px">{{ data.rollName || '标题' }}</div>
                <div class="deadline">
                  <el-countdown
                      format="D天HH时mm分ss秒"
                      :value="new Date(data.endTime)"
                      style="--el-statistic-content-color: #FFFFFFB2;--el-statistic-content-font-size: 12px"
                      v-if="new Date(data.endTime) > new Date()"/>
                  <div v-else>已结束</div>
                </div>
                <BaseButton :custom-style="{height:'31px',marginTop:'30px'}" font-size="14px" @click="joinRoll" class="btn_n" name="参与活动"></BaseButton>
              </div>
              <div class="ico" style="height: 120px;width: 120px">
                <img class="bx" style="width: 105px;margin-top: 0" :src="requireImg('/v2/roll/bx.png',false)" alt="">
              </div>
            </div>
            <div class="desc" style="margin: 40px 10px;padding: 8px 12px;height: fit-content">
              <p>房间说明：</p>
              {{ data.description || '暂无描述' }}
            </div>

          </div>
          <div class="room-content" v-loading="loading">

            <div class="nav">
              <div class="nav-item" v-for="(i,index) in navList" :class="{'active':active===i.value}" :key="index"
                   @click="changeActive(i.value)" v-show="!(index===2&&data.rollStatus=='0')">
                <span>{{ i.name }}</span>
              </div>
            </div>
            <div class="number" v-show="active===0">
              饰品件数: {{ data.ornamentsNum || 0 }}
            </div>
            <div class="prize f1-auto-y" v-if="active===0&&prize">
<!--              <div class="prize-item" v-for="(i,index) in prize"-->
<!--                   :style="{backgroundImage:'url('+i.ornamentLevelImg+')'}" :key="index" :title="i.ornamentName">-->
<!--                <img :src="i.imgUrl" alt="">-->
<!--                <div class="prize-item-name ellipsis">{{ i.ornamentName || ' ' }}</div>-->
<!--                &lt;!&ndash;                <div class="price">{{ i.price }}</div>&ndash;&gt;-->
<!--              </div>-->
              <NewBoxs class="prize-bx" :showFooter="false" v-for="(i,index) in prize" :box-data="i" :key="index"></NewBoxs>
            </div>
            <div class="players f1-auto-y" v-if="active===1&&players">
              <div class="players-item" v-for="(i,index) in players" :key="index">
                <img :src="i.avatar" alt="">
                <div class="players-item-name ellipsis">{{ i.nickName }}</div>
              </div>
            </div>
            <div class="prize open-prize f1-auto-y" v-if="active===2&&openPrize">
              <div class="prize-item open-prize-item" v-for="(i,index) in openPrize" :title="i.ornamentName"
                   :style="{backgroundImage:'url('+i.ornamentLevelImg+')'}" :key="index">
                <div class="user">
                  <img :src="i.avatar" alt="">
                  <div class="prize-item-name ellipsis">{{ i.holderUserNickName }}</div>
                </div>
                <img :src="i.imageUrl" alt="">
                <div class="prize-item-name ellipsis" v-show="i.ornamentName">{{ i.ornamentName || '' }}</div>
                <!--                <div class="price">{{ i.ornamentsPrice }}</div>-->
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

  </layout>
  <BaseDialog ref="baseDialogRef" :title="myPrize?'恭喜中奖':'未中奖'">
    <template #default>
      <div class="my_prize" v-if="myPrize">
        <div class="my_prize-item"
             :style="{backgroundImage:'url('+myPrize.ornamentLevelImg+')'}">
          <img :src="myPrize.imageUrl" alt="">
          <div class="my_prize-item-name ellipsis">{{ myPrize.ornamentName || '' }}</div>
        </div>
      </div>
      <div v-else
           style="width: 100%;height: 90%;display: flex;align-items: center;justify-content: center;font-size: 20px">
        很遗憾，您没有中奖。
      </div>
    </template>
  </BaseDialog>
  <BaseDialog ref="pwdRef" title="房间密码" :show-confirm="true" @confirm="joinRollPwd">
    <template #default>
      <div style="display:flex;align-items: center;justify-content: center;width: 100%;height: 100%">
        <el-input v-model="pwd" placeholder="请输入房间密码" style="max-width: 300px"></el-input>
      </div>
    </template>
  </BaseDialog>

</template>

<style scoped lang="scss">
@use "@/style" as *;

.my_prize {
  display: flex;
  width: 100%;
  height: 90%;
  flex-wrap: wrap;
  margin-top: 15px;
  align-items: center;
  justify-content: center;

  &-item {
    background-size: 100% 100%;
    width: 200px;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin: 5px;
    position: relative;

    img {
      width: 120px;
      height: 120px;
      margin-top: 5px;
    }

    &-name {
      width: 90%;
      background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgb(0, 0, 0), rgba(0, 0, 0, 0));
      margin: 5px 0;
      padding: 2px 10px;
      text-align: center;
      font-size: .8em;
    }

    .price {
      position: absolute;
      left: 6px;
      top: 2px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    }

  }
}

.roll_room {
  display: flex;
  flex-direction: column;
  font-size: 16px;

  .back {
    display: flex;
    height: fit-content;
    margin: 35px 20px;
    cursor: pointer;
    z-index: 2;
    align-items: center;
    color: #FFF5F5CC;
  ;
    @include mobile {
      display: none;
    }

    img {
      height: 24px;
      margin-right: 8px;

    }
  }

  .room {
    display: flex;
    background-image: var(--bg-border);
    background-size: 100% 100%;
    margin-left: 20px;
    @include mobile {
      flex-direction: column;
      background-image: none;
      margin-left: 0;
    }

    &-info {
      height: 700px;
      width: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 80px 20px 40px 70px;
      flex-shrink: 0;
      @include mobile {
        width: 100%;
        background-image: none;
        padding: 0 20px 60px;
        height: fit-content;

      }

      .title {
        font-size: 24px;
        color: #FFF5F5;
        filter: drop-shadow(0px 0px 4.3px #FF4545A6);
        white-space: nowrap;
        margin-top: 0;
        z-index: 2;
        @include mobile {
          font-size: 38px;
          margin-top: 20px;
          white-space: wrap;

        }
      }

      .ico {
        width: 240px;
        height: 277px;
        border-radius: 9.6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 3.2px 27.12px 0 #500B0557;
        background: linear-gradient(180deg, rgba(56, 49, 49, 0) 0%, rgba(222, 67, 32, 0.27) 100%);
        position: relative;
        .bx{
          width: 211px;
          height: 211px;
          margin-top: 24px;
        }

        .btn_n{
          width: 90%;
          position: absolute;
          bottom: -10px;
          height: 41px;
          font-size: 14px;
        }
      }

      .deadline {
        display: flex;
        align-items: center;
        margin: 12px 0 4px;
      }

      .desc {
        margin: 30px 10px;
        padding: 0 20px;
        width: 100%;
        box-sizing: border-box;
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #FFFFFFA8;
        font-size: 14px;
        @include mobile {
          border: none;
          background-color: rgba(186, 186, 186, 0.35);
          font-size: 14px;
        }

      }


    }

    &-content {
      height: 700px;
      flex: 1;
      padding: 40px 20px 80px;
      box-sizing: border-box;
      margin-left: 20px;
      z-index: 3;
      display: flex;
      flex-direction: column;
      @include mobile {
        background-image: none;
        margin-left: 0;
        padding: 10px 20px 80px;
      }

      .nav {
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

      .number {
        margin: 18px 0;
        font-size: 14px;
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        padding-right: 100px;
        text-align: right;
        color: #FFFFFFB2;
        @include mobile {
          margin: 6px auto 0;
          padding-right: 0;
        }
      }

      .prize {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        margin-top: 15px;
        &-bx{
          margin: 5px;
        }

        &-item {
          background-size: 100% 100%;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          margin: 5px;
          position: relative;
          @include mobile {
            margin: 2px;
            width: 31%;
            max-width: 120px;
            height: auto;
          }

          img {
            width: 80px;
            height: 80px;
            margin-top: 5px;
          }

          &-name {
            width: 90%;
            background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgb(0, 0, 0), rgba(0, 0, 0, 0));
            margin: 5px 0;
            padding: 2px 10px;
            text-align: center;
            font-size: .8em;
          }

          .price {
            position: absolute;
            left: 6px;
            top: 2px;
            font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
          }

        }
      }

      .players {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;

        width: 100%;
        @include mobile {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }

        &-item {
          width: 80px;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          margin: 10px;
          @include mobile {
            margin: 20px auto 0;
          }

          img {
            width: 60px;
            height: 60px;
            border-radius: 50%;
          }

          &-name {
            width: 90%;
            margin: 5px 0;
            padding: 2px 10px;
            text-align: center;
            font-size: .8em;
          }
        }
      }

      .open-prize {
        @include mobile {
          align-items: center;
          justify-content: space-evenly;
        }

        &-item {
          height: 180px;
          width: 180px;
          @include mobile {
            max-width: 180px;
          }

          .user {
            display: flex;
            align-items: center;
            justify-content: center;

            img {
              width: 30px;
              height: 30px;
              border-radius: 50%;
            }

            .ellipsis {
              font-size: 14px;
              background: none;
            }
          }
        }

      }

    }
  }
}

.f1-auto-y {
  flex: 1;
  overflow-y: auto;
  @include mobile {
    flex: 0;
    height: 100%;
    overflow-y: visible;
  }
}
</style>
