<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    closeOnClickOutside: {
        type: Boolean,
        default: true
    },
    closeOnEsc: {
        type: Boolean,
        default: true
    },
    width: {
        type: String,
        default: 'auto'
    },
    zIndex: {
        type: Number,
        default: 999
    },
    overlayColor: {
        type: String,
        default: 'rgba(30, 15, 10, 0.7)'
    },
    blurBackground: {
        type: Boolean,
        default: true
    },
    customClass: {
        type: String,
        default: ''
    },
    closeIcon: {
        type: String,
        default: '20'
    },
    showTitle: {
        type: Boolean,
        default: true
    },
    modelStyle: {
        type: Object,
        default: {}
    },
    footerStyle: {
        type: Object,
        default: {}
    },
    showFooter: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue', 'close', 'open', 'afterOpen', 'beforeClose']);

const visible = ref(props.modelValue);

// 控制body滚动
const toggleBodyScroll = (isVisible) => {
    if (isVisible) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
};

// 监听modelValue变化
watch(() => props.modelValue, (newVal) => {
    visible.value = newVal;
    toggleBodyScroll(newVal);
    if (newVal) {
        emit('open');
        // 延迟触发afterOpen事件，给动画时间
        setTimeout(() => {
            emit('afterOpen');
        }, 300);
    } else {
        emit('beforeClose');
    }
});

// 点击背景关闭
const handleBackdropClick = (event) => {
    // 仅当点击的是背景元素本身而不是其子元素时关闭
    if (props.closeOnClickOutside && event.target === event.currentTarget) {
        closeModel();
    }
};

// 关闭模态框
const closeModel = () => {
    visible.value = false;
    emit('update:modelValue', false);
    emit('close');
};

// 打开模态框
const openModel = () => {
    visible.value = true;
    emit('update:modelValue', true);
    emit('open');
};

// 处理ESC键关闭
const handleKeyDown = (event) => {
    if (props.closeOnEsc && event.key === 'Escape' && visible.value) {
        closeModel();
    }
};

// 监听ESC键
onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown);
    // 确保组件销毁时恢复body滚动
    toggleBodyScroll(false);
});

// 暴露方法
defineExpose({
    close: closeModel,
    open: openModel
});
</script>

<template>
    <Teleport to="body">
        <div v-if="visible"
            class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center cyber-model-container"
            :class="customClass" :style="{ zIndex: zIndex }" @click="handleBackdropClick">
            <div class="cyber-overlay tw-absolute tw-inset-0" :style="{
                backgroundColor: overlayColor,
                backdropFilter: blurBackground ? 'blur(8px)' : 'none'
            }"></div>
            <div
                class="tw-relative tw-z-10 tw-w-full tw-h-full tw-flex tw-items-end md:tw-items-center tw-justify-center">
                <div class="cyber-model-content tw-w-full md:tw-w-auto tw-overflow-hidden">
                    <div class="cyber-modal md:tw-w-[72.5rem] md:tw-translate-y-0 tw-overflow-hidden tw-duration-700"
                        :class="{ 'tw-translate-y-0': visible, 'tw-translate-y-full': !visible }"
                        :style="modelStyle">
                        <!-- 顶部标题栏 -->
                        <div class="cyber-header tw-flex tw-justify-between tw-items-center tw-py-4 tw-px-6" v-if="showTitle">
                            <slot name="title" >
                            </slot>
                            <button @click="closeModel()"
                                class="tw-opacity-80 hover:tw-opacity-100 hover:tw-rotate-90 tw-duration-200">
                                <svg t="1744272178420" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                    xmlns="http://www.w3.org/2000/svg" p-id="1468" :width="closeIcon"
                                    :height="closeIcon">
                                    <path
                                        d="M525.269211 510.837524 918.101111 116.227118c7.17747-7.209192 7.14984-18.871813-0.059352-26.049283-7.210215-7.176446-18.87079-7.151887-26.049283 0.059352L499.278257 484.72889 106.563014 90.236164c-7.17747-7.209192-18.84009-7.235798-26.049283-0.059352-7.209192 7.17747-7.235798 18.84009-0.059352 26.049283L473.287303 510.837524 80.45438 905.446907c-7.176446 7.209192-7.150864 18.871813 0.059352 26.049283 3.593851 3.577478 8.29492 5.365194 12.994965 5.365194 4.727675 0 9.455349-1.809205 13.054317-5.424546l392.715243-394.491703 392.715243 394.491703c3.599991 3.615341 8.326643 5.424546 13.054317 5.424546 4.700045 0 9.402137-1.787716 12.994965-5.365194 7.209192-7.17747 7.235798-18.84009 0.059352-26.049283L525.269211 510.837524z"
                                        fill="#ffffff" p-id="1469"></path>
                                </svg>
                            </button>
                        </div>
                        <slot></slot>
                        <!-- 底部按钮区域 -->
                        <div class="cyber-footer tw-p-4 tw-flex tw-justify-end tw-gap-4" :style="footerStyle"
                            v-if="showFooter">
                            <slot name="footer"></slot>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.cyber-modal {
  
    background-color: rgba(30, 15, 10, 0.95);
    border-radius: 0.5rem;
    border: 1px solid rgba(155, 81, 60, 0.4);
    box-shadow: 0 0 20px rgba(155, 81, 60, 0.3),
        0 0 40px rgba(180, 83, 60, 0.2);
    overflow: hidden;
    position: relative;
    margin: 0 auto;

}

.cyber-header {
    position: relative;
    z-index: 2;
    backdrop-filter: blur(4px);
}

.cyber-model-container {
    animation: fadeIn 0.3s ease;
}

.cyber-footer {
    border-top: 1px solid rgba(155, 81, 60, 0.3);
    background: rgba(35, 20, 15, 0.9);
    backdrop-filter: blur(4px);
    position: relative;
    z-index: 2;
}

.cyber-overlay {
    animation: fadeIn 0.3s ease;
}

.cyber-model-content {
    position: relative;
    animation: modalIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes modalIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>