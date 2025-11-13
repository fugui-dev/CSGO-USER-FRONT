<script setup>
import { ref, computed } from "vue";
import boxItem from './boxItem.vue'

const props = defineProps({
    luckyboxData: {
        type: Object,
        required: true
    },
});
const visible = ref(false)

const open = () => {
    visible.value = true
}

const close = () => {
    visible.value = false
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
            <div class="lucky-modal-wrapper tw-w-[90vw] md:tw-w-[72.5rem] tw-rounded-xl tw-bg-[#1A1A1A]/90 tw-backdrop-blur-md tw-mt-5 tw-py-4 tw-px-2 md:tw-p-5 tw-pb-3 tw-relative tw-z-10 tw-animate-modalAppear">
                <!-- 开箱背景 -->
                <div class="lucky-modal-bg"></div>
                
                <!-- 标题栏 -->
                <div class="tw-flex tw-justify-between  tw-pb-4 tw-items-center tw-mb-6 tw-relative tw-z-10">
                    <h3 class="tw-text-xl tw-font-bold tw-text-white tw-animate-titleSlide">欧皇记录</h3>
                    
                    <!-- 关闭按钮 -->
                    <button 
                        class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-[#2A2A2A] tw-flex tw-items-center tw-justify-center hover:tw-bg-[#3A3A3A] tw-transition-all tw-duration-300 group"
                        @click="closeModal"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none"
                            :style="{ stroke: 'var(--icon-color, #ffffff)' }"
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
                <div class="tw-overflow-hidden tw-overflow-y-auto tw-max-h-[50vh] no-scrollbar tw-transition-all tw-duration-500 tw-ease-in-out tw-my-4 tw-relative tw-z-10">
                    <div class="box-item tw-flex tw-flex-wrap tw-justify-center  tw-gap-y-2 tw-gap-x-2 md:tw-gap-6 tw-animate-gridAppear">
                        <boxItem 
                            v-for="(item, index) in luckyboxData" 
                            :key="index"
                            :box-data="item"
                            :isHave="true"
                            :style="{ animationDelay: index * 0.1 + 's' }"
                            class="tw-animate-itemAppear"
                        />
                    </div>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<style scoped lang="scss">
.dialog {
    background: none;
}

.lucky-modal-wrapper {
    position: relative;
    overflow: hidden;
}

.lucky-modal-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("@/assets/images/open/bg.webp") no-repeat center;
    background-size: cover;
    opacity: 0.3;
    z-index: 0;
    pointer-events: none;
}

.box-item {
    position: relative;
    z-index: 10;
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

.tw-animate-modalAppear {
    animation: modalAppear 0.5s ease-out forwards;
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
    --icon-color: #ffffff;
}
.group:hover {
    --icon-color: #cccccc;
}
</style>
