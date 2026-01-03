<template>
  <Layout>
    <div class="agreement-container">
      <div class="agreement-content">
        <h1 class="agreement-title">关于我们</h1>
        
        <div class="agreement-section">
          <h2>1. 您的虚拟道具专家</h2>
          <p>在广阔的 Steam 游戏世界中，bibicsgo 致力于成为您游戏旅程中的可靠伙伴。我们专注于虚拟道具的销售，助您解锁更丰富的游戏体验，开启更多精彩可能。</p>
        </div>

        <div class="agreement-section">
          <h2>2. 便捷提取，轻松拥有</h2>
          <p>通过bibicsgo提取您的虚拟道具，操作简单快捷。登录个人账户→选择饰品→点击"取回"，即可发起提取，提取前请确保您的steam账号正常状态。</p>
        </div>

        <div class="agreement-section">
          <h2>3. 账户余额，理性消费</h2>
          <p>请注意，bibicsgo账户余额仅限于平台内使用，不支持提现、购买实物商品或转赠他人。我们倡导理性消费，建议您合理规划预算，享受健康安心的游戏生活。</p>
        </div>

        <div class="agreement-section">
          <h2>4. 自动化交易，安全无忧</h2>
          <p>所有虚拟道具的提取均通过Steam机器人自动完成，高效且安全。若遇到他人向您推销、回收游戏币等行为，请勿轻信，并及时向我们反馈。</p>
        </div>

        <div class="agreement-section">
          <h2>5. 规范社区行为，共建健康环境</h2>
          <p>bibicsgo严禁传播违法、违规及不良信息，我们平台上所有的互动功能旨在提升游戏乐趣、丰富休闲体验。请勿沉迷，并坚决抵制利用互动活动进行赌博、欺诈、作弊、刷积分等行为。违规者将予以封禁处理。</p>
        </div>

        <div class="agreement-section">
          <h2>6. 提高警惕，防范风险</h2>
          <p>请勿相信任何诱导充值或私下交易的行为，保护个人财产与信息安全。bibicsgo始终致力于营造安全、可靠、健康的社区环境。</p>
        </div>

        <div class="agreement-section highlight-section">
          <p class="highlight-text">加入bibicsgo，开启更便捷、更安全的虚拟道具交易之旅，为热爱赋能！</p>
        </div>

        <div class="agreement-footer">
          <button class="back-button" @click="goBack">返回</button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import Layout from "@/components/Layout.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<style scoped lang="scss">
@use "@/style" as *;

.agreement-container {
  min-height: 100vh;
  padding: 40px 20px;
  position: relative;
  
  // 添加背景层，覆盖整个内容区域
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('@/assets/images/upgrade/lucky_bg.webp');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: -2;
  }
  
  @include mobile {
    padding: 20px 10px;
    
    &::before {
      background-attachment: scroll;
    }
  }
}

.agreement-content {
  max-width: 1000px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #d4c7af;
  line-height: 1.8;
  font-size: 16px;
  
  @include mobile {
    padding: 20px;
    font-size: 14px;
  }
}

.agreement-title {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  
  @include mobile {
    font-size: 24px;
    margin-bottom: 20px;
  }
}

.agreement-section {
  margin-bottom: 40px;
  
  h2 {
    font-size: 24px;
    font-weight: bold;
    color: #ff6b35;
    margin: 30px 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(255, 107, 53, 0.3);
    
    @include mobile {
      font-size: 20px;
      margin: 20px 0 15px 0;
    }
  }
  
  p {
    margin-bottom: 15px;
    text-align: justify;
    
    strong {
      color: #ff6b35;
      font-weight: bold;
    }
  }
  
  &.highlight-section {
    text-align: center;
    padding: 30px;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 15px;
    border: 2px solid rgba(255, 107, 53, 0.3);
    
    .highlight-text {
      font-size: 20px;
      font-weight: bold;
      color: #ffd700;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
      margin: 0;
      
      @include mobile {
        font-size: 18px;
      }
    }
  }
}

.agreement-footer {
  text-align: center;
  margin-top: 50px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  .back-button {
    padding: 12px 40px;
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    color: #ffffff;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.6);
    }
    
    @include mobile {
      padding: 10px 30px;
      font-size: 14px;
    }
  }
}
</style>

