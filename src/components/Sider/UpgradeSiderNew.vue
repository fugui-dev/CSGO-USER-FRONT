<template>
  <div class="tw-relative tw-w-[calc(100vw-4rem)] md:tw-w-[37.5rem] tw-mx-auto tw-select-none" ref="sliderRef"
    @contextmenu.prevent @click="handleTrackClick">
    <!-- 背景轨道 -->
    <div class="tw-h-[2rem] tw-w-full tw-relative tw-rounded-full tw-border-2 tw-border-[#FFF646]">
      <!-- 纯色背景 -->
    </div>

    <!-- 已滑过的区域 -->
    <div class="tw-absolute tw-top-0 tw-left-0 tw-h-[2rem] tw-overflow-hidden tw-rounded-l-full tw-rounded-r-full tw-bg-[#FFF646]"
     
      :style="{ width: `${percentage}%` }">
      <!-- 纯色背景 -->
    </div>

    <!-- 发光效果 -->
    <div
      class="tw-absolute tw-top-0 tw-left-0 tw-h-[2rem] tw-pointer-events-none tw-rounded-l-full tw-opacity-50 tw-blur-[10px]"
      :style="{ width: `${percentage}%`, background: 'linear-gradient(93deg, #FFC43C 7.24%, #E36C0A 98.65%)' }">
    </div>

    <!-- 自定义滑块 -->
    <div
      class="tw-absolute tw-top-[0px] tw--translate-x-1/2 tw-h-[2rem] tw-bg-[#493632] tw-rounded-full tw-w-[2rem] tw-cursor-pointer hover:tw-scale-110 tw-transition-transform tw-z-20"
      :style="{ left: `${percentage - 2.5}%` }" @mousedown.stop="startDragging" @touchstart.stop="startDragging"
      @contextmenu.prevent>
      <img :src="siderModal" class="tw-w-full tw-h-full tw-pointer-events-none" alt="滑块" draggable="false" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMousePressed, useDebounceFn } from '@vueuse/core'
import siderModal from '@/assets/sider/siderModal2.png'
const props = defineProps({
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  modelValue: {
    type: Number,
    default: 0
  },
  fixedValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const value = ref(props.modelValue)
const sliderRef = ref(null)
const { pressed } = useMousePressed()
const isDragging = ref(false)

// 计算有效值范围
const validRange = computed(() => {
  const minAllowed = Math.min(props.fixedValue + 5, 75)
  const maxAllowed = 75
  return {
    min: minAllowed,
    max: maxAllowed
  }
})

// 优化后的百分比计算
const percentage = computed(() => {
  const { min: minAllowed } = validRange.value
  const displayValue = Math.max(value.value, minAllowed)
  return ((displayValue - props.min) / (props.max - props.min)) * 100
})

// 值规范化函数
const normalizeValue = (val) => {
  const { min: minAllowed, max: maxAllowed } = validRange.value
  return Math.min(Math.max(val, minAllowed), maxAllowed)
}

// 使用防抖处理值更新
const debouncedEmit = useDebounceFn((val) => {
  emit('update:modelValue', val)
}, 16) // 约60fps的更新频率

// 优化后的值更新函数
const updateSliderValue = (newValue) => {
  const normalizedValue = normalizeValue(newValue)
  value.value = normalizedValue
  debouncedEmit(normalizedValue)
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  updateSliderValue(newValue)
})

// 监听 fixedValue 变化
watch(() => props.fixedValue, (newFixedValue) => {
  const { min: minAllowed } = validRange.value
  updateSliderValue(value.value)
})

// 处理轨道点击
const handleTrackClick = (event) => {
  // 如果是从滑块触发的事件，不处理
  if (event.target.closest('.tw-cursor-pointer')) return

  if (!sliderRef.value) return

  const rect = sliderRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left

  if (x < 0 || x > rect.width) return

  const newPercentage = x / rect.width
  const newValue = Math.round(props.min + (props.max - props.min) * newPercentage)
  updateSliderValue(newValue)
}

// 修改开始拖动处理
const startDragging = (event) => {
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'grabbing'
}

// 修改停止拖动处理
const stopDragging = () => {
  if (!isDragging.value) return
  isDragging.value = false
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

// 修改移动处理函数
const handleMove = (clientX) => {
  if (!isDragging.value || !sliderRef.value) return

  const rect = sliderRef.value.getBoundingClientRect()
  const x = Math.min(Math.max(0, clientX - rect.left), rect.width)
  const newPercentage = x / rect.width
  const newValue = Math.round(props.min + (props.max - props.min) * newPercentage)

  requestAnimationFrame(() => {
    updateSliderValue(newValue)
  })
}

// 组件挂载时添加事件监听
onMounted(() => {
  if (!sliderRef.value) return

  const handleMouseMove = (e) => {
    if (isDragging.value) {
      handleMove(e.clientX)
    }
  }

  const handleTouchMove = (e) => {
    if (isDragging.value) {
      e.preventDefault()
      const touch = e.touches[0]
      handleMove(touch.clientX)
    }
  }

  // 只在滑块组件内监听移动事件
  sliderRef.value.addEventListener('mousemove', handleMouseMove)
  sliderRef.value.addEventListener('touchmove', handleTouchMove)

  // 这些事件仍然需要在 document 上监听，以处理拖动结束的情况
  document.addEventListener('mouseup', stopDragging)
  document.addEventListener('mouseleave', stopDragging)
  document.addEventListener('touchend', stopDragging)
  document.addEventListener('touchcancel', stopDragging)

  // 组件卸载时移除事件监听
  onUnmounted(() => {
    if (!sliderRef.value) return

    sliderRef.value.removeEventListener('mousemove', handleMouseMove)
    sliderRef.value.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('mouseup', stopDragging)
    document.removeEventListener('mouseleave', stopDragging)
    document.removeEventListener('touchend', stopDragging)
    document.removeEventListener('touchcancel', stopDragging)
  })
})

// 移除之前的全局事件监听
// useEventListener(document, 'mousemove', ...) 
// useEventListener(document, 'mouseup', ...)
// useEventListener(document, 'mouseleave', ...)
// useEventListener(document, 'touchmove', ...)
// useEventListener(document, 'touchend', ...)
// useEventListener(document, 'touchcancel', ...)
</script>

<style scoped>
.tw-transition-transform {
  transition: transform 0.2s ease;
}

/* 添加滑块悬浮效果 */
.tw-cursor-pointer:hover {
  z-index: 30;
}
</style>