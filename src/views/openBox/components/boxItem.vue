<template>
  <div
    class="box-item-wrapper"
    :style="{
      background: `url(${bgImage}) no-repeat center/100%`,
    }"
  >
    <div v-if="isShop" class="price">
      <img src="@/assets/images/champion/game/coin.png" alt="">
      {{ boxData.creditsPrice }}
    </div>
    <div v-else-if="!isHave" class="rate">{{ boxData.oddsResult }}%</div>
    <div v-else class="empty"></div>
    <img class="image" :src="boxData.imageUrl" alt="" />
    <div class="name">
      {{ displayName }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  boxData: {
    type: Object,
    default: () => ({}),
  },
  isHave: {
    type: Boolean,
    default: false,
  },
  isShop: {
    type: Boolean,
    default: false,
  },
});
const displayName = computed(() => {
  if (props.isShop) {
    return props.boxData.exteriorName + '\n' + props.boxData.shortName;
  }
  if (props.isHave) {
    const name = props.boxData.ornamentName;
    const match = name.match(/(.*?)\s*\((.*?)\)$/);
    return match?.[2] || name;
  }
  return props.boxData.exteriorName;
});
import defaultBg from '@/assets/images/shop/item-bg.png';
const bgImage = computed(() => {
  if (props.isShop) {
    return defaultBg;
  }
  return props.isHave
    ? require('@/assets/images/openBox/box-item-have-bg.png')
    : require('@/assets/images/openBox/box-item-no-have-bg.png');
});
</script>

<style scoped lang="scss">
.box-item-wrapper {
  width: 149px;
  height: 106px;
  padding: 9px 14px 15px 10px;
  margin-right: 5px;
  font-weight: 500;
  font-size: 12px;
  color: #ffffff;
  position: relative;
  .price {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    img {
      width: 16px;
      height: 16px;
      margin-right: 5px;
    }
  }
  .rate {
    text-align: right;
  }
  .empty {
    height: 18px;
  }
  .image {
    width: 100%;
    height: 44px;
    object-fit: cover;
  }
  .name {
    position: absolute;
    bottom: 10px;
    left: 10px;
    white-space: break-spaces;
  }
}
</style>
