<template>
  <div
    class="box-item-wrapper"
    :style="{
      background: `url(${
        isHave ? boxData.ornamentLevelImg : boxData.levelImg
      }) no-repeat center/100%`,
    }"
  >
    <div v-if="!isHave" class="rate">{{ boxData.oddsResult }}%</div>
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
});
const displayName = computed(() => {
  if (props.isHave) {
    const name = props.boxData.ornamentName;
    const match = name.match(/(.*?)\s*\((.*?)\)$/);
    return match?.[2] || name;
  }
  return props.boxData.exteriorName;
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
}
</style>
