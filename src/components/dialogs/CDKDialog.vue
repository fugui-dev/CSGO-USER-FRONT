<script setup>

import BaseDialog from "@/components/dialogs/BaseDialog.vue";
import {ref} from "vue";
import {useCdkApi} from "@/api";
import {ElMessage} from "element-plus";

const Ref = ref()
const open = () => {
  Ref.value.open()
  cdk.value=''
}
const cdk = ref('')

const useCdk = () => {
  if (!cdk.value) {
    ElMessage.warning('请输入CDKey')
  }
  useCdkApi(cdk.value).then(res => {
    ElMessage.success('兑换成功')
    Ref.value.close()
  })
}
defineExpose({
  open
})
</script>

<template>
  <BaseDialog ref="Ref" title="CDKey兑换" :show-confirm="true" @confirm="useCdk">
    <template #default>
      <div style="display: flex;align-items: center;height: 100%;">
        <el-input v-model="cdk" placeholder="请输入CDKey"/>
      </div>
    </template>
  </BaseDialog>

</template>

<style scoped lang="scss">
.el-input{
  --el-input-bg-color:none;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
  --el-input-border:0px;
  --el-input-border-color:tranparent;
  --el-input-text-color:#ffffffaa;
  --el-input-focus-border-color: rgba(255, 255, 255, 0.2);
  --el-input-focus-border: rgba(255, 255, 255, 0.2);
  height: 45px;
  border-radius: 5px;
}
</style>
