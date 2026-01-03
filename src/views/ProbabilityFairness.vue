<template>
  <Layout>
    <div class="agreement-container">
      <div class="agreement-content">
        <h1 class="agreement-title">概率公平性</h1>
        
        <div class="agreement-intro">
          <p>在 bibicsgo，每一次开箱不仅仅是点击的一瞬间，而是一场公平与惊喜的博弈。为了让每位玩家都能体验到真正的随机与刺激，我们引入了独特的 mt_round() 概率算法。不同于传统的"四舍五入"，mt_round() 将小数概率 + 随机性融合在一起，让结果在长期分布上保持均衡，同时又能给玩家带来更多意想不到的惊喜。</p>
        </div>

        <div class="agreement-section">
          <h2>一、核心原理</h2>
          <p>mt_round() 的运作流程，可以简单理解为以下几个步骤：</p>
          
          <h3>1. 权重评估</h3>
          <p>每件物品根据品质分配一个权重值：</p>
          <ul class="weight-list">
            <li><strong>A（高品质）</strong> = 1</li>
            <li><strong>B（中品质）</strong> = 3</li>
            <li><strong>C（低品质）</strong> = 5</li>
          </ul>

          <h3>2. 总权重计算</h3>
          <p>将所有物品的权重相加，得到总权重（如示例中的1 + 3 + 5 = 9）。</p>

          <h3>3. 随机映射</h3>
          <p>系统生成一个1-9的随机数，并根据权重区间映射到对应物品：</p>
          <ul class="mapping-list">
            <li>随机数在<strong>1以内</strong> → 选中A</li>
            <li>随机数在<strong>2-4之间</strong> → 选中B</li>
            <li>随机数在<strong>5-9之间</strong> → 选中C</li>
          </ul>

          <h3>4. 均衡调整</h3>
          <p>mt_round() 方法通过"概率性舍入"，进一步优化选择结果，确保长时间内的分配公平性。</p>
        </div>

        <div class="agreement-section">
          <h2>二、示例说明</h2>
          <p>假设盲盒内包含三种物品：</p>
          <div class="example-box">
            <div class="example-item">
              <strong>A（高品质）：</strong>权重1
            </div>
            <div class="example-item">
              <strong>B（中品质）：</strong>权重3
            </div>
            <div class="example-item">
              <strong>C（低品质）：</strong>权重5
            </div>
            <div class="example-total">
              <strong>总权重：</strong>1 + 3 + 5 = 9
            </div>
          </div>
          <p>当随机数生成后：</p>
          <ul class="result-list">
            <li><strong>1以内</strong> → A被选中</li>
            <li><strong>2-4之间</strong> → B被选中</li>
            <li><strong>5-9之间</strong> → C被选中</li>
          </ul>
          <p>通过mt_round() 方法的调整，即使在大量开箱后，用户仍能体验到均衡的物品分配，避免单一结果的偏向性。</p>
        </div>

        <div class="agreement-section">
          <h2>三、公平保障</h2>
          <p class="commitment-title">bibicsgo 承诺：</p>
          <ul class="commitment-list">
            <li>每一次开箱，都是独立且公正的随机事件；</li>
            <li>不存在任何暗箱操作或不公平因素；</li>
            <li>所有玩家都能享受到 同等的机会。</li>
          </ul>
        </div>

        <div class="agreement-section highlight-section">
          <p class="highlight-text">体验未知，享受惊喜 —— bibicsgo，让您的每一次开箱都心跳加速！</p>
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
  
  .weight-list,
  .mapping-list,
  .result-list,
  .commitment-list {
    margin: 15px 0;
    padding-left: 30px;
    
    li {
      margin-bottom: 12px;
      text-align: justify;
      
      strong {
        color: #ffd700;
        font-weight: bold;
      }
    }
  }
  
  .example-box {
    background: rgba(255, 107, 53, 0.1);
    border: 1px solid rgba(255, 107, 53, 0.3);
    border-radius: 10px;
    padding: 20px;
    margin: 20px 0;
    
    .example-item {
      margin-bottom: 10px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      &:last-of-type {
        border-bottom: none;
      }
      
      strong {
        color: #ffd700;
      }
    }
    
    .example-total {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid rgba(255, 107, 53, 0.5);
      font-size: 18px;
      
      strong {
        color: #ff6b35;
      }
    }
  }
  
  .commitment-title {
    font-size: 18px;
    font-weight: bold;
    color: #ff6b35;
    margin-bottom: 15px;
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

