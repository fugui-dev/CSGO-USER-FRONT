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
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 99;
  .countdown {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    font-size: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 6px solid #ccc;
    color: #ffffff;
    background: linear-gradient(#e9e7e3, #646463);
  }
}
</style>
