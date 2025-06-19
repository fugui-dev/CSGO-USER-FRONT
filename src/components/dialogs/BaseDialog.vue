<script setup>
import {ref} from "vue";
import {requireImg} from "@/utils/common";
import BaseButton from "@/components/Btn/BaseButton.vue";

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
      '--bg':requireImg('/dialog/bg2.png',true),
      '--base-close':requireImg('/dialog/base_close.png',true),
      '--base-title':requireImg('/dialog/bg_base_title.png',true),
      }"
    >
      <div class="dialog-container">
        <div class="close" @click="close">x</div>
        <div class="title">
          <div class="line"></div>
          <div class="txt">
            <slot name="title">{{title}}</slot>
          </div>

          <div class="line"></div>
        </div>
        <div class="content">
          <slot name="default">
            <div style="display: flex;flex-direction: column">
              <div v-for="i in 1">内容</div>
            </div>
          </slot>

        </div>
        <div class="buttons">
          <BaseButton :is-gold-color="true" name="取消" @click="onConfirm" v-if="showCancel" style="margin-right: 10px"></BaseButton>
          <BaseButton name="确定" @click="onConfirm" v-if="showConfirm"></BaseButton>
        </div>

      </div>
    </van-popup>
  </div>

</template>

<style scoped lang="scss">
@use "@/style" as *;

.dialog {
  color: white;
  background-size: 100% 100%;
  width: 100%;
  background: #4A1D13;

  max-width: 662px;
  padding: 32px;
  min-height: 267px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  @include mobile {
    padding: 50px 60px;
  }

  .close {
    position: absolute;
    width: 40px;
    height: 40px;
    top: 20px;
    right: 0;
    cursor: pointer;
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
      margin: 10px auto 32px;
      display: flex;
      align-items: center;
      .line{
        flex:1;
        height: 8px;
        background: linear-gradient(90deg, rgba(141, 43, 30, 0) 0%, #F34A34 100%);

        &:last-child{
          background: linear-gradient(90deg, #F34A34 0%, rgba(141, 43, 30, 0) 100%);
        }
      }
      .txt{
        margin: 0 16px;
        color: #FFF5F5;

      }

    }

    .content {
      width: 100%;
      flex: 1;
      overflow: auto;
    }

    .buttons {
      display: flex;
      width: 80%;
      margin: 40px auto 32px;
      justify-content: space-evenly;
    }

  }
}
</style>
