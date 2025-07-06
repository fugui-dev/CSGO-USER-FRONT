<script setup>
import {ref, watch} from "vue";
import {requireImg} from "@/utils/common";
import RankList from "./RankList.vue";

const props = defineProps({
  cardData: {
    type: Object,
    required: true
  }
});

</script>
<template>
    <div class="battle-card-container" :style="{
        '--bg-banner':requireImg('/v2/bg/openBg.png',true),
        '--bg-winner-avatar': requireImg('/avatarBorder.png',true)
      }">
    </div>
</template>

<style scoped lang="scss">


/* 响应式调整 */
@media (max-width: 768px) {
  
}
</style>
