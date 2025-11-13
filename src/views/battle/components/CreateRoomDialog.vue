<script setup>
import { ref } from "vue";
import {requireImg} from "@/utils/common";
import Decimal from 'decimal.js'
import {createRoomApi} from "@/api/battle"
import {getBoxInfo} from "@/views/openBox/server/api"
import {ElMessage} from "element-plus"
import {useStore} from "@/store"
import { useRouter } from 'vue-router'
import { useUserInfo } from "@/composables/useUesrInfo.js"
import coin from '@/assets/images/upgrade/coin.png'
import boxItem from '@/views/openBox/components/boxItem.vue'

const props = defineProps({
    boxData: {
        type: Object,
        required: true
    }
});
const emit = defineEmits(['close'])
const store = useStore()
const router = useRouter()
const { fetchUserInfo } = useUserInfo()
const visible = ref(false)
const activeModel = ref(0)
const activePersonNum = ref(2)
const choosedBoxData = ref([])
const totalPrice = ref(0)
const form = ref({
  model: '',
  playerNumber: 0,
  boxIdAndNumber: {}
})
// 饰品列表弹窗相关
const ornamentListVisible = ref(false)
const ornamentListData = ref([])
const currentBoxName = ref('')
const loadingOrnaments = ref(false)

const initData = () => {
  activeModel.value = 0
  activePersonNum.value = 2
  choosedBoxData.value = []
  totalPrice.value = 0
  form.value = {
    model: '',
    playerNumber: 0,
    boxIdAndNumber: {}
  }
}

const open = () => {
    visible.value = true
}

const close = () => {
    visible.value = false
    emit('close')
}

const closeModal = () => {
    visible.value = false;
    initData()
};

const handleChangeActiveModel = (val) => {
  activeModel.value = val;
}

const handleChangeActivePersonNum = (val) => {
  activePersonNum.value = val;
}

const handleClickBoxItem = (item) => {
  if (choosedBoxData.value.length >= 15) {
    return
  }
  choosedBoxData.value.push(item)
  totalPrice.value = new Decimal(totalPrice.value).plus(item.price).toNumber()
}

const handleClickChoosedBoxItem = (item, index) => {
  if (index >= 0) {
    choosedBoxData.value.splice(index, 1);
    totalPrice.value = new Decimal(totalPrice.value).minus(item.price).toNumber()
  }
}

const handleClickCreateRoom = () => {
  form.value.model = activeModel.value.toString()
  form.value.playerNumber = activePersonNum.value
  const obj = {}
  choosedBoxData.value.forEach(item => {
    if (obj[item.boxId]) {
      obj[item.boxId]++
    } else {
      obj[item.boxId] = 1
    }
  })
  form.value.boxIdAndNumber = {...obj}
  createRoomApi(form.value).then(res => {
    if (res.code === 200) {
      ElMessage.success('房间创建成功')
      // 更新用户信息（因为创建房间会扣费）
      fetchUserInfo()
      closeModal()
      // 模式1：创建房间后进入 模式2：进入等待中或进行中的房间 模式3：进入已结束的房间
      store.setCurrRound(1)
      const roomId = res.data.fight.id
      router.push({
        path: `/battle/${roomId}`,
        query: { model: 1 }
      })
    }
  })
}

// 点击查看饰品列表
const handleViewOrnaments = async (item, event) => {
  // 阻止事件冒泡，避免触发选择宝箱
  event.stopPropagation()
  event.preventDefault()
  
  loadingOrnaments.value = true
  currentBoxName.value = item.boxName
  ornamentListVisible.value = true
  
  try {
    const res = await getBoxInfo({boxId: item.boxId})
    if (res.code === 200 && res.data && res.data.boxOrnamentsList && res.data.boxOrnamentsList.length) {
      // 数据格式映射：将API返回的数据格式转换为boxItem组件需要的格式
      ornamentListData.value = res.data.boxOrnamentsList.map(ornament => ({
        ...ornament,
        ornamentName: ornament.name || '',
        ornamentLevelImg: ornament.levelImg || '',
        exteriorName: ornament.exteriorName || '',
        // oddsResult 已经是百分比格式（如 0.01 表示 0.01%），需要格式化为字符串
        oddsResult: ornament.oddsResult ? parseFloat(ornament.oddsResult).toFixed(2) : null
      }))
    } else {
      ElMessage.warning('暂无饰品数据')
      ornamentListVisible.value = false
    }
  } catch (error) {
    ElMessage.error('获取饰品列表失败')
    ornamentListVisible.value = false
  } finally {
    loadingOrnaments.value = false
  }
}

// 关闭饰品列表弹窗
const closeOrnamentList = () => {
  ornamentListVisible.value = false
  ornamentListData.value = []
  currentBoxName.value = ''
}

defineExpose({
    open,
    close
})

</script>
<template>
    <div>
        <van-popup class="dialog no-scrollbar" v-model:show="visible" :close-on-click-overlay="false" teleport="body">
            <div class="tw-w-[92vw] md:tw-w-[72.5rem] tw-mt-1 tw-py-4 tw-px-2 md:tw-p-5 tw-pb-3 tw-relative tw-z-10 tw-animate-modalAppear">
                <!-- 背景光效 - 移到卡片内部 -->
                <!-- <div class="tw-absolute tw-w-full tw-h-full tw-top-0 tw-left-0 tw-overflow-hidden tw-opacity-30 tw-rounded-xl tw-z-0">
                    <div class="tw-absolute tw-w-[40%] tw-h-[30%] tw-bg-[#FF7A21] tw-blur-[6.25rem] tw-rounded-full tw-top-[-10%] tw-left-[-10%] tw-animate-pulse"></div>
                    <div class="tw-absolute tw-w-[30%] tw-h-[20%] tw-bg-[#FF7A21] tw-blur-[5rem] tw-rounded-full tw-bottom-[-5%] tw-right-[10%] tw-animate-pulse" style="animation-delay: 1s;"></div>
                </div> -->
                
                <!-- 边框光效 -->
                <!-- <div class="tw-absolute tw-inset-0 tw-rounded-xl tw-border tw-border-[#FF7A21]/20 tw-z-[1] tw-animate-borderPulse"></div> -->
                
                <!-- 标题栏 -->
                <div class="tw-flex tw-justify-between tw-pb-4 tw-items-center tw-mb-2 tw-relative tw-z-10">
                    <div></div>
                    <!-- <h3 class="tw-text-xl tw-font-bold tw-text-transparent tw-bg-clip-text tw-bg-gradient-to-r tw-from-[#FF7A21] tw-to-[#FFB74D] tw-animate-titleSlide">创建房间</h3> -->
                    <h3 class="tw-text-[16px] tw-font-bold tw-text-transparent tw-text-white">创建房间</h3>
                    
                    <!-- 关闭按钮 -->
                    <button 
                        class="tw-w-8 tw-h-8 tw-mr-[10px] tw-flex tw-items-center tw-justify-center tw-transition-all tw-duration-300 group"
                        @click="closeModal"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none"
                            :style="{ stroke: '#FFFFFF' }"
                            stroke-width="2.5" 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            class="tw-w-4 tw-h-4 tw-transition-colors tw-duration-300 tw-animate-spin-once"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <!-- 内容区域 -->
                <div class="tw-overflow-hidden tw-transition-all tw-duration-500 tw-ease-in-out tw-my-4 tw-relative tw-z-10">
                    <div>
                        <div class="room-line">
                          <h3>房间模式</h3>
                          <div class="room-line-options">
                            <div :class="{'active-btn': activeModel === 0}" @click="handleChangeActiveModel(0)">欧皇模式</div>
                            <div :class="{'active-btn': activeModel === 1}" @click="handleChangeActiveModel(1)">非酋模式</div>
                          </div>
                        </div>
                        <div class="room-line">
                          <h3>房间人数</h3>
                          <div class="room-line-options">
                            <div v-for="i in 3" :key="i" :class="{'active-btn': activePersonNum === i + 1}" @click="handleChangeActivePersonNum(i + 1)">
                              {{ i + 1 }}
                            </div>
                          </div>
                        </div>
                        <div class="tw-flex tw-justify-between  tw-pb-4 tw-items-center tw-mb-0 tw-relative tw-z-10">
                          <h3 class="box-choose-title">选择宝箱</h3>
                          <!-- <div class="tw-absolute tw-h-[2px] tw-bg-gradient-to-r tw-from-transparent tw-via-[#FF7A21] tw-to-transparent tw-w-full tw-bottom-[-12px]"></div> -->
                        </div>
                        <div class="box-choose-list unchoosed tw-overflow-y-auto tw-max-h-[40vh] no-scrollbar tw-flex tw-flex-wrap tw-justify-center  tw-gap-y-2 tw-gap-x-2 md:tw-gap-3 tw-animate-gridAppear">
                          <div class="box-item" @click="handleClickBoxItem(item)" v-for="item in boxData" :key="item.boxId">
                            <!-- 查看饰品图标 -->
                            <div class="ornament-icon" @click="handleViewOrnaments(item, $event)" title="查看饰品列表">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-eye">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </div>
                            <div class="bx">
                              <img :src="item.boxImg01" class="bj" alt="">
                              <img :src="item.boxImg02" class="wq" alt="">
                            </div>
                            <div class="mz">
                              <div class="name">{{ item.boxName }}</div>
                            </div>
                            <div class="btn">
                              <img :src="coin" alt="">
                              <div>{{item.price}}</div>
                            </div>
                          </div>
                        </div>
                    </div>
                </div>
                <!-- 底部区域 -->
                <div class="footer">
                  <div class="choosed-tips">已选中：{{ choosedBoxData.length }} / 15，总价值：
                    <span class="total-price">
                      <img :src="coin" alt="">
                      <span>{{ totalPrice }}</span>
                    </span>
                  </div>
                  <!-- 选中宝箱列表 -->
                  <div class="box-choose-list tw-flex no-scrollbar tw-flex-wrap tw-justify-center  tw-gap-y-2 tw-gap-x-2 md:tw-gap-6 tw-animate-gridAppear">
                    <div class="box-item" @click.capture="handleClickChoosedBoxItem(item, index)" v-for="(item, index) in choosedBoxData" :key="item.boxId">
                      <div class="bx">
                        <img :src="item.boxImg01" class="bj" alt="">
                        <img :src="item.boxImg02" class="wq" alt="">
                      </div>
                      <div class="mz">
                        <div class="name">{{ item.boxName }}</div>
                      </div>
                      <div class="btn">
                        <img :src="coin" alt="">
                        <div>{{item.price}}</div>
                      </div>
                    </div>
                  </div>
                  <!-- 按钮 -->
                  <div class="create-room-btn" @click="handleClickCreateRoom">创建房间</div>
                </div>
            </div>
        </van-popup>
        
        <!-- 饰品列表弹窗 -->
        <van-popup class="ornament-dialog no-scrollbar" v-model:show="ornamentListVisible" :close-on-click-overlay="false" teleport="body">
            <div class="lucky-modal-wrapper tw-w-[90vw] md:tw-w-[72.5rem] tw-rounded-xl tw-bg-[#1A1A1A]/90 tw-backdrop-blur-md tw-mt-5 tw-py-4 tw-px-2 md:tw-p-5 tw-pb-3 tw-relative tw-z-10 tw-animate-modalAppear">
                <!-- 开箱背景 -->
                <div class="lucky-modal-bg"></div>
                
                <!-- 标题栏 -->
                <div class="tw-flex tw-justify-between tw-pb-4 tw-items-center tw-mb-6 tw-relative tw-z-10">
                    <h3 class="tw-text-xl tw-font-bold tw-text-white tw-animate-titleSlide">{{ currentBoxName }} - 饰品列表</h3>
                    
                    <!-- 关闭按钮 -->
                    <button 
                        class="tw-w-8 tw-h-8 tw-rounded-full tw-bg-[#2A2A2A] tw-flex tw-items-center tw-justify-center hover:tw-bg-[#3A3A3A] tw-transition-all tw-duration-300 group"
                        @click="closeOrnamentList"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none"
                            :style="{ stroke: 'var(--icon-color, #ffffff)' }"
                            stroke-width="2.5" 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            class="tw-w-4 tw-h-4 tw-transition-colors tw-duration-300 tw-animate-spin-once"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                <!-- 内容区域 -->
                <div class="tw-overflow-hidden tw-overflow-y-auto tw-max-h-[50vh] no-scrollbar tw-transition-all tw-duration-500 tw-ease-in-out tw-my-4 tw-relative tw-z-10" v-loading="loadingOrnaments">
                    <div class="box-item tw-flex tw-flex-wrap tw-justify-center tw-gap-y-2 tw-gap-x-2 md:tw-gap-6 tw-animate-gridAppear">
                        <boxItem 
                            v-for="(item, index) in ornamentListData" 
                            :key="index"
                            :box-data="item"
                            :isHave="true"
                            :style="{ animationDelay: index * 0.1 + 's' }"
                            class="tw-animate-itemAppear"
                        />
                    </div>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<style scoped lang="scss">
.dialog {
    background: url('@/assets/images/battle/create-room-bg.png') no-repeat;
    background-size: 100% 100%;
    padding: 0 20px;
}
.room-line {
  display: flex;
  align-items: center;
  color: #fff;
  padding: 8px 0;
  h3 {
    margin-right: 12px;
    font-size: 13px;
  }
  .room-line-options {
    display: flex;
    div {
      margin-right: 12px;
      background-color: transparent;
      border: 1px solid #4B96B0;
      height: 26px;
      display: flex;
      align-items: center;
      padding: 0 13px;
      border-radius: 12px;
      font-size: 12px;
      cursor: pointer;
    }
  }
}
.active-btn {
  background: linear-gradient(to right, #175e64, #508594);
  border: none !important;
}
.box-choose-title {
  color: #ffffff;
  margin: 8px 0 0 0;
  font-size: 13px;
}
.box-choose-list {
  color: #ffffff;
  padding-bottom: 16px;
    .box-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: .5s;
    width: 100px;
    box-sizing: border-box;
    position: relative;

    &:hover {
      .bx {
        animation: smooth 2s infinite;
        .wq{
          //使用动画 循环播放 up_and_down
          animation: up_and_down 2s infinite;
        }
      }
      .ornament-icon {
        opacity: 1;
        transform: scale(1.1);
      }
    }
    
    // 查看饰品图标
    .ornament-icon {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 24px;
      height: 24px;
      background: rgba(255, 122, 33, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      opacity: 0.7;
      transition: all 0.3s ease;
      backdrop-filter: blur(4px);
      
      &:hover {
        background: rgba(255, 122, 33, 1);
        transform: scale(1.15);
      }
      
      .icon-eye {
        width: 14px;
        height: 14px;
        color: #ffffff;
        stroke: #ffffff;
      }
    }

    .bx {
      width: 100%;
      max-width: 191px;
      max-height: 182px;
      margin-bottom: 3px;
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: center;
      img{
        width: 60%;
      }
      .wq{
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 3;
        width: 45%;
        height: 45%;
      }
    }
    .mz {
      display: flex;
      align-items: center;
      padding: 0 10px;
      background-color: #1A272B;
      font-size: 12px;
      height: 22px;
      border-radius: 11px;
      line-height: 22px;
      margin: 0 0 4px 0;
      justify-content: center;
    }


    .btn {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      width: 80%;
      line-height: 1.5em;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      img{
        width: 16px;
        margin-right: 3px;
      }
    }
  }
}
.unchoosed {
  background-color: rgba($color: #192b2f, $alpha: 0.55);
  border-radius: 12px;
}
.footer {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  .box-choose-list {
    max-height: 160px;
    overflow: auto;
    padding-bottom: 4px;
  }
  .choosed-tips {
    display: flex;
    justify-content: center;
    color: #ffffff;
    padding: 4px 0 12px 0;
  }
  .total-price {
    display: flex;
    align-items: center;
    img {
      width: 18px;
      margin-right: 3px;
    }
  }
  .create-room-btn {
    background: url('@/assets/images/login/yellow_btn.png') no-repeat;
    width: 170px;
    text-align: center;
    color: #072523;
    font-size: 14px;
    padding: 6px 0;
    margin-top: 12px;
    cursor: pointer;
  }
}

/* 动画 */
@keyframes modalAppear {
    0% {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
    }
    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@keyframes borderPulse {
    0%, 100% {
        box-shadow: 0 0 15px 2px rgba(255, 122, 33, 0.2);
    }
    50% {
        box-shadow: 0 0 25px 5px rgba(255, 122, 33, 0.4);
    }
}

@keyframes titleSlide {
    0% {
        opacity: 0;
        transform: translateY(-10px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes gridAppear {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes itemAppear {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes spin-once {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(180deg);
    }
}

@keyframes up_and_down {
  0% {
    transform: translate(-50%,-50%);
  }

  50% {

    transform: translate(-50%,calc(-50% - 10px));
  }

  100% {
    transform: translate(-50%,-50%);
  }
}
@keyframes smooth {
  0% {
    filter: drop-shadow(0px 0px 0px rgba(255, 255, 255, 0.3));
  }

  50% {
    filter: drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.3));
  }

  100% {
    filter: drop-shadow(0px 0px 0px rgba(255, 255, 255, 0.3));
  }
}

.tw-animate-modalAppear {
    animation: modalAppear 0.5s ease-out forwards;
}

.tw-animate-borderPulse {
    animation: borderPulse 3s infinite ease-in-out;
}

.tw-animate-titleSlide {
    animation: titleSlide 0.6s ease-out forwards;
}

.tw-animate-gridAppear {
    animation: gridAppear 0.8s ease-out forwards;
}

.tw-animate-itemAppear {
    animation: itemAppear 0.5s ease-out forwards;
    animation-fill-mode: both;
}

.tw-animate-spin-once {
    animation: spin-once 0.3s ease-out forwards;
    animation-play-state: paused;
}

.group:hover .tw-animate-spin-once {
    animation-play-state: running;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tw-animate-modalAppear {
    animation-duration: 0.4s;
  }
  .room-line {
    flex-direction: column;
    align-items: flex-start;
    padding-left: 12px;
    h3 {
      margin-bottom: 12px;
    }
    .room-line-options {
      flex-wrap: wrap;
      div {
        margin-bottom: 8px;
      }
    }
  }
  .box-choose-list {
    display: flex;
    .box-item {
      width: 20%;
      font-size: 12px;
      
      .ornament-icon {
        width: 20px;
        height: 20px;
        top: 1px;
        right: 1px;
        
        .icon-eye {
          width: 12px;
          height: 12px;
        }
      }
    }
  }
  .box-choose-title {
    padding-left: 12px;
  }
}

.group {
    --icon-color: #FF7A21;
}
.group:hover {
    --icon-color: white;
}

// 饰品列表弹窗样式（完全复制欧皇记录的样式）
.ornament-dialog {
    background: none;
}

.lucky-modal-wrapper {
    position: relative;
    overflow: hidden;
}

.lucky-modal-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("@/assets/images/open/bg.webp") no-repeat center;
    background-size: cover;
    opacity: 0.3;
    z-index: 0;
    pointer-events: none;
}

.lucky-modal-wrapper .box-item {
    position: relative;
    z-index: 10;
}

.lucky-modal-wrapper .group {
    --icon-color: #ffffff;
}
.lucky-modal-wrapper .group:hover {
    --icon-color: #cccccc;
}
</style>
