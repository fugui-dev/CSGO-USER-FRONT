<script setup>
import {computed, onMounted, ref} from "vue";
import {getMatchCheerListApi} from "@/api/champion";
import Detail from './Detail.vue';

const loading = ref(false)
const cheerList = ref([])

const getMatchCheerList = () => {
  loading.value = true
  const matchId = Number(window.sessionStorage.getItem('matchId'))
  getMatchCheerListApi({
    matchId: matchId
  }).then(res => {
    if (res.data && res.data.length) {
      cheerList.value = res.data
    }
  }).finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  getMatchCheerList()
})

</script>

<template>
  <Detail>
    <div class="cheer-container" v-loading="loading">
      
    </div>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.cheer-container {

}

/* 响应式调整 */
@media (max-width: 768px) {
}
</style>
