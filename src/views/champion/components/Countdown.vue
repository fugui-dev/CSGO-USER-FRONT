<template>
  <div class="countdown-container">
    <!-- 倒计时显示 -->
    <div class="time-display">
      <div class="time-unit" v-if="showDays">
        <span class="value">{{ formattedDays }}</span>
        <span class="label">{{ labels.days }}</span>
      </div>
      <div class="time-unit">
        <span class="value">{{ formattedHours }}</span>
        <span class="label">{{ labels.hours }}</span>
      </div>
      <div class="time-unit">
        <span class="value">{{ formattedMinutes }}</span>
        <span class="label">{{ labels.minutes }}</span>
      </div>
      <div class="time-unit">
        <span class="value">{{ formattedSeconds }}</span>
        <span class="label">{{ labels.seconds }}</span>
      </div>
    </div>

    <!-- 状态显示 -->
    <div class="status" v-if="showStatus">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  // 目标时间 (时间戳、Date对象或ISO字符串)
  targetTime: {
    type: [Number, Date, String, null],
    default: null
  },
  // 服务器时间戳 (毫秒)
  serverTimestamp: {
    type: Number,
    default: 0
  },
  // 是否自动开始
  autoStart: {
    type: Boolean,
    default: true
  },
  // 是否显示天数
  showDays: {
    type: Boolean,
    default: true
  },
  // 是否显示状态
  showStatus: {
    type: Boolean,
    default: false
  },
  // 自定义标签
  labels: {
    type: Object,
    default: () => ({
      days: '天',
      hours: '时',
      minutes: '分',
      seconds: '秒'
    })
  },
  // 更新频率(毫秒)
  updateInterval: {
    type: Number,
    default: 1000,
    validator: value => value > 0
  }
});

const emit = defineEmits(['start', 'pause', 'finish', 'update']);

// 状态
const remainingTime = ref(0);
const isRunning = ref(false);
const isFinished = ref(false);
const timer = ref(null);
const lastUpdateTime = ref(0);
const status = ref('waiting'); // waiting | running | paused | finished

// 计算显示的时间部分
const formattedDays = computed(() => Math.floor(remainingTime.value / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'));
const formattedHours = computed(() => Math.floor((remainingTime.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'));
const formattedMinutes = computed(() => Math.floor((remainingTime.value % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'));
const formattedSeconds = computed(() => Math.floor((remainingTime.value % (1000 * 60)) / 1000).toString().padStart(2, '0'));

// 状态消息
const statusMessage = computed(() => {
  switch (status.value) {
    case 'waiting': return '等待设置目标时间...';
    case 'running': return '倒计时运行中...';
    case 'paused': return '倒计时已暂停';
    case 'finished': return '倒计时结束!';
    default: return '';
  }
});

// 解析目标时间
const parseTargetTime = (target) => {
  if (target === null || target === undefined) return null;
  if (typeof target === 'string') return new Date(target).getTime();
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
  
  // 使用服务器时间戳作为基准，加上前端时间差
  const now = props.serverTimestamp ? 
    props.serverTimestamp + (Date.now() - lastUpdateTime.value) : 
    Date.now();
  
  remainingTime.value = Math.max(0, target - now);
  isFinished.value = remainingTime.value <= 0;
  return remainingTime.value;
};

// 更新倒计时
const updateCountdown = () => {
  // 简单递减剩余时间，每秒减少1000毫秒
  remainingTime.value = Math.max(0, remainingTime.value - 1000);
  isFinished.value = remainingTime.value <= 0;
  
  emit('update', {
    days: formattedDays.value,
    hours: formattedHours.value,
    minutes: formattedMinutes.value,
    seconds: formattedSeconds.value,
    totalMs: remainingTime.value,
    status: status.value
  });
  
  if (remainingTime.value <= 0) {
    stop();
    status.value = 'finished';
    emit('finish');
  }
};

// 开始倒计时
const start = () => {
  if (isRunning.value || isFinished.value) return;
  
  calculateRemaining();
  if (remainingTime.value <= 0) {
    isFinished.value = true;
    status.value = 'finished';
    return;
  }
  
  isRunning.value = true;
  status.value = 'running';
  lastUpdateTime.value = Date.now();
  timer.value = setInterval(updateCountdown, props.updateInterval);
  emit('start');
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
  status.value = props.targetTime ? 'waiting' : 'finished';
  calculateRemaining();
};

// 监听目标时间变化
watch(() => props.targetTime, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    reset();
    if (props.autoStart) {
      start();
    }
  }
}, { deep: true });

// 监听服务器时间戳变化，重新同步时间
watch(() => props.serverTimestamp, (newVal) => {
  if (newVal && newVal > 0) {
    // 当服务器时间戳更新时，重置客户端参考时间
    lastUpdateTime.value = Date.now();
    calculateRemaining();
  }
});

// 组件挂载时初始化
onMounted(() => {
  // 初始化客户端参考时间
  lastUpdateTime.value = Date.now();
  
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
    totalMs: remainingTime.value
  })
});
</script>

<style scoped>
.countdown-container {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.time-display {
  display: flex;
  gap: 0.5rem;
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
  background-color: #222;
  width: 84px;
  padding: 10px 0;
  border-radius: 12px;
  box-shadow: 3px 4px 12px rgba(95, 95, 88, 0.8);
}

.value {
  font-size: 3.4rem;
  font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
  font-weight: bold;
  color: #fff;
}

.label {
  font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
  font-size: 1rem;
  color: #fff;
}

.status {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
}
</style>