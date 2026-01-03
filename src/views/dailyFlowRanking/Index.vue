<template>
  <Layout>
    <template #item>
      <div class="bg center-bg"></div>
      <div class="ranking-container" v-loading="loading">
        <!-- 内容区域 -->
        <div class="content-wrapper">
          <!-- 主标签切换：排行榜 / 奖励配置 -->
          <div class="tab-container">
            <div class="tab-header">
              <div 
                class="tab-item" 
                :class="{ active: mainTab === 'ranking' }"
                @click="switchMainTab('ranking')"
              >
                排行榜
              </div>
              <div 
                class="tab-item" 
                :class="{ active: mainTab === 'reward' }"
                @click="switchMainTab('reward')"
              >
                排名奖励
              </div>
            </div>
          </div>

        <!-- 排行榜内容 -->
        <div v-if="mainTab === 'ranking'" class="tab-content">
          <!-- 用户排名信息（如果已登录） -->
          <div class="user-ranking-card" v-if="userRankingInfo || (activeTab === 'today' ? todayUserRanking !== null : yesterdayUserRanking !== null)">
          <div class="user-ranking-header">
            <img :src="requireImg('/coin1.png', false)" alt="" class="coin-icon">
            <span class="user-ranking-title">我的排名</span>
          </div>
          <div class="user-ranking-content" v-if="userRankingInfo">
            <div class="user-rank-info">
              <div class="rank-badge" :class="getRankClass(userRankingInfo.rank)">
                {{ userRankingInfo.rank || '未上榜' }}
              </div>
              <div class="user-info">
                <img :src="userRankingInfo.avatar || requireImg('/v2/nav/u1.png', false)" alt="" class="user-avatar">
                <span class="user-name">{{ userRankingInfo.nickName || userRankingInfo.userName || '未登录' }}</span>
              </div>
            </div>
            <div class="user-flow-info">
              <div class="flow-item">
                <span class="flow-label">总流水：</span>
                <span class="flow-value">{{ formatAmount(userRankingInfo.totalFlow) }}</span>
              </div>
              <div class="flow-item">
                <span class="flow-label">充值：</span>
                <span class="flow-value">{{ formatAmount(userRankingInfo.rechargeAmount) }}</span>
              </div>
              <div class="flow-item">
                <span class="flow-label">消费：</span>
                <span class="flow-value">{{ formatAmount(userRankingInfo.consumeAmount) }}</span>
              </div>
            </div>
          </div>
          <div class="user-ranking-content" v-else>
            <div class="no-ranking-tip">
              <p v-if="currentGapToTop100 !== null && currentGapToTop100 > 0">
                您还未上榜，距离第100名还差 <span class="gap-amount">{{ formatAmount(currentGapToTop100) }}</span> 流水
              </p>
              <p v-else>
                您还未上榜，继续努力即可上榜
              </p>
            </div>
          </div>
        </div>

        <!-- 排行榜列表 -->
        <div class="ranking-list-wrapper">
          <!-- 子标签切换：今日排行 / 昨日排行 -->
          <div class="sub-tab-container">
            <div class="sub-tab-header">
              <div 
                class="sub-tab-item" 
                :class="{ active: activeTab === 'today' }"
                @click="switchTab('today')"
              >
                今日排行
              </div>
              <div 
                class="sub-tab-item" 
                :class="{ active: activeTab === 'yesterday' }"
                @click="switchTab('yesterday')"
              >
                昨日排行
              </div>
            </div>
          </div>
          <div class="ranking-list-header">
            <div class="header-item rank-col">排名</div>
            <div class="header-item avatar-col">头像</div>
            <div class="header-item user-col">玩家</div>
            <div class="header-item flow-col">总流水</div>
            <div class="header-item reward-col">奖励</div>
          </div>
          <div class="ranking-list" v-if="currentRankingList && currentRankingList.length">
            <div 
              :class="['ranking-item', { 'top-three': item.rank <= 3 }]"
              v-for="(item, index) in currentRankingList" 
              :key="item.userId"
            >
              <div class="rank-col">
                <div class="rank-badge" :class="getRankClass(item.rank)">
                  <span v-if="item.rank <= 3" class="rank-icon">{{ getRankIcon(item.rank) }}</span>
                  <span v-else>{{ item.rank }}</span>
                </div>
              </div>
              <div class="avatar-col">
                <img 
                  :src="item.avatar || requireImg('/v2/nav/u1.png', false)" 
                  alt="" 
                  class="user-avatar"
                >
              </div>
              <div class="user-col">
                <span class="user-name">{{ item.nickName || item.userName }}</span>
              </div>
              <div class="flow-col">
                <img :src="requireImg('/coin1.png', false)" alt="" class="coin-icon-small">
                <span class="flow-value">{{ formatAmount(item.totalFlow) }}</span>
              </div>
              <div class="reward-col">
                <span class="reward-text" v-if="item.rewardAmount && item.rewardAmount > 0">
                  {{ formatAmount(item.rewardAmount) }}
                </span>
                <span class="reward-text" v-else>-</span>
              </div>
            </div>
          </div>
          <div class="empty-box" v-else>
            <p>暂无排行榜数据</p>
          </div>
        </div>
        </div>

        <!-- 奖励配置内容 -->
        <div v-if="mainTab === 'reward'" class="tab-content">
          <div class="reward-config-section" v-if="rewardConfigList && rewardConfigList.length">
            <div class="section-title">
              <img :src="requireImg('/coin1.png', false)" alt="" class="title-icon">
              <span>排名奖励配置</span>
            </div>
            <div class="reward-config-list">
              <div 
                class="reward-config-item"
                v-for="(config, index) in rewardConfigList" 
                :key="config.id"
              >
                <div class="rank-range">
                  <span class="rank-text" v-if="config.rankStart === config.rankEnd">
                    第{{ config.rankStart }}名
                  </span>
                  <span class="rank-text" v-else>
                    第{{ config.rankStart }}-{{ config.rankEnd }}名
                  </span>
                </div>
                <div class="reward-info">
                  <img 
                    :src="config.rewardType === 1 ? requireImg('/coin1.png', false) : requireImg('/coin1.png', false)" 
                    alt="" 
                    class="reward-icon"
                  >
                  <span class="reward-amount">{{ formatAmount(config.rewardAmount) }}</span>
                  <span class="reward-type">{{ config.rewardType === 1 ? '金币' : '弹药' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-box" v-else>
            <p>暂无奖励配置数据</p>
          </div>
          
          <!-- 奖励配置说明 -->
          <div class="info-section">
            <div class="info-item">
              <span class="info-label">奖励类型：</span>
              <span class="info-text">支持金币和弹药两种奖励类型</span>
            </div>
            <div class="info-item">
              <span class="info-label">奖励发放：</span>
              <span class="info-text">每日0:30自动根据排名发放奖励到玩家账号</span>
            </div>
            <div class="info-item">
              <span class="info-label">排名范围：</span>
              <span class="info-text">前100名可获得奖励，具体奖励金额见上表</span>
            </div>
          </div>
        </div>

        <!-- 说明信息（仅在排行榜tab显示） -->
        <div class="info-section" v-if="mainTab === 'ranking'">
          <div class="info-item">
            <span class="info-label">统计规则：</span>
            <span class="info-text">每日0:00停止统计前一天的流水数据</span>
          </div>
          <div class="info-item">
            <span class="info-label">奖励发放：</span>
            <span class="info-text">每日0:30自动根据排名发放奖励到玩家账号</span>
          </div>
        </div>
      </div>
      </div>
    </template>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Layout from '@/components/Layout.vue';
import { getDailyFlowRankingApi, getRewardConfigApi } from '@/api/dailyFlowRanking';
import { requireImg } from '@/utils/common';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const mainTab = ref('ranking'); // 主tab：ranking=排行榜，reward=奖励配置
const activeTab = ref('today'); // 子tab：today=今日，yesterday=昨日
const todayRanking = ref([]);
const yesterdayRanking = ref([]);
const todayUserRanking = ref(null);
const yesterdayUserRanking = ref(null);
const todayGapToTop100 = ref(null);
const yesterdayGapToTop100 = ref(null);
const rewardConfigList = ref([]);

// 当前显示的排行榜列表
const currentRankingList = computed(() => {
  return activeTab.value === 'today' ? todayRanking.value : yesterdayRanking.value;
});

// 当前显示的用户排名信息
const userRankingInfo = computed(() => {
  return activeTab.value === 'today' ? todayUserRanking.value : yesterdayUserRanking.value;
});

// 当前显示的距离第100名的差值
const currentGapToTop100 = computed(() => {
  return activeTab.value === 'today' ? todayGapToTop100.value : yesterdayGapToTop100.value;
});

// 切换主标签
const switchMainTab = (tab) => {
  mainTab.value = tab;
};

// 切换子标签（排行榜下的今日/昨日）
const switchTab = (tab) => {
  activeTab.value = tab;
};

// 获取排行榜数据
const getRankingData = async () => {
  loading.value = true;
  try {
    const res = await getDailyFlowRankingApi();
    if (res.code === 200) {
      todayRanking.value = res.data.todayRanking || [];
      yesterdayRanking.value = res.data.yesterdayRanking || [];
      todayUserRanking.value = res.data.todayUserRanking || null;
      yesterdayUserRanking.value = res.data.yesterdayUserRanking || null;
      todayGapToTop100.value = res.data.todayGapToTop100 || null;
      yesterdayGapToTop100.value = res.data.yesterdayGapToTop100 || null;
    } else {
      ElMessage.error(res.msg || '获取排行榜数据失败');
    }
  } catch (error) {
    console.error('获取排行榜数据失败:', error);
    ElMessage.error('获取排行榜数据失败');
  } finally {
    loading.value = false;
  }
};

// 格式化金额
const formatAmount = (amount) => {
  if (amount == null || amount === undefined) return '0.00';
  return parseFloat(amount).toFixed(2);
};

// 获取排名样式类
const getRankClass = (rank) => {
  if (!rank) return '';
  if (rank === 1) return 'rank-first';
  if (rank === 2) return 'rank-second';
  if (rank === 3) return 'rank-third';
  return 'rank-normal';
};

// 获取排名图标（前三名）
const getRankIcon = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '';
};

// 获取奖励配置
const getRewardConfig = async () => {
  try {
    const res = await getRewardConfigApi();
    if (res.code === 200) {
      rewardConfigList.value = res.data || [];
    }
  } catch (error) {
    console.error('获取奖励配置失败:', error);
  }
};

onMounted(() => {
  getRankingData();
  getRewardConfig();
});
</script>

<style scoped lang="scss">
@use "@/style" as *;

.center-bg {
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

.ranking-container {
  width: 100%;
  min-height: 100vh;
  padding-top: 80px;
  padding-bottom: 100px;
  position: relative;
  font-family: "PingFang Medium";
  z-index: 2;
  
  @include mobile {
    padding-top: 60px;
    padding-bottom: 80px;
  }
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

// Tab 样式（主tab）
.tab-container {
  z-index: 2;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding-top: 20px;
}

.tab-header {
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 4px;
  backdrop-filter: blur(10px);
}

.tab-item {
  padding: 10px 30px;
  border-radius: 6px;
  cursor: pointer;
  color: #b4c7c9;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
  
  @include mobile {
    padding: 8px 20px;
    font-size: 14px;
  }
}

// 子Tab样式（今日排行/昨日排行）
.sub-tab-container {
  z-index: 2;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 15px;
}

.sub-tab-header {
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 4px;
  backdrop-filter: blur(10px);
}

.sub-tab-item {
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  color: #b4c7c9;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
  
  @include mobile {
    padding: 6px 15px;
    font-size: 12px;
  }
}

.tab-content {
  min-height: 400px;
}

.user-ranking-card {
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 107, 53, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  
  .user-ranking-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    
    .coin-icon {
      width: 24px;
      height: 24px;
    }
    
    .user-ranking-title {
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
    }
  }
  
  .user-ranking-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @include mobile {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }
    
    .user-rank-info {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .rank-badge {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
        color: #ffffff;
        
        &.rank-first {
          background: linear-gradient(135deg, #f8debb, #fab71b);
          border: 2px solid #f2a814;
          color: #684412;
        }
        
        &.rank-second {
          background: linear-gradient(135deg, #e9e7e3, #646463);
          border: 2px solid #ccc;
        }
        
        &.rank-third {
          background: linear-gradient(135deg, #e8dabf, #9c7315);
          border: 2px solid #f0edd9;
        }
        
        &.rank-normal {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
      }
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 2px solid #f2a814;
        }
        
        .user-name {
          font-size: 16px;
          color: #ffffff;
          font-weight: 500;
        }
      }
    }
    
    .user-flow-info {
      display: flex;
      gap: 20px;
      
      @include mobile {
        flex-direction: column;
        gap: 10px;
        width: 100%;
      }
      
      .flow-item {
        display: flex;
        align-items: center;
        gap: 5px;
        
        .flow-label {
          font-size: 14px;
          color: #d4c7af;
        }
        
        .flow-value {
          font-size: 16px;
          color: #ff6b35;
          font-weight: bold;
        }
      }
    }
  }
}

.ranking-list-wrapper {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  margin-bottom: 30px;
  position: relative;
  
  .sub-tab-container {
    margin-bottom: 20px;
  }
  
  .ranking-list-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 15px;
    padding: 15px 0;
    border-bottom: 2px solid rgba(255, 107, 53, 0.3);
    margin-bottom: 15px;
    
    @include mobile {
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
      gap: 10px;
      font-size: 12px;
    }
    
    .header-item {
      font-size: 16px;
      font-weight: bold;
      color: #ff6b35;
      text-align: center;
      
      @include mobile {
        font-size: 12px;
      }
      
      &.user-col {
        text-align: center;
      }
      
      &.avatar-col {
        text-align: center;
      }
    }
  }
  
  .ranking-list {
    .ranking-item {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      align-items: center;
      transition: all 0.3s;
      
      @include mobile {
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
        gap: 10px;
        padding: 12px 0;
      }
      
      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      
      &.top-three {
        background: rgba(255, 107, 53, 0.1);
        position: relative;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #ff6b35;
        }
      }
      
      .rank-col {
        display: flex;
        justify-content: center;
        
        .rank-badge {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          color: #ffffff;
          
          @include mobile {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }
          
          &.rank-first {
            background: linear-gradient(135deg, #f8debb, #fab71b);
            border: 2px solid #f2a814;
            color: #684412;
          }
          
          &.rank-second {
            background: linear-gradient(135deg, #e9e7e3, #646463);
            border: 2px solid #ccc;
          }
          
          &.rank-third {
            background: linear-gradient(135deg, #e8dabf, #9c7315);
            border: 2px solid #f0edd9;
          }
          
          &.rank-normal {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
          }
          
          .rank-icon {
            font-size: 24px;
            
            @include mobile {
              font-size: 20px;
            }
          }
        }
      }
      
      .avatar-col {
        display: flex;
        align-items: center;
        justify-content: center;
        
        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          border: 2px solid #f2a814;
          
          @include mobile {
            width: 40px;
            height: 40px;
          }
        }
      }
      
      .user-col {
        display: flex;
        align-items: center;
        justify-content: center;
        
        .user-name {
          font-size: 16px;
          color: #ffffff;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          
          @include mobile {
            font-size: 14px;
          }
        }
      }
      
      .flow-col {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        
        .coin-icon-small {
          width: 16px;
          height: 16px;
        }
        
        .flow-value {
          font-size: 16px;
          color: #ff6b35;
          font-weight: bold;
          
          @include mobile {
            font-size: 14px;
          }
        }
      }
      
      .reward-col {
        text-align: center;
        
        .reward-text {
          font-size: 16px;
          color: #d4c7af;
          
          @include mobile {
            font-size: 14px;
          }
        }
      }
    }
  }
}

.empty-box {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #d4c7af;
  font-size: 18px;
}

.no-ranking-tip {
  text-align: center;
  padding: 20px;
  color: #d4c7af;
  font-size: 16px;
  
  .gap-amount {
    color: #ff6b35;
    font-weight: bold;
    font-size: 18px;
    margin: 0 5px;
  }
}

.reward-config-section {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  margin-bottom: 30px;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    font-size: 20px;
    font-weight: bold;
    color: #ff6b35;
    
    .title-icon {
      width: 24px;
      height: 24px;
    }
  }
  
  .reward-config-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    
    @include mobile {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }
    
    .reward-config-item {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 107, 53, 0.3);
      border-radius: 8px;
      padding: 15px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      transition: all 0.3s;
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: #ff6b35;
        transform: translateY(-2px);
      }
      
      .rank-range {
        .rank-text {
          font-size: 16px;
          font-weight: bold;
          color: #ffffff;
          
          @include mobile {
            font-size: 14px;
          }
        }
      }
      
      .reward-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .reward-icon {
          width: 20px;
          height: 20px;
        }
        
        .reward-amount {
          font-size: 18px;
          font-weight: bold;
          color: #ff6b35;
          
          @include mobile {
            font-size: 16px;
          }
        }
        
        .reward-type {
          font-size: 14px;
          color: #d4c7af;
          padding: 2px 8px;
          background: rgba(255, 107, 53, 0.2);
          border-radius: 4px;
          
          @include mobile {
            font-size: 12px;
          }
        }
      }
    }
  }
}

.info-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(5px);
  
  .info-item {
    margin-bottom: 10px;
    font-size: 14px;
    color: #d4c7af;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .info-label {
      font-weight: bold;
      color: #ff6b35;
      margin-right: 8px;
    }
    
    .info-text {
      color: #d4c7af;
    }
  }
}
</style>

