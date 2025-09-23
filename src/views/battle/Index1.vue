<script setup>
import Layout from "@/components/Layout.vue";
import boxList from "./components/boxList.vue";
import BattleItem from "./components/battleItem.vue";
import { onMounted, ref } from "vue";
import {
  getBattleBoxDetailApi,
  getBattleRankingApi,
  getMyOwnFightListApi,
} from "@/api/battle";
import { requireImg, deepClone } from "@/utils/common";
import { useDebounceFn } from "@vueuse/core";
import { ElMessage } from "element-plus";
import BoxDetailModal from "./components/BoxDetail.vue";
import CreateRoomDialog from "./components/CreateRoomDialog.vue";
import GameRuleDialog from "./components/GameRuleDialog.vue";
import { useRouter } from "vue-router";
import { useStore } from "@/store";
import useWebSocketHeartbeat from "../../composables/useWebSocketHeartbeat";

const router = useRouter();
const store = useStore();

const loading = ref(true);
const allBoxList = ref([]);
const boxDetailModalRef = ref(null);
const createRoomDialogRef = ref(null);
const gameRuleDialogRef = ref(null);
const boxDetailData = ref([]);
const currBoxName = ref("");
const scrollRef = ref();
const listRef = ref();
const list = ref([]);
const active = ref(0);
const form = ref({
  page: 1,
  size: 12,
});
const isComplete = ref(false);
const navList = ref([
  {
    name: "对战列表",
    value: 0,
  },
  {
    name: "我参与的",
    value: 1,
  },
]);
const tempList = ref([]);

const { ws, isConnected, connect, disconnect } = useWebSocketHeartbeat({
  pingInterval: 30000,
  onOpen: () => {},
  onMessage: (res) => {
    const data = JSON.parse(res.data);
    if (data.data !== "pong") {
      if (data.data && data.data.total > 1) {
        list.value = data.data.rows;
      }
      if (Array.isArray(data.data) && data.data.length === 1) {
        replaceBattleCard(data.data[0]);
      }
      console.log(list.value);
    }
  },
  onClose: () => {},
  onError: (error) => {},
});

// 点击获取展示宝箱详情
const handleClickBoxItem = (item) => {
  loading.value = true;
  currBoxName.value = item.boxName;
  getBattleBoxDetailApi({ boxId: item.boxId })
    .then((res) => {
      if (res.data && res.data.length) {
        boxDetailData.value = res.data;
        boxDetailModalRef.value.open();
      } else {
        ElMessage.warning("暂无数据");
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const changeActive = (val) => {
  active.value = val;
  if (active.value === 0) {
    list.value = deepClone(tempList.value);
  } else if (active.value === 1) {
    tempList.value = deepClone(list.value);
    form.value.page = 1;
    list.value = [];
    isComplete.value = false;
    getList();
  }
};

const debouncedGetList = useDebounceFn(() => {
  if (!isComplete.value) {
    form.value.page += 1;
    getList();
  }
}, 300);

const getList = () => {
  loading.value = true;
  getMyOwnFightListApi(form.value)
    .then((res) => {
      if (res.data && res.data.length) {
        if (form.value.page === 1) {
          list.value = [];
        }
        list.value.push(...res.data);
      } else {
        isComplete.value = true;
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const onScroll = (e) => {
  if (active.value !== 0) {
    let scrollBarHeight =
      scrollRef.value.$el.querySelector(
        ".el-scrollbar__bar:last-child .el-scrollbar__thumb"
      ).clientHeight || 200;
    if (listRef.value && e.scrollTop) {
      if (e.scrollTop + scrollBarHeight + 500 >= listRef.value.clientHeight) {
        debouncedGetList();
      }
    }
  }
};

// 点击打开创建房间弹窗
const handleClickCreateRoom = () => {
  createRoomDialogRef.value.open();
};

const handleClickGameRule = () => {
  gameRuleDialogRef.value.open();
};

const handleClickBattleCard = (item) => {
  // 模式1：创建房间后进入 模式2：进入等待中或进行中的房间 模式3：进入已结束的房间
  const model = item.status === "0" || item.status === "1" ? 2 : 3;
  router.push({
    path: `/battle/${item.id}`,
    query: { model },
  });
};

// 卡片替换：如果存在目标卡片，则删除并插入第一条，如果不存在则直接删除
const replaceBattleCard = (newData) => {
  const index = tempList.value.findIndex((item) => item.id === newData.id);
  if (index >= 0) {
    tempList.value.splice(index, 1);
  }
  tempList.value.unshift(newData);
};

const createWs = () => {
  const userId = store.userInfo.userId;
  if (userId) {
    connect(`ws://121.229.204.223:8090/ws/fight/hall/${userId}`);
  }
};

onMounted(() => {
  createWs();
});
</script>

<template>
  <Layout>
    <div class="battle-wrapper">
      <boxList @box-detail="handleClickBoxItem" />
      <div class="rule" @click="handleClickGameRule">游戏规则</div>
      <div class="battle-content">
        <div class="creat-wrapper" @click="handleClickCreateRoom">
          <img src="@/assets/images/battle/creat-icon.png" class="creat-icon" />
          创建房间
        </div>
        <div class="group-wrapper">
          <div
            class="goup-item"
            v-for="item in navList"
            :key="'group' + item.value"
            :class="{ active: active === item.value }"
            @click="changeActive(item.value)"
          >
            {{ item.name }}
          </div>
        </div>
        <div class="battle-list-wrapper">
          <el-scrollbar max-height="800px" @scroll="onScroll" ref="scrollRef">
            <div ref="listRef" class="battle-list-container">
              <BattleItem
                :cardData="i"
                v-for="(i, index) in list"
                :key="'battle' + index"
                @click="handleClickBattleCard(i)"
              />
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
  </Layout>
  <BoxDetailModal
    ref="boxDetailModalRef"
    :boxData="boxDetailData"
    :title="currBoxName"
  />
  <CreateRoomDialog ref="createRoomDialogRef" :boxData="allBoxList" />
  <GameRuleDialog ref="gameRuleDialogRef" />
</template>

<style scoped lang="scss">
@use "@/style" as *;
.battle-wrapper {
  padding-top: 68px;
  background: url("@/assets/images/battle/bg.png") no-repeat;
  background-size: 100% auto;
  background-color: rgba(144, 136, 129);
  min-height: 100vh;
  .rule {
    margin-top: 60px;
    cursor: pointer;
    float: right;
    margin-right: 44px;
    width: 120px;
    height: 38px;
    line-height: 38px;
    padding-left: 40px;
    background-image: url("@/assets/images/battle/rule-bg.png");
    background-size: 100%;
    background-repeat: no-repeat;
    font-weight: 500;
    font-size: 16px;
    color: #3b2712;
  }
  .battle-content {
    max-width: 1300px;
    margin: 0 auto;
    .creat-wrapper {
      width: 302px;
      height: 81px;
      line-height: 72px;
      margin: 34vw auto 0;
      position: relative;
      background: url("@/assets/images/battle/creat-bg.png") no-repeat;
      background-size: 100% auto;
      padding-left: 120px;
      font-weight: 500;
      font-size: 27px;
      color: #3b2712;
      .creat-icon {
        position: absolute;
        left: 0;
        top: -12px;
        width: 90px;
        height: 92px;
      }
    }
    .group-wrapper {
      width: 990px;
      height: 60px;
      margin: 46px auto 0;
      display: flex;
      align-items: center;
      .goup-item {
        width: 148px;
        height: 60px;
        line-height: 55px;
        text-align: center;
        font-weight: 500;
        font-size: 18px;
        color: #ffffff;
        cursor: pointer;
        &.active {
          color: #8fedd8;
          background: url("@/assets/images/header/active-menu.png") no-repeat;
          background-size: 100% 60px;
        }
      }
    }
    .battle-list-wrapper {
      width: 990px;
      margin: 20px auto 0;
      .battle-list-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }
}
</style>
