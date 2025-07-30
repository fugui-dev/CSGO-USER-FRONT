<script setup>
import {onUnmounted, onMounted, ref} from "vue";
import {requireImg} from "@/utils/common";

const visible = ref(false)
const countdownValue = ref(3)
const timer = ref(null)
const emit = defineEmits(['close'])

const open = () => {
  visible.value = true
  timer.value = setTimeout(function tick() {
    if (countdownValue.value > 1) {
      countdownValue.value--
      timer.value = setTimeout(tick, 1000)
    } else {
      countdownValue.value = '开始'
      close()
      clearTimeout(timer.value)
    }
  }, 1000)
}

const close = () => {
    visible.value = false
    emit('close')
}

defineExpose({
    open,
    close
})

onUnmounted(() => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
})

</script>
<template>
    <div class="countdown-modal" v-show="visible">
      <div class="countdown">{{ countdownValue }}</div>
    </div>
</template>

<style scoped lang="scss">
.countdown-modal {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 99;
  .countdown {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    font-size: 26px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 6px solid #f2a814;
    color: #684412;
    background: linear-gradient(#f8debb, #f1cf80);
  }
}
</style>
