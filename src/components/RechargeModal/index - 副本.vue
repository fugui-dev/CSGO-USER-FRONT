<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import rechargeBg from '@/assets/rechargeModal/bg.png'
import { useRecharge } from './sever/userecharge'
import request from "@/config/http/request.js";
import { postCardPay, queryOrderStatus } from './sever/api.js'
import { useUserInfo } from '@/composables/useUesrInfo.js'
import QRCode from 'qrcode'
import { useDeviceType } from '@/composables/useDeviceType.js'

const props = defineProps({
  // 可以添加自定义属性
});

const visible = ref(false)
const curIndex = ref(0)
const selectPayType = ref('alipay')
const selectPayChannel = ref(null)
const qrCode = ref('')
const showQrPopup = ref(false)
const loading = ref(false)
const order = ref(null)
const payStatusLoading = ref(false)
const pollingTimer = ref(null)

// 卡密支付相关
const showCardForm = ref(false) // 控制卡密表单显示
const cardPassword = ref('') // 卡密
const cardLoading = ref(false) // 卡密验证加载状态

const { rechargeList, payConfigList, fetchRechargeData, fetchPayConfigData } = useRecharge()
const { fetchUserInfo } = useUserInfo()
// 默认充值金额，在API数据加载前使用
const defaultRechargeList = [
  { id: 1, price: 50 },
  { id: 2, price: 100 },
  { id: 3, price: 200 },
  { id: 4, price: 500 },
  { id: 5, price: 1000 },
  { id: 6, price: 2000 }
]

// 支付方式
const payTypes = ref([
  { id: '1', name: '云闪付', icon: 'wechat-icon' },
  { id: '2', name: '京东/美团', icon: 'wechaicon' },
])

// 使用设备类型检测
const { isPC } = useDeviceType()

// 选择金额
const selectAmount = (item, index) => {
  curIndex.value = index
}

// 选择支付通道
const selectChannel = (channel) => {
  selectPayChannel.value = channel
}

// 监听支付方式变化
watch(selectPayType, (newType) => {
  if (newType === 'card') {
    showCardForm.value = true
    selectPayChannel.value = null // 卡密支付不需要支付通道
  } else {
    showCardForm.value = false
  }
})

const postPayOrder = (data) => {
  return request({
    url: `api/${selectPayChannel.value.payTag}/preOrder`,
    method: "post",
    data: data,
  });
};

// 添加支付跳转处理函数
const handlePayRedirect = (url) => {
  try {
    // 检查URL是否有效
    if (!url) {
      ElMessage.error('支付链接无效')
      return
    }
    showQrPopup.value = true
  } catch (error) {
    console.error('支付跳转失败:', error)
    ElMessage.error('支付跳转失败，请重试')
  }
}

// 提交支付
const submitPay = async () => {
  // 如果是卡密支付，走卡密验证流程
  if (selectPayType.value === 'card') {
    if (!cardPassword.value) {
      ElMessage.warning('请输入充值卡密')
      return
    }

    await submitCardPay()
    return
  }

  if (!selectPayChannel.value) {
    ElMessage.warning('请选择支付通道')
    return
  }

  loading.value = true
  try {
    console.log(selectPayChannel.value.payTag)

    const res = await postPayOrder({
      goodsNum: 1,
      goodsPrice: rechargeList.value[curIndex.value].price,
      goodsId: rechargeList.value[curIndex.value].id
    });
    if (res.code === 200) {
      order.value = {
        orderNo: res.data.orderNo,
        outTradeNo: res.data.outTradeNo,
        amount: rechargeList.value[curIndex.value].price,
        payType: 'pay',
        payUrl: res.data.payUrl
      }

      // 如果是移动设备，直接跳转
      // if (!isPC.value) {
      //   loading.value = false
      //   handlePayRedirect(res.data.payUrl)
      //   return res.data
      // }

      // PC设备使用二维码
      try {
        qrCode.value = await QRCode.toDataURL(res.data.payUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
      } catch (err) {
        console.error('生成二维码失败:', err);
        ElMessage.error('生成二维码失败，请重试');
        return;
      }

      showQrPopup.value = true
      loading.value = false
      return res.data;
    }
  } catch (error) {
    console.error(error);
    loading.value = false
    ElMessage.error('创建支付订单失败，请重试')
  }
}

// 开始轮询支付状态
const startPayStatusPolling = () => {
  if (!order.value || !order.value.orderNo) {
    return
  }

  // 清除可能存在的定时器
  stopPolling()

  payStatusLoading.value = true

  // 开始轮询查询
  let count = 0
  const maxAttempts = 15 // 最多查询15次

  // 创建一个立即执行一次的轮询
  const checkOrder = async () => {
    try {
      const res = await queryOrderStatus(order.value.orderNo)
      if (res.code === 200 && res.data === true) {
        // 支付成功
        clearInterval(pollingTimer.value)
        pollingTimer.value = null
        ElMessage.success('充值成功')
        fetchUserInfo() // 刷新用户信息
        showQrPopup.value = false
        visible.value = false
        payStatusLoading.value = false
        return
      }

      count++
      if (count >= maxAttempts) {
        clearInterval(pollingTimer.value)
        pollingTimer.value = null
        ElMessage.warning('支付结果查询超时，请稍后查看账户余额')
        payStatusLoading.value = false
      }
    } catch (error) {
      console.error('查询支付状态失败:', error)
      clearInterval(pollingTimer.value)
      pollingTimer.value = null
      ElMessage.error('查询支付状态失败，请稍后查看账户余额')
      payStatusLoading.value = false
    }
  }

  // 立即执行一次
  checkOrder()

  // 设置定时器，每3秒查询一次
  pollingTimer.value = setInterval(checkOrder, 3000)
}

// 检查支付状态
const checkPayStatus = () => {
  if (!order.value || !order.value.orderNo) {
    ElMessage.warning('订单信息不存在')
    return
  }

  startPayStatusPolling()
}

// 卡密充值函数
const submitCardPay = async () => {
  cardLoading.value = true
  try {
    // 这里替换为实际的卡密验证API
    const res = await postCardPay({
      password: cardPassword.value
    })

    if (res.code === 200) {
      ElMessage.success('卡密充值成功')
      fetchUserInfo() // 刷新用户信息
      cardPassword.value = ''
      // 关闭模态框
      visible.value = false
    }


  } catch (error) {
    console.error('卡密验证失败:', error)
  } finally {
    cardLoading.value = false
  }
}

// 停止轮询函数
const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
    payStatusLoading.value = false
  }
}

// 监听二维码弹窗状态
watch(showQrPopup, (val) => {
  if (!val) {
    stopPolling()
  }
})

// 清理状态
watch(visible, async (val) => {
  if (val) {
    curIndex.value = 0 // 重置索引
    selectPayType.value = 'alipay' // 重置为默认支付方式
    showCardForm.value = false // 隐藏卡密表单
    cardPassword.value = '' // 清空卡密
    await fetchRechargeData() // 等待数据加载
    await fetchPayConfigData()
  }
  if (!val) {
    qrCode.value = ''
    showQrPopup.value = false
    stopPolling() // 使用停止轮询函数
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  stopPolling()
})

const open = () => {
  visible.value = true
}

const close = () => {
  fetchUserInfo()
  visible.value = false
}

// 暴露方法给父组件
defineExpose({
  open,
  close
})
</script>

<template>
  <van-popup v-model:show="visible"
    class="tw-bg-transparent !tw-max-w-[100vw] !tw-mx-0 md:!tw-mx-auto !tw-bg-none dialog no-scrollbar" teleport="body">
    <div
      class="tw-relative tw-w-[100vw] md:tw-w-[600px] tw-max-w-[600px] tw-flex tw-justify-center tw-items-center tw-p-6 md:tw-p-10">
      <div class="tw-absolute tw-inset-0 tw-z-0 tw-overflow-hidden tw-rounded-xl">
        <img :src="rechargeBg" class="tw-w-full tw-h-full " alt="背景" />
      </div>
      <div class="tw-rounded-xl tw-w-full tw-h-full tw-overflow-hidden tw-shadow-2xl tw-relative tw-z-10">
        <div class="tw-relative tw-py-6 tw-px-4">
          <div class="tw-absolute tw-right-4 tw-top-4 tw-cursor-pointer" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg"
              class="tw-h-5 tw-w-5 tw-text-white/80 hover:tw-text-white tw-transition-colors" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <div class="tw-text-center">
            <p class="tw-text-blue-200 tw-text-sm md:tw-text-base">充值金额</p>
            <div class="tw-flex tw-justify-center tw-items-center tw-mt-2">
              <svg xmlns="http://www.w3.org/2000/svg"
                class="tw-h-5 tw-w-5 md:tw-h-6 md:tw-w-6 tw-text-yellow-500 tw-mr-1" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="tw-text-white tw-font-bold tw-text-xl md:tw-text-2xl">
                {{ rechargeList && rechargeList.length > 0 ? rechargeList[curIndex]?.price :
                  defaultRechargeList[curIndex]?.price }}
              </span>
            </div>
            <button @click="submitPay"
              class="tw-mt-4 tw-bg-gradient-to-r tw-from-orange-500 tw-to-red-500 tw-px-6 md:tw-px-8 tw-py-1.5 md:tw-py-2 tw-text-white tw-rounded-full tw-font-semibold tw-shadow-lg hover:tw-from-orange-600 hover:tw-to-red-600 tw-transition-all tw-text-sm md:tw-text-base">
              <span v-if="!loading && !cardLoading">充值</span>
              <span v-else class="tw-flex tw-items-center tw-justify-center">
                <svg class="tw-animate-spin tw-h-4 tw-w-4 tw-mr-2" viewBox="0 0 24 24">
                  <circle class="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="tw-opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                处理中
              </span>
            </button>
            <p class="tw-text-red-300 tw-text-xs tw-mt-2">！禁止未成年人支付</p>
          </div>
        </div>

        <div class="tw-p-3 md:tw-p-4">
          <div class="tw-mb-4 md:tw-mb-6">
            <h3 class="tw-text-blue-300 tw-text-xs md:tw-text-sm tw-mb-1 md:tw-mb-2">选择充值金额</h3>
            <div class="tw-grid tw-grid-cols-3 tw-gap-1 md:tw-gap-2">
              <template v-if="!rechargeList || rechargeList.length === 0">
                <div v-for="(item, index) in defaultRechargeList" :key="'default-' + item.id"
                  @click="selectAmount(item, index)" class="tw-cursor-pointer">
                  <div
                    class="tw-flex tw-justify-center tw-items-center tw-py-2 md:tw-py-3 tw-px-1 md:tw-px-2 tw-rounded tw-transition-all"
                    :class="curIndex === index
                      ? 'tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-border tw-border-blue-400'
                      : 'tw-bg-gradient-to-r tw-from-[#1d3370] tw-to-[#152a6e] tw-border tw-border-blue-800/50'">
                    <svg xmlns="http://www.w3.org/2000/svg"
                      class="tw-h-3 tw-w-3 md:tw-h-4 md:tw-w-4 tw-text-yellow-500 tw-mr-1" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="tw-text-xs md:tw-text-sm"
                      :class="curIndex === index ? 'tw-text-white' : 'tw-text-blue-300'">{{ item.price }}</span>
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-for="(item, index) in rechargeList" :key="item.id" @click="selectAmount(item, index)"
                  class="tw-cursor-pointer">
                  <div
                    class="tw-flex tw-justify-center tw-items-center tw-py-2 md:tw-py-3 tw-px-1 md:tw-px-2 tw-rounded tw-transition-all"
                    :class="curIndex === index
                      ? 'tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-border tw-border-blue-400'
                      : 'tw-bg-gradient-to-r tw-from-[#1d3370] tw-to-[#152a6e] tw-border tw-border-blue-800/50'">
                    <svg xmlns="http://www.w3.org/2000/svg"
                      class="tw-h-3 tw-w-3 md:tw-h-4 md:tw-w-4 tw-text-yellow-500 tw-mr-1" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="tw-text-xs md:tw-text-sm"
                      :class="curIndex === index ? 'tw-text-white' : 'tw-text-blue-300'">{{ item.productA }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="tw-mb-4 md:tw-mb-6">
            <h3 class="tw-text-blue-300 tw-text-xs md:tw-text-sm tw-mb-1 md:tw-mb-2">选择支付方式</h3>
            <div class="tw-flex tw-space-x-2 md:tw-space-x-3">
              <div v-for="type in payTypes" :key="type.name" @click="selectPayType = type.id"
                class="tw-cursor-pointer tw-flex-1">
                <div
                  class="tw-flex tw-items-center tw-justify-center tw-space-x-1 md:tw-space-x-2 tw-py-2 md:tw-py-3 tw-px-1 md:tw-px-2 tw-rounded tw-transition-all"
                  :class="selectPayType === type.id
                    ? 'tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-border tw-border-blue-400'
                    : 'tw-bg-gradient-to-r tw-from-[#1d3370] tw-to-[#152a6e] tw-border tw-border-blue-800/50'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-4 tw-w-4 md:tw-h-5 md:tw-w-5"
                    :class="type.id === 'alipay' ? 'tw-text-blue-400' : type.id === '1' ? 'tw-text-blue-400' : 'tw-text-yellow-400'"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path v-if="type.id === 'card'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span class="tw-text-xs md:tw-text-sm"
                    :class="selectPayType === type.id ? 'tw-text-white' : 'tw-text-blue-300'">{{ type.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="showCardForm" class="tw-mb-4 md:tw-mb-6 tw-bg-[#1d3370]/50 tw-p-3 tw-rounded-lg">
            <h3 class="tw-text-blue-300 tw-text-xs md:tw-text-sm tw-mb-2">填写卡密信息</h3>
            <div>
              <label class="tw-block tw-text-xs tw-text-blue-200 tw-mb-1">充值卡密</label>
              <input v-model="cardPassword" type="text" placeholder="请输入充值卡密"
                class="tw-w-full tw-bg-[#0d1c41] tw-border tw-border-blue-800 tw-rounded tw-px-3 tw-py-2 tw-text-white tw-text-sm focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-blue-500" />
            </div>
            <p class="tw-mt-2 tw-text-xs tw-text-blue-200">温馨提示：卡密一经使用，不可退换</p>
          </div>

          <div v-if="!showCardForm && payConfigList && payConfigList.length > 0" class="tw-mb-4 md:tw-mb-6">
            <h3 class="tw-text-blue-300 tw-text-xs md:tw-text-sm tw-mb-1 md:tw-mb-2">选择支付通道</h3>
            <div class="tw-grid tw-grid-cols-2 tw-gap-1 md:tw-gap-2">
              <div v-for="channel in payConfigList" :key="channel.id" @click="selectChannel(channel)"
                class="tw-cursor-pointer" v-show="channel.status === 1 && channel.payTag && channel.payTag.length > 0">
                <div
                  class="tw-flex tw-justify-center tw-items-center tw-py-2 md:tw-py-3 tw-px-1 md:tw-px-2 tw-rounded tw-transition-all"
                  :class="selectPayChannel && selectPayChannel.id === channel.id
                    ? 'tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-border tw-border-blue-400'
                    : 'tw-bg-gradient-to-r tw-from-[#1d3370] tw-to-[#152a6e] tw-border tw-border-blue-800/50'">
                  <span class="tw-text-xs md:tw-text-sm"
                    :class="selectPayChannel && selectPayChannel.id === channel.id ? 'tw-text-white' : 'tw-text-blue-300'">
                    {{ channel.payName }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <van-popup v-model:show="showQrPopup" class=" " :style="{ padding: '20px' }" round @closed="stopPolling">
      <div class="tw-w-[280px] tw-flex tw-flex-col tw-items-center ">
        <!-- 添加关闭按钮 -->
        <div class="tw-absolute tw-right-2 tw-top-2 tw-cursor-pointer" @click="showQrPopup = false">
          <svg xmlns="http://www.w3.org/2000/svg"
            class="tw-h-4 tw-w-4 tw-text-gray-400 hover:tw-text-gray-600 tw-transition-colors" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <div class="tw-text-center tw-mb-4">
          <p class="tw-font-medium tw-text-gray-700">
            请<span class="tw-text-blue-600">使用云闪付码支付</span>
          </p>
          <p class="tw-text-sm tw-text-gray-500">订单金额: ¥{{ rechargeList && rechargeList.length > 0 ?
            rechargeList[curIndex]?.price : defaultRechargeList[curIndex]?.price || 0 }}</p>
        </div>

        <div class="tw-bg-white tw-p-3 tw-border tw-border-gray-200 tw-rounded">
          <div v-if="qrCode" class="tw-w-[200px] tw-h-[200px] tw-bg-white tw-flex tw-items-center tw-justify-center">
            <img :src="qrCode" alt="支付二维码" class="tw-w-full tw-h-full tw-object-contain" />
          </div>
          <div v-else class="tw-w-[200px] tw-h-[200px] tw-flex tw-items-center tw-justify-center">
            <svg class="tw-animate-spin tw-h-8 tw-w-8 tw-text-blue-500" viewBox="0 0 24 24">
              <circle class="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="tw-opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
          </div>
        </div>

        <!-- 修改提示文字的位置和样式 -->
        <div class="tw-mt-3 tw-w-full tw-text-center">
          <span class="tw-text-[0.75rem] tw-text-orange-400">二维码有效期五分钟，禁止一码多扫重复支付!</span>
        </div>

        <div class="tw-mt-3 tw-w-full">
          <button @click="checkPayStatus"
            class="tw-w-full tw-bg-blue-500 hover:tw-bg-blue-600 tw-text-white tw-py-2 tw-rounded-lg tw-font-medium tw-transition-colors"
            :disabled="payStatusLoading">
            <span v-if="!payStatusLoading">已完成支付</span>
            <span v-else class="tw-flex tw-items-center tw-justify-center">
              <svg class="tw-animate-spin tw-h-4 tw-w-4 tw-mr-2" viewBox="0 0 24 24">
                <circle class="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="tw-opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              查询支付结果...
            </span>
          </button>
        </div>
      </div>
    </van-popup>
  </van-popup>
</template>

<style scoped>
.dialog {
  background: none;
}

/* 仅保留动画效果，移除背景图片过渡效果 */
.dialog :deep(.van-popup) {
  animation: modalAppear .3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
