<script setup>
import {onMounted, nextTick, ref, computed, inject, watch} from "vue";
import {requireImg} from "@/utils/common";
import { useStore } from "@/store";
import end1 from '@/assets/boxroom/end1.svg'
import end2 from '@/assets/boxroom/end2.svg'
import end3 from '@/assets/boxroom/end3.svg'
import end4 from '@/assets/boxroom/end4.svg'
import end5 from '@/assets/boxroom/end5.svg'
import lightLeft from '@/assets/boxroom/dengLeft.png'
import lightRight from '@/assets/boxroom/dengRight.png'
import m1 from "@/assets/music/m1.wav";
import m2 from "@/assets/music/gold_audio.mp3";

const props = defineProps({
  fightResult: {
    type: Object,
    required: true
  },
  roundNumber: {
    type: Number
  },
  currPlayerId: {
    type: Number
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
    2: {
        color: '#FF352E',
        background: 'linear-gradient(180deg, rgba(97, 8, 1, 0) 38.42%, rgba(222, 67, 32, 0.26) 100%)',
        img: end2
    },
    3: {
        color: '#984EFF',
        background: 'linear-gradient(180deg, rgba(52, 49, 56, 0.00) 0%, rgba(105, 39, 181, 0.51) 100%)',
        img: end4
    },
    4: {
        color: '#35B2FF',
        background: 'linear-gradient(180deg, rgba(1, 43, 97, 0) 38.42%, rgba(32, 102, 222, 0.26) 100%)',
        img: end3
    },
    5: {
        color: '#1FEBC4',
        background: 'linear-gradient(180deg, rgba(0, 117, 103, 0.00) 0%, rgba(31, 235, 196, 0.65) 100%)',
        img: end5
    }
}
const emit = defineEmits(['scrollEnd'])
const store = useStore()
const boxList = inject('boxList', [])
const musica = new Audio(m1) //滚动音频
const musicb = new Audio(m2) //滚动音频

// 多个饰品列表拼接
const tempMultiOrnamentsData = computed(() => {
  const currRound = store.currRound
  const ornamentsData = boxList.value[currRound-1].ornaments
  let arr = []
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < ornamentsData.length; j++) {
      arr.push(ornamentsData[j])
    }
  }
  
  return arr
})

// 计算滚动最终在第几个饰品盒子上
const calcScrollEndIndex = () => {
  const currPlayerId = props.currPlayerId
  const currRound = store.currRound
  let result = {}
  if (currPlayerId && currRound) {
    const fightResult = props.fightResult
    result = fightResult?.find(item => item.userId === currPlayerId && item.fightRoundNumber === currRound)
  }
  // 找到倒数第一组的目标元素
  const multiOrnamentsData = Array.isArray(tempMultiOrnamentsData.value) ? tempMultiOrnamentsData.value : []
  if (result?.ornamentId && multiOrnamentsData.length) {
    console.log(multiOrnamentsData.findLastIndex(item => item.ornamentId === result.ornamentId))
    return multiOrnamentsData.findLastIndex(item => item.ornamentId === result.ornamentId)
  } else {
    return -1
  }
}

const FightBoxRef = ref(null)
const scrollEndPosition = ref('0');
const scrollAnimation = ref(false)
const calculateScrollPosition = () => {
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
        // 目标是第 index 个元素居中，计算需要的位移
        // 计算目标元素的位置（第 index 个，索引为index-1）- 考虑间距
        const index = calcScrollEndIndex()
        const targetPosition = (itemHeight * (index - 1)) + (gapHeight * (index - 2));
        // 计算需要的位移量，使目标元素位于容器中央
        // 减去容器宽度的一半，再加上元素宽度的一半
        const scrollTo = targetPosition - (containerHeight / 2) + (itemHeight / 2);
        // 设置滚动距离
        scrollEndPosition.value = `-${scrollTo}px`;
        // 动态设置CSS变量
        container.style.setProperty('--scroll-end-position', `-${scrollTo}px`);
        console.log('垂直滚动位置计算完成:', scrollEndPosition.value);
        // 开始动画
        scrollAnimation.value = true
        if (props.localSet.music) {
          musica.play()
        }
    } catch (error) {
        console.error('计算滚动位置时出错:', error);
    }
  })
};

const startAnimation = () => {
  const index = calcScrollEndIndex()
  if (index > 0) {
    calculateScrollPosition()
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
  startAnimation
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
          :style="{ borderColor: leavel[item.ornamentsLevelId].color }"
          style="background:linear-gradient(180deg, rgba(56, 49, 49, 0.50) 0%, #383131 100%); "
          v-for="(item, index) in tempMultiOrnamentsData"
          :key="index">
          <img :src="leavel[item.ornamentsLevelId].img" alt="" class="img-bg">
          <div class="btn">
            <div>{{item.usePrice}}</div>
            <img :src="requireImg('/coin1.png',false)" alt="">
          </div>
          <img :src="item.imageUrl" alt="">
          <h5>{{ item.name }}</h5>
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
    flex-direction: column;
    align-items: center;
    img {
      width: 70%;
    }
    .img-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: -1;
    }
    h5 {
      font-size: 14px;
      color: #fff;
      margin-bottom: 4px;
    }
    .btn {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      line-height: 1.5em;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row-reverse;
      align-self: flex-end;
      margin-right: 6px;
      margin-top: 2px;
      img{
        width: 10px;
        margin-right: 3px;
      }
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
        font-size: 12px;
      }
      img {
        width: 96%;
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
