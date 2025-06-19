<script setup>

import {getAmountRecordsApi} from "@/api";
import {ref} from "vue";
import {useDebounceFn} from "@vueuse/core";

const form = ref({
  page: 1,
  size: 20,
  orderByFie:0,
  moneyType:0
})
const scrollRef = ref()
const listRef = ref()
const isComplete = ref(false)
const list=ref([])
const loading=ref(false)

const getList = () => {
  loading.value = true
  getAmountRecordsApi(form.value).then(res => {
    if (res.data && res.data.length) {
      if (form.value.page === 1) {
        list.value = []
      }
      list.value.push(...res.data)
      if (listRef.value.clientHeight < scrollRef.value.$el.clientHeight) {
        form.value.page += 1
        getList()
      }
    } else {
      isComplete.value = true
    }
  }).finally(() => {
    loading.value = false
  })
}
const debouncedGetList = useDebounceFn(() => {
  if (!isComplete.value) {
    form.value.page += 1
    getList()
  }
}, 1000)

const onScroll = (e) => {
  let scrollBarHeight = scrollRef.value.$el.querySelector(".el-scrollbar__bar:last-child .el-scrollbar__thumb").clientHeight || 200
  if (listRef.value && e.scrollTop) {
    if (e.scrollTop + scrollBarHeight + 500 >= listRef.value.clientHeight) {
      debouncedGetList()
    }
  }
}
getList()


</script>

<template>
  <div class="records">

    <div class="records-item">
      <div class="item name">描述</div>
      <div class="item mount">金额</div>
      <div class="item time">时间</div>
    </div>
    <el-scrollbar height="400px" @scroll="onScroll" ref="scrollRef" v-loading="loading">
      <div class="records-list" ref="listRef">
        <div class="records-item" v-for="(i,index) in list" :key="index">
          <div class="item name">{{i.remark}}</div>
          <div class="item mount">
            <div v-if="i.amount">余额：{{i.amount}}</div>
            <!-- <div v-if="i.credits">弹药：{{i.credits}}</div> -->
          </div>
          <div class="item time">{{i.createTime}}</div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
$primary-color-user: rgba(245, 76, 54, 0.6);
.records {
  padding: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  &-list{
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  &-item {
    width: 100%;
    height:80px;
    border: 1px solid $primary-color-user;
    border-radius: 5px;
    margin-bottom: 10px;
    display: flex;
    .item{
      width: 33.33%;
      display: flex;
      align-items: center;
      justify-content: center;
      img{
        height: 90%;
      }
    }
    .mount{
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
