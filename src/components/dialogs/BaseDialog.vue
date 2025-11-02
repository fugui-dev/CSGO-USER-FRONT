<script setup>
import {ref} from "vue";
import {requireImg} from "@/utils/common";
import BaseButton from "@/components/Btn/BaseButton.vue";

const showCancel = defineModel("showCancel", {default: false})
const showConfirm = defineModel("showConfirm", {default: false})
const title = defineModel("title", {default: '标题'})
const visible = ref(false)
const emit = defineEmits(['confirm', 'cancel'])

const open = () => {
  visible.value = true
}
const close = () => {
  visible.value = false
}
const onConfirm = () => {
  emit('confirm')
}
const onCancel = () => {
  close()
  emit('cancel')
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
      '--bg':requireImg('/dialog/bg2.png',true),
      '--base-title':requireImg('/dialog/bg_base_title.png',true),
      }"
    >
      <div class="dialog-container">
        <div class="close" @click="close"></div>
        <div class="title">
          <div class="txt">
            <slot name="title">{{title}}</slot>
          </div>
        </div>
        <div class="content">
          <slot name="default">
            <div style="display: flex;flex-direction: column">
              <div v-for="i in 1">内容</div>
            </div>
          </slot>

        </div>
        <div class="buttons">
          <BaseButton :is-green="true" name="取消" @click="onCancel" v-if="showCancel" style="margin-right: 10px"></BaseButton>
          <BaseButton name="确定" @click="onConfirm" v-if="showConfirm"></BaseButton>
        </div>

      </div>
    </van-popup>
  </div>

</template>

<style scoped lang="scss">
@use "@/style" as *;

.dialog {
  background: url('@/assets/images/user/dialog_bg.png') no-repeat;
  background-size: 100% 100%;
  width: 100%;
  max-width: 858px;
  padding: 32px;
  min-height: 456px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  z-index: 99;
  @include mobile {
    padding: 50px 60px;
  }

  .close {
    position: absolute;
    width: 52px;
    height: 128px;
    top: 10px;
    right: 26px;
    cursor: pointer;
    background: url('@/assets/images/user/close_btn.png') no-repeat;
    background-size: cover;
  }

  &-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    height: 100%;

    .title {
      width:90%;
      height: 30px;
      margin: 30px auto 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      .txt{
        margin: 0 16px;
        color: #1D1F22;
        font-size: 20px;
      }

    }

    .content {
      width: 100%;
      flex: 1;
      overflow: auto;
      padding: 40px 60px;
    }

    .buttons {
      display: flex;
      width: 80%;
      margin: 60px auto 32px;
      justify-content: space-evenly;
    }

  }
}
</style>
