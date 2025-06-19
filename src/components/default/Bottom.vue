<script setup>

</script>

<template>
  <div class="bottom">
    <div class="bottom-container">
      <p>用户协议 | 隐私政策 | 常见问题 | 关于我们 | 概率公平性 | 反洗钱协议 | 平台公证</p>
      <p>备案号： <a href="https://beian.miit.gov.cn/" rel="nofollow">
        蜀ICP备2023010139号-1
      </a>
      </p>
      <p>川公网安备51010702003452号</p>
      <p>成都蜂巢思维网络科技有限公司 © 2023</p>

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

}
</style>
