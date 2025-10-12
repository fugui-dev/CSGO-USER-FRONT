<script setup>
import { ref } from "vue";
import { requireImg } from "@/utils/common";
import Decimal from "decimal.js";
import { createTeamApi } from "@/api/champion";
import { ElMessage } from "element-plus";
import { useStore } from "@/store";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();
const visible = ref(false);
const createTeamFormRef = ref();
const createTeamForm = ref({
  matchId: "",
  userId: "",
  name: "",
  description: "",
});
const createTeamFormRules = ref({
  name: [
    { required: true, message: "请输入队伍名称", trigger: "blur" },
    { min: 1, max: 16, message: "长度在 1 到 16 个字符之间", trigger: "blur" },
  ],
  description: [
    { required: true, message: "请输入队伍描述", trigger: "blur" },
    { min: 1, max: 50, message: "长度在 1 到 50 个字符之间", trigger: "blur" },
  ],
});

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
  emit("close");
};

const closeModal = () => {
  visible.value = false;
};

const createTeamFormSubmit = () => {
  createTeamFormRef.value.validate((valid) => {
    if (valid) {
      createTeamForm.value.matchId = Number(
        window.sessionStorage.getItem("matchId")
      );
      createTeamForm.value.userId = store.userInfo.userId;
      createTeamApi(createTeamForm.value).then((res) => {
        if (res.code === 200) {
          ElMessage.success("队伍创建成功");
          closeModal();
        }
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
    <div class="create-team-wrapper">
      <div class="close-click" @click="closeModal" />
      <div class="title">创建队伍</div>
      <el-form
        :model="createTeamForm"
        :rules="createTeamFormRules"
        ref="createTeamFormRef"
        class="form"
        label-width="0"
      >
        <div class="label">队伍名称</div>
        <el-form-item label="" prop="name">
          <el-input
            v-model="createTeamForm.name"
            placeholder="请输入队伍名称"
            style="--el-input-placeholder-color: #ffffff"
            maxlength="16"
          />
        </el-form-item>
        <div class="label" style="margin-top: 20px">队伍描述</div>
        <el-form-item label="" prop="description">
          <el-input
            v-model="createTeamForm.description"
            placeholder="请输入队伍描述"
            style="--el-input-placeholder-color: #ffffff"
            maxlength="50"
          />
        </el-form-item>
        <div @click="createTeamFormSubmit" class="submit-btn">提交</div>
      </el-form>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.create-team-wrapper {
  height: 574px;
  background: url("@/assets/images/champion/create-team-bg.webp") no-repeat;
  background-size: 100% 100%;
  position: relative;
  line-height: normal;
  font-weight: 500;
  color: #1d1f22;
  overflow: hidden;
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
    margin-top: 30px;
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
      margin: 30px auto 0;
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
