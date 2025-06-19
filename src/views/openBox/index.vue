<script setup>
import { ref, onMounted, computed, reactive, watch, onUnmounted } from "vue"
import Box from '@/components/Box/NewBoxs.vue'
import { openBoxBind, openBoxInject } from "./server/api"
import { useOpen } from '@/views/openBox/server/useOpen.js'
import OpenModal from './components/OpenModal.vue'
import OpenBagModal from './components/OpenBagModal.vue'
import { useUserInfo } from '@/composables/useUesrInfo'
import Decimal from 'decimal.js'
import { ElMessage } from 'element-plus'
import LuckyModal from './components/LuckyModal.vue'
import HeaderBg from '@/assets/openBox/headerBg.png'
import HeaderLeft from '@/assets/openBox/headerLeft.png'
import LuckyStar from '@/assets/openBox/luckyStar.png'
import TitleYinhua from '@/assets/openBox/titleYinhua.png'
import { requireImg } from '@/utils/common'
import { useThrottleFn } from "@vueuse/core"
import boxLeft from '@/assets/openBox/boxLeft.png'
import boxRight from '@/assets/openBox/boxRight.png'
import downOpen from '@/assets/openBox/downOpen.svg'
import Taiji1 from '@/assets/icons/taiji_1.svg'
import Taiji2 from '@/assets/icons/taiji_2.svg'
import Money from '@/assets/icons/money.svg'
import init from '@/assets/music/init.wav'
import MoreModal from './components/MoreModal.vue'
import { level } from '@/lib/leavel'
const arr = [1, 2, 3, 4, 5]

const OpenModalRef = ref(null)
const OpenBagModalRef = ref(null)
const LuckyModalRef = ref(null)
const active = ref(1)
const selectedBagIds = ref([])
const selectedBagTotalPrice = ref(0)
const selectTab = ref(true)
const MoreModalRef = ref(null)
const choseNum = (num) => {
  if (isLoading.value) return ElMessage.warning('正在开箱中，请耐心等待！')
  active.value = num;
}
const localSet = reactive({
  animation: true,
  music: true
})
const changeSet = (set) => {
  if (set === 'animation') {
    localSet.animation = !localSet.animation
    if (!localSet.animation) {
      localSet.music = false
    }
  }
  if (set === 'music') {
    if (localSet.animation) {
      localSet.music = !localSet.music
    } else {
      ElMessage.warning('请先开启动画效果')
    }
  }
}
const { boxData, boxId, luckyboxData, boxHistoryData, loading, fetchData } = useOpen({ active })
const endPrice = computed(() => {
  try {
    if (boxData && boxData.price !== undefined && active.value !== undefined) {
      // 确保输入值有效
      const boxPrice = Number(boxData.price);
      const activeValue = Number(active.value);

      if (isNaN(boxPrice) || isNaN(activeValue)) {
        return 0; // 如果输入无效，返回0
      }

      // 使用 Decimal.js 进行精确计算
      const price = new Decimal(activeValue).times(boxPrice);
      // 格式化为字符串并移除末尾的零
      return price.toFixed(2).replace(/\.?0+$/, '') || 0;
    }
    return 0;
  } catch (error) {
    console.error('计算价格时出错:', error);
    return 0; // 出现任何错误时返回0
  }
})

const formattedEndPrice = computed(() => {
  return Number(endPrice.value).toFixed(2)
})

// 计算饰品注能百分比
const energyPercentage = computed(() => {
  if (endPrice.value === 0) return 0
  const percentage = (selectedBagTotalPrice.value / endPrice.value) * 100
  return Math.min(percentage, 100) // 限制最大值为100
})

const { userInfo, isLogin, fetchUserInfo } = useUserInfo()

// 计算喷管能量百分比
const sprayPercentage = computed(() => {
  if (!isLogin.value) return 0

  const currentUserInfo = userInfo.value
  if (!currentUserInfo?.accountCredits || !endPrice.value) return 0

  // 使用decimal.js进行精确计算
  const credits = new Decimal(currentUserInfo.accountCredits)
  const price = new Decimal(endPrice.value)
  const percentage = credits.div(price).mul(100)

  return Math.min(percentage.toNumber(), 100)
})

// 格式化百分比显示
const formatPercentage = (value) => {
  if (typeof value === 'number') {
    return Math.floor(value)
  }
  return 0
}

const isShake = ref(false)
const openEnd = ref([])
const isLoading = ref(false)

// 添加这些变量来控制动画状态
const imagesLoaded = ref(false)
const boxImg01Loaded = ref(false)
const boxImg02Loaded = ref(false)
const showDropAnimation = ref(false)
const showInitAnimation = ref(false)
const showFloatAnimation = ref(false)
const music = new Audio(init)
// 图片加载处理函数
const handleBoxImg01Load = () => {
  boxImg01Loaded.value = true
  checkImagesLoaded()
}

const handleBoxImg02Load = () => {
  boxImg02Loaded.value = true
  checkImagesLoaded()
}

// 检查两张图片是否都已加载完成
const checkImagesLoaded = () => {
  if (boxImg01Loaded.value && boxImg02Loaded.value) {
    imagesLoaded.value = true

    // 图片加载完成后，先执行掉落动画
    showDropAnimation.value = true
    music.play()
    // 掉落动画结束后（约0.6秒）执行initAnimation
    setTimeout(() => {
      showDropAnimation.value = false
      showInitAnimation.value = true

      // initAnimation结束后（约0.9秒）执行浮动动画
      setTimeout(() => {
        showInitAnimation.value = false
        showFloatAnimation.value = true
      }, 900) // 摇晃动画时长为0.9秒，不再有延迟
    }, 600) // 掉落动画时长为0.5s + 一点缓冲时间
  }
}

// 普通开箱方法
const handleOpen = () => {
  // 检查登录状态
  if (!isLogin.value) {
    ElMessage.warning('请先登录')
    return
  }

  // 检查余额是否足够
  if (!userInfo.value?.accountAmount || userInfo.value.accountAmount < endPrice.value) {
    ElMessage.warning('余额不足')
    return
  }
  if (isLoading.value) return ElMessage.warning('正在开箱中，请耐心等待！')
  isLoading.value = true // 开始loading

  openBoxBind({ boxId, num: active.value }).then((res) => {
    if (res.code === 200) {
      // 替换为正确的方式处理返回数据
      if (Array.isArray(res.data)) {
        // 如果是数组，直接清空并添加新元素
        openEnd.value = res.data
        OpenModalRef.value.open()
      } else {
        // 如果没有数据，设置为空数组
        openEnd.value = []
      }
    }
  }).catch(err => {
    ElMessage.error('请求繁忙，请重试')
  }).finally(() => {
    isLoading.value = false // 结束loading
  })
}


// 注入开箱方法
const injectOpen = () => {
  // 检查登录状态
  if (!isLogin.value) {
    ElMessage.warning('请先登录')
    return
  }

  // 检查是否选择了饰品
  if (selectedBagIds.value.length === 0) {
    ElMessage.warning('请先选择饰品')
    return
  }

  // 检查饰品注能是否达到100%
  if (energyPercentage.value < 100) {
    ElMessage.warning('饰品注能未达到100%')
    return
  }


  openBoxInject({
    boxId,
    num: active.value,
    packageIds: selectedBagIds.value
  }).then((res) => {
    if (res.code === 200) {
      // 替换为正确的方式处理返回数据
      if (Array.isArray(res.data)) {
        // 如果是数组，直接清空并添加新元素
        openEnd.value = res.data
        OpenModalRef.value.open()
      } else {
        // 如果没有数据，设置为空数组
        openEnd.value = []
      }
    }
    console.log(res.data)
  }).catch(err => {
    ElMessage.error('请求繁忙，请重试')
    // 重置摇动状态

  })

}
const openBag = () => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录')
    return
  }
  OpenBagModalRef.value.open()
}
const isShow = ref(false);
const isActive = ref(false)
const checkActive = (active) => {
  isActive.value = active
}

const handleOpenBagConfirm = ({ selectedIds, totalPrice }) => {
  selectedBagIds.value = selectedIds
  selectedBagTotalPrice.value = totalPrice
}

// 在script部分添加检测设备的方法
const isMobile = ref(false)

onMounted(() => {
  music.src = init
  music.load()
  fetchUserInfo()
  checkDevice()
  window.addEventListener('resize', checkDevice)
  // 刷新页面时也重置动画状态
  resetAnimationState()

})
const moreData = ref({})
const handleMore = (item) => {
  console.log(JSON.parse(JSON.stringify(item)))
  moreData.value = item
  MoreModalRef.value.open()
}
// 添加卸载事件清理
onUnmounted(() => {
  window.removeEventListener('resize', checkDevice)
})

const checkDevice = () => {
  isMobile.value = window.innerWidth <= 768
}

const videoRef = ref(null)
const audioRef = ref(null)

// 简化 handleModalClose 函数
const handleModalClose = () => {

  // 重新获取数据
  fetchData()
  // 重新获取用户信息
  fetchUserInfo()
  // 清空选中的背包数据
  selectedBagIds.value = []
  selectedBagTotalPrice.value = 0
  // 确保摇动状态被重置
  isShake.value = false
}


// 在script部分添加boxId的watch
watch(() => boxId, () => {
  // 当箱子ID变化时，重置动画状态
  resetAnimationState()
})

// 重置动画状态的函数
const resetAnimationState = () => {
  imagesLoaded.value = false
  boxImg01Loaded.value = false
  boxImg02Loaded.value = false
  showDropAnimation.value = false
  showInitAnimation.value = false
  showFloatAnimation.value = false
}

</script>
<template>
  <Layout>
    <template #item>
      <div class="tw-flex tw-w-full tw-justify-center">
        <div class=" tw-flex-col tw-relative   tw-w-full">
          <div class="tw-w-full tw-flex tw-justify-between tw-mt-4  tw-px-4 md:tw-px-0">
            <div class="gradient-CA3E27 tw-p-2 tw-flex tw-items-center">
              饰品军需
            </div>
            <div class="tw-flex tw-gap-6">
              <div
                class="tw-gap-1 md:tw-flex tw-hidden tw-cursor-pointer tw-justify-center tw-py-2.5 tw-px-6 tw-items-center tw-border tw-border-[#FC523A] tw-rounded-full gradient-DE1717"
                @click="LuckyModalRef.open()">
                <img src="@/assets/icons/jilu.svg" alt="" class="tw-inset-0" />
                欧皇记录
              </div>
              <div
                class="tw-flex tw-items-center tw-gap-2 sm:tw-gap-6 tw-text-xs sm:tw-text-sm md:tw-text-base lg:tw-text-xl md:tw-flex-row tw-text-white  md:tw-px-4 tw-py-2 tw-rounded-lg ">
                <span class="tw-flex tw-items-center tw-gap-1.5 tw-cursor-pointer" @click="changeSet('animation')">
                  <span
                    class="tw-relative tw-inline-flex tw-h-[0.875rem] md:tw-h-6 tw-w-[1.75rem] md:tw-w-11 tw-items-center tw-rounded-full tw-bg-[#300000] tw-transition-colors tw-overflow-hidden">
                    <div class="tw-absolute tw-inset-0 tw-rounded-full tw-pointer-events-none" style="border: 2px solid transparent; background: #FFB8B8 ; 
                    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor; mask-composite: exclude;">
                    </div>

                    <span
                      class="tw-relative tw-inline-block tw-h-[0.625rem] md:tw-h-4 tw-w-[0.625rem] md:tw-w-4 tw-transform tw-rounded-full tw-transition-transform"
                      :class="{
                        'tw-translate-x-[1.125rem] md:tw-translate-x-[1.625rem]': !localSet.animation,
                        'tw-translate-x-[0.25rem] md:tw-translate-x-[0.375rem]': localSet.animation,
                        'tw-bg-white tw-border-2 tw-border-[#FFB8B8]': localSet.animation
                      }" :style="!localSet.animation ? 'background: #FFB8B8;' : ''">
                    </span>
                  </span>
                  <span class="tw-text-xs md:tw-text-sm">跳过动画</span>
                </span>

                <span class="tw-flex tw-items-center tw-gap-1.5 tw-cursor-pointer" @click="changeSet('music')">
                  <span
                    class="tw-relative tw-inline-flex tw-h-[0.875rem] md:tw-h-6 tw-w-[1.75rem] md:tw-w-11 tw-items-center tw-rounded-full tw-bg-[#300000] tw-transition-colors tw-overflow-hidden">
                    <div class="tw-absolute tw-inset-0 tw-rounded-full tw-pointer-events-none" style="border: 2px solid transparent; background: #FFB8B8 ; 
                    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor; mask-composite: exclude;">
                    </div>

                    <span
                      class="tw-relative tw-inline-block tw-h-[0.625rem] md:tw-h-4 tw-w-[0.625rem] md:tw-w-4 tw-transform tw-rounded-full tw-transition-transform"
                      :class="{
                        'tw-translate-x-[1.125rem] md:tw-translate-x-[1.625rem]': !localSet.music,
                        'tw-translate-x-[0.25rem] md:tw-translate-x-[0.375rem]': localSet.music,
                        'tw-bg-white tw-border-2 tw-border-[#FFB8B8]': localSet.music
                      }" :style="!localSet.music ? 'background: #FFB8B8;' : ''">
                    </span>
                  </span>
                  <span class="tw-text-xs md:tw-text-sm">关闭音效</span>
                </span>
              </div>
            </div>
          </div>
          <div class="tw-flex md:tw-hidden tw-mt-4 tw-px-4 md:tw-px-0">
            <div
              class="tw-gap-1 md:tw-hidden tw-flex tw-justify-center tw-text-xs tw-py-[0.3125rem] tw-px-3 tw-items-center tw-border tw-border-[#FC523A] tw-rounded-full gradient-DE1717"
              @click="LuckyModalRef.open()">
              <img src="@/assets/icons/jilu.svg" alt="" class="tw-inset-0" />
              欧皇记录
            </div>
          </div>

          <div class="tw-w-full tw-relative tw-flex tw-justify-center tw-items-center md:tw-mt-20">
            <div
              class="tw-top-0 tw-left-[-7%] md:tw-left-0 tw-absolute tw-flex tw-justify-between tw-w-[120%] md:tw-w-full tw-h-full"
              v-if="!selectTab">
              <div class="tw-relative tw-cursor-pointer" @click="openBag">
                <div class="tw-absolute tw-inset-0 tw-flex tw-top-[20%] tw-justify-center">
                  <div
                    class="tw-flex tw-flex-col tw-items-center  tw-gap-2 tw-text-base tw-font-bold tw-text-[#FFF5F5]">
                    <img :src="downOpen" alt="" class="tw-w-10 tw-h-auto" />
                    <span>饰品注能</span>
                    <span>{{ formatPercentage(energyPercentage) }}%</span>
                  </div>
                </div>
                <img :src="boxLeft" alt="" class="tw-w-full tw-h-auto" />
              </div>
              <div class="tw-relative">
                <div class="tw-absolute tw-inset-0 tw-flex tw-top-[20%] tw-justify-center">
                  <div
                    class="tw-flex tw-flex-col tw-items-center  tw-gap-2 tw-text-base tw-font-bold tw-text-[#FFF5F5]">
                    <span>弹药能量</span>
                    <span>{{ formatPercentage(sprayPercentage) }}%</span>
                  </div>
                </div>
                <img :src="boxRight" alt="" class="tw-w-full tw-h-auto" />

              </div>
            </div>
            <div class=" tw-flex tw-flex-col tw-items-center tw-justify-center ">
              <div class="tw-w-[12.5rem] md:tw-mt-0 md:tw-w-[23.25rem] tw-relative tw-flex tw-flex-col tw-items-center"
                :class="{
                  'tw-mt-28': !selectTab,
                  'tw-animate-float': showFloatAnimation,
                  'initAnimation': showInitAnimation,
                  'dropAnimation': showDropAnimation
                }">
                <img :src="boxData.boxImg01" alt="" @load="handleBoxImg01Load"
                  :class="['tw-w-full tw-h-auto tw-min-h-[9.75rem] md:tw-min-h-[23.75rem] tw-object-contain tw-drop-shadow-[0_0_8px_rgba(255,122,33,0.4)]', { 'shake': isShake }]"
                  :style="{ visibility: boxImg01Loaded ? 'visible' : 'hidden' }" />
                <img :src="boxData.boxImg02" alt="" @load="handleBoxImg02Load"
                  class="tw-absolute tw-inset-0 tw-m-auto tw-max-w-[80%] tw-drop-shadow-[0_0_8px_rgba(255,122,33,0.4)]"
                  :style="{ visibility: boxImg02Loaded ? 'visible' : 'hidden' }" />
              </div>
              <span class="tw-text-[#FFF5F5] tw-text-xl tw-font-bold">{{ boxData.boxName ? boxData.boxName : '箱子名称'
              }}</span>
            </div>
          </div>
          <div class="tw-mt-6 md:tw-mt-10 tw-flex tw-items-center tw-justify-center tw-gap-3 md:tw-gap-6 tw-relative">
            <span class="tw-text-[#FFF5F5] tw-text-xs ">开启次数</span>
            <div class="tw-flex tw-items-center tw-gap-1.5 md:tw-gap-3">
              <div
                class="tw-border tw-border-[#FF553C] tw-rounded-full  tw-cursor-pointer tw-py-[0.1563rem] md:tw-py-[0.3125rem] tw-text-xs md:tw-text-sm tw-font-bold tw-px-3 md:tw-px-6 tw-duration-300 tw-transform "
                :class="{ 'backdrop-filter': active === item }"
                :style="{ 'background': active === item ? 'linear-gradient(101deg, rgba(255, 233, 233, 0.30) 8.67%, rgba(255, 15, 15, 0.30) 87.06%)' : 'linear-gradient(102deg, rgba(255, 233, 233, 0.14) 8.77%, rgba(153, 140, 140, 0.14) 88.28%)' }"
                v-for="(item, index) in arr" :key="index" @click="choseNum(item)">
                X{{ item }}
              </div>
            </div>
          </div>
          <div class="tw-flex tw-justify-center tw-mt-6 tw-gap-3 tw-relative tw-items-center">
            <div :class="selectTab ? 'boxshadowBtn' : 'boxshadowBtn2'"
              class=" md:tw-w-[24.75rem] tw-w-[13.75rem]  tw-duration-300 tw-transform tw-py-1.5 md:tw-py-3  tw-flex tw-text-xl tw-items-center tw-cursor-pointer tw-bg-[#2E110B] tw-rounded-full tw-border  tw-justify-center"
              @click="selectTab ? handleOpen() : injectOpen()">
              <span class="tw-flex tw-items-center tw-gap-2 md:tw-text-base tw-text-sm" v-if="selectTab">
                <template v-if="isLoading">

                  <span class="md:tw-text-2xl tw-text-xl tw-font-bold">开启中</span>
                  <svg class="tw-animate-spin tw-h-4 tw-w-4 tw-text-white" xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24">
                    <circle class="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                    </circle>
                    <path class="tw-opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                </template>
                <template v-else>
                  <img :src="Money" class="tw-h-[1rem] md:tw-h-[1.75rem]" /> {{
                    formattedEndPrice }}
                  <span class="md:tw-text-2xl tw-text-xl tw-font-bold">开启</span>
                </template>
              </span>
              <span v-else class="md:tw-text-2xl tw-text-xl tw-font-bold">弹药开箱</span>
            </div>
            <img :src="selectTab ? Taiji2 : Taiji1" alt=""
              class="tw-h-[1.875rem] md:tw-h-full tw-hidden  tw-cursor-pointer " @click="selectTab = !selectTab" />
          </div>
          <div
            class="tw-mt-10 md:tw-mt-20 tw-px-4 md:tw-px-0 tw-flex md:tw-flex-row tw-justify-between tw-flex-col tw-gap-5 md:tw-gap-14 tw-text-xs md:tw-text-base">
            <div class="tw-flex  tw-gap-5 md:tw-gap-14 tw-text-xs md:tw-text-base">
              <div
                class="tw-relative tw-py-2 md:tw-py-3 tw-px-6 md:tw-px-11 tw-cursor-pointer tw-rounded-full tw-text-[#FFF5F5]"
                style="background: linear-gradient(1deg, rgba(255, 60, 42, 0.70) 0.48%, rgba(149, 0, 0, 0.00) 97.45%)"
                @click="checkActive(false)">
                <span>军需饰品</span>
                <div
                  class="tw-w-[2.5rem] tw-h-1 tw-bg-white tw-absolute tw-bottom-0 tw-rounded-full tw-left-1/2 -tw-translate-x-1/2"
                  v-if="!isActive"></div>
              </div>
              <div
                class="tw-relative tw-py-2 md:tw-py-3 tw-px-6 md:tw-px-11 tw-cursor-pointer tw-rounded-full tw-text-[#FFF5F5]"
                style="background: linear-gradient(1deg, rgba(255, 200, 111, 0.70) 0.48%, rgba(57, 36, 6, 0.00) 99.52%)"
                @click="checkActive(true)">
                <span>最近掉落</span>
                <div
                  class="tw-w-[2.5rem] tw-h-1 tw-bg-white tw-absolute tw-bottom-0 tw-rounded-full tw-left-1/2 -tw-translate-x-1/2"
                  v-if="isActive"></div>
              </div>
            </div>
            <div class="tw-flex tw-flex-wrap tw-gap-4 tw-items-center md:tw-px-4 ">
              <div v-for="item in boxData.probabilityDistribution" v-show="item.probability !== '00.00%'"
                class="tw-flex tw-items-center tw-justify-center tw-px-2 tw-py-px tw-rounded-full tw-shadow-lg tw-transition-all tw-duration-300 tw-transform hover:tw-scale-105"
                :style="`background: ${level[item.ornamentsLevelId].background}; color: ${level[item.ornamentsLevelId].color}; 
               `">
                <span class="tw-text-sm tw-mt-1 tw-font-medium">{{ item.probability }}</span>
              </div>
            </div>

          </div>
          <div class="tw-py-4 md:tw-py-6 tw-w-full">
            <div class="tw-flex tw-flex-wrap tw-justify-center tw-gap-3 md:tw-gap-5 no-scrollbar"
              v-if="boxData?.boxOrnamentsList && boxData?.boxOrnamentsList.length > 0 && !isActive">
              <Box :boxData="item" v-for="(item, index) in boxData.boxOrnamentsList" @click="handleMore(item)"
                class="tw-cursor-pointer tw-duration-300 tw-transition-all md:hover:tw-scale-105" :key="index"
                :showFooter="true" :isRound="true">
              </Box>
            </div>
            <div class="tw-flex tw-flex-wrap tw-justify-center tw-gap-3 md:tw-gap-5 no-scrollbar"
              v-if="boxHistoryData && isActive">
              <Box :boxData="item" v-for="(item, index) in boxHistoryData" :key="index" @click="handleMore(item)"
                class="tw-cursor-pointer tw-duration-300 tw-transition-all md:hover:tw-scale-105" :showFooter="true"
                :isRound="true">
              </Box>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Layout>
  <OpenModal ref="OpenModalRef" :openData="openEnd" :boxData="boxData" :curindex="active" :localSet="localSet"
    :price="formattedEndPrice" @close="handleModalClose" @openAgain="handleOpen" />
  <OpenBagModal ref="OpenBagModalRef" :selectedIds="selectedBagIds" :selectedBagTotalPrice="selectedBagTotalPrice"
    @confirm="handleOpenBagConfirm" />
  <LuckyModal ref="LuckyModalRef" :luckyboxData="luckyboxData" />
  <MoreModal ref="MoreModalRef" :moreData="moreData" :boxName="boxData.boxName" />
</template>

<style scoped>
.boxshadowBtn {
  box-shadow: 3px 3px 33.4px 0px rgba(255, 104, 45, 0.51) inset, -5px -12px 34.8px 0px rgba(255, 71, 30, 0.57) inset;

  border-color: #FF1919;
}

.boxshadowBtn:hover {
  box-shadow: 3px 3px 33.4px 0px rgba(255, 115, 60, 0.80) inset, -5px -12px 34.8px 0px rgba(255, 100, 65, 0.83) inset;
}

.boxshadowBtn2 {
  box-shadow: 3px 3px 33.4px 0px rgba(255, 223, 45, 0.51) inset, -5px -12px 34.8px 0px rgba(255, 180, 29, 0.57) inset;
  border-color: #FFD119;
}

.boxshadowBtn2:hover {
  box-shadow: 3px 3px 33.4px 0px rgba(255, 223, 45, 0.80) inset, -5px -12px 34.8px 0px rgba(255, 180, 29, 0.79) inset;
}

.tw-animate-float {
  animation: float 6s ease-in-out infinite;
}

.backdrop-filter {
  backdrop-filter: blur(2px);
}

@keyframes float {
  0% {
    transform: translateY(0px) rotate(0deg);
  }

  25% {
    transform: translateY(-5px) rotate(0.5deg);
  }

  50% {
    transform: translateY(0px) rotate(0deg);
  }

  75% {
    transform: translateY(5px) rotate(-0.5deg);
  }

  100% {
    transform: translateY(0px) rotate(0deg);
  }
}

.dropAnimation {
  animation: drop-down 0.5s ease-in forwards;
}

@keyframes drop-down {
  0% {
    transform: translateY(-120px);
  }

  60% {
    transform: translateY(10px);
  }

  80% {
    transform: translateY(-5px);
  }

  100% {
    transform: translateY(0);

  }
}

.initAnimation {
  transform-origin: 50% 100%;
  animation: chest-sway .9s linear forwards;
}

@keyframes chest-sway {
  0% {
    top: 0;
    transform: rotate(0);
  }

  14.8% {
    top: -10px;
    transform: rotate(4deg);
  }

  37% {
    top: 0;
    transform: rotate(0);
  }

  59.2% {
    top: 0;
    transform: rotate(3deg);
  }

  81.4% {
    top: 0;
    transform: rotate(-1deg);
  }

  100% {
    top: 0;
    transform: rotate(0);
  }
}
</style>