<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import end1 from '@/assets/images/open/golden-bg.png'
import end2 from '@/assets/images/open/red-bg.png'
import end3 from '@/assets/images/open/purple-bg.png'
import end4 from '@/assets/images/open/blue-bg.png'
import end5 from '@/assets/images/open/green-bg.png'
import Money from '@/assets/images/upgrade/coin.png'
import lineLeft from '@/assets/images/open/line-left.png'
import lineRight from '@/assets/images/open/line-right.png'
import congratulation from '@/assets/images/open/congratulation.png'
import { postDecompose } from '@/views/openBox/server/api'

const props = defineProps({
  fightResult: {
    type: Array,
    default: () => []
  },
  fightBoxVOList: {
    type: Array,
    default: () => []
  },
  currPlayerId: {
    type: Number
  },
  visible: {
    type: Boolean,
    default: false
  },
  fightId: {
    type: Number
  }
})

const emit = defineEmits(['update:visible', 'close', 'decomposeSuccess'])

const router = useRouter()
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const leavel = {
  1: {
    color: '#FFBD4E',
    background: 'golden-bg',
    img: end1
  },
  2: {
    color: '#FF352E',
    background: 'red-bg',
    img: end2
  },
  3: {
    color: '#984EFF',
    background: 'purple-bg',
    img: end4
  },
  4: {
    color: '#35B2FF',
    background: 'blue-bg',
    img: end3
  },
  5: {
    color: '#1FEBC4',
    background: 'green-bg',
    img: end5
  }
}

// 过滤当前玩家的结果，并按价格倒序排序
const resultList = computed(() => {
  if (!props.fightResult || !props.currPlayerId) return []
  
  // 过滤条件：holderUserId 匹配，并且有 ornamentId
  const filtered = props.fightResult.filter(item => item.holderUserId === props.currPlayerId && item.ornamentId)
  
  // 为每个 item 补充名称
  const mapped = filtered.map(item => {
    const newItem = { ...item }
    // 如果 ornamentName 为空，尝试从 fightBoxVOList 中查找（需要 boxId）
    if (!item.ornamentName && item.ornamentId && item.boxId) {
      const name = findOrnamentName(item.ornamentId, item.boxId)
      if (name) {
        newItem.ornamentName = name
      }
    }
    // 如果没有 boxId，尝试使用 marketHashName 作为名称
    if (!item.ornamentName && item.marketHashName) {
      newItem.ornamentName = item.marketHashName
    }
    return newItem
  })
  
  // 按价格倒序排序
  return mapped.sort((a, b) => {
    const priceA = Number(a.ornamentsPrice || 0)
    const priceB = Number(b.ornamentsPrice || 0)
    return priceB - priceA // 倒序
  })
})

// 根据 ornamentId 和 boxId 从 fightBoxVOList 中查找名称
const findOrnamentName = (ornamentId, boxId) => {
  if (!ornamentId || !boxId || !props.fightBoxVOList || props.fightBoxVOList.length === 0) {
    return null
  }
  
  // 找到对应的 box
  const box = props.fightBoxVOList.find(b => b.boxId === boxId)
  if (!box || !box.ornaments || box.ornaments.length === 0) {
    return null
  }
  
  // 找到对应的饰品
  const ornament = box.ornaments.find(o => String(o.ornamentId) === String(ornamentId))
  return ornament ? ornament.name : null
}

// 添加分解相关变量
const selectedItems = ref([])

// 计算分解后的总价格
// 计算所有物品的总价格（用于显示）
const totalAllPrice = computed(() => {
  if (!resultList.value || resultList.value.length === 0) return '0.00'
  
  // 计算所有物品的总价格
  return resultList.value.reduce((total, item) => {
    const price = item?.ornamentsPrice || 0
    return total + Number(price)
  }, 0).toFixed(2)
})

const totalDecomposePrice = computed(() => {
  if (!resultList.value || resultList.value.length === 0) return '0.00'
  
  // 只计算选中项的总价格
  return selectedItems.value.reduce((total, index) => {
    const item = resultList.value[index]
    const price = item?.ornamentsPrice || 0
    return total + Number(price)
  }, 0).toFixed(2)
})

// 计算物品总数
const totalCount = computed(() => {
  return resultList.value.length
})

// 判断是否需要居中显示
const awardWrapRef = ref(null)
const shouldCenterItems = ref(false)

// 检查内容宽度是否小于容器宽度
const checkShouldCenter = () => {
  nextTick(() => {
    if (!awardWrapRef.value) return
    
    const container = awardWrapRef.value
    // 获取容器的实际可视宽度（减去padding）
    const containerWidth = container.clientWidth - 32 // 减去左右padding (1rem * 2 = 32px)
    // 获取内容的实际宽度
    const items = container.querySelectorAll('.award-item')
    if (items.length === 0) return
    
    let totalWidth = 0
    items.forEach((item, index) => {
      totalWidth += item.offsetWidth
      if (index < items.length - 1) {
        totalWidth += 12 // gap-3 = 0.75rem = 12px
      }
    })
    
    // 如果内容宽度小于容器宽度，则居中显示
    shouldCenterItems.value = totalWidth < containerWidth
    console.log('检查居中:', { containerWidth, totalWidth, shouldCenter: shouldCenterItems.value })
  })
}

// 解析饰品名称
const parseOrnamentName = (name) => {
  if (!name) return { main: '', sub: '' }
  const match = name.match(/(.*?)\s*\((.*?)\)$/)
  if (match) {
    return {
      main: match[1].trim(),
      sub: match[2].trim()
    }
  }
  return { main: name, sub: '' }
}

// 处理物品选择事件
const toggleSelectItem = (index) => {
  const itemIndex = selectedItems.value.indexOf(index)
  if (itemIndex === -1) {
    selectedItems.value.push(index)
  } else {
    selectedItems.value.splice(itemIndex, 1)
  }
}

// 分解确认函数
const confirmDecompose = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.error('请选择要分解的物品')
    return
  }
  
  // 调试信息
  console.log('选中的索引:', selectedItems.value)
  console.log('物品列表:', resultList.value)
  console.log('第一个物品的数据:', resultList.value[0])
  
  // 检查是否有有效的 id
  const itemsWithId = selectedItems.value
    .map(index => {
      const item = resultList.value[index]
      if (!item) {
        console.warn(`物品索引 ${index} 不存在`)
        return null
      }
      // 优先使用 id 字段（TtBoxRecords 的主键）
      const id = item.id || item.Id || item.ID || item.boxRecordId || item.recordId
      return { id, item }
    })
    .filter(item => item != null)
  
  // 分离有 id 和没有 id 的物品
  const itemsWithValidId = itemsWithId.filter(item => item.id != null && item.id !== undefined && item.id !== '' && item.id !== 0)
  const itemsWithoutId = itemsWithId.filter(item => !item.id || item.id === null || item.id === undefined || item.id === '' || item.id === 0)
  
  console.log('有ID的物品数量:', itemsWithValidId.length)
  console.log('没有ID的物品数量:', itemsWithoutId.length)
  
  // 如果所有物品都没有 id，使用 ornamentId + fightId 组合查询
  if (itemsWithValidId.length === 0 && itemsWithoutId.length > 0) {
    const ornamentIds = itemsWithoutId.map(item => {
      const ornamentId = item.item.ornamentId
      // 确保 ornamentId 是数字类型
      return typeof ornamentId === 'string' ? parseInt(ornamentId) : ornamentId
    }).filter(id => id != null)
    
    console.log('使用 ornamentId 组合查询，fightId:', props.fightId, 'ornamentIds:', ornamentIds)
    
    if (ornamentIds.length === 0) {
      ElMessage.error('选中的物品中没有有效的ID或ornamentId，无法分解')
      return
    }
    
    try {
      console.log('调用分解接口，参数:', {
        isAll: false,
        packSackIds: null,
        fightId: props.fightId,
        ornamentIds: ornamentIds
      })
      const res = await postDecompose({
        isAll: false,
        packSackIds: [], // 设置为空数组，让后端使用组合查询
        fightId: props.fightId,
        ornamentIds: ornamentIds
      })
      if (res.code === 200) {
        ElMessage.success('分解成功')
        selectedItems.value = []
        emit('decomposeSuccess')
        close()
      } else {
        ElMessage.error(res.msg || '分解失败')
      }
    } catch (error) {
      ElMessage.error('分解失败，请重试')
      console.error('分解失败:', error)
    }
    return
  }
  
  // 如果有部分物品有 id，部分没有，需要分别处理
  if (itemsWithoutId.length > 0) {
    console.warn('部分物品没有ID，只分解有ID的物品')
  }
  
  const itemsToDecompose = itemsWithValidId.map(item => item.id)
  
  console.log('准备分解的ID列表:', itemsToDecompose)
  
  if (itemsToDecompose.length === 0) {
    ElMessage.error('选中的物品中没有有效的ID，无法分解。请检查控制台查看详细信息。')
    return
  }
  
  try {
    const res = await postDecompose({
      isAll: false,
      packSackIds: itemsToDecompose
    })
    if (res.code === 200) {
      ElMessage.success('分解成功')
      // 清空选择
      selectedItems.value = []
      // 触发父组件更新
      emit('decomposeSuccess')
      // 关闭弹窗
      close()
    } else {
      ElMessage.error(res.msg || '分解失败')
    }
  } catch (error) {
    ElMessage.error('分解失败，请重试')
    console.error('分解失败:', error)
  }
}

// 放入背包（关闭弹窗）
const viewPackSack = () => {
  close()
}

const close = () => {
  visible.value = false
  emit('close')
}

// 初始化选中项
const initSelectedItems = () => {
  if (resultList.value.length > 0) {
    selectedItems.value = resultList.value.map((_, index) => index)
    console.log('初始化选中项:', selectedItems.value, '物品数量:', resultList.value.length)
  }
}

// 监听visible变化，默认选中所有物品
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 使用 nextTick 确保 DOM 更新后再初始化
    nextTick(() => {
      if (resultList.value.length > 0) {
        initSelectedItems()
      }
      checkShouldCenter()
    })
  } else {
    // 关闭时清空选择
    selectedItems.value = []
  }
})

// 监听 resultList 变化，确保数据更新后重新初始化选中项
watch(() => resultList.value, (newVal, oldVal) => {
  if (props.visible && newVal && newVal.length > 0) {
    // 如果数据发生变化，重新初始化选中项
    if (!oldVal || oldVal.length !== newVal.length) {
      nextTick(() => {
        initSelectedItems()
        checkShouldCenter()
      })
    }
  }
}, { deep: true, immediate: true })

</script>
<template>
  <div>
    <van-popup 
      class="dialog no-scrollbar tw-font-SourceHanSansCN" 
      v-model:show="visible"
      :close-on-click-overlay="false" 
      :lock-scroll="true" 
      teleport="body">
      <div class="">
        <div class="tw-relative tw-w-full tw-h-screen md:tw-gap-32 tw-flex tw-flex-col md:tw-justify-center tw-items-center tw-bg-black tw-bg-opacity-[0.5] tw-px-4">
          <div class="tw-flex tw-items-center tw-gap-3 md:tw-gap-6 tw-mt-[3.25rem] md:tw-mt-[2rem] congratulation-wrap">
            <img :src="lineLeft" alt="">
            <img :src="congratulation" alt="" class="tw-w-[13rem]">
            <img :src="lineRight" alt="">
          </div>

          <!-- 显示数量 -->
          <div class="tw-text-white tw-text-lg tw-mt-2 md:tw-mt-[-6.75rem]">
            共获得 <span class="tw-text-[#FFBD4E] tw-font-bold tw-text-xl">{{ totalCount }}</span> 件物品
            <span class="tw-ml-2">共 <span class="tw-text-[#FFBD4E] tw-font-bold tw-text-xl">{{ totalAllPrice }}</span></span>
          </div>

          <div 
            ref="awardWrapRef"
            class="tw-flex tw-gap-3 tw-flex-nowrap tw-mt-4 md:tw-mt-[-6.75rem] md:tw-gap-4 award-wrap" 
            :class="shouldCenterItems ? 'tw-justify-center' : 'tw-justify-start'"
            style="width: 100%; max-width: 100%; overflow-x: auto; overflow-y: hidden; padding: 0.5rem 1rem; scrollbar-width: thin; min-height: 9rem; height: auto; -webkit-overflow-scrolling: touch;">
            <div 
              v-for="(item, index) in resultList" 
              :key="index"
              class="tw-relative tw-cursor-pointer tw-flex-shrink-0 tw-flex tw-flex-col tw-justify-end tw-items-center award-item md:tw-w-[12rem] md:tw-h-[9rem]"
              style="position: relative;"
              :style="{
                border: selectedItems.includes(index) ? '2px solid #2DD4BF' : '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                boxSizing: 'border-box',
                overflow: 'hidden',
                transform: selectedItems.includes(index) ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s',
                width: '9rem',
                height: '7.5rem',
                position: 'relative',
                padding: '0',
                margin: '0',
                backgroundColor: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }"
              :class="{
                'tw-transition-all tw-duration-200 hover:tw-shadow-lg hover:tw-scale-[1.02]': !selectedItems.includes(index)
              }"
              @click="toggleSelectItem(index)">
              <img 
                :src="item.ornamentLevelImg || item.levelImg || leavel[item.ornamentsLevelId || 4].img"
                class="tw-absolute"
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; min-width: 100%; min-height: 100%; object-fit: cover; border-radius: 6px; z-index: 0; pointer-events: none; display: block; margin: 0; padding: 0;"
                alt="">
              <div class="tw-flex tw-justify-center tw-gap-1 tw-mb-1 tw-absolute tw-top-1 tw-right-1">
                <span
                  class="tw-text-xs tw-text-white tw-px-2 tw-py-px tw-flex tw-items-center tw-gap-px"
                  v-if="item.ornamentsPrice">
                  <img :src="Money" class="tw-h-[16px] md:tw-h-[1.25rem]" /> 
                  {{ item.ornamentsPrice }}
                </span>
              </div>

              <img 
                :src="item.imageUrl"
                class="tw-w-[70%] tw-absolute tw-top-1/2 tw-left-1/2 tw-transform-gpu tw-animate-float"
                alt="">
              <div class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-pb-2 tw-w-[80%] tw-relative">
                <span class="tw-text-[13px]" style="color: rgba(255, 245, 245, 0.80);align-self: flex-start;">
                  {{ parseOrnamentName(item.ornamentName || item.marketHashName || '').sub }}
                </span>
                <span 
                  class="tw-font-bold tw-text-[#FFF5F5] tw-text-[13px] tw-w-full tw-line-clamp-1" 
                  style="align-self: flex-start;"
                  :title="parseOrnamentName(item.ornamentName || item.marketHashName || '').main">
                  {{ parseOrnamentName(item.ornamentName || item.marketHashName || '').main }}
                </span>
              </div>
              <!-- 选中标记 -->
              <div 
                v-if="selectedItems.includes(index)"
                class="tw-absolute tw-top-2 tw-left-2 tw-bg-gradient-to-r tw-from-[#2DD4BF] tw-to-[#14B8A6] tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-text-white tw-shadow-md tw-animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-4 tw-w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div class="tw-flex tw-my-0 md:tw-my-0 tw-justify-center tw-gap-2 md:tw-gap-4 tw-max-w-[32.125rem] tw-w-[80%] tw-relative tw-mt-6 md:tw-mt-[-6.75rem]">
            <div 
              @click="close()"
              class="tw-text-white/50 tw-text-xl tw-absolute tw-left-[-0.375rem] md:tw-left-[-1rem] -tw-translate-x-full -tw-translate-y-[50%] tw-top-1/2 tw-cursor-pointer">
              <svg t="1745850734448" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="1463" width="32" height="32">
                <path
                  d="M512 929.959184c-230.4 0-417.959184-187.559184-417.959184-417.959184s187.559184-417.959184 417.959184-417.959184 417.959184 187.559184 417.959184 417.959184-187.559184 417.959184-417.959184 417.959184z m0-794.122449c-207.412245 0-376.163265 168.75102-376.163265 376.163265s168.75102 376.163265 376.163265 376.163265 376.163265-168.75102 376.163265-376.163265-168.75102-376.163265-376.163265-376.163265z"
                  fill="#e6e6e6" p-id="1464"></path>
                <path
                  d="M355.265306 689.632653c-5.22449 0-10.44898-2.089796-14.628571-6.269388-8.359184-8.359184-8.359184-21.420408 0-29.779592l313.469387-313.469387c8.359184-8.359184 21.420408-8.359184 29.779592 0 8.359184 8.359184 8.359184 21.420408 0 29.779592l-313.469387 313.469387c-4.702041 4.179592-9.926531 6.269388-15.151021 6.269388z"
                  fill="#e6e6e6" p-id="1465"></path>
                <path
                  d="M668.734694 689.632653c-5.22449 0-10.44898-2.089796-14.628572-6.269388l-313.469387-313.469387c-8.359184-8.359184-8.359184-21.420408 0-29.779592 8.359184-8.359184 21.420408-8.359184 29.779592 0l313.469387 313.469387c8.359184 8.359184 8.359184 21.420408 0 29.779592-4.702041 4.179592-9.926531 6.269388-15.15102 6.269388z"
                  fill="#e6e6e6" p-id="1466"></path>
              </svg>
            </div>
            <div 
              @click="viewPackSack"
              class="md:tw-relative tw-w-1/2 tw-py-3 tw-flex tw-justify-center tw-items-center md:tw-text-lg tw-font-bold tw-cursor-pointer tw-text-[#072523] tw-text-center open-again-btn">
              <span class="tw-text-[16px]">放入背包</span>
            </div>
            <div 
              @click="confirmDecompose"
              class="md:tw-relative tw-w-1/2 tw-py-3 md:tw-text-lg tw-font-bold tw-cursor-pointer tw-text-white tw-text-[#072523] tw-flex tw-justify-center tw-items-center tw-gap-1 break-down-btn">
              <span v-if="selectedItems.length > 0 || resultList.length > 0"
                class="tw-font-bold tw-flex tw-items-center tw-text-[16px]">
                <img :src="Money" class="tw-h-[1.4rem] md:tw-h-[1.75rem] tw-mr-[10px]" /> 
                {{ totalDecomposePrice }}
              </span>
              <span class="tw-ml-[20px]">分解</span>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.congratulation-wrap {
  @include mobile {
    img:nth-of-type(1) {
      width: 25%;
    }
    img:nth-of-type(2) {
      width: 46%;
    }
    img:nth-of-type(3) {
      width: 25%;
    }
  }
}

.award-wrap {
  @include mobile {
    // 移动端触摸滑动优化
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x;
    // 确保可以滑动
    overflow-x: auto !important;
    overflow-y: hidden !important;
    // 移除负边距影响，确保从最左开始
    margin-left: -1rem;
    margin-right: -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    width: calc(100% + 2rem);
    // 移动端使用正常间距，不使用负边距
    margin-top: 0 !important;
  }
  // 自定义滚动条样式
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
  .award-item {
    transform: scale(1.0);
    // 不换行，固定宽度
    flex-shrink: 0;
    @include mobile {
      // 移动端确保固定宽度，不被压缩
      min-width: 9rem;
      width: 9rem !important;
    }
  }
}

.tw-animate-float {
  animation: float 6s ease-in-out infinite;
  transform: translate(-50%, -50%);
}

@keyframes float {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  25% {
    transform: translate(-50%, calc(-50% - 5px)) rotate(0.5deg);
  }
  50% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  75% {
    transform: translate(-50%, calc(-50% + 5px)) rotate(-0.5deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
}

.open-again-btn {
  background: url('@/assets/images/login/green_btn.png') no-repeat;
  margin-right: 60px;
  @include mobile {
    margin-right: 20px;
    height: 40px;
    font-size: 14px;
    img {
      margin-right: 5px;
    }
    span {
      margin-left: 6px;
      font-size: 14px;
    }
  }
}

.break-down-btn {
  background: url('@/assets/images/login/yellow_btn.png') no-repeat;
  @include mobile {
    height: 40px;
    font-size: 14px;
    img {
      margin-right: 5px;
    }
    span {
      margin-left: 6px;
      font-size: 14px;
    }
  }
}

.van-popup--center {
  margin: 0;
  width: 100%;
  max-width: 100%;
}

.dialog {
  background: url('@/assets/images/open/open-box-bg.png') no-repeat;
  background-size: cover;
}
</style>

