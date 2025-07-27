<script setup>
import {onUnmounted, nextTick, ref, computed, onMounted} from "vue";
import {requireImg} from "@/utils/common";
import {useStore} from "@/store";
import end1 from '@/assets/boxroom/end1.svg'
import end2 from '@/assets/boxroom/end2.svg'
import end3 from '@/assets/boxroom/end3.svg'
import end4 from '@/assets/boxroom/end4.svg'
import end5 from '@/assets/boxroom/end5.svg'

const props = defineProps({
  result: {
    type: Object,
    required: true
  },
  currPlayerId: {
    type: Number,
    required: true
  },
  roundNumber: {
    type: Number,
    required: true
  },
  fightResult: {
    type: Array
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
    perResultList.value = result[currPlayerId][currRound]
  }
  // 放大动画
  magnifyAnimation.value = true
}

const handleMagnifyAnimationEnd = () => {
  magnifyAnimation.value = false
  calcFinalResult()
  emit('magnifyEnd')
}

const calcFinalResult = () => {
  const currRound = store.currRound
  const currPlayerId = props.currPlayerId
  const fightResult = props.fightResult
  if (props.roundNumber === currRound) {
    perResultList.value = fightResult.filter(item => item.holderUserId === currPlayerId && item.boxId)
  }
}

onMounted(() => {
  // 已结束
  if (props.roomStatus === 2) {
    calcFinalResult()
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
      :style="{ borderColor: leavel[item.ornamentsLevelId].color }"
      style="background:linear-gradient(180deg, rgba(56, 49, 49, 0.50) 0%, #383131 100%); "
      v-for="(item, index) in perResultList"
      :key="index"
      @animationend="handleMagnifyAnimationEnd">
      <img :src="leavel[item.ornamentsLevelId].img" alt="" class="img-bg">
      <div class="btn">
        <div>{{item.ornamentsPrice}}</div>
        <img :src="requireImg('/coin1.png',false)" alt="">
      </div>
      <img :src="item.imageUrl" alt="">
      <h5>{{ item.ornamentName }}</h5>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fight-result {
  display: flex;
  flex-wrap: wrap;
  gap: 2%;
  padding: 10px 0;
  .fight-result-item {
    width: 32%;
    position: relative;
    margin-bottom: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 8px;
    img {
      width: 86%;
    }
    .img-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: -1;
    }
    h5 {
      font-size: 12px;
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
      margin-right: 8px;
      margin-top: 4px;
      img{
        width: 10px;
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
</style>
