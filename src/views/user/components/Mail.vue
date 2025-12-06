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
const selectItem = ref()
const visible = ref(false)

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
  visible.value=true
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
  <el-dialog
    v-model="visible"
    width="80%"
    :show-close="false"
    align-center
    style="--el-dialog-bg-color: transparent"
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="alert-wrapper">
      <div class="close-click" @click="visible = false" />
      <div class="title">{{ selectItem?.title }}</div>
      <div class="content" v-html="selectItem?.content"></div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
@use "@/style" as *;
$primary-color-user: #B3B586;
.records {
  padding: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 13px;

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
    width: 80%;
    @include mobile {
      margin: 0 auto;
    }
  }

  &-item {
    width: 70vw;
    height: 48px;
    border: 1px solid $primary-color-user;
    background: rgba($color: #000000, $alpha: 0.59);
    border-radius: 5px;
    margin-bottom: 10px;
    display: flex;
    @include mobile {
      margin-left: auto;
      margin-right: auto;
    }

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
.alert-wrapper {
  width: 100%;
  height: 423px;
  position: relative;
  background: url('@/assets/images/user/alert_bg.png') no-repeat;
  background-size: 100% 100%;
  overflow: hidden;
  color: #568793;
  font-size: 18px;;
  padding: 0 40px 20px;
  display: flex;
  flex-direction: column;
  .close-click {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 18px;
    right: 20px;
    background-image: url('@/assets/images/user/close.png');
    background-size: 100% 100%;
    cursor: pointer;
  }
  .title {
    margin: 37px auto 17px;
    text-align: center;
    height: 39px;
    line-height: 39px;
    min-width: 40%;
    width: max-content;
    padding: 0 12px;
    font-weight: 500;
    font-size: 19px;
    color: #FFFFFF;
    background-color: #0B191C;
    border-radius: 10px;
    @include mobile {
      font-size: 16px;
    }
  }
  .content {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
    @include mobile {
      font-size: 14px;
    }
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
  }
}
</style>
