<script setup>
import {onUnmounted, onMounted, ref} from "vue";
import {requireImg} from "@/utils/common";
import end1 from '@/assets/boxroom/end1.svg'
import end2 from '@/assets/boxroom/end2.svg'
import end3 from '@/assets/boxroom/end3.svg'
import end4 from '@/assets/boxroom/end4.svg'
import end5 from '@/assets/boxroom/end5.svg'

const props = defineProps({
  ornamentsData: {
    type: Array,
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

</script>
<template>
    <el-scrollbar max-height="360px">
      <div class="fight-box-container">
        <div
          class="ornament-list-item"
          :style="{ borderColor: leavel[item.ornamentsLevelId].color }"
          style="background:linear-gradient(180deg, rgba(56, 49, 49, 0.50) 0%, #383131 100%); "
          v-for="item in ornamentsData"
          :key="item.id">
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
.fight-box-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  .ornament-list-item {
    width: 50%;
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
</style>
