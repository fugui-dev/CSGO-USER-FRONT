<script setup>
import { onUnmounted, onMounted, ref, defineEmits } from "vue";

const props = defineProps({
  startSecond: {
    type: Number,
  },
});

const emit = defineEmits("end");
const countdownValue = ref(0);
const timer = ref(null);

const init = () => {
  countdownValue.value = props.startSecond;
  timer.value = setTimeout(function tick() {
    if (countdownValue.value > 1) {
      countdownValue.value--;
      timer.value = setTimeout(tick, 1000);
    } else {
      emit("end");
      clearTimeout(timer.value);
    }
  }, 1000);
};

onMounted(() => {
  init();
});

onUnmounted(() => {
  if (timer.value) {
    clearTimeout(timer.value);
  }
});
</script>
<template>
  <div class="countdown-container">
    <div class="countdown">{{ countdownValue }}</div>
  </div>
</template>

<style scoped lang="scss">
  @use "@/style" as *;
.countdown-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 12px auto;
  @include mobile {
    margin: 6px auto;
  }
  .countdown {
    width: 89px;
    height: 89px;
    text-align: center;
    line-height: 89px;
    font-size: 38px;
    color: #ffffff;
    background: url("@/assets/images/champion/game/odds-countdown.png")
      no-repeat;
    background-size: 100% 100%;
    @include mobile {
      width: 36px;
      height: 36px;
      line-height: 36px;
      font-size: 18px;
    }
  }
}
</style>
