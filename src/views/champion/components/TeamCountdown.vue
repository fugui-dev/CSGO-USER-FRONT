<template>
  <div class="wait-wrapper">
    <div class="content">
      <slot name="count" />
      <div class="wait-text">战队集结中</div>
      <div class="count-time">
        {{ formattedDays }}{{ labels.days }}{{ formattedHours }}{{ labels.hours
        }}{{ formattedMinutes }}{{ labels.minutes }}{{ formattedSeconds
        }}{{ labels.seconds }}
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps({
  // 目标时间 (时间戳、Date对象或ISO字符串)
  targetTime: {
    type: [Number, Date, String, null],
    default: null,
  },
  // 是否自动开始
  autoStart: {
    type: Boolean,
    default: true,
  },
  // 是否显示天数
  showDays: {
    type: Boolean,
    default: true,
  },
  // 是否显示状态
  showStatus: {
    type: Boolean,
    default: false,
  },
  // 自定义标签
  labels: {
    type: Object,
    default: () => ({
      days: "天",
      hours: "时",
      minutes: "分",
      seconds: "秒",
    }),
  },
  // 更新频率(毫秒)
  updateInterval: {
    type: Number,
    default: 1000,
    validator: (value) => value > 0,
  },
  // 服务端时间戳（建议传 CURRENT_PROGRESS.timestamp）
  serverTimestamp: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["start", "pause", "finish", "update", 'create']);

// 状态
const remainingTime = ref(0);
const isRunning = ref(false);
const isFinished = ref(false);
const timer = ref(null);
const lastUpdateTime = ref(0);
const status = ref("waiting"); // waiting | running | paused | finished
// 基于服务端时间的“现在”计算
const baseServerTs = ref(null);
const baseClientTs = ref(0);

// 计算显示的时间部分
const formattedDays = computed(() =>
  Math.floor(remainingTime.value / (1000 * 60 * 60 * 24))
    .toString()
    .padStart(2, "0")
);
const formattedHours = computed(() =>
  Math.floor((remainingTime.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    .toString()
    .padStart(2, "0")
);
const formattedMinutes = computed(() =>
  Math.floor((remainingTime.value % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, "0")
);
const formattedSeconds = computed(() =>
  Math.floor((remainingTime.value % (1000 * 60)) / 1000)
    .toString()
    .padStart(2, "0")
);

// 状态消息
const statusMessage = computed(() => {
  switch (status.value) {
    case "waiting":
      return "等待设置目标时间...";
    case "running":
      return "倒计时运行中...";
    case "paused":
      return "倒计时已暂停";
    case "finished":
      return "倒计时结束!";
    default:
      return "";
  }
});

// 解析目标时间
const parseTargetTime = (target) => {
  if (target === null || target === undefined) return null;
  if (typeof target === "string") return new Date(target).getTime();
  if (target instanceof Date) return target.getTime();
  return target;
};

// 计算剩余时间
const calculateRemaining = () => {
  const target = parseTargetTime(props.targetTime);
  if (target === null) {
    remainingTime.value = 0;
    isFinished.value = false;
    return 0;
  }

  // 使用服务端时间作为基准：now = serverTs + (clientNow - baseClientTs)
  let now = Date.now();
  if (baseServerTs.value) {
    now = baseServerTs.value + (Date.now() - baseClientTs.value);
  }
  remainingTime.value = Math.max(0, target - now);
  isFinished.value = remainingTime.value <= 0;
  return remainingTime.value;
};

// 更新倒计时
const updateCountdown = () => {
  const now = Date.now();
  const delta = now - lastUpdateTime.value;
  lastUpdateTime.value = now;

  remainingTime.value = Math.max(0, remainingTime.value - delta);
  isFinished.value = remainingTime.value <= 0;

  emit("update", {
    days: formattedDays.value,
    hours: formattedHours.value,
    minutes: formattedMinutes.value,
    seconds: formattedSeconds.value,
    totalMs: remainingTime.value,
    status: status.value,
  });

  if (remainingTime.value <= 0) {
    stop();
    status.value = "finished";
    emit("finish");
  }
};

// 开始倒计时
const start = () => {
  if (isRunning.value || isFinished.value) return;

  calculateRemaining();
  if (remainingTime.value <= 0) {
    isFinished.value = true;
    status.value = "finished";
    return;
  }

  isRunning.value = true;
  status.value = "running";
  lastUpdateTime.value = Date.now();
  timer.value = setInterval(updateCountdown, props.updateInterval);
  emit("start");
};

// 停止倒计时
const stop = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  isRunning.value = false;
};

// 重置倒计时
const reset = () => {
  stop();
  isFinished.value = false;
  status.value = props.targetTime ? "waiting" : "finished";
  calculateRemaining();
};

// 监听目标时间变化
watch(
  () => props.targetTime,
  (newVal) => {
    if (newVal !== null && newVal !== undefined) {
      reset();
      if (props.autoStart) {
        start();
      }
    }
  },
  { deep: true }
);

// 监听服务端时间戳变化，刷新基准
watch(
  () => props.serverTimestamp,
  (ts) => {
    if (typeof ts === 'number' && !Number.isNaN(ts)) {
      baseServerTs.value = ts;
      baseClientTs.value = Date.now();
      // 基准改变后立刻重新计算一次
      calculateRemaining();
    } else {
      baseServerTs.value = null;
    }
  }
);

// 组件挂载时初始化
onMounted(() => {
  // 初始化服务端时间基准
  if (typeof props.serverTimestamp === 'number' && !Number.isNaN(props.serverTimestamp)) {
    baseServerTs.value = props.serverTimestamp;
    baseClientTs.value = Date.now();
  }
  if (props.targetTime !== null && props.targetTime !== undefined) {
    calculateRemaining();
    if (props.autoStart && remainingTime.value > 0) {
      start();
    }
  }
});

// 组件卸载前清理
onBeforeUnmount(() => {
  stop();
});

// 暴露方法给父组件
defineExpose({
  start,
  stop,
  reset,
  getStatus: () => status.value,
  getRemainingTime: () => ({
    days: formattedDays.value,
    hours: formattedHours.value,
    minutes: formattedMinutes.value,
    seconds: formattedSeconds.value,
    totalMs: remainingTime.value,
  }),
});
</script>

<style scoped lang="scss">
@use "@/style" as *;
.wait-wrapper {
  width: 100%;
  height: 55.36vw;
  background: url("@/assets/images/champion/team/waiting.png") no-repeat;
  background-size: 100vw 100%;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  @include mobile {
    height: 26vh;
  }
  .content {
    position: relative;
    margin-top: 21vw;
    text-align: center;
  }
  .wait-text {
    font-family: Jijiati;
    font-weight: 400;
    font-size: 43px;
    color: #f2ffef;
    line-height: normal;
    @include mobile {
      font-size: 28px;
    }
  }
  .count-time {
    position: relative;
    margin-top: 10px;
    text-align: center;
    font-weight: 500;
    font-size: 26px;
    color: #ffc923;
    @include mobile {
      font-size: 18px;
    }
  }
}
</style>
