<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRecharge } from './sever/userecharge'
import request from "@/config/http/request.js";
import { postCardPay, queryOrderStatus } from './sever/api.js'
import { useUserInfo } from '@/composables/useUesrInfo.js'
import QRCode from 'qrcode'
import { useDeviceType } from '@/composables/useDeviceType.js'
import BaseModel from '@/components/BaseModel/index.vue'
import Title from "@/components/Title.vue";
import { requireImg } from '@/utils/common';
import Money from '@/assets/icons/money.svg'
import BtnIcon from '@/assets/rechargeModal/btn.png'
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
const pollingStatus = ref('')
const paymentTimeoutAt = ref(null)

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
  // { id: '20', name: '微信', icon: 'wechat-icon' },
  { id: '30', name: '支付宝', icon: 'wechaicon' },
  { id: 'card', name: '卡密支付', icon: 'card-icon' }
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
  console.log(selectPayChannel.value.payTag,'123')
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
  // 停止可能存在的轮询
  stopPolling()

  // 重置支付超时时间
  paymentTimeoutAt.value = null

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
    console.log(selectPayChannel.value.payTag,'321')

    const res = await postPayOrder({
      goodsNum: 1,
      goodsPrice: rechargeList.value[curIndex.value].price,
      goodsId: rechargeList.value[curIndex.value].id,
      payType: selectPayType.value
    });
    if (res.code === 200) {
      order.value = {
        orderNo: res.data.orderId,
        outTradeNo: res.data.outTradeNo,
        amount: rechargeList.value[curIndex.value].price,
        payType: selectPayType.value,
        payUrl: res.data.payUrl
      }
      console.log(order.value)
      // 生成二维码
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

      // 显示二维码弹窗
      showQrPopup.value = true
      loading.value = false

      // 自动开始轮询支付状态
      startPayStatusPolling()

      return res.data;
    }
  } catch (error) {
    loading.value = false
    console.log(error,'123')
  }
}

// 开始轮询支付状态
const startPayStatusPolling = () => {
  console.log('开始轮询', order)
  if (!order.value || !order.value.orderNo) {
    return
  }

  // 清除可能存在的定时器
  stopPolling()

  // 设置支付超时时间（5分钟后）
  paymentTimeoutAt.value = new Date(Date.now() + 5 * 60 * 1000)

  payStatusLoading.value = true
  pollingStatus.value = '正在查询支付状态...'

  // 开始轮询查询
  let count = 0
  const maxAttempts = 60 // 增加到60次，覆盖5分钟（3秒一次）
  const intervalTime = 3000 // 轮询间隔时间，3秒

  // 创建一个立即执行一次的轮询
  const checkOrder = async () => {
    // 检查订单是否已失效
    if (paymentTimeoutAt.value && new Date() > paymentTimeoutAt.value) {
      clearInterval(pollingTimer.value)
      pollingTimer.value = null
      pollingStatus.value = '支付已超时，请重新生成二维码'
      ElMessage.warning('支付已超时，请重新生成二维码')
      payStatusLoading.value = false
      return false
    }

    try {
 
      const res = await queryOrderStatus(order.value.orderNo)
      if (res.code === 200 && res.data === true) {
        // 支付成功
        clearInterval(pollingTimer.value)
        pollingTimer.value = null
        pollingStatus.value = '支付成功'
        ElMessage.success('充值成功')
        fetchUserInfo() // 刷新用户信息
        showQrPopup.value = false
        visible.value = false
        payStatusLoading.value = false
        return true
      }

      count++
      // 更新轮询状态
      pollingStatus.value = `正在查询支付状态...(${count}/${maxAttempts})`

      if (count >= maxAttempts) {
        clearInterval(pollingTimer.value)
        pollingTimer.value = null
        pollingStatus.value = '查询超时，请手动检查'
        ElMessage.warning('支付结果查询超时，请稍后查看账户余额')
        payStatusLoading.value = false
      }
      return false
    } catch (error) {
      console.error('查询支付状态失败:', error)
      // 错误时不要立即停止轮询，允许重试
      if (count >= maxAttempts) {
        clearInterval(pollingTimer.value)
        pollingTimer.value = null
        pollingStatus.value = '查询失败，请手动检查'
        ElMessage.error('查询支付状态失败，请稍后查看账户余额')
        payStatusLoading.value = false
      }
      return false
    }
  }

  // 立即执行一次
  checkOrder()

  // 设置定时器，每3秒查询一次
  pollingTimer.value = setInterval(checkOrder, intervalTime)
}

// 检查支付状态
const checkPayStatus = async () => {
  if (!order.value || !order.value.orderNo) {
    ElMessage.warning('订单信息不存在')
    return
  }

  if (payStatusLoading.value) {
    ElMessage.info('正在查询支付状态，请稍候...')
    return
  }

  // 手动检查一次
  payStatusLoading.value = true
  pollingStatus.value = '手动查询支付状态...'
  try {
    const res = await queryOrderStatus(order.value.orderNo)
    if (res.code === 200 && res.data === true) {
      pollingStatus.value = '支付成功'
      ElMessage.success('充值成功')
      fetchUserInfo() // 刷新用户信息
      showQrPopup.value = false
      visible.value = false
    } else {
      // 检查订单是否已超时
      if (paymentTimeoutAt.value && new Date() > paymentTimeoutAt.value) {
        pollingStatus.value = '支付已超时，请重新生成二维码'
        ElMessage.warning('支付已超时，请重新生成二维码')
      } else {
        // 如果未支付成功且未超时，则重新开始轮询
        startPayStatusPolling()
        ElMessage.info('支付未完成，已重新开始监测支付状态')
      }
    }
  } catch (error) {
    console.error('手动查询支付状态失败:', error)
    pollingStatus.value = '查询失败，请重试'
    ElMessage.error('查询支付状态失败，请重试')
  } finally {
    payStatusLoading.value = false
  }
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
    pollingStatus.value = ''
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
    order.value = null // 重置订单信息
    paymentTimeoutAt.value = null // 重置支付超时时间
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
  stopPolling() // 确保停止轮询
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
  <BaseModel v-model="visible" :showFooter="false" :closeOnEsc="true" :showTitle="false" :closeOnClickOutside="true"
    @close="close">
    <div class="tw-flex tw-flex-col tw-h-full tw-px-2.5 md:tw-px-0 tw-w-full tw-relative tw-bg-[#4A1D13]">
      <img :src="requireImg('/v2/bg/model-bg.png')"
        class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-object-cover" />
      <Title name="充值中心"></Title>
      <button @click="close()"
        class="tw-w-6 tw-absolute tw-top-4 tw-right-4   tw-opacity-80 hover:tw-opacity-100 hover:tw-rotate-90 tw-duration-200">
        <svg t="1744272178420" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
          p-id="1468" :width="closeIcon" :height="closeIcon">
          <path
            d="M525.269211 510.837524 918.101111 116.227118c7.17747-7.209192 7.14984-18.871813-0.059352-26.049283-7.210215-7.176446-18.87079-7.151887-26.049283 0.059352L499.278257 484.72889 106.563014 90.236164c-7.17747-7.209192-18.84009-7.235798-26.049283-0.059352-7.209192 7.17747-7.235798 18.84009-0.059352 26.049283L473.287303 510.837524 80.45438 905.446907c-7.176446 7.209192-7.150864 18.871813 0.059352 26.049283 3.593851 3.577478 8.29492 5.365194 12.994965 5.365194 4.727675 0 9.455349-1.809205 13.054317-5.424546l392.715243-394.491703 392.715243 394.491703c3.599991 3.615341 8.326643 5.424546 13.054317 5.424546 4.700045 0 9.402137-1.787716 12.994965-5.365194 7.209192-7.17747 7.235798-18.84009 0.059352-26.049283L525.269211 510.837524z"
            fill="#ffffff" p-id="1469"></path>
        </svg>
      </button>
      <div class="tw-flex tw-flex-col  md:tw-flex-row md:tw-px-[3.875rem] tw-justify-between">
        <div class="tw-flex tw-gap-3 md:tw-gap-5  tw-flex-col md:tw-w-[30.5rem]">
          <span class="tw-text-white/70 tw-text-xs md:tw-text-sm">选择充值</span>
          <template v-if="!rechargeList || rechargeList.length === 0">
            <div class=" tw-flex  tw-gap-2 md:tw-gap-4 tw-flex-wrap">
              <div @click="selectAmount(item, index)"
                class="tw-flex tw-items-center tw-text-[#FFF6C7] tw-bg-[#2A0800] tw-duration-300 tw-border tw-border-transparent tw-w-[5rem] md:tw-w-[9.4375rem] tw-py-1 md:tw-py-2.5 tw-justify-center tw-rounded-md  md:tw-rounded-xl tw-gap-1 md:tw-gap-2 tw-cursor-pointer"
                :class="curIndex === index ? 'tw-border-[#B13200] activePrice' : ''"
                v-for="(item, index) in defaultRechargeList" :key="'default-' + item.id">
                <img :src="Money" class="tw-w-[1.5625rem] md:tw-w-[3.125rem] " />
                {{ item.price }}
              </div>
            </div>
          </template>
          <template v-else>
            <div class=" tw-flex  tw-gap-2 md:tw-gap-4 tw-flex-wrap">
              <div @click="selectAmount(item, index)"
                class="tw-flex tw-items-center tw-text-[#FFF6C7] tw-bg-[#2A0800] tw-duration-300 tw-border tw-border-transparent tw-w-[5rem] md:tw-w-[9.4375rem] tw-py-1 md:tw-py-2.5 tw-justify-center tw-rounded-md  md:tw-rounded-xl tw-gap-1 md:tw-gap-2 tw-cursor-pointer"
                :class="curIndex === index ? 'tw-border-[#B13200] activePrice' : ''"
                v-for="(item, index) in rechargeList" :key="'default-' + item.id">
                <img :src="Money" class="tw-w-[1.5625rem] md:tw-w-[3.125rem] " />
                {{ item.productA }}
              </div>
            </div>
          </template>
          <span class="tw-text-white/70 tw-text-xs md:tw-text-sm ">选择支付方式</span>
          <div class=" tw-flex tw-gap-2 md:tw-gap-4 tw-flex-wrap">
            <div
              class="tw-flex tw-items-center tw-text-[#FFF6C7] tw-bg-[#2A0800] tw-duration-300 tw-border tw-border-transparent tw-py-2 md:tw-py-4 tw-w-[10.125rem] md:tw-w-[9.4375rem] tw-justify-center tw-rounded-xl tw-gap-2 tw-cursor-pointer"
              :class="selectPayType === type.id ? 'tw-border-[#B13200] activePrice' : ''" v-for="type in payTypes"
              :key="type.name" @click="selectPayType = type.id">
              <svg xmlns="http://www.w3.org/2000/svg" class=" md:tw-w-8 md:tw-h-8 tw-w-4 tw-h-4" viewBox="0 0 32 32"
                fill="none">
                <path
                  d="M2.67334 12H28.0067C28.1818 12 28.3551 12.0345 28.5169 12.1015C28.6787 12.1685 28.8257 12.2667 28.9495 12.3905C29.0733 12.5143 29.1715 12.6613 29.2385 12.8231C29.3055 12.9849 29.34 13.1582 29.34 13.3333V26.6667C29.34 27.0203 29.1995 27.3594 28.9495 27.6095C28.6994 27.8595 28.3603 28 28.0067 28H4.00667C3.65305 28 3.31391 27.8595 3.06386 27.6095C2.81382 27.3594 2.67334 27.0203 2.67334 26.6667V12ZM4.00667 4H24.0067V9.33333H2.67334V5.33333C2.67334 4.97971 2.81382 4.64057 3.06386 4.39052C3.31391 4.14048 3.65305 4 4.00667 4ZM20.0067 18.6667V21.3333H24.0067V18.6667H20.0067Z"
                  fill="#FFF6C7" />
              </svg> {{ type.name }}
            </div>
          </div>
          <span class="tw-text-white/70 tw-text-xs md:tw-text-sm "
            v-if="!showCardForm && payConfigList && payConfigList.length > 0">选择支付通道</span>
          <div v-if="!showCardForm && payConfigList && payConfigList.length > 0"
            class="tw-flex tw-gap-2 md:tw-gap-[1.125rem] tw-flex-wrap tw-w-full">
            <div v-for="channel in payConfigList" :key="channel.id" @click="selectChannel(channel)"
              class="tw-cursor-pointer tw-w-full"
              v-show="channel.status === 1 && channel.payTag && channel.payTag.length > 0">
              <div
                class="tw-flex  tw-items-center tw-text-[#FFF6C7] tw-bg-[#2A0800] tw-duration-300 tw-border tw-border-transparent tw-justify-center tw-py-2 md:tw-py-4 tw-rounded-xl tw-gap-2"
                :class="selectPayChannel && selectPayChannel.id === channel.id ? 'tw-border-[#B13200] activePrice' : ''">
                {{ channel.payName }}
              </div>
            </div>
          </div>
          <div v-if="showCardForm" class="tw-bg-[#2A0800] tw-p-4 tw-rounded-xl">
            <h3 class="tw-text-white/70 tw-text-sm tw-mb-3">填写卡密信息</h3>
            <div class="tw-mb-3">
              <label class="tw-block tw-text-[#FFF6C7]/70 tw-text-xs tw-mb-1">充值卡密</label>
              <input v-model="cardPassword" type="text" placeholder="请输入充值卡密"
                class="tw-w-full tw-bg-[#2A0800] tw-border tw-border-[#B13200]/50 tw-rounded-lg tw-px-4 tw-py-2 tw-text-[#FFF6C7] tw-text-sm focus:tw-outline-none focus:tw-ring-1 focus:tw-ring-[#B13200]"
                :disabled="cardLoading" />
            </div>
            <p class="tw-text-[#FFF6C7]/50 tw-text-xs">温馨提示：卡密一经使用，不可退换</p>
          </div>
          <div class="tw-flex tw-justify-center tw-items-center tw-flex-col tw-gap-2 tw-mb-10 md:tw-mb-0 md:tw-gap-0">
            <span v-if="showCardForm || !isPC" class="tw-flex tw-items-center tw-text-[#FFF6C7]"> 充值金额： <img
                :src="Money" class="tw-w-6" /> <span class=" tw-text-sm "> {{
                  rechargeList &&
                    rechargeList.length > 0 ? rechargeList[curIndex]?.price :
                    defaultRechargeList[curIndex]?.price }}</span></span>
            <BaseButton @click="submitPay" v-if="showCardForm || !isPC" class="tw-text-white"
              :customStyle="{ width: isPC ? '100%' : '80%', height: isPC ? '3rem' : '2.6875rem' }"
              :font-size="isPC ? '1rem' : '0.875rem'">
              <template #name>
                <div class="tw-flex tw-items-center tw-gap-2">


                  <img :src="BtnIcon" class="tw-w-6" /> 充值
                </div>
              </template>
            </BaseButton>
            <span class="tw-text-white/70 tw-text-sm tw-text-center md:tw-hidden">禁止未成年人支付</span>
          </div>

        </div>
        <div class="md:tw-flex tw-hidden tw-flex-col tw-w-[27rem] tw-mb-[1.3125rem] tw-gap-5">
          <div class="tw-w-full tw-text-sm tw-flex tw-justify-end tw-text-white/70">
            二维码支付
          </div>
          <div class="tw-w-full tw-bg-[#2A0800] tw-rounded-xl tw-pt-4 tw-pb-8 tw-px-10">
            <div
              class="tw-flex tw-justify-between tw-pb-4 tw-border-b tw-border-white/20 tw-items-center tw-text-[#FFF6C7]">
              <div style="text-shadow:  0px 0px 4.3px rgba(255, 69, 69, 0.65);">
                充值金额
              </div>
              <div class="tw-flex tw-items-center tw-gap-2  tw-text-[2rem]">
                <img :src="Money" class="tw-w-[3.125rem] " />
                {{ rechargeList && rechargeList.length > 0 ? rechargeList[curIndex]?.price :
                  defaultRechargeList[curIndex]?.price }}
              </div>
            </div>
            <div class=" tw-flex tw-flex-col tw-justify-center tw-items-center tw-pt-10 tw-pb-8">
              <div v-if="qrCode"
                class="tw-w-[14.4375rem] tw-h-[14.4375rem] tw-bg-white tw-flex tw-items-center tw-justify-center">
                <img :src="qrCode" alt="支付二维码" class="tw-w-full tw-h-full tw-object-contain" />
              </div>
              <div v-else class="tw-w-[14.4375rem] tw-h-[14.4375rem] tw-flex tw-items-center tw-justify-center">
                <svg class="tw-animate-spin tw-h-8 tw-w-8 tw-text-blue-500" viewBox="0 0 24 24">
                  <circle class="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="tw-opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
              </div>
              <div class="tw-mt-3 tw-w-full tw-text-center">
                <span class="tw-text-[0.75rem] tw-text-orange-400">二维码有效期五分钟，禁止一码多扫重复支付!</span>
              </div>
              <div class="tw-mt-4">
                <button @click="checkPayStatus"
                  class="tw-bg-[#B13200] tw-text-white tw-py-2 tw-px-4 tw-rounded-lg tw-text-sm hover:tw-bg-[#932900] tw-transition-colors"
                  :disabled="payStatusLoading" v-if="payStatusLoading">
                  <span>查询中...</span>
                </button>
                <p v-if="paymentTimeoutAt && new Date() < paymentTimeoutAt"
                  class="tw-mt-1 tw-text-xs tw-text-[#FFF6C7]/70">
                  剩余时间: {{ Math.max(0, Math.floor((paymentTimeoutAt - new Date()) / 1000 / 60)) }}分钟
                </p>
              </div>
            </div>
            <BaseButton @click="submitPay" class="tw-text-white"
              :customStyle="{ width: '100%', height: isPC ? '3rem' : '1.75rem' }"
              :font-size="isPC ? '1rem' : '0.875rem'">
              <template #name>
                <div class="tw-flex tw-items-center tw-gap-2">
                  <img :src="BtnIcon" class="tw-w-6" /> 生成二维码
                </div>
              </template>
            </BaseButton>
          </div>
          <span class="tw-text-white/70 tw-text-sm tw-text-center">禁止未成年人支付</span>
        </div>
      </div>
    </div>

    <!-- 添加移动端二维码弹窗 -->
    <div v-if="showQrPopup"
      class="tw-fixed tw-inset-0 tw-bg-black/50 tw-z-50 tw-flex tw-items-center tw-justify-center md:tw-hidden">
      <div class="tw-bg-[#2A0800] tw-rounded-xl tw-p-6 tw-w-[80%] tw-max-w-[300px]">
        <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
          <h3 class="tw-text-[#FFF6C7] tw-text-lg">扫码支付</h3>
          <button @click="showQrPopup = false" class="tw-text-white/70 hover:tw-text-white">
            <svg t="1744272178420" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
              width="24" height="24">
              <path
                d="M525.269211 510.837524 918.101111 116.227118c7.17747-7.209192 7.14984-18.871813-0.059352-26.049283-7.210215-7.176446-18.87079-7.151887-26.049283 0.059352L499.278257 484.72890 106.563014 90.236164c-7.17747-7.209192-18.84009-7.235798-26.049283-0.059352-7.209192 7.17747-7.235798 18.84009-0.059352 26.049283L473.287303 510.837524 80.45438 905.446907c-7.176446 7.209192-7.150864 18.871813 0.059352 26.049283 3.593851 3.577478 8.29492 5.365194 12.994965 5.365194 4.727675 0 9.455349-1.809205 13.054317-5.424546l392.715243-394.491703 392.715243 394.491703c3.599991 3.615341 8.326643 5.424546 13.054317 5.424546 4.700045 0 9.402137-1.787716 12.994965-5.365194 7.209192-7.17747 7.235798-18.84009 0.059352-26.049283L525.269211 510.837524z"
                fill="currentColor" />
            </svg>
          </button>
        </div>
        <div class="tw-flex tw-flex-col tw-items-center">
          <div class="tw-w-[200px] tw-h-[200px] tw-bg-white tw-flex tw-items-center tw-justify-center tw-mb-4">
            <img :src="qrCode" alt="支付二维码" class="tw-w-full tw-h-full tw-object-contain" />
          </div>
          <div class="tw-text-center tw-text-[#FFF6C7]/70 tw-text-sm">
            <p class="tw-mt-2 tw-text-orange-400 tw-text-xs">二维码有效期五分钟，禁止一码多扫重复支付!</p>
            <div class="tw-mt-4">
              <button @click="checkPayStatus"
                class="tw-bg-[#B13200] tw-text-white tw-py-2 tw-px-4 tw-rounded-lg tw-text-sm hover:tw-bg-[#932900] tw-transition-colors"
                :disabled="payStatusLoading" v-if="payStatusLoading">
                <span>查询中...</span>
              </button>
              <p v-if="paymentTimeoutAt && new Date() < paymentTimeoutAt"
                class="tw-mt-1 tw-text-xs tw-text-[#FFF6C7]/70">
                剩余时间: {{ Math.max(0, Math.floor((paymentTimeoutAt - new Date()) / 1000 / 60)) }}分钟
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModel>
</template>

<style scoped>
.activePrice {
  background: linear-gradient(270deg, #4E1600 0%, #B43300 100%);
  box-shadow: 0px 4px 23.8px 0px rgba(168, 48, 1, 0.56);
  border: 1px solid #B13200;
}

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
