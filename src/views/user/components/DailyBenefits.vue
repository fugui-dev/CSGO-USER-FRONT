<script setup>
import { ref, onMounted, watch } from "vue";
import { getDailyBenefitsApi, getVipProgressApi, getRewardListApi } from "@/api";
import { formatDate } from "@/utils/common";

const active = ref(0);
const loading = ref(false);

const tabs = ref([
  {
    label: '每日福利',
    value: 0
  },
  {
    label: '奖励列表',
    value: 1
  },
  {
    label: 'VIP进程',
    value: 2
  },
])

const benefitsData = ref({
  vipLevel: 0,
  vipLevelName: '普通用户',
  todayConsumeAmount: 0,
  rebateRate: 0,
  rebateAmount: 0,
  activityRule: '',
  yesterdayConsumeAmount: 0
})

const vipProgressData = ref({
  currentLevel: 0,
  currentLevelName: '普通用户',
  totalConsume: 0,
  nextLevel: null,
  nextLevelName: '',
  nextLevelRequire: 0,
  progress: 0,
  allVipLevels: []
})

const rewardList = ref([])

const getData = () => {
  loading.value = true
  getDailyBenefitsApi().then(res => {
    if (res.code === 200 && res.data) {
      benefitsData.value = {
        vipLevel: res.data.vipLevel || 0,
        vipLevelName: res.data.vipLevelName || '普通用户',
        todayConsumeAmount: parseFloat(res.data.todayConsumeAmount) || 0,
        rebateRate: parseFloat(res.data.rebateRate) || 0,
        rebateAmount: parseFloat(res.data.rebateAmount) || 0,
        activityRule: res.data.activityRule || '暂无活动规则',
        yesterdayConsumeAmount: parseFloat(res.data.yesterdayConsumeAmount) || 0
      }
    }
  }).catch(err => {
    console.error('获取每日福利信息失败', err)
  }).finally(() => {
    loading.value = false
  })
}

const getVipProgress = () => {
  loading.value = true
  getVipProgressApi().then(res => {
    if (res.code === 200 && res.data) {
      vipProgressData.value = {
        currentLevel: res.data.currentLevel != null ? res.data.currentLevel : 0,
        currentLevelName: res.data.currentLevelName || '普通用户',
        totalConsume: res.data.totalConsume ? parseFloat(res.data.totalConsume) : 0,
        nextLevel: res.data.nextLevel,
        nextLevelName: res.data.nextLevelName || '',
        nextLevelRequire: res.data.nextLevelRequire ? parseFloat(res.data.nextLevelRequire) : 0,
        progress: res.data.progress ? parseFloat(res.data.progress) : 0,
        allVipLevels: (res.data.allVipLevels || []).map(level => ({
          level: level.level,
          name: level.name,
          growthValue: level.growthValue ? parseFloat(level.growthValue) : 0,
          rebateRate: level.rebateRate ? parseFloat(level.rebateRate) : 0,
          achieved: level.achieved || false
        }))
      }
    }
  }).catch(err => {
    console.error('获取VIP进程信息失败', err)
  }).finally(() => {
    loading.value = false
  })
}

const getRewardList = () => {
  loading.value = true
  getRewardListApi().then(res => {
    if (res.code === 200 && res.data) {
      rewardList.value = (res.data || []).map(item => ({
        id: item.id,
        date: item.recordDate ? formatDate(item.recordDate) : '',
        amount: parseFloat(item.rebateAmount) || 0,
        description: `VIP${item.vipLevel || 0}消费返点`,
        consumeAmount: parseFloat(item.consumeAmount) || 0
      }))
    }
  }).catch(err => {
    console.error('获取奖励列表失败', err)
  }).finally(() => {
    loading.value = false
  })
}

watch(() => active.value, (newVal) => {
  if (newVal === 1) {
    // 奖励列表
    if (rewardList.value.length === 0) {
      getRewardList()
    }
  } else if (newVal === 2) {
    // VIP进程
    if (vipProgressData.value.allVipLevels.length === 0) {
      getVipProgress()
    }
  }
})

onMounted(() => {
  getData()
})
</script>

<template>
  <div class="benefits-center">
    <div class="nav">
      <div class="nav-item" v-for="(i, index) in tabs" :class="{ 'active': active === i.value }" :key="index"
        @click="()=>{
          if(loading)return
          active = i.value
        }">
        <span>{{ i.label }}</span>
      </div>
    </div>

    <!-- Tab 1: 每日福利 -->
    <div v-show="active === 0" style="display:flex;flex-direction: column" class="tabs-container">
      <div class="self-title">
        <span>VIP信息</span>
      </div>
      
      <div class="benefits-item">
        <div class="info-row">
          <div class="info-label">当前VIP等级</div>
          <div class="info-value vip-level">
            <span v-if="benefitsData.vipLevel > 0" class="vip-badge">VIP{{ benefitsData.vipLevel }}</span>
            <span v-else class="normal-badge">{{ benefitsData.vipLevelName }}</span>
          </div>
        </div>
      </div>

      <div class="self-title">
        <span>今日消费</span>
      </div>
      
      <div class="benefits-item">
        <div class="info-row">
          <div class="info-label">今日消费金额</div>
          <div class="info-value consume-amount">
            {{ (benefitsData.todayConsumeAmount || 0).toFixed(2) }}
          </div>
        </div>
      </div>

      <div class="self-title">
        <span>奖励信息</span>
      </div>
      
      <div class="benefits-item">
        <div class="info-row">
          <div class="info-label">奖励比例</div>
          <div class="info-value rebate-rate">
            {{ (benefitsData.rebateRate || 0).toFixed(2) }}%
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">奖励数量</div>
          <div class="info-value rebate-amount">
            {{ (benefitsData.rebateAmount || 0).toFixed(2) }}
          </div>
        </div>
      </div>

      <div class="self-title">
        <span>昨日消费</span>
      </div>
      
      <div class="benefits-item">
        <div class="info-row">
          <div class="info-label">昨日消费金额</div>
          <div class="info-value yesterday-amount">
            {{ (benefitsData.yesterdayConsumeAmount || 0).toFixed(2) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: 奖励列表 -->
    <div v-show="active === 1" v-loading="loading" style="display:flex;flex-direction: column" class="tabs-container">
      <div class="self-title">
        <span>奖励记录</span>
      </div>
      
      <div class="benefits-item">
        <div class="empty-state" v-if="!loading && rewardList.length === 0">
          <p>暂无奖励记录</p>
        </div>
        <div v-else-if="loading" class="empty-state">
          <p>加载中...</p>
        </div>
        <div v-else class="reward-list">
          <div v-for="(reward, index) in rewardList" :key="index" class="reward-item">
            <div class="reward-info">
              <div class="reward-date">{{ reward.date }}</div>
              <div class="reward-amount">+{{ reward.amount.toFixed(2) }}</div>
            </div>
            <div class="reward-desc">
              {{ reward.description }}（消费{{ reward.consumeAmount.toFixed(2) }}）
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 3: VIP进程 -->
    <div v-show="active === 2" v-loading="loading" style="display:flex;flex-direction: column" class="tabs-container">
      <div class="self-title">
        <span>当前VIP等级</span>
      </div>
      
      <div class="benefits-item">
        <div class="info-row">
          <div class="info-label">VIP等级</div>
          <div class="info-value vip-level">
            <span v-if="vipProgressData.currentLevel > 0" class="vip-badge">VIP{{ vipProgressData.currentLevel }}</span>
            <span v-else class="normal-badge">{{ vipProgressData.currentLevelName }}</span>
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">累计消费</div>
          <div class="info-value consume-amount">
            {{ (vipProgressData.totalConsume || 0).toFixed(2) }}
          </div>
        </div>
        <div class="info-row" v-if="vipProgressData.nextLevel">
          <div class="info-label">距离下一等级还需要</div>
          <div class="info-value">
            {{ Math.max(0, (vipProgressData.nextLevelRequire - vipProgressData.totalConsume || 0)).toFixed(2) }}
          </div>
        </div>
      </div>

      <div class="self-title" v-if="vipProgressData.nextLevel">
        <span>下一等级</span>
      </div>
      
      <div class="benefits-item" v-if="vipProgressData.nextLevel">
        <div class="info-row">
          <div class="info-label">目标等级</div>
          <div class="info-value">
            {{ vipProgressData.nextLevelName }}
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">还需消费</div>
          <div class="info-value">
            {{ (vipProgressData.nextLevelRequire - vipProgressData.totalConsume || 0).toFixed(2) }}
          </div>
        </div>
        <div class="progress-bar-wrapper">
          <div class="progress-label">
            <span>升级进度</span>
            <span>{{ vipProgressData.progress.toFixed(0) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: vipProgressData.progress + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="self-title">
        <span>VIP等级说明</span>
      </div>
      
      <div class="benefits-item rule-item">
        <div class="rule-content">
          <div v-if="vipProgressData.allVipLevels && vipProgressData.allVipLevels.length > 0" class="vip-levels-list">
            <div v-for="(level, index) in vipProgressData.allVipLevels" :key="index" class="vip-level-item">
              <div class="vip-level-header">
                <span class="vip-level-name">{{ level.name || ('VIP' + level.level) }}</span>
                <span v-if="level.achieved" class="achieved-badge">已达成</span>
              </div>
              <div class="vip-level-details">
                <span>所需消费：{{ (level.growthValue || 0).toFixed(2) }}</span>
                <span>返点比例：{{ (level.rebateRate || 0).toFixed(2) }}%</span>
              </div>
            </div>
          </div>
          <div v-else class="no-vip-levels">
            暂无VIP等级配置
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/style' as *;

$primary-color-user: #B3B586;

.benefits-center {
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 20px;
  width: 100%;
  font-size: 13px;

  .tabs-container {
    display: flex;
    flex-direction: column;
    margin-top: 24px;
  }

  .self-title {
    position: relative;
    width: fit-content;
    margin: 6px 0 !important;

    span {
      position: relative;
      font-size: 16px;
      font-family: "Source Han Sans CN", "Microsoft YaHei", 'sans-serif';
      z-index: 2;
      filter: none !important;
      color: #FFFFFF;
    }

    div {
      content: '';
      position: absolute;
      width: 91px;
      height: 10px;
      bottom: -7px;
      left: 0;
      z-index: 0;
    }
  }

  .benefits-item {
    width: 100%;
    min-height: 50px;
    border-radius: 5px;
    border: 1px solid $primary-color-user;
    background: rgba($color: #000000, $alpha: 0.59);
    padding: 15px 20px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .info-label {
        font-size: 14px;
        color: #FFFFFF;
        font-weight: 500;
      }

      .info-value {
        font-size: 16px;
        font-weight: bold;
        color: #FFFFFF;

        &.vip-level {
          .vip-badge {
            display: inline-block;
            padding: 4px 12px;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            color: #8B4513;
            border-radius: 15px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          .normal-badge {
            color: #B3B586;
          }
        }

        &.consume-amount {
          color: #F54C36;
        }

        &.rebate-rate {
          color: #67C23A;
        }

        &.rebate-amount {
          color: #409EFF;
        }

        &.yesterday-amount {
          color: #B3B586;
        }
      }
    }

    &.rule-item {
      .rule-content {
        font-size: 14px;
        color: #FFFFFF;
        line-height: 1.6;
        padding: 10px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;

        .vip-levels-list {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .vip-level-item {
            padding: 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 5px;
            border: 1px solid rgba(179, 181, 134, 0.3);

            .vip-level-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .vip-level-name {
                font-size: 16px;
                font-weight: bold;
                color: #B3B586;
              }

              .achieved-badge {
                font-size: 12px;
                padding: 2px 8px;
                background: rgba(103, 194, 58, 0.3);
                color: #67C23A;
                border-radius: 10px;
              }
            }

            .vip-level-details {
              display: flex;
              gap: 20px;
              font-size: 13px;
              color: #FFFFFF;

              span {
                color: #B3B586;
              }
            }
          }
        }

        .no-vip-levels {
          text-align: center;
          color: #B3B586;
          padding: 20px;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #B3B586;
      font-size: 14px;
    }

    .reward-list {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .reward-item {
        padding: 12px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;

        .reward-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;

          .reward-date {
            font-size: 14px;
            color: #FFFFFF;
          }

          .reward-amount {
            font-size: 16px;
            font-weight: bold;
            color: #67C23A;
          }
        }

        .reward-desc {
          font-size: 12px;
          color: #B3B586;
        }
      }
    }

    .progress-bar-wrapper {
      margin-top: 15px;

      .progress-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
        color: #FFFFFF;
      }

      .progress-bar {
        width: 100%;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #67C23A 0%, #85CE61 100%);
          transition: width 0.3s ease;
        }
      }
    }
  }
}
</style>
