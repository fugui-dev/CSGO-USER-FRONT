<script setup>
import {goto} from "@/utils/common.js";
import {useStore} from "@/store/index.js";
import {getBannerListApi} from "@/api";
import {computed, onMounted, ref} from "vue";

const store = useStore()
const list = ref([])

const isPC=computed(()=>{
  console.log(store.isPC)
  return store.isPC
})

// const getList=async ()=>{
//   let res= await getBannerListApi()
//   res.data.forEach(i=>{
//     let img=new Image()
//     img.src=i.picture
//     img.onload=(r)=>{
//       list.value.push(i)
//     }
//   })
// }
// 图片缓存池
const imageCache = new Map()

// 图片转 Base64 函数
const toBase64 = async (url) => {
  // 命中缓存直接返回
  if (imageCache.has(url)) {
    return imageCache.get(url)
  }

  try {
    const response = await fetch(url, {
      headers: new Headers({ Origin: window.location.origin }),
      mode: 'cors' // 需要服务端支持 CORS
    })
    const blob = await response.blob()

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result
        imageCache.set(url, base64)
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('图片转换失败:', error)
    // 降级返回原始 URL
    return url
  }
}

const getList = async () => {
  try {
    const res = await getBannerListApi()

    // 并行处理所有图片
    const promises = res.data.map(async (item) => ({
      ...item,
      picture: await toBase64(item.picture)
    }))

    // 等待所有图片转换完成
    const processedData = await Promise.all(promises)
    list.value = processedData
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}

const bannerClick=(item)=>{
  console.log(item)
  if (item.jumpLink){
    goto(item.jumpLink)
  }
}


const showTemp=ref(true)
onMounted(async ()=>{
  await getList()
  showTemp.value=false
})
</script>

<template>
 <div>
   <van-swipe class="banner" :autoplay="3000" indicator-color="white" lazy-render v-show="!isPC">
     <van-swipe-item v-for="(item,index) in list" :key="index"
     >
       <img :src="item.picture" alt="" @click="bannerClick(item)" >

     </van-swipe-item>

   </van-swipe>
   <el-carousel class="banner" height="auto" autoplay v-show="isPC">
     <el-carousel-item style="height: 100px" v-if="showTemp">

     </el-carousel-item>
     <el-carousel-item v-for="(item,index) in list" :key="index" style="height: auto">
       <img :src="item.picture" alt="" @click="bannerClick(item)" style="cursor: pointer">

     </el-carousel-item>


   </el-carousel>
 </div>

</template>

<style scoped lang="scss">
.banner {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;

  img {
    width: 100%;
  }
}

.el-carousel__item img {
  width: 100%;
}

</style>
