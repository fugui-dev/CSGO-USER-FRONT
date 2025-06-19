<!-- CountdownButton.vue -->
<template>
  <div
      class="countdown-button"
      :class="{ 'disabled': isDisabled }"
      @click="handleClick"
      role="button"
      tabindex="0"
  >
    <span class="button-text">
      {{ displayText }}
    </span>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useIntervalFn } from '@vueuse/core'

const props = defineProps({
  // 总倒计时时长（秒）
  duration: {
    type: Number,
    default: 60
  },
  // 自定义禁用类名
  disabledClass: {
    type: String,
    default: 'disabled'
  }
})


const emit = defineEmits(['click'])

// 状态管理
const count = ref(0)
const isCounting = ref(false)
const isDisabled = computed(() => isCounting.value)

// 定时器控制
const { pause, resume } = useIntervalFn(
    () => {
      count.value--
      if (count.value <= 0) {
        pause()
        isCounting.value = false
      }
    },
    1000,
    { immediate: false }
)

// 显示文本
const displayText = computed(() => {
  return isCounting.value
      ? `${count.value}秒后重新获取`
      : '获取验证码'
})

// 点击处理
const handleClick = () => {
  if (isDisabled.value) return
  startCountdown()
  emit('click')
}

// 启动倒计时
const startCountdown = () => {
  if (isCounting.value) return

  isCounting.value = true
  count.value = props.duration
  resume()
}

//清除禁用状态
const clearDisabled = () => {
  isCounting.value = false
  pause()
}

// 清理定时器
onUnmounted(pause)
defineExpose({
  clearDisabled
})
</script>

<style scoped>
/* 基础样式 - 按需修改 */
.countdown-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
  height:56px;

  /* 默认正常状态样式 */
  background: linear-gradient(99.19deg, rgba(166, 131, 131, 0.4) 5.46%, rgba(255, 34, 0, 0.4) 86.69%);

  color: white;
  border: 1px solid #FC523A
}

/* 禁用状态样式 - 在此处添加你的自定义样式 */
.countdown-button.disabled {
  /* 示例样式 */
  background-color: #c0c4cc;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 文字样式 */
.button-text {
  font-size: 14px;
  font-weight: 500;
}

/* 可添加 hover 效果 */
.countdown-button:not(.disabled):hover {
  opacity: .8;
}

/* 聚焦样式 */
.countdown-button:focus-visible {
  outline: 2px solid rgba(255, 34, 0, 0.4) ;
  outline-offset: 2px;
}
</style>
