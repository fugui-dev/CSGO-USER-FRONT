<template>
  <div class="wait-wrapper">
    <img
      src="@/assets/images/champion/waiting-bg.png"
      alt=""
      class="waiting-img"
    />
    <div class="wait-text">游戏等待中</div>
    <div class="count-time">
      {{ formattedDays }}{{ labels.days }}{{ formattedHours }}{{ labels.hours
      }}{{ formattedMinutes }}{{ labels.minutes }}{{ formattedSeconds
      }}{{ labels.seconds }}
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
});

const emit = defineEmits(["start", "pause", "finish", "update"]);

// 状态
const remainingTime = ref(0);
const isRunning = ref(false);
const isFinished = ref(false);
const timer = ref(null);
const lastUpdateTime = ref(0);
const status = ref("waiting"); // waiting | running | paused | finished

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

  const now = Date.now();
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

// 组件挂载时初始化
onMounted(() => {
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

<style scoped>
.wait-wrapper {
  width: 100%;
  height: 48.23vw;
  position: relative;
  background: url("@/assets/images/champion/waiting-shadow-bg.png") no-repeat;
  background-size: 100vw 46.15vw;
  overflow: hidden;
  .waiting-img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  .wait-text {
    position: relative;
    margin-top: 16vw;
    text-align: center;
    font-family: Jijiati;
    font-weight: 400;
    font-size: 43px;
    color: #f2ffef;
    line-height: normal;
  }
  .count-time {
    position: relative;
    margin-top: 10px;
    text-align: center;
    font-weight: 500;
    font-size: 26px;
    color: #ffc923;
  }
}
</style>
