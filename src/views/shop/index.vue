<template>
  <Layout>
    <div class="shop-wrapper">
      <div class="header-wrapper">
        <div class="select">
          <div class="select-item">
            <div class="select-item-name">名称：</div>
            <el-input
              v-model="search.name"
              placeholder="请输入名称"
              @change="handleSearch((e) => handleSearch('name', e))"
            />
          </div>
          <div class="select-item">
            <div class="select-item-name">种类：</div>
            <el-select
              v-model="search.type"
              placeholder="不限"
              @change="handleSearch((e) => handleSearch('type', e))"
            >
              <el-option
                v-for="item in typeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
                class="options"
              />
            </el-select>
          </div>
          <div class="select-item">
            <div class="select-item-name">外观：</div>
            <el-select
              v-model="search.exterior"
              placeholder="不限"
              @change="handleSearch((e) => handleSearch('exterior', e))"
            >
              <el-option
                v-for="item in exteriorList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
                class="options"
              />
            </el-select>
          </div>
          <div class="select-item">
            <div class="select-item-name">排序：</div>
            <el-select
              v-model="search.sortBy"
              placeholder="不限"
              @change="handleSearch((e) => handleSearch('sortBy', e))"
            >
              <el-option
                v-for="item in category.sortBy"
                :key="item.value"
                :label="item.name"
                :value="item.value"
                class="options"
              />
            </el-select>
          </div>
          <div class="select-item">
            <div class="select-item-name">筛选：</div>
            <el-select
              v-model="affordableFilter"
              placeholder="全部"
              @change="handleAffordableFilterChange"
            >
              <el-option
                label="全部"
                :value="false"
                class="options"
              />
              <el-option
                label="可购买饰品"
                :value="true"
                class="options"
              />
            </el-select>
          </div>
          <div class="select-item">
            <div class="select-item-name">
              价格区间：
              <el-input
                v-model="search.minPrice"
                placeholder="最低价格"
                @change="handleSearch((e) => handleSearch('minPrice', e))"
              />
              -
              <el-input
                v-model="search.maxPrice"
                placeholder="最高价格"
                @change="handleSearch((e) => handleSearch('maxPrice', e))"
              />
            </div>
          </div>
        </div>
        <div class="right-wrapper" style="display: none;">
          <!-- 弹药余额和转换按钮已移至导航栏 -->
        </div>
      </div>
      <div class="content-wrapper" v-loading="loading" element-loading-background="transparent">
        <div class="list-wrapper" ref="listRef">
          <boxItem
            v-for="(item, index) in list"
            :key="'boxData' + index"
            :is-shop="true"
            :box-data="item"
            @click="handleCommodityExchange(item)"
          />
        </div>
        <!-- 分页组件 -->
        <div class="pagination-wrapper" v-if="total > 0">
          <el-pagination
            v-model:current-page="search.pageNum"
            v-model:page-size="search.pageSize"
            :page-sizes="[12, 24, 48, 96]"
            :total="total"
            :layout="isPC ? 'total, sizes, prev, pager, next': 'total,prev, pager, next'"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
            background
            :hide-on-single-page="false"
            :size="isPC ? 'default': 'small'"
          />
        </div>
      </div>
    </div>
    <convertDialog ref="dialogRef" />
    <confirmDialog
      ref="confirmRef"
      :id="activeId"
      @close="closeConfirm" />
  </Layout>
</template>

<script setup>
import Layout from "@/components/Layout.vue";
import BaseDialog from "@/components/dialogs/BaseDialog.vue";
import { useStore } from "@/store/index.js";
import { category } from "@/views/options.js";
import { onMounted, ref, computed } from "vue";
import boxItem from "@/views/openBox/components/boxItem.vue";
import convertDialog from "./components/convertDialog.vue";
import confirmDialog from "./components/confirmDialog.vue";
import {
  getShopList,
  getExteriorList,
  getTypeList,
} from "@/api/shop";
const store = useStore();
const list = ref([]);
const typeList = ref([]);
const exteriorList = ref([]);
const total = ref(0);
const affordableFilter = ref(false); // 筛选选项：false-全部，true-可购买饰品
const search = ref({
  pageNum: 1,
  pageSize: 24,
  name: "",
  type: "",
  exterior: "",
  sortBy: "",
  maxPrice: "",
  minPrice: "",
  affordable: false, // 是否只显示可购买饰品
});

const isPC = computed(()=>{
  return store.isPC
})
const handleSearch = (type, val) => {
  search.value[type] = val;
  search.value.pageNum = 1; // 重置到第一页
  getList();
};

// 筛选选项变化处理
const handleAffordableFilterChange = () => {
  search.value.affordable = affordableFilter.value;
  search.value.pageNum = 1; // 重置到第一页
  getList();
};
const loading = ref(false);
const listRef = ref();
const getList = () => {
  if (loading.value) return;
  loading.value = true;
  getShopList(search.value)
    .then((res) => {
      if (res && res.rows) {
        list.value = res.rows || [];
        total.value = res.total || 0;
      } else {
        list.value = [];
        total.value = 0;
      }
    })
    .catch((error) => {
      console.error('获取商城列表失败:', error);
      list.value = [];
      total.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
};
// 分页大小变化
const handleSizeChange = (val) => {
  search.value.pageSize = val;
  search.value.pageNum = 1; // 重置到第一页
  getList();
};
// 页码变化
const handlePageChange = (val) => {
  // 确保页码有效
  if (!val || val < 1) {
    search.value.pageNum = 1;
  } else {
    // 计算最大页码
    const maxPage = Math.ceil(total.value / search.value.pageSize);
    if (val > maxPage) {
      search.value.pageNum = maxPage || 1;
    } else {
      search.value.pageNum = val;
    }
  }
  getList();
  // 滚动到顶部
  if (listRef.value) {
    listRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
// 获取种类和外观列表
const loadCategoryData = async () => {
  try {
    const [typeRes, exteriorRes] = await Promise.all([
      getTypeList(),
      getExteriorList(),
    ]);
    
    if (typeRes.code === 200 && typeRes.data) {
      typeList.value = [
        { name: "不限", value: "" },
        ...typeRes.data.map(item => ({
          name: item.name,
          value: item.value,
        })),
      ];
    }
    
    if (exteriorRes.code === 200 && exteriorRes.data) {
      exteriorList.value = [
        { name: "不限", value: "" },
        ...exteriorRes.data.map(item => ({
          name: item.name,
          value: item.value,
        })),
      ];
    }
  } catch (error) {
    console.error("获取种类和外观列表失败:", error);
  }
};

onMounted(() => {
  loadCategoryData();
  getList();
});

const dialogRef = ref();
import { ElMessage } from "element-plus";
const handleAmmunitionConversion = () => {
  if (!store.isLogin) {
    ElMessage.warning("请先登录");
    return;
  }
  dialogRef.value.open();
};
const activeId = ref(null);
const confirmRef = ref();
const handleCommodityExchange = (item) => {
  if (!store.isLogin) {
    ElMessage.warning("请先登录");
    return;
  }
  activeId.value = item.id;
  confirmRef.value.open();
};
</script>

<style scoped lang="scss">
@use "@/style" as *;

.shop-wrapper {
  padding: 68px 37px 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: url("@/assets/images/shop/bg.webp") no-repeat;
  background-size: 100% auto;
  background-color: rgba(144, 136, 129);
  min-height: 100vh;
  width: 100%;
  font-weight: 500;
  font-family: "PingFang Medium";
  @include mobile {
    padding: 58px 10px;
  }
  .header-wrapper {
    width: 1260px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40px 0;
    font-size: 17px;
    @include mobile {
      width: 100%;
      font-size: 14px;
    }
    .select {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      flex: 1;
      gap: 16px 33px;
      @include mobile {
        gap: 10px;
      }
      &-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        margin-right: 20px;
        .el-input {
          width: 139px;
          height: 40px;
          --el-input-text-color: #fff;
          --el-input-placeholder-color: #fff;
          @include mobile {
            width: 100px;
            height: 32px;
          }
          :deep(.el-input__wrapper) {
            background-color: #1d3337;
            border: 0;
            border-radius: 20px;
            box-shadow: none !important;
          }
        }
        .el-select {
          width: 139px;
          height: 40px;
          --el-select-input-focus-border-color: none;
          --el-input-text-color: #fff;
          --el-text-color-placeholder: #fff;
          @include mobile {
            width: 100px;
            height: 32px;
          }
          :deep(.el-select__wrapper) {
            height: 40px;
            background-color: #1d3337;
            border: 0;
            border-radius: 20px;
            box-shadow: none !important;
            @include mobile {
              height: 32px;
              border-radius: 16px;
            }
          }
        }
      }
    }
    .right-wrapper {
      margin-left: 20px;
      width: 350px;
      .count {
        text-align: center;
        color: #072523;
      }
      .button {
        cursor: pointer;
        margin: 16px auto 0;
        font-size: 19px;
        color: #072523;
        width: 214px;
        height: 60px;
        line-height: 55px;
        background: url("@/assets/images/battle/creat-bg.png") no-repeat;
        background-size: 100% 100%;
        .icon {
          width: 37px;
          height: 38px;
          margin: 7px 12px 0 28px;
        }
      }
    }
  }
  .content-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .list-wrapper {
    width: 1260px;
    max-width: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
    padding: 26px;
    background-color: rgb(51, 56, 57, 0.28);
    border-radius: 22px;
    box-sizing: border-box;
    justify-items: center;
    min-height: 400px;
    @include mobile {
      gap: 7px;
      padding: 10px 0;
    }
  }
  
  @media (max-width: 1400px) {
    .list-wrapper {
      grid-template-columns: repeat(5, 1fr);
    }
  }
  
  @media (max-width: 1200px) {
    .list-wrapper {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  @media (max-width: 900px) {
    .list-wrapper {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  @media (max-width: 600px) {
    .list-wrapper {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .pagination-wrapper {
    margin-top: 30px;
    margin-bottom: 30px;
    display: flex;
    justify-content: center;
    @include mobile {
      width: 100%;
    }
    :deep(.el-pagination) {
      --el-pagination-button-color: #fff;
      --el-pagination-text-color: #fff;
      --el-pagination-bg-color: rgba(29, 51, 55, 0.8);
      --el-pagination-border-radius: 8px;
      @include mobile {
        width: 100%;
      }
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
}
.confirm-tip {
  text-align: center;
}

// 隐藏 loading 背景遮罩，只显示加载图标
:deep(.el-loading-mask) {
  background-color: transparent !important;
}
</style>
