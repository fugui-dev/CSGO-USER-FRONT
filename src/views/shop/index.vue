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
                v-for="item in category.type"
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
                v-for="item in category.exterior"
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
        <div class="right-wrapper">
          <div class="count" v-if="store.isLogin">
            弹药余额：{{ store.userInfo?.accountCredits }}
          </div>
          <div class="button tw-flex" @click="handleAmmunitionConversion">
            <img class="icon" src="@/assets/images/shop/ammunition.png" alt="">
            弹药转换
          </div>
        </div>
      </div>
      <el-scrollbar
        height="800px"
        @scroll="onScroll"
        ref="scrollRef"
        v-loading="loading"
      >
        <div class="list-wrapper" ref="listRef">
          <boxItem
            v-for="(item, index) in list"
            :key="'boxData' + index"
            :is-shop="true"
            :box-data="item"
            @click="handleCommodityExchange(item)"
          />
        </div>
      </el-scrollbar>
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
import { nextTick, onMounted, ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import boxItem from "@/views/openBox/components/boxItem.vue";
import convertDialog from "./components/convertDialog.vue";
import confirmDialog from "./components/confirmDialog.vue";
import {
  getShopList,
} from "@/api/shop";
const store = useStore();
const list = ref([]);
const search = ref({
  pageNum: 1,
  pageSize: 10,
  name: "",
  type: "",
  exterior: "",
  sortBy: "",
  maxPrice: "",
  minPrice: "",
});
const handleSearch = (type, val) => {
  search.value[type] = val;
  resetList();
};
const resetList = () => {
  search.value.pageNum = 0;
  isComplete.value = false;
  debouncedGetList();
};
const debouncedGetList = useDebounceFn(() => {
  if (!isComplete.value) {
    search.value.pageNum += 1;
    getList();
  }
}, 300);
const loading = ref(false);
const isComplete = ref(false);
const listRef = ref();
const scrollRef = ref();
const onScroll = (e) => {
  if (!isComplete.value) {
    debouncedGetList();
  }
};
const getList = () => {
  if (loading.value) return;
  loading.value = true;
  getShopList(search.value)
    .then((res) => {
      loading.value = false;
      if (search.value.pageNum === 1) {
        list.value = [];
      }
      if (res.rows && res.rows.length) {
        list.value.push(...res.rows);
        if (list.value.length >= res.total) {
          isComplete.value = true;
        }
        nextTick(() => {
          if (
            !isComplete.value &&
            listRef.value.clientHeight < scrollRef.value.$el.clientHeight
          ) {
            search.value.pageNum += 1;
            getList();
          }
        });
      }
    })
    .finally(() => {
      loading.value = false;
    });
};
getList();
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
  .header-wrapper {
    width: 1260px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40px 0;
    font-size: 17px;
    .select {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      flex: 1;
      gap: 16px 33px;
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
          :deep(.el-select__wrapper) {
            height: 40px;
            background-color: #1d3337;
            border: 0;
            border-radius: 20px;
            box-shadow: none !important;
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
  .list-wrapper {
    width: 1260px;
    display: flex;
    flex-wrap: wrap;
    padding: 26px 152px;
    gap: 3px 6px;
    background-color: rgb(51, 56, 57, 0.28);
    border-radius: 22px;
  }
}
.confirm-tip {
  text-align: center;
}
</style>
