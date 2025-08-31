<script setup>
import {onMounted, nextTick, ref, computed, inject, watch} from "vue";
import {requireImg} from "@/utils/common";
import { useStore } from "@/store";
import end1 from '@/assets/boxroom/end1.svg'
import end3 from '@/assets/boxroom/end3.svg'
import lightLeft from '@/assets/boxroom/dengLeft.png'
import lightRight from '@/assets/boxroom/dengRight.png'
import m1 from "@/assets/music/m1.wav";
import m2 from "@/assets/music/gold_audio.mp3";

const props = defineProps({
  fightResult: {
    type: Object,
    required: true
  },
  localSet: {
    type: Object
  }
});

const leavel = {
    1: {
        color: '#FFBD4E',
        background: 'linear-gradient(180deg, rgba(97, 58, 1, 0.00) 38.42%, rgba(255, 180, 57, 0.26) 100%)',
        img: end1
    },
    0: {
        color: '#35B2FF',
        background: 'linear-gradient(180deg, rgba(1, 43, 97, 0) 38.42%, rgba(32, 102, 222, 0.26) 100%)',
        img: end3
    }
}
const emit = defineEmits(['scrollEnd'])
const store = useStore()
const musica = new Audio(m1) //滚动音频
const musicb = new Audio(m2) //滚动音频

// 多个列表拼接
const tempMultiOrnamentsData = computed(() => {
  const list = [{
    id: 1,
    name: '金'
  }, {
    id: 0,
    name: '失败'
  }]
  let arr = []
  for (let i = 0; i < 50; i++) {
    for (let j = 0; j < list.length; j++) {
      arr.push(list[j])
    }
  }
  
  return arr
})

// 计算滚动最终在第几个盒子上
const calcScrollEndIndex = () => {
  const fightResult = props.fightResult
  const len = tempMultiOrnamentsData.value.length
  // 找到倒数第一组的目标元素
  return fightResult.result === 1 ? len - 2 : len - 1
}

const FightBoxRef = ref(null)
const scrollEndPosition = ref('0');
const scrollAnimation = ref(false)
const calculateScrollPosition = (isPlayAnimation) => {
  nextTick(() => {
    try {
        // 获取容器和单个元素
        const container = FightBoxRef.value;
        const items = container.querySelectorAll('.ornament-list-item');

        if (!container || items.length === 0) return;
        // 单个元素高度，固定170px（包括边距等）
        const itemHeight = 170;
        // 考虑间距 3px
        const gapHeight = 3;
        // 容器高度
        const containerHeight = container.offsetHeight;
        console.log(containerHeight)
        // 目标是第 index 个元素居中，计算需要的位移
        // 计算目标元素的位置（第 index 个，索引为index-1）- 考虑间距
        const index = calcScrollEndIndex()
        console.log(index)
        const targetPosition = (itemHeight * (index - 1)) + (gapHeight * (index - 2));
        // 计算需要的位移量，使目标元素位于容器中央
        // 减去容器宽度的一半，再加上元素宽度的一半
        const scrollTo = targetPosition - (containerHeight / 2) + (itemHeight / 2);
        // 设置滚动距离
        scrollEndPosition.value = `-${scrollTo}px`;
        console.log('垂直滚动位置计算完成:', scrollEndPosition.value);
        if (isPlayAnimation) {
          // 动态设置CSS变量
          container.style.setProperty('--scroll-end-position', `-${scrollTo}px`);
          // 开始动画
          scrollAnimation.value = true
          if (props.localSet.music) {
            musica.play()
          }
        } else {
          console.log(555)
          container.style.transform = `translateY(-${scrollTo}px)`
        }
    } catch (error) {
        console.error('计算滚动位置时出错:', error);
    }
  })
};

const startAnimation = () => {
  const index = calcScrollEndIndex()
  if (index > 0) {
    calculateScrollPosition(true)
  }
}

// 直接定位到终点
const jumpToEndPosition = () => {
  const index = calcScrollEndIndex()
  console.log(index)
  if (index > 0) {
    calculateScrollPosition(false)
  }
}

const handleScrollAnimationEnd = () => {
  console.log('滚动结束')
  pauseMusic()
  const timer = setTimeout(() => {
    scrollAnimation.value = false
    emit('scrollEnd')
    timer && clearTimeout(timer)
  }, 2000)
}

const pauseMusic = () => {
  musica.pause()
  musica.currentTime = 0
  if (props.localSet.music) {
    musicb.play()
  }
}

onMounted(() => {
    musica.src = m1
    musica.load()
    musicb.src = m2
    musicb.load()
})

watch(props.localSet, (newVal) => {
  if (!newVal.music) {
    musica.pause()
    musica.currentTime = 0
    musicb.pause()
    musicb.currentTime = 0
  }
})

defineExpose({
  startAnimation,
  jumpToEndPosition
})

</script>
<template>
    <el-scrollbar
      max-height="360px"
      class="scroll-wrap"
      @mousewheel.prevent
      @touchmove.prevent>
      <div class="line">
        <img :src="lightLeft" alt="">
        <div class="yellow-line"></div>
        <img :src="lightRight" alt="">
      </div>
      <div
        :class="['fight-box-container', scrollAnimation ? 'scroll-animation' : 'scroll-start-point']"
        ref="FightBoxRef"
        @animationend="handleScrollAnimationEnd">
        <div
          class="ornament-list-item"
          style="background:linear-gradient(180deg, rgba(56, 49, 49, 0.50) 0%, #383131 100%); "
          v-for="(item, index) in tempMultiOrnamentsData"
          :key="index">
          <img :src="leavel[item.id].img" alt="" class="img-bg">
          <h5 :class="{'lose' : item.id === 0}">{{ item.name }}</h5>
        </div>
      </div>
    </el-scrollbar>
</template>

<style scoped lang="scss">
.scroll-wrap {
  position: relative;
  .line {
    width: 56%;
    position: absolute;
    z-index: 2;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .yellow-line {
      width: 100%;
      height: 1px;
      background-color: #f0be29;
    }
    img:nth-of-type(1) {
      position: absolute;
      left: 0;
      z-index: 3; 
      transform: translate(-70%, -50%);
    }
    img:nth-of-type(2) {
      position: absolute;
      right: 0;
      z-index: 3; 
      transform: translate(70%, -50%);
    }
  }
}
.fight-box-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  border-left: 1px solid #b21414;
  border-right: 1px solid #b21414;
  padding-left: 8px;
  padding-right: 8px;
  margin: 0 auto;
  .ornament-list-item {
    width: 100%;
    height: 170px;
    position: relative;
    margin-bottom: 3px;
    display: flex;
    align-items: center;
    justify-content: center;

    .img-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: -1;
    }
    h5 {
      font-size: 18px;
      color: #f8bc18;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      margin-bottom: 4px;
      text-shadow:  0px 3px 6px rgb(69, 52, 7);
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
  animation-timing-function: cubic-bezier(0.1, 0.1, 0.3, 0.4, 0.6, 0.8, 0.9, 0.9, 0.9, 1);
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

/* 响应式调整 */
@media (max-width: 768px) {
  .fight-box-container {
    width: 90%;
    .ornament-list-item {
      h5 {
        font-size: 14px;
      }
      .img-bg {
        width: 100%;
      }
    }
  }
  .scroll-wrap {
    .line {
    width: 80%;
    .yellow-line {
      width: 100%;
      height: 1px;
      background-color: #f0be29;
    }
    img:nth-of-type(1) {
      transform: translate(-90%, -50%);
    }
    img:nth-of-type(2) {
      transform: translate(90%, -50%);
    }
  }
  }
}
</style>
