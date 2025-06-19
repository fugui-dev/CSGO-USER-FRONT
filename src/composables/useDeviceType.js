import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useDeviceType = (options = {}) => {
  const windowSize = ref({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight
  })
 
  // 判断是否为PC端
  const isPC = computed(() => {
    return windowSize.value.innerWidth >= 768
  })

  // 创建style标签
  let styleElement = null

  // 监听窗口大小变化
  const handleResize = () => {
    windowSize.value = {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    isPC,
  }
} 