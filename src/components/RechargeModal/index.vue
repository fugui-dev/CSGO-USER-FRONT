<script setup>
import { ref, watch, computed, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { useRecharge } from "./sever/userecharge";
import request from "@/config/http/request.js";
import { postCardPay, queryOrderStatus } from "./sever/api.js";
import { useUserInfo } from "@/composables/useUesrInfo.js";
import QRCode from "qrcode";
import { useDeviceType } from "@/composables/useDeviceType.js";
import BaseModel from "@/components/BaseModel/index.vue";
import Title from "@/components/Title.vue";
import { requireImg } from "@/utils/common";
import Money from "@/assets/icons/money.svg";
import BtnIcon from "@/assets/rechargeModal/btn.png";
import iPay from "@/assets/images/recharge/ipay-icon.png";
import cardPay from "@/assets/images/recharge/card-pay-icon.png";
const props = defineProps({
  // 可以添加自定义属性
});

const visible = ref(false);
const curIndex = ref(0);
const selectPayType = ref("alipay");
const selectPayChannel = ref(null);
const qrCode = ref("");
const showQrPopup = ref(false);
const loading = ref(false);
const order = ref(null);
const payStatusLoading = ref(false);
const pollingTimer = ref(null);
const pollingStatus = ref("");
const paymentTimeoutAt = ref(null);

// 卡密支付相关
const showCardForm = ref(false); // 控制卡密表单显示
const cardPassword = ref(""); // 卡密
const cardLoading = ref(false); // 卡密验证加载状态

const { rechargeList, payConfigList, fetchRechargeData, fetchPayConfigData } =
  useRecharge();
const { fetchUserInfo } = useUserInfo();
// 默认充值金额，在API数据加载前使用
const defaultRechargeList = [
  { id: 1, productA: 50, price: 50 },
  { id: 2, productA: 100, price: 100 },
  { id: 3, productA: 200, price: 200 },
  { id: 4, productA: 500, price: 500 },
  { id: 5, productA: 1000, price: 1000 },
  { id: 6, productA: 2000, price: 2000 },
];
const enableRechargeList = computed(() => {
  return rechargeList.value || defaultRechargeList;
});

// 支付方式
const payTypes = ref([
  // { id: '20', name: '微信', icon: 'wechat-icon' },
  { id: "30", name: "支付宝", icon: iPay },
  { id: "card", name: "卡密支付", icon: cardPay },
]);

// 使用设备类型检测
const { isPC } = useDeviceType();

// 选择金额
const selectAmount = (item, index) => {
  curIndex.value = index;
};

// 选择支付通道
const selectChannel = (channel) => {
  selectPayChannel.value = channel;
};

// 监听支付方式变化
watch(selectPayType, (newType) => {
  if (newType === "card") {
    showCardForm.value = true;
    selectPayChannel.value = null; // 卡密支付不需要支付通道
  } else {
    showCardForm.value = false;
  }
});

const postPayOrder = (data) => {
  console.log(selectPayChannel.value.payTag, "123");
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
      ElMessage.error("支付链接无效");
      return;
    }
    showQrPopup.value = true;
  } catch (error) {
    console.error("支付跳转失败:", error);
    ElMessage.error("支付跳转失败，请重试");
  }
};

// 提交支付
const submitPay = async () => {
  // 停止可能存在的轮询
  stopPolling();

  // 重置支付超时时间
  paymentTimeoutAt.value = null;

  // 如果是卡密支付，走卡密验证流程
  if (selectPayType.value === "card") {
    if (!cardPassword.value) {
      ElMessage.warning("请输入充值卡密");
      return;
    }

    await submitCardPay();
    return;
  }

  if (!selectPayChannel.value) {
    ElMessage.warning("请选择支付通道");
    return;
  }

  loading.value = true;
  try {
    console.log(selectPayChannel.value.payTag, "321");

    const res = await postPayOrder({
      goodsNum: 1,
      goodsPrice: rechargeList.value[curIndex.value].price,
      goodsId: rechargeList.value[curIndex.value].id,
      payType: selectPayType.value,
    });
    if (res.code === 200) {
      order.value = {
        orderNo: res.data.orderId,
        outTradeNo: res.data.outTradeNo,
        amount: rechargeList.value[curIndex.value].price,
        payType: selectPayType.value,
        payUrl: res.data.payUrl,
      };
      console.log(order.value);
      // 生成二维码
      try {
        qrCode.value = await QRCode.toDataURL(res.data.payUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
      } catch (err) {
        console.error("生成二维码失败:", err);
        ElMessage.error("生成二维码失败，请重试");
        return;
      }

      // 显示二维码弹窗
      showQrPopup.value = true;
      loading.value = false;

      // 自动开始轮询支付状态
      startPayStatusPolling();

      return res.data;
    }
  } catch (error) {
    loading.value = false;
    console.log(error, "123");
  }
};

// 开始轮询支付状态
const startPayStatusPolling = () => {
  console.log("开始轮询", order);
  if (!order.value || !order.value.orderNo) {
    return;
  }

  // 清除可能存在的定时器
  stopPolling();

  // 设置支付超时时间（5分钟后）
  paymentTimeoutAt.value = new Date(Date.now() + 5 * 60 * 1000);

  payStatusLoading.value = true;
  pollingStatus.value = "正在查询支付状态...";

  // 开始轮询查询
  let count = 0;
  const maxAttempts = 60; // 增加到60次，覆盖5分钟（3秒一次）
  const intervalTime = 3000; // 轮询间隔时间，3秒

  // 创建一个立即执行一次的轮询
  const checkOrder = async () => {
    // 检查订单是否已失效
    if (paymentTimeoutAt.value && new Date() > paymentTimeoutAt.value) {
      clearInterval(pollingTimer.value);
      pollingTimer.value = null;
      pollingStatus.value = "支付已超时，请重新生成二维码";
      ElMessage.warning("支付已超时，请重新生成二维码");
      payStatusLoading.value = false;
      return false;
    }

    try {
      const res = await queryOrderStatus(order.value.orderNo);
      if (res.code === 200 && res.data === true) {
        // 支付成功
        clearInterval(pollingTimer.value);
        pollingTimer.value = null;
        pollingStatus.value = "支付成功";
        ElMessage.success("充值成功");
        fetchUserInfo(); // 刷新用户信息
        showQrPopup.value = false;
        visible.value = false;
        payStatusLoading.value = false;
        return true;
      }

      count++;
      // 更新轮询状态
      pollingStatus.value = `正在查询支付状态...(${count}/${maxAttempts})`;

      if (count >= maxAttempts) {
        clearInterval(pollingTimer.value);
        pollingTimer.value = null;
        pollingStatus.value = "查询超时，请手动检查";
        ElMessage.warning("支付结果查询超时，请稍后查看账户余额");
        payStatusLoading.value = false;
      }
      return false;
    } catch (error) {
      console.error("查询支付状态失败:", error);
      // 错误时不要立即停止轮询，允许重试
      if (count >= maxAttempts) {
        clearInterval(pollingTimer.value);
        pollingTimer.value = null;
        pollingStatus.value = "查询失败，请手动检查";
        ElMessage.error("查询支付状态失败，请稍后查看账户余额");
        payStatusLoading.value = false;
      }
      return false;
    }
  };

  // 立即执行一次
  checkOrder();

  // 设置定时器，每3秒查询一次
  pollingTimer.value = setInterval(checkOrder, intervalTime);
};

// 检查支付状态
const checkPayStatus = async () => {
  if (!order.value || !order.value.orderNo) {
    ElMessage.warning("订单信息不存在");
    return;
  }

  if (payStatusLoading.value) {
    ElMessage.info("正在查询支付状态，请稍候...");
    return;
  }

  // 手动检查一次
  payStatusLoading.value = true;
  pollingStatus.value = "手动查询支付状态...";
  try {
    const res = await queryOrderStatus(order.value.orderNo);
    if (res.code === 200 && res.data === true) {
      pollingStatus.value = "支付成功";
      ElMessage.success("充值成功");
      fetchUserInfo(); // 刷新用户信息
      showQrPopup.value = false;
      visible.value = false;
    } else {
      // 检查订单是否已超时
      if (paymentTimeoutAt.value && new Date() > paymentTimeoutAt.value) {
        pollingStatus.value = "支付已超时，请重新生成二维码";
        ElMessage.warning("支付已超时，请重新生成二维码");
      } else {
        // 如果未支付成功且未超时，则重新开始轮询
        startPayStatusPolling();
        ElMessage.info("支付未完成，已重新开始监测支付状态");
      }
    }
  } catch (error) {
    console.error("手动查询支付状态失败:", error);
    pollingStatus.value = "查询失败，请重试";
    ElMessage.error("查询支付状态失败，请重试");
  } finally {
    payStatusLoading.value = false;
  }
};

// 卡密充值函数
const submitCardPay = async () => {
  cardLoading.value = true;
  try {
    // 这里替换为实际的卡密验证API
    const res = await postCardPay({
      password: cardPassword.value,
    });

    if (res.code === 200) {
      ElMessage.success("卡密充值成功");
      fetchUserInfo(); // 刷新用户信息
      cardPassword.value = "";
      // 关闭模态框
      visible.value = false;
    }
  } catch (error) {
    console.error("卡密验证失败:", error);
  } finally {
    cardLoading.value = false;
  }
};

// 停止轮询函数
const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value);
    pollingTimer.value = null;
    payStatusLoading.value = false;
    pollingStatus.value = "";
  }
};

// 监听二维码弹窗状态
watch(showQrPopup, (val) => {
  if (!val) {
    stopPolling();
  }
});

// 清理状态
watch(visible, async (val) => {
  if (val) {
    curIndex.value = 0; // 重置索引
    selectPayType.value = "alipay"; // 重置为默认支付方式
    showCardForm.value = false; // 隐藏卡密表单
    cardPassword.value = ""; // 清空卡密
    order.value = null; // 重置订单信息
    paymentTimeoutAt.value = null; // 重置支付超时时间
    await fetchRechargeData(); // 等待数据加载
    await fetchPayConfigData();
  }
  if (!val) {
    qrCode.value = "";
    showQrPopup.value = false;
    stopPolling(); // 使用停止轮询函数
  }
});

// 组件卸载时清理资源
onUnmounted(() => {
  stopPolling();
});

const open = () => {
  visible.value = true;
};

const close = () => {
  stopPolling(); // 确保停止轮询
  fetchUserInfo();
  visible.value = false;
};

// 暴露方法给父组件
defineExpose({
  open,
  close,
});
</script>

<template>
  <el-dialog
    v-model="visible"
    width="1163"
    :show-close="false"
    align-center
    style="--el-dialog-bg-color: transparent"
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="recharge-wrapper">
      <img
        slot="header"
        class="title"
        src="@/assets/images/recharge/title.png"
        alt=""
      />
      <img class="close" src="@/assets/images/recharge/close.png" alt="" />
      <div class="close-click" @click="close" />
      <div class="recharge-content tw-flex tw-justify-between">
        <div class="pay-content">
          <div class="tip">选择充值</div>
          <div class="recharge-select tw-flex">
            <div
              class="recharge-item tw-flex tw-items-center"
              :class="curIndex === index ? 'active' : ''"
              v-for="(item, index) in enableRechargeList"
              :key="'default-' + item.id"
              @click="selectAmount(item, index)"
            >
              <img
                class="coin-icon"
                src="@/assets/images/recharge/coin.png"
                alt=""
              />
              <div class="amount">{{ item.productA }}</div>
            </div>
          </div>
          <div class="tip pay-type">选择支付方式</div>
          <div class="pay-type-select tw-flex">
            <div
              class="pay-type-item tw-flex tw-items-center"
              :class="selectPayType === type.id ? 'active' : ''"
              v-for="type in payTypes"
              :key="type.name"
              @click="selectPayType = type.id"
            >
              <img class="pay-icon" :src="type.icon" alt="" />
              <div class="pay-text">{{ type.name }}</div>
            </div>
          </div>
          <template
            v-if="!showCardForm && payConfigList && payConfigList.length > 0"
          >
            <div class="tip pay-select">选择支付通道</div>
            <div class="pay-channel-select tw-flex-col">
              <div
                class="pay-channel-item"
                :class="
                  selectPayChannel && selectPayChannel.id === channel.id
                    ? 'active'
                    : ''
                "
                v-for="channel in payConfigList"
                :key="channel.id"
                @click="selectChannel(channel)"
                v-show="
                  channel.status === 1 &&
                  channel.payTag &&
                  channel.payTag.length > 0
                "
              >
                {{ channel.payName }}
              </div>
            </div>
          </template>
          <template v-if="showCardForm">
            <div class="card-wrapper">
              <el-input
                class="card-input"
                style="--el-input-placeholder-color: #49473c"
                v-model="cardPassword"
                placeholder="请输入充值卡密"
              ></el-input>
              <div class="card-tip">温馨提示：卡密一经试用，不可退换</div>
            </div>
            <div
              class="card-pay tw-flex tw-items-center tw-justify-center"
              @click="submitPay"
            >
              <img
                class="card-pay-coin-icon"
                src="@/assets/images/recharge/coin.png"
                alt=""
              />
              <div class="price">{{ enableRechargeList[curIndex]?.price }}</div>
              <img
                class="card-pay-icon"
                src="@/assets/images/recharge/card-pay.png"
                alt=""
              />
              充值
            </div>
          </template>
        </div>
        <div class="qrcode tw-flex tw-flex-col tw-items-center">
          <div class="pay-amount tw-flex tw-items-center tw-justify-center">
            支付金额
            <img
              class="pay-coin-icon"
              src="@/assets/images/recharge/coin.png"
              alt=""
            />
            {{ enableRechargeList[curIndex]?.price }}
          </div>
          <img
            v-if="qrCode"
            :src="qrCode"
            alt="支付二维码"
            class="qrcode-img"
          />
          <div
            v-else
            class="qrcode-img tw-flex tw-items-center tw-justify-center"
          >
            <svg
              class="tw-animate-spin tw-h-8 tw-w-8 tw-text-blue-500"
              viewBox="0 0 24 24"
            >
              <circle
                class="tw-opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="tw-opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <div class="tw-text-center tw-text-[#FFF6C7]/70 tw-text-sm">
            <p class="qrcode-tip">二维码有效期五分钟，禁止一码多扫重复支付!</p>
            <div class="tw-mt-4">
              <button
                @click="checkPayStatus"
                class="tw-bg-[#B13200] tw-text-white tw-py-2 tw-px-4 tw-rounded-lg tw-text-sm hover:tw-bg-[#932900] tw-transition-colors"
                :disabled="payStatusLoading"
                v-if="payStatusLoading"
              >
                <span>查询中...</span>
              </button>
              <p
                v-if="paymentTimeoutAt && new Date() < paymentTimeoutAt"
                class="tw-mt-1 tw-text-xs tw-text-[#FFF6C7]/70"
              >
                剩余时间:
                {{
                  Math.max(
                    0,
                    Math.floor((paymentTimeoutAt - new Date()) / 1000 / 60)
                  )
                }}分钟
              </p>
            </div>
          </div>
          <div class="pay-tip">禁止未成年人支付</div>
          <div class="create-qrcode" @click="submitPay">生成二维码</div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.recharge-wrapper {
  height: 730px;
  background: url("@/assets/images/recharge/bg.webp") no-repeat;
  background-size: 100% 100%;
  position: relative;
  line-height: normal;
  .title {
    width: 239px;
    height: 169px;
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
  }
  .close {
    width: 70px;
    height: 173px;
    position: absolute;
    right: 26px;
    top: 47px;
  }
  .close-click {
    width: 70px;
    height: 70px;
    position: absolute;
    right: 26px;
    top: 47px;
    cursor: pointer;
  }
  .recharge-content {
    width: 900px;
    margin: 0 auto;
    padding-top: 110px;
    .pay-content {
      flex: 1;
      .tip {
        text-align: left;
        font-weight: 500;
        font-size: 24px;
        color: #1d1f22;
      }
      .recharge-select {
        margin-top: 33px;
        flex-wrap: wrap;
        gap: 30px 39px;
        .recharge-item {
          width: 139px;
          height: 40px;
          background: url("@/assets/images/recharge/coin-bg.png") no-repeat;
          background-size: 100% 100%;
          cursor: pointer;
          &.active {
            background: url("@/assets/images/recharge/coin-active-bg.png")
              no-repeat;
            background-size: 100% 100%;
          }
          .coin-icon {
            margin-left: 8px;
            margin-bottom: 5px;
            width: 37px;
            height: 36px;
          }
          .amount {
            font-weight: 500;
            font-size: 17px;
            color: #ffffff;
            flex: 1;
            text-align: center;
          }
        }
      }
      .pay-type {
        margin-top: 40px;
      }
      .pay-type-select {
        margin-top: 21px;
        gap: 30px 18px;
        .pay-type-item {
          width: 191px;
          height: 66px;
          background: url("@/assets/images/recharge/pay-bg.png") no-repeat;
          background-size: 100% 100%;
          cursor: pointer;
          &.active {
            background: url("@/assets/images/recharge/pay-active-bg.png")
              no-repeat;
            background-size: 100% 100%;
          }
          .pay-icon {
            margin-left: 22px;
            margin-right: 15px;
            width: 44px;
            height: 44px;
          }
          .pay-text {
            font-weight: 500;
            font-size: 17px;
            color: #ffffff;
          }
        }
      }
      .pay-select {
        margin-top: 37px;
      }
      .pay-channel-select {
        margin-top: 12px;
        .pay-channel-item {
          width: 503px;
          height: 40px;
          line-height: 40px;
          background: url("@/assets/images/recharge/pay-channel-bg.png")
            no-repeat;
          background-size: 100% 100%;
          font-weight: 500;
          font-size: 17px;
          color: #ffffff;
          cursor: pointer;
          &.active {
            background: url("@/assets/images/recharge/pay-channel-active-bg.png")
              no-repeat;
            background-size: 100% 100%;
          }
        }
      }
      .card-wrapper {
        margin-top: 11px;
        width: 500px;
        height: 118px;
        background: url("@/assets/images/recharge/card-bg.png") no-repeat;
        background-size: 100% 100%;
        padding: 18px 12px 9px;
        .card-input {
          width: 479px;
          height: 43px;
          border-radius: 8px;
          :deep() {
            .el-input__wrapper {
              background-color: #a4a592;
              box-shadow: none;
              font-size: 19px;
            }
            .el-input__inner {
              color: #49473c;
            }
          }
        }
        .card-tip {
          text-align: left;
          margin-top: 16px;
          margin-left: 12px;
          font-weight: 500;
          font-size: 17px;
          color: #77786c;
        }
      }
      .card-pay {
        margin-top: 14px;
        width: 500px;
        height: 40px;
        line-height: 40px;
        background: url("@/assets/images/recharge/card-pay-bg.png") no-repeat;
        background-size: 100% 100%;
        cursor: pointer;
        font-weight: 500;
        font-size: 17px;
        color: #ffffff;
        .card-pay-coin-icon {
          width: 31px;
          height: 29px;
          margin-right: 7px;
        }
        .price {
          color: #49473c;
        }
        .card-pay-icon {
          width: 26px;
          height: 30px;
          margin: 0 6px 0 52px;
        }
      }
    }
    .qrcode {
      margin-top: 35px;
      .pay-amount {
        font-weight: 500;
        font-size: 20px;
        color: #1d1f22;
        .pay-coin-icon {
          width: 47px;
          height: 45px;
          margin: 0 15px 0 17px;
        }
      }
      .qrcode-img {
        margin: 12px auto 0;
        width: 229px;
        height: 229px;
        background-color: #fff;
      }
      .qrcode-tip {
        margin-top: 34px;
        font-weight: 500;
        font-size: 16px;
        color: #1d1f22;
      }
      .pay-tip {
        margin-top: 16px;
        font-weight: 500;
        font-size: 18px;
        color: #f14848;
      }
      .create-qrcode {
        margin-top: 16px;
        width: 302px;
        height: 81px;
        line-height: 70px;
        background: url("@/assets/images/recharge/qrcode.png") no-repeat;
        background-size: 100% 100%;
        font-weight: 500;
        font-size: 24px;
        color: #072523;
        cursor: pointer;
      }
    }
  }
}
</style>
