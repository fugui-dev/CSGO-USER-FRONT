<script setup>
import {ref} from "vue";
import {requireImg} from "@/utils/common";

const showCancel = defineModel("showCancel", {default: false})
const showConfirm = defineModel("showConfirm", {default: false})
const title = defineModel("title", {default: '标题'})
const visible = ref(false)
const emit = defineEmits(['confirm'])

const open = () => {
  visible.value = true
}
const close = () => {
  visible.value = false
}
const onConfirm = () => {
  emit('confirm')
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <div>
    <van-popup class="dialog" v-model:show="visible" teleport="body"
               :style="{
               '--bg-img':requireImg('/dialog/bg_base.png',true),
               '--base-close':requireImg('/dialog/base_close.png',true),
               '--base-title':requireImg('/dialog/bg_base_title.png',true),

    }">
      <div class="dialog-container">
        <div class="close" @click="close"></div>
        <div class="title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div class="content">
          <slot name="default">
            <div style="display: flex;flex-direction: column">
              <div v-for="i in 1">内容</div>
            </div>
          </slot>

        </div>
        <div class="buttons">
          <el-button type="info" plain @click="close" v-if="showCancel">取消</el-button>
          <el-button type="warning" @click="onConfirm" v-if="showConfirm">确定</el-button>
        </div>

      </div>
    </van-popup>
  </div>

</template>

<style scoped lang="scss">
@use "@/style" as *;

.dialog {
  color: white;
  background: none;
  background-image: var(--bg-img);
  background-size: 100% 100%;
  width: 100%;
  height: 100%;
  max-width: 800px;
  padding: 60px 80px;
  min-height: 500px;
  max-height: 50vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  @include mobile {
    padding: 50px 60px;
  }

  .close {
    position: absolute;
    width: 40px;
    height: 40px;
    top: 20px;
    right: 20px;
    background-image: var(--base-close);
    background-size: 100% 100%;
    cursor: pointer;

  }

  &-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    height: 100%;

    .title {
      height: 80px;
      padding: 10px 30px;
      background-image: var(--base-title);
      background-size: 100% 100%;
      width: fit-content;
      margin: 0 auto;
      color: black;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      flex-shrink: 0;
      margin-bottom: 10px;
    }

    .content {
      width: 100%;
      flex: 1;
      overflow: auto;
    }

    .buttons {
      display: flex;
      width: 80%;
      margin: 20px auto 30px;
      justify-content: space-evenly;

      .el-button {
        width: 50%;
        height: 40px;
      }
    }

  }
}
</style>
