<script setup>
import { ref, defineEmits } from "vue";
import { requireImg } from "@/utils/common";
import { ElMessage } from "element-plus";
import SecondCountdown from "./SecondCountdown.vue";

const props = defineProps({
  startSecond: {
    type: Number,
  },
});

const emit = defineEmits(["choose", "close"]);
const visible = ref(false);
const chooseOddsForm = ref({
  probabilitySelect: 1,
});

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
  chooseOddsForm.value = {
    probabilitySelect: 0,
  };
  emit("close");
};

const closeModal = () => {
  visible.value = false;
  chooseOddsForm.value = {
    probabilitySelect: 0,
  };
};

const chooseOddsFormSubmit = () => {
  emit("choose", chooseOddsForm.value.probabilitySelect);
  close();
};

// 倒计时结束，关闭选择弹窗
const handleCountdownEnd = () => {
  close();
};

defineExpose({
  open,
  close,
});
</script>
<template>
  <el-dialog
    v-model="visible"
    width="1163"
    :show-close="false"
    align-center
    style="--el-dialog-bg-color: transparent"
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="choose-odds-wrapper">
      <div class="close-click" @click="closeModal" />
      <div class="title">选择概率</div>
      <!-- 倒计时 -->
      <SecondCountdown :start-second="startSecond" @end="handleCountdownEnd" />
      <div class="select">请选择</div>
      <el-slider
        class="slider"
        v-model="chooseOddsForm.probabilitySelect"
        height="18px"
        :step="1"
        :min="1"
        :max="100"
      />
      <div class="slider-percent tw-flex tw-items-center tw-justify-between">
        <div>1%</div>
        <div>50%</div>
        <div>100%</div>
      </div>
      <div class="selected-text">
        已选择
        <span class="selected">{{ chooseOddsForm.probabilitySelect }}%</span>
      </div>
      <div @click="chooseOddsFormSubmit" class="submit-btn">确定</div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
@use "@/style" as *;
.choose-odds-wrapper {
  height: 628px;
  background: url("@/assets/images/match/cheer-bg.webp") no-repeat;
  background-size: 100% 100%;
  position: relative;
  line-height: normal;
  font-family: "PingFang Medium";
  font-weight: 500;
  font-size: 28px;
  color: #1d1f22;
  overflow: hidden;
  margin-top: 30px;
  line-height: normal;
  text-align: center;
  @include mobile {
    width: 96vw;
    height: 320px;
  }
  .close-click {
    width: 70px;
    height: 70px;
    position: absolute;
    right: 32px;
    top: 37px;
    cursor: pointer;
    @include mobile {
      width: 40px;
      height: 40px;
      right: 6px;
      top: 10px;
    }
  }
  .title {
    margin-top: 80px;
    @include mobile {
      margin-top: 40px;
      font-size: 18px;
    }
  }
  .select {
    font-size: 23px;
    color: #999686;
    margin-top: 14px;
    @include mobile {
      font-size: 15px;
      margin-top: 5px;
    }
  }
  .slider {
    width: 819px;
    margin: 14px auto 0;
    @include mobile {
      width: 76%;
      margin-top: 6px;
    }
    :deep() {
      .el-slider__runway {
        background: #999686;
        border-radius: 6px;
        border: 1px solid #5e5743;
        height: 18px;
        border-radius: 9px;
      }
      .el-slider__button {
        width: 42px;
        height: 45px;
        background: url("@/assets/images/champion/game/slider.png") no-repeat;
        background-size: 100% 100%;
        border: none;
        @include mobile {
          width: 30px;
          height: 32px;
        }
      }
      .el-slider__bar {
        display: none;
      }
    }
  }
  .slider-percent {
    width: 837px;
    margin: 16px auto 0;
    font-size: 23px;
    color: #1d1f22;
    @include mobile {
      width: 76%;
      font-size: 12px;
      margin-top: 6px;
    }
  }
  .selected-text {
    margin-top: 40px;
    text-align: center;
    font-size: 23px;
    color: #1d1f22;
    @include mobile {
      margin-top: 6px;
      font-size: 14px;
    }
    .selected {
      margin-left: 15px;
      font-size: 30px;
      color: #bc7e04;
      @include mobile {
        font-size: 16px;
      }
    }
  }
  .submit-btn {
    text-align: center;
    margin: 20px auto 0;
    width: 302px;
    height: 81px;
    line-height: 70px;
    background: url("@/assets/images/recharge/qrcode.png") no-repeat;
    background-size: 100% 100%;
    font-weight: 500;
    font-size: 24px;
    color: #072523;
    cursor: pointer;
    border: 0;
    @include mobile {
      width: 100px;
      height: 32px;
      line-height: 28px;
      font-size: 14px;
    }
  }
}
</style>
