<script setup>


import Layout from "@/components/Layout.vue";
import {requireImg} from "@/utils/common";
import OpenBagModal from "@/views/openBox/components/OpenBagModal.vue";
import {readonly, ref} from "vue";
import {useDebounceFn} from "@vueuse/core";
import {getPackSackApi, getShopListApi, smeltApi} from "@/api";
import {ElMessage} from "element-plus";

const pagePack = ref({
  page: 1,
  size: 18,
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
  selectedList.value = selectedItems
  form.value.minPrice = totalPrice * 0.5
  form.value.maxPrice = totalPrice * 0.9
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
  let min=0.9
  let max=1
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
}, 1000)




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
const onChoose = (item) => {
  if (item.id === selectId.value) {
    selectId.value = null
  } else {
    selectId.value = item.id
  }

}

getList()


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
    ElMessage.success('熔炼成功')
    selectPackIds.value = []
    selectId.value = null
    list.value = []
    pagePack.value.page = 1
    form.value.pageNum = 1
    form.value.minPrice = 0
    form.value.maxPrice = 0
    form.value.exterior = null
    form.value.type = null

    getPackList()
  })

}
</script>

<template>
  <Layout :style="{
    '--bg-select':requireImg('/smelt/bg-select.png',true),
    '--bg-shop':requireImg('/smelt/bg-shop.png',true),
    '--bg-confirm':requireImg('/smelt/bg-confirm.png',true),

  }">
    <template #item>
      <div class="card smelt" style="background-color: rgba(0, 0, 0, 0.45)">
        <img :src="requireImg('/smelt/top-mark.png',false)" class="top_mark" alt="">
        <div class="smelt-title">
          <div>饰品熔炼</div>
          <div></div>
        </div>
        <div class="smelt-select" v-loading="pagePack.loading">
          <div class="item-title">
            <div>选择饰品</div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div class="smelt-select-content" v-loading="loading">
            <div class="weapon" v-for="(i,index) in packList" :class="{'choose':selectPackIds?.includes(i.id)}"
                 :style="{backgroundImage:'url('+i.levelImg+')'}" :key="index" @click="handleSelectPack(i)" :title="i.ornamentName">
              <img :src="i.imageUrl" alt="">
              <div class="weapon-name ellipsis">{{ i.ornamentName }}</div>
              <div class="price" v-if="false">{{ i.ornamentsPrice }}</div>
              <div class="exteriorName">{{ i.exteriorName }}</div>
            </div>
          </div>
          <el-pagination
              background
              layout="prev, pager, next"
              :total="pagePack.total"
              :current-page="pagePack.page"
              :page-size="pagePack.size"
              @current-change="handlePagePackChange"
              style="margin: 15px auto;"
          />

        </div>
      </div>
      <div class="card smelt">
        <div class="smelt-confirm">
          <img class="smelt-confirm-btn" :src="requireImg('/smelt/btn-confirm.png',false)" alt=""
               @click="handleSmelt">
        </div>
      </div>
      <div class="card smelt">
        <div class="smelt-shop">
          <div class="item-title">
            <div>熔炼饰品库</div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div class="smelt-shop-content" v-loading="loading">
            <div class="smelt-shop-content-category">
              <div class="smelt-shop-content-category-title">种类</div>
              <div class="smelt-shop-content-category-list">
                <div class="smelt-shop-content-category-list-item" :class="{'active':i.value===form.type}"
                     v-for="(i,index) in category.type" :key="index" @click="handleSelectType(i.value)">
                  {{ i.name }}
                </div>
              </div>
            </div>
            <div class="smelt-shop-content-category">
              <div class="smelt-shop-content-category-title">外观</div>
              <div class="smelt-shop-content-category-list">
                <div class="smelt-shop-content-category-list-item" :class="{'active':i.value===form.exterior}"
                     v-for="(i,index) in category.exterior" :key="index" @click="handleSelectExterior(i.value)">
                  {{ i.name }}
                </div>
              </div>
            </div>
            <div class="smelt-shop-content-shop_list"></div>
            <el-scrollbar height="400px" @scroll="onScroll" ref="scrollRef" v-loading="loading">
              <div class="inventory_list" ref="listRef">
                <div class="weapon" v-for="(i,index) in list" :class="{'choose':selectId===i.id}"
                     :style="{backgroundImage:'url('+requireImg('/smelt/bg-weapon.png',false)+')'}" :key="index"
                     @click="onChoose(i)" :title="i.ornamentName">
                  <img :src="i.imageUrl" alt="">
                  <div class="weapon-name ellipsis">{{i.ornamentName || i.shortName }}</div>
                  <!--                  <div class="price">{{ i.ornamentsPrice }}</div>-->
                  <div class="exteriorName">{{ i.exteriorName }}</div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>


      <OpenBagModal ref="openBagModalRef" @confirm="handleOpenBagConfirm"/>
    </template>

  </Layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.smelt {
  font-size: 16px;
  padding: 30px 40px;
  margin-bottom: 40px;
  background-color: transparent;
  @include mobile {
    padding: 30px 0px;
  }

  &-title {
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    font-size: 40px;
    position: relative;
    width: fit-content;
    margin-bottom: 46px;
    @include mobile {
      margin-left: 20px;
    }

    div {
      &:nth-child(1) {
        color: #fff;
        filter: drop-shadow(3px 2px 1px rgb(0, 154, 255));
        z-index: 5;
        position: relative;
      }

      &:nth-child(2) {
        z-index: 1;
        color: #ff9900;
        position: absolute;
        bottom: 5px;
        width: 120%;
        left: 50%;
        transform: translateX(-50%);
        height: 10px;
        background: rgb(0, 154, 255);
      }
    }
  }

  &-select {
    height: fit-content;
    min-height: 380px;
    background-image: var(--bg-select);
    background-size: 100% 100%;
    position: relative;
    padding: 20px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    &-btn {
      color: #fff;
      background-color: rgb(138, 15, 198);
      width: fit-content;
      padding: 0 10px;
      line-height: 1.5em;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-bottom: 15px;

    }

    &-content {
      margin-top: 15px;
      flex: 1;
      //display: flex;
      //flex-wrap: wrap;
      //overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      grid-gap: 1px;
      @include maxWidth(1522px) {
        grid-template-columns: repeat(6, 1fr);
      }
      @include maxWidth(1120px) {
        grid-template-columns: repeat(3, 1fr);
      }

      .weapon {
        margin: 0;
      }

    }


  }

  &-shop {

    height: 600px;
    background-image: var(--bg-shop);
    background-size: 100% 100%;
    position: relative;
    padding: 20px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;

    .inventory_list {
      display: flex;
      width: 100%;
      flex-wrap: wrap;
      margin: 10px;
    }

    &-content {
      display: flex;
      flex-direction: column;
      padding-top: 10px;

      &-category {
        display: flex;
        line-height: 1.5em;
        margin-bottom: 15px;

        &-title {
          padding: 0 10px;
          background-color: rgb(0, 26, 55);
          height: fit-content;
          margin-right: 15px;

        }

        &-list {
          display: flex;
          flex-wrap: wrap;
          flex: 1;

          &-item {
            margin: 0 5px;
            cursor: pointer;

            &.active {
              color: #31ACFF;
            }
          }

        }
      }
    }
  }

  &-confirm {

    height: 300px;
    width: 100%;
    position: relative;
    background-image: var(--bg-confirm);
    background-size: 100% 100%;

    &-btn {
      height: 100%;
      background-image: var(--btn-confirm);
      background-size: 100% 100%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      position: absolute;
      cursor: pointer;

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
      max-width: 120px;
      margin: 2px auto;
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

    .exteriorName {
      position: absolute;
      right: 10px;
      top: 10px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    }

  }

  .item-title {
    width: 150px;
    height: 50px;
    background: rgb(1, 12, 25);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
    font-size: 26px;
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);

    div {
      &:nth-child(2) {
        position: absolute;
        left: -2px;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 50%;
        background: rgb(0, 154, 255);
        border-radius: 5px;
      }

      &:nth-child(3) {
        position: absolute;
        right: -2px;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 50%;
        background: rgb(0, 154, 255);
        border-radius: 5px;
      }

      &:nth-child(4) {
        position: absolute;
        left: 50%;
        top: -2px;
        transform: translateX(-50%);
        width: 40%;
        height: 3px;
        background: rgb(0, 154, 255);
        border-radius: 5px;
      }
    }
  }

}

</style>
