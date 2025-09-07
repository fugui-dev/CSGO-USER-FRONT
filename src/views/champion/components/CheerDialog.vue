<script setup>
import { ref, defineEmits } from "vue";
import {requireImg} from "@/utils/common";
import {cheerApi} from "@/api/champion"
import {ElMessage} from "element-plus";

const props = defineProps({
  teamId: {
    type: Number,
    required: true
  },
  stageGroupFightId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close'])
const visible = ref(false)
const cheerFormRef = ref()
const cheerForm = ref({
  teamId: -1,
  stageGroupFightId: -1,
  amount: ''
})
const cheerFormRules = ref({
  amount: [
    {required: true, message: '请输入助威金额', trigger: 'blur'}
  ]
})
const loading = ref(false)

const open = () => {
    visible.value = true
}

const close = () => {
    visible.value = false
    cheerForm.value = {
      teamId: -1,
      stageGroupFightId: -1,
      amount: ''
    }
    emit('close')
}

const closeModal = () => {
    visible.value = false;
    cheerForm.value = {
      teamId: -1,
      stageGroupFightId: -1,
      amount: ''
    }
};

const cheerFormSubmit = () => {
  cheerFormRef.value.validate(valid => {
    if ((props.teamId && props.teamId !== -1) && (props.stageGroupFightId && props.stageGroupFightId !== -1)) {
      cheerForm.value.teamId = props.teamId
      cheerForm.value.stageGroupFightId = props.stageGroupFightId
    } else {
      ElMessage.warning('请求参数有误')
      return
    }
    
    if (valid) {
      loading.value = true
      cheerApi(cheerForm.value).then(res => {
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        }
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

defineExpose({
    open,
    close
})

</script>
<template>
    <div>
        <van-popup class="dialog no-scrollbar" v-model:show="visible" :close-on-click-overlay="false" teleport="body">
            <div class="tw-w-[90vw] md:tw-w-[72.5rem] tw-rounded-xl tw-border tw-border-[#FF7A21]/40 tw-bg-[#1A1A1A]/90 tw-backdrop-blur-md tw-shadow-[0_0_25px_rgba(255,122,33,0.3)] tw-mt-5 tw-py-4 tw-px-2 md:tw-p-5 tw-pb-3 tw-relative tw-z-10 tw-animate-modalAppear">
                <!-- 背景光效 - 移到卡片内部 -->
                <div class="tw-absolute tw-w-full tw-h-full tw-top-0 tw-left-0 tw-overflow-hidden tw-opacity-30 tw-rounded-xl tw-z-0">
                    <div class="tw-absolute tw-w-[40%] tw-h-[30%] tw-bg-[#FF7A21] tw-blur-[6.25rem] tw-rounded-full tw-top-[-10%] tw-left-[-10%] tw-animate-pulse"></div>
                    <div class="tw-absolute tw-w-[30%] tw-h-[20%] tw-bg-[#FF7A21] tw-blur-[5rem] tw-rounded-full tw-bottom-[-5%] tw-right-[10%] tw-animate-pulse" style="animation-delay: 1s;"></div>
                </div>
                
                <!-- 边框光效 -->
                <div class="tw-absolute tw-inset-0 tw-rounded-xl tw-border tw-border-[#FF7A21]/20 tw-z-[1] tw-animate-borderPulse"></div>
                
                <!-- 标题栏 -->
                <div class="tw-flex tw-justify-between  tw-pb-4 tw-items-center tw-mb-6 tw-relative tw-z-10">
                    <div class="tw-absolute tw-h-[2px] tw-bg-gradient-to-r tw-from-transparent tw-via-[#FF7A21] tw-to-transparent tw-w-full tw-bottom-[-12px]"></div>
                    <h3 class="tw-text-xl tw-font-bold tw-text-transparent tw-bg-clip-text tw-bg-gradient-to-r tw-from-[#FF7A21] tw-to-[#FFB74D] tw-animate-titleSlide">助威队伍</h3>
                    
                    <!-- 关闭按钮 -->
                    <button 
                        class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-[#2A2A2A] tw-flex tw-items-center tw-justify-center hover:tw-bg-[#FF7A21] tw-transition-all tw-duration-300 tw-border tw-border-[#FF7A21]/40 tw-shadow-[0_0_15px_rgba(255,122,33,0.2)] group"
                        @click="closeModal"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none"
                            :style="{ stroke: 'var(--icon-color, #FF7A21)' }"
                            stroke-width="2.5" 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            class="tw-w-4 tw-h-4 tw-transition-colors tw-duration-300 tw-animate-spin-once"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <!-- 内容区域 -->
                <div class="tw-overflow-hidden tw-overflow-y-auto tw-max-h-[50vh] no-scrollbar tw-transition-all tw-duration-500 tw-ease-in-out tw-my-4 tw-relative tw-z-10 content" v-loading="loading">
                  <el-form :model="cheerForm" :rules="cheerFormRules" ref="cheerFormRef" class="cheer-form">
                    <el-form-item label="助威金额" prop="amount">
                      <el-input v-model="cheerForm.amount" placeholder="请输入助威金额"/>
                    </el-form-item>
                    <el-form-item>
                      <!-- 按钮 -->
                      <div class="cheer-form-btn" @click="cheerFormSubmit">确认</div>
                    </el-form-item>
                  </el-form>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<style scoped lang="scss">
.dialog {
    background: none;
}
.cheer-amount {
  flex: 1;
}
.cheer-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.cheer-form-btn {
  background-color: #fb8c1e;
  border-radius: 6px;
  width: 80px;
  height: 42px;
  line-height: 42px;
  text-align: center;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  cursor: pointer;
}
.el-form-item {
  display: flex;
  align-items: center;
  width: 100%;
  ::v-deep .el-form-item__label {
    justify-content: flex-start;
    color: #eee;
  }
  ::v-deep .el-form-item__content {
    justify-content: center;
  }
}
.el-input {
  --el-input-bg-color: transparent;
  --el-input-border-color: #999;
  --el-color-primary: white;
  --el-input-text-color: white;
  --el-input-placeholder-color: #B1B1B1FF;
  --el-input-inner-height: 40px;
  font-size: 14px;
  flex: 1;
}
.highlight {
  background: linear-gradient(to right, rgb(143, 5, 202), rgb(11, 11, 96));
}
.non-highlight {
  background: linear-gradient(to right, rgb(105, 94, 116), rgb(24, 24, 36));
}
.user-list-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 8px;
  .user-list-item-left {
    display: flex;
    align-items: center;
    img.avatar {
      width: 34px;
      height: 34px;
      border-radius: 6px;
      border: 1px solid #f2a814;
      margin-right: 8px;
    }
    .nick-name {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      font-size: 15px;
      white-space: nowrap; /* 防止文本换行 */
      overflow: hidden; /* 隐藏溢出的内容 */
      text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
      max-width: 120px;
    }
  }
  .invite-btn-wrap {
    display: flex;
    align-items: center;
    .invite-btn {
      background: linear-gradient(to right, rgb(151, 84, 214), rgb(38, 52, 156));
      border-radius: 5px;
      padding: 0 20px;
      font-size: 14px;
      height: 26px;
      line-height: 26px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      box-shadow: 3px 4px 12px rgba(95, 95, 88, 0.8);
      margin-right: 12px;
    }
  }
}
.empty-box {
  font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
  font-size: 18px;
  color: #eee;
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 动画 */
@keyframes modalAppear {
    0% {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@keyframes borderPulse {
    0%, 100% {
        box-shadow: 0 0 15px 2px rgba(255, 122, 33, 0.2);
    }
    50% {
        box-shadow: 0 0 25px 5px rgba(255, 122, 33, 0.4);
    }
}

@keyframes titleSlide {
    0% {
        opacity: 0;
        transform: translateY(-10px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes gridAppear {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes itemAppear {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin-once {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(180deg);
    }
}

@keyframes up_and_down {
  0% {
    transform: translate(-50%,-50%);
  }

  50% {

    transform: translate(-50%,calc(-50% - 10px));
  }

  100% {
    transform: translate(-50%,-50%);
  }
}
@keyframes smooth {
  0% {
    filter: drop-shadow(0px 0px 0px rgba(255, 255, 255, 0.3));
  }

  50% {
    filter: drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.3));
  }

  100% {
    filter: drop-shadow(0px 0px 0px rgba(255, 255, 255, 0.3));
  }
}

.tw-animate-modalAppear {
    animation: modalAppear 0.5s ease-out forwards;
}

.tw-animate-borderPulse {
    animation: borderPulse 3s infinite ease-in-out;
}

.tw-animate-titleSlide {
    animation: titleSlide 0.6s ease-out forwards;
}

.tw-animate-gridAppear {
    animation: gridAppear 0.8s ease-out forwards;
}

.tw-animate-itemAppear {
    animation: itemAppear 0.5s ease-out forwards;
    animation-fill-mode: both;
}

.tw-animate-spin-once {
    animation: spin-once 0.3s ease-out forwards;
    animation-play-state: paused;
}

.group:hover .tw-animate-spin-once {
    animation-play-state: running;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tw-animate-modalAppear {
    animation-duration: 0.4s;
  }
}

.group {
    --icon-color: #FF7A21;
}
.group:hover {
    --icon-color: white;
}
</style>
