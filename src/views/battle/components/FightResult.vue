<script setup>
import {onUnmounted, nextTick, ref, watch, onMounted} from "vue";
import {requireImg} from "@/utils/common";
import {useStore} from "@/store";
import end1 from '@/assets/images/open/golden-bg.png'
import end2 from '@/assets/images/open/red-bg.png'
import end3 from '@/assets/images/open/purple-bg.png'
import end4 from '@/assets/images/open/blue-bg.png'
import end5 from '@/assets/images/open/green-bg.png'
import coin from '@/assets/images/upgrade/coin.png'

const props = defineProps({
  result: {
    type: Object,
    required: true
  },
  currPlayerId: {
    type: Number
  },
  roundNumber: {
    type: Number,
    required: true
  },
  fightResult: {
    type: Array
  },
  fightBoxVOList: {
    type: Array,
    default: () => []
  },
  roomStatus: {
    type: Number,
    required: true
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
const store = useStore()
const emit = defineEmits(['magnifyEnd'])
const perResultList = ref([])
const magnifyAnimation = ref(false)

const startAnimation = () => {
  const result = props.result
  const currPlayerId = props.currPlayerId
  const currRound = store.currRound
  if (result && currPlayerId && currRound && result[currPlayerId]) {
    // 每回的结果列表
    const roundResult = result[currPlayerId][currRound]
  // 为每个 item 补充名称
  perResultList.value = (roundResult || []).map(item => {
    const newItem = { ...item }
    // 如果 ornamentName 为空，尝试从 fightBoxVOList 中查找
    if (!item.ornamentName && item.ornamentId && item.boxId) {
      const name = findOrnamentName(item.ornamentId, item.boxId)
      if (name) {
        newItem.ornamentName = name
      }
    }
    // 根据对战状态决定显示原始价格还是最终价格
    // 进行中（status === 1）：显示原始价格；已结束（status === 2 或 3）：显示最终价格
    if (props.roomStatus === 1 && item.originalOrnamentsPrice != null) {
      newItem.displayPrice = item.originalOrnamentsPrice
    } else {
      newItem.displayPrice = item.ornamentsPrice
    }
    return newItem
  })
  }
  // 放大动画
  magnifyAnimation.value = true
}

const handleMagnifyAnimationEnd = () => {
  magnifyAnimation.value = false
  calcFinalResult()
  emit('magnifyEnd')
}

// 根据 ornamentId 和 boxId 从 fightBoxVOList 中查找名称
const findOrnamentName = (ornamentId, boxId) => {
  if (!ornamentId || !boxId || !props.fightBoxVOList || props.fightBoxVOList.length === 0) {
    return null
  }
  
  // 找到对应的 box
  const box = props.fightBoxVOList.find(b => b.boxId === boxId)
  if (!box || !box.ornaments || box.ornaments.length === 0) {
    return null
  }
  
  // 找到对应的饰品
  const ornament = box.ornaments.find(o => String(o.ornamentId) === String(ornamentId))
  return ornament ? ornament.name : null
}

// 设置最终结果
const setFinalReult = () => {
  const currPlayerId = props.currPlayerId
  const fightResult = props.fightResult
  // 过滤条件：holderUserId 匹配，并且有 ornamentId（即使没有 boxId 也要显示）
  const filtered = fightResult.filter(item => item.holderUserId === currPlayerId && item.ornamentId)
  
  // 为每个 item 补充名称
  perResultList.value = filtered.map(item => {
    const newItem = { ...item }
    // 如果 ornamentName 为空，尝试从 fightBoxVOList 中查找（需要 boxId）
    if (!item.ornamentName && item.ornamentId && item.boxId) {
      const name = findOrnamentName(item.ornamentId, item.boxId)
      if (name) {
        newItem.ornamentName = name
      }
    }
    // 如果没有 boxId，尝试使用 marketHashName 作为名称
    if (!item.ornamentName && item.marketHashName) {
      newItem.ornamentName = item.marketHashName
    }
    // 根据对战状态决定显示原始价格还是最终价格
    // 进行中（status === 1）：显示原始价格；已结束（status === 2 或 3）：显示最终价格
    if (props.roomStatus === 1 && item.originalOrnamentsPrice != null) {
      newItem.displayPrice = item.originalOrnamentsPrice
    } else {
      newItem.displayPrice = item.ornamentsPrice
    }
    return newItem
  })
}

const calcFinalResult = () => {
  const currRound = store.currRound
  if (props.roundNumber === currRound) {
    setFinalReult()
  }
}

onMounted(() => {
  // 已结束
  if (props.roomStatus === 2) {
    setFinalReult()
  }
})

watch(() => props.roomStatus, (newVal) => {
  if (newVal === 2) {
    setFinalReult()
  }
})

defineExpose({
  startAnimation
})

</script>
<template>
  <div class="fight-result">
    <div
      :class="['fight-result-item', magnifyAnimation && index === perResultList.length - 1 ? 'magnify-animation' : '']"
      :style="{ borderColor: leavel[4].color }"
      style="background:linear-gradient(180deg, rgba(56, 49, 49, 0.50) 0%, #383131 100%); "
      v-for="(item, index) in perResultList"
      :key="index"
      @animationend="handleMagnifyAnimationEnd">
      <img :src="item.ornamentLevelImg || item.levelImg || leavel[4].img" alt="" class="img-bg">
      <div class="btn">
        <div>{{item.displayPrice != null ? item.displayPrice : item.ornamentsPrice}}</div>
        <img :src="coin" alt="">
      </div>
      <img :src="item.imageUrl" alt="" class="knife">
      <h5 v-if="item.ornamentName || item.name || item.itemName">{{ item.ornamentName || item.name || item.itemName }}</h5>
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use "@/style" as *;
.fight-result {
  display: flex;
  flex-wrap: wrap;
  gap: 2%;
  padding: 10px 0;
  .fight-result-item {
    width: 32%;
    height: 17vh;
    position: relative;
    margin-bottom: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    overflow: hidden;
    .img-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: -1;
      object-fit: cover;
    }
    .knife {
      max-width: 90%;
      max-height: 60%;
      object-fit: contain;
      object-position: center;
      flex-shrink: 0;
      @include mobile {
        margin-top: -20px;
      }
    }
    h5 {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      font-size: 12px;
      color: #fff !important;
      margin: 0;
      padding: 4px 8px;
      text-align: center;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 100%);
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      z-index: 10;
      pointer-events: none;
      @include mobile {
        bottom: 14px;
      }
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
.magnify-animation {
  animation-duration: 1s;
  animation-iteration-count: 1;
  animation-name: magnify-end;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}
@keyframes magnify-end {
    from {
        transform: scale(0.1);
    }

    to {
        transform: scale(1.0);
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .fight-result-item {
    width: 49% !important;
  }
}
</style>
