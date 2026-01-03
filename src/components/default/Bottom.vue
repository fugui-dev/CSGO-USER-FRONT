<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToAgreement = () => {
  router.push("/user-agreement");
};

const goToPrivacy = () => {
  router.push("/privacy-agreement");
};

const goToFAQ = () => {
  router.push("/faq");
};

const goToAboutUs = () => {
  router.push("/about-us");
};

const goToProbabilityFairness = () => {
  router.push("/probability-fairness");
};

const goToAntiMoneyLaundering = () => {
  router.push("/anti-money-laundering");
};

const goToDecompositionNotice = () => {
  router.push("/decomposition-notice");
};
</script>

<template>
  <div class="bottom">
    <div class="bottom-container">
      <p>
        <span class="link" @click="goToAgreement">用户协议</span> | 
        <span class="link" @click="goToPrivacy">隐私政策</span> | 
        <span class="link" @click="goToFAQ">常见问题</span> | 
        <span class="link" @click="goToAboutUs">关于我们</span> | 
        <span class="link" @click="goToProbabilityFairness">概率公平性</span> | 
        <span class="link" @click="goToAntiMoneyLaundering">反洗钱协议</span> | 
        <span class="link" @click="goToDecompositionNotice">申请分解通知</span>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;
.bottom {
  margin-top: 20px;
  height: fit-content;
  width: 100%;
  flex-shrink: 0;
  color: #FFFFFF66;
  z-index: 2;
  font-size: 14px;
  padding: 0 10px;
  margin-bottom: 80px;
  line-height: 2em;
  @include mobile{
    font-size: 12px;
  }
  &-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .link {
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.3s ease;
    
    &:hover {
      color: #FFFFFF;
    }
  }

}
</style>
