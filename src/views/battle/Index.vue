<script setup>
import Layout from "@/components/Layout.vue";
import {onMounted, ref} from "vue";
import {getBattleBoxListApi, getBattleBoxDetailApi, getBattleRankingApi, getMyOwnFightListApi} from "@/api/battle";
import {requireImg, deepClone} from "@/utils/common";
import {useDebounceFn} from "@vueuse/core";
import {ElMessage} from "element-plus";
import BoxDetailModal from './components/BoxDetail.vue'
import BattleCard from './components/BattleCard.vue'
import Rank from './components/Rank.vue'
import CreateRoomDialog from "./components/CreateRoomDialog.vue";
import GameRuleDialog from "./components/GameRuleDialog.vue";
import {useRouter} from 'vue-router';
import {useStore} from "@/store";
import useWebSocketHeartbeat from '../../composables/useWebSocketHeartbeat';

const router = useRouter()
const store = useStore()

const loading = ref(true)
const boxTypeList = ref([])
const allBoxList = ref([])
const boxDetailModalRef = ref(null)
const createRoomDialogRef = ref(null)
const gameRuleDialogRef = ref(null)
const boxDetailData = ref([])
const currBoxName = ref('')
const rankData = ref({})

const scrollRef = ref()
const listRef = ref()
const list = ref([])
const active = ref(0)
const form = ref({
  page: 1,
  size: 12
})
const isComplete = ref(false)
const navList = ref([{
  'name': '对战列表',
  'value': 0
}, {
  'name': '我参与的',
  'value': 1
}])
const tempList = ref([])

const { ws, isConnected, connect, disconnect } = useWebSocketHeartbeat({
  pingInterval: 30000,
  onOpen: () => {},
  onMessage: (res) => {
    const data = JSON.parse(res.data)
    if (data.data !== 'pong') {
      if (data.data && data.data.total > 1) {
        list.value = data.data.rows
      }
      if (Array.isArray(data.data) && data.data.length === 1) {
        replaceBattleCard(data.data[0])
      }
      console.log(list.value)
    }
  },
  onClose: () => {},
  onError: (error) => {}
})

const flattenBoxData = (boxData) => {
  return boxData.reduce((prev, curr) => {
    return [...prev, ...curr.boxList]
  }, [])
}

// 获取宝箱列表
const getBoxTypeList = () => {
  loading.value = true
  getBattleBoxListApi().then(res => {
    if (res.data && res.data.length) {
      boxTypeList.value = res.data
      allBoxList.value = flattenBoxData(res.data);
    }
  }).finally(() => {
    loading.value = false
  })
}

// 点击获取展示宝箱详情
const handleClickBoxItem = (item) => {
  loading.value = true
  currBoxName.value = item.boxName
  getBattleBoxDetailApi({boxId: item.boxId}).then(res => {
    if (res.data && res.data.length) {
      boxDetailData.value = res.data
      boxDetailModalRef.value.open()
    } else {
      ElMessage.warning('暂无数据')
    }
  }).finally(() => {
    loading.value = false
  })
}

// 获取排行榜数据
const getRankData = () => {
  getBattleRankingApi().then(res => {
    if (res.data) {
      rankData.value = res.data
    }
  })
}

const changeActive = (val) => {
  active.value = val
  if (active.value === 0) {
    list.value = deepClone(tempList.value)
  } else if (active.value === 1) {
    tempList.value = deepClone(list.value)
    form.value.page = 1
    list.value = []
    isComplete.value = false
    getList()
  }
}

const debouncedGetList = useDebounceFn(() => {
  if (!isComplete.value) {
    form.value.page += 1
    getList()
  }
}, 300)

const getList = () => {
  loading.value = true
  getMyOwnFightListApi(form.value).then(res => {
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
  if (active.value !== 0) {
    let scrollBarHeight = scrollRef.value.$el.querySelector(".el-scrollbar__bar:last-child .el-scrollbar__thumb").clientHeight || 200
    if (listRef.value && e.scrollTop) {
      if (e.scrollTop + scrollBarHeight + 500 >= listRef.value.clientHeight) {
        debouncedGetList()
      }
    }
  }
}

// 点击打开创建房间弹窗
const handleClickCreateRoom = () => {
  createRoomDialogRef.value.open()
}

const handleClickGameRule = () => {
  gameRuleDialogRef.value.open()
}

const handleClickBattleCard = (item) => {
  // 模式1：创建房间后进入 模式2：进入等待中或进行中的房间 模式3：进入已结束的房间
  const model = (item.status === '0' || item.status === '1') ? 2 : 3
  router.push({
    path: `/battle/${item.id}`,
    query: { model }
  })
}

// 卡片替换：如果存在目标卡片，则删除并插入第一条，如果不存在则直接删除
const replaceBattleCard = (newData) => {
  const index = tempList.value.findIndex(item => item.id === newData.id)
  if (index >= 0) {
    tempList.value.splice(index, 1)
  }
  tempList.value.unshift(newData)
}

const createWs = () => {
  const userId = store.userInfo.userId;
  if (userId) {
    connect(`ws://121.229.204.223:8090/ws/fight/hall/${userId}`)
  }
}

onMounted(() => {
  getBoxTypeList()
  getRankData()
  createWs()
})

</script>

<template>
  <Layout :style="{
      '--bg-battle':requireImg('/bg/bg-login-pc.png',true),
      '--bg-create-room': requireImg('/home/1.png',true),
      '--bg-create-room-btn': requireImg('/center/bg-btn.png',true),
    }">
    <template #item>
      <div class="bg bg-battle"></div>
      <div class="battle-container" v-loading="loading">
        <!-- 宝箱列表 -->
        <div class="box-list">
          <el-tabs type="border-card">
            <el-tab-pane :label="tabItem.boxTypeName" v-for="tabItem in boxTypeList" :key="tabItem.boxTypeId">
              <el-scrollbar>
                <div class="box-list-container">
                  <div class="box-item" @click="handleClickBoxItem(item)" v-for="item in tabItem.boxList" :key="item.boxId">
                    <div class="bx">
                      <img v-if="item.boxImg01" :src="item.boxImg01" class="bj" alt="" @error="$event.target.style.display = 'none'" />
                      <img v-if="item.boxImg02" :src="item.boxImg02" class="wq" alt="" @error="$event.target.style.display = 'none'" />
                    </div>
                    <div class="mz">
                      <div class="name">{{ item.boxName }}</div>
                    </div>
                    <div class="btn">
                      <div>{{item.price}}</div>
                      <img :src="requireImg('/coin1.png',false)" alt="">
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="content-wrap">
          <!-- 排行榜 -->
          <Rank :rankData="rankData"/>
          <div class="content-right">
            <!-- 创建房间 -->
            <div class="create-room">
              <img :src="requireImg('/home/ygr.png',false)" alt="">
              <p class="create-room-text" @click="handleClickCreateRoom">创建房间</p>
              <p class="rule" @click="handleClickGameRule"><span>?</span>游戏规则</p>
            </div>
            <!-- 列表 -->
            <div class="main-list">
              <div class="nav">
                <div class="nav-item" v-for="(i,index) in navList" :class="{'active':active===i.value}" :key="index"
                    @click="changeActive(i.value)">
                  <span>{{ i.name }}</span>
                </div>
                <!-- <div class="search" v-show="store.isPC">
                  <el-input placeholder="请输入房间名称进行搜索" v-model="form.rollName"></el-input>
                  <div class="btn" @click="handleSearch">搜索</div>
                </div> -->
              </div>
              <!-- 列表数据 -->
              <div class="battle-list" v-loading="loading" style="flex: 1">
                <div class="content">
                  <el-scrollbar max-height="800px" @scroll="onScroll" ref="scrollRef">
                    <div ref="listRef" class="battle-list-container">
                      <BattleCard :cardData="i" v-for="(i,index) in list" :key="index" @click="handleClickBattleCard(i)"/>
                    </div>
                  </el-scrollbar>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
  <BoxDetailModal ref="boxDetailModalRef" :boxData="boxDetailData" :title="currBoxName" />
  <CreateRoomDialog ref="createRoomDialogRef" :boxData="allBoxList" />
  <GameRuleDialog ref="gameRuleDialogRef" />
</template>

<style scoped lang="scss">
@use "@/style" as *;

.bg-battle {
  background-image: var(--bg-battle);
}
.battle-container {
  width: 96%;
  display: flex;
  flex-direction: column;
  max-width: 1024px;
  margin: 6px auto;
  box-sizing: border-box;
  // 宝箱列表
  .box-list {
    width: 100%;
    ::v-deep .el-tabs__content {
      padding: 8px;
    }
    ::v-deep .el-tabs--border-card {
      background-color: #202020;
      border: none;
      outline: none;
      .el-tabs__header {
        background-color: #3e1313;
        border: none;
        outline: none;
        height: 28px;
        .el-tabs__item {
          height: 30px;
        }
        .el-tabs__item:hover {
          color: #ffffff;
          outline: none;
        }
        .el-tabs__item.is-active {
          outline: none;
          background-color: #202020;
          border: none;
          color: #ffffff;
        }
      }
    }
    .box-list-container {
      display: flex;
      width: fit-content;
      .box-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: .5s;
        width: 100px;
        box-sizing: border-box;

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
          margin-bottom: 3px;
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          img{
            width: 60%;
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
        .mz {
          display: flex;
          align-items: center;
          padding: 0;
          background: linear-gradient(90.47deg, rgba(202, 62, 39, 0) 0.31%, rgba(234, 87, 42, 0.44) 51.13%, rgba(201, 61, 38, 0) 100.98%);
          width: 100%;
          font-size: 13px;
          height: 21px;
          line-height: 21px;
          margin: 0 0 4px 0;
          justify-content: center;
          .name {
            font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
          }
        }


        .btn {
          font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
          width: 80%;
          line-height: 1.5em;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: row-reverse;
          img{
            width: 10px;
            margin-right: 3px;
          }
        }
      }
    }
  }
  .content-wrap {
    display: flex;
    .content-right {
      flex: 1;
      margin-left: 8px;
      .create-room {
        width: 100%;
        background-image: var(--bg-create-room);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        height: 158px;
        margin-top: 8px;
        position: relative;
        overflow: hidden;
        img {
          position: absolute;
          left: 9%;
          top: 6%;
          width: 36%;
          height: 150%;
        }
        .create-room-text {
          background-image: var(--bg-create-room-btn);
          background-size: 100% 100%;
          background-repeat: no-repeat;
          width: 310px;
          font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
          font-size: 36px;
          height: 60px;
          line-height: 54px;
          color: #ffffff;
          position: absolute;
          right: 12%;
          top: 25%;
          z-index: 2;
          text-align: center;
          cursor: pointer;
        }
        .rule {
          position: absolute;
          right: 12px;
          bottom: 10px;
          z-index: 2;
          font-size: 14px;
          display: flex;
          align-items: center;
          cursor: pointer;
          span {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 16px;
            height: 16px;
            border: 1px solid #fff;
            border-radius: 50%;
            margin-right: 4px;
          }
        }
      }
      .main-list {
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
        .battle-list {
          .battle-list-container {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-gap: 12px;
            padding: 16px 0;
          }
        }
      }
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

/* 响应式调整 */
@media (max-width: 768px) {
  .content-wrap {
    flex-direction: column;
    .battle-list-container {
      grid-template-columns: 1fr 1fr !important;
    }
  }
}
</style>
