<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import {
  ammunitionConversion,
} from "@/api/shop";
import { useUserInfo } from "@/composables/useUesrInfo.js";

const visible = ref(false);

const credits = ref("");
const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
  credits.value = "";
};

const closeModal = () => {
  visible.value = false;
  credits.value = "";
};

const { fetchUserInfo } = useUserInfo();
const converseAmmunition = () => {
  if (!credits.value || isNaN(credits.value) || credits.value <= 0) {
    ElMessage.warning("请输入正确的转换数量");
    return;
  }
  ammunitionConversion({ credits: credits.value }).then((res) => {
    if (res.code === 200) {
      ElMessage.success("转换成功");
      fetchUserInfo(); // 刷新用户信息
      closeModal();
    }
  });
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
    <div class="convert-wrapper">
      <div class="close-click" @click="closeModal" />
      <div class="title">弹药转换</div>
      <el-input
        v-model="credits"
        placeholder="请输入转换数量"
        style="--el-input-placeholder-color: #ffffff"
        maxlength="16"
      />
      <img class="split" src="@/assets/images/shop/split.png" alt="">
      <img class="convert" src="@/assets/images/shop/convert.png" alt="">
      <div @click="converseAmmunition" class="submit-btn">确定</div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.convert-wrapper {
  height: 609px;
  background: url("@/assets/images/shop/dialog-bg.webp") no-repeat;
  background-size: 100% 100%;
  position: relative;
  line-height: normal;
  font-family: "PingFang Medium";
  font-weight: 500;
  color: #1d1f22;
  overflow: hidden;
  margin-top: 30px;
  .close-click {
    width: 70px;
    height: 70px;
    position: absolute;
    right: 32px;
    top: 37px;
    cursor: pointer;
  }
  .title {
    text-align: center;
    margin-top: 82px;
    font-weight: 500;
    font-size: 28px;
    color: #1D1F22;
  }
  :deep() {
    .el-input {
      margin-top: 18px;
      margin-left: 133px;
      width: 867px;
      height: 56px;
      font-size: 22px;
    }
    .el-input__wrapper {
      background: #74705e;
      box-shadow: none;
    }
    .el-input__inner {
      background: #74705e;
      box-shadow: none;
      border-radius: 9px;
      color: #ffffff;
    }
  }
  .split {
    display: block;
    width: 855px;
    height: 1px;
    margin: 18px auto 0;
  }
  .convert {
    display: block;
    width: 98px;
    height: 108px;
    margin: 82px auto 0;
  }
  .submit-btn {
    text-align: center;
    margin: 42px auto 0;
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
  }
}
</style>
