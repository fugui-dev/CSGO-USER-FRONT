<script setup>
import {computed, ref} from "vue";
import {useStore} from "@/store";

const show = ref(false)
const store = useStore()
const src = () => {
  let url = new URL('https://kefu.mxyes.cn');
  url.pathname = 'index/index/home'
  url.searchParams.append('visiter_id', store.userInfo.userId || 0)
  url.searchParams.append('visiter_name', store.userInfo.userName || '游客')
  url.searchParams.append('avatar', store.userInfo.avatar || '')
  url.searchParams.append('groupid', '0')
  url.searchParams.append('business_id', '45')
  return url.toString()
}
const open = () => {
  show.value = true
}
defineExpose(
    {
      open
    }
)
</script>

<template>
  <van-popup v-model:show="show" position="center" :style="{ height: '60%',width: '100%',maxWidth:'500px' }"
             teleport="body" closeable>

      <iframe :src="src()" width="100%" height="100%" frameborder="0" scrolling="no"></iframe>


  </van-popup>

</template>

<style scoped lang="scss">

</style>
