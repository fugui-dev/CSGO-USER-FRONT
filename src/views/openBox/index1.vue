<script setup>
import { ref, onMounted, computed, reactive, watch, onUnmounted } from "vue";
import Box from "@/components/Box/NewBoxs.vue";
import boxItem from "./components/boxItem.vue";
import { openBoxBind, openBoxInject } from "./server/api";
import { useOpen } from "@/views/openBox/server/useOpen.js";
import OpenModal from "./components/OpenModal.vue";
import OpenBagModal from "./components/OpenBagModal.vue";
import { useUserInfo } from "@/composables/useUesrInfo";
import Decimal from "decimal.js";
import { ElMessage } from "element-plus";
import LuckyModal from "./components/LuckyModal.vue";
import HeaderBg from "@/assets/openBox/headerBg.png";
import HeaderLeft from "@/assets/openBox/headerLeft.png";
import LuckyStar from "@/assets/openBox/luckyStar.png";
import TitleYinhua from "@/assets/openBox/titleYinhua.png";
import { requireImg, goto } from "@/utils/common";
import { useRouter } from "vue-router";
import { useThrottleFn } from "@vueuse/core";
import boxLeft from "@/assets/openBox/boxLeft.png";
import boxRight from "@/assets/openBox/boxRight.png";
import downOpen from "@/assets/openBox/downOpen.svg";
import Taiji1 from "@/assets/icons/taiji_1.svg";
import Taiji2 from "@/assets/icons/taiji_2.svg";
import Money from "@/assets/icons/money.svg";
import init from "@/assets/music/init.wav";
import MoreModal from "./components/MoreModal.vue";
import { level } from "@/lib/leavel";
import back from '@/assets/images/upgrade/back.png';
const arr = [1, 2, 3, 4, 5];

const router = useRouter();

const OpenModalRef = ref(null);
const OpenBagModalRef = ref(null);
const LuckyModalRef = ref(null);
const active = ref(1);
const selectedBagIds = ref([]);
const selectedBagTotalPrice = ref(0);
const selectTab = ref(true);
const MoreModalRef = ref(null);
const choseNum = (num) => {
  if (isLoading.value) return ElMessage.warning("正在开箱中，请耐心等待！");
  active.value = num;
};
const localSet = reactive({
  animation: true,
  music: true,
});
const changeSet = (set) => {
  if (set === "animation") {
    localSet.animation = !localSet.animation;
    if (!localSet.animation) {
      localSet.music = false;
    }
  }
  if (set === "music") {
    if (localSet.animation) {
      localSet.music = !localSet.music;
    } else {
      ElMessage.warning("请先开启动画效果");
    }
  }
};
const { boxData, boxId, luckyboxData, boxHistoryData, loading, fetchData } =
  useOpen({ active });
const endPrice = computed(() => {
  try {
    if (boxData && boxData.price !== undefined && active.value !== undefined) {
      // 确保输入值有效
      const boxPrice = Number(boxData.price);
      const activeValue = Number(active.value);

      if (isNaN(boxPrice) || isNaN(activeValue)) {
        return 0; // 如果输入无效，返回0
      }

      // 使用 Decimal.js 进行精确计算
      const price = new Decimal(activeValue).times(boxPrice);
      // 格式化为字符串并移除末尾的零
      return price.toFixed(2).replace(/\.?0+$/, "") || 0;
    }
    return 0;
  } catch (error) {
    console.error("计算价格时出错:", error);
    return 0; // 出现任何错误时返回0
  }
});

const formattedEndPrice = computed(() => {
  return Number(endPrice.value).toFixed(2);
});

// 计算饰品注能百分比
const energyPercentage = computed(() => {
  if (endPrice.value === 0) return 0;
  const percentage = (selectedBagTotalPrice.value / endPrice.value) * 100;
  return Math.min(percentage, 100); // 限制最大值为100
});

const { userInfo, isLogin, fetchUserInfo } = useUserInfo();

// 计算喷管能量百分比
const sprayPercentage = computed(() => {
  if (!isLogin.value) return 0;

  const currentUserInfo = userInfo.value;
  if (!currentUserInfo?.accountCredits || !endPrice.value) return 0;

  // 使用decimal.js进行精确计算
  const credits = new Decimal(currentUserInfo.accountCredits);
  const price = new Decimal(endPrice.value);
  const percentage = credits.div(price).mul(100);

  return Math.min(percentage.toNumber(), 100);
});

// 格式化百分比显示
const formatPercentage = (value) => {
  if (typeof value === "number") {
    return Math.floor(value);
  }
  return 0;
};

const isShake = ref(false);
const openEnd = ref([]);
const isLoading = ref(false);

// 添加这些变量来控制动画状态
const imagesLoaded = ref(false);
const boxImg01Loaded = ref(false);
const boxImg02Loaded = ref(false);
const showDropAnimation = ref(false);
const showInitAnimation = ref(false);
const showFloatAnimation = ref(false);
const music = new Audio(init);
// 图片加载处理函数
const handleBoxImg01Load = () => {
  boxImg01Loaded.value = true;
  checkImagesLoaded();
};

const handleBoxImg02Load = () => {
  boxImg02Loaded.value = true;
  checkImagesLoaded();
};

// 初始化时检查图片状态
const initImageState = () => {
  const hasImg01 = boxData.value?.boxImg01 && boxData.value.boxImg01.trim() !== '';
  const hasImg02 = boxData.value?.boxImg02 && boxData.value.boxImg02.trim() !== '';
  
  // 如果图片不存在，直接标记为已加载，避免一直等待
  if (!hasImg01) {
    boxImg01Loaded.value = true;
  }
  if (!hasImg02) {
    boxImg02Loaded.value = true;
  }
  
  checkImagesLoaded();
};

// 检查图片是否已加载完成（支持一个或两个图片）
const checkImagesLoaded = () => {
  const hasImg01 = boxData.value?.boxImg01 && boxData.value.boxImg01.trim() !== '';
  const hasImg02 = boxData.value?.boxImg02 && boxData.value.boxImg02.trim() !== '';
  
  let canShow = false;
  
  if (hasImg01 && hasImg02) {
    // 两个图片都存在，等待两个都加载完成
    canShow = boxImg01Loaded.value && boxImg02Loaded.value;
  } else if (hasImg01) {
    // 只有 boxImg01，等待它加载完成
    canShow = boxImg01Loaded.value;
  } else if (hasImg02) {
    // 只有 boxImg02，等待它加载完成
    canShow = boxImg02Loaded.value;
  } else {
    // 两个都不存在，直接显示（避免一直等待）
    canShow = true;
  }
  
  if (canShow && !imagesLoaded.value) {
    imagesLoaded.value = true;

    // 图片加载完成后，先执行掉落动画
    showDropAnimation.value = true;
    music.play();
    // 掉落动画结束后（约0.6秒）执行initAnimation
    setTimeout(() => {
      showDropAnimation.value = false;
      showInitAnimation.value = true;

      // initAnimation结束后（约0.9秒）执行浮动动画
      setTimeout(() => {
        showInitAnimation.value = false;
        showFloatAnimation.value = true;
      }, 900); // 摇晃动画时长为0.9秒，不再有延迟
    }, 600); // 掉落动画时长为0.5s + 一点缓冲时间
  }
};

// 普通开箱方法
const handleOpen = () => {
  // 检查登录状态
  if (!isLogin.value) {
    ElMessage.warning("请先登录");
    return;
  }

  // 检查余额是否足够（金币+弹药）
  const accountAmount = userInfo.value?.accountAmount || 0
  const accountCredits = userInfo.value?.accountCredits || 0
  const totalBalance = new Decimal(accountAmount).plus(accountCredits)
  const price = new Decimal(endPrice.value)
  
  if (totalBalance.lessThan(price)) {
    ElMessage.warning("余额不足");
    return;
  }
  if (isLoading.value) return ElMessage.warning("正在开箱中，请耐心等待！");
  isLoading.value = true; // 开始loading

  openBoxBind({ boxId, num: active.value })
    .then((res) => {
      if (res.code === 200) {
        // 开箱成功后立即刷新余额，防止前端显示旧余额
        fetchUserInfo();
        // 替换为正确的方式处理返回数据
        if (Array.isArray(res.data)) {
          // 如果是数组，直接清空并添加新元素
          openEnd.value = res.data;
          OpenModalRef.value.open();
        } else {
          // 如果没有数据，设置为空数组
          openEnd.value = [];
        }
      } else {
        // 开箱失败也刷新余额（确保显示真实值）
        fetchUserInfo();
        ElMessage.error(res.msg || '开箱失败，请重试');
      }
    })
    .catch((err) => {
      ElMessage.error("请求繁忙，请重试");
      fetchUserInfo(); // 异常时也刷新余额
    })
    .finally(() => {
      isLoading.value = false; // 结束loading
    });
};

// 注入开箱方法
const injectOpen = () => {
  // 检查登录状态
  if (!isLogin.value) {
    ElMessage.warning("请先登录");
    return;
  }

  // 检查是否选择了饰品
  if (selectedBagIds.value.length === 0) {
    ElMessage.warning("请先选择饰品");
    return;
  }

  // 检查饰品注能是否达到100%
  if (energyPercentage.value < 100) {
    ElMessage.warning("饰品注能未达到100%");
    return;
  }

  openBoxInject({
    boxId,
    num: active.value,
    packageIds: selectedBagIds.value,
  })
    .then((res) => {
      if (res.code === 200) {
        // 注入开箱成功后立即刷新余额
        fetchUserInfo();
        // 替换为正确的方式处理返回数据
        if (Array.isArray(res.data)) {
          // 如果是数组，直接清空并添加新元素
          openEnd.value = res.data;
          OpenModalRef.value.open();
        } else {
          // 如果没有数据，设置为空数组
          openEnd.value = [];
        }
      } else {
        // 开箱失败也刷新余额
        fetchUserInfo();
        ElMessage.error(res.msg || '注入开箱失败，请重试');
      }
      console.log(res.data);
    })
    .catch((err) => {
      ElMessage.error("请求繁忙，请重试");
      fetchUserInfo(); // 异常时也刷新余额
      // 重置摇动状态
    });
};
const openBag = () => {
  if (!isLogin.value) {
    ElMessage.warning("请先登录");
    return;
  }
  OpenBagModalRef.value.open();
};
const isShow = ref(false);
const isActive = ref(false);
const checkActive = (active) => {
  isActive.value = active;
};

const handleOpenBagConfirm = ({ selectedIds, totalPrice }) => {
  selectedBagIds.value = selectedIds;
  selectedBagTotalPrice.value = totalPrice;
};

// 在script部分添加检测设备的方法
const isMobile = ref(false);

onMounted(() => {
  music.src = init;
  music.load();
  fetchUserInfo();
  checkDevice();
  window.addEventListener("resize", checkDevice);
  // 刷新页面时也重置动画状态
  resetAnimationState();
  // 初始化图片状态
  initImageState();
});
const moreData = ref({});
const handleMore = (item) => {
  console.log(JSON.parse(JSON.stringify(item)));
  moreData.value = item;
  MoreModalRef.value.open();
};
// 添加卸载事件清理
onUnmounted(() => {
  window.removeEventListener("resize", checkDevice);
});

const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768;
};

const videoRef = ref(null);
const audioRef = ref(null);

// 简化 handleModalClose 函数
const handleModalClose = () => {
  // 重新获取数据
  fetchData();
  // 重新获取用户信息
  fetchUserInfo();
  // 清空选中的背包数据
  selectedBagIds.value = [];
  selectedBagTotalPrice.value = 0;
  // 确保摇动状态被重置
  isShake.value = false;
};

// 在script部分添加boxId的watch
watch(
  () => boxId,
  () => {
    // 当箱子ID变化时，重置动画状态
    resetAnimationState();
  }
);

// 重置动画状态的函数
const resetAnimationState = () => {
  imagesLoaded.value = false;
  boxImg01Loaded.value = false;
  boxImg02Loaded.value = false;
  showDropAnimation.value = false;
  showInitAnimation.value = false;
  showFloatAnimation.value = false;
  // 重新初始化图片状态
  initImageState();
};

// 监听 boxData 变化，重新初始化图片状态
watch(
  () => boxData.value,
  () => {
    if (boxData.value) {
      // 重置加载状态
      boxImg01Loaded.value = false;
      boxImg02Loaded.value = false;
      imagesLoaded.value = false;
      // 重新初始化
      initImageState();
    }
  },
  { immediate: true, deep: true }
);

// 返回上一页
const handleClickBack = () => {
  router.go(-1)
}
</script>
<template>
  <Layout>
    <div class="open-box-wrapper">
      <img
        class="box-big-bg"
        src="@/assets/images/open/box-big-bg.png"
        alt=""
      />
      <img class="box-bg" src="@/assets/images/open/box-bg.png" alt="" />
      <div class="back-button" @click="handleClickBack">
        <img :src="back" alt="">
        返回
      </div>
      <div class="setting">
        <div class="record-wrapper" @click="LuckyModalRef.open()">
          <img
            class="record-icon"
            src="@/assets/images/open/record.png"
            alt=""
          />
          欧皇记录
        </div>
        <div class="settings">
          <div class="setting-item">
            <div class="setting-switch-wrapper" @click="changeSet('animation')">
              <img
                class="setting-switch"
                :class="localSet.animation ? '' : 'active'"
                src="@/assets/images/open/switch.png"
                alt=""
              />
            </div>
            <div class="switch-text">跳过动画</div>
          </div>
          <div class="setting-item">
            <div class="setting-switch-wrapper" @click="changeSet('music')">
              <img
                class="setting-switch"
                :class="localSet.music ? '' : 'active'"
                src="@/assets/images/open/switch.png"
                alt=""
              />
            </div>
            <div class="switch-text">关闭音效</div>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="box-img-wrapper">
          <!-- 显示 boxImg01 作为背景 -->
          <img 
            v-if="boxData.boxImg01 && boxData.boxImg01.trim() !== ''" 
            :src="boxData.boxImg01" 
            class="box-img box-img-01" 
            @load="handleBoxImg01Load"
            @error="$event.target.style.display = 'none'"
          />
          <!-- 显示 boxImg02 叠加在上面 -->
          <img 
            v-if="boxData.boxImg02 && boxData.boxImg02.trim() !== ''" 
            :src="boxData.boxImg02" 
            :class="['box-img', boxData.boxImg01 && boxData.boxImg01.trim() !== '' ? 'box-img-02' : 'box-img-single']" 
            @load="handleBoxImg02Load"
            @error="$event.target.style.display = 'none'"
          />
        </div>
        <div class="box-name">
          {{ boxData.boxName ? boxData.boxName : "箱子名称" }}
        </div>
        <div class="open-count-wrapper">
          开启次数
          <div
            v-for="(item, index) in arr"
            :key="index"
            @click="choseNum(item)"
            class="count"
            :class="{ active: active === item }"
          >
            X{{ item }}
          </div>
        </div>
        <div class="open-button-wrapper" @click="handleOpen">
          <img src="@/assets/images/open/open-icon.png" class="open-icon" />
          <template v-if="!isLoading">
            {{ formattedEndPrice }}
            <span class="text">开启</span>
          </template>
        </div>
        <div class="group-wrapper">
          <div
            class="goup-item"
            :class="{ active: !isActive }"
            @click="checkActive(false)"
          >
            军需饰品
          </div>
          <div
            class="goup-item"
            :class="{ active: isActive }"
            @click="checkActive(true)"
          >
            最近掉落
          </div>
        </div>
        <template v-if="boxData.boxOrnamentsList?.length && !isActive">
          <div class="box-item">
            <boxItem
              v-for="(item, index) in boxData.boxOrnamentsList"
              :key="'boxData' + index"
              :box-data="item"
              @click="handleMore(item)"
            />
          </div>
        </template>
        <template v-if="boxHistoryData.length && isActive">
          <div class="box-item">
            <boxItem
              v-for="(item, index) in boxHistoryData"
              :key="'boxHistoryData' + index"
              :box-data="item"
              :isHave="true"
              @click="handleMore(item)"
            />
          </div>
        </template>
      </div>
    </div>
  </Layout>
  <OpenModal
    ref="OpenModalRef"
    :openData="openEnd"
    :boxData="boxData"
    :curindex="active"
    :localSet="localSet"
    :price="formattedEndPrice"
    @close="handleModalClose"
    @openAgain="handleOpen"
  />
  <OpenBagModal
    ref="OpenBagModalRef"
    :selectedIds="selectedBagIds"
    :selectedBagTotalPrice="selectedBagTotalPrice"
    @confirm="handleOpenBagConfirm"
  />
  <LuckyModal ref="LuckyModalRef" :luckyboxData="luckyboxData" />
  <MoreModal
    ref="MoreModalRef"
    :moreData="moreData"
    :boxName="boxData.boxName"
  />
</template>

<style scoped lang="scss">
@use "@/style" as *;
.open-box-wrapper {
  width: 100%;
  padding-top: 68px;
  background: url("@/assets/images/open/bg.webp") no-repeat;
  background-size: 100% auto;
  background-color: #383d36;
  min-height: 100vh;
  position: relative;
  @include mobile {
    background-size: 110% auto;
    background-position: 50% 0;
  }
  .box-bg {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: 630px;
    height: 425px;
    z-index: -1;
    @include mobile {
      height: 43vh;
    }
  }
  .box-big-bg {
    position: absolute;
    top: 84px;
    left: 50%;
    transform: translateX(-50%);
    width: 476px;
    height: 467px;
    z-index: -1;
    @include mobile {
      width: 80vw;
      height: auto;
      top: 120px;
    }
  }
  .back-button {
    position: absolute;
    top: 117px;
    left: 36px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #B1C5C7;
    font-size: 14px;
    cursor: pointer;
    z-index: 100;
    transition: opacity 0.3s;
    user-select: none;
    pointer-events: auto;
    &:hover {
      opacity: 0.8;
    }
    img {
      width: 2rem;
      height: 1.8rem;
      pointer-events: none;
    }
  }
  .setting {
    position: absolute;
    top: 117px;
    right: 36px;
    display: flex;
    align-items: center;
    @include mobile {
      right: 10px;
    }
    .record-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 159px;
      height: 58px;
      font-weight: 500;
      font-size: 19px;
      background: url("@/assets/images/open/record-bg.png") no-repeat;
      background-size: 100% 100%;
      color: #ffffff;
      margin-right: 43px;
      cursor: pointer;
      @include mobile {
        width: 110px;
        font-size: 14px;
        height: 34px;
        margin-right: 18px;
      }
      .record-icon {
        width: 28px;
        height: 31px;
        margin-right: 12px;
        @include mobile {
          width: 14px;
          height: 15px;
          margin-right: 5px;
        }
      }
    }
    .settings {
      .setting-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        .setting-switch-wrapper {
          width: 71px;
          height: 26px;
          background-color: #343a3e;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          @include mobile {
            width: 40px;
            height: 18px;
            border-radius: 8px;
          }
          .setting-switch {
            width: 24px;
            height: 24px;
            position: absolute;
            top: 1px;
            left: 1px;
            transition: all 0.3s;
            @include mobile {
              width: 16px;
              height: 16px;
            }
            &.active {
              left: auto;
              right: 1px;
            }
          }
        }
        .switch-text {
          margin-left: 12px;
          font-weight: 500;
          font-size: 17px;
          color: #ffffff;
          @include mobile {
            font-size: 13px;
            margin-left: 6px;
          }
        }
      }
    }
  }
  .content {
    max-width: 1300px;
    margin: 120px auto 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    @include mobile {
      margin-top: 70px;
    }
    .box-img-wrapper {
      position: relative;
      width: 354px;
      height: 219px;
      display: flex;
      align-items: center;
      justify-content: center;
      @include mobile {
        width: 44%;
      }
    }
    .box-img {
      display: block;
      width: 354px;
      height: 219px;
      object-fit: contain;
      @include mobile {
        width: 50vw;
      }
    }
    .box-img-01 {
      position: relative;
      z-index: 1;
    }
    .box-img-02 {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: auto;
      max-width: 80%;
      z-index: 2;
    }
    .box-img-single {
      position: relative;
      z-index: 1;
    }
    .box-name {
      margin-top: -17px;
      width: 159px;
      height: 58px;
      line-height: 64px;
      font-weight: 500;
      font-size: 22px;
      color: #ffffff;
      background: url("@/assets/images/open/box-name-bg.png") no-repeat;
      background-size: 100% auto;
      text-align: center;
      @include mobile {
        width: 110px;
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        background-size: 100% 100%;
      }
    }
    .open-count-wrapper {
      display: flex;
      align-items: center;
      margin-top: 44px;
      font-weight: 500;
      font-size: 18px;
      color: #ffffff;
      @include mobile {
        font-size: 14px;
        margin-top: 24px;
        padding: 0 14px;
      }
      .count {
        cursor: pointer;
        margin-left: 30px;
        width: 54px;
        height: 54px;
        line-height: 54px;
        text-align: center;
        background: url("@/assets/images/open/count-bg.png") no-repeat;
        background-size: 100% auto;
        font-size: 16px;
        @include mobile {
          margin-left: 12px;
          width: 46px;
          height: 46px;
          line-height: 46px;
          font-size: 13px;
        }
        & + .count {
          margin-left: 12px;
        }
        &.active {
          background: url("@/assets/images/open/count-active-bg.png") no-repeat;
          background-size: 100% auto;
        }
      }
    }
    .open-button-wrapper {
      margin-top: 54px;
      width: 293px;
      height: 80px;
      background: url("@/assets/images/battle/creat-bg.png") no-repeat;
      background-size: 100% 100%;
      padding-left: 85px;
      font-weight: 500;
      line-height: 72px;
      font-size: 27px;
      color: #072523;
      position: relative;
      cursor: pointer;
      @include mobile {
        margin-top: 20px;
        width: 50%;
        height: 50px;
        line-height: 50px;
        font-size: 14px;

      }
      .open-icon {
        position: absolute;
        left: 18px;
        top: 5px;
        width: 63px;
        height: 60px;
        @include mobile {
          width: 32px;
          height: 30px;
          left: 28px;
        }
      }
      .text {
        margin-left: 25px;
        @include mobile {
          margin-left: 8px;
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
        opacity: 0.29;
        cursor: pointer;
        &.active {
          opacity: 1;
          color: #8fedd8;
          background: url("@/assets/images/header/active-menu.png") no-repeat;
          background-size: 100% 60px;
        }
      }
    }
    .box-item {
      margin-top: 36px;
      width: 990px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      @include mobile {
        width: 100%;
        justify-content: center;
        margin-bottom: 40px;
      }
    }
  }
}
</style>
