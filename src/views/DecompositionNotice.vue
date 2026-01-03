<template>
  <Layout>
    <div class="agreement-container">
      <div class="agreement-content">
        <h1 class="agreement-title">申请分解通知</h1>
        
        <div class="agreement-intro">
          <p>为了给予使用者更好的娱乐体验和更新颖的开箱体验，对使用者在本平台透过开箱获取的饰品道具提供分解服务。用户可选择将开箱所得的饰品道具向本平台申请分解，经本平台审核同意后将获得相对应的Y币。若您选择向本平台申请分解饰品道具的，则您须知悉并同意以下事项：</p>
        </div>

        <div class="agreement-section">
          <h2>1、分解申请流程</h2>
          <p>本平台不主动分解或发送信息提醒您分解，若您确需分解的，需您主动向本平台进行分解申请，并经本平台审核同意。</p>
        </div>

        <div class="agreement-section">
          <h2>2、B币使用说明</h2>
          <p>本平台仅提供与饰品分解价值相对应的B币，所获得的B币也仅能用于本平台的开箱、竟技场等娱乐体验，不能兑换为任何法定货币、现金、财物（包括但不限于人民币），也无法透过第三方平台进行交易或变相兑换。</p>
        </div>

        <div class="agreement-section">
          <h2>3、B币价值说明</h2>
          <p>饰品分解获得的B币与您充值获得的B币具有同等的价值。</p>
        </div>

        <div class="agreement-section highlight-section">
          <p class="highlight-text">饰品来之不易，在申请分解前请多加思虑您是否需要分解哦！</p>
          <p class="highlight-subtext">消费需理性，消遣作乐！</p>
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

.agreement-intro {
  margin-bottom: 30px;
  
  p {
    margin-bottom: 15px;
    text-align: justify;
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
      margin: 0 0 15px 0;
      
      @include mobile {
        font-size: 18px;
      }
    }
    
    .highlight-subtext {
      font-size: 18px;
      font-weight: bold;
      color: #ff6b35;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      margin: 0;
      
      @include mobile {
        font-size: 16px;
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

