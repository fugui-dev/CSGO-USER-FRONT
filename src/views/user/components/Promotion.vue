<script setup>

import {useClipboard} from "@vueuse/core";
import {useUserInfo} from "@/composables/useUesrInfo";
import {ElMessage, ElDialog, ElMessageBox} from "element-plus";
import {useQRCode} from '@vueuse/integrations/useQRCode'
import {computed, ref, onMounted, watch, nextTick} from "vue";
import {useDebounceFn} from "@vueuse/core";
import {
  getPromotionDetailApi, 
  getPromotionUnderPeopleCountApi, 
  getStatisticsPromotionDataApi,
  getPromotionUsersApi,
  getPromotionRechargeRecordsApi,
  getAvailableBalanceApi,
  generateCardInfoApi,
  createGenerateCardApi
} from "@/api";
import BaseButton from "@/components/Btn/BaseButton.vue";
import {useStore} from "@/store";
import {formatDate} from "@/utils/common";

const { copy, text, isSupported } = useClipboard()
const {userInfo} = useUserInfo()
const store = useStore()

// 判断是否为主播
const isAnchor = computed(() => {
  return userInfo.value?.userType === '01'
})

const link=computed(()=>{
  return location.origin+`/#/register?code=${userInfo.value.invitationCode}`
})
const qrcode = useQRCode(link)
const summarize=ref({
  people:0,
  afterDayPre:0,
  commissions:0
})

// Tab页控制
const activeTab = ref(0) // 0: 基本信息, 1: 推广用户列表, 2: 充值记录
const promotionUsers = ref([])
const rechargeRecords = ref([])
const availableBalance = ref(0)
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(20)
const isComplete = ref(false)
const rechargePageNum = ref(1)
const rechargeIsComplete = ref(false)
const promotionUsersScrollRef = ref()
const promotionUsersListRef = ref()
const rechargeRecordsScrollRef = ref()
const rechargeRecordsListRef = ref()

// 生成CDK相关
const showCDKDialog = ref(false)
const cardInfo = ref(null)
const cdkPassword = ref('')

const onCopy=(text)=>{
  console.log(text)
  if (isSupported&&copy(text)){
      ElMessage.success('复制成功')
  }else {
    ElMessage.error('复制失败')
  }
}

const getData=()=>{
  getPromotionDetailApi().then(res=>{
    summarize.value.afterDayPre=res.data.afterDayPre
    summarize.value.commissions=res.data.commissions
  })
  getPromotionUnderPeopleCountApi().then(res=>{
    summarize.value.people=res.data
  })
}

const getS=()=>{
  getStatisticsPromotionDataApi(store.userInfo?.userId).then(res=>{
    summarize.value.rebateTotal = res.data.rebateTotal
    summarize.value.rechargeTotal = res.data.rechargeTotal
    summarize.value.balancedPrice = res.data.balancedPrice
    summarize.value.unbalancedPrice = res.data.unbalancedPrice
    summarize.value.todayRechargeTotal = res.data.todayRechargeTotal
    summarize.value.todayRebateTotal = res.data.todayRebateTotal
    summarize.value.thisWeekRechargeTotal = res.data.thisWeekRechargeTotal
    summarize.value.thisWeekRebateTotal = res.data.thisWeekRebateTotal
  })
}

// 获取推广用户列表
const getPromotionUsers = () => {
  if (loading.value || isComplete.value || !isAnchor.value) return
  
  loading.value = true
  getPromotionUsersApi(pageNum.value, pageSize.value).then(res => {
    if (res.code === 200) {
      if (pageNum.value === 1) {
        promotionUsers.value = []
      }
      if (res.rows && res.rows.length > 0) {
        promotionUsers.value.push(...res.rows)
        if (promotionUsers.value.length >= res.total) {
          isComplete.value = true
        } else {
          // 检查是否需要自动加载更多
          nextTick(() => {
            if (promotionUsersListRef.value && promotionUsersScrollRef.value) {
              if (promotionUsersListRef.value.clientHeight < promotionUsersScrollRef.value.$el.clientHeight) {
                pageNum.value += 1
                getPromotionUsers()
              }
            }
          })
        }
      } else {
        isComplete.value = true
      }
    }
  }).finally(() => {
    loading.value = false
  })
}

// 推广用户列表滚动事件
const debouncedGetPromotionUsers = useDebounceFn(() => {
  if (!isComplete.value) {
    pageNum.value += 1
    getPromotionUsers()
  }
}, 1000)

const onPromotionUsersScroll = (e) => {
  if (loading.value || isComplete.value) return
  let scrollBarHeight = promotionUsersScrollRef.value?.$el?.querySelector(".el-scrollbar__bar:last-child .el-scrollbar__thumb")?.clientHeight || 200
  if (promotionUsersListRef.value && e.scrollTop) {
    if (e.scrollTop + scrollBarHeight + 500 >= promotionUsersListRef.value.clientHeight) {
      debouncedGetPromotionUsers()
    }
  }
}

// 获取充值记录
const getRechargeRecords = () => {
  if (loading.value || rechargeIsComplete.value || !isAnchor.value) return
  
  loading.value = true
  getPromotionRechargeRecordsApi(rechargePageNum.value, pageSize.value).then(res => {
    if (res.code === 200) {
      if (rechargePageNum.value === 1) {
        rechargeRecords.value = []
      }
      if (res.rows && res.rows.length > 0) {
        rechargeRecords.value.push(...res.rows)
        if (rechargeRecords.value.length >= res.total) {
          rechargeIsComplete.value = true
        } else {
          // 检查是否需要自动加载更多
          nextTick(() => {
            if (rechargeRecordsListRef.value && rechargeRecordsScrollRef.value) {
              if (rechargeRecordsListRef.value.clientHeight < rechargeRecordsScrollRef.value.$el.clientHeight) {
                rechargePageNum.value += 1
                getRechargeRecords()
              }
            }
          })
        }
      } else {
        rechargeIsComplete.value = true
      }
    }
  }).finally(() => {
    loading.value = false
  })
}

// 充值记录列表滚动事件
const debouncedGetRechargeRecords = useDebounceFn(() => {
  if (!rechargeIsComplete.value) {
    rechargePageNum.value += 1
    getRechargeRecords()
  }
}, 1000)

const onRechargeRecordsScroll = (e) => {
  if (loading.value || rechargeIsComplete.value) return
  let scrollBarHeight = rechargeRecordsScrollRef.value?.$el?.querySelector(".el-scrollbar__bar:last-child .el-scrollbar__thumb")?.clientHeight || 200
  if (rechargeRecordsListRef.value && e.scrollTop) {
    if (e.scrollTop + scrollBarHeight + 500 >= rechargeRecordsListRef.value.clientHeight) {
      debouncedGetRechargeRecords()
    }
  }
}

// 获取可用余额
const getAvailableBalance = () => {
  if (!isAnchor.value) return
  
  getAvailableBalanceApi().then(res => {
    if (res.code === 200) {
      availableBalance.value = res.data || 0
    }
  })
}

// 获取卡密信息
const handleGetCardInfo = () => {
  if (!isAnchor.value) {
    ElMessage.warning('仅主播可操作')
    return
  }
  
  generateCardInfoApi().then(res => {
    if (res.code === 200) {
      cardInfo.value = res.data
      showCDKDialog.value = true
    } else {
      ElMessage.error(res.msg || '获取卡密信息失败')
    }
  }).catch(err => {
    ElMessage.error('获取卡密信息失败')
    console.error(err)
  })
}

// 生成CDK
const handleGenerateCDK = () => {
  if (!isAnchor.value) {
    ElMessage.warning('仅主播可操作')
    return
  }
  
  if (!cardInfo.value) {
    ElMessage.warning('请先获取卡密信息')
    return
  }
  
  ElMessageBox.confirm(
    `充值总额：${cardInfo.value.rechargeTotal}元\n价格：${cardInfo.value.price}元\n\n确认要生成卡密吗？`,
    '卡密信息确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    createGenerateCardApi().then(res => {
      if (res.code === 200) {
        cdkPassword.value = res.data
        ElMessage.success('卡密生成成功！')
        // 刷新可用余额
        getAvailableBalance()
        // 刷新充值记录
        rechargePageNum.value = 1
        rechargeIsComplete.value = false
        getRechargeRecords()
      } else {
        ElMessage.error(res.msg || '生成卡密失败')
      }
    }).catch(err => {
      ElMessage.error('生成卡密失败')
      console.error(err)
    })
  }).catch(() => {
    // 用户取消
  })
}

// 切换tab
const handleTabChange = (tab) => {
  if (loading.value) return
  activeTab.value = tab
  if (tab === 1) {
    // 推广用户列表
    if (promotionUsers.value.length === 0) {
      getPromotionUsers()
    }
  } else if (tab === 2) {
    // 充值记录
    if (rechargeRecords.value.length === 0) {
      getRechargeRecords()
    }
  }
}

// 监听是否为主播
watch(isAnchor, (newVal) => {
  if (newVal) {
    getAvailableBalance()
  }
}, { immediate: true })

getData()
getS()

</script>

<template>
  <div class="promotion">
    <!-- 按钮切换组 -->
    <div class="nav">
      <div 
        class="nav-item" 
        :class="{ 'active': activeTab === 0 }" 
        @click="handleTabChange(0)">
        <span>基本信息</span>
      </div>
      <div 
        v-if="isAnchor"
        class="nav-item" 
        :class="{ 'active': activeTab === 1 }" 
        @click="handleTabChange(1)">
        <span>推广用户列表</span>
      </div>
      <div 
        v-if="isAnchor"
        class="nav-item" 
        :class="{ 'active': activeTab === 2 }" 
        @click="handleTabChange(2)">
        <span>充值记录</span>
      </div>
    </div>
    
    <!-- Tab内容 -->
    <div class="tab-content-wrapper">
      <!-- Tab 1: 基本信息 -->
      <div v-show="activeTab === 0" class="tab-content">
        <div class="self-title">
          <span>推广链接</span>
        </div>
          <div class="promotion-item no_border">
            <div class="link">
              <div class="link-title">我的推广码:</div>
              <el-input class="link-content" readonly v-model="userInfo.invitationCode"></el-input>
              <BaseButton font-size="13px" style="width: 80px;height: 26px;transform: translateX(-110px);color: #072523;" class="link-btn" @click="onCopy(userInfo.invitationCode)" name="复制"></BaseButton>
            </div>
          </div>
          <div class="promotion-item no_border">
            <div class="link">
              <div class="link-title">我的推广链接:</div>
              <el-input class="link-content" readonly v-model="link"></el-input>
              <BaseButton  font-size="13px" style="width: 80px;height: 26px;transform: translateX(-110px);color: #072523;" class="link-btn" @click="onCopy(link)" name="复制"></BaseButton>
            </div>
            <img :src="qrcode" alt="" class="qr">
          </div>
          
          <div class="self-title">
            <span>推广明细</span>
          </div>
          <div class="promotion-item no_padding">
            <div class="total">
              <div class="total-item">
                <div class="item ellipsis top-left">推广人数</div>
                <div class="item ellipsis bottom-left">{{summarize.people}}</div>
              </div>
              <div class="total-item">
                <div class="item ellipsis">总返佣金额</div>
                <div class="item ellipsis">{{summarize.rebateTotal}}</div>
              </div>
              <div class="total-item">
                <div class="item ellipsis">分佣比例</div>
                <div class="item ellipsis">{{summarize.commissions}}</div>
              </div>
              <div class="total-item">
                <div class="item ellipsis top-right">下级总充值</div>
                <div class="item ellipsis bottom-right">{{summarize.rechargeTotal}}</div>
              </div>
              <div class="total-item">
                <div class="item ellipsis top-left">已结算金额</div>
                <div class="item ellipsis bottom-left">{{summarize.balancedPrice}}</div>
              </div>
              <div class="total-item">
                <div class="item ellipsis">未结算金额</div>
                <div class="item ellipsis">{{summarize.unbalancedPrice}}</div>
              </div>
              <div class="total-item">
                <div class="item ellipsis">明日预计收益</div>
                <div class="item ellipsis">{{summarize.afterDayPre}}</div>
              </div>
              <div class="total-item">
                <div class="item ellipsis top-right">今日总充值</div>
                <div class="item ellipsis bottom-right">{{summarize.todayRechargeTotal}}</div>
              </div>
              <div class="total-item">
                <div class="item ellipsis top-left">今日总返佣</div>
                <div class="item ellipsis bottom-left">{{summarize.todayRebateTotal}}</div>
              </div>
              <div class="total-item">
                <div class="item ellipsis">本周总充值</div>
                <div class="item ellipsis">{{summarize.thisWeekRechargeTotal}}</div>
              </div>
              <div class="total-item">
                <div class="item ellipsis">本周总返佣</div>
                <div class="item ellipsis">{{summarize.thisWeekRebateTotal}}</div>
              </div>
              <div class="total-item">
                <div class="item ellipsis top-right"></div>
                <div class="item ellipsis bottom-right"></div>
              </div>
            </div>
          </div>
      </div>
      
      <!-- Tab 2: 推广用户列表（仅主播可见） -->
      <div v-show="activeTab === 1 && isAnchor" class="tab-content">
          <!-- 推广用户列表 - 使用开箱记录样式 -->
          <div class="records">
            <div class="records-item">
              <div class="item avatar">头像</div>
              <div class="item name">名称</div>
              <div class="item time">推荐时间</div>
            </div>
            <el-scrollbar height="400px" @scroll="onPromotionUsersScroll" ref="promotionUsersScrollRef" v-loading="loading">
              <div class="records-list" ref="promotionUsersListRef">
                <div v-if="promotionUsers.length === 0 && !loading" class="empty-records">暂无数据</div>
                <div class="records-item" v-for="(user, index) in promotionUsers" :key="index">
                  <div class="item avatar">
                    <img :src="user.avatar || '/default-avatar.png'" alt="" />
                  </div>
                  <div class="item name">{{ user.nickName || user.userName }}</div>
                  <div class="item time">{{ user.promotionTime ? formatDate(user.promotionTime) : '-' }}</div>
                </div>
              </div>
            </el-scrollbar>
          </div>
      </div>
      
      <!-- Tab 3: 充值记录（仅主播可见） -->
      <div v-show="activeTab === 2 && isAnchor" class="tab-content">
          <!-- 充值记录列表 - 使用开箱记录样式 -->
          <div class="records">
            <!-- 可用余额和生成CDK按钮 - 右对齐，与列表对齐 -->
            <div class="anchor-header-right">
              <div class="available-balance">
                <span class="balance-label">可用余额：</span>
                <span class="balance-value">{{ availableBalance.toFixed(2) }}元</span>
              </div>
              <BaseButton 
                font-size="14px" 
                style="width: 120px;height: 36px;color: #072523;" 
                @click="handleGetCardInfo" 
                name="生成CDK">
              </BaseButton>
            </div>
            <div class="records-item">
              <div class="item user-id">用户ID</div>
              <div class="item amount">充值金额</div>
              <div class="item time">充值时间</div>
              <div class="item status">状态</div>
            </div>
            <el-scrollbar height="400px" @scroll="onRechargeRecordsScroll" ref="rechargeRecordsScrollRef" v-loading="loading">
              <div class="records-list" ref="rechargeRecordsListRef">
                <div v-if="rechargeRecords.length === 0 && !loading" class="empty-records">暂无数据</div>
                <div class="records-item" v-for="(record, index) in rechargeRecords" :key="index">
                  <div class="item user-id">{{ record.userId }}</div>
                  <div class="item amount">{{ record.amountActuallyPaid }}元</div>
                  <div class="item time">{{ record.createTime ? formatDate(record.createTime) : '-' }}</div>
                  <div class="item status">{{ record.used === 1 ? '已使用' : '未使用' }}</div>
                </div>
              </div>
            </el-scrollbar>
          </div>
      </div>
    </div>
    
    <!-- CDK生成弹窗 -->
    <el-dialog
      v-model="showCDKDialog"
      title="生成CDK"
      width="500px"
      :close-on-click-modal="false">
      <div v-if="cardInfo" class="cdk-dialog-content">
        <div class="cdk-info-item">
          <span class="info-label">充值总额：</span>
          <span class="info-value">{{ cardInfo.rechargeTotal }}元</span>
        </div>
        <div class="cdk-info-item">
          <span class="info-label">卡密价格：</span>
          <span class="info-value">{{ cardInfo.price }}元</span>
        </div>
        <div v-if="cdkPassword" class="cdk-password">
          <div class="password-label">生成的卡密：</div>
          <div class="password-value">{{ cdkPassword }}</div>
          <BaseButton 
            font-size="12px" 
            style="width: 80px;height: 28px;margin-top: 10px;color: #072523;" 
            @click="onCopy(cdkPassword)" 
            name="复制">
          </BaseButton>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCDKDialog = false">取消</el-button>
          <el-button type="primary" @click="handleGenerateCDK">确认生成</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;
$primary-color-user: rgba(245, 76, 54, 0.6);
$records-border-color: #B3B586;
.self-title{
  position: relative;
  width: fit-content;
  margin: 6px 0 !important;

  span {
    position: relative;
    font-size: 16px;
    font-family: "Source Han Sans CN", "Microsoft YaHei", 'sans-serif';
    z-index: 2;
    filter: none !important;
    color: #1D1F22;
  }

  div {
    content: '';
    position: absolute;
    width: 91px;
    height: 10px;
    bottom: -7px;
    left: 0;
    z-index: 0;
  }
}
.qr{
  height: 100%;
  width: 100%;
  max-width: 100px;
  margin-left: 106px;
  margin-top: 24px;
  margin-bottom: -32px;
}
.promotion{
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  background: url('@/assets/images/user/user_info_bg.png') no-repeat;
  background-size: 90% 90%;
  padding: 80px;
  .el-input{
    width: 100%;
    height: 36px;
    background: rgba($color: #70603F, $alpha: 0.59);
    --el-disabled-bg-color: none;
    --el-input-text-color: #1D1F22;
  }
  &-title {
    position: relative;
    width: fit-content;
    margin: 0 30px;

    span {
      position: relative;
      font-size: 24px;
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      color: #fff;
      z-index: 2;
    }

    div {
      content: '';
      position: absolute;
      width: 140%;
      height: 10px;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      background: $primary-color-user;
      z-index: 0;
    }
  }
  &-item{
    width: 100%;
    height: fit-content;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    .link{
      display: flex;
      align-items: center;
      height: 35px;
      width: 100%;
      font-size: 14px;
      &-title{
        color: #1D1F22;
        width: 100px;
        margin-right: 5px;
      }
      &-content{
        display: flex;
        align-items: center;
        flex:1;
      }
      &-btn{
       width: 107px;height: 41px;margin-left: 20px
      }
      }
  }
}

// 主播专属样式
.anchor-section {
  margin-top: 20px;
  
  .anchor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba($color: #70603F, $alpha: 0.59);
    border-radius: 8px;
    
    .available-balance {
      font-size: 16px;
      color: #1D1F22;
      
      .balance-label {
        margin-right: 8px;
      }
      
      .balance-value {
        font-weight: bold;
        color: #F54C36;
      }
    }
  }
  
  // 按钮切换组样式
  .nav {
    display: flex;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 20px;
    gap: 10px;
    flex-wrap: wrap;
    
    .nav-item {
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "PingFang Regular", sans-serif;
      cursor: pointer;
      background: rgba($color: #70603F, $alpha: 0.59);
      flex-shrink: 0;
      min-width: 120px;
      height: 36px;
      border-radius: 8px;
      font-size: 14px;
      color: #1D1F22;
      transition: all 0.3s;
      
      span {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 16px;
      }
      
      &.active {
        background: rgba($color: #1EBCAF, $alpha: 0.8);
        color: #fff;
        
        span {
          filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
        }
      }
      
      &:hover:not(.active) {
        background: rgba($color: #70603F, $alpha: 0.8);
      }
    }
  }
  
  .tab-content-wrapper {
    width: 100%;
  }
  
  .tab-content {
    padding: 20px 0;
  }
}

// 推广用户列表 - 使用开箱记录样式（放在外层，不在anchor-section内）
.records {
  padding: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
  font-size: 13px;
  
  &-list {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  
  &-item {
    align-self: center;
    width: 80%;
    height: 48px;
    background: rgba($color: #000000, $alpha: 0.59);
    border: 1px solid $records-border-color;
    border-radius: 8px;
    margin-bottom: 10px;
    display: flex;
    
    .item {
      width: 33.33%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      
      &.avatar {
        img {
          height: 90%;
          width: auto;
          border-radius: 50%;
          object-fit: cover;
        }
      }
      
      &.name {
        font-size: 13px;
        color: #fff;
      }
      
      &.time {
        font-size: 13px;
        color: #fff;
      }
    }
  }
  
  .empty-records {
    text-align: center;
    padding: 40px;
    color: #999;
    width: 80%;
    align-self: center;
  }
}

// 充值记录特殊样式（4列）
.records .records-item {
  .item {
    &.user-id,
    &.amount,
    &.time,
    &.status {
      width: 25% !important;
    }
  }
}

// 可用余额和生成CDK按钮 - 右对齐（放在records内部，与列表对齐）
.records {
  .anchor-header-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    width: 80%;
    align-self: center;
    
    .available-balance {
      font-size: 16px;
      color: #1D1F22;
      
      .balance-label {
        margin-right: 8px;
      }
      
      .balance-value {
        font-weight: bold;
        color: #F54C36;
      }
    }
  }
}

.cdk-dialog-content {
  padding: 20px 0;
  
  .cdk-info-item {
    margin-bottom: 15px;
    font-size: 14px;
    
    .info-label {
      color: #666;
      margin-right: 10px;
    }
    
    .info-value {
      color: #1D1F22;
      font-weight: bold;
    }
  }
  
  .cdk-password {
    margin-top: 20px;
    padding: 15px;
    background: rgba($color: #70603F, $alpha: 0.2);
    border-radius: 8px;
    
    .password-label {
      margin-bottom: 10px;
      color: #1D1F22;
      font-size: 14px;
    }
    
    .password-value {
      font-size: 16px;
      font-weight: bold;
      color: #F54C36;
      word-break: break-all;
      margin-bottom: 10px;
    }
  }
}

.total{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  font-size: 12px;
  color: #1D1F22;
  width: 80%;
  .top-left {
    border-top-left-radius: 8px;
  }
  .top-right {
    border-top-right-radius: 8px;
  }
  .bottom-left {
    border-bottom-left-radius: 8px;
  }
  .bottom-right {
    border-bottom-right-radius: 8px;
  }
  &-item{
    display: flex;
    flex-direction: column;
    width:25%;
    @include mobile{
      width:33.33%;
    }

    .item{
      display: flex;
      align-items: center;
      justify-content: center;
      height: 1.6em;
      background: rgba($color: #70603F, $alpha: 0.59);
      &:nth-child(2) {
        margin-bottom: 10px;
      }
    }
  }
}
.list{
  display: flex;
  flex-direction: column;
  &-item{
    display: grid;
    grid-template-columns: repeat(3,1fr);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    height: 3em;


    &:first-child{
      background: #FFD9D933;

    }
    &:last-child{
      border-bottom: none;
    }
    .item{
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

</style>
