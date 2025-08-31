<script setup>
import {onUnmounted, onMounted, ref, defineEmits} from "vue";


const props = defineProps({
  startSecond: {
    type: Number
  }
});

const emit = defineEmits('end')
const countdownValue = ref(0)
const timer = ref(null)

const init = () => {
  countdownValue.value = props.startSecond
  timer.value = setTimeout(function tick() {
    if (countdownValue.value > 1) {
      countdownValue.value--
      timer.value = setTimeout(tick, 1000)
    } else {
      emit('end')
      clearTimeout(timer.value)
    }
  }, 1000)
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
})

</script>
<template>
    <div class="countdown-container">
      <div class="countdown">{{ countdownValue }}</div>
      <p>请选择</p>
    </div>
</template>

<style scoped lang="scss">
.countdown-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 12px 0;
  .countdown {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 3px solid #f2a814;
    color: #684412;
    background: linear-gradient(#f8debb, #f1cf80);
  }
  p {
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    font-size: 14px;
    color: #aaa;
    margin-top: 12px;
  }
}
</style>
