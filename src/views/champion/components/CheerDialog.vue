<script setup>
import { ref, defineEmits } from "vue";
import { requireImg } from "@/utils/common";
import { cheerApi } from "@/api/champion";
import { ElMessage } from "element-plus";

const props = defineProps({
  teamId: {
    type: Number,
    required: true,
  },
  stageGroupFightId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const visible = ref(false);
const cheerFormRef = ref();
const cheerForm = ref({
  teamId: -1,
  stageGroupFightId: -1,
  amount: "",
});
const cheerFormRules = ref({
  amount: [{ required: true, message: "请输入助威金额", trigger: "blur" }],
});
const loading = ref(false);

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
  cheerForm.value = {
    teamId: -1,
    stageGroupFightId: -1,
    amount: "",
  };
  emit("close");
};

const closeModal = () => {
  visible.value = false;
  cheerForm.value = {
    teamId: -1,
    stageGroupFightId: -1,
    amount: "",
  };
};

const cheerFormSubmit = () => {
  cheerFormRef.value.validate((valid) => {
    if (
      props.teamId &&
      props.teamId !== -1 &&
      props.stageGroupFightId &&
      props.stageGroupFightId !== -1
    ) {
      cheerForm.value.teamId = props.teamId;
      cheerForm.value.stageGroupFightId = props.stageGroupFightId;
    } else {
      ElMessage.warning("请求参数有误");
      return;
    }

    if (valid) {
      loading.value = true;
      cheerApi(cheerForm.value)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success(res.msg);
            close();
          }
        })
        .finally(() => {
          loading.value = false;
        });
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
    <div class="cheer-wrapper">
      <div class="close-click" @click="closeModal" />
      <div class="title">助威队伍</div>
      <el-form
        :model="cheerForm"
        :rules="cheerFormRules"
        ref="cheerFormRef"
        class="form"
        label-width="0"
      >
        <div class="label">助威金额</div>
        <el-form-item label="" prop="amount">
          <el-input
            v-model="cheerForm.amount"
            placeholder="请输入助威金额"
            style="--el-input-placeholder-color: #ffffff"
            maxlength="16"
          />
        </el-form-item>
        <div @click="cheerFormSubmit" class="submit-btn">确定</div>
      </el-form>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.cheer-wrapper {
  height: 628px;
  background: url("@/assets/images/match/cheer-bg.webp") no-repeat;
  background-size: 100% 100%;
  position: relative;
  line-height: normal;
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
    font-size: 28px;
  }
  .form {
    margin-top: 70px;
    margin-left: 145px;
    font-size: 23px;
    width: 867px;
    :deep() {
      .el-input {
        margin-top: 20px;
        width: 867px;
        height: 56px;
        font-size: 19px;
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
    .submit-btn {
      text-align: center;
      margin: 100px auto 0;
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
}
</style>
