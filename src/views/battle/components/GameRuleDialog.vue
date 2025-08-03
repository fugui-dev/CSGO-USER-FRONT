<script setup>
import { ref } from "vue";

const visible = ref(false)

const open = () => {
    visible.value = true
}

const close = () => {
    visible.value = false
    emit('close')
}

const closeModal = () => {
    visible.value = false;
};

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
                    <h3 class="tw-text-xl tw-font-bold tw-text-transparent tw-bg-clip-text tw-bg-gradient-to-r tw-from-[#FF7A21] tw-to-[#FFB74D] tw-animate-titleSlide">游戏规则</h3>
                    
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
                <div class="game-rule tw-overflow-hidden tw-overflow-y-auto tw-max-h-[50vh] no-scrollbar tw-transition-all tw-duration-500 tw-ease-in-out tw-my-4 tw-relative tw-z-10">
                  <p>注册用户可以加入对战房间，房间满人且都准备对战之后，开启战斗倒计时，对战过程中显示每位玩家获取到的物品及价值，最终根据玩家获取到的物品价值分胜负，胜者获得房间内所有玩家的物品，败者获得价值0.01 的物品。</p>
                  <p>欧皇模式：房间内物品价值最大的玩家胜利。</p>
                  <p>非酋模式：房间内物品价值最小的玩家胜利。</p>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<style scoped lang="scss">
.dialog {
    background: none;
}
.game-rule {
  p {
    color: #eee;
    line-height: 28px;
  }
}
.room-line {
  display: flex;
  align-items: center;
  color: #fff;
  padding: 8px 0;
  h3 {
    margin-right: 12px;
  }
  .room-line-options {
    display: flex;
    div {
      margin-right: 12px;
      background-color: #444;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
    }
  }
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
  .room-line {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 12px;
    h3 {
      margin-bottom: 12px;
    }
    .room-line-options {
      flex-wrap: wrap;
      div {
        margin-bottom: 8px;
      }
    }
  }
  .box-choose-list {
    display: flex;
    .box-item {
      width: 20%;
      font-size: 12px;
    }
  }
  .box-choose-title {
    padding-left: 12px;
  }
}

.group {
    --icon-color: #FF7A21;
}
.group:hover {
    --icon-color: white;
}
</style>
