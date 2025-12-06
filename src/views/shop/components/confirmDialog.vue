<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import {
  commodityExchange,
} from "@/api/shop";
import { useUserInfo } from "@/composables/useUesrInfo.js";

const visible = ref(false);

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
});

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const closeModal = () => {
  visible.value = false;
};

const { fetchUserInfo } = useUserInfo();
const exchangecommodity = () => {
  commodityExchange({ ornamentsId: props.id }).then((res) => {
    if (res.code === 200) {
      ElMessage.success("兑换成功");
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
    <div class="confirm-wrapper">
      <div class="close-click" @click="closeModal" />
      <div class="title">兑换商品</div>
      <img class="split" src="@/assets/images/shop/split.png" alt="">
      <img class="confirm" src="@/assets/images/shop/confirm.png" alt="">
      <div class="button-wrapper tw-flex tw-justify-center">
        <div @click="closeModal" class="submit-btn cancel-btn">取消</div>
        <div @click="exchangecommodity" class="submit-btn">确定</div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.confirm-wrapper {
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
  @include mobile {
    width: 94vw;
    height: 280px;
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
      top: 14px;
    }
  }
  .title {
    text-align: center;
    margin-top: 82px;
    font-weight: 500;
    font-size: 28px;
    color: #1D1F22;
    @include mobile {
      font-size: 16px;
      margin-top: 40px;
    }
  }
  .split {
    display: block;
    width: 855px;
    height: 1px;
    margin: 20px auto 0;
    @include mobile {
      margin-top: 10px;
    }
  }
  .confirm {
    display: block;
    width: 197px;
    height: 186px;
    margin: 51px auto 0;
    @include mobile {
      width: 100px;
      height: 96px;
      margin-top: 16px;
    }
  }
  .button-wrapper {
    margin: 67px auto 0;
    @include mobile {
      margin-top: 20px;
    }
  }
  .submit-btn {
    text-align: center;
    width: 293px;
    height: 70px;
    line-height: 61px;
    background: url("@/assets/images/recharge/qrcode.png") no-repeat;
    background-size: 100% 100%;
    font-weight: 500;
    font-size: 24px;
    color: #072523;
    cursor: pointer;
    border: 0;
    @include mobile {
      width: 100px;
      height: 36px;
      line-height: 32px;
      font-size: 14px;
    }
    &.cancel-btn {
      margin-right: 118px;
      background: url("@/assets/images/shop/cancel-btn.png") no-repeat;
      background-size: 100% 100%;
      @include mobile {
        margin-right: 20px;
      }
    }
  }
}
</style>
