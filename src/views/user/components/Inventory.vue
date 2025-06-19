<script setup>

import {computed, ref, watch} from "vue";
import {deliverPackSackApi, getExtractPackSackApi, getPackSackApi, getPackSackGlobalDataApi} from "@/api";
import {useDebounceFn, useThrottleFn} from "@vueuse/core";
import {ElMessage} from "element-plus";
import {goto} from "@/utils/common";
import NewBoxs from "@/components/Box/NewBoxs.vue";
import {postDecompose} from "@/views/openBox/server/api";
import Money from '@/assets/icons/money.svg'
import {useUserInfo} from '@/composables/useUesrInfo'

const active = ref(0)
const list = ref([])
const loading = ref(false)
const total = ref({
  totalOrnamentNumber: 0,
  totalOrnamentPrice: 0,
})
const form = ref({
  page: 1,
  size: 20,
  orderByFie: 2,
  orderByType: 2
})
const tabs = ref([
  {
    label: '我的库存',
    value: 0
  },
  // {
  //   label: '领取中',
  //   value: 1
  // },
  {
    label: '领取记录',
    value: 2
  },
])

const onChoose = (item) => {
  if (active.value === 0) {
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
  if (active.value === 0) {
    api = getPackSackApi
  } else if (active.value === 2) {
    api = getExtractPackSackApi
  } else {
    loading.value = false
    return
  }
  api(form.value).then(res => {
    if (res.data && res.data.length) {
      if (form.value.page === 1) {
        list.value = []
      }
      list.value.push(...res.data)
      if (listRef.value.clientHeight < scrollRef.value.$el.clientHeight) {
        form.value.page += 1
        getList()
      }
    } else {
      isComplete.value = true
    }
  }).finally(() => {
    loading.value = false
  })
}
getTotal()
getList()
const scrollRef = ref()
const listRef = ref()
const isComplete = ref(false)

const debouncedGetList = useDebounceFn(() => {
  if (!isComplete.value) {
    form.value.page += 1
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
  getTotal()
  getList()
})

const changeSort = () => {
  form.value.orderByFie = form.value.orderByFie == 2 ? 1 : 2
  form.value.page = 0
  list.value = []
  isComplete.value = false
  debouncedGetList()
}

const totalDecomposePrice = computed(() => {
  return list.value
    .filter(item => item.choosed)
    .reduce((total, item) => total + (item.ornamentsPrice || 0), 0)
    .toFixed(2);
});

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
          <div @click="changeSort" style="color: #f7ba2a;line-height: 1.5em;cursor: pointer;margin-right: 15px">
            价格{{ form.orderByFie == 1 ? '升序 ↑' : '降序 ↓' }}</div>
          <div>库存饰品总数：{{ total.totalOrnamentNumber }}</div>

        </div>
        <div style="display: flex;align-items: center;flex-wrap: wrap;justify-content: flex-end">
          <el-checkbox style="--el-checkbox-text-color:#fff;--el-color-primary:rgb(138, 15, 198)"
            @change="checkBoxChange" v-model="checkAll">
            全选
          </el-checkbox>
          <div class="button" @click="handleDelivery">
            提取
          </div>
          <div class="button" @click="goto('/smelt')">熔炼饰品</div>
          <div class="button" @click="handleDecompose">分解饰品 <img :src="Money" class="tw-h-[16px] md:tw-h-[1.5rem]" /> {{
            totalDecomposePrice }}</div>
        </div>
      </div>
    </div>
    <el-scrollbar height="600px" @scroll="onScroll" ref="scrollRef" v-loading="loading">
      <div class="inventory_list" ref="listRef">
        <!--          <div class="weapon" v-for="(i,index) in list" :class="{'choose':i.choosed}"-->
        <!--               :title="i.ornamentName"-->
        <!--               :style="{backgroundImage:'url('+i.levelImg+')'}" :key="index" @click="onChoose(i)">-->
        <!--            <img :src="i.imageUrl" alt="">-->
        <!--            <div class="weapon-name ellipsis">{{ i.ornamentName|| '' }}</div>-->
        <!--            <div class="price">{{ i.exteriorName }}</div>-->
        <!--          </div>-->
        <NewBoxs class="wq" v-for="(i, index) in list" :class="{ 'choose': i.choosed }" :title="i.ornamentName"
          :key="index" @click="onChoose(i)" :box-data="i" show-price></NewBoxs>
      </div>
    </el-scrollbar>
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
    color: #FFFFFFCC;

    width: fit-content;
    background: linear-gradient(200deg, rgba(255, 225, 225, 0.2) 32.92%, rgba(255, 0, 0, 0.2) 87.52%);
    border-radius: 25px;
    border: 1px solid #FC523A;
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 15px;

    &:last-child {
      background: linear-gradient(117.41deg, rgba(255, 250, 225, 0.2) 32.92%, rgba(255, 191, 0, 0.2) 87.52%);
      border: 1px solid #FF7A21
    }

    &:nth-child(3) {
      background: linear-gradient(117.41deg, rgba(255, 250, 225, 0.2) 32.92%, rgba(255, 191, 0, 0.2) 87.52%);
      border: 1px solid #FCC53A
    }

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
      z-index: 10;
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

  .inventory_list {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    margin: 10px;

    @include maxWidth(521px) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      place-items: center;
      margin: 0;
    }
  }
}
</style>
