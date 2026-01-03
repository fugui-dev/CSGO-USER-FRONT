<template>
  <Layout>
    <div class="agreement-container">
      <div class="agreement-content">
        <h1 class="agreement-title">技术支持与常见问题指南</h1>
        
        <div class="agreement-section">
          <h2>一、问题反馈与客服支持</h2>
          <p>如您在使用过程中遇到任何问题，可通过官网首页【联系客服】入口联系我们的支持团队。我们承诺在12小时内予以响应。为提升处理效率，请提供以下信息：</p>
          <ol>
            <li>bibicsgo账户ID（必填）</li>
            <li>问题内容及截图</li>
            <li>异常现象描述</li>
          </ol>
          <p><strong>提示：</strong>提供完整信息将有助于加快问题的处理进度，建议您提前准备好相关材料。</p>
        </div>

        <div class="agreement-section">
          <h2>二、新用户快速上手指南</h2>
          
          <h3>1）登录异常？试试这样解决</h3>
          <p>若您在登录bibicsgo时遇到"无法访问网站"或"登录异常"的提示，请尝试以下解决方案：</p>
          <ol>
            <li>联系客服核实账户状态</li>
            <li>切换至Chrome浏览器以提升兼容性</li>
          </ol>

          <h3>2）交易限制？新用户须知</h3>
          <ol>
            <li>请注意！Steam对新账号设有7天交易冷却期。</li>
            <li>具体解除方法请参阅<a href="https://www.67tool.com/work/markdown" target="_blank" rel="noopener noreferrer">https://www.67tool.com/work/markdown</a>。</li>
          </ol>
        </div>

        <div class="agreement-section">
          <h2>三、道具提取流程说明</h2>
          
          <h3>1）自动发货说明</h3>
          <ol>
            <li>在个人中心仓库界面点击【提取】发起提取，系统将自动匹配机器人发货。</li>
            <li>预计将在1-8天内发放至您的库存（受Steam交易规则限制）。</li>
            <li>如无法接受等待，请您谨慎操作。</li>
          </ol>

          <h3>2）提取失败常见原因</h3>
          <p>若交易报价未通过，可能是由于以下情况：</p>
          <ol>
            <li>账号交易权限受限</li>
            <li>Steam库存可见性未设置为"公开"</li>
            <li>交易链接与账号绑定不一致</li>
            <li>机器人系统临时异常（请联系客服协助处理）</li>
          </ol>

          <h3>3）隐私设置调整</h3>
          <ol>
            <li>请将Steam库存可见性设置为"公开"：</li>
            <li>bibicsgo账户设置里绑定交易链接</li>
          </ol>

          <h3>4）状态与费用说明</h3>
          <ol>
            <li><strong>"提取中"：</strong>机器人已收到请求，处理时间最长不超过12小时</li>
            <li>如拒绝或还价：需重新发起交易，并可能触发风控审核流程</li>
            <li><strong>费用说明：</strong>所有提取服务零手续费</li>
          </ol>

          <h3>5）交易撤销说明</h3>
          <p>由于Steam平台的账号资产安全保护机制，允许用户对7日内处于保护状态的报价进行交易撤销。请注意：撤销交易将导致撤销方的Steam平台账号封禁交易30天。</p>
          <ol>
            <li>若您提货后7日内因交易对方撤回导致提货失败，请及时联系客服，我们将在核实情况后为您补发饰品，确保您的权益不受损失；</li>
            <li>交易双方均具备撤销权限，平台不建议用户在饰品成功提取到Steam库存后主动撤销交易，若您主动撤销交易，将视为自愿放弃该饰品，平台不予任何补偿。</li>
          </ol>
        </div>

        <div class="agreement-section">
          <h2>四、账户安全与使用规范</h2>
          
          <h3>1）交易链接使用</h3>
          <p>请使用本人交易链接进行操作，避免多个账号同时使用同一个交易链接，否则可能造成财产损失。为保障您的资产安全，建议尽快完成实名认证。</p>

          <h3>2）账号封禁情形</h3>
          <p>您的账号在以下情况可能会被限制使用：</p>
          <ol>
            <li>违反平台服务条款</li>
            <li>账号异常登录或交易</li>
            <li>对客服人员使用不当言辞</li>
          </ol>

          <h3>3）解封申诉</h3>
          <p>如对账号处理有异议，请您提供完整的交易记录与账号信息，我们将于24小时内为您复核并反馈。</p>
        </div>

        <div class="agreement-section">
          <h2>五、支付与收益管理</h2>
          
          <h3>1）充值操作</h3>
          <ol>
            <li>进入个人中心→点击【充值】，支持主流支付方式。</li>
            <li>如款项未及时到账请耐心等待5-10分钟，如若超时请联系客服并提供支付凭证，我们将协助您核查。</li>
          </ol>
        </div>

        <div class="agreement-section">
          <h2>六、安全警示：官方不会主动联系您</h2>
          
          <h3>反诈骗声明</h3>
          <ol>
            <li>官方人员绝不会通过Steam主动添加您为好友</li>
            <li>绝不会像您索要任何交易链接或皮肤</li>
            <li>绝不会以"审核"为由要求您进行转账或支付</li>
          </ol>
          <p><strong>如果您收到可疑联系：</strong></p>
          <p>收到可疑好友申请请立即举报，保护个人资产安全！</p>
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
  
  a {
    color: #ff6b35;
    text-decoration: underline;
    
    &:hover {
      color: #f7931e;
    }
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
  
  h3 {
    font-size: 20px;
    font-weight: bold;
    color: #ffffff;
    margin: 25px 0 15px 0;
    
    @include mobile {
      font-size: 18px;
      margin: 20px 0 12px 0;
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
  
  ol, ul {
    margin: 15px 0;
    padding-left: 30px;
    
    li {
      margin-bottom: 12px;
      text-align: justify;
      
      ol, ul {
        margin-top: 10px;
        margin-bottom: 10px;
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

