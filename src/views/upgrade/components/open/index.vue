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
import Money from '@/assets/images/upgrade/coin.png'
import endCenter from '@/assets/boxroom/endCenter.png'
import upgradeRecordImg from '@/assets/images/upgrade/upgrade_record.png'
import logoBg1 from '@/assets/images/upgrade/logo_bg1.png'
import logoBg2 from '@/assets/images/upgrade/logo_bg2.png'
import logoBg3 from '@/assets/images/upgrade/logo_bg3.png'
import logoBg4 from '@/assets/images/upgrade/logo_bg4.png'
import back from '@/assets/images/upgrade/back.png'
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
    // 成功时，指针停在0到sliderValue之间（不包括sliderValue本身）
    // 确保至少有一个小的范围，避免边界问题
    const minRange = 0
    const maxRange = Math.max(0.1, sliderValue.value - 0.1) // 确保不超过sliderValue，留0.1%的缓冲
    // 在范围内随机选择位置
    targetPercentage = minRange + Math.random() * (maxRange - minRange)
    // 确保不超过sliderValue
    targetPercentage = Math.min(targetPercentage, sliderValue.value - 0.01)
  } else {
    // 失败时，指针停在sliderValue到100之间（不包括sliderValue本身）
    // 确保至少有一个小的范围，避免边界问题
    const minRange = Math.min(99.9, sliderValue.value + 0.1) // 确保大于sliderValue，留0.1%的缓冲
    const maxRange = 100
    // 在范围内随机选择位置
    targetPercentage = minRange + Math.random() * (maxRange - minRange)
    // 确保大于sliderValue
    targetPercentage = Math.max(targetPercentage, sliderValue.value + 0.01)
    // 确保不超过100
    targetPercentage = Math.min(targetPercentage, 100)
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

</script>

<template>
  <div class="tw-flex tw-relative tw-flex-col ">
    <div class="tw-flex tw-gap-2 tw-mt-8 tw-px-10 tw-mb-5 tw-text-xl md:tw-text-[14px] tw-font-bold tw-cursor-pointer tw-text-[#B1C5C7]"
 @click="handleBack">
      <img :src="back" alt="" class="tw-w-[2rem] tw-h-[1.8rem]">
      返回
    </div>
    <div class="tw-w-full tw-flex tw-justify-center tw-relative tw-overflow-hidden tw-h-[37.5rem] md:tw-h-auto">
      <div
        class="tw-flex tw-flex-col tw-w-[75vw] md:tw-w-[31.25rem] tw-top-[-13vw] tw-absolute  tw-items-center tw-justify-center md:tw-top-[-8vh] md:tw-left-0  tw-left-[-20vw] md:tw-relative">
        <img :src="logoBg1" class="tw-w-[240px]">
        <div
          class="tw-absolute tw-top-1/3 tw-left-1/2 tw-text-center  -tw-translate-x-1/2 tw-cursor-pointer tw-flex tw-flex-col tw-items-center"
          @click="openBag">
          <img :src="selectedItemsData.imageUrl || question" class="tw-w-[20vw] md:tw-w-[5.625rem] animate-bounce tw-h-auto">
          <div class="tw-mt-[2vw] md:tw-mt-[1rem] tw-text-white tw-text-sm md:tw-text-base tw-leading-none">注入饰品</div>
          <div v-if="selectedItemsData.ornamentName" class="tw-mt-2 tw-text-[#FFF646] tw-text-xs md:tw-text-sm tw-max-w-[20vw] md:tw-max-w-[200px] tw-text-center tw-break-words tw-px-2" :title="selectedItemsData.ornamentName">
            {{ selectedItemsData.ornamentName }}
          </div>
          <div v-if="selectedItemsData.ornamentsPrice" class="tw-mt-1 tw-text-white tw-text-xs md:tw-text-sm tw-flex tw-items-center tw-justify-center tw-gap-1">
            <img :src="Money" class="tw-h-3 md:tw-h-4" />
            <span>{{ selectedItemsData.ornamentsPrice?.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      <div
        class="  md:tw-relative tw-absolute tw-bottom-0 tw-w-[20rem] tw-flex-col tw-flex tw-items-center  tw-justify-center tw-mt-10 ">
        <div class="tw-w-full tw-h-[20rem] tw-relative tw-flex tw-items-center tw-justify-center">
          <img :src="logoBg4" class="tw-w-[260px] tw-absolute tw-top-0 tw-left-0 logo-bg4">
          <img :src="logoBg2" class="tw-w-[180px] tw-absolute tw-top-[0.3rem] tw-left-0 logo-bg2">
          <div class=" tw-text-center tw-mb-2">
            <!-- 圆形进度条 -->
            <div class=" tw-relative tw-w-[19.625rem] tw-h-[19.625rem] tw-translate-y-1">
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
                <circle cx="116.5" cy="116.5" r="100" fill="none" stroke="#210F0B" stroke-width="20" />

                <!-- 进度圆环 - 连续显示 -->
                <circle 
                  cx="116.5" 
                  cy="116.5" 
                  r="100" 
                  fill="none" 
                  stroke="#FFDC2E" 
                  stroke-width="10"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="dashOffset"
                  stroke-linecap="round"
                  transform="rotate(-90 116.5 116.5)"
                  style="transition: stroke-dashoffset 0.3s ease-out" />
              </svg>
            </div>
          </div>
        </div>
        <div class="tw-flex tw-flex-col tw-items-center tw-gap-2 tw-mt-6">
          <div
            class="tw-font-bold tw-text-[#FFFFFF] tw-text-xl md:tw-text-[21px]"> {{ sliderValue
            }}%</div>
          <span class="tw-text-white/70 tw-text-xs md:tw-text-sm md:tw-text-[14px] tw-text-[#FFFFFF] tw-mb-[10px] tw-mt-[14px]">滑动可调整您的幸运值
          </span>
        </div>
      </div>
      <div
        class="tw-flex tw-flex-col tw-w-[75vw]  md:tw-w-[31.25rem] tw-top-[-13vw]  tw-items-center tw-justify-center md:tw-top-[-8vh] md:tw-right-0 tw-right-[-20vw] tw-absolute md:tw-relative">
        <img :src="logoBg3" class="tw-w-[240px]">
        <div class="tw-absolute tw-top-1/3 tw-left-1/2 tw-text-center  -tw-translate-x-1/2 tw-flex tw-flex-col tw-items-center">
          <img :src="boxData.imageUrl" class="tw-w-[20vw] md:tw-w-[5.625rem] animate-bounce tw-h-auto">
          <div class="tw-mt-[8vw] md:tw-mt-[2.5rem] tw-text-white tw-text-sm md:tw-text-base tw-leading-none">目标饰品</div>
          <div v-if="boxData.ornamentName || boxData.shortName || boxData.name" class="tw-mt-2 tw-text-[#FFF646] tw-text-xs md:tw-text-sm tw-max-w-[20vw] md:tw-max-w-[200px] tw-text-center tw-break-words tw-px-2" :title="boxData.ornamentName || boxData.shortName || boxData.name">
            {{ boxData.ornamentName || boxData.shortName || boxData.name }}
          </div>
          <div v-if="boxData.usePrice" class="tw-mt-1 tw-text-white tw-text-xs md:tw-text-sm tw-flex tw-items-center tw-justify-center tw-gap-1">
            <img :src="Money" class="tw-h-3 md:tw-h-4" />
            <span>{{ Number(boxData.usePrice).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="tw-px-5 tw-py-10 md:tw-pt-0 tw-flex tw-justify-center tw-flex-col tw-items-center tw-gap-5 tw-relative tw-z-10">
      <UpgradeSider v-model="sliderValue" :min="0" :max="100" :fixedValue="itemsPercentage" />
      <div @click="handleOpen"
        class="boxshadowBtn tw-mt-[10px] md:tw-w-[14.75rem] tw-w-[13.75rem]  tw-duration-300 tw-transform tw-py-1.5 md:tw-py-3  tw-flex tw-text-xl tw-items-center tw-cursor-pointer tw-bg-[#2E110B] tw-justify-center">
        <span class="tw-flex tw-items-center tw-gap-2 md:tw-text-base tw-text-2xl"><img :src="Money"
            class="tw-h-[2rem] md:tw-h-[2.3rem] tw-mr-[4px]"/> {{
              endPrice }}
          <span class="md:tw-text-1.8xl tw-text-xl tw-font-bold tw-ml-[8px]">升级</span></span>
      </div>
    </div>
    <!-- <div
      class="tw-w-full tw-flex tw-justify-center tw-items-center tw-fixed tw-bottom-0 tw-translate-y-1/2 tw-left-1/2 tw-translate-x-[-50%]">
      <img :src="endCenter" class="tw-tw-absolute" />
    </div> -->
    <div class="tw-w-full tw-flex tw-flex-col lg:tw-pb-[10rem] tw-relative">

      
      <!-- 修改记录列表容器 -->

      <div class="tw-flex tw-w-full tw-justify-center tw-items-start tw-flex-col lg:tw-px- tw-relative tw-py-4">
        <div class="record-title">升级记录</div>
        <div class="tw-flex tw-flex-col tw-gap-2 tw-w-full tw-min-h-[400px]" @scroll="handleScroll"
          ref="scrollContainer">

          <!-- 记录列表 -->
          <div v-for="(item, index) in RecordData" :key="item.id"
            class="tw-relative tw-w-full tw-max-w-[90%] lg:tw-max-w-[85%] tw-min-h-[4rem] md:tw-min-h-[4rem] tw-bg-[#44616D]/25 tw-overflow-hidden tw-group tw-transition-all tw-duration-300 hover:tw-scale-[1.02] hover:tw-shadow-[0_0_15px_rgba(130,130,130,0.6)] tw-backdrop-blur-sm tw-border tw-border-[#808080] tw-border-dashed hover:tw-border-[#808080]/50 tw-mx-auto"
            :style="{
              animationDelay: `${index * 0.1}s`,
              opacity: loading.value ? '0.5' : '1',
              pointerEvents: loading.value ? 'none' : 'auto'
            }">

            <!-- 内容区域 -->
            <div
              class="tw-absolute tw-justify-between tw-w-full tw-h-full tw-left-0 tw-top-0 tw-flex tw-items-center tw-px-4 md:tw-px-8">
              <!-- 左侧：武器图片和名称 -->
              <div class="tw-flex tw-items-center tw-gap-4">
                <!-- 武器图片容器 -->
                <div
                  class="tw-relative tw-w-[4rem] md:tw-w-[5rem] tw-h-[3.5rem] md:tw-h-[4.5rem] tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-overflow-hidden tw-transition-all">
                  
                  <!-- 武器图片 -->
                  <img :src="item.gainOrnamentList[0].ornamentImgUrl"
                    class="tw-w-[90%] tw-h-auto tw-object-contain tw-transition-all tw-duration-300 group-hover:tw-scale-110"
                    alt="武器" loading="lazy">
                </div>

                <!-- 武器名称 -->
                <div class="tw-font-bold tw-text-white tw-flex tw-flex-col tw-h-full tw-justify-center">
                  <span
                    class="tw-text-base md:tw-text-[14px] tw-drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:tw-text-[#FCBE46] tw-transition-colors">
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
                  class="tw-flex tw-flex-row tw-items-center tw-justify-center tw-px-4 tw-py-1 tw-shadow-inner">
                  <span class="tw-text-[14px] tw-text-white tw-mr-[6px]">选择概率</span>
                  <span class="tw-text-[#FCBE46] tw-font-bold tw-text-[14px] group-hover:tw-scale-110 tw-transition-all">
                    {{ item.probability }}%
                  </span>
                </div>

                <!-- 时间 -->
                <span
                  class="tw-px-4 tw-py-1 tw-text-[14px] tw-text-white tw-rounded-md">
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
  background: url('@/assets/images/login/yellow_btn.png') no-repeat;
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

.logo-bg2 {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.logo-bg4 {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}


/* 进度圆环 */
.progress-circle {
  transition: stroke-dashoffset 0.5s ease;
  filter: drop-shadow(0 0 3px rgba(88, 94, 249, 0.7));
}
.short-name {
  background-color: #343A3E;
  padding: 0 32px;
  height: 30px;
  border-radius: 15px;
  font-size: 14px;
  color: #fff;
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
.record-title {
  background: url('@/assets/images/upgrade/upgrade_record.png') no-repeat;
  background-size: 86% 100%;
  background-position: 50% 50%;
  height: 54px;
  overflow: hidden;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
</style>
