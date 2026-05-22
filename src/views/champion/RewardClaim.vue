<script setup>
import Detail from "./Detail.vue";
import { ref, onMounted, computed, nextTick } from "vue";
import { getUserRewardListApi, claimRewardApi } from "@/api/champion";
import { getBoxInfo } from "@/views/openBox/server/api";
import { ElMessage } from "element-plus";
import OpenModal from "@/views/openBox/components/OpenModal.vue";
import boxItem from '@/views/openBox/components/boxItem.vue';
import { requireImg } from "@/utils/common";
import signUpBgImg from "@/assets/images/champion/team/bg.webp";

const loading = ref(false);
const rewardList = ref([]);
const OpenModalRef = ref(null);
const openEnd = ref([]);
const boxData = ref({});
const localSet = ref({
  animation: true,
  music: true
});

// 饰品列表弹窗相关
const ornamentListVisible = ref(false);
const ornamentListData = ref([]);
const currentBoxName = ref('');
const loadingOrnaments = ref(false);

// 获取奖励列表
const getRewardList = () => {
  loading.value = true;
  getUserRewardListApi()
    .then((res) => {
      if (res.code === 200) {
        rewardList.value = res.data || [];
      } else {
        ElMessage.error(res.msg || "获取奖励列表失败");
      }
    })
    .catch((err) => {
      ElMessage.error("获取奖励列表失败");
      console.error(err);
    })
    .finally(() => {
      loading.value = false;
    });
};

// 领取奖励（开箱）
const handleClaimReward = async (rewardType) => {
  const reward = rewardList.value.find((r) => r.rewardType === rewardType);
  if (!reward) {
    ElMessage.warning("奖励不存在");
    return;
  }

  if (!reward.canClaim) {
    ElMessage.warning("您没有该奖励");
    return;
  }

  if (reward.claimed) {
    ElMessage.warning("该奖励已领取");
    return;
  }

  loading.value = true;
  try {
    // 先获取宝箱信息（包含饰品列表，用于开箱动画）
    const boxInfoRes = await getBoxInfo({ boxId: reward.boxId });
    let boxOrnamentsList = [];
    if (boxInfoRes.code === 200 && boxInfoRes.data && boxInfoRes.data.boxOrnamentsList) {
      boxOrnamentsList = boxInfoRes.data.boxOrnamentsList;
    }

    // 领取奖励（开箱）
    const res = await claimRewardApi({ rewardType });
    if (res.code === 200) {
      if (Array.isArray(res.data) && res.data.length > 0) {
        openEnd.value = res.data;
        // 设置宝箱数据用于开箱动画
        boxData.value = {
          boxId: reward.boxId,
          boxName: reward.boxName,
          boxImg: reward.boxImage,
          boxOrnamentsList: boxOrnamentsList // 宝箱饰品列表，用于开箱动画
        };
        OpenModalRef.value.open();
        // 刷新奖励列表
        getRewardList();
      } else {
        ElMessage.error("开箱失败，未获得物品");
      }
    } else {
      ElMessage.error(res.msg || "领取奖励失败");
    }
  } catch (err) {
    ElMessage.error("领取奖励失败");
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 获取奖励类型名称
const getRewardTypeName = (type) => {
  const names = {
    1: "冠军宝箱",
    2: "亚军宝箱",
    3: "淘汰队伍奖励宝箱"
  };
  return names[type] || "未知";
};

// 获取奖励类型描述
const getRewardTypeDesc = (type) => {
  const descs = {
    1: "恭喜您获得冠军！",
    2: "恭喜您获得亚军！",
    3: "感谢您的参与！"
  };
  return descs[type] || "";
};

// 点击宝箱查看饰品列表
const handleClickBox = async (reward) => {
  if (!reward || !reward.boxId) {
    return;
  }
  
  loadingOrnaments.value = true;
  currentBoxName.value = reward.boxName || reward.rewardTypeName;
  ornamentListVisible.value = true;
  
  // 使用 nextTick 确保 DOM 更新后再设置样式
  await nextTick();
  
  // 强制设置所有可能的 dialog 元素背景为透明
  setTimeout(() => {
    const dialogElements = document.querySelectorAll('.ornament-dialog [role="dialog"]');
    dialogElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.background = 'transparent';
        el.style.borderRadius = '0.75rem';
        el.style.overflow = 'hidden';
      }
    });
    
    // 也设置 van-popup 的直接子元素
    const popupElements = document.querySelectorAll('.ornament-dialog .van-popup > div');
    popupElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.background = 'transparent';
        el.style.borderRadius = '0.75rem';
        el.style.overflow = 'hidden';
      }
    });
  }, 100);
  
  try {
    const res = await getBoxInfo({ boxId: reward.boxId });
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
    } else {
      ElMessage.warning('该箱子暂无饰品数据');
      ornamentListVisible.value = false;
    }
  } catch (error) {
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

onMounted(() => {
  getRewardList();
});
</script>

<template>
  <Detail :bg="{ img: signUpBgImg, height: '187vw' }">
    <div class="reward-claim-container" v-loading="loading">
      <div class="reward-list">
        <div
          v-for="reward in rewardList"
          :key="reward.rewardType"
          class="reward-item"
        >
          <div class="reward-header">
            <h3 
              class="reward-title" 
              :class="{
                'champion-title': reward.rewardType === 1,
                'runner-up-title': reward.rewardType === 2,
                'eliminated-title': reward.rewardType === 3
              }"
            >
              {{ reward.rewardTypeName }}
            </h3>
            <p class="reward-desc">{{ getRewardTypeDesc(reward.rewardType) }}</p>
          </div>

          <div class="reward-content">
            <!-- 已领取状态 -->
            <div v-if="reward.claimed" class="claimed-reward">
              <div class="box-preview" v-if="reward.boxImage" @click="handleClickBox(reward)">
                <img :src="reward.boxImage" :alt="reward.boxName" />
              </div>
              <div class="claimed-icon">✅</div>
              <p>已领取</p>
              <p class="claimed-tip">奖励已进入宝箱饰品库存</p>
            </div>

            <!-- 可以领取状态 -->
            <div v-else-if="reward.canClaim" class="can-claim-reward">
              <div class="box-preview" v-if="reward.boxImage" @click="handleClickBox(reward)">
                <img :src="reward.boxImage" :alt="reward.boxName" />
              </div>
              <div class="box-info">
                <p class="box-name">{{ reward.boxName }}</p>
                <button
                  class="claim-btn"
                  @click="handleClaimReward(reward.rewardType)"
                  :disabled="loading"
                >
                  开启宝箱
                </button>
              </div>
            </div>

            <!-- 不能领取但显示宝箱信息 -->
            <div v-else class="no-reward">
              <div class="box-preview" v-if="reward.boxImage" @click="handleClickBox(reward)">
                <img :src="reward.boxImage" :alt="reward.boxName" />
              </div>
              <div class="box-info">
                <p v-if="reward.boxName" class="box-name">{{ reward.boxName }}</p>
                <button
                  class="claim-btn"
                  @click="handleClaimReward(reward.rewardType)"
                  :disabled="!reward.canClaim || loading"
                >
                  领取
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 开箱动画弹窗 -->
      <OpenModal
        ref="OpenModalRef"
        :openData="openEnd"
        :boxData="boxData"
        :curindex="openEnd.length"
        :localSet="localSet"
        :price="0"
      />

      <!-- 饰品列表弹窗 -->
      <van-popup 
        class="ornament-dialog no-scrollbar" 
        v-model:show="ornamentListVisible" 
        :close-on-click-overlay="false" 
        teleport="body"
        :style="{ background: 'transparent' }"
      >
        <div class="lucky-modal-wrapper tw-w-[90vw] md:tw-w-[72.5rem] tw-rounded-xl tw-backdrop-blur-md tw-mt-5 tw-py-4 tw-px-2 md:tw-p-5 tw-pb-3 tw-relative tw-z-10 tw-animate-modalAppear">
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
            <div class="box-item tw-flex tw-flex-wrap tw-justify-center tw-gap-y-2 tw-gap-x-2 md:tw-gap-6">
              <boxItem 
                v-for="(item, index) in ornamentListData" 
                :key="index"
                :box-data="item"
                :isHave="true"
              />
            </div>
          </div>
        </div>
      </van-popup>
    </div>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.reward-claim-container {
  padding: 20px;
  min-height: 60vh;

  .reward-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;

    @include mobile {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .reward-item {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 24px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }

      .reward-header {
        text-align: center;
        margin-bottom: 20px;

        .reward-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 8px 0;

          @include mobile {
            font-size: 20px;
          }

          // 冠军宝箱 - 金色
          &.champion-title {
            color: #FFD700;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
          }

          // 亚军宝箱 - 银色
          &.runner-up-title {
            color: #C0C0C0;
            text-shadow: 0 0 10px rgba(192, 192, 192, 0.5);
          }

          // 淘汰奖励宝箱 - 橙色
          &.eliminated-title {
            color: #FF7A21;
            text-shadow: 0 0 10px rgba(255, 122, 33, 0.5);
          }
        }

        .reward-desc {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
      }

      .reward-content {
        min-height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .no-reward {
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          width: 100%;

          .box-preview {
            width: 100%;
            max-width: 200px;
            margin: 0 auto 20px;
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              transform: scale(1.05);
              box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
            }

            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }

          .box-info {
            .box-name {
              font-size: 18px;
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 16px;
              font-weight: 500;
            }

            .claim-btn {
              width: 100%;
              max-width: 200px;
              height: 44px;
              background: linear-gradient(135deg, #ff6b35, #f7931e);
              border: none;
              border-radius: 22px;
              color: #ffffff;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;

              &:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
              }

              &:disabled {
                background: rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.5);
                cursor: not-allowed;
                opacity: 0.6;
              }
            }
          }
        }

        .claimed-reward {
          text-align: center;
          color: rgba(255, 255, 255, 0.6);
          width: 100%;

          .box-preview {
            width: 100%;
            max-width: 200px;
            margin: 0 auto 20px;
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              transform: scale(1.05);
              box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
            }

            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }

          .claimed-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }

          p {
            margin: 8px 0;
            font-size: 16px;
          }

          .claimed-tip {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
          }
        }

        .can-claim-reward {
          width: 100%;
          text-align: center;

          .box-preview {
            width: 100%;
            max-width: 200px;
            margin: 0 auto 20px;
            aspect-ratio: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              transform: scale(1.05);
              box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
            }

            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }

          .box-info {
            .box-name {
              font-size: 18px;
              color: #ffffff;
              margin-bottom: 16px;
              font-weight: 500;
            }

            .claim-btn {
              width: 100%;
              max-width: 200px;
              height: 44px;
              background: linear-gradient(135deg, #ff6b35, #f7931e);
              border: none;
              border-radius: 22px;
              color: #ffffff;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;

              &:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
              }

              &:disabled {
                opacity: 0.6;
                cursor: not-allowed;
              }
            }
          }
        }
      }
    }
  }
}

// 饰品列表弹窗样式 - 使用全局样式确保完全覆盖
</style>

<style lang="scss">
// 全局样式，确保 van-popup 的所有子元素都被覆盖
.ornament-dialog {
  background: none !important;
  
  // van-popup 主容器
  .van-popup {
    background: transparent !important;
    box-shadow: none !important;
    overflow: visible !important;
  }
  
  // 修复所有可能的容器元素 - 使用通配符选择器
  [role="dialog"],
  .van-popup > div,
  .van-popup [role="dialog"],
  div[class*="van-popup"],
  .van-popup__content,
  .van-popup > * {
    background: transparent !important;
    border-radius: 0.75rem !important;
    overflow: hidden !important;
  }
  
  .van-overlay {
    background: rgba(0, 0, 0, 0.7) !important;
  }
}

// 更通用的全局样式，覆盖所有 van-popup 相关的元素
body .ornament-dialog [role="dialog"] {
  background: transparent !important;
  border-radius: 0.75rem !important;
  overflow: hidden !important;
}
</style>

<style scoped lang="scss">
@use "@/style" as *;

.lucky-modal-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem; // 对应 tw-rounded-xl
  background: rgba(26, 26, 26, 0.9); // 确保有背景色覆盖，避免白色透出
  
  // 使用伪元素确保完全覆盖，包括圆角区域
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background: rgba(26, 26, 26, 0.9);
    border-radius: 0.75rem;
    z-index: -1;
    pointer-events: none;
  }
}

.lucky-modal-bg {
  position: absolute;
  top: -10px; // 扩展背景，确保覆盖圆角
  left: -10px;
  width: calc(100% + 20px); // 扩展宽度
  height: calc(100% + 20px); // 扩展高度
  background: url("@/assets/images/open/bg.webp") no-repeat center;
  background-size: cover;
  opacity: 0.3;
  z-index: 0;
  pointer-events: none;
  border-radius: 0.75rem; // 确保背景图片也有圆角
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
</style>

