<script setup>

import {getAnnouncementApi, getNoticeApi} from "@/api";
import {ref, watch} from "vue";
import {useDebounceFn} from "@vueuse/core";
import AlertDialog from "@/components/dialogs/AlertDialog.vue";

const form = ref({
  pageNum: 1,
  pageSize: 20,
})
const scrollRef = ref()
const listRef = ref()
const isComplete = ref(false)
const list = ref([])
const loading = ref(false)
const active = ref(0)
const tabs = ref([
  {
    label: '通知',
    value: 0
  },
  {
    label: '公告',
    value: 1
  },
])
const alertDialogRef = ref()
const selectItem = ref()

const getList = () => {
  loading.value = true
  let api = active.value === 0 ? getNoticeApi : getAnnouncementApi
  api(form.value).then(res => {
    if (res.rows && res.rows.length) {
      if (form.value.pageNum === 1) {
        list.value = []
      }
      list.value.push(...res.rows)
      if (listRef.value.clientHeight < scrollRef.value.$el.clientHeight) {
        form.value.pageNum += 1
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
    form.value.pageNum += 1
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
watch(() => active.value, () => {
  form.value.pageNum = 1
  isComplete.value = false
  getList()
})

const safeContent = (content) => {
  return content.replace(/<[^>]+>/g, '')
}

const showDialog=(item)=>{
  selectItem.value=item
    alertDialogRef.value.open()
}
</script>

<template>
  <div class="records">
    <div class="nav">
      <div class="nav-item" v-for="(i,index) in tabs" :class="{'active':active===i.value}" :key="index"
           @click="active=i.value">
        <span>{{ i.label }}</span>
      </div>
    </div>
    <div class="records-item" style="margin-top: 24px">
      <div class="item name">标题</div>
      <div class="item name">内容</div>
      <div class="item time">时间</div>
    </div>
    <el-scrollbar height="400px" @scroll="onScroll" ref="scrollRef" v-loading="loading">
      <div class="records-list" ref="listRef">
        <div class="records-item" v-for="(i,index) in list" :key="index" style="cursor: pointer" @click="showDialog(i)">
          <div class="item name">
            <div class="ellipsis">{{ i.title }}</div>
          </div>
          <div class="item mount">
            <div class="ellipsis">
              {{ safeContent(i.content) }}
            </div>
          </div>
          <div class="item time">{{ i.createTime }}</div>
        </div>
      </div>
    </el-scrollbar>

  </div>
  <AlertDialog ref="alertDialogRef">
    <template #title>
      {{ selectItem?.title }}
    </template>

    <template #default>
      <div v-html="selectItem?.content"></div>
    </template>
  </AlertDialog>
</template>

<style scoped lang="scss">
$primary-color-user: rgba(245, 76, 54, 0.6);
.records {
  padding: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;

  .tabs {
    margin-top: 10px;
    margin-bottom: 10px;

    :deep(.van-tabs__line) {
      height: 5px !important;
    }

    :deep(.van-tab__text) {
      font-size: 20px !important;
    }
  }

  &-list {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &-item {
    width: 100%;
    height: 80px;
    border: 1px solid $primary-color-user;
    border-radius: 5px;
    margin-bottom: 10px;
    display: flex;

    .item {
      width: 33.33%;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        height: 90%;
      }
    }
  }
}
</style>
