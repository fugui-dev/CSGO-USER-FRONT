<script setup>
import {computed, onMounted, ref} from "vue";
import {getMatchCheerListApi} from "@/api/champion";
import Detail from './Detail.vue';

const loading = ref(false)

const active = ref(0)
const navList = ref([{
  'name': '晋级图',
  'value': 0
}, {
  'name': '总冠军',
  'value': 1
}, {
  'name': '队伍排名',
  'value': 2
}])

onMounted(() => {
})

</script>

<template>
  <Detail>
    <div class="history-container" v-loading="loading">
      
    </div>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.history-container {

}

/* 响应式调整 */
@media (max-width: 768px) {
}
</style>
