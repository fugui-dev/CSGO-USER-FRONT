<script setup>

import {computed, ref, watch} from "vue";
import {deliverPackSackApi, getExtractPackSackApi, getPackSackApi, getPackSackGlobalDataApi, transferOrnamentApi, getTransferRecordsApi, getUserInfoByIdApi, verifyPasswordApi} from "@/api";
import {useThrottleFn} from "@vueuse/core";
import {ElMessage, ElIcon} from "element-plus";
import {Loading} from "@element-plus/icons-vue";
import {goto, formatDate} from "@/utils/common";
import NewBoxs from "@/components/Box/NewBoxs.vue";
import {postDecompose} from "@/views/openBox/server/api";
import Money from '@/assets/images/home/coin.png'
import Ammunition from '@/assets/images/shop/ammunition.png'
import {useUserInfo} from '@/composables/useUesrInfo'
import arrow from '@/assets/images/user/arrow.png'
import BaseDialog from "@/components/dialogs/BaseDialog.vue";
import { useStore } from "@/store/index.js";

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
  rollOrnamentNumber: 0,
  rollOrnamentPrice: 0,
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
    label: 'ROLL房饰品库存',
    value: 4
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
  if (active.value === 0 || active.value === 1 || active.value === 4) {
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
    // 宝箱饰品库存：source = 1,2,4,5,7,8,9,21 (排除ROLL房source=3)
    api = getPackSackApi
    requestForm.sourceList = [1, 2, 4, 5, 7, 8, 9, 21]
  } else if (active.value === 1) {
    // 商城饰品库存：source = 6 (商城兑换)
    api = getPackSackApi
    requestForm.sourceList = [6]
  } else if (active.value === 4) {
    // ROLL房饰品库存：source = 3 (ROLL房)
    api = getPackSackApi
    requestForm.sourceList = [3]
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
const passwordDialogRef = ref(null)
const transferUserId = ref('')
const transferUserInfo = ref(null)
const transferConfirmChecked = ref(false)
const queryingUser = ref(false)
const password = ref('')
const verifyingPassword = ref(false)

const store = useStore();
const isPC = computed(()=>{
  return store.isPC
})

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
  // 重置状态
  transferUserId.value = ''
  transferUserInfo.value = null
  transferConfirmChecked.value = false
  transferDialogRef.value?.open()
}

// 查询用户信息
const queryUserInfo = () => {
  if (!transferUserId.value || !/^\d+$/.test(transferUserId.value)) {
    ElMessage({
      message: '请输入有效的用户ID',
      type: 'warning'
    })
    return
  }
  
  queryingUser.value = true
  getUserInfoByIdApi(parseInt(transferUserId.value)).then(res => {
    if (res.code === 200 && res.data) {
      transferUserInfo.value = res.data
    } else {
      transferUserInfo.value = null
      ElMessage({
        message: res.msg || '用户不存在',
        type: 'warning'
      })
    }
  }).catch(err => {
    transferUserInfo.value = null
    ElMessage({
      message: err.message || '查询用户失败',
      type: 'error'
    })
  }).finally(() => {
    queryingUser.value = false
  })
}

const confirmTransfer = () => {
  if (!transferUserId.value || !/^\d+$/.test(transferUserId.value)) {
    ElMessage({
      message: '请输入有效的用户ID',
      type: 'warning'
    })
    return
  }
  
  if (!transferUserInfo.value) {
    ElMessage({
      message: '请先查询并确认接收用户信息',
      type: 'warning'
    })
    return
  }
  
  if (!transferConfirmChecked.value) {
    ElMessage({
      message: '请勾选确认信息',
      type: 'warning'
    })
    return
  }
  
  // 先弹出密码验证弹窗
  password.value = ''
  passwordDialogRef.value?.open()
}

// 验证密码
const verifyPassword = () => {
  if (!password.value || password.value.trim() === '') {
    ElMessage({
      message: '请输入密码',
      type: 'warning'
    })
    return
  }
  
  verifyingPassword.value = true
  verifyPasswordApi({
    password: password.value
  }).then(res => {
    if (res.code === 200) {
      // 密码验证成功，关闭密码弹窗，提交转增请求
      passwordDialogRef.value?.close()
      submitTransfer()
    } else {
      ElMessage({
        message: res.msg || '密码验证失败',
        type: 'error'
      })
    }
  }).catch(err => {
    ElMessage({
      message: err.message || '密码验证失败，请重试',
      type: 'error'
    })
  }).finally(() => {
    verifyingPassword.value = false
  })
}

// 提交转增请求
const submitTransfer = () => {
  const ids = list.value.filter(item => item.choosed).map(item => item.id)
  transferOrnamentApi({
    packSackIds: ids,
    toUserId: parseInt(transferUserId.value)
  }).then(res => {
    if (res.code === 200) {
      ElMessage({
        message: '操作成功，待审核请前往转增记录查看',
        type: 'success'
      })
      transferDialogRef.value?.close()
      transferUserId.value = ''
      transferUserInfo.value = null
      transferConfirmChecked.value = false
      password.value = ''
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

// 获取选中的饰品列表
const selectedOrnaments = computed(() => {
  return list.value.filter(item => item.choosed)
})

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
          <div class="button" @click="handleDecompose">分解饰品 <img :src="Ammunition" class="tw-h-[10px] md:tw-h-[1rem] tw-ml-[4px] tw-mr-[2px]" /> {{
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
          <div class="button" @click="handleDecompose">分解饰品 <img :src="Ammunition" class="tw-h-[10px] md:tw-h-[1rem] tw-ml-[4px] tw-mr-[2px]" /> {{
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
    <div v-show="active === 4" style="display:flex;flex-direction: column" class="tabs-container">
      <div style="display:flex;font-size: .8em;justify-content: space-between">
        <div style="display: flex;flex-wrap: wrap">
          <div @click="changeSort" style="color: #fff;line-height: 1.5em;cursor: pointer;margin-right: 15px;display: flex;">
            <span v-if="form.orderByFie == 1">价格升序<img :src="arrow" alt="" style="transform: rotateZ(180deg);width: 8px;display: inline-block;margin-left: 4px;"/></span>
            <span v-else>价格降序<img :src="arrow" alt="" style="width: 8px;display: inline-block;margin-left: 4px;"/></span>
          </div>
          <div>ROLL房饰品总数：{{ total.rollOrnamentNumber || 0 }}</div>
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
    <div v-if="active === 0 || active === 1 || active === 4" v-loading="loading" class="content-wrapper">
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
          :layout="isPC ? 'total, sizes, prev, pager, next': 'prev, pager, next'"
          :size="isPC ? 'default': 'small'"
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
          <div class="item status">状态</div>
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
              <div class="item status">
                <span v-if="i.status === 0" style="color: #E6A23C;">待审核</span>
                <span v-else-if="i.status === 1" style="color: #67C23A;">已通过</span>
                <span v-else-if="i.status === 2" style="color: #F56C6C;">已拒绝</span>
                <span v-else>-</span>
                <span v-if="i.auditRemark" style="margin-left: 5px; font-size: 12px; color: #909399;" :title="i.auditRemark">(备注)</span>
              </div>
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
        <div class="transfer-dialog-content">
          <!-- 搜索框和查询按钮 -->
          <div class="transfer-input-section" style="display: flex; flex-direction: row; align-items: center; gap: 10px; justify-content: center;">
            <el-input
              v-model="transferUserId"
              placeholder="请输入接收用户ID"
              clearable
              class="transfer-user-input"
              style="width: 180px; flex: 0 0 auto; height: 40px;"
              @keyup.enter="queryUserInfo"
            >
              <template #suffix>
                <el-icon v-if="queryingUser" class="is-loading">
                  <Loading />
                </el-icon>
              </template>
            </el-input>
            <el-button 
              type="primary" 
              class="query-button"
              style="flex: 0 0 auto; height: 40px; padding: 0 15px;"
              @click="queryUserInfo"
              :loading="queryingUser"
            >
              查询
            </el-button>
          </div>
          
          <!-- 用户信息展示 -->
          <div v-if="transferUserInfo" class="transfer-user-info" style="margin: 20px auto 0 auto; width: fit-content;">
            <div class="user-avatar">
              <el-avatar :src="transferUserInfo.avatar" :size="60">
                <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" alt="默认头像" />
              </el-avatar>
            </div>
            <div class="user-name">{{ transferUserInfo.nickName || transferUserInfo.userName || '-' }}</div>
          </div>
          
          <!-- 确认勾选框 -->
          <div v-if="transferUserInfo && selectedOrnaments.length > 0" class="transfer-confirm-section" style="display: flex; justify-content: center; width: 100%;">
            <el-checkbox v-model="transferConfirmChecked">
              <span class="confirm-text">转增后无法撤回，请核实受赠人信息</span>
            </el-checkbox>
          </div>
        </div>
      </template>
    </BaseDialog>

    <!-- 密码验证对话框 -->
    <BaseDialog ref="passwordDialogRef" title="密码验证" :show-cancel="true" :show-confirm="true" @confirm="verifyPassword">
      <template #default>
        <div class="password-dialog-content">
          <div class="password-tip" style="margin-bottom: 20px; color: #666; font-size: 14px;">
            为了您的账户安全，请先验证密码
          </div>
          <div class="password-input-section" style="display: flex; flex-direction: row; align-items: center; gap: 10px; justify-content: center;">
            <el-input
              v-model="password"
              type="password"
              placeholder="请输入登录密码"
              clearable
              class="password-input"
              style="width: 250px; height: 40px;"
              :disabled="verifyingPassword"
              @keyup.enter="verifyPassword"
              show-password
            >
            </el-input>
          </div>
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
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 0 10px;
  }
  .nav-item {
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

  // 密码验证对话框样式
  .password-dialog-content {
    padding: 20px;
    .password-input-section {
      .password-input {
        :deep(.el-input__wrapper) {
          background: #74705E;
          border: none;
          border-radius: 5px;
          height: 40px !important;
          min-height: 40px !important;
        }
        :deep(.el-input__inner) {
          color: #ffffff;
          height: 40px !important;
          line-height: 40px !important;
        }
        :deep(.el-input__inner::placeholder) {
          color: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }

  // 转增对话框样式
  .transfer-dialog-content {
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    min-height: 300px;

    .transfer-input-section {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      justify-content: center;

      .transfer-user-input {
        height: 40px !important;
        :deep(.el-input) {
          width: 180px !important;
          max-width: 180px !important;
          height: 40px !important;
        }
        :deep(.el-input__wrapper) {
          background: #74705E;
          border: none;
          border-radius: 5px;
          height: 40px !important;
          min-height: 40px !important;
          width: 180px !important;
          max-width: 180px !important;
        }
        :deep(.el-input__inner) {
          color: #ffffff;
          width: 180px !important;
          max-width: 180px !important;
          height: 40px !important;
          line-height: 40px !important;
        }
        :deep(.el-input__inner::placeholder) {
          color: rgba(255, 255, 255, 0.6);
        }
      }

      .query-button {
        height: 40px;
        padding: 0 20px;
        background: #9B513C;
        border-color: #9B513C;
        color: #ffffff;
        font-size: 14px;
        border-radius: 5px;
        white-space: nowrap;
        flex: 0 0 auto;
        &:hover {
          background: #8a4632;
          border-color: #8a4632;
        }
      }
    }

    .transfer-user-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      padding: 20px;
      background: rgba(116, 112, 94, 0.3);
      border-radius: 8px;
      width: auto;
      margin: 0 auto;

      .user-avatar {
        :deep(.el-avatar) {
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
      }

      .user-name {
        color: #ffffff;
        font-size: 16px;
        font-weight: 500;
        text-align: center;
        word-break: break-all;
      }
    }

    .transfer-confirm-section {
      width: 100%;
      padding: 15px 0;
      display: flex;
      justify-content: center;

      :deep(.el-checkbox) {
        .el-checkbox__label {
          color: #ffffff;
          font-size: 14px;
        }

        .el-checkbox__input.is-checked .el-checkbox__inner {
          background-color: #9B513C;
          border-color: #9B513C;
        }
      }

      .confirm-text {
        color: #ffffff;
        font-size: 14px;
      }
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
          width: 18%;
        }

        &.price {
          width: 10%;
        }

        &.type {
          width: 8%;
        }

        &.user-id {
          width: 8%;
        }

        &.user-name {
          width: 12%;
        }

        &.status {
          width: 10%;
          font-size: 12px;
        }

        &.time {
          width: 24%;
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
