<script setup>


import Layout from "@/components/Layout.vue";
import {requireImg} from "@/utils/common";
import OpenBagModal from "@/views/openBox/components/OpenBagModal.vue";
import {computed, readonly, ref} from "vue";
import {useDebounceFn} from "@vueuse/core";
import {getPackSackApi, getShopListApi, smeltApi} from "@/api";
import {ElMessage} from "element-plus";
import NewBoxs from "@/components/Box/NewBoxs.vue";
import {useStore} from "@/store";
import SmeltShopModal from "@/views/smelt/SmeltShopModal.vue";

const store = useStore()

const pagePack = ref({
  page: 1,
  size: 16,
  total: 0,
  loading: false,
  isComplete: false,
  orderByFie: 1,
  orderByType: 2,
  statusList: [0]
})
const packList = ref([])

const selectPackIds = ref([])
const selectedList = ref([])
const openBagModalRef = ref()
const form = ref({
  exterior: null,
  type: null,
  sortBy: '2',
  minPrice: null,
  maxPrice: null,
  pageNum: 1,
  pageSize: 20
})
const category = readonly({
  exterior: [//外观（1崭新出厂 2略有磨损 3久经沙场 4残损不堪 5战痕累累 6无涂装）
    {
      name: '不限',
      value: null
    },
    {
      name: '崭新出厂',
      value: 1,
    },
    {
      name: '略有磨损',
      value: 2,
    },
    {
      name: '久经沙场',
      value: 3,
    },
    {
      name: '残损不堪',
      value: 4,
    },
    {
      name: '战痕累累',
      value: 5,
    },
    {
      name: '无涂装',
      value: 6,
    },
  ],
  type: [//武器类型（1匕首 2手枪 3步枪 4微型冲锋枪 5重型武器 6手套 7印花 8其它）
    {
      name: '不限',
      value: null
    },
    {
      name: '匕首',
      value: 1,
    },
    {
      name: '手枪',
      value: 2,
    },
    {
      name: '步枪',
      value: 3,
    },
    {
      name: '微型冲锋枪',
      value: 4,
    },
    {
      name: '重型武器',
      value: 5,
    },
    {
      name: '手套',
      value: 6,
    },
    {
      name: '印花',
      value: 7,
    },
    {
      name: '其它',
      value: 8,
    },
  ]
})
const handleOpenBagConfirm = ({selectedIds, totalPrice, selectedItems}) => {
  console.log('选中的物品：', selectedItems)
  console.log('选中的物品ID：', selectedIds)
  console.log('选中物品总价格：', totalPrice)
  // selectedList.value = selectedItems
  // form.value.minPrice = totalPrice * 0.5
  // form.value.maxPrice = totalPrice * 0.9
  selectPackIds.value = []
  form.value.minPrice = 0
  form.value.maxPrice = 0
  selectedItems.forEach(item => {
    if (packList.value.findIndex(i=>i.id === item.id) === -1) {
      packList.value.push(item)
    }
    handleSelectPack(item)
  })
  resetList()
}

const getPackList = () => {
  if (pagePack.value.loading) return
  pagePack.value.loading = true
  getPackSackApi(pagePack.value).then(res => {
    pagePack.value.total = res.total
    packList.value = res.data
  }).finally(() => {
    pagePack.value.loading = false
  })
}
getPackList()

const handleSelectPack = (item) => {
  let min = 0.9
  let max = 1
  if (selectPackIds.value.includes(item.id)) {
    selectPackIds.value = selectPackIds.value.filter(id => id !== item.id)
    form.value.minPrice = form.value.minPrice - item.ornamentsPrice * min
    form.value.maxPrice = form.value.maxPrice - item.ornamentsPrice * max
  } else {
    selectPackIds.value.push(item.id)
    form.value.minPrice = form.value.minPrice + item.ornamentsPrice * min
    form.value.maxPrice = form.value.maxPrice + item.ornamentsPrice * max
  }
  resetList()
  console.log(selectPackIds.value, item.id)

}

const handleOpenBag = () => {
  console.log(openBagModalRef.value)
  openBagModalRef.value.open()
}

const handleSelectExterior = (val) => {
  form.value.exterior = val
  resetList()
}
const handleSelectType = (val) => {
  form.value.type = val
  resetList()
}


const handlePagePackChange = (val) => {
  pagePack.value.page = val
  getPackList()
}


const scrollRef = ref()
const listRef = ref()
const isComplete = ref(false)
const list = ref([])
const loading = ref(false)
const selectId = ref()

const onScroll = (e) => {
  let scrollBarHeight = scrollRef.value.$el.querySelector(".el-scrollbar__bar:last-child .el-scrollbar__thumb").clientHeight || 200
  if (listRef.value && e.scrollTop) {
    if (e.scrollTop + scrollBarHeight + 500 >= listRef.value.clientHeight) {
      debouncedGetList()
    }
  }
}

const resetList = () => {
  form.value.pageNum = 0
  selectId.value = null
  isComplete.value = false
  debouncedGetList()
}

const debouncedGetList = useDebounceFn(() => {
  if (!isComplete.value) {
    form.value.pageNum += 1
    getList()
  }
}, 300)


const getList = () => {
  if (loading.value) return
  if (selectPackIds.value.length === 0) {
    list.value = []
    selectId.value = null
    return
  }
  loading.value = true

  getShopListApi(form.value).then(res => {
    if (form.value.pageNum === 1) {
      list.value = []
    }
    if (res.rows && res.rows.length) {
      console.log(form.value.pageNum)
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
const selectShopItem = computed(() => {
  return list.value.find(item => item.id === selectId.value)
})

const selectPackItems = computed(() => {
  return packList.value.filter(item => selectPackIds.value.includes(item.id))
})
const onChoose = (item) => {
  if (item.id === selectId.value) {
    selectId.value = null
  } else {
    selectId.value = item.id
  }

}

getList()

const showPopup = ref(false)
const handleSmelt = () => {
  if (selectPackIds.value.length === 0) {
    ElMessage.warning('请选择背包饰品')
    return
  }
  if (!selectId.value) {
    ElMessage.warning('请选择熔炼目标')
    return
  }
  let data = {
    "packageIds": selectPackIds.value,
    "targetOrnament": selectId.value
  }
  smeltApi(data).then(res => {
    showPopup.value = true
  })

}

const closePopup = () => {

  selectPackIds.value = []
  selectShopItem.value = null
  list.value = []
  pagePack.value.page = 1
  form.value.pageNum = 1
  form.value.minPrice = 0
  form.value.maxPrice = 0
  form.value.exterior = null
  form.value.type = null

  getPackList()
}

const smeltShopModalRef = ref()
const openSmeltShop = () => {
  if (selectPackIds.value.length === 0) {
    ElMessage.warning('请选择背包饰品')
    return
  }
  smeltShopModalRef.value.open()
}
const handleSmeltShopModalConfirm = ({selectedIds, totalPrice, selectedItems}) => {
  console.log(selectedIds, totalPrice, selectedItems)
  selectId.value = selectedIds[0] || null
}

</script>

<template>
  <Layout :style="{
    '--bg-select':requireImg('/smelt/bg-select.png',true),

  }">
    <template #item>
      <div class="smelt">
        <div style="display:flex;flex-direction: column;" v-show="store.isPC">
          <div class="self-title">
            <span>我的饰品</span>
            <div></div>
          </div>
          <div class="smelt-container">
            <el-scrollbar style="height: 80vh">
              <div class="wq">
                <NewBoxs class="item" v-for="(i,index) in packList" :class="{'choose':selectPackIds?.includes(i.id)}"
                         :key="index" @click="handleSelectPack(i)" :title="i.ornamentName" :box-data="i">

                </NewBoxs>

              </div>
            </el-scrollbar>
            <el-pagination
                background
                layout="prev, pager, next"
                :total="pagePack.total"
                :current-page="pagePack.page"
                :page-size="pagePack.size"
                @current-change="handlePagePackChange"
                class="page"
                pager-count="4"
            />
          </div>
        </div>

        <div class="status">
          <div class="img">
            <img class="img-bg" :src="requireImg('/v2/smelt/rl.png')" alt="">
            <div class="result" v-if="selectShopItem" :style="{backgroundImage:requireImg('/v2/smelt/jg-bg.png',true)}">
              <img :src="selectShopItem.imageUrl" alt="">
              <div class="close" @click="selectId=null">x</div>
            </div>
            <div class="pack_select_btn yellow" @click="handleOpenBag">选择背包饰品</div>
            <div class="pack_select_btn " @click="openSmeltShop">选择目标饰品</div>
            <div class="select_list">
              <el-scrollbar>
                <div class="result_list_box">
                  <div class="result" :style="{backgroundImage:requireImg('/v2/smelt/bb-bg.png',true)}"
                       v-for="i in selectPackItems">
                    <img :src="i.imageUrl" alt="">
                    <div class="close" @click="handleSelectPack(i)">x</div>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </div>

          <div class="confirm" @click="handleSmelt"></div>
        </div>
        <div class="shop" v-show="store.isPC">
          <div class="self-title orange">
            <span>熔炼饰品库</span>
            <div></div>
          </div>
          <div class="smelt-container">

            <div class="select">
              <div class="select-item">
                <div class="select-item-name">种类：</div>
                <el-select
                    v-model="form.type"
                    class="m-2"
                    placeholder="不限"
                    size="large"
                    @change="resetList"
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
                    v-model="form.exterior"
                    class="m-2"
                    placeholder="不限"
                    size="large"
                    @change="resetList"

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

            </div>
            <el-scrollbar height="75vh" @scroll="onScroll" ref="scrollRef" v-loading="loading">
              <div class="wq" ref="listRef">
                <NewBoxs class="item" v-for="(i,index) in list" :class="{'choose':selectId===i.id}" :is-smelt="true"
                         :key="index" @click="onChoose(i)" :title="i.ornamentName" :box-data="i">

                </NewBoxs>
              </div>
            </el-scrollbar>
          </div>
          <SmeltShopModal ref="smeltShopModalRef" v-model:form="form" @confirm="handleSmeltShopModalConfirm"/>
        </div>

      </div>
      <OpenBagModal ref="openBagModalRef"
                    @confirm="handleOpenBagConfirm"/>
    </template>


  </Layout>

  <van-popup v-model:show="showPopup" teleport="body" style="background:transparent;max-width: 100vw"
             @close="closePopup">
    <div class="succ" v-if="selectShopItem" @click="showPopup=false">
      <img class="bgg" :src="requireImg('/v2/smelt/succ-bg.png')" alt="">
      <img class="tit" :src="requireImg('/v2/smelt/succ-tit.png')" alt="">
      <div class="name">{{ selectShopItem.ornamentName }}</div>
      <img class="wq" :src="selectShopItem.imageUrl" alt="">
    </div>

  </van-popup>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.pack_select_btn {
  display: none;
  @include mobile {
    background: linear-gradient(99.19deg, rgba(166, 131, 131, 0.4) 5.46%, rgba(255, 34, 0, 0.4) 86.69%);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    border-radius: 22px;
    font-size: 12px;
    width: fit-content;
    padding: 0 10px;
    position: absolute;
    left: 50%;
    top: 28%;
    transform: translate(-50%, -50%);
    z-index: 5;
    &.yellow {
      background: linear-gradient(99.19deg, rgba(166, 157, 131, 0.4) 5.46%, rgba(255, 208, 0, 0.4) 86.69%);
      top: 73%;
    }
  }

}

.succ {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: visible;

  .bgg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 440px;
    height: 452px;
  }

  .tit {
    position: absolute;
    left: 60%;
    top: 55%;
    transform: translate(0, -50%);
    @include mobile {
      width: 130px;
      left: 65%;
      top: 60%
    }
  }

  .name {
    position: absolute;
    left: 50%;
    top: 70%;
    transform: translate(-50%, -50%);
    color: #FFF5F5;
    font-weight: 700;
    font-size: 24px;
    filter: drop-shadow(0px 0px 4.3px #FF4545A6);
    width: 90vw;
    text-align: center;
    @include mobile {
      font-size: 16px;
    }

  }

  .wq {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    @include mobile {
      width: 200px;
    }
  }

}

.options {
  --el-color-primary: #E39C33
}

.self-title {
  position: relative;
  width: fit-content;
  margin: 20px 0;

  &.orange {
    span {
      filter: drop-shadow(0px 0px 4.3px #FFB545A6);
    }

    div {
      background: linear-gradient(90deg, #F3A734 0%, rgba(141, 123, 30, 0) 100%);

    }
  }

  span {
    position: relative;
    font-size: 16px;
    font-family: "Source Han Sans CN", "Microsoft YaHei", 'sans-serif';
    filter: drop-shadow(0px 0px 4.3px #FF4545A6);


    z-index: 2;
  }

  div {
    content: '';
    position: absolute;
    width: 91px;
    height: 10px;
    bottom: -7px;
    left: 0;
    background: linear-gradient(90deg, #F34A34 0%, rgba(141, 43, 30, 0) 100%);

    z-index: 0;
  }
}

.smelt {
  display: flex;
  position: relative;
  margin-bottom: 50px;
  height: fit-content;

  &-container {
    display: flex;
    flex-direction: column;
    border: 0.8px solid;
    border-image-source: linear-gradient(180deg, rgba(255, 112, 112, 0) -2.75%, rgba(255, 201, 201, 0.690307) 43.49%, #994343 100%);
    border-image-slice: 1;
    align-items: center;
    padding-top: 10px;
    box-shadow: 0px 3.2px 27.12px 0px #500B0557;


  }

  .page {
    margin-top: 10px;

  }

  .wq {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 2px;
    width: fit-content;

    .item {
      cursor: pointer;
      width: 152px;
      height: 123px;

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
        z-index: 5;
      }
    }


  }

  .status {
    flex: 1;
    height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
    position: relative;
    @include mobile {
      align-items: flex-start;
      padding-top: 120px;
    }


    .confirm {
      width: 80%;
      height: 150px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;
      @include mobile {
        width: 50vw;
        top: 365px;
      }
    }

    .result {
      position: absolute;
      flex-shrink: 0;
      top: -15%;
      left: 50%;
      transform: translateX(-50%);
      width: 164px;
      height: 164px;
      background-size: 100% 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 70%;
      }

      .close {
        position: absolute;
        top: -10px;
        right: 0px;
        cursor: pointer;

      }
    }

    .img {
      width: 100%;
      position: relative;

      .img-bg {
        width: 100%;
        max-width: 300px;
        margin: 0 auto;

      }


    }

    .select_list {
      height: 350px;
      position: absolute;
      bottom: -250px;
      width: 100%;

      left: 50%;
      transform: translateX(-50%);
      @include mobile {
        width: 100vw;
      }

      .result_list_box {
        display: grid;
        grid-template-columns: repeat(2, 1fr);

        .result {
          top: 0;
          left: 50%;
        }


        @include mobile {
          position: relative;
          display: flex;
          justify-content: center;
          width: 100vw;
          .result {
            left: 20%;
          }
        }
      }

      .el-scrollbar {
        width: 100%;

      }

      .result {
        position: relative;
        margin: 5px;
      }
    }
  }

  .shop {
    min-width: 310px;

    .select {
      display: flex;
      flex-direction: column;

      &-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .el-select {
          width: 200px;
          --el-select-input-focus-border-color: none;
          --el-input-text-color: #fff;

          :deep(.el-select__wrapper) {
            background: #FFF0F03D;
            border: 1px solid #E39C33;
            box-shadow: none !important;
          }
        }
      }


    }
  }

}

</style>
