<template>
  <Layout>
    <div class="agreement-container">
      <div class="agreement-content">
        <h1 class="agreement-title">反洗钱协议</h1>
        
        <div class="agreement-section">
          <h2>1. 法律合规</h2>
          <p>您在使用bibicsgo服务时，必须严格遵守《中华人民共和国反洗钱法》及其他相关法律法规，确保所有消费及交易行为均基于完全合法且可溯源的资金来源，并承担资金来源合法性证明责任，bibicsgo的核查行为不视为对资金合法性的认可，平台不承担资金合法性审查义务。用户承诺不参与任何违反反洗钱法规的行为。</p>
        </div>

        <div class="agreement-section">
          <h2>2. 平台义务与权利</h2>
          <p>为履行反洗钱义务，bibicsgo在其单方判断存在洗钱等非法行为风险时，有权向相关政府部门报告，并可要求用户在收到bibicsgo书面通知后24小时内无条件配合提交真实、有效的身份信息、身份证件彩色复印件或影印件，以供核查。</p>
        </div>

        <div class="agreement-section">
          <h2>3. 信息提供与账号限制</h2>
          <p>若您未能或拒绝提供根据bibicsgo合理判断认为的必要信息，bibicsgo有权对您的账号采取限制措施，包括但不限于暂停部分或全部功能、冻结账户内虚拟财产等，直至用户按照平台要求的期限及方式提供完整信息，并经bibicsgo单方评估确认相关风险完全消除且用户完成整改措施且无后续风险传导可能。我们致力于维护平台的合法性和安全性。</p>
        </div>

        <div class="agreement-section">
          <h2>4. 法律适用与争议解决</h2>
          <p>本条款与《用户协议》签订地为四川省成都市成华区，适用中国大陆地区法律。如遇争议，双方应优先通过友好协商解决；协商不成的，任何一方均有权将争议提交至签订地有管辖权的人民法院通过诉讼解决。</p>
        </div>

        <div class="agreement-section">
          <h2>5. 条款效力与解释</h2>
          <p>《用户协议》的标题仅为阅读便利，不具备解释效力。部分条款无效不影响其余条款效力。未尽事宜，以《用户协议》相关规定为准。</p>
        </div>

        <div class="agreement-section">
          <h2>6. 用户同意与咨询</h2>
          <p>使用bibicsgo服务视为已充分阅读、理解并同意接受本反洗钱条款的全部内容。如您有任何疑问，请及时联系我们的客服团队获取协助，但咨询行为不构成对协议效力的质疑或否定。</p>
        </div>

        <div class="agreement-section">
          <h2>违约责任</h2>
          <p>若用户违反本协议任何约定，应当赔偿bibicsgo因此遭受的全部损失（包括但不限于直接损失、间接损失、商誉损失及因此产生的诉讼费、仲裁费、律师费、保全费、保全保险费及差旅费等全部费用），且该等赔偿责任不设上限。</p>
        </div>

        <div class="agreement-section highlight-section">
          <p class="highlight-text">bibicsgo致力于为用户提供安全、合法的交易环境。感谢您的理解与支持！</p>
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

