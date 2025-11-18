<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { getUserBag } from "../server/api";
import { useStore } from "@/store";
import { ElMessage } from "element-plus";
import { useUserInfo } from '@/composables/useUesrInfo'
import { useScroll } from '@vueuse/core'
import NewBoxs from '@/components/Box/NewBoxs.vue'
import BaseModel from '@/components/BaseModel/index.vue'
import luckyBg from '@/assets/images/upgrade/lucky_bg.webp'
const props = defineProps({
  openData: {
    type: Array,
    default: () => []
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  selectedBagTotalPrice: {
    type: Number,
    default: 0
  },
  activesNums: {
    type: Number,
    default: 0
  },
  usePrice: {
    type: String,
    default: '0'
  }
});
const visible = ref(false)
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 50
const userBagData = ref([])
const store = useStore()
const packSackIds = ref([]) // 选中的物品id数组
const orderByFie = ref(1) // 排序字段：1获得时间 2价格
const orderByType = ref(2) // 排序类型：1升序 2降序
const emit = defineEmits(['confirm', 'update:selectedIds', 'update:selectedBagTotalPrice'])

// 使用useUserInfo hook
const { isLogin } = useUserInfo()

// 获取滚动容器的引用
const scrollContainerRef = ref(null)
const { arrivedState } = useScroll(scrollContainerRef, {
  offset: { bottom: 100 }, // 距离底部100px时触发
})


// 新增动画相关状态
const isModalOpen = ref(false)
const animationDelay = 0.05

// 物品进场动画
const getItemAnimationDelay = (index) => {
  return `${index * animationDelay}s`
}

// 为空状态添加计算属性
const isEmpty = computed(() => {
  return !loading.value && finished.value && userBagData.value.length === 0
})

const open = () => {
  visible.value = true
  setTimeout(() => {
    isModalOpen.value = true
  }, 50)
  page.value = 1
  finished.value = false
  userBagData.value = []
  getUserBagData()
}
const close = () => {
  isModalOpen.value = false
  setTimeout(() => {
    visible.value = false
  }, 300) // 动画持续时间
  page.value = 1
  finished.value = false
  userBagData.value = []
}

// 处理物品选中状态
const handleSelect = (id) => {
  const index = packSackIds.value.indexOf(id)
  if (index > -1) {
    packSackIds.value.splice(index, 1)
  } else {
    packSackIds.value.push(id)
  }
}

// 判断物品是否被选中
const isSelected = (id) => {
  return packSackIds.value.includes(id)
}

// 监听是否到达底部
watch(() => arrivedState.bottom, (v) => {
  if (v && !loading.value && !finished.value) {
    getUserBagData()
  }
})

// 获取用户背包数据
const getUserBagData = () => {
  if (isLogin.value && !loading.value && !finished.value) {
    loading.value = true
    getUserBag({
      page: page.value,
      size: pageSize,
      orderByFie: orderByFie.value,
      orderByType: orderByType.value,
      beginTime: "",
      endTime: "",
      limit: 0,
      name: "",
      statusList: [0],
      uidList: []
    }).then(res => {
      if (res.code === 200) {
        if (page.value === 1) {
          userBagData.value = res.data || []
        } else {
          userBagData.value = [...userBagData.value, ...(res.data || [])]
        }
        if (!res.data || res.data.length < pageSize) {
          finished.value = true
        } else {
          page.value++
        }
      }
    }).finally(() => {
      loading.value = false
    })
  }
}

// 监听用户信息变化
watch(() => store.userInfo, () => {
  page.value = 1
  finished.value = false
  userBagData.value = []
  getUserBagData()
}, {
  deep: true,
  immediate: true
})

// 监听弹窗显示状态
watch(() => visible.value, (val) => {
  if (val) {
    page.value = 1
    finished.value = false
    userBagData.value = []
    getUserBagData()
  }
})

onMounted(() => {
  // 组件挂载时不需要获取数据，等打开弹窗时再获取
})

// 确定选择
const handleConfirm = () => {
  if (packSackIds.value.length === 0) {
    ElMessage({
      message: '请至少选择一个物品',
      type: 'warning'
    })
    return
  }

  // 计算选中物品的总价格
  const totalPrice = userBagData.value
    .filter(item => packSackIds.value.includes(item.id))
    .reduce((sum, item) => sum + item.ornamentsPrice, 0)
  console.log('packSackIds.value', packSackIds.value)
  emit('confirm', {
    selectedIds: packSackIds.value,
    totalPrice: totalPrice,
    selectedItems: userBagData.value.filter(item => packSackIds.value.includes(item.id)),
    selectedItem: userBagData.value.find(item => packSackIds.value.includes(item.id))
  })
  close()
}

// 添加取消处理函数
const handleCancel = () => {
  emit('confirm', {
    selectedIds: [],
    totalPrice: 0,
    selectedItems: [],
    selectedItem: {}
  })
  close()
}

// 监听选中状态变化
watch(() => props.selectedIds, (newVal) => {
  packSackIds.value = [...newVal]
}, { immediate: true })

// 处理物品选择
const handleItemSelect = (item) => {
  // 如果物品已经被选中，则取消选中
  if (isSelected(item.id)) {
    const index = packSackIds.value.indexOf(item.id)
    if (index > -1) {
      packSackIds.value.splice(index, 1)
    }
    // 更新父组件的选中状态
    const newSelectedIds = props.selectedIds.filter(id => id !== item.id)
    emit('update:selectedIds', newSelectedIds)
    return
  }
  console.log(props.openData)
  // 如果activesNums为1，则只能选择一个物品
  if (props.activesNums === 1) {

    // 如果已经有选中的物品，先取消选中
    if (packSackIds.value.length > 0) {
      packSackIds.value = []
      emit('update:selectedIds', [])
    }

    // 检查价格限制
    if (props.usePrice && props.usePrice !== '0') {
      const maxPrice = parseFloat(props.usePrice) * 0.65;
      if (item.ornamentsPrice > maxPrice) {
        ElMessage.warning(`物品价格不能超过目标价格的65%`);
        return;
      }
    }

    // 选中新物品
    packSackIds.value.push(item.id)
    emit('update:selectedIds', [item.id])
    return
  }

  // 其他情况下的数量限制检查
  if (props.activesNums > 0 && props.selectedIds.length >= props.activesNums) {
    ElMessage.warning(`最多只能选择${props.activesNums}个物品`)
    return
  }

  // 检查价格限制（多选情况）
  if (props.usePrice && props.usePrice !== '0') {
    const maxPrice = parseFloat(props.usePrice) * 0.65;

    // 计算当前已选物品总价加上新物品的价格
    const currentSelectedPrice = props.selectedIds.reduce((total, id) => {
      const selectedItem = userBagData.value.find(bagItem => bagItem.id === id);
      return total + (selectedItem?.ornamentsPrice || 0);
    }, 0);

    const newTotalPrice = currentSelectedPrice + item.ornamentsPrice;

    if (newTotalPrice > maxPrice) {
      ElMessage.warning(`所选物品总价不能超过箱子价格的65%，最高可选择价值${maxPrice.toFixed(2)}的物品`);
      return;
    }
  }

  // 选中物品
  packSackIds.value.push(item.id)
  const newSelectedIds = [...props.selectedIds, item.id]
  emit('update:selectedIds', newSelectedIds)

  // 计算总价
  const newTotalPrice = newSelectedIds.reduce((total, id) => {
    const item = userBagData.value.find(item => item.id === id)
    return total + (item?.ornamentsPrice || 0)
  }, 0)
  emit('update:selectedBagTotalPrice', newTotalPrice)
}

// 计算已选择数量
const selectedCount = computed(() => {
  return props.selectedIds.length
})

// 计算剩余可选数量
const remainingCount = computed(() => {
  return props.activesNums > 0 ? props.activesNums - selectedCount.value : 0
})

// 修改排序方法
const sortByTime = () => {
  // 设置排序字段为时间
  orderByFie.value = 1
  // 如果当前已经是时间排序，则切换排序方向
  if (orderByFie.value === 1) {
    orderByType.value = orderByType.value === 1 ? 2 : 1
  }
  // 刷新数据
  page.value = 1
  finished.value = false
  userBagData.value = []
  getUserBagData()
}

const sortByPrice = () => {
  // 设置排序字段为价格
  orderByFie.value = 2
  // 如果当前已经是价格排序，则切换排序方向
  if (orderByFie.value === 2) {
    orderByType.value = orderByType.value === 1 ? 2 : 1
  }
  // 刷新数据
  page.value = 1
  finished.value = false
  userBagData.value = []
  getUserBagData()
}

// 获取排序方向图标 - 不再返回文本而是返回布尔值表示方向
const isTimeAscending = computed(() => {
  return orderByFie.value === 1 && orderByType.value === 1
})

const isPriceAscending = computed(() => {
  return orderByFie.value === 2 && orderByType.value === 1
})

defineExpose({
  open,
  close
})
</script>
<template>
  <div>
    <BaseModel v-model="visible" :closeOnEsc="true" :closeOnClickOutside="true" @close="close"
      :modelStyle="{ backgroundImage: `url(${luckyBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }">
      <template #title>
        <div class="tw-flex tw-items-center tw-gap-3">
          <div class="tw-text-lg md:tw-text-2xl tw-font-bold tw-text-white">
            我的背包
          </div>
        </div>
      </template>
      <!-- 主内容区域 -->
      <div class="cyber-content tw-relative tw-p-4">
        <div class="tw-flex tw-justify-end tw-relative tw-py-4 tw-px-2">
          <div class="tw-flex tw-gap-2">
            <button @click="sortByTime" class="cyber-sort-btn" :class="{ 'active': orderByFie === 1 }">
              时间
              <span v-if="orderByFie === 1" class="tw-inline-flex tw-items-center">
                <svg v-if="isTimeAscending" xmlns="http://www.w3.org/2000/svg" width="10" height="9" viewBox="0 0 10 9"
                  fill="none" class="tw-ml-1 tw-transform tw-rotate-0">
                  <path
                    d="M4.13397 8C4.51887 8.66667 5.48113 8.66667 5.86603 8L9.33013 2C9.71503 1.33333 9.2339 0.5 8.4641 0.5H1.5359C0.766098 0.5 0.284973 1.33333 0.669873 2L4.13397 8Z"
                    fill="#A48984" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="10" height="9" viewBox="0 0 10 9" fill="none"
                  class="tw-ml-1 tw-transform tw-rotate-180">
                  <path
                    d="M4.13397 8C4.51887 8.66667 5.48113 8.66667 5.86603 8L9.33013 2C9.71503 1.33333 9.2339 0.5 8.4641 0.5H1.5359C0.766098 0.5 0.284973 1.33333 0.669873 2L4.13397 8Z"
                    fill="#A48984" />
                </svg>
              </span>
            </button>
            <button @click="sortByPrice" class="cyber-sort-btn" :class="{ 'active': orderByFie === 2 }">
              价格
              <span v-if="orderByFie === 2" class="tw-inline-flex tw-items-center">
                <svg v-if="isPriceAscending" xmlns="http://www.w3.org/2000/svg" width="10" height="9" viewBox="0 0 10 9"
                  fill="none" class="tw-ml-1 tw-transform tw-rotate-0">
                  <path
                    d="M4.13397 8C4.51887 8.66667 5.48113 8.66667 5.86603 8L9.33013 2C9.71503 1.33333 9.2339 0.5 8.4641 0.5H1.5359C0.766098 0.5 0.284973 1.33333 0.669873 2L4.13397 8Z"
                    fill="#A48984" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="10" height="9" viewBox="0 0 10 9" fill="none"
                  class="tw-ml-1 tw-transform tw-rotate-180">
                  <path
                    d="M4.13397 8C4.51887 8.66667 5.48113 8.66667 5.86603 8L9.33013 2C9.71503 1.33333 9.2339 0.5 8.4641 0.5H1.5359C0.766098 0.5 0.284973 1.33333 0.669873 2L4.13397 8Z"
                    fill="#A48984" />
                </svg>
              </span>
            </button>
          </div>
        </div>
        <!-- 物品列表滚动区域 -->
        <div ref="scrollContainerRef"
          class="cyber-items-container tw-py-3 md:tw-p-5 tw-h-[60vh] md:tw-h-[65vh] tw-overflow-y-auto no-scrollbar tw-relative tw-z-10">

          <!-- 使用与库存页面一致的布局 -->
          <div class="inventory_list">
            <div v-for="(item, index) in userBagData" :key="item.id"
              class="wq tw-transition-all tw-cursor-pointer tw-duration-300"
              :style="{ 'animation-delay': getItemAnimationDelay(index) }"
              :class="{ 'choose': isSelected(item.id) }" @click="handleItemSelect(item)">
              <NewBoxs :boxData="item" :title="item.ornamentName" show-price />
            </div>
          </div>

          <!-- 加载状态提示 -->
          <div v-if="loading" class="tw-text-center tw-py-6">
            <div class="cyber-loading">
              <span></span><span></span><span></span><span></span>
            </div>
            <div class="tw-mt-3 tw-text-amber-300">加载中...</div>
          </div>

          <!-- 无更多数据提示 -->
          <div v-if="finished && !loading && userBagData.length > 0"
            class="tw-text-center tw-text-amber-400/70 tw-py-4 tw-mt-2">
            —— 已经到底了 ——
          </div>

          <!-- 空状态提示 -->
          <div v-if="isEmpty" class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16">
            <div class="tw-text-5xl tw-mb-4 tw-text-amber-600/50">🎒</div>
            <div class="tw-text-lg tw-text-amber-400/70">背包空空如也</div>
            <div class="tw-text-sm tw-text-amber-400/50 tw-mt-2">去探索获取更多物品吧</div>
          </div>
        </div>
      </div>

      <template #footer>
        <!-- 取消按钮 -->
        <button @click="handleCancel" class="cyber-btn cyber-btn-secondary tw-rounded-full">
          <span class="cyber-btn-text">取消</span>
          <span class="cyber-btn-glitch"></span>
        </button>

        <!-- 确定按钮 -->
        <button @click="handleConfirm" class="cyber-btn cyber-btn-primary tw-rounded-full"
          :disabled="packSackIds.length === 0">
          <span class="cyber-btn-text">确定选择</span>
          <span class="cyber-btn-glitch"></span>
        </button>
      </template>
    </BaseModel>


  </div>
</template>

<style scoped>
.custom-dialog {
  background: none;
}

.cyber-overlay {
  backdrop-filter: blur(8px);
  background-color: rgba(30, 15, 10, 0.7);
}


/* 使用幸运饰品背景 - 覆盖整个弹框 */
:deep(.cyber-modal) {
  position: relative !important;
  overflow: hidden !important;
  background-color: transparent !important;
  background-image: url(v-bind(luckyBg)) !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

:deep(.cyber-header) {
  position: relative !important;
  z-index: 1 !important;
  background: transparent !important;
  backdrop-filter: blur(2px);
}

:deep(.cyber-footer) {
  position: relative !important;
  z-index: 1 !important;
  background: transparent !important;
  border-top: 1px solid rgba(155, 81, 60, 0.3);
  backdrop-filter: blur(2px);
}

:deep(.cyber-content) {
  position: relative !important;
  z-index: 1 !important;
}






.cyber-content {
  position: relative;
  z-index: 1;
  padding-top: 0;
  min-height: calc(60vh + 8rem);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(155, 81, 60, 0.5) rgba(40, 20, 15, 0.3);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(40, 20, 15, 0.3);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(155, 81, 60, 0.5);
  border-radius: 4px;
}

.cyber-item-wrapper {
  position: relative;
  transition: all 0.25s ease;
  animation: fadeInUp 0.4s ease both;
  aspect-ratio: auto;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cyber-item {
  position: relative;
  border-radius: 10px;

  transition: all 0.25s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cyber-item::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, rgba(155, 81, 60, 0.2), transparent, rgba(155, 81, 60, 0.2));
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 10px;
}

.cyber-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(155, 81, 60, 0.25);
  border-color: rgba(155, 81, 60, 0.5);
}

.cyber-item:hover::before {
  opacity: 1;
}

.cyber-item>div:first-child {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
}

.cyber-selected .cyber-item {
  border-color: rgba(180, 83, 60, 0.9);
  box-shadow: 0 0 20px rgba(180, 83, 60, 0.4);
}

.cyber-item-select-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(93deg, #FF553C 7.24%, #A70202 98.65%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 10px rgba(155, 81, 60, 0.5);
  z-index: 10;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.cyber-item-name {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}



.cyber-btn {
  position: relative;
  padding: 0.625rem 2rem;
  min-width: 7.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  overflow: hidden;
}

.cyber-btn-secondary {
  background: #81635E;
  color: #fff;

}

.cyber-btn-secondary:hover {

  color: #fff;
  border-color: rgba(180, 83, 60, 0.5);
}

.cyber-btn-primary {
  background: linear-gradient(93deg, #FF553C 7.24%, #A70202 98.65%);
  color: white;
  border: none;
  position: relative;

  box-shadow: 0 0 10px rgba(155, 81, 60, 0.3);
}

.cyber-btn-primary:disabled {
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}

.cyber-btn-primary:not(:disabled):hover {
  box-shadow: 0 0 15px rgba(155, 81, 60, 0.5);
  transform: translateY(-1px);
}

.cyber-btn-text {
  position: relative;
  z-index: 2;
}

.cyber-btn-glitch {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.cyber-btn-primary:not(:disabled):hover .cyber-btn-glitch {
  transform: translateX(100%);
}

.cyber-btn-secondary:not(:disabled):hover .cyber-btn-glitch {
  transform: translateX(100%);
}

.cyber-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 30px;
}

.cyber-loading span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #b45e41;
  animation: cyber-loading 1.5s infinite ease-in-out;
}

.cyber-loading span:nth-child(2) {
  animation-delay: 0.2s;
}

.cyber-loading span:nth-child(3) {
  animation-delay: 0.4s;
}

.cyber-loading span:nth-child(4) {
  animation-delay: 0.6s;
}

@keyframes cyber-loading {

  0%,
  100% {
    transform: scale(0.5);
    opacity: 0.5;
  }

  50% {
    transform: scale(1);
    opacity: 1;
  }
}

.cyber-sort-btn {
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  background: rgba(155, 81, 60, 0.1);
  color: rgba(251, 191, 36, 0.8);
  border: 1px solid rgba(155, 81, 60, 0.3);
  font-size: 0.875rem;
  transition: all 0.2s ease;
  min-width: 4rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cyber-sort-btn:hover {
  background: rgba(155, 81, 60, 0.2);
  color: rgba(253, 224, 71, 0.9);
  border-color: rgba(180, 83, 60, 0.5);
}

.cyber-sort-btn.active {
  background: rgba(155, 81, 60, 0.25);
  color: rgba(253, 224, 71, 1);
  border-color: rgba(180, 83, 60, 0.6);
  box-shadow: 0 0 8px rgba(155, 81, 60, 0.3);
}

/* 库存列表样式 */
.inventory_list {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  margin: 10px;
}

.inventory_list .wq {
  margin: 5px;
  cursor: pointer;
  position: relative;
}

.inventory_list .wq.choose::after {
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

@media (max-width: 521px) {
  .inventory_list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    place-items: center;
    margin: 0;
  }
}
</style>
