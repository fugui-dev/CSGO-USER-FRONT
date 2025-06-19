<script setup>
import UpgradeSider from '@/components/Sider/UpgradeSiderNew.vue'
import { ref, computed, watch, reactive, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUpgrade } from '../../sever/useUpgrade.js'
import OpenBagModal from '@/views/openBox/components/OpenBagModal.vue'
import { useUserInfo } from '@/composables/useUesrInfo'
import { ElMessage } from 'element-plus'
import { postOpenUpgrade } from '../../sever/api.js'
import UpGradeModal from '../UpGradeModal.vue'
import question from '@/assets/upgrade/open/question.png'
import silderBg from '@/assets/upgrade/open/silderBg.png'
import monde from '@/assets/upgrade/open/monde.png'
import m3Sound from '@/assets/music/m3.mp3'
import { requireImg } from '@/utils/common'
import Money from '@/assets/icons/money.svg'
import endCenter from '@/assets/boxroom/endCenter.png'
// 动画配置参数（提取到顶部方便调试）
const ANIMATION_CONFIG = {
  totalSpins: 5,        // 总旋转圈数
  spinDuration: 7000,   // 快速旋转阶段时间(ms)
  reduceDuration: 2000, // 减速阶段时间(ms)
  modalDelay: 9300      // 弹窗显示延迟时间(ms)
}

const sliderValue = ref(5)
const activeTab = ref('upgrade') // 默认选中升级记录
const router = useRouter()
const { isLogin, fetchUserInfo } = useUserInfo()
const handleTabChange = (tab) => {
  activeTab.value = tab
  // TODO: 这里可以添加切换tab后的其他逻辑
}
const { boxData, RecordData, loading, refreshRecordData, pagination, handlePageChange } = useUpgrade()
const handleBack = () => {
  router.push('/upgrade')
}

const OpenBagModalRef = ref(null)
const OpenModalRef = ref(null)
const openEnd = reactive({})
const selectedBagIds = ref([])
const selectedBagTotalPrice = ref(0)
const selectedItemsData = ref({})
const endPrice = computed(() => {
  return Number((boxData.value.usePrice * (sliderValue.value - itemsPercentage.value) / 100).toFixed(2))
})
// 计算物品总价百分比
const itemsPercentage = computed(() => {
  if (!boxData.value?.usePrice || !selectedBagTotalPrice.value) return 0
  // 计算百分比，限制最大值为70%，并取整
  return Math.min(Math.round((selectedBagTotalPrice.value / boxData.value.usePrice) * 100), 70)
})

const handleOpenBagConfirm = ({ selectedIds, totalPrice, selectedItems, selectedItem }) => {
  selectedBagIds.value = selectedIds
  selectedBagTotalPrice.value = totalPrice
  selectedItemsData.value = selectedItem
  console.log('选中的物品：', selectedItem)
  console.log('选中的物品ID：', selectedIds)
  console.log('选中物品总价格：', totalPrice)

}

// 添加新的响应式变量
const isAnimating = ref(false)
const spinDegrees = ref(0)
let animationFrame = null
let audioPlayer = null

// 添加音频播放函数
const playAudio = () => {
  // 如果已经存在音频播放器，先停止并重置
  if (audioPlayer) {
    audioPlayer.pause()
    audioPlayer.currentTime = 0
  } else {
    // 创建新的音频播放器
    audioPlayer = new Audio(m3Sound)
  }
  // 播放音频
  audioPlayer.play()
}

// 修改动画函数
const startSpinAnimation = () => {
  let startTime = null
  let totalSpins = ANIMATION_CONFIG.totalSpins
  let spinDuration = ANIMATION_CONFIG.spinDuration
  let finalPosition = 0

  // 播放音频
  playAudio()

  // 根据结果确定最终位置区间
  let targetPercentage = 0
  if (openEnd.isVictory) {
    // 成功时，指针停在0到sliderValue之间的特定区间
    const sliderAngle = (sliderValue.value / 100) * 360 // 将sliderValue转换为角度
    // 计算可用的区间数量
    const availableIntervals = Math.floor(sliderAngle / 30) // 每30度一个区间
    // 随机选择一个区间
    const randomInterval = Math.floor(Math.random() * availableIntervals)
    // 计算区间的起始角度
    const intervalStart = randomInterval * 30
    // 在区间内随机一个位置（区间长度为20度）
    const randomOffset = Math.random() * 20
    // 计算最终角度
    targetPercentage = (intervalStart + randomOffset) / 360 * 100
  } else {
    // 失败时，指针停在sliderValue到100之间
    targetPercentage = sliderValue.value + Math.random() * (100 - sliderValue.value)
  }

  // 将百分比转换为角度（360度对应100%）
  const targetAngle = (targetPercentage / 100) * 360

  // 最终位置 = 总旋转圈数 * 360 + 目标角度
  finalPosition = totalSpins * 360 + targetAngle

  const animate = (currentTime) => {
    if (!startTime) startTime = currentTime
    const elapsed = currentTime - startTime
    const duration = spinDuration + ANIMATION_CONFIG.reduceDuration // 总持续时间（快速 + 减速）

    if (elapsed < duration) {
      // 使用 easeInOutQuad 缓动函数
      const progress = elapsed / duration
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      // 计算当前旋转角度
      spinDegrees.value = easeProgress * finalPosition
      animationFrame = requestAnimationFrame(animate)
    } else {
      // 动画结束
      spinDegrees.value = finalPosition
      isAnimating.value = false
      cancelAnimationFrame(animationFrame)
    }
  }

  isAnimating.value = true
  animationFrame = requestAnimationFrame(animate)
}

// 修改handleOpen函数
const handleOpen = () => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录')
    return
  }
  const end = Number((boxData.value.usePrice * (sliderValue.value - itemsPercentage.value) / 100).toFixed(2))
  postOpenUpgrade({
    price: end,
    packageOrnamentId: selectedBagIds.value[0] || null,
    probability: sliderValue.value,
    upgradeOrnamentId: boxData.value.id
  }).then(res => {
    if (res.code === 200) {
      Object.assign(openEnd, res.data)
      startSpinAnimation() // 开始动画
      setTimeout(() => {
        OpenModalRef.value.open() // 延迟显示结果弹窗
      }, ANIMATION_CONFIG.modalDelay)
    }
  })
}

// 修改弹窗关闭监听函数
const handleModalClose = () => {
  console.log('close')
  refreshRecordData()
  selectedBagIds.value = []
  selectedItemsData.value = {}
  selectedBagTotalPrice.value = 0
  sliderValue.value = 5
  fetchUserInfo()
  // 重置指针位置和动画状态
  spinDegrees.value = 0
  isAnimating.value = false
  // 停止音频播放
  if (audioPlayer) {
    audioPlayer.pause()
    audioPlayer.currentTime = 0
  }
  // 清空openEnd对象
  Object.keys(openEnd).forEach(key => {
    openEnd[key] = null
  })
}

const openBag = () => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录')
    return
  }
  OpenBagModalRef.value.open()
}

// 计算圆环周长和进度
const circleRadius = 100
const circumference = computed(() => 2 * Math.PI * circleRadius)
const dashOffset = computed(() => circumference.value * (1 - sliderValue.value / 100))
const mondeRoate = computed(() => {

  return spinDegrees.value

})

// 组件卸载时清理动画和音频
onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  // 清理音频播放器
  if (audioPlayer) {
    audioPlayer.pause()
    audioPlayer = null
  }
})

const scrollContainer = ref(null)

// 添加滚动处理函数
const handleScroll = async (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  // 当滚动到距离底部 50px 时触发加载更多
  if (scrollHeight - scrollTop - clientHeight < 50 && pagination.pageTotal > pagination.pageNum && !loading.value) {
    await handlePageChange(pagination.pageNum + 1)
  }
}

const isMobile = ref(window.innerWidth <= 768)

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768
  })
})

// 添加用于顺序显示圆弧段的变量
const visibleSegments = ref(0)
const animatingTo = ref(0)
let segmentAnimationFrame = null
let lastAnimationTime = 0
const SEGMENT_ANIMATION_INTERVAL = 50 // 毫秒

// 改进动画处理，使用requestAnimationFrame
const animateSegments = (timestamp) => {
  if (!lastAnimationTime) lastAnimationTime = timestamp

  // 控制动画速度
  if (timestamp - lastAnimationTime >= SEGMENT_ANIMATION_INTERVAL) {
    lastAnimationTime = timestamp

    if (visibleSegments.value < animatingTo.value) {
      visibleSegments.value++
      segmentAnimationFrame = requestAnimationFrame(animateSegments)
    } else if (visibleSegments.value > animatingTo.value) {
      visibleSegments.value--
      segmentAnimationFrame = requestAnimationFrame(animateSegments)
    }
  } else {
    segmentAnimationFrame = requestAnimationFrame(animateSegments)
  }
}

// 监视滑块值变化，触发顺序动画
watch(() => sliderValue.value, (newVal) => {
  // 更精确的段数计算方法
  // 使用比例计算，不用取整，让每个段的显示更平滑
  // 每个段代表8.33%的进度
  const segmentPercentage = 100 / 12; // 每段表示的百分比
  
  // 计算当前应该完全显示的段数(整数部分)
  const fullSegments = Math.floor(newVal / segmentPercentage);
  
  // 计算当前部分显示的段的进度(0-1之间的小数)
  const partialSegment = (newVal % segmentPercentage) / segmentPercentage;
  
  // 将当前显示的总段数设置为目标值
  // 这样可以更精确地反映滑块位置，而不是跳变显示
  animatingTo.value = fullSegments + (partialSegment >= 0.5 ? 1 : 0);
  
  // 取消当前正在进行的动画
  if (segmentAnimationFrame) {
    cancelAnimationFrame(segmentAnimationFrame)
    segmentAnimationFrame = null
    lastAnimationTime = 0
  }
  
  // 开始新动画
  segmentAnimationFrame = requestAnimationFrame(animateSegments)
}, { immediate: true })

// 组件卸载时清理资源
onUnmounted(() => {
  if (segmentAnimationFrame) {
    cancelAnimationFrame(segmentAnimationFrame)
  }
})

// 计算每个段的偏移量，支持部分显示
const getSegmentOffset = (index) => {
  const segmentPercentage = 100 / 12;
  const currentPercentage = sliderValue.value;
  
  // 如果当前百分比已经超过了这个段，完全显示
  if (currentPercentage >= index * segmentPercentage) {
    return 0;
  }
  // 如果当前百分比还没到达上一个段，完全隐藏
  else if (currentPercentage < (index - 1) * segmentPercentage) {
    return 35; // 完全隐藏
  }
  // 部分显示当前段
  else {
    // 计算当前段的显示比例
    const progress = (currentPercentage - (index - 1) * segmentPercentage) / segmentPercentage;
    // 根据比例计算偏移量
    return 35 * (1 - progress);
  }
}

</script>

<template>
  <div class="tw-flex tw-relative tw-flex-col ">
    <div class="tw-flex tw-gap-2 tw-mt-8 tw-px-10 tw-mb-5 tw-text-xl md:tw-text-3xl tw-font-bold tw-cursor-pointer tw-text-[#FFF646]"
      style="text-shadow: 0px 0px 4.3px rgba(255, 202, 69, 0.65);" @click="handleBack">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none">
        <path
          d="M19.176 9.8445C20.5785 10.6935 22.299 12.987 23.016 15.747C23.493 17.587 23.692 19.331 23.613 20.979C22.995 19.964 22.5605 19.279 22.3095 18.924C21.9345 18.39 20.3505 16.401 17.892 15.249C16.253 14.481 14.064 14.1655 11.325 14.3025V19.0995L0 10.9455L11.325 2.7915V7.6335C13.138 7.7715 14.5185 7.9405 15.4665 8.1405C17.0635 8.4765 18.3 9.0445 19.176 9.8445Z"
          fill="#FFF646" />
      </svg>
      返回列表
    </div>
    <div class="tw-w-full tw-flex tw-justify-center tw-relative tw-overflow-hidden tw-h-[37.5rem] md:tw-h-auto ">
      <div
        class="tw-flex tw-flex-col tw-w-[75vw] md:tw-w-[31.25rem] tw-top-[-13vw] tw-absolute  tw-items-center tw-justify-center md:tw-top-0 md:tw-left-0  tw-left-[-20vw] md:tw-relative">
        <img :src="requireImg('/openBox/leftVideo.png')" class=" tw-w-full">
        <div
          class="tw-absolute tw-top-1/2 tw-left-1/2 tw-text-center  -tw-translate-x-1/2 -tw-translate-y-1/2 tw-cursor-pointer"
          @click="openBag">
          <img :src="selectedItemsData.imageUrl || question" class="tw-w-[20vw] md:tw-w-[5.625rem] animate-bounce">
          <div class="tw-mt-[15vw] md:tw-mt-[6.25rem]">注入饰品</div>
        </div>
      </div>
      <div
        class="  md:tw-relative tw-absolute tw-bottom-0 tw-w-[20rem] tw-flex-col tw-flex tw-items-center  tw-justify-center  ">
        <div class="tw-w-full tw-h-[20rem] tw-relative tw-flex tw-items-center tw-justify-center">
          <img :src="silderBg" class="tw-w-full tw-absolute tw-top-0 tw-left-0">
          <div class=" tw-text-center tw-mb-2">
            <!-- 圆形进度条 -->
            <div class=" tw-relative tw-w-[13.625rem] tw-h-[13.625rem] tw-translate-y-1">
              <div
                class="tw-absolute tw-top-1/2 tw-h-[calc(100%-42px)] tw-left-1/2 tw-text-center -tw-translate-x-1/2 -tw-translate-y-1/2">
                <div class="tw-w-[1.5rem] tw-h-full tw-flex tw-items-start tw-justify-center"
                  :style="{ transform: `rotate(${mondeRoate}deg)` }">
                  <img :src="monde" class="tw-h-[1.375rem]">
                </div>
              </div>
              <div
                class="tw-absolute tw-top-1/2 tw-h-full tw-w-full tw-flex tw-flex-col tw-items-center tw-justify-center tw-left-1/2 tw-text-center -tw-translate-x-1/2 -tw-translate-y-1/2">
                <img :src="boxData.imageUrl" class="tw-w-[8.5rem]">

              </div>
              <svg class="tw-w-full tw-h-full" viewBox="0 0 233 233">
                <!-- 底色圆环 -->
                <circle cx="116.5" cy="116.5" r="100" fill="none" stroke="#210F0B" stroke-width="23" />

                <!-- 进度圆环 - 使用12段小弧，每段间隔明显 -->
                <g>
                  <!-- 创建12个独立的弧段，每段20度，间隔10度，使用stroke-dasharray实现平滑过渡 -->
                  <path v-for="i in 12" :key="i"
                    :d="`M ${116.5 + 100 * Math.cos((i * 30 - 115) * Math.PI / 180)} ${116.5 + 100 * Math.sin((i * 30 - 115) * Math.PI / 180)} A 100 100 0 0 1 ${116.5 + 100 * Math.cos((i * 30 - 95) * Math.PI / 180)} ${116.5 + 100 * Math.sin((i * 30 - 95) * Math.PI / 180)}`"
                    fill="none" stroke="#FFDC2E" stroke-width="10" :stroke-dasharray="35"
                    :stroke-dashoffset="getSegmentOffset(i)"
                    style="transition: stroke-dashoffset 0.3s ease-out" />
                </g>
              </svg>
            </div>
          </div>
        </div>
        <div class="  tw-flex tw-flex-col tw-items-center tw-gap-2 tw-mt-6">
          <div style="text-shadow: 0px 0px 4.3px rgba(255, 202, 69, 0.65);"
            class="tw-font-bold tw-text-[#FFF646] tw-text-xl md:tw-text-4xl"> {{ sliderValue
            }}%</div>
          <span class=" tw-text-sm md:tw-text-lg">目标饰品：<span class="tw-text-[#FFF646]">{{ boxData.shortName }}</span>
          </span>
          <span class="tw-text-white/70 tw-text-xs md:tw-text-sm">滑动可调整您的幸运值
          </span>
        </div>
      </div>
      <div
        class="tw-flex tw-flex-col tw-w-[75vw]  md:tw-w-[31.25rem] tw-top-[-13vw]  tw-items-center tw-justify-center md:tw-top-0 md:tw-right-0 tw-right-[-20vw] tw-absolute md:tw-relative">
        <img :src="requireImg('/openBox/rightVideo.png')" class="tw-w-full">
        <div class="tw-absolute tw-top-1/4 tw-left-1/2 tw-text-center  -tw-translate-x-1/2">
          <img :src="boxData.imageUrl" class="tw-w-[20vw] md:tw-w-[10rem] animate-bounce">
        </div>
      </div>
    </div>
    <div class="tw-px-5 tw-py-10 md:tw-pt-0 tw-flex tw-justify-center tw-flex-col tw-items-center tw-gap-5 tw-relative tw-z-10">
      <UpgradeSider v-model="sliderValue" :min="0" :max="100" :fixedValue="itemsPercentage" />
      <div @click="handleOpen"
        class="boxshadowBtn md:tw-w-[24.75rem] tw-w-[13.75rem]  tw-duration-300 tw-transform tw-py-1.5 md:tw-py-3  tw-flex tw-text-xl tw-items-center tw-cursor-pointer tw-bg-[#2E110B] tw-rounded-full   tw-justify-center">
        <span class="tw-flex tw-items-center tw-gap-2 md:tw-text-base tw-text-sm"><img :src="Money"
            class="tw-h-[1rem] md:tw-h-[1.75rem]" /> {{
              endPrice }}
          <span class="md:tw-text-2xl tw-text-xl tw-font-bold">升级</span></span>
      </div>
    </div>
    <div
      class="tw-w-full tw-flex tw-justify-center tw-items-center tw-fixed tw-bottom-0 tw-translate-y-1/2 tw-left-1/2 tw-translate-x-[-50%]">
      <img :src="endCenter" class="tw-tw-absolute" />
    </div>
    <div class="tw-w-full tw-flex tw-flex-col lg:tw-pb-[10rem] tw-relative">

      <div class="tw-flex tw-gap-2 tw-mt-8 tw-px-10 tw-mb-5 tw-text-xl md:tw-text-3xl tw-font-bold tw-text-[#FFF646]"
        style="text-shadow: 0px 0px 4.3px rgba(255, 202, 69, 0.65);">
        升级记录
      </div>
      <!-- 修改记录列表容器 -->

      <div class="tw-flex tw-w-full tw-justify-center tw-items-start tw-flex-col lg:tw-px- tw-relative tw-py-4">
        <div class="tw-flex tw-flex-col tw-gap-2 tw-w-full tw-min-h-[400px]" @scroll="handleScroll"
          ref="scrollContainer">

          <!-- 记录列表 -->
          <div v-for="(item, index) in RecordData" :key="item.id"
            class="tw-relative tw-w-full tw-max-w-[90%] lg:tw-max-w-[85%] tw-min-h-[5rem] md:tw-min-h-[6rem] tw-bg-gradient-to-r tw-from-[#211a0e]/70 tw-to-[#2d2211]/90 tw-rounded-xl tw-overflow-hidden tw-group tw-transition-all tw-duration-300 hover:tw-scale-[1.02] hover:tw-shadow-[0_0_15px_rgba(255,202,69,0.3)] tw-backdrop-blur-sm tw-border tw-border-[#3a3120] hover:tw-border-[#FFC43C]/50 tw-mx-auto"
            :style="{
              animationDelay: `${index * 0.1}s`,
              opacity: loading.value ? '0.5' : '1',
              pointerEvents: loading.value ? 'none' : 'auto'
            }">
            <!-- 左侧发光边框效果 -->
            <div
              class="tw-absolute tw-left-0 tw-top-0 tw-w-1 tw-h-full tw-bg-gradient-to-b tw-from-[#FFC43C] tw-to-[#E36C0A] tw-opacity-70 group-hover:tw-opacity-100 tw-transition-all">
            </div>

            <!-- 内容区域 -->
            <div
              class="tw-absolute tw-justify-between tw-w-full tw-h-full tw-left-0 tw-top-0 tw-flex tw-items-center tw-px-4 md:tw-px-8">
              <!-- 左侧：武器图片和名称 -->
              <div class="tw-flex tw-items-center tw-gap-4">
                <!-- 武器图片容器 -->
                <div
                  class="tw-relative tw-w-[4rem] md:tw-w-[5rem] tw-h-[3.5rem] md:tw-h-[4.5rem] tw-bg-gradient-to-br tw-from-[#2d2211] tw-to-[#1c1509] tw-rounded-lg tw-border tw-border-[#3a3120] tw-flex tw-items-center tw-justify-center tw-overflow-hidden group-hover:tw-shadow-[0_0_10px_rgba(255,202,69,0.3)] tw-transition-all">
                  <!-- 发光背景效果 -->
                  <div
                    class="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-[#FFC43C]/10 tw-to-transparent tw-opacity-0 group-hover:tw-opacity-100 tw-transition-all">
                  </div>

                  <!-- 武器图片 -->
                  <img :src="item.gainOrnamentList[0].ornamentImgUrl"
                    class="tw-w-[90%] tw-h-auto tw-object-contain tw-transition-all tw-duration-300 group-hover:tw-scale-110"
                    alt="武器" loading="lazy">
                </div>

                <!-- 武器名称 -->
                <div class="tw-font-bold tw-text-white tw-flex tw-flex-col tw-h-full tw-justify-center">
                  <span
                    class="tw-text-base md:tw-text-lg tw-drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:tw-text-[#FFF646] tw-transition-colors">
                    {{ item.gainOrnamentList[0].ornamentName }}
                  </span>

                  <!-- 移动端：概率和时间 -->
                  <div class="tw-flex md:tw-hidden tw-gap-2 tw-text-xs tw-text-white/80">
                    <span class="tw-bg-[#2d2211] tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[#FFF646]">
                      {{ item.probability }}%
                    </span>
                    <span class="tw-text-[10px] tw-opacity-70">{{ item.openTime }}</span>
                  </div>
                </div>
              </div>

              <!-- 右侧：概率和时间（桌面端） -->
              <div class="tw-hidden md:tw-flex tw-justify-between tw-gap-10 tw-items-center">
                <!-- 概率 -->
                <div
                  class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-bg-[#2d2211]/70 tw-px-4 tw-py-1 tw-rounded-full tw-shadow-inner">
                  <span class="tw-text-xs tw-text-white/70">选择概率</span>
                  <span class="tw-text-[#FFF646] tw-font-bold tw-text-xl group-hover:tw-scale-110 tw-transition-all">
                    {{ item.probability }}%
                  </span>
                </div>

                <!-- 时间 -->
                <span
                  class="tw-px-4 tw-py-1 tw-text-white/70 tw-rounded-md tw-bg-[#2d2211]/40 tw-border tw-border-[#3a3120]/50">
                  {{ item.openTime }}
                </span>
              </div>
            </div>

            <!-- 装饰性圆点 -->
            <div
              class="tw-absolute tw-right-3 tw-bottom-3 tw-w-2 tw-h-2 tw-rounded-full tw-bg-[#FFC43C] tw-opacity-50 group-hover:tw-opacity-100 tw-transition-all tw-animate-ping tw-animate-duration-[3s]">
            </div>
          </div>

          <!-- 无数据状态 -->
          <div v-if="RecordData.length === 0"
            class="tw-text-center tw-py-10 tw-text-white/50 tw-italic tw-min-h-[200px] tw-flex tw-items-center tw-justify-center">
            暂无升级记录
          </div>

          <!-- 添加加载状态指示器 -->
          <div v-if="loading.value"
            class="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-[#2d2211]/20 tw-backdrop-blur-sm">
            <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
              <div
                class="tw-w-8 tw-h-8 tw-border-2 tw-border-[#FFC43C] tw-border-t-transparent tw-rounded-full tw-animate-spin">
              </div>
              <span class="tw-text-[#FFF646] tw-text-sm">加载中...</span>
            </div>
          </div>
        </div>

        <!-- 分页器 -->
        <div class="tw-flex tw-justify-center tw-w-full tw-mt-4 upgrade-open">
          <el-pagination v-if="pagination.pageTotal > 0" background layout="prev, pager, next"
            :total="pagination.pageTotal" :current-page="pagination.pageNum" :page-size="pagination.pageSize"
            :small="isMobile" @current-change="handlePageChange" :disabled="loading.value" class="custom-pagination" />
        </div>
      </div>

    </div>
  </div>
  <OpenBagModal ref="OpenBagModalRef" :activesNums="1" :selectedIds="selectedBagIds" :usePrice="boxData.usePrice"
    :selectedBagTotalPrice="selectedBagTotalPrice" @confirm="handleOpenBagConfirm" />
  <UpGradeModal ref="OpenModalRef" :openData="openEnd" @close="handleModalClose" />
</template>
<style scoped lang="scss">
.boxshadowBtn {
  background: linear-gradient(93deg, #FFC43C 7.24%, #E36C0A 98.65%);
  box-shadow: 0px 4px 13.4px 0px rgba(225, 128, 36, 0.49);
}

.animate-bounce {
  animation: 2.5s linear 0s infinite normal none running sclas;
  ;
}

@keyframes sclas {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }

}


/* 进度圆环 */
.progress-circle {
  transition: stroke-dashoffset 0.5s ease;
  filter: drop-shadow(0 0 3px rgba(88, 94, 249, 0.7));
}



:deep(.el-pager li) {
  background-color: rgba(38, 39, 92, 0.2) !important;
  border: 1px solid #26275c;
  color: #fff !important;
  border-radius: 0.25rem;
  transition: all 0.3s;
  margin: 0 2px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(38, 39, 92, 0.5), transparent);
    transition: all 0.3s;
  }

  &:hover {
    transform: translateY(-2px);

    &::before {
      top: 0;
    }
  }
}

:deep(.el-pager li.is-active) {
  background-color: rgba(38, 39, 92, 0.4) !important;
  border: 1px solid #26275c;
  border-radius: 0.25rem;
  color: #fff !important;
  font-weight: bold;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(38, 39, 92, 0.7);
}

:deep(.btn-prev),
:deep(.btn-next) {
  background-color: rgba(38, 39, 92, 0.2) !important;
  border: 1px solid #26275c;
  color: #fff !important;
  border-radius: 0.25rem;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -100%;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(38, 39, 92, 0.5), transparent);
    transition: all 0.3s;
  }

  &:hover:not(.is-disabled) {
    transform: translateY(-2px);

    &::before {
      top: 0;
    }
  }

  &.is-disabled {
    border-color: #666 !important;
    color: #666 !important;
    cursor: not-allowed;
    opacity: 0.5;
  }

  .el-icon {
    color: #fff !important;
    position: relative;
    z-index: 1;
  }
}

/* 发光效果 */
.glow-effect {
  filter: blur(5px);
}

/* 中心内容样式 */
.progress-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.progress-value {
  font-size: 48px;
  font-weight: bold;
  color: #585ef9;
  text-shadow: 0 0 10px rgba(88, 94, 249, 0.5);
  line-height: 1;
  margin-bottom: 5px;
}

.progress-label {
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 15px;
  opacity: 0.8;
}

/* 控制按钮 */
.progress-controls {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.control-btn,
.confirm-btn {
  border: 1px solid #585ef9;
  background: rgba(24, 29, 45, 0.8);
  color: #ffffff;
  font-size: 18px;
  border-radius: 4px;
  transition: all 0.3s;
  padding: 2px 10px;
}

.control-btn {
  width: 32px;
  height: 32px;
}

.confirm-btn {
  padding: 5px 20px;
  background: rgba(88, 94, 249, 0.2);
}

.control-btn:hover,
.confirm-btn:hover {
  background: rgba(88, 94, 249, 0.3);
  box-shadow: 0 0 8px rgba(88, 94, 249, 0.6);
}

/* 刻度线动画 */
.ticks line {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    stroke-opacity: 0.3;
  }

  50% {
    stroke-opacity: 0.7;
  }

  100% {
    stroke-opacity: 0.3;
  }
}

/* 装饰圆圈 */
.deco-circle {
  opacity: 0.5;
}

/* 添加闪光动画 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%) skewX(-45deg);
  }

  100% {
    transform: translateX(200%) skewX(-45deg);
  }
}

.tw-animate-shimmer {
  animation: shimmer 3s infinite;
}

/* 添加新的记录项动画 */
.tw-group {
  animation: fadeInUp 0.3s ease-out backwards;
  will-change: transform, opacity;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 优化加载状态过渡 */
.tw-group {
  transition: opacity 0.2s ease;
}

/* 调整动画持续时间 */
.tw-animate-duration-\[3s\] {
  animation-duration: 3s;
}

/* 修改分页器样式 */
:deep(.custom-pagination) {
  --el-pagination-bg-color: rgba(45, 34, 17, 0.7);
  --el-pagination-hover-color: #FFF646;
  --el-pagination-button-color: #fff;
  --el-pagination-button-bg-color: transparent;
  --el-pagination-button-disabled-color: rgba(255, 255, 255, 0.3);
  --el-pagination-button-disabled-bg-color: rgba(45, 34, 17, 0.4);
  --el-pagination-border-radius: 4px;

  .el-pager li {
    background-color: rgba(45, 34, 17, 0.7);
    border: 1px solid rgba(58, 49, 32, 0.5);
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;

    &:hover {
      color: #FFF646;
      border-color: #FFC43C;
    }

    &.is-active {
      background-color: #FFC43C;
      color: white;
      border-color: #E36C0A;
      box-shadow: 0 0 10px rgba(255, 202, 69, 0.3);
    }
  }

  .btn-prev,
  .btn-next {
    background-color: rgba(45, 34, 17, 0.7);
    border: 1px solid rgba(58, 49, 32, 0.5);
    color: rgba(255, 255, 255, 0.7);
    transition: all 0.3s ease;

    &:hover {
      color: #FFF646;
      border-color: #FFC43C;
    }

    &:disabled {
      color: rgba(255, 255, 255, 0.3);
      border-color: rgba(58, 49, 32, 0.3);
    }
  }

  .el-icon {
    color: currentColor;
  }
}
</style>
