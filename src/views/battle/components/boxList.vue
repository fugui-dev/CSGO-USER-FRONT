<template>
  <div class="box-wrapper" v-loading="loading">
    <div class="box-type-wrapper">
      <div
        class="box-type-item"
        v-for="item in boxTypeList"
        :key="item.boxTypeId"
        @click="activeBoxType = item.boxTypeId"
        :style="{
          backgroundImage:
            activeBoxType === item.boxTypeId
              ? `url(${activeTypeBg})`
              : `url(${typeBg})`,
        }"
      >
        {{ item.boxTypeName }}
      </div>
    </div>
    <div class="box-item-wrapper">
      <div
        class="box-item"
        v-for="item in allBoxList"
        :key="'box' + item.boxId"
        @click="handleClickBoxItem(item)"
      >
        <img v-if="item.boxImg02 || item.boxImg01" :src="item.boxImg02 || item.boxImg01" class="box-img" alt="" @error="$event.target.style.display = 'none'" />
        <div class="box-desc">
          <div class="box-name" :title="item.boxName">{{ item.boxName }}</div>
          <img class="coin" src="@/assets/images/battle/coin.png" alt="" />
          <div>{{ item.price }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getBattleBoxListApi } from "@/api/battle";
import { computed, ref, onMounted } from "vue";
import activeTypeBg from "@/assets/images/battle/box-active-bg.png";
import typeBg from "@/assets/images/battle/box-bg.png";
const boxTypeList = ref([]);
const activeBoxType = ref(null);
const loading = ref(false);

onMounted(() => {
  getBoxTypeList();
});
// 获取宝箱列表
const getBoxTypeList = () => {
  loading.value = true;
  getBattleBoxListApi()
    .then((res) => {
      if (res.data && res.data.length) {
        boxTypeList.value = res.data;
        activeBoxType.value = res.data[0]?.boxTypeId;
        emits('allBox', flattenBoxData(res.data));
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const flattenBoxData = (boxData) => {
  return boxData.reduce((prev, curr) => {
    return [...prev, ...curr.boxList]
  }, [])
}

const allBoxList = computed(() => {
  if (activeBoxType.value && boxTypeList.value.length) {
    const currentType = boxTypeList.value.find(
      (item) => item.boxTypeId === activeBoxType.value
    );
    return currentType ? currentType.boxList : [];
  }
  return [];
});
const emits = defineEmits(["boxDetail", 'allBox']);
// 点击获取展示宝箱详情
const handleClickBoxItem = (item) => {
  emits("boxDetail", item);
};
</script>

<style scoped lang="scss">
.box-wrapper {
  width: 100%;
  padding: 0 20px;
  .box-type-wrapper {
    padding: 1.15vw 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    .box-type-item {
      width: 139px;
      height: 40px;
      text-align: center;
      line-height: 40px;
      background-size: 100%;
      font-weight: 500;
      font-size: 17px;
      color: #ffffff;
      cursor: pointer;
    }
  }
  .box-item-wrapper {
    display: flex;
    align-items: center;
    height: 10vw;
    overflow-x: auto;
    &::-webkit-scrollbar {
      display: none;
    }
    .box-item {
      min-width: 145px;
      height: 100px;
      background: url("@/assets/images/battle/weapon-bg.png") no-repeat;
      background-size: 100% 100%;
      cursor: pointer;
      & + .box-item {
        margin-left: 20px;
      }
      .box-img {
        margin: 10px auto;
        width: 130px;
        height: 50px;
        object-fit: contain;
      }
      .box-desc {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 15px 5px;
        font-weight: 500;
        font-size: 12px;
        color: #ffffff;
        .box-name {
          text-overflow: ellipsis;
          overflow: hidden;
          flex: 1;
          white-space: nowrap;
        }
        .coin {
          width: 16px;
          height: 16px;
          margin: 0 5px;
        }
      }
    }
  }
}
</style>
