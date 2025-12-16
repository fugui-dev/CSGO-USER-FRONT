<script setup>
import { ref, onMounted, computed } from "vue";
import Layout from "@/components/Layout.vue";
import { requireImg } from "@/utils/common";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getUserStickerListApi,
  getStickerTypesApi,
  getStickerRewardListApi,
  exchangeStickerRewardApi,
  claimLoginStickerApi,
  claimRechargeStickerApi
} from "@/api";
import { useStore } from "@/store";

const store = useStore();
const loading = ref(false);
const rewardLoading = ref(false);

// 贴纸数据
const stickerTypes = ref([]); // 所有贴纸类型
const userStickers = ref({}); // 用户拥有的贴纸 {stickerCode: quantity}
const loginProgress = ref({ days: 0, canClaim: false }); // 连续登录进度
const rechargeProgress = ref({ days: 0, canClaim: false }); // 连续充值进度

// 奖励数据
const rewardList = ref([]);

// 贴纸类型配置
const stickerConfig = {
  red: { name: "红色贴纸", color: "#FF352E", type: "对战胜利获得", icon: "🔴" },
  yellow: { name: "黄色贴纸", color: "#FFBD4E", type: "对战失败获得", icon: "🟡" },
  purple: { name: "紫色贴纸", color: "#984EFF", type: "连续登录7天领取", icon: "🟣" },
  orange: { name: "橙色贴纸", color: "#FF8C42", type: "连续充值100金币7天领取", icon: "🟠" },
  black: { name: "黑色贴纸", color: "#2C2C2C", type: "通过开箱获得", icon: "⚫" },
  blue: { name: "蓝色贴纸", color: "#35B2FF", type: "通过开箱获得", icon: "🔵" },
  green: { name: "绿色贴纸", color: "#1FEBC4", type: "通过开箱获得", icon: "🟢" },
  pink: { name: "粉色贴纸", color: "#FF6B9D", type: "通过开箱获得", icon: "🩷" },
  gray: { name: "灰色贴纸", color: "#8E8E93", type: "通过开箱获得", icon: "⚪" },
  gold: { name: "金色贴纸", color: "#FFD700", type: "通过开箱获得", icon: "🟡" }
};

// 获取贴纸类型列表
const getStickerTypes = async () => {
  try {
    const res = await getStickerTypesApi();
    if (res.code === 200 && res.data) {
      stickerTypes.value = res.data;
    }
  } catch (error) {
    console.error("获取贴纸类型失败", error);
  }
};

// 获取用户贴纸列表
const getUserStickers = async () => {
  try {
    const res = await getUserStickerListApi();
    if (res.code === 200 && res.data) {
      // 将数组转换为对象 {stickerCode: quantity}
      const stickerList = res.data.list || [];
      const stickerMap = {};
      stickerList.forEach(item => {
        stickerMap[item.stickerCode] = item.quantity || 0;
      });
      userStickers.value = stickerMap;
      
      // 获取进度信息（如果API返回）
      if (res.data.loginProgress) {
        loginProgress.value = {
          days: res.data.loginProgress.days || 0,
          canClaim: res.data.loginProgress.canClaim || false
        };
      }
      if (res.data.rechargeProgress) {
        rechargeProgress.value = {
          days: res.data.rechargeProgress.days || 0,
          canClaim: res.data.rechargeProgress.canClaim || false
        };
      }
    }
  } catch (error) {
    console.error("获取用户贴纸失败", error);
  }
};

// 获取奖励列表
const getRewardList = async () => {
  rewardLoading.value = true;
  try {
    const res = await getStickerRewardListApi();
    if (res.code === 200 && res.data) {
      rewardList.value = res.data || [];
    }
  } catch (error) {
    console.error("获取奖励列表失败", error);
    ElMessage.error("获取奖励列表失败");
  } finally {
    rewardLoading.value = false;
  }
};

// 领取连续登录贴纸
const handleClaimLogin = async () => {
  try {
    const res = await claimLoginStickerApi();
    if (res.code === 200) {
      ElMessage.success("领取成功！");
      getUserStickers();
    } else {
      ElMessage.error(res.msg || "领取失败");
    }
  } catch (error) {
    console.error("领取失败", error);
    ElMessage.error("领取失败");
  }
};

// 领取连续充值贴纸
const handleClaimRecharge = async () => {
  try {
    const res = await claimRechargeStickerApi();
    if (res.code === 200) {
      ElMessage.success("领取成功！");
      getUserStickers();
    } else {
      ElMessage.error(res.msg || "领取失败");
    }
  } catch (error) {
    console.error("领取失败", error);
    ElMessage.error("领取失败");
  }
};

// 兑换奖励
const handleExchange = async (reward) => {
  try {
    await ElMessageBox.confirm(
      `确定要兑换"${reward.reward.rewardName}"吗？`,
      "确认兑换",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    const res = await exchangeStickerRewardApi(reward.reward.id);
    if (res.code === 200) {
      ElMessage.success("兑换成功！");
      // 刷新数据
      getUserStickers();
      getRewardList();
    } else {
      ElMessage.error(res.msg || "兑换失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("兑换失败", error);
      ElMessage.error("兑换失败");
    }
  }
};

// 检查是否可兑换
const canExchange = (reward) => {
  return reward.canExchange === true;
};

// 获取贴纸显示信息
const getStickerInfo = (stickerCode) => {
  return stickerConfig[stickerCode] || { name: stickerCode, color: "#999", type: "未知", icon: "❓" };
};

// 获取用户贴纸数量
const getUserStickerQuantity = (stickerCode) => {
  return userStickers.value[stickerCode] || 0;
};

// 解析贴纸需求
const parseStickerRequirement = (requirement) => {
  if (!requirement) return [];
  try {
    return JSON.parse(requirement);
  } catch (e) {
    return [];
  }
};

// 检查贴纸是否足够
const checkStickerEnough = (requirements) => {
  if (!requirements || requirements.length === 0) return true;
  return requirements.every(req => {
    const userQuantity = getUserStickerQuantity(req.stickerCode);
    return userQuantity >= req.quantity;
  });
};

onMounted(() => {
  if (store.isLogin) {
    getStickerTypes();
    getUserStickers();
    getRewardList();
  } else {
    ElMessage.warning("请先登录");
  }
});
</script>

<template>
  <Layout>
    <template #item>
      <div class="sticker-page">
        <!-- 板块1：贴纸获取规则 -->
        <div class="section sticker-rules">
          <div class="section-title">
            <h2>贴纸获取规则</h2>
          </div>
          
          <div class="sticker-grid">
            <div
              v-for="(config, code) in stickerConfig"
              :key="code"
              class="sticker-card"
              :style="{ borderColor: config.color }"
            >
              <div class="sticker-icon" :style="{ color: config.color }">
                {{ config.icon }}
              </div>
              <div class="sticker-name">{{ config.name }}</div>
              <div class="sticker-type">{{ config.type }}</div>
              <div class="sticker-quantity">
                拥有：{{ getUserStickerQuantity(code) }}
              </div>
              
              <!-- 连续登录贴纸领取按钮 -->
              <div v-if="code === 'purple' && loginProgress.canClaim" class="claim-btn-wrapper">
                <button class="claim-btn" @click="handleClaimLogin">
                  领取 ({{ loginProgress.days }}/7天)
                </button>
              </div>
              <div v-else-if="code === 'purple'" class="progress-info">
                进度：{{ loginProgress.days }}/7天
              </div>
              
              <!-- 连续充值贴纸领取按钮 -->
              <div v-if="code === 'orange' && rechargeProgress.canClaim" class="claim-btn-wrapper">
                <button class="claim-btn" @click="handleClaimRecharge">
                  领取 ({{ rechargeProgress.days }}/7天)
                </button>
              </div>
              <div v-else-if="code === 'orange'" class="progress-info">
                进度：{{ rechargeProgress.days }}/7天
              </div>
            </div>
          </div>
        </div>

        <!-- 板块2：兑换奖励列表 -->
        <div class="section reward-list-section">
          <div class="section-title">
            <h2>兑换奖励</h2>
          </div>
          
          <div v-loading="rewardLoading" class="reward-grid">
            <div
              v-for="(reward, index) in rewardList"
              :key="index"
              class="reward-card"
              :class="{ 'can-exchange': canExchange(reward) }"
            >
              <div class="reward-header">
                <h3 class="reward-name">{{ reward.reward.rewardName }}</h3>
                <div v-if="reward.reward.maxExchangeCount" class="exchange-limit">
                  每人限兑{{ reward.reward.maxExchangeCount }}次
                </div>
              </div>
              
              <!-- 所需贴纸 -->
              <div class="sticker-requirements">
                <div class="requirements-label">所需贴纸：</div>
                <div class="requirements-list">
                  <div
                    v-for="(req, idx) in parseStickerRequirement(reward.reward.stickerRequirement)"
                    :key="idx"
                    class="requirement-item"
                  >
                    <span class="sticker-badge" :style="{ 
                      backgroundColor: getStickerInfo(req.stickerCode).color + '20',
                      color: getStickerInfo(req.stickerCode).color,
                      borderColor: getStickerInfo(req.stickerCode).color
                    }">
                      {{ getStickerInfo(req.stickerCode).name }} x{{ req.quantity }}
                    </span>
                    <span class="quantity-check" :class="{
                      'enough': getUserStickerQuantity(req.stickerCode) >= req.quantity,
                      'not-enough': getUserStickerQuantity(req.stickerCode) < req.quantity
                    }">
                      (拥有: {{ getUserStickerQuantity(req.stickerCode) }})
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 奖励饰品 -->
              <div class="reward-ornaments">
                <div class="ornaments-label">奖励饰品：</div>
                <div class="ornaments-list">
                  <div
                    v-for="(ornament, idx) in reward.ornaments"
                    :key="idx"
                    class="ornament-item"
                  >
                    <img
                      v-if="ornament.imageUrl"
                      :src="ornament.imageUrl"
                      :alt="ornament.ornamentName"
                      class="ornament-image"
                    />
                    <div class="ornament-info">
                      <div class="ornament-name">{{ ornament.ornamentName }}</div>
                      <div class="ornament-quantity">x{{ ornament.quantity }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 兑换按钮 -->
              <div class="exchange-action">
                <button
                  v-if="canExchange(reward)"
                  class="exchange-btn"
                  @click="handleExchange(reward)"
                >
                  立即兑换
                </button>
                <button
                  v-else
                  class="exchange-btn disabled"
                  disabled
                >
                  {{ !checkStickerEnough(parseStickerRequirement(reward.reward.stickerRequirement)) ? '贴纸不足' : '不可兑换' }}
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="!rewardLoading && rewardList.length === 0" class="empty-state">
            <p>暂无可兑换奖励</p>
          </div>
        </div>
      </div>
    </template>
  </Layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.sticker-page {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  
  @include mobile {
    padding: 10px;
  }
}

.section {
  margin-bottom: 40px;
  
  @include mobile {
    margin-bottom: 30px;
  }
}

.section-title {
  margin-bottom: 20px;
  
  h2 {
    color: #fff;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    
    @include mobile {
      font-size: 20px;
    }
  }
}

// 板块1：贴纸规则
.sticker-rules {
  .sticker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    
    @include mobile {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }
  
  .sticker-card {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    transition: all 0.3s;
    backdrop-filter: blur(10px);
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    @include mobile {
      padding: 15px;
    }
  }
  
  .sticker-icon {
    font-size: 48px;
    margin-bottom: 10px;
    
    @include mobile {
      font-size: 36px;
    }
  }
  
  .sticker-name {
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
    
    @include mobile {
      font-size: 16px;
    }
  }
  
  .sticker-type {
    color: #b4c7c9;
    font-size: 14px;
    margin-bottom: 10px;
    
    @include mobile {
      font-size: 12px;
    }
  }
  
  .sticker-quantity {
    color: #1FEBC4;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    
    @include mobile {
      font-size: 14px;
    }
  }
  
  .claim-btn-wrapper {
    margin-top: 10px;
  }
  
  .claim-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    @include mobile {
      padding: 6px 12px;
      font-size: 12px;
    }
  }
  
  .progress-info {
    color: #b4c7c9;
    font-size: 12px;
    margin-top: 8px;
  }
}

// 板块2：兑换奖励
.reward-list-section {
  .reward-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    
    @include mobile {
      grid-template-columns: 1fr;
      gap: 15px;
    }
  }
  
  .reward-card {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s;
    backdrop-filter: blur(10px);
    
    &.can-exchange {
      border-color: #1FEBC4;
      box-shadow: 0 0 20px rgba(31, 235, 196, 0.2);
    }
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    @include mobile {
      padding: 15px;
    }
  }
  
  .reward-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    @include mobile {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
  
  .reward-name {
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    margin: 0;
    
    @include mobile {
      font-size: 18px;
    }
  }
  
  .exchange-limit {
    color: #b4c7c9;
    font-size: 12px;
  }
  
  .sticker-requirements {
    margin-bottom: 15px;
  }
  
  .requirements-label {
    color: #b4c7c9;
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .requirements-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .requirement-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .sticker-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    border: 1px solid;
  }
  
  .quantity-check {
    font-size: 12px;
    
    &.enough {
      color: #1FEBC4;
    }
    
    &.not-enough {
      color: #FF352E;
    }
  }
  
  .reward-ornaments {
    margin-bottom: 15px;
  }
  
  .ornaments-label {
    color: #b4c7c9;
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .ornaments-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .ornament-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    padding: 8px;
    border-radius: 8px;
  }
  
  .ornament-image {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .ornament-info {
    display: flex;
    flex-direction: column;
  }
  
  .ornament-name {
    color: #fff;
    font-size: 12px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .ornament-quantity {
    color: #1FEBC4;
    font-size: 12px;
  }
  
  .exchange-action {
    margin-top: 15px;
  }
  
  .exchange-btn {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 12px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover:not(.disabled) {
      transform: scale(1.02);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    &.disabled {
      background: rgba(255, 255, 255, 0.1);
      color: #b4c7c9;
      cursor: not-allowed;
    }
    
    @include mobile {
      padding: 10px;
      font-size: 14px;
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 40px;
    color: #b4c7c9;
    font-size: 16px;
  }
}
</style>
