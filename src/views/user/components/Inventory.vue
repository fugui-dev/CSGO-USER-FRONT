<script setup>

import {computed, ref, watch} from "vue";
import {deliverPackSackApi, getExtractPackSackApi, getPackSackApi, getPackSackGlobalDataApi, transferOrnamentApi, getTransferRecordsApi} from "@/api";
import {useThrottleFn} from "@vueuse/core";
import {ElMessage} from "element-plus";
import {goto, formatDate} from "@/utils/common";
import NewBoxs from "@/components/Box/NewBoxs.vue";
import {postDecompose} from "@/views/openBox/server/api";
import Money from '@/assets/images/home/coin.png'
import {useUserInfo} from '@/composables/useUesrInfo'
import arrow from '@/assets/images/user/arrow.png'
import BaseDialog from "@/components/dialogs/BaseDialog.vue";

const active = ref(0)
const list = ref([])
const loading = ref(false)
const total = ref({
  totalOrnamentNumber: 0,
  totalOrnamentPrice: 0,
  boxOrnamentNumber: 0,
  boxOrnamentPrice: 0,
  shopOrnamentNumber: 0,
  shopOrnamentPrice: 0,
})
const form = ref({
  page: 1,
  size: 28,
  orderByFie: 2,
  orderByType: 2
})
const pageTotal = ref(0)
const tabs = ref([
  {
    label: '宝箱饰品库存',
    value: 0
  },
  {
    label: '商城饰品库存',
    value: 1
  },
  {
    label: '领取记录',
    value: 2
  },
  {
    label: '转增记录',
    value: 3
  },
])

const onChoose = (item) => {
  if (active.value === 0 || active.value === 1) {
    item.choosed = !item.choosed;
  }
}

const getTotal = () => {
  getPackSackGlobalDataApi().then(res => {
    total.value = res.data
  })
}
const getList = () => {
  loading.value = true
  let api
  let requestForm = { ...form.value }
  
  if (active.value === 0) {
    // 宝箱饰品库存：source = 1,2,3,4,5,7,8,9,21 (非商城来源)
    api = getPackSackApi
    requestForm.sourceList = [1, 2, 3, 4, 5, 7, 8, 9, 21]
  } else if (active.value === 1) {
    // 商城饰品库存：source = 6 (商城兑换)
    api = getPackSackApi
    requestForm.sourceList = [6]
  } else if (active.value === 2) {
    api = getExtractPackSackApi
  } else if (active.value === 3) {
    api = getTransferRecordsApi
  } else {
    loading.value = false
    return
  }
  api(requestForm).then(res => {
    if (res.data && Array.isArray(res.data)) {
      list.value = res.data
      pageTotal.value = res.total || 0
    } else {
      list.value = []
      pageTotal.value = 0
    }
  }).finally(() => {
    loading.value = false
  })
}
getTotal()
getList()
const listRef = ref()

// 分页大小变化
const handleSizeChange = (val) => {
  form.value.size = val
  form.value.page = 1
  getList()
}

// 页码变化
const handlePageChange = (val) => {
  form.value.page = val
  getList()
  // 滚动到顶部
  if (listRef.value) {
    listRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
const checkAll = ref(false)
const checkBoxChange = (e) => {
  checkAll.value = e
  list.value.forEach(item => {
    item.choosed = e
  })
}

const handleDelivery = () => {
  if (loading.value) return
  const ids = list.value.filter(item => item.choosed).map(item => item.id)
  if (ids.length) {
    deliverPackSackApi({
      packSackIds: ids,
      isAll: false
    }).then(() => {
      ElMessage({
        message: '提取成功',
        type: 'success'
      })
      form.value.page = 1
      list.value = []
      getTotal()
      getList()
    })
  } else {
    ElMessage({
      message: '请选择要提取的饰品',
      type: 'warning'
    })
  }
}
const { fetchUserInfo } = useUserInfo()
const handleDecomposeOriginal = async () => {
  const ids = list.value.filter(item => item.choosed).map(item => item.id)
  console.log('选中的饰品列表：', list.value.filter(item => item.choosed))
  console.log('提取的ID列表：', ids)
  if (ids.length) {
    try {
      const res = await postDecompose({
        packSackIds: ids,
        isAll: false
      })
      if (res.code === 200) {
        ElMessage({
          message: res.data,
          type: 'success'
        })
        form.value.page = 1
        list.value = []
        await getTotal()
        await getList()
        await fetchUserInfo()
        checkBoxChange(false)
      }
    } catch (error) {
      ElMessage({
        message: error.message,
        type: 'warning'
      })
    }

  } else {
    ElMessage({
      message: '请选择要分解的饰品',
      type: 'warning'
    })
  }
}

const handleDecompose = useThrottleFn(handleDecomposeOriginal, 3000);

watch(() => active.value, () => {
  form.value.page = 1
  list.value = []
  pageTotal.value = 0
  checkAll.value = false
  getTotal()
  getList()
})

const changeSort = () => {
  form.value.orderByFie = form.value.orderByFie == 2 ? 1 : 2
  form.value.page = 1
  list.value = []
  getList()
}

const totalDecomposePrice = computed(() => {
  return list.value
    .filter(item => item.choosed)
    .reduce((total, item) => total + (item.ornamentsPrice || 0), 0)
    .toFixed(2);
});

// 转增相关
const transferDialogRef = ref(null)
const transferUserId = ref('')

const handleTransfer = () => {
  if (loading.value) return
  // 转增功能只能在商城饰品库存中使用
  if (active.value !== 1) {
    ElMessage({
      message: '转增功能仅支持商城饰品',
      type: 'warning'
    })
    return
  }
  const ids = list.value.filter(item => item.choosed).map(item => item.id)
  if (ids.length === 0) {
    ElMessage({
      message: '请选择要转增的饰品',
      type: 'warning'
    })
    return
  }
  transferDialogRef.value?.open()
}

const confirmTransfer = () => {
  if (!transferUserId.value || !/^\d+$/.test(transferUserId.value)) {
    ElMessage({
      message: '请输入有效的用户ID',
      type: 'warning'
    })
    return
  }
  
  const ids = list.value.filter(item => item.choosed).map(item => item.id)
  transferOrnamentApi({
    packSackIds: ids,
    toUserId: parseInt(transferUserId.value)
  }).then(res => {
    if (res.code === 200) {
      ElMessage({
        message: res.msg || '转增成功',
        type: 'success'
      })
      transferDialogRef.value?.close()
      transferUserId.value = ''
      form.value.page = 1
      list.value = []
      getTotal()
      getList()
      checkBoxChange(false)
    } else {
      ElMessage({
        message: res.msg || '转增失败',
        type: 'error'
      })
    }
  }).catch(err => {
    ElMessage({
      message: err.message || '转增失败，请重试',
      type: 'error'
    })
  })
}

</script>

<template>
  <div class="container">
    <div class="nav">
      <div class="nav-item" v-for="(i, index) in tabs" :class="{ 'active': active === i.value }" :key="index"
        @click="()=>{
          if(loading)return
          active = i.value
        }">
        <span>{{ i.label }}</span>
      </div>
    </div>
    <div v-show="active === 0" style="display:flex;flex-direction: column" class="tabs-container">
      <div style="display:flex;font-size: .8em;justify-content: space-between">
        <div style="display: flex;flex-wrap: wrap">
          <div @click="changeSort" style="color: #fff;line-height: 1.5em;cursor: pointer;margin-right: 15px;display: flex;">
            <span v-if="form.orderByFie == 1">价格升序<img :src="arrow" alt="" style="transform: rotateZ(180deg);width: 8px;display: inline-block;margin-left: 4px;"/></span>
            <span v-else>价格降序<img :src="arrow" alt="" style="width: 8px;display: inline-block;margin-left: 4px;"/></span>
          </div>
          <div>宝箱饰品总数：{{ total.boxOrnamentNumber || 0 }}</div>
        </div>
        <div style="display: flex;align-items: center;flex-wrap: wrap;justify-content: flex-end">
          <el-checkbox style="--el-checkbox-text-color:#fff;--el-color-primary:rgb(138, 15, 198)"
            @change="checkBoxChange" v-model="checkAll">
            全选
          </el-checkbox>
          <div class="button" @click="handleDecompose">分解饰品 <img :src="Money" class="tw-h-[10px] md:tw-h-[1rem] tw-ml-[4px] tw-mr-[2px]" /> {{
            totalDecomposePrice }}</div>
        </div>
      </div>
    </div>
    <div v-show="active === 1" style="display:flex;flex-direction: column" class="tabs-container">
      <div style="display:flex;font-size: .8em;justify-content: space-between">
        <div style="display: flex;flex-wrap: wrap">
          <div @click="changeSort" style="color: #fff;line-height: 1.5em;cursor: pointer;margin-right: 15px;display: flex;">
            <span v-if="form.orderByFie == 1">价格升序<img :src="arrow" alt="" style="transform: rotateZ(180deg);width: 8px;display: inline-block;margin-left: 4px;"/></span>
            <span v-else>价格降序<img :src="arrow" alt="" style="width: 8px;display: inline-block;margin-left: 4px;"/></span>
          </div>
          <div>商城饰品总数：{{ total.shopOrnamentNumber || 0 }}</div>
        </div>
        <div style="display: flex;align-items: center;flex-wrap: wrap;justify-content: flex-end">
          <el-checkbox style="--el-checkbox-text-color:#fff;--el-color-primary:rgb(138, 15, 198)"
            @change="checkBoxChange" v-model="checkAll">
            全选
          </el-checkbox>
          <div class="button" @click="handleDecompose">分解饰品 <img :src="Money" class="tw-h-[10px] md:tw-h-[1rem] tw-ml-[4px] tw-mr-[2px]" /> {{
            totalDecomposePrice }}</div>
          <div class="button" @click="handleDelivery">
            提取
          </div>
          <div class="button" @click="handleTransfer">
            转增
          </div>
        </div>
      </div>
    </div>
    <div v-if="active === 0 || active === 1" v-loading="loading" class="content-wrapper">
      <div class="inventory_list" ref="listRef">
        <NewBoxs class="wq" v-for="(i, index) in list" :class="{ 'choose': i.choosed }" :title="i.ornamentName"
          :key="index" @click="onChoose(i)" :box-data="i" show-price></NewBoxs>
      </div>
      <!-- 分页组件 -->
      <div class="pagination-wrapper" v-if="pageTotal > 0">
        <el-pagination
          v-model:current-page="form.page"
          v-model:page-size="form.size"
          :page-sizes="[14, 28, 56, 112]"
          :total="pageTotal"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          background
        />
      </div>
    </div>
    <div v-if="active === 2" v-loading="loading" class="content-wrapper">
      <div class="inventory_list" ref="listRef">
        <NewBoxs class="wq" v-for="(i, index) in list" :title="i.ornamentName"
          :key="index" :box-data="i" show-price></NewBoxs>
      </div>
      <!-- 分页组件 -->
      <div class="pagination-wrapper" v-if="pageTotal > 0">
        <el-pagination
          v-model:current-page="form.page"
          v-model:page-size="form.size"
          :page-sizes="[14, 28, 56, 112]"
          :total="pageTotal"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          background
        />
      </div>
    </div>
    <div v-if="active === 3" v-loading="loading" class="content-wrapper">
      <div class="transfer-records">
        <div class="records-item header">
          <div class="item image">饰品图片</div>
          <div class="item name">饰品名称</div>
          <div class="item price">价格</div>
          <div class="item type">类型</div>
          <div class="item user-id">用户ID</div>
          <div class="item user-name">用户名称</div>
          <div class="item time">时间</div>
        </div>
        <el-scrollbar height="500px" v-loading="loading">
          <div class="records-list" ref="listRef">
            <div v-if="list.length === 0 && !loading" class="empty-records">暂无转增记录</div>
            <div class="records-item" v-for="(i, index) in list" :key="index">
              <div class="item image">
                <img :src="i.imageUrl" alt="" v-if="i.imageUrl" />
              </div>
              <div class="item name">{{ i.ornamentName || '-' }}</div>
              <div class="item price">{{ i.ornamentsPrice || 0 }}</div>
              <div class="item type">{{ i.transferType || '-' }}</div>
              <div class="item user-id">{{ i.transferUserId || '-' }}</div>
              <div class="item user-name">{{ i.transferUserName || '-' }}</div>
              <div class="item time">{{ i.createTime ? formatDate(i.createTime) : '-' }}</div>
            </div>
          </div>
        </el-scrollbar>
        <!-- 分页组件 -->
        <div class="pagination-wrapper" v-if="pageTotal > 0">
          <el-pagination
            v-model:current-page="form.page"
            v-model:page-size="form.size"
            :page-sizes="[14, 28, 56, 112]"
            :total="pageTotal"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            background
          />
        </div>
      </div>
    </div>

    <!-- 转增对话框 -->
    <BaseDialog ref="transferDialogRef" title="转增饰品" :show-cancel="true" :show-confirm="true" @confirm="confirmTransfer">
      <template #default>
        <div style="height: 100%;display: flex;align-items: center;justify-content: center" class="base_dialog">
          <el-input
            v-model="transferUserId"
            placeholder="请输入接收用户ID"
            clearable
            style="max-width: 650px;height: 70px"
            @keyup.enter="confirmTransfer"
          />
        </div>
      </template>
    </BaseDialog>
  </div>

</template>

<style scoped lang="scss">
@use '@/style' as *;

$primary-color-user: rgb(138, 15, 198);

.container {
  .nav {
    margin-bottom: 10px;
  }

  .button {
    font-size: 12px;
    min-width: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px 16px;
    height: 80%;
    color: #072523;
    width: fit-content;
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 15px;
    background: url('@/assets/images/login/yellow_btn.png') no-repeat;

    @include mobile {
      height: 30px;
      margin-bottom: 5px;
    }

    &:hover {
      opacity: .8;
    }
  }

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

  .wq {
    margin: 5px;
    cursor: pointer;
    position: relative;
    align-self: flex-start;

    &.choose::after {
      content: '√';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      z-index: 10;
      border-radius: 0.75rem;
    }
  }

  .weapon {
    background-size: 100% 100%;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin: 5px;
    position: relative;
    cursor: pointer;

    @include mobile {
      margin: 2px;
      width: 31%;
      max-width: 120px;
      height: auto;
    }

    &.choose:after {
      content: '√';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    }

    img {
      width: 80px;
      height: 80px;
      margin-top: 5px;
    }

    &-name {
      width: 90%;
      background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgb(0, 0, 0), rgba(0, 0, 0, 0));
      margin: 5px 0;
      padding: 2px 10px;
      text-align: center;
      font-size: .8em;
    }

    .price {
      position: absolute;
      left: 6px;
      top: 2px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    }

  }

  .tabs-container {
    display: flex;
    flex-direction: column;
    padding: 20px;

  }

  .content-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .inventory_list {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    align-items: flex-start;
    margin: 10px;
    min-height: 400px;

    @include maxWidth(521px) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      place-items: center;
      margin: 0;
    }
  }

  .pagination-wrapper {
    margin-top: 30px;
    margin-bottom: 30px;
    display: flex;
    justify-content: center;
    :deep(.el-pagination) {
      --el-pagination-button-color: #fff;
      --el-pagination-text-color: #fff;
      --el-pagination-bg-color: rgba(29, 51, 55, 0.8);
      --el-pagination-border-radius: 8px;
      .el-pagination__total,
      .el-pagination__jump {
        color: #fff;
      }
      .btn-prev,
      .btn-next {
        background-color: rgba(29, 51, 55, 0.8);
        color: #fff;
        &:hover {
          background-color: rgba(29, 51, 55, 1);
        }
      }
      .el-pager li {
        background-color: rgba(29, 51, 55, 0.8);
        color: #fff;
        &.is-active {
          background-color: rgba(155, 81, 60, 0.8);
          color: #fff;
        }
        &:hover {
          background-color: rgba(29, 51, 55, 1);
        }
      }
      .el-select .el-input__wrapper {
        background-color: rgba(29, 51, 55, 0.8);
        color: #fff;
      }
      .el-input__inner {
        color: #fff;
      }
    }
  }

  // 转增对话框输入框样式（使用与修改密码相同的样式）
  .base_dialog {
    width: 100%;
    .el-input {
      --el-input-bg-color: none;
      background: #74705E;
      --el-input-border: 0px;
      --el-input-border-color: transparent;
      --el-input-text-color: #ffffff;
      --el-input-focus-border-color: rgba(255, 255, 255, 0.2);
      --el-input-focus-border: rgba(255, 255, 255, 0.2);
      height: 45px;
      border-radius: 5px;
    }
  }

  // 转增记录列表样式
  .transfer-records {
    padding: 20px;
    display: flex;
    flex-direction: column;
    width: 100%;
    font-size: 13px;

    .records-list {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .records-item {
      align-self: center;
      width: 95%;
      min-height: 60px;
      background: rgba(0, 0, 0, 0.59);
      border: 1px solid #B3B586;
      border-radius: 8px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      padding: 10px 0;

      &.header {
        background: rgba(0, 0, 0, 0.59);
        font-weight: bold;
        margin-bottom: 15px;
        border: 1px solid #B3B586;
      }

      .item {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
        word-break: break-word;
        text-align: center;
        color: #fff;

        &.image {
          width: 10%;
          img {
            max-width: 50px;
            max-height: 50px;
            object-fit: contain;
          }
        }

        &.name {
          width: 20%;
        }

        &.price {
          width: 12%;
        }

        &.type {
          width: 8%;
        }

        &.user-id {
          width: 10%;
        }

        &.user-name {
          width: 15%;
        }

        &.time {
          width: 25%;
        }
      }
    }

    .empty-records {
      text-align: center;
      padding: 40px;
      color: #999;
      font-size: 14px;
    }
  }
}
</style>
