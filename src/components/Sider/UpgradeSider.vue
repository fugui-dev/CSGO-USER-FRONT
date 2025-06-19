<template>
  <div
    class="tw-relative tw-w-[300px] md:tw-w-[412px] tw-mx-auto tw-select-none"
    ref="sliderRef"
    @contextmenu.prevent
  >
    <!-- 背景轨道 -->
    <div
      class="md:tw-h-[44px] tw-w-full tw-relative"
      @click="handleBackgroundClick"
      @mousedown.prevent
    >
      <img
        :src="siderBody"
        class="tw-w-full tw-h-full tw-object-cover tw-pointer-events-none"
        alt="背景"
        ref="bodyRef"
        draggable="false"
      />
    </div>

    <!-- 已滑过的区域 -->
    <div
      class="tw-absolute tw-top-[8px] tw-left-[8px] tw-h-[20px] md:tw-h-[28px] tw-overflow-hidden tw-cursor-pointer tw-rounded-l-full"
      :style="{ width: `calc(${percentage}% - 16px)` }"
      @click.stop="handleBackgroundClick"
      @mousedown.prevent
    >
      <img
        :src="siderOver"
        class="tw-w-full tw-h-full tw-object-cover tw-pointer-events-none"
        alt="已滑过"
        draggable="false"
      />
    </div>

    <!-- 自定义滑块 -->
    <div
      class="tw-absolute tw-top-[-10px] md:tw-top-[-17px] tw--translate-x-1/2 tw-h-[48px] md:tw-w-[73px] md:tw-h-[78px] tw-cursor-pointer hover:tw-scale-110"
      :style="{ left: `${percentage}%` }"
      @mousedown.prevent="startDragging"
      @touchstart.prevent="startDragging"
      @contextmenu.prevent
    >
      <img
        :src="siderModal"
        class="tw-w-full tw-h-full tw-pointer-events-none"
        alt="滑块"
        draggable="false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useEventListener, useMousePressed } from '@vueuse/core'
import siderBody from '@/assets/sider/siderBody.png'
import siderOver from '@/assets/sider/siderOver.png'
import siderModal from '@/assets/sider/siderModal.png'
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
const bodyRef = ref(null)
const { pressed } = useMousePressed()

// 计算百分比
const percentage = computed(() => {
  // 如果fixedValue+5超过75，则固定为75
  const minValue = Math.min(props.fixedValue + 5, 75)
  // 如果当前值小于最小值，则显示最小值的位置
  const displayValue = Math.max(value.value, minValue)
  return (displayValue - props.min) / (props.max - props.min) * 100
})

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  // 确保值不小于fixedValue+5且不超过75
  if (newValue >= props.fixedValue + 5 && newValue <= 75) {
    value.value = newValue
  }
})

// 监听 fixedValue 变化
watch(() => props.fixedValue, (newFixedValue) => {
  // 如果fixedValue+5超过75，则固定为75
  if (newFixedValue + 5 > 75) {
    value.value = 75
    emit('update:modelValue', 75)
  } else if (value.value < newFixedValue + 5) {
    // 如果当前值小于新的fixedValue+5，则自动调整到新的最小值
    value.value = newFixedValue + 5
    emit('update:modelValue', newFixedValue + 5)
  }
})

// 开始拖动
const startDragging = (event) => {
  event.preventDefault()
  pressed.value = true
  // 添加临时的全局样式
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'grabbing'
}

// 检查点击是否在背景图内
const isClickInBody = (event) => {
  if (!sliderRef.value) return false
  const rect = sliderRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  // 只允许在滑块组件的有效区域内点击
  return x >= 0 && x <= rect.width && y >= -17 && y <= 78
}

// 处理背景点击
const handleBackgroundClick = (event) => {
  if (!sliderRef.value || !isClickInBody(event)) return

  const rect = sliderRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  if (x < 0 || x > rect.width || y < 0 || y > rect.height) return

  const newPercentage = x / rect.width
  const newValue = Math.round(props.min + (props.max - props.min) * newPercentage)

  // 确保值不小于fixedValue+5且不超过75
  if (newValue >= props.fixedValue + 5 && newValue <= 75) {
    value.value = newValue
    emit('update:modelValue', newValue)
  }
}

// 更新值
const updateValue = (event) => {
  if (!pressed.value || !sliderRef.value || !bodyRef.value) return

  const rect = sliderRef.value.getBoundingClientRect()
  const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width)
  const newPercentage = x / rect.width
  const newValue = Math.round(props.min + (props.max - props.min) * newPercentage)

  // 确保值不小于fixedValue+5且不超过75
  if (newValue >= props.fixedValue + 5 && newValue <= 75) {
    value.value = newValue
    emit('update:modelValue', newValue)
  }
}

// 停止拖动
const stopDragging = () => {
  pressed.value = false
  // 恢复全局样式
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

// 监听全局鼠标事件
useEventListener(document, 'mousemove', updateValue)
useEventListener(document, 'mouseup', stopDragging)
useEventListener(document, 'mouseleave', stopDragging)

// 监听触摸事件
useEventListener(document, 'touchmove', (e) => {
  if (!pressed.value || !sliderRef.value) return
  const touch = e.touches[0]
  const rect = sliderRef.value.getBoundingClientRect()
  const x = Math.min(Math.max(0, touch.clientX - rect.left), rect.width)
  const newPercentage = x / rect.width
  const newValue = Math.round(props.min + (props.max - props.min) * newPercentage)

  // 确保值不小于fixedValue+5且不超过75
  if (newValue >= props.fixedValue + 5 && newValue <= 75) {
    value.value = newValue
    emit('update:modelValue', newValue)
  }
})
useEventListener(document, 'touchend', stopDragging)
</script>

<style scoped>
/* 可以在这里添加自定义样式 */
</style>
