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
import {getBoxInfo} from "@/views/openBox/server/api";
import boxItem from '@/views/openBox/components/boxItem.vue';
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
// 饰品列表弹窗相关
const ornamentListVisible = ref(false);
const ornamentListData = ref([]);
const currentBoxName = ref('');
const loadingOrnaments = ref(false);
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
    }
  },
  onClose: () => {},
  onError: (error) => {},
});

// 点击获取展示宝箱详情
const handleClickBoxItem = async (item) => {
  console.log('=== 点击箱子 ===');
  console.log('boxId:', item.boxId);
  console.log('boxName:', item.boxName);
  
  if (!item || !item.boxId) {
    console.error('箱子数据无效:', item);
    return;
  }
  
  loadingOrnaments.value = true;
  currentBoxName.value = item.boxName;
  ornamentListVisible.value = true;
  console.log('弹窗状态已设置为显示');
  
  try {
    const res = await getBoxInfo({boxId: item.boxId});
    console.log('getBoxInfo 返回:', res);
    if (res.code === 200 && res.data && res.data.boxOrnamentsList && res.data.boxOrnamentsList.length) {
      // 数据格式映射：将API返回的数据格式转换为boxItem组件需要的格式
      ornamentListData.value = res.data.boxOrnamentsList.map(ornament => ({
        ...ornament,
        ornamentName: ornament.name || '',
        ornamentLevelImg: ornament.levelImg || '',
        exteriorName: ornament.exteriorName || '',
        // oddsResult 已经是百分比格式（如 0.01 表示 0.01%），需要格式化为字符串
        oddsResult: ornament.oddsResult ? parseFloat(ornament.oddsResult).toFixed(2) : null,
        // 确保价格字段被传递（boxPrice 或 usePrice）
        boxPrice: ornament.boxPrice || null,
        usePrice: ornament.usePrice || null
      }));
      console.log('处理后的饰品列表数据:', ornamentListData.value);
    } else {
      ElMessage.warning('暂无饰品数据');
      ornamentListVisible.value = false;
    }
  } catch (error) {
    console.error('获取饰品列表失败:', error);
    ElMessage.error('获取饰品列表失败');
    ornamentListVisible.value = false;
  } finally {
    loadingOrnaments.value = false;
  }
};

// 关闭饰品列表弹窗
const closeOrnamentList = () => {
  ornamentListVisible.value = false;
  ornamentListData.value = [];
  currentBoxName.value = '';
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
      <boxList @box-detail="handleClickBoxItem" @allBox="(data => allBoxList = data)" />
      <div class="rule" @click="handleClickGameRule">游戏规则</div>
      <div class="battle-content">
        <div class="creat-wrapper" @click="handleClickCreateRoom">
          <img src="@/assets/images/battle/creat-icon.png" class="creat-icon" />
          <span>创建房间</span>
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
  
  <!-- 饰品列表弹窗 -->
  <van-popup class="ornament-dialog no-scrollbar" v-model:show="ornamentListVisible" :close-on-click-overlay="false" teleport="body">
    <div class="lucky-modal-wrapper tw-w-[90vw] md:tw-w-[72.5rem] tw-rounded-xl tw-bg-[#1A1A1A]/90 tw-backdrop-blur-md tw-mt-5 tw-py-4 tw-px-2 md:tw-p-5 tw-pb-3 tw-relative tw-z-10 tw-animate-modalAppear">
      <!-- 开箱背景 -->
      <div class="lucky-modal-bg"></div>
      
      <!-- 标题栏 -->
      <div class="tw-flex tw-justify-between tw-pb-4 tw-items-center tw-mb-6 tw-relative tw-z-10">
        <h3 class="tw-text-xl tw-font-bold tw-text-white tw-animate-titleSlide">{{ currentBoxName }} - 饰品列表</h3>
        
        <!-- 关闭按钮 -->
        <button 
          class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-[#2A2A2A] tw-flex tw-items-center tw-justify-center hover:tw-bg-[#3A3A3A] tw-transition-all tw-duration-300 group"
          @click="closeOrnamentList"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none"
            :style="{ stroke: 'var(--icon-color, #ffffff)' }"
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            class="tw-w-4 tw-h-4 tw-transition-colors tw-duration-300 tw-animate-spin-once"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- 内容区域 -->
      <div class="tw-overflow-hidden tw-overflow-y-auto tw-max-h-[50vh] no-scrollbar tw-transition-all tw-duration-500 tw-ease-in-out tw-my-4 tw-relative tw-z-10" v-loading="loadingOrnaments">
        <div class="box-item tw-flex tw-flex-wrap tw-justify-center tw-gap-y-2 tw-gap-x-2 md:tw-gap-6 tw-animate-gridAppear">
          <boxItem 
            v-for="(item, index) in ornamentListData" 
            :key="index"
            :box-data="item"
            :isHave="true"
            :style="{ animationDelay: index * 0.1 + 's' }"
            class="tw-animate-itemAppear"
          />
        </div>
      </div>
    </div>
  </van-popup>
</template>

<style scoped lang="scss">
@use "@/style" as *;
.battle-wrapper {
  padding-top: 68px;
  background: url("@/assets/images/battle/bg.webp") no-repeat;
  background-size: 100% auto;
  background-color: rgba(144, 136, 129);
  min-height: 100vh;
  @include mobile {
    background-size: 100% 36%;
  }
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
    @include mobile {
      margin: 10px 10px 0 0;
      font-size: 13px;
      width: 100px;
      height: 30px;
      line-height: 30px;
      padding-left: 34px;
    }
  }
  .battle-content {
    max-width: 1300px;
    margin: 0 auto;
    @include mobile {
      width: 100%;
    }
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
      display: flex;
      @include mobile {
        width: 40%;
        height: 32px;
        line-height: 32px;
        font-size: 16px;
        margin-top: 80px;
        padding-left: 50px;
        span {
          width: 100px;
          height: 32px;
          display: inline-block;
        }
      }
      .creat-icon {
        position: absolute;
        left: 0;
        top: -12px;
        width: 90px;
        height: 92px;
        @include mobile {
          width: 40px;
          height: 40px;
          top: -4px;
          left: 10px;
        }
      }
    }
    .group-wrapper {
      width: 990px;
      height: 60px;
      margin: 46px auto 0;
      display: flex;
      align-items: center;
      @include mobile {
        margin: 10px auto 0;
        width: 100%;
      }
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
      @include mobile {
        width: 100%;
      }
      .battle-list-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }
}

// 饰品列表弹窗样式（完全复制欧皇记录的样式）
.ornament-dialog {
    background: none;
}

.lucky-modal-wrapper {
    position: relative;
    overflow: hidden;
}

.lucky-modal-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("@/assets/images/open/bg.webp") no-repeat center;
    background-size: cover;
    opacity: 0.3;
    z-index: 0;
    pointer-events: none;
}

.lucky-modal-wrapper .box-item {
    position: relative;
    z-index: 10;
}

.lucky-modal-wrapper .group {
    --icon-color: #ffffff;
}
.lucky-modal-wrapper .group:hover {
    --icon-color: #cccccc;
}

/* 动画 */
@keyframes modalAppear {
    0% {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@keyframes titleSlide {
    0% {
        opacity: 0;
        transform: translateY(-10px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes gridAppear {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes itemAppear {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin-once {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(180deg);
    }
}

.tw-animate-modalAppear {
    animation: modalAppear 0.5s ease-out forwards;
}

.tw-animate-titleSlide {
    animation: titleSlide 0.6s ease-out forwards;
}

.tw-animate-gridAppear {
    animation: gridAppear 0.8s ease-out forwards;
}

.tw-animate-itemAppear {
    animation: itemAppear 0.5s ease-out forwards;
    animation-fill-mode: both;
}

.tw-animate-spin-once {
    animation: spin-once 0.3s ease-out forwards;
    animation-play-state: paused;
}

.group:hover .tw-animate-spin-once {
    animation-play-state: running;
}
</style>
