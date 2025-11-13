<template>
  <div
    class="box-item-wrapper"
    :style="{
      background: `url(${bgImage}) no-repeat center/100%`,
    }"
  >
    <div v-if="isShop" class="price">
      <img src="@/assets/images/shop/ammunition.png" alt="">
      <span class="price-text">{{ boxData.creditsPrice }}</span>
    </div>
    <div v-else-if="!isHave" class="rate">{{ boxData.oddsResult }}%</div>
    <div v-else class="empty"></div>
    <img class="image" :src="boxData.imageUrl" alt="" />
    <div class="name">
      {{ displayName }}
    </div>
  </div>
</template>

<script setup>
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
    // 优先显示 ornamentName
    if (props.boxData?.ornamentName) {
      return props.boxData.ornamentName;
    }
    // 如果没有 ornamentName，则显示 exteriorName 和 shortName
    return (props.boxData.exteriorName || '') + (props.boxData.shortName ? '\n' + props.boxData.shortName : '');
  }
  if (props.isHave) {
    // 最近掉落页面：显示完整名称
    if (props.boxData?.ornamentName) {
      return props.boxData.ornamentName;
    }
    return props.boxData.exteriorName || '';
  }
  // 军需饰品页面：优先显示 name（完整名称），如果没有则显示 exteriorName
  // 后端返回的是 name 字段，不是 ornamentName
  if (props.boxData?.name) {
    return props.boxData.name;
  }
  return props.boxData.exteriorName;
});
import defaultBg from '@/assets/images/shop/item-bg.png';
const bgImage = computed(() => {
  if (props.isShop) {
    return defaultBg;
  }
  return props.isHave ? props.boxData.ornamentLevelImg : props.boxData.levelImg
});
</script>

<style scoped lang="scss">
.box-item-wrapper {
  width: 149px;
  height: 106px;
  padding: 9px 14px 15px 10px;
  margin-right: 6px;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 11px;
  color: #ffffff;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  .price {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 11px;
    font-weight: 500;
    position: absolute;
    top: 9px;
    right: 10px;
    z-index: 10;
    img {
      width: 14px;
      height: 14px;
      margin-right: 3px;
      flex-shrink: 0;
    }
    .price-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 80px;
      display: inline-block;
    }
  }
  .rate {
    text-align: right;
    font-size: 11px;
  }
  .empty {
    height: 14px;
  }
  .image {
    width: 100%;
    height: 60px;
    object-fit: contain;
    object-position: center;
    display: block;
  }
  .name {
    position: absolute;
    bottom: 9px;
    left: 10px;
    right: 10px;
    line-height: 1.3;
    max-height: 28px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 11px;
    box-sizing: border-box;
    word-break: break-word;
    word-wrap: break-word;
  }
}
</style>
