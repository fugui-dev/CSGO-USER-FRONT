<script setup>
import { onMounted, nextTick, ref, computed, inject, watch } from "vue";
import { requireImg } from "@/utils/common";
import { useStore } from "@/store";
import end1 from "@/assets/boxroom/end1.svg";
import end3 from "@/assets/boxroom/end3.svg";
import lightLeft from "@/assets/boxroom/dengLeft.png";
import lightRight from "@/assets/boxroom/dengRight.png";
import m1 from "@/assets/music/m1.wav";
import m2 from "@/assets/music/gold_audio.mp3";

import BlueSplitLine from "@/assets/images/champion/game/split-blue.png";
import YellowplitLine from "@/assets/images/champion/game/split-yellow.png";
import loseBg from "@/assets/images/champion/game/lose-bg.png";
import winBg from "@/assets/images/champion/game/win-bg.png";
const props = defineProps({
  fightResult: {
    type: Object,
    required: true,
  },
  localSet: {
    type: Object,
  },
  isYellow: {
    type: Boolean,
    default: false,
  },
});
import winImg from "@/assets/images/champion/game/win.png";
import loseImg from "@/assets/images/champion/game/lose.png";
const leavel = {
  1: {
    img: winImg,
  },
  0: {
    img: loseImg,
  },
};
const emit = defineEmits(["scrollEnd"]);
const store = useStore();
const musica = new Audio(m1); //滚动音频
const musicb = new Audio(m2); //滚动音频
const showHighlightScore = ref(false);

// 多个列表拼接
const tempMultiOrnamentsData = computed(() => {
  const list = [
    {
      id: 1,
      name: "金",
    },
    {
      id: 0,
      name: "失败",
    },
  ];
  let arr = [];
  for (let i = 0; i < 50; i++) {
    for (let j = 0; j < list.length; j++) {
      arr.push(list[j]);
    }
  }

  return arr;
});

// 计算滚动最终在第几个盒子上
const calcScrollEndIndex = () => {
  const fightResult = props.fightResult;
  const len = tempMultiOrnamentsData.value.length;
  // 找到倒数第一组的目标元素
  return fightResult.result === 1 ? len - 2 : len - 1;
};

const FightBoxRef = ref(null);
const scrollEndPosition = ref("0");
const scrollAnimation = ref(false);
const calculateScrollPosition = (isPlayAnimation) => {
  nextTick(() => {
    try {
      // 获取容器和单个元素
      const container = FightBoxRef.value;
      const items = container.querySelectorAll(".ornament-list-item");

      if (!container || items.length === 0) return;
      // 单个元素高度，固定287px（包括边距等）
      const itemHeight = 287;
      // 考虑间距 3px
      const gapHeight = 3;
      // 容器高度
      const containerHeight = container.offsetHeight;
      // 目标是第 index 个元素居中，计算需要的位移
      // 计算目标元素的位置（第 index 个，索引为index-1）- 考虑间距
      const index = calcScrollEndIndex();
      const targetPosition = itemHeight * (index - 1) + gapHeight * (index - 2);
      // 计算需要的位移量，使目标元素位于容器中央
      // 减去容器宽度的一半，再加上元素宽度的一半
      const scrollTo = targetPosition - containerHeight / 2 + itemHeight / 2;
      // 设置滚动距离
      scrollEndPosition.value = `-${scrollTo}px`;
      console.log("垂直滚动位置计算完成:", scrollEndPosition.value);
      if (isPlayAnimation) {
        // 动态设置CSS变量
        container.style.setProperty("--scroll-end-position", `-${scrollTo}px`);
        // 开始动画
        scrollAnimation.value = true;
        if (props.localSet.music) {
          musica.play();
        }
      } else {
        container.style.transform = `translateY(-${scrollTo}px)`;
      }
    } catch (error) {
      console.error("计算滚动位置时出错:", error);
    }
  });
};

const startAnimation = () => {
  const index = calcScrollEndIndex();
  if (index > 0) {
    calculateScrollPosition(true);
  }
};

// 直接定位到终点
const jumpToEndPosition = () => {
  const index = calcScrollEndIndex();
  console.log(index);
  if (index > 0) {
    calculateScrollPosition(false);
  }
};

const handleScrollAnimationEnd = () => {
  console.log("滚动结束");
  pauseMusic();
  showHighlightScore.value = true;

  const timer = setTimeout(() => {
    scrollAnimation.value = false;
    emit("scrollEnd");
    timer && clearTimeout(timer);
  }, 3000);
};

const handleShakeAnimationEnd = () => {
  showHighlightScore.value = false;
};

const pauseMusic = () => {
  musica.pause();
  musica.currentTime = 0;
  if (props.localSet.music) {
    musicb.play();
  }
};

onMounted(() => {
  musica.src = m1;
  musica.load();
  musicb.src = m2;
  musicb.load();
});

watch(props.localSet, (newVal) => {
  if (!newVal.music) {
    musica.pause();
    musica.currentTime = 0;
    musicb.pause();
    musicb.currentTime = 0;
  }
});

defineExpose({
  startAnimation,
  jumpToEndPosition,
});
</script>
<template>
  <el-scrollbar
    max-height="577px"
    class="scroll-wrap"
    @mousewheel.prevent
    @touchmove.prevent
  >
    <div
      class="highlight-score"
      v-if="showHighlightScore"
      :style="{ backgroundImage: isYellow ? 'url(' + winBg + ')' : 'url(' + loseBg + ')' }"
      @animationend="handleShakeAnimationEnd"
    >
      {{ fightResult.score }}
    </div>
    <img :src="isYellow ? YellowplitLine : BlueSplitLine" alt="" class="line" />
    <div
      :class="[
        'fight-box-container',
        scrollAnimation ? 'scroll-animation' : 'scroll-start-point',
      ]"
      ref="FightBoxRef"
      @animationend="handleScrollAnimationEnd"
    >
      <div
        class="ornament-list-item"
        v-for="(item, index) in tempMultiOrnamentsData"
        :key="index"
      >
        <img :src="leavel[item.id].img" alt="" class="img-bg" />
      </div>
    </div>
  </el-scrollbar>
</template>

<style scoped lang="scss">
.scroll-wrap {
  position: relative;
  overflow: inherit;
  width: 100%;
  .highlight-score {
    position: absolute;
    z-index: 10;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    line-height: 182px;
    text-align: center;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    font-family: Jijiati;
    font-weight: 400;
    font-size: 45px;
    color: #FFFFFF;
    animation-duration: 2s;
    animation-iteration-count: 1;
    animation-name: shake;
  }
  .line {
    width: 295px;
    min-width: 295px;
    max-width: 295px;
    position: absolute;
    z-index: 2;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
.fight-box-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-left: 8px;
  padding-right: 8px;
  margin: 0 auto;
  .ornament-list-item {
    width: 100%;
    height: 287px;
    position: relative;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    justify-content: center;

    .img-bg {
      position: absolute;
      width: 160px;
      height: 241px;
      z-index: -1;
    }
    h5 {
      font-size: 18px;
      color: #f8bc18;
      font-family: "titleFont", "Microsoft YaHei", "sans-serif";
      margin-bottom: 4px;
      text-shadow: 0px 3px 6px rgb(69, 52, 7);
    }
    .lose {
      color: #999;
    }
  }
}
.scroll-animation {
  animation-duration: 13s;
  animation-iteration-count: 1;
  animation-name: scroll-end;
  animation-timing-function: cubic-bezier(
    0.1,
    0.1,
    0.3,
    0.4,
    0.6,
    0.8,
    0.9,
    0.9,
    0.9,
    1
  );
  animation-fill-mode: forwards;
}
.scroll-start-point {
  transform: translateY(0);
}

@keyframes scroll-end {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(var(--scroll-end-position));
  }
}
@keyframes shake {
  0% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
</style>
