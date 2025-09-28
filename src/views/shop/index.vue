<template>
  <Layout>
    <template #item>
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
            <div class="button" @click="handleAmmunitionConversion">
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
              :box-data="item"
              @click="handleCommodityExchange(item)"
            />
          </div>
        </el-scrollbar>
      </div>
      <BaseDialog
        ref="dialogRef"
        title="弹药转换"
        :show-confirm="true"
        @confirm="converseAmmunition"
      >
        <template #default>
          <div style="display: flex; align-items: center; height: 100%">
            <el-input v-model="credits" placeholder="请输入转换数量" />
          </div>
        </template>
      </BaseDialog>
      <BaseDialog
        ref="confirmRef"
        title="兑换商品"
        :show-confirm="true"
        :show-cancel="true"
        @cancel="closeConfirm"
        @confirm="exchangecommodity"
      >
        <div class="confirm-tip">确定要兑换该商品吗</div>
      </BaseDialog>
    </template>
  </Layout>
</template>

<script setup>
import Layout from "@/components/Layout.vue";
import BaseDialog from "@/components/dialogs/BaseDialog.vue";
import { useStore } from "@/store/index.js";
import { useUserInfo } from "@/composables/useUesrInfo.js";
import { category } from "@/views/options.js";
import { nextTick, onMounted, ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import boxItem from "./components/BoxItem.vue";
import {
  getShopList,
  commodityExchange,
  ammunitionConversion,
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
const credits = ref("");
import { ElMessage } from "element-plus";
const handleAmmunitionConversion = () => {
  if (!store.isLogin) {
    ElMessage.warning("请先登录");
    return;
  }
  credits.value = "";
  dialogRef.value.open();
};
const { fetchUserInfo } = useUserInfo();
const converseAmmunition = () => {
  if (!credits.value || isNaN(credits.value) || credits.value <= 0) {
    ElMessage.warning("请输入正确的转换数量");
    return;
  }
  ammunitionConversion({ credits: credits.value }).then((res) => {
    if (res.code === 200) {
      ElMessage.success("转换成功");
      fetchUserInfo(); // 刷新用户信息
      dialogRef.value.close();
    }
  });
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
const closeConfirm = () => {
  confirmRef.value.close();
};
const exchangecommodity = () => {
  commodityExchange({ ornamentsId: activeId.value }).then((res) => {
    if (res.code === 200) {
      ElMessage.success("兑换成功");
      fetchUserInfo(); // 刷新用户信息
      confirmRef.value.close();
    }
  });
};
</script>

<style scoped lang="scss">
.shop-wrapper {
  width: 100%;
  .header-wrapper {
    width: 100%;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-sizing: border-box;
    .select {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      flex: 1;
      &-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        margin-right: 20px;
        .el-input {
          width: 120px;
          --el-input-text-color: #fff;
          --el-input-placeholder-color: #fff;
          :deep(.el-input__wrapper) {
            background-color: #fff0f03d;
            border: 1px solid #e39c33;
            box-shadow: none !important;
          }
        }
        .el-select {
          width: 120px;
          --el-select-input-focus-border-color: none;
          --el-input-text-color: #fff;
          :deep(.el-select__wrapper) {
            background-color: #fff0f03d;
            border: 1px solid #e39c33;
            box-shadow: none !important;
          }
        }
      }
    }
    .right-wrapper {
      display: flex;
      align-items: center;
      .count {
        font-size: 14px;
        color: #fff;
      }
      .button {
        font-size: 12px;
        min-width: 26px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px 16px;
        color: #ffffffcc;
        width: fit-content;
        background: linear-gradient(
          200deg,
          rgba(255, 225, 225, 0.2) 32.92%,
          rgba(255, 0, 0, 0.2) 87.52%
        );
        border-radius: 25px;
        border: 1px solid #fc523a;
        cursor: pointer;
        flex-shrink: 0;
        margin-left: 15px;
      }
    }
  }
  .list-wrapper {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding: 10px 20px;
    box-sizing: border-box;
    gap: 20px;
  }
}
.confirm-tip {
  text-align: center;
}
</style>
