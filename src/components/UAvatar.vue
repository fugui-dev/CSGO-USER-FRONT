<script setup>
import {Plus} from "@element-plus/icons-vue";

const props=defineProps({
  src:{
    type:String,
    default:'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  },
  size:{
    type:[String,Number],
    default:'60'
  },
  blank:{
    type:Boolean,
    default:false
  }
})
</script>

<template>
  <div class="u-avatar" :style="{'--s':size.indexOf('px')===-1?size+'px':size}">
<!--    <img :src="src" alt="">-->
    <el-image style="border-radius: 50%" v-if="!blank" :src="src" alt=""></el-image>
    <div v-else class="need_join">
      <el-icon size="25" color="#fff">
        <Plus/>
      </el-icon>
    </div>
  </div>

</template>

<style scoped lang="scss">
.u-avatar{
  width: var(--s);
  height: var(--s);
  //background:url("/main/u-avatar-bg.png");
  //background-size:100% 100%;
  border-radius:50%;
  overflow:hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  outline-width:0 !important;;
  .el-image{
    width:77%;
    height:77%;
  }
  .need_join{
    width:77%;
    height:77%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(24,25,35);
    border-radius: 50%;
  }

}
</style>
