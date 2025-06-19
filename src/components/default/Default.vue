<script setup>
import {useRoute, useRouter} from "vue-router";
import Top from "./Top.vue";
import BottomNav from "@/components/default/BottomNav.vue";
import {useStore} from "@/store";

const store=useStore()
const router=useRouter()
const route=useRoute()

</script>

<template>
  <div class="main">
    <div class="main-app">
      <router-view class="main-container"/>
    </div>

  </div>
</template>

<style scoped lang="scss">
.main{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  &-app{
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

  }
  &-container{
    flex:1;
    width:100%;
  }
  .el-scrollbar{
    flex: 1;
    width:100%;
    :deep(.el-scrollbar__view){
      height: 100%;
      display: flex;
      flex-direction: column;
      width: 100%;

    }
    :deep(.el-scrollbar__thumb){
      background-color: #fff;
      opacity: .8;
    }
  }
}
</style>
