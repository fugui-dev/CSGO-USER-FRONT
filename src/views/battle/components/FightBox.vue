<script setup>
import {onMounted, nextTick, ref, computed, inject, watch} from "vue";
import {requireImg} from "@/utils/common";
import { useStore } from "@/store";
import end1 from '@/assets/images/open/golden-bg.png'
import end2 from '@/assets/images/open/red-bg.png'
import end3 from '@/assets/images/open/purple-bg.png'
import end4 from '@/assets/images/open/blue-bg.png'
import end5 from '@/assets/images/open/green-bg.png'
import coin from '@/assets/images/upgrade/coin.png'
import line from '@/assets/images/open/line.png'
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
        img: end3
    },
    4: {
        color: '#35B2FF',
        background: 'linear-gradient(180deg, rgba(1, 43, 97, 0) 38.42%, rgba(32, 102, 222, 0.26) 100%)',
        img: end4
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

// 打乱数组函数（Fisher-Yates洗牌算法）
const shuffleArray = (array) => {
  const newArray = [...array] // 创建副本，避免修改原数组
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// 获取目标饰品ID
const getTargetOrnamentId = () => {
  const currPlayerId = props.currPlayerId
  const currRound = store.currRound
  if (currPlayerId && currRound) {
    const fightResult = props.fightResult
    const result = fightResult?.find(item => item.userId === currPlayerId && item.fightRoundNumber === currRound)
    return result?.ornamentId
  }
  return null
}

// 多个饰品列表拼接（打乱顺序，但确保目标元素在最后一组的中间位置）
const tempMultiOrnamentsData = computed(() => {
  const currRound = store.currRound
  const ornamentsData = boxList.value[currRound-1].ornaments
  const targetOrnamentId = getTargetOrnamentId()
  let arr = []
  
  // 前7组：完全随机打乱
  for (let i = 0; i < 7; i++) {
    const shuffled = shuffleArray(ornamentsData)
    arr.push(...shuffled)
  }
  
  // 最后一组：确保目标元素在中间位置（这样滚动停止时会在中间）
  if (targetOrnamentId && ornamentsData.length > 0) {
    const targetOrnament = ornamentsData.find(item => item.ornamentId === targetOrnamentId)
    
    if (targetOrnament) {
      // 其他元素（排除目标元素）
      const otherOrnaments = ornamentsData.filter(item => item.ornamentId !== targetOrnamentId)
      const shuffledOthers = shuffleArray(otherOrnaments)
      
      // 计算中间位置
      const middleIndex = Math.floor(ornamentsData.length / 2)
      
      // 构建最后一组：前半部分 + 目标元素 + 后半部分
      const lastGroup = [
        ...shuffledOthers.slice(0, middleIndex),
        targetOrnament,
        ...shuffledOthers.slice(middleIndex)
      ]
      
      arr.push(...lastGroup)
    } else {
      // 如果找不到目标元素，最后一组也随机打乱
      const shuffled = shuffleArray(ornamentsData)
      arr.push(...shuffled)
    }
  } else {
    // 如果没有目标元素，最后一组也随机打乱
    const shuffled = shuffleArray(ornamentsData)
    arr.push(...shuffled)
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
  
  const multiOrnamentsData = Array.isArray(tempMultiOrnamentsData.value) ? tempMultiOrnamentsData.value : []
  if (result?.ornamentId && multiOrnamentsData.length) {
    const ornamentsData = boxList.value[currRound - 1].ornaments
    const groupSize = ornamentsData.length
    
    // 计算最后一组的起始索引
    const lastGroupStartIndex = groupSize * 7 // 前7组的长度
    
    // 计算目标元素在最后一组中的位置（中间位置）
    const middleIndexInGroup = Math.floor(groupSize / 2)
    
    // 目标元素在整个数组中的索引 = 最后一组起始索引 + 中间位置
    const targetIndex = lastGroupStartIndex + middleIndexInGroup
    
    console.log('计算目标元素索引:', {
      lastGroupStartIndex,
      middleIndexInGroup,
      targetIndex,
      totalLength: multiOrnamentsData.length,
      targetOrnamentId: result.ornamentId
    })
    
    // 验证：确保这个位置确实是目标元素
    if (multiOrnamentsData[targetIndex]?.ornamentId === result.ornamentId) {
      return targetIndex
    } else {
      // 如果验证失败，使用 findLastIndex 作为备选
      console.warn('目标元素位置验证失败，使用 findLastIndex')
      return multiOrnamentsData.findLastIndex(item => item.ornamentId === result.ornamentId)
    }
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
        const multiOrnamentsData = Array.isArray(tempMultiOrnamentsData.value) ? tempMultiOrnamentsData.value : []

        if (!container || items.length === 0) return;
        // 单个元素高度，固定170px（包括边距等）
        const itemHeight = 170;
        // 考虑间距 3px
        const gapHeight = 3;
        // 容器可见高度（el-scrollbar的可见高度，CSS中设置了max-height: 360px）
        // 获取el-scrollbar的可见区域高度
        const scrollbarWrap = container.closest('.el-scrollbar')?.querySelector('.el-scrollbar__wrap');
        const containerHeight = scrollbarWrap?.clientHeight || 360; // 使用clientHeight获取可见高度，默认360px
        // 计算目标元素的索引
        const index = calcScrollEndIndex()
        console.log('目标元素索引:', index, '数组长度:', multiOrnamentsData.length)
        
        if (index < 0) {
          console.error('无法找到目标元素')
          return
        }
        
        // 计算目标元素的位置（索引从0开始）
        // 第0个元素位置 = 0
        // 第1个元素位置 = itemHeight + gapHeight
        // 第n个元素位置 = n * (itemHeight + gapHeight)
        const targetPosition = index * (itemHeight + gapHeight);
        
        // 计算需要的位移量，使目标元素位于容器中央
        // 目标元素顶部位置 - 容器高度的一半 + 元素高度的一半 = 目标元素中心对齐到容器中心
        const scrollTo = targetPosition - (containerHeight / 2) + (itemHeight / 2);
        
        // 设置滚动距离
        scrollEndPosition.value = `-${scrollTo}px`;
        // 动态设置CSS变量
        container.style.setProperty('--scroll-end-position', `-${scrollTo}px`);
        console.log('垂直滚动位置计算完成:', {
          index,
          targetPosition,
          containerHeight,
          scrollTo,
          scrollEndPosition: scrollEndPosition.value
        });
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
  // 先重置动画状态和位置，确保所有卡片从同一起点开始
  scrollAnimation.value = false
  if (FightBoxRef.value) {
    FightBoxRef.value.style.transform = 'translateY(0)'
    FightBoxRef.value.style.setProperty('--scroll-end-position', '0')
  }
  
  // 使用 nextTick 确保 DOM 更新后再计算和启动动画
  nextTick(() => {
  const index = calcScrollEndIndex()
  if (index > 0) {
    calculateScrollPosition()
  }
  })
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
      @touchmove.prevent
      @wheel.prevent
      @scroll.prevent>
      <div class="line">
        <!-- <img :src="lightLeft" alt=""> -->
        <img :src="line" class="tw-w-[1.4rem]" alt="" style="transform: rotateZ(90deg);">
        <!-- <img :src="lightRight" alt=""> -->
      </div>
      <div
        :class="['fight-box-container', scrollAnimation ? 'scroll-animation' : 'scroll-start-point']"
        ref="FightBoxRef"
        @animationend="handleScrollAnimationEnd">
        <div
          class="ornament-list-item"
          :style="{ borderColor: leavel[4].color }"
          style="background:linear-gradient(180deg, rgba(56, 49, 49, 0.50) 0%, #383131 100%); "
          v-for="(item, index) in tempMultiOrnamentsData"
          :key="index">
          <img :src="item.ornamentLevelImg || item.levelImg || leavel[4].img" alt="" class="img-bg">
          <div class="btn">
            <div>{{item.boxPrice}}</div>
            <img :src="coin" alt="">
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
  overflow: hidden !important;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  :deep(.el-scrollbar__wrap) {
    overflow: hidden !important;
    overscroll-behavior: none;
  }
  
  :deep(.el-scrollbar__bar) {
    display: none !important;
  }
  
  .line {
    width: 50%;
    position: absolute;
    z-index: 2;
    left: 49%;
    // transform: translate(-50%, -50%);
  }
}
.fight-box-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  // border-left: 1px solid #b21414;
  // border-right: 1px solid #b21414;
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
    justify-content: center;
    overflow: hidden;
    img:not(.img-bg) {
      max-width: 90%;
      max-height: 70%;
      object-fit: contain;
      object-position: center;
      flex-shrink: 0;
    }
    .img-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: -1;
      object-fit: cover;
    }
    h5 {
      font-size: 14px;
      color: #fff;
      margin-bottom: 4px;
    }
    .btn {
      position: absolute;
      top: 4px;
      right: 8px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      line-height: 1.5em;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: row-reverse;
      z-index: 2;
      img{
        width: 13px;
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
  transform: translateY(0) !important;
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
