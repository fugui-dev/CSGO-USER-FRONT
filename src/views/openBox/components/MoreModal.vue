<script setup>
import BaseModel from '@/components/BaseModel/index.vue'
import { ref, onMounted, computed } from 'vue'
import { useDeviceType } from '@/composables/useDeviceType'
import Money from '@/assets/icons/money.svg'
const props = defineProps({
    moreData: {
        type: Object,
        default: () => { }
    },
    boxName: {
        type: String,
        default: ''
    }
})
const leavel = {
    1: {
        color: '#FFBD4E',
        background: 'linear-gradient(180deg, rgba(97, 58, 1, 0.00) 0%, rgba(255, 180, 57, 0.26) 100%)',
        name: "金色"
    },
    2: {
        color: '#FF352E',
        background: 'linear-gradient(180deg, rgba(97, 8, 1, 0) 0%, rgba(222, 67, 32, 0.26) 100%)',
        name: "红色"
    },
    3: {
        color: '#984EFF',
        background: 'linear-gradient(180deg, rgba(52, 49, 56, 0.00) 0%, rgba(105, 39, 181, 0.51) 100%)',
        name: "紫色"
    },
    4: {
        color: '#35B2FF',
        background: 'linear-gradient(180deg, rgba(1, 43, 97, 0) 0%, rgba(32, 102, 222, 0.26) 100%)',
        name: "蓝色"
    },
    5: {
        color: '#1FEBC4',
        background: 'linear-gradient(180deg, rgba(0, 117, 103, 0.00) 0%, rgba(31, 235, 196, 0.65) 100%)',
        name: "绿色"
    }
}
const visible = ref(false)
const { isPC } = useDeviceType()

const levelStyle = computed(() => {
    const id = props.moreData?.ornamentsLevelId || 1
    return {
        color: leavel[id].color,
        background: leavel[id].background
    }
})

const name = computed(() => {
    if (props.moreData?.name)
        return props.moreData?.name
    return props.moreData?.ornamentName
})
const levelImg = computed(() => {
    if (props.moreData?.levelImg)
        return props.moreData?.levelImg
    return props.moreData?.ornamentLevelImg
})
const price = computed(() => {
    // 如果是最近掉落的饰品（有ornamentsPrice字段），优先使用ornamentsPrice
    if (props.moreData?.ornamentsPrice) {
        return props.moreData.ornamentsPrice
    }
    // 军需饰品：优先使用boxPrice，如果没有则使用usePrice
    return props.moreData?.boxPrice || props.moreData?.usePrice || 0
})
const shortName = computed(() => {
    if (props.moreData?.shortName)
        return props.moreData?.shortName
    return historyData.value.shortName
})
const exteriorName = computed(() => {
    if (props.moreData?.exteriorName)
        return props.moreData?.exteriorName
    return historyData.value.exteriorName
})
const historyData = computed(() => {
    if (!props.moreData?.ornamentName) return { shortName: '', exteriorName: '' }
    const name = props.moreData.ornamentName
    const match = name.match(/(.*?)\s*\((.*?)\)$/)
    if (match) {
        return {
            shortName: match[1].trim(),
            exteriorName: match[2].trim()
        }
    }

    return {
        shortName: name,
        exteriorName: ''
    }
})
const close = () => {
    visible.value = false
}
const open = () => {
    visible.value = true
}
defineExpose({
    open,
    close
})
</script>

<template>
  <el-dialog
    v-model="visible"
    width="957"
    :show-close="false"
    align-center
    style="--el-dialog-bg-color: transparent"
    destroy-on-close
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="box-modal-wrapper">
      <div class="close-click" @click="visible = false" />
      <div class="line"></div>
      <div class="title">饰品详情</div>
      <div class="content">
        <div class="left">
          <img :src="levelImg" class="level-bg" />
          <img :src="moreData.imageUrl" class="image" />
        </div>
        <div class="right">
          <div class="name">{{ name }}</div>
          <div class="desc">
            <div class="desc-item green">
              <div class="item-tile">饰品品质</div>
              <div class="item-value">{{ leavel[moreData.ornamentsLevelId].name }}</div>
            </div>
            <div class="desc-item green">
              <div class="item-tile">外观</div>
              <div class="item-value">{{ exteriorName || '无' }}</div>
            </div>
            <div class="desc-item purple">
              <div class="item-tile">出现概率</div>
              <div class="item-value">{{ moreData.oddsResult }}%</div>
            </div>
            <div class="desc-item red">
              <div class="item-tile">饰品价格</div>
              <div class="item-value">
                <img class="icon" src="@/assets/images/champion/game/coin.png" alt="" />
                {{ price.toFixed(2) }}
              </div>
            </div>
            <div class="desc-item golden">
              <div class="item-tile">开启箱子</div>
              <div class="item-value">{{ boxName }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<style scoped lang="scss">
.box-modal-wrapper {
  width: 957px;
  height: 417px;
  position: relative;
  background: url('@/assets/images/open/dialog_bg.png') no-repeat;
  background-size: 100% 100%;
  overflow: hidden;
  padding: 0 28px;
  line-height: normal;
  color: #FFFFFF;
  .close-click {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 16px;
    right: 16px;
    background-image: url('@/assets/images/user/close.png');
    background-size: 100% 100%;
    cursor: pointer;
  }
  .line {
    position: absolute;
    top: 36px;
    right: 18px;
    width: 708px;
    height: 1px;
    background: #3C555C;
  }
  .title {
    margin-top: 16px;
    font-weight: 500;
    font-size: 19px;
  }
  .content {
    display: flex;
    margin-top: 10px;
    .left {
      position: relative;
      margin-top: 65px;
      width: 238px;
      height: 169px;
      .level-bg {
        width: 100%;
        height: 100%;
      }
      .image {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 207px;
        height: 130px;
        object-fit: contain;
      }
    }
    .right {
      margin-left: 24px;
      width: 626px;
      height: 344px;
      background-color: #0f1f256b;
      border-radius: 17px;
      padding: 20px 24px;
      .name {
        font-size: 18px;
      }
      .desc {
        margin-top: 22px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 22px 72px;
        .desc-item {
          width: 228px;
          height: 70px;
          padding-left: 22px;
          padding-top: 10px;
          .item-tile {
            font-size: 15px;
          }
          .item-value {
            margin-top: 5px;
            font-size: 18px;
            .icon {
              width: 18px;
              height: 18px;
              display: inline;
              margin-top: -3px;
            }
          }
          &.green {
            background: url('@/assets/images/open/detail_green_bg.png') no-repeat;
            background-size: 100% 100%;
            .item-value {
              color: #58CC3A;
            }
          }
          &.purple {
            background: url('@/assets/images/open/detail_purple_bg.png') no-repeat;
            background-size: 100% 100%;
            .item-value {
              color: #BF55D6;
            }
          }
          &.red {
            background: url('@/assets/images/open/detail_red_bg.png') no-repeat;
            background-size: 100% 100%;
            .item-value {
              color: #DA5A5A;
            }
          }
          &.golden {
            background: url('@/assets/images/open/detail_golden_bg.png') no-repeat;
            background-size: 100% 100%;
          }
        }
      }
    }
  }
}
</style>
