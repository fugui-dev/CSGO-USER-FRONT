<template>
  <Layout>
    <div class="introduction-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="title-wrapper">
          <h1 class="page-title">夺冠之路</h1>
          <p class="page-subtitle">团队竞技，争夺冠军宝座</p>
        </div>
      </div>

      <!-- 玩法介绍内容 -->
      <div class="content-wrapper">
        <!-- 玩法概述 -->
        <div class="intro-section">
          <div class="section-header">
            <div class="section-icon">🏆</div>
            <h2>具体怎么赢的</h2>
          </div>
          <div class="section-content">
            <div class="intro-card">
              <div class="card-icon">
                <div class="icon-emoji">👥</div>
              </div>
              <div class="card-content">
                <h3>队伍组成与规模</h3>
                <p>比赛由主播和玩家共同组建，共16支队伍，每支队伍由10名队员组成。队伍成员需要协作完成各种挑战任务。</p>
              </div>
            </div>
            <div class="intro-card">
              <div class="card-icon">
                <div class="icon-emoji">🎯</div>
              </div>
              <div class="card-content">
                <h3>具体对战规则</h3>
                <p>每场对战分为10个回合，系统自动分配两个队伍的队员进行对战。双方都选择一个出金概率（默认50%），如果成功出金，获得的积分 = 100 - 选择的概率。</p>
              </div>
            </div>
            <div class="intro-card">
              <div class="card-icon">
                <div class="icon-emoji">🏅</div>
              </div>
              <div class="card-content">
                <h3>晋级与排名规则</h3>
                <p>每个阶段结束后，根据队伍总积分（每场对战的助威金额会转化为初始积分）和总胜场数进行排名，然后晋级到下一个阶段。</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 时间安排 -->
        <div class="intro-section">
          <div class="section-header">
            <div class="section-icon">⏰</div>
            <h2>时间安排</h2>
          </div>
          <div class="time-schedule">
            <div class="time-item">
              <div class="time-label">每场对战时长</div>
              <div class="time-value">{{ timeConfig.fightDuration }}分钟（前5分钟等待用户进入和准备）</div>
            </div>
            <div class="time-item">
              <div class="time-label">轮次间隔</div>
              <div class="time-value">{{ timeConfig.roundInterval }}分钟</div>
            </div>
            <div class="time-item">
              <div class="time-label">回合时长</div>
              <div class="time-value">{{ timeConfig.roundDuration }}分钟（前30秒用户选择概率，后30秒系统计算结果）</div>
            </div>
            <div class="time-item">
              <div class="time-label">阶段间隔</div>
              <div class="time-value">{{ timeConfig.stageInterval }}分钟</div>
            </div>
          </div>
        </div>

        <!-- 比赛流程 -->
        <div class="intro-section">
          <div class="section-header">
            <div class="section-icon">📋</div>
            <h2>比赛流程</h2>
          </div>
          <div class="process-timeline">
            <div class="timeline-item" v-for="(step, index) in processSteps" :key="index">
              <div class="timeline-marker">
                <div class="marker-number">{{ index + 1 }}</div>
                <div class="marker-line" v-if="index < processSteps.length - 1"></div>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">{{ step.title }}</div>
                <div class="timeline-description">{{ step.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 奖励机制 -->
        <div class="intro-section">
          <div class="section-header">
            <div class="section-icon">🎁</div>
            <h2>奖励机制</h2>
          </div>
          <div class="rewards-grid">
            <div class="reward-card" v-for="(reward, index) in rewards" :key="index">
              <div class="reward-rank">{{ reward.rank }}</div>
              <div class="reward-image-wrapper">
                <img 
                  v-if="reward.image" 
                  :src="reward.image" 
                  :alt="reward.title"
                  class="reward-image"
                  @error="handleImageError"
                />
                <div v-else class="reward-icon">
                  <div class="icon-emoji">{{ reward.icon }}</div>
                </div>
              </div>
              <div class="reward-content">
                <h4>{{ reward.title }}</h4>
                <p>{{ reward.description }}</p>
                <div class="reward-details">{{ reward.details }}</div>
                <div class="reward-amount">
                  <img src="@/assets/images/champion/game/coin.png" alt="" class="coin-icon" />
                  <span>{{ reward.amount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 助威系统 -->
        <div class="intro-section">
          <div class="section-header">
            <div class="section-icon">💰</div>
            <h2>助威系统</h2>
          </div>
          <div class="cheering-content">
            <div class="cheering-intro">
              <h3>助威规则与积分转化</h3>
              <p>玩家可以在比赛开始前支持他们喜欢的队伍，助威金额会转化为队伍的初始积分，帮助队伍在比赛中获得优势。</p>
            </div>
            <div class="cheering-table-wrapper">
              <table class="cheering-table">
                <thead>
                  <tr>
                    <th>比赛阶段</th>
                    <th>助威奖励倍数</th>
                    <th>加成积分比例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(rule, index) in cheeringRules" :key="index">
                    <td class="stage-cell">{{ rule.stage }}</td>
                    <td class="multiplier-cell">X{{ rule.rewardMultiplier }}</td>
                    <td class="percentage-cell">{{ rule.bonusPercentage }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 参赛规则 -->
        <div class="intro-section">
          <div class="section-header">
            <div class="section-icon">📜</div>
            <h2>参赛规则</h2>
          </div>
          <div class="rules-content">
            <div class="rule-item" v-for="(rule, index) in rules" :key="index">
              <div class="rule-number">{{ index + 1 }}</div>
              <div class="rule-text">{{ rule }}</div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="btn-primary" @click="goToChampion">
            <span>立即参赛</span>
          </button>
          <button class="btn-secondary" @click="goBack">
            <span>返回首页</span>
          </button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import Layout from "@/components/Layout.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getMatchInfoApi, getStageCheerConfigListApi, getBoxListApi } from "@/api/champion";

const router = useRouter();

// 比赛配置
const maxTeamSize = 10;
const maxTeamNum = 16;

// 时间配置（从后台获取）
const timeConfig = ref({
  fightDuration: 15,    // 每场对战15分钟
  roundInterval: 10,    // 轮次间隔10分钟
  stageInterval: 30,    // 阶段间隔30分钟
  roundDuration: 1     // 回合时长1分钟
});

// 比赛数据
const matchData = ref({});
const loading = ref(true);

// 助威配置数据
const cheerConfigs = ref([]);

// 宝箱配置数据
const boxConfigs = ref([]);

// 比赛流程步骤
const processSteps = ref([
  {
    title: "报名创建队伍",
    description: "主播在比赛开始前创建队伍，玩家申请加入队伍"
  },
  {
    title: "队伍审核组建", 
    description: "主播审核玩家申请，组建完整的10人队伍"
  },
  {
    title: "小组赛阶段",
    description: "16支队伍分为A、B、C、D四个组，每组4支队伍，两两互相对战，共3个回合"
  },
  {
    title: "8强赛阶段",
    description: "小组赛晋级的8支队伍进行单败淘汰，决出4强"
  },
  {
    title: "4强赛阶段",
    description: "4支队伍进行单败淘汰，决出2支队伍进入决赛"
  },
  {
    title: "决赛阶段",
    description: "最终2支队伍争夺冠军，胜者获得冠军宝箱"
  }
]);

// 奖励机制（从后台获取）
const rewards = ref([]);

// 助威系统规则（从后台获取）
const cheeringRules = ref([]);

// 参赛规则
const rules = ref([
  "每支队伍由10名队员组成，包括1名主播和9名玩家",
  "报名需要缴纳相应的报名费用",
  "小组赛：16支队伍分为A、B、C、D四个组，每组4支队伍",
  "每场对战分为10个回合，系统自动分配队员进行对战",
  "双方选择出金概率（默认50%），成功出金获得积分 = 100 - 选择概率",
  "根据队伍总积分和总胜场数进行排名，晋级淘汰赛",
  "比赛过程中禁止使用外挂等作弊行为",
  "比赛结果以系统判定为准，不得异议"
]);

// 获取比赛信息
const getMatchInfo = async () => {
  try {
    loading.value = true;
    const res = await getMatchInfoApi();
    if (res.code === 200) {
      matchData.value = res.data;
    }
  } catch (error) {
    console.error('获取比赛信息失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取助威配置
const getCheerConfigs = async () => {
  try {
    const res = await getStageCheerConfigListApi();
    console.log('助威配置API响应:', res);
    if (res.code === 200 && res.data) {
      cheerConfigs.value = res.data;
      // 转换数据格式
      cheeringRules.value = res.data.map(config => ({
        stage: getStageName(config.type),
        rewardMultiplier: config.bonusTimes,
        bonusPercentage: config.scoreProportion
      }));
      console.log('转换后的助威规则:', cheeringRules.value);
    } else {
      console.log('助威配置数据为空，使用默认数据');
      // 使用默认数据
      cheeringRules.value = [
        {
          stage: "小组赛阶段",
          rewardMultiplier: "根据助威金额",
          bonusPercentage: "转化为初始积分"
        },
        {
          stage: "8强赛阶段",
          rewardMultiplier: "根据助威金额", 
          bonusPercentage: "转化为初始积分"
        },
        {
          stage: "4强赛阶段",
          rewardMultiplier: "根据助威金额",
          bonusPercentage: "转化为初始积分"
        },
        {
          stage: "决赛阶段",
          rewardMultiplier: "根据助威金额",
          bonusPercentage: "转化为初始积分"
        }
      ];
    }
  } catch (error) {
    console.error('获取助威配置失败:', error);
    // 使用默认数据
    cheeringRules.value = [
      {
        stage: "小组赛阶段",
        rewardMultiplier: "根据助威金额",
        bonusPercentage: "转化为初始积分"
      },
      {
        stage: "8强赛阶段",
        rewardMultiplier: "根据助威金额", 
        bonusPercentage: "转化为初始积分"
      },
      {
        stage: "4强赛阶段",
        rewardMultiplier: "根据助威金额",
        bonusPercentage: "转化为初始积分"
      },
      {
        stage: "决赛阶段",
        rewardMultiplier: "根据助威金额",
        bonusPercentage: "转化为初始积分"
      }
    ];
  }
};

// 获取宝箱配置
const getBoxConfigs = async () => {
  try {
    // 获取所有宝箱，然后过滤夺冠之路相关的
    const res = await getBoxListApi();
    console.log('宝箱配置API响应:', res);
    
    if (res.code === 200 && res.data && res.data.length > 0) {
      // 过滤出夺冠之路相关的宝箱
      const championBoxes = res.data.filter(box => {
        const boxName = box.boxName || box.name || "";
        return boxName.includes("夺冠之路") || 
               boxName.includes("冠军") || 
               boxName.includes("亚军") || 
               boxName.includes("淘汰");
      });
      
      if (championBoxes.length > 0) {
        boxConfigs.value = championBoxes;
        // 转换数据格式
        rewards.value = championBoxes.map(box => ({
          rank: getBoxRank(box.boxName || box.name),
          title: box.boxName || box.name || "未知宝箱",
          description: getBoxDescription(box.boxName || box.name),
          amount: box.price || "丰厚奖励",
          icon: getBoxIcon(box.boxName || box.name),
          image: box.boxImg01 || box.boxImg02 || box.image || null,
          details: box.description || "获得丰厚奖励"
        }));
        console.log('找到夺冠之路相关宝箱:', championBoxes.length, '个');
        console.log('转换后的奖励数据:', rewards.value);
      } else {
        console.log('未找到夺冠之路相关宝箱，使用默认数据');
        useDefaultRewards();
      }
    } else {
      console.log('宝箱配置数据为空，使用默认数据');
      useDefaultRewards();
    }
  } catch (error) {
    console.error('获取宝箱配置失败:', error);
    useDefaultRewards();
  }
};

// 使用默认奖励数据
const useDefaultRewards = () => {
  rewards.value = [
    {
      rank: "冠军",
      title: "冠军宝箱",
      description: "决赛获胜队伍获得",
      amount: "最高奖励",
      icon: "🏆",
      details: "冠军队伍将获得最高荣誉和最丰厚的奖励，包括专属称号、稀有道具等"
    },
    {
      rank: "亚军", 
      title: "亚军宝箱",
      description: "决赛失败队伍获得",
      amount: "次等奖励",
      icon: "🥈",
      details: "亚军队伍获得次等奖励，包括专属道具和称号"
    },
    {
      rank: "淘汰赛",
      title: "淘汰赛宝箱",
      description: "8强、4强阶段队伍获得",
      amount: "基础奖励",
      icon: "🎁",
      details: "进入淘汰赛阶段的队伍都能获得淘汰赛宝箱奖励"
    }
  ];
};

// 获取阶段名称
const getStageName = (type) => {
  const stageNames = {
    1: "小组赛阶段",
    2: "8强赛阶段", 
    3: "4强赛阶段",
    4: "决赛阶段"
  };
  return stageNames[type] || "未知阶段";
};

// 获取宝箱等级
const getBoxRank = (boxName) => {
  if (!boxName) return "参与奖";
  if (boxName.includes("冠军")) return "冠军";
  if (boxName.includes("亚军")) return "亚军";
  if (boxName.includes("淘汰")) return "淘汰赛";
  return "参与奖";
};

// 获取宝箱描述
const getBoxDescription = (boxName) => {
  if (!boxName) return "所有参赛队伍都有奖励";
  if (boxName.includes("冠军")) return "决赛获胜队伍获得";
  if (boxName.includes("亚军")) return "决赛失败队伍获得";
  if (boxName.includes("淘汰")) return "8强、4强阶段队伍获得";
  return "所有参赛队伍都有奖励";
};

// 获取宝箱图标
const getBoxIcon = (boxName) => {
  if (!boxName) return "🎁";
  if (boxName.includes("冠军")) return "🏆";
  if (boxName.includes("亚军")) return "🥈";
  if (boxName.includes("淘汰")) return "🎁";
  return "🎁";
};

// 处理图片加载错误
const handleImageError = (event) => {
  console.log('宝箱图片加载失败:', event.target.src);
  // 隐藏图片，显示默认图标
  event.target.style.display = 'none';
  const wrapper = event.target.parentElement;
  const iconDiv = wrapper.querySelector('.reward-icon');
  if (iconDiv) {
    iconDiv.style.display = 'block';
  }
};

// 跳转到夺冠之路主页面
const goToChampion = () => {
  router.push("/champion");
};

// 返回首页
const goBack = () => {
  router.push("/");
};

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    getMatchInfo(),
    getCheerConfigs(),
    getBoxConfigs()
  ]);
});
</script>

<style scoped lang="scss">
@use "@/style" as *;

.introduction-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
  position: relative;
  padding-top: 80px;
  padding-bottom: 100px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("@/assets/images/champion/bg.webp") no-repeat center center;
    background-size: 100% auto;
    background-attachment: fixed;
    opacity: 0.6;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 70%);
    z-index: 1;
  }
  font-family: "PingFang Medium";
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  
  .title-wrapper {
    text-align: center;
    
    .page-title {
      font-size: 48px;
      font-weight: bold;
      color: #ffffff;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      margin: 0 0 20px 0;
    }
    
    .page-subtitle {
      font-size: 18px;
      color: #d4c7af;
      margin: 0;
    }
  }
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.intro-section {
  margin-bottom: 80px;
  
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 40px;
    
    .section-icon {
      font-size: 32px;
      margin-right: 15px;
    }
    
    h2 {
      font-size: 32px;
      color: #ffffff;
      margin: 0;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
  }
}

.intro-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 30px;
  border: 2px solid rgba(255, 107, 53, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ff6b35, #f7931e);
  }
  
  &:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 107, 53, 0.6);
    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.2);
  }
  
  .card-icon {
    width: 80px;
    height: 80px;
    margin-right: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .icon-emoji {
      font-size: 48px;
      filter: drop-shadow(0 4px 8px rgba(255, 107, 53, 0.3));
    }
  }
  
  .card-content {
    flex: 1;
    
    h3 {
      font-size: 24px;
      color: #ffffff;
      margin: 0 0 15px 0;
    }
    
    p {
      font-size: 16px;
      color: #d4c7af;
      line-height: 1.6;
      margin: 0;
    }
  }
}

.time-schedule {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .time-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
    
    .time-label {
      font-size: 18px;
      font-weight: bold;
      color: #ff6b35;
      min-width: 120px;
    }
    
    .time-value {
      font-size: 16px;
      color: #d4c7af;
      flex: 1;
      text-align: right;
    }
  }
}

.cheering-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .cheering-intro {
    margin-bottom: 30px;
    text-align: center;
    
    h3 {
      font-size: 24px;
      color: #ffffff;
      margin: 0 0 15px 0;
    }
    
    p {
      font-size: 16px;
      color: #d4c7af;
      line-height: 1.6;
      margin: 0;
    }
  }
  
  .cheering-table-wrapper {
    overflow-x: auto;
    border-radius: 15px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(15px);
    border: 2px solid rgba(255, 107, 53, 0.3);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #ff6b35, #f7931e);
    }
  }
  
  .cheering-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
    
    thead {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(247, 147, 30, 0.1));
      
      th {
        padding: 20px 15px;
        text-align: center;
        font-weight: bold;
        color: #ffffff;
        border-bottom: 2px solid rgba(255, 107, 53, 0.5);
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
      }
    }
    
    tbody {
      tr {
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255, 107, 53, 0.1);
          transform: scale(1.02);
        }
        
        &:nth-child(even) {
          background: rgba(255, 255, 255, 0.05);
        }
        
        td {
          padding: 18px 15px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          font-weight: 500;
        }
        
        .stage-cell {
          font-weight: bold;
          color: #ff6b35;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        
        .multiplier-cell {
          color: #ffffff;
          font-weight: bold;
        }
        
        .percentage-cell {
          color: #ffffff;
          font-weight: bold;
        }
      }
    }
  }
}

.process-timeline {
  position: relative;
  padding: 20px 0;
  
  &::before {
    content: '';
    position: absolute;
    left: 30px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #ff6b35, #f7931e);
    border-radius: 1px;
  }
  
  .timeline-item {
    position: relative;
    display: flex;
    align-items: flex-start;
    margin-bottom: 40px;
    padding-left: 80px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .timeline-marker {
      position: absolute;
      left: 0;
      top: 0;
      
      .marker-number {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #ff6b35, #f7931e);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: bold;
        color: #ffffff;
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
        border: 3px solid rgba(255, 255, 255, 0.2);
        z-index: 2;
        position: relative;
      }
      
      .marker-line {
        position: absolute;
        left: 30px;
        top: 60px;
        width: 2px;
        height: 40px;
        background: linear-gradient(to bottom, #ff6b35, #f7931e);
        z-index: 1;
      }
    }
    
    .timeline-content {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 25px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      flex: 1;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(255, 107, 53, 0.2);
      }
      
      .timeline-title {
        font-size: 20px;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 10px;
      }
      
      .timeline-description {
        font-size: 16px;
        color: #d4c7af;
        line-height: 1.6;
      }
    }
  }
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  
  .reward-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(15px);
    border-radius: 20px;
    padding: 30px;
    text-align: center;
    border: 2px solid rgba(255, 107, 53, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #ff6b35, #f7931e);
    }
    
    &:hover {
      transform: translateY(-5px);
      border-color: rgba(255, 107, 53, 0.6);
      box-shadow: 0 10px 30px rgba(255, 107, 53, 0.2);
    }
    
    .reward-rank {
      font-size: 20px;
      font-weight: bold;
      color: #ff6b35;
      margin-bottom: 15px;
    }
    
    .reward-image-wrapper {
      margin-bottom: 20px;
      position: relative;
      
      .reward-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 15px;
        border: 3px solid rgba(255, 107, 53, 0.3);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
        }
      }
      
      .reward-icon {
        width: 60px;
        height: 60px;
        margin: 0 auto;
        display: none; // 默认隐藏，当图片加载失败时显示
        align-items: center;
        justify-content: center;
        
        .icon-emoji {
          font-size: 40px;
        }
      }
    }
    
    .reward-content {
      h4 {
        font-size: 18px;
        color: #ffffff;
        margin: 0 0 10px 0;
      }
      
      p {
        font-size: 14px;
        color: #d4c7af;
        line-height: 1.4;
        margin: 0 0 10px 0;
      }
      
      .reward-details {
        font-size: 12px;
        color: #b0b0b0;
        line-height: 1.3;
        margin: 0 0 15px 0;
        font-style: italic;
      }
      
      .reward-amount {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 16px;
        font-weight: bold;
        color: #ffd700;
        
        .coin-icon {
          width: 20px;
          height: 20px;
        }
      }
    }
  }
}

.rules-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  .rule-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .rule-number {
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: #ffffff;
      margin-right: 20px;
      flex-shrink: 0;
    }
    
    .rule-text {
      font-size: 16px;
      color: #d4c7af;
      line-height: 1.6;
      flex: 1;
    }
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 60px;
  
  .btn-primary, .btn-secondary {
    position: relative;
    padding: 15px 40px;
    border: none;
    border-radius: 25px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 160px;
    
    span {
      position: relative;
      z-index: 2;
    }
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.6);
    }
  }
  
  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
    border: 2px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .introduction-container {
    padding-top: 60px;
    padding-bottom: 60px;
  }
  
  .page-header {
    margin-bottom: 40px;
    
    .title-wrapper {
      .title-bg {
        width: 300px;
      }
      
      .page-title {
        font-size: 36px;
      }
      
      .page-subtitle {
        font-size: 16px;
      }
    }
  }
  
  .intro-section {
    margin-bottom: 50px;
    
    .section-header {
      h2 {
        font-size: 24px;
      }
    }
  }
  
  .intro-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
    
    .card-icon {
      margin-right: 0;
      margin-bottom: 20px;
    }
  }
  
  .process-steps {
    flex-direction: column;
    
    .step-item {
      .step-arrow {
        display: none;
      }
    }
  }
  
  .rewards-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
}
</style>
