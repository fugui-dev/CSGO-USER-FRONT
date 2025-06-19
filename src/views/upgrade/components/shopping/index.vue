<script setup>
import { ref, reactive, onMounted } from "vue";
import Box from '@/components/Box/NewBoxs.vue'
import { useShopping } from '../../sever/useShopping'
import bishou from '@/assets/upgrade/shopping/knife.png'
import shouqiang from '@/assets/upgrade/shopping/shouqiang.png'
import buqiang from '@/assets/upgrade/shopping/buqiang.png'
import weichong from '@/assets/upgrade/shopping/weichong.png'
import zhongxing from '@/assets/upgrade/shopping/zhong.png'
import yinhua from '@/assets/upgrade/shopping/yinhua.png'
import xiangzi from '@/assets/upgrade/shopping/xiangzi.png'
import shoutao from '@/assets/upgrade/shopping/shoutao.png'
import Di from '@/assets/openBox/di.png'
import search from '@/assets/upgrade/shopping/search.png'
import BaseButton from '@/components/Btn/BaseButton.vue'
import { useRouter } from 'vue-router'
const mockData = [
  {
    name: '匕首',
    value: '1',
    img: bishou,
    index: 0
  },
  {
    name: '手枪',
    value: '2',
    img: shouqiang,
    index: 1
  }, {
    name: '步枪',
    value: '3',
    img: buqiang,
    index: 2
  }, {
    name: '微型冲锋枪',
    value: '4',
    img: weichong,
    index: 3
  }, {
    name: '重型武器',
    value: '5',
    img: zhongxing,
    index: 4
  }, {
    name: '手套',
    value: '6',
    img: shoutao,
    index: 5
  }, {
    name: '印花',
    value: '7',
    img: yinhua,
    index: 6
  }, {
    name: '武器',
    value: '8',
    img: xiangzi,
    index: 7
  }]

const updata = reactive({
  userInput: '',
  order: 1,
  price: 0,
  select: '-1'
})

const router = useRouter();
const { list, page, loading, getList } = useShopping({ updata })

const changeOrder = () => {
  updata.order = !updata.order
}

const changePrice = () => {
  updata.price = !updata.price
}

const handlePageChange = (val) => {
  page.pageNum = val
}

const fetchData = async () => {
  try {
    await getList()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

const activeCategory = ref(-1)

const choseType = (value, index) => {
  updata.select = value
  activeCategory.value = index
}

// 检测是否为移动设备
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

const handleSearch = () => {
  fetchData()
}
const handleClick = (item) => {
  const data = JSON.stringify(item);
  router.push(`/upgrade/open?data=${data}`)
}
</script>
<template>
  <div class=" tw-flex tw-relative tw-mt-6 tw-w-full  tw-justify-center tw-flex-col tw-items-center   ">
    <!-- <div
      class="tw-mt-6 md:tw-mt-11 tw-grid tw-grid-cols-3 sm:tw-grid-cols-4 md:tw-grid-cols-5 lg:tw-flex tw-justify-between tw-w-full tw-mb-4 md:tw-mb-7 tw-place-content-center tw-px-2 md:tw-px-4">
      <div v-for="(item, index) in mockData" :key="index"
        class="category-item tw-relative tw-cursor-pointer tw-flex tw-justify-center tw-items-center tw-transition-all tw-duration-300 tw-mb-2 md:tw-mb-0"
        :class="{ 'active-category': activeCategory === item.value }" @click="choseType(item.value)">
        <div
          class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-full tw-flex-col tw-flex tw-justify-center tw-items-center">
          <img :src="item.img" class="tw-w-[2rem] tw-h-[2rem] md:tw-w-[3.25rem] md:tw-h-[3.25rem] category-icon" alt="">
          <span class="tw-text-white/80 tw-text-[10px] md:tw-text-xs tw-mt-1 md:tw-mt-2 tw-font-medium category-text">{{
            item.name }}</span>
        </div>
      </div>
    </div> -->
    <div class="tw-flex tw-flex-col ">
      <div class="tw-flex  tw-relative tw-overflow-auto tw-w-[90vw] md:tw-w-[100%] no-scrollbar">
        <div
          class="tw-flex tw-flex-col tw-items-center tw-flex-shrink-0 tw-w-[6.25rem] md:tw-w-[8.125rem] tw-pb-3 hover:tw-text-white tw-justify-center tw-cursor-pointer  tw-gap-2 tw-duration-300"
          :class="activeCategory === index ? 'tw-text-white ' : 'tw-text-white/60 '"
          @click="choseType(item.value, item.index)" v-for="(item, index) in mockData" :key="index">
          <img :src="item.img" class="tw-w-[2.25rem] tw-duration-300 tw-transform"
            :class="index === activeCategory ? ' tw-scale-150' : ' '" alt="">
          <span>{{
            item.name }}</span>
        </div>
      </div>
      <div class="tw-h-0.5 tw-w-full tw-bg-white/20  tw-overflow-hidden tw-hidden md:tw-flex">
        <div class="tw-h-full tw-w-[6.25rem] md:tw-w-[8.125rem] tw-bg-[#F54C36] tw-duration-300"
          :style="{ transform: `translateX(${activeCategory * 100}%)` }">
        </div>
      </div>
    </div>

    <div class="tw-relative tw-mb-4 md:tw-mb-[2.3125rem] tw-w-full  md:tw-px-6">
      <div
        class="search-bar-container tw-w-full tw-flex tw-flex-row tw-justify-end tw-items-end tw-py-2 md:tw-py-3 md:tw-px-6 tw-rounded-xl">
        <div class="tw-gap-2 md:tw-gap-3 tw-flex tw-justify-end tw-items-center tw-w-full sm:tw-w-auto ">
          <div
            class="tw-h-full tw-w-[10rem] sm:tw-w-[14.3125rem] tw-rounded-[41px] tw-overflow-hidden tw-bg-[rgba(255,241,241,0.27)] tw-transition-all tw-duration-300">
            <div class="tw-flex tw-items-center tw-px-3 md:tw-px-6 tw-py-1.5 md:tw-py-2">
              <input type="text" v-model="updata.userInput" placeholder="输入物品名称"
                class="tw-bg-transparent tw-w-full tw-border-none tw-outline-none tw-text-[rgba(255,255,255,0.7)] tw-placeholder-[rgba(255,255,255,0.7)] tw-text-xs md:tw-text-sm tw-font-light"
                style="font-family: 'Source Han Sans CN', sans-serif;" @keyup.enter="handleSearch" />
              <div
                class="tw-flex tw-items-center tw-justify-center tw-w-[1.5rem] tw-h-[1.5rem] tw-cursor-pointer hover:tw-scale-110 tw-duration-200 tw-ml-2"
                @click="handleSearch">
                <img :src="search" class="tw-w-[1.125rem] tw-h-[1.125rem]" alt="搜索">
              </div>
            </div>
          </div>
<!-- 
          <BaseButton :customStyle="{ width: isMobile ? '4.5rem' : '6.5rem', height: isMobile ? '1.75rem' : '2.5625rem' }"
            :font-size="isMobile ? '0.75rem' : '0.875rem'" @click="changeOrder()">
            <template #name>
              品质{{ updata.order ? '升' : '降' }}序
            </template>
          </BaseButton> -->
          <BaseButton @click="changePrice()"
            :customStyle="{ width: isMobile ? '4.5rem' : '6.5rem', height: isMobile ? '1.75rem' : '2.5625rem' }"
            :font-size="isMobile ? '0.75rem' : '0.875rem'">
            <template #name>
              价格{{ updata.price ? '降' : '升' }}序
            </template>
          </BaseButton>
        </div>
      </div>
    </div>
    <div class="tw-flex tw-flex-col tw-items-center tw-w-full">
      <div class=" md:tw-px-2 tw-py-3 md:tw-mx-6"
        :class="{ 'tw-w-full md:tw-px-2': !loading.list || loading.list }">
        <div class=" tw-flex tw-flex-wrap tw-items-start tw-gap-3 md:tw-gap-6 tw-w-full tw-relative tw-justify-center tw-min-h-[15rem] ">
          <div v-if="loading.list"
            class="tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-70 tw-flex tw-items-center tw-justify-center tw-z-10 tw-w-full tw-h-full tw-rounded-xl">
            <div class="loading-spinner"></div>
          </div>
          <template v-if="page.pageTotal > 0">
            <Box v-for="(item, index) in list" :key="index" :boxData="item" class="tw-cursor-pointer" isRound @click="handleClick(item)" />
          </template>
          <div v-else-if="!loading.list"
            class="empty-state tw-col-span-full tw-flex tw-flex-col tw-items-center tw-justify-center tw-w-full tw-h-full tw-py-12 md:tw-py-24">
            <div class="tw-text-base md:tw-text-lg tw-text-white/80 tw-mt-2 md:tw-mt-4">暂无数据</div>
            <div class="tw-text-xs md:tw-text-sm tw-text-white/50 tw-mt-1 md:tw-mt-2">尝试其他筛选条件</div>
          </div>
        </div>
      </div>
      <div
        class="upgrade-shopping tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-2 md:tw-gap-4 tw-mt-4 md:tw-mt-8 tw-mb-6 md:tw-mb-[4.8125rem]">
        <div
          class="pagination-info tw-px-3 md:tw-px-5 tw-h-full tw-text-[10px] md:tw-text-[13px] tw-flex tw-items-center tw-py-1 md:tw-py-1.5 tw-rounded-[0.25rem] tw-text-white">
          共 <span class="tw-font-bold tw-mx-1 total-count">{{ page.pageTotal }}</span> 条
        </div>
        <el-pagination v-if="page.pageTotal > 0" background layout="prev, pager, next" :total="page.pageTotal"
          :current-page="page.pageNum" :page-size="page.pageSize" :small="isMobile" @current-change="handlePageChange"
          class="custom-pagination" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.shopping {
  border: 1px solid rgba(38, 39, 92, 0.3);
  box-shadow: 0 0 20px rgba(38, 39, 92, 0.2);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(circle at 20% 30%, rgba(38, 39, 92, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(38, 39, 92, 0.15) 0%, transparent 50%);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: calc(100% - 1rem);
    padding-bottom: 2rem;
  }

  .category-item {
    position: relative;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    .category-bg {
      filter: brightness(0.8) saturate(0.7);
      transition: all 0.3s ease;
    }

    .category-icon {
      transition: all 0.3s ease;
      filter: drop-shadow(0 0 3px rgba(38, 39, 92, 0.5));
    }

    .category-text {
      transition: all 0.3s ease;
      text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    }

    &:hover {
      transform: translateY(-3px);

      .category-bg {
        filter: brightness(1) saturate(1);
      }

      .category-icon {
        transform: scale(1.1);
      }

      .category-text {
        color: white;
      }
    }

    &.active-category {
      transform: translateY(-5px);

      .category-bg {
        filter: brightness(1.2) saturate(1.2);
      }

      .category-icon {
        transform: scale(1.15);
        filter: drop-shadow(0 0 5px rgba(38, 39, 92, 0.8));
      }

      .category-text {
        color: white;
        font-weight: bold;
        text-shadow: 0 0 8px rgba(38, 39, 92, 0.8);
      }

      &::after {
        content: "";
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        width: 30%;
        height: 3px;
        background: linear-gradient(90deg, transparent, #26275c, transparent);
        border-radius: 3px;
      }
    }
  }

  .search-box {
    box-shadow: 0 0 5px rgba(38, 39, 92, 0.4), inset 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s;

    &:focus-within {
      box-shadow: 0 0 15px rgba(38, 39, 92, 0.7), inset 0 0 10px rgba(0, 0, 0, 0.1);
    }
  }

  .custom-input {
    background-color: rgba(255, 255, 255, 0.9);

    &::placeholder {
      color: rgba(0, 0, 0, 0.5);
    }
  }

  .order-btn {
    background: linear-gradient(135deg, #26275c, #3a3b8c);
    box-shadow: 0 3px 10px rgba(38, 39, 92, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;

    .sort-icon-container {
      display: flex;
      flex-direction: column;
      height: 16px;
      width: 16px;
      position: relative;
      margin-left: 4px;
    }

    .sort-arrow {
      width: 0;
      height: 0;
      position: absolute;
      transition: all 0.3s ease;
      opacity: 0.5;

      &.active {
        opacity: 1;
        transform: scale(1.2);
      }
    }

    .sort-up {
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 5px solid white;
      top: 0;
      left: 3px;
    }

    .sort-down {
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid white;
      bottom: 0;
      left: 3px;
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: all 0.5s ease;
    }

    &:hover::before {
      left: 100%;
    }

    &:hover .sort-arrow:not(.active) {
      opacity: 0.8;
    }

    &:active {
      transform: translateY(2px);
      box-shadow: 0 1px 5px rgba(38, 39, 92, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2);
    }
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(38, 39, 92, 0.3);
    border-top: 4px solid #26275c;
    border-radius: 50%;
    animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {

    0%,
    100% {
      box-shadow: 0 0 5px rgba(38, 39, 92, 0.5);
    }

    50% {
      box-shadow: 0 0 20px rgba(38, 39, 92, 0.8);
    }
  }

  .item-box {
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 0 20px rgba(38, 39, 92, 0.7);
      transform: translateY(-5px);
    }
  }

  // 重置和扩展原有样式
  :deep(.el-input__wrapper) {
    border: none !important;
    box-shadow: none !important;
    background-color: rgba(255, 241, 241, 0.27);
  }

  :deep(.el-select__wrapper) {
    box-shadow: none !important;
  }

  :deep(.el-select__caret) {
    color: #26275c;
  }

  :deep(.el-pager li) {
    background-color: rgba(38, 39, 92, 0.2) !important;
    border: 1px solid #26275c;
    color: #fff !important;
    border-radius: 0.25rem;
    transition: all 0.3s;
    margin: 0 2px;
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: -100%;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(38, 39, 92, 0.5), transparent);
      transition: all 0.3s;
    }

    &:hover {
      transform: translateY(-2px);

      &::before {
        top: 0;
      }
    }
  }

  :deep(.el-pager li.is-active) {
    background-color: rgba(38, 39, 92, 0.4) !important;
    border: 1px solid #26275c;
    border-radius: 0.25rem;
    color: #fff !important;
    font-weight: bold;
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(38, 39, 92, 0.7);
  }

  :deep(.btn-prev),
  :deep(.btn-next) {
    background-color: rgba(38, 39, 92, 0.2) !important;
    border: 1px solid #26275c;
    color: #fff !important;
    border-radius: 0.25rem;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: -100%;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(38, 39, 92, 0.5), transparent);
      transition: all 0.3s;
    }

    &:hover:not(.is-disabled) {
      transform: translateY(-2px);

      &::before {
        top: 0;
      }
    }

    &.is-disabled {
      border-color: #666 !important;
      color: #666 !important;
      cursor: not-allowed;
      opacity: 0.5;
    }

    .el-icon {
      color: #fff !important;
      position: relative;
      z-index: 1;
    }
  }

  .search-bar-container {
    background: linear-gradient(90deg, rgba(38, 39, 92, 0.15) 0%, rgba(38, 39, 92, 0.25) 50%, rgba(38, 39, 92, 0.15) 100%);
    border: 1px solid rgba(38, 39, 92, 0.3);
    box-shadow: 0 0 15px rgba(38, 39, 92, 0.2);
    backdrop-filter: blur(5px);
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(38, 39, 92, 0.8) 50%, transparent 100%);
    }

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(38, 39, 92, 0.8) 50%, transparent 100%);
    }
  }



  .product-item {
    justify-self: center;
    width: 100%;
    max-width: 300px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      transform: translateY(-8px) scale(1.03);
      z-index: 10;
    }

    @media (max-width: 768px) {
      max-width: 95%;
    }
  }

  .empty-state {
    background: rgba(38, 39, 92, 0.1);
    border-radius: 1rem;
    border: 1px dashed rgba(38, 39, 92, 0.3);
    position: relative;
    overflow: hidden;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 200%;
      height: 100%;
      background: linear-gradient(90deg,
          transparent 0%,
          rgba(38, 39, 92, 0.1) 25%,
          rgba(38, 39, 92, 0.1) 50%,
          transparent 75%);
      animation: shimmer 3s infinite linear;
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(0);
    }

    100% {
      transform: translateX(50%);
    }
  }

  .pagination-info {
    background: rgba(38, 39, 92, 0.3);
    border: 1px solid rgba(38, 39, 92, 0.5);
    box-shadow: 0 0 10px rgba(38, 39, 92, 0.2);

    .total-count {
      color: #fff;
      text-shadow: 0 0 5px rgba(38, 39, 92, 0.8);
    }
  }

  // 移动设备上的分页样式
  @media (max-width: 768px) {
    :deep(.el-pagination) {

      .btn-prev,
      .btn-next,
      .el-pager li {
        min-width: 24px;
        height: 24px;
        line-height: 24px;
        font-size: 12px;
      }

      .el-pager li {
        margin: 0 1px;
      }
    }
  }
}

.box {
  box-shadow: 0px 2px 10px 0px rgba(38, 39, 92, 0.75);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0px 5px 15px 0px rgba(38, 39, 92, 0.9);
  }
}

// 添加一些高级动画效果
@keyframes glow {

  0%,
  100% {
    box-shadow: 0 0 5px rgba(38, 39, 92, 0.5);
  }

  50% {
    box-shadow: 0 0 20px rgba(38, 39, 92, 0.8);
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}
</style>
