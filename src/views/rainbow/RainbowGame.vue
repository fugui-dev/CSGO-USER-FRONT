<template>
  <div class="rainbow-page">
    <!-- 顶部：轮盘区 -->
    <div class="wheel-section">
      <!-- 开奖记录横条 -->
      <div class="recent-bar">
        <span class="bar-label">开奖记录</span>
        <div class="bar-items">
          <div
            v-for="r in recentResults"
            :key="r.gameNo"
            class="bar-badge"
            :style="{ background: colorBg(r.resultColor) }"
            :title="`${itemName(r.resultItem)} + ${colorName(r.resultColor)}`"
          >
            <span class="badge-icon">{{ itemIcon(r.resultItem) }}</span>
          </div>
        </div>
      </div>

      <!-- 双轮盘 -->
      <div class="wheel-container">
        <!-- 内圈（静止色环） -->
        <svg class="inner-ring" viewBox="0 0 200 200">
          <g v-for="(seg, idx) in innerSegments" :key="idx">
            <path :d="seg.d" :fill="seg.fill" stroke="#1a1a2e" stroke-width="1" />
          </g>
        </svg>

        <!-- 外圈（旋转） -->
        <svg
          class="outer-ring"
          viewBox="0 0 300 300"
          :style="{ transform: `rotate(${outerAngle}deg)`, transition: outerTransition }"
        >
          <g v-for="(seg, idx) in outerSegments" :key="idx">
            <path :d="seg.d" :fill="seg.fill" stroke="#1a1a2e" stroke-width="1.5" />
            <text
              :x="seg.tx"
              :y="seg.ty"
              :transform="`rotate(${seg.textAngle}, ${seg.tx}, ${seg.ty})`"
              class="outer-text"
              text-anchor="middle"
              dominant-baseline="middle"
            >{{ seg.icon }}</text>
          </g>
        </svg>

        <!-- 指针（旋转） -->
        <svg
          class="pointer-ring"
          viewBox="0 0 300 300"
          :style="{ transform: `rotate(${pointerAngle}deg)`, transition: pointerTransition }"
        >
          <polygon points="150,10 143,50 157,50" fill="#FFD700" stroke="#FF8C00" stroke-width="2" />
        </svg>

        <!-- 中心信息 -->
        <div class="center-info">
          <div v-if="gameStatus === 0" class="countdown-wrap">
            <span class="countdown-num">{{ countdownSeconds }}</span>
            <span class="countdown-label">秒</span>
          </div>
          <div v-else-if="gameStatus === 1" class="opening-wrap">
            <span class="opening-text">开奖中</span>
          </div>
          <div v-else class="result-wrap">
            <span class="result-label">{{ itemName(currentGame.resultItem) }}</span>
            <span class="result-color" :style="{ color: colorHex(currentGame.resultColor) }">
              {{ colorName(currentGame.resultColor) }}
            </span>
            <span class="result-multiplier">× {{ currentGame.resultMultiplier }}</span>
          </div>
          <div class="game-no">{{ currentGame.gameNo }}</div>
        </div>
      </div>
    </div>

    <!-- 下注区 -->
    <div class="bet-section">
      <!-- 12种结果卡片 -->
      <div class="bet-grid">
        <div
          v-for="opt in betOptions"
          :key="`${opt.item}_${opt.color}`"
          class="bet-card"
          :class="{
            selected: isSelected(opt),
            disabled: gameStatus !== 0
          }"
          :style="{ borderColor: colorHex(opt.color) }"
          @click="selectOption(opt)"
        >
          <!-- 遗漏数字叠层 -->
          <div v-if="showMiss" class="miss-badge">{{ getMissCount(opt) }}局</div>
          <!-- 物品图标+颜色 -->
          <div class="card-icon-wrap" :style="{ background: colorBg(opt.color) }">
            <span class="card-icon">{{ itemIcon(opt.item) }}</span>
          </div>
          <div class="card-info">
            <span class="card-name">{{ itemName(opt.item) }}</span>
            <span class="card-color" :style="{ color: colorHex(opt.color) }">{{ colorName(opt.color) }}</span>
            <span class="card-multiplier">{{ opt.multiplier }}×</span>
          </div>
          <div class="card-stats">
            <span>{{ opt.betCount }}人</span>
            <span>{{ opt.betTotal }}币</span>
          </div>
        </div>
      </div>

      <!-- 金额档位 -->
      <div class="amount-row">
        <button
          v-for="amt in amounts"
          :key="amt"
          class="amt-btn"
          :class="{ active: selectedAmount === amt }"
          @click="selectedAmount = amt"
        >{{ amt }}</button>
      </div>

      <!-- 操作按钮 -->
      <div class="action-row">
        <button class="btn-confirm" :disabled="!selectedOption || gameStatus !== 0" @click="handleBet">
          确认下注
        </button>
        <button class="btn-cancel" :disabled="gameStatus !== 0" @click="handleCancel">
          清除下注
        </button>
      </div>
    </div>

    <!-- 功能按钮区 -->
    <div class="tool-row">
      <button class="tool-btn" @click="toggleDropPreview">掉落</button>
      <button class="tool-btn" :class="{ active: showMiss }" @click="toggleMiss">遗漏</button>
      <button class="tool-btn" @click="showRecord = true">记录</button>
    </div>

    <!-- 掉落预览弹窗 -->
    <div v-if="showDropPreview" class="modal-overlay" @click.self="showDropPreview = false">
      <div class="modal-box">
        <div class="modal-title">掉落预览（下注 {{ selectedAmount }} 币）</div>
        <div class="drop-list">
          <div v-for="d in dropPreviewList" :key="`${d.item}_${d.color}`" class="drop-item">
            <span class="drop-name">{{ itemName(d.item) }} + {{ colorName(d.color) }}</span>
            <span class="drop-x">{{ d.multiplier }}×</span>
            <span class="drop-reward">{{ d.reward }} 币</span>
          </div>
        </div>
        <button class="modal-close" @click="showDropPreview = false">关闭</button>
      </div>
    </div>

    <!-- 记录弹窗 -->
    <div v-if="showRecord" class="modal-overlay" @click.self="showRecord = false">
      <div class="modal-box modal-record">
        <div class="record-tabs">
          <button
            v-for="tab in recordTabs"
            :key="tab.key"
            :class="{ active: activeRecordTab === tab.key }"
            @click="switchRecordTab(tab.key)"
          >{{ tab.label }}</button>
        </div>

        <!-- 游戏走势 -->
        <div v-if="activeRecordTab === 'trend'" class="trend-list">
          <div v-for="r in fullHistory" :key="r.gameNo" class="trend-item">
            <span class="t-no">{{ r.gameNo }}</span>
            <span class="t-badge" :style="{ background: colorBg(r.resultColor) }">
              {{ itemIcon(r.resultItem) }}
            </span>
            <span class="t-name">{{ itemName(r.resultItem) }}+{{ colorName(r.resultColor) }}</span>
            <span class="t-multi">{{ r.resultMultiplier }}×</span>
          </div>
        </div>

        <!-- 游戏历史（同走势，更多数据） -->
        <div v-if="activeRecordTab === 'history'" class="trend-list">
          <div v-for="r in fullHistory" :key="r.gameNo + 'h'" class="trend-item">
            <span class="t-no">{{ r.gameNo }}</span>
            <span class="t-badge" :style="{ background: colorBg(r.resultColor) }">
              {{ itemIcon(r.resultItem) }}
            </span>
            <span class="t-name">{{ itemName(r.resultItem) }}+{{ colorName(r.resultColor) }}</span>
            <span class="t-multi">{{ r.resultMultiplier }}×</span>
            <span class="t-time">{{ r.createTime }}</span>
          </div>
        </div>

        <!-- 我的记录 -->
        <div v-if="activeRecordTab === 'mine'" class="mine-list">
          <div v-for="rec in myRecords" :key="rec.id" class="mine-item">
            <span class="m-no">{{ rec.gameNo }}</span>
            <span class="m-bet">下注：{{ itemName(rec.betItem) }}+{{ colorName(rec.betColor) }} {{ rec.betAmount }}币</span>
            <span class="m-win" :class="{ win: rec.isWin }">
              {{ rec.isWin ? `+${rec.winAmount}` : `-${rec.betAmount}` }}
            </span>
          </div>
        </div>

        <button class="modal-close" @click="showRecord = false">关闭</button>
      </div>
    </div>

    <!-- 开奖结果浮层 -->
    <transition name="result-toast">
      <div v-if="showResultToast" class="result-toast">
        <div class="toast-content">
          <div class="toast-title">本局结果</div>
          <div class="toast-result"
               :style="{ color: colorHex(currentGame.resultColor) }">
            {{ itemName(currentGame.resultItem) }} + {{ colorName(currentGame.resultColor) }}
          </div>
          <div class="toast-multi">× {{ currentGame.resultMultiplier }}</div>
          <div v-if="isWinThisRound" class="toast-win">
            <span>恭喜获奖！获得饰品</span>
            <img v-if="winOrnament.img" :src="winOrnament.img" class="toast-ornament-img" />
            <span class="toast-ornament-name">{{ winOrnament.name }}</span>
            <span v-if="winOrnament.price" class="toast-ornament-price">￥{{ winOrnament.price }}</span>
            <span v-if="winOrnament.count > 1" class="toast-ornament-count">共 {{ winOrnament.count }} 个，详见背包</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  getRainbowCurrentApi,
  placeBetApi,
  cancelBetApi,
  getDropPreviewApi,
  getMissStatisticsApi,
  getRecentHistoryApi,
  getMyBetRecordsApi
} from '@/api/rainbow.js'
import { connect, disconnect, getWsStatus } from '@/utils/rainbowWs.js'
import { useUserInfo } from '@/composables/useUesrInfo.js'

// ========================
//  常量定义
// ========================
const ITEM_NAMES = { 1: '蓝色圆球', 2: '紫色圆柱', 3: '红色三角', 4: '黄色正方' }
const ITEM_ICONS = { 1: '🔵', 2: '🟣', 3: '🔺', 4: '🟡' }
const COLOR_NAMES = { 1: '紫色', 2: '红色', 3: '黄色' }
const COLOR_HEX   = { 1: '#9B59B6', 2: '#E74C3C', 3: '#F39C12' }
const COLOR_BG    = { 1: 'rgba(155,89,182,0.7)', 2: 'rgba(231,76,60,0.7)', 3: 'rgba(243,156,18,0.7)' }
const AMOUNTS = [5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]

const itemName   = (i) => ITEM_NAMES[i] || ''
const itemIcon   = (i) => ITEM_ICONS[i] || ''
const colorName  = (c) => COLOR_NAMES[c] || ''
const colorHex   = (c) => COLOR_HEX[c] || '#fff'
const colorBg    = (c) => COLOR_BG[c] || 'rgba(255,255,255,0.2)'

// ========================
//  内圈：24格静止色环 SVG
//  紫=10格 红=8格 黄=6格（总24格）
// ========================
const INNER_COLORS = [
  ...Array(10).fill(1), // 紫
  ...Array(8).fill(2),  // 红
  ...Array(6).fill(3),  // 黄
]
const INNER_R_OUT = 95, INNER_R_IN = 60, INNER_CX = 100, INNER_CY = 100
const innerSegments = INNER_COLORS.map((c, i) => {
  const total = INNER_COLORS.length
  const startAngle = (i / total) * 360 - 90
  const endAngle = ((i + 1) / total) * 360 - 90
  const s = startAngle * Math.PI / 180
  const e = endAngle * Math.PI / 180
  const x1 = INNER_CX + INNER_R_OUT * Math.cos(s)
  const y1 = INNER_CY + INNER_R_OUT * Math.sin(s)
  const x2 = INNER_CX + INNER_R_OUT * Math.cos(e)
  const y2 = INNER_CY + INNER_R_OUT * Math.sin(e)
  const x3 = INNER_CX + INNER_R_IN * Math.cos(e)
  const y3 = INNER_CY + INNER_R_IN * Math.sin(e)
  const x4 = INNER_CX + INNER_R_IN * Math.cos(s)
  const y4 = INNER_CY + INNER_R_IN * Math.sin(s)
  return {
    d: `M ${x1} ${y1} A ${INNER_R_OUT} ${INNER_R_OUT} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${INNER_R_IN} ${INNER_R_IN} 0 0 0 ${x4} ${y4} Z`,
    fill: COLOR_BG[c]
  }
})

// ========================
//  外圈：24格物品 SVG
//  物品1=11格 物品2=8格 物品3=3格 物品4=2格（总24格）
// ========================
const OUTER_ITEMS = [
  ...Array(11).fill(1),
  ...Array(8).fill(2),
  ...Array(3).fill(3),
  ...Array(2).fill(4),
]
const OUTER_R_OUT = 148, OUTER_R_IN = 110, OUTER_CX = 150, OUTER_CY = 150
const OUTER_ITEM_COLORS = { 1: '#4A90E2', 2: '#9B59B6', 3: '#E74C3C', 4: '#F39C12' }
const outerSegments = OUTER_ITEMS.map((item, i) => {
  const total = OUTER_ITEMS.length
  const startAngle = (i / total) * 360 - 90
  const endAngle = ((i + 1) / total) * 360 - 90
  const midAngle = ((startAngle + endAngle) / 2) * Math.PI / 180
  const s = startAngle * Math.PI / 180
  const e = endAngle * Math.PI / 180
  const x1 = OUTER_CX + OUTER_R_OUT * Math.cos(s)
  const y1 = OUTER_CY + OUTER_R_OUT * Math.sin(s)
  const x2 = OUTER_CX + OUTER_R_OUT * Math.cos(e)
  const y2 = OUTER_CY + OUTER_R_OUT * Math.sin(e)
  const x3 = OUTER_CX + OUTER_R_IN * Math.cos(e)
  const y3 = OUTER_CY + OUTER_R_IN * Math.sin(e)
  const x4 = OUTER_CX + OUTER_R_IN * Math.cos(s)
  const y4 = OUTER_CY + OUTER_R_IN * Math.sin(s)
  const textR = (OUTER_R_OUT + OUTER_R_IN) / 2
  const tx = OUTER_CX + textR * Math.cos(midAngle)
  const ty = OUTER_CY + textR * Math.sin(midAngle)
  const textAngle = (startAngle + endAngle) / 2 + 90
  return {
    d: `M ${x1} ${y1} A ${OUTER_R_OUT} ${OUTER_R_OUT} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${OUTER_R_IN} ${OUTER_R_IN} 0 0 0 ${x4} ${y4} Z`,
    fill: OUTER_ITEM_COLORS[item],
    tx, ty, textAngle,
    icon: ITEM_ICONS[item]
  }
})

// ========================
//  响应式状态
// ========================
const currentGame = ref({ gameNo: '', status: 0, countdownSeconds: 25, betOptions: [], recentResults: [] })
const betOptions = computed(() => currentGame.value.betOptions || [])
const recentResults = computed(() => currentGame.value.recentResults || [])
const gameStatus = computed(() => currentGame.value.status ?? 0)
const countdownSeconds = ref(25)

// 本地倒计时定时器（每秒 -1，WS 推送时以服务端值为准校正）
let countdownTimer = null
const startLocalCountdown = () => {
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value--
    }
  }, 1000)
}
const stopLocalCountdown = () => {
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
}

const selectedOption = ref(null)
const selectedAmount = ref(100)
const amounts = AMOUNTS

// 动画状态
const outerAngle = ref(0)
const pointerAngle = ref(0)
const outerTransition = ref('none')
const pointerTransition = ref('none')

// UI状态
const showDropPreview = ref(false)
const dropPreviewList = ref([])
const showMiss = ref(false)
const missData = ref([])
const showRecord = ref(false)
const activeRecordTab = ref('trend')
const fullHistory = ref([])
const myRecords = ref([])
const recordTabs = [
  { key: 'trend', label: '游戏走势' },
  { key: 'history', label: '游戏历史' },
  { key: 'mine', label: '我的记录' }
]

// 结果浮层
const showResultToast = ref(false)
const isWinThisRound = ref(false)
const winThisRound = ref(0)
const winOrnament = ref({ name: '', img: '', price: null })

let lastGameId = null
let lastStatus = null
// 保存上一局的 myBets，供结算动画结束后判断中奖
let savedMyBets = []
// 当前登录用户 ID（供 WS 连接使用）
let currentUserId = 0

// ========================
//  选项辅助
// ========================
const isSelected = (opt) =>
  selectedOption.value &&
  selectedOption.value.item === opt.item &&
  selectedOption.value.color === opt.color

const selectOption = (opt) => {
  if (gameStatus.value !== 0) return
  if (isSelected(opt)) {
    selectedOption.value = null
  } else {
    selectedOption.value = opt
  }
}

const getMissCount = (opt) => {
  const found = missData.value.find(m => m.item == opt.item && m.color == opt.color)
  return found ? found.missCount : 0
}

// ========================
//  API 方法
// ========================

/**
 * 初始化时通过 HTTP 获取当前局状态（WS 断线降级兜底也可复用）
 */
const fetchCurrent = async () => {
  try {
    const res = await getRainbowCurrentApi()
    if (res.code === 200 && res.data) {
      applyGameState(res.data)
    }
  } catch (e) {
    console.error('获取彩虹状态失败', e)
  }
}

/**
 * 统一处理游戏状态变更（HTTP 初始化 和 WS game_state 消息共用）
 */
const applyGameState = (data) => {
  const prev = lastStatus
  const newStatus = data.status
  const newGameId = data.gameId

  // 状态变为 1（开奖中）：立即触发转盘旋转动画，保存 myBets 供后续判断
  if (prev !== 1 && newStatus === 1) {
    savedMyBets = data.myBets || []
    triggerSpinAnimation()
  }

  // 检测新局开始（status 从非0 变为 0，或 gameId 变化）
  if (lastGameId && lastGameId !== newGameId && newStatus === 0) {
    selectedOption.value = null
  }

  currentGame.value = data

  // 同步服务端倒计时（status=0 时以服务端值为准并启动本地定时器）
  if (newStatus === 0) {
    countdownSeconds.value = data.countdownSeconds || 0
    startLocalCountdown()
  } else {
    stopLocalCountdown()
  }

  lastStatus = newStatus
  lastGameId = newGameId
}

/**
 * WebSocket 消息处理
 * - type=game_state  → 更新游戏状态、倒计时、betOptions
 * - type=settle_result → 触发定位动画、展示中奖结果
 */
const onWsMessage = (msg) => {
  if (!msg || !msg.type) return

  if (msg.type === 'game_state') {
    applyGameState(msg)
  } else if (msg.type === 'bet_update') {
    // 有人下注/撤注，实时刷新各选项的人数和金额
    // eslint-disable-next-line eqeqeq
    if (msg.betOptions && msg.gameId == currentGame.value.gameId) {
      currentGame.value = { ...currentGame.value, betOptions: msg.betOptions }
      console.log('[RainbowWs] bet_update 已应用 gameId=', msg.gameId)
    } else {
      console.warn('[RainbowWs] bet_update gameId 不匹配，msg.gameId=', msg.gameId, 'currentGame.gameId=', currentGame.value.gameId)
    }
  } else if (msg.type === 'settle_ready') {
    // 开奖结果已算出，触发转盘定位动画，此时中心仍显示开奖中
    triggerSettleAnimation(msg.resultItem, msg.resultColor, msg.resultMultiplier)
  } else if (msg.type === 'settle_result') {
    // 转盘已停稳（后端延迟6s才推此消息），更新 currentGame 并弹 Toast
    stopLocalCountdown()
    lastStatus = 2
    currentGame.value = {
      ...currentGame.value,
      status: 2,
      resultItem: msg.resultItem,
      resultColor: msg.resultColor,
      resultMultiplier: msg.resultMultiplier,
      recentResults: msg.recentResults || currentGame.value.recentResults
    }
    // 优先从后端 winAmounts 映射中取本人中奖金额（精确值）
    // winAmounts: { "userId": winAmount }
    let myWinAmount = null
    if (msg.winAmounts && currentUserId) {
      const amt = msg.winAmounts[String(currentUserId)]
      if (amt != null) myWinAmount = parseFloat(amt)
    }
    // 降级：本地 savedMyBets 计算（兼容旧逻辑）
    if (myWinAmount === null) {
      const winBet = savedMyBets.find(
        b => b.betItem === msg.resultItem && b.betColor === msg.resultColor
      )
      myWinAmount = winBet ? parseFloat(winBet.betAmount) * parseFloat(msg.resultMultiplier) : 0
    }
    isWinThisRound.value = myWinAmount > 0
    winThisRound.value = myWinAmount > 0 ? myWinAmount.toFixed(2) : 0
    // 从 winOrnaments 取本人获得的饰品列表（按下注金额档位，每档一个饰品）
    // winOrnaments: { "userId": [{ betAmount, betCount, ornamentName, ornamentImg, ornamentPrice, boxRecordId }] }
    const myOrnamentList = (msg.winOrnaments && currentUserId)
      ? (msg.winOrnaments[String(currentUserId)] || [])
      : []
    // 取第一个饰品作为 Toast 展示（多档位时仅展示首个，完整列表可在背包查看）
    const firstOrnament = myOrnamentList[0] || null
    // 取首个饰品的背包记录ID（用于分解操作）
    const firstBoxRecordId = firstOrnament ? (firstOrnament.boxRecordId || null) : null
    winOrnament.value = firstOrnament
      ? {
          name: firstOrnament.ornamentName || '',
          img: firstOrnament.ornamentImg || '',
          price: firstOrnament.ornamentPrice != null ? parseFloat(firstOrnament.ornamentPrice).toFixed(2) : null,
          count: myOrnamentList.reduce((sum, o) => sum + (o.betCount || 1), 0),
          boxRecordId: firstBoxRecordId
        }
      : { name: '', img: '', price: null, count: 0, boxRecordId: null }
    showResultToast.value = true
    setTimeout(() => { showResultToast.value = false }, 3000)
  }
}

// 转盘持续旋转（status=1 时，开奖动画）
const triggerSpinAnimation = () => {
  outerTransition.value = 'transform 3s linear'
  pointerTransition.value = 'transform 2.5s linear'
  outerAngle.value += 1080
  pointerAngle.value += 720
}

const triggerSettleAnimation = (resultItem, resultColor, multiplier) => {
  // 计算外圈目标停止角（让目标格转到顶部指针位置）
  // 外圈顺时针旋转，顶部指针固定在0°，目标格中心原始角度 segCenterDeg
  // 需要让 segCenterDeg 转到顶部（0°），即外圈再转 (360 - segCenterDeg) % 360
  const outerStopDeg = calcOuterStopDeg(resultItem)
  // 计算指针目标停止角（指针旋转指向内圈对应颜色格）
  // 内圈静止，指针顺时针旋转，目标色格中心在 segCenterDeg，指针转到那里
  const pointerStopDeg = calcPointerStopDeg(resultColor)

  // Phase1：先快速多转几圈（视觉上匀速旋转）
  outerTransition.value = 'transform 2.5s linear'
  pointerTransition.value = 'transform 2s linear'
  outerAngle.value += 1080
  pointerAngle.value += 720

  // Phase2：外圈减速停到目标格
  setTimeout(() => {
    outerTransition.value = 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    // 当前累计角 mod 360 = 当前实际朝向，要到达 outerStopDeg 还需转多少
    const cur = ((outerAngle.value % 360) + 360) % 360
    const delta = ((outerStopDeg - cur) + 360) % 360 || 360 // 至少再转一格
    outerAngle.value += delta
  }, 2600)

  // Phase3：指针减速停到目标色
  setTimeout(() => {
    pointerTransition.value = 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    const cur = ((pointerAngle.value % 360) + 360) % 360
    const delta = ((pointerStopDeg - cur) + 360) % 360 || 360
    pointerAngle.value += delta
  }, 2200)

  // Toast 由 settle_result 消息触发，此处不再负责
}

/**
 * 外圈停止角：让目标物品格的中心转到顶部（12点，即0°/360°位置）
 * 外圈 SVG 中各格从 -90° 开始排列，顺时针。
 * 格 segIdx 的中心原始角 = (segIdx + 0.5) / 24 * 360 - 90
 * 外圈旋转 R 度后，该格实际朝向 = 原始角 + R
 * 要让格到达顶部（-90° 即 270° 等效），需要 R 使得 (原始角 + R) ≡ -90 (mod 360)
 * => R = (-90 - 原始角 + 360k)，取最小正值
 * 简化：outerStopDeg = (360 - (原始角 + 90) % 360) % 360
 */
const calcOuterStopDeg = (resultItem) => {
  const OUTER_ITEM_OFFSETS = { 1: 0, 2: 11, 3: 19, 4: 22 }
  const segIdx = (OUTER_ITEM_OFFSETS[resultItem] ?? 0)
  const segCenterRaw = (segIdx + 0.5) / 24 * 360 - 90 // 格中心在SVG中的原始角度
  return ((360 - ((segCenterRaw + 90) % 360 + 360) % 360) + 360) % 360
}

/**
 * 指针停止角：指针旋转到内圈目标颜色格的中心
 * 内圈静止，格 segIdx 的中心原始角 = (segIdx + 0.5) / 24 * 360 - 90
 * 指针初始指向正上方（-90°），旋转 R 度后指向 -90 + R
 * 要让指针指向目标格中心 segCenterRaw：R = segCenterRaw - (-90) = segCenterRaw + 90
 */
const calcPointerStopDeg = (resultColor) => {
  const COLOR_OFFSETS = { 1: 0, 2: 10, 3: 18 }
  const segIdx = (COLOR_OFFSETS[resultColor] ?? 0)
  const segCenterRaw = (segIdx + 0.5) / 24 * 360 - 90
  return ((segCenterRaw + 90) % 360 + 360) % 360
}

// 下注
const { fetchUserInfo } = useUserInfo()

const handleBet = async () => {
  if (!selectedOption.value) return
  console.log('[Bet] WS状态:', getWsStatus(), '| gameId:', currentGame.value.gameId)
  try {
    await placeBetApi({
      betItem: selectedOption.value.item,
      betColor: selectedOption.value.color,
      betAmount: selectedAmount.value
    })
    console.log('[Bet] 下注HTTP成功，等待WS bet_update广播...')
    // 下注成功后刷新用户信息（余额）
    fetchUserInfo()
    alert('下注成功')
  } catch (e) {
    console.error('[Bet] 下注失败', e)
    alert(e.message || '下注失败')
  }
}

// 清除下注
const handleCancel = async () => {
  if (!currentGame.value.gameId) return
  try {
    const res = await cancelBetApi(currentGame.value.gameId)
    alert(`已退还 ${res.data} 币`)
    // 撤注成功后刷新用户信息（余额）
    fetchUserInfo()
  } catch (e) {
    alert(e.message || '取消失败')
  }
}

// 掉落预览
const toggleDropPreview = async () => {
  if (!showDropPreview.value) {
    const res = await getDropPreviewApi(selectedAmount.value)
    dropPreviewList.value = res.data || []
    showDropPreview.value = true
  } else {
    showDropPreview.value = false
  }
}

// 遗漏
const toggleMiss = async () => {
  if (!showMiss.value) {
    const res = await getMissStatisticsApi()
    missData.value = res.data || []
    showMiss.value = true
  } else {
    showMiss.value = false
  }
}

// 记录Tab切换
const switchRecordTab = async (tab) => {
  activeRecordTab.value = tab
  if (tab === 'trend' || tab === 'history') {
    const res = await getRecentHistoryApi()
    fullHistory.value = res.data || []
  } else if (tab === 'mine') {
    const res = await getMyBetRecordsApi()
    myRecords.value = res.rows || res.data || []
  }
}

// ========================
//  生命周期
// ========================
onMounted(async () => {
  // 1. 先通过 HTTP 获取初始状态（保证页面打开即有数据）
  await fetchCurrent()
  // 2. 建立 WebSocket 连接，后续状态更新由服务端主动推送
  try {
    // 尝试从本地存储读取用户 ID（与项目其他地方保持一致）
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    currentUserId = userInfo.userId || userInfo.id || 0
  } catch (_) {
    currentUserId = 0
  }
  connect(currentUserId, onWsMessage)
})

onUnmounted(() => {
  disconnect()
  stopLocalCountdown()
})
</script>

<style scoped>
.rainbow-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #16213e 100%);
  color: #fff;
  padding-bottom: 80px;
  font-family: 'PingFang SC', sans-serif;
}

/* 轮盘区 */
.wheel-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
}

.recent-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 400px;
  padding: 8px 16px;
  overflow-x: auto;
}
.bar-label { font-size: 12px; color: #aaa; white-space: nowrap; }
.bar-items { display: flex; gap: 6px; }
.bar-badge {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}

/* 轮盘容器 */
.wheel-container {
  position: relative;
  width: 320px; height: 320px;
  margin: 12px auto;
}

.inner-ring {
  position: absolute;
  width: 212px; height: 212px;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.outer-ring {
  position: absolute;
  width: 320px; height: 320px;
  top: 0; left: 0;
  z-index: 2;
  transform-origin: center;
}

.pointer-ring {
  position: absolute;
  width: 320px; height: 320px;
  top: 0; left: 0;
  z-index: 3;
  transform-origin: center;
}

.outer-text { font-size: 10px; fill: #fff; }

.center-info {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  text-align: center;
  width: 90px;
}
.countdown-num { font-size: 36px; font-weight: bold; color: #FFD700; line-height: 1; }
.countdown-label { font-size: 12px; color: #aaa; }
.opening-text { font-size: 16px; color: #FFD700; animation: blink 0.5s infinite; }
.result-label { display: block; font-size: 11px; color: #ccc; }
.result-color { display: block; font-size: 14px; font-weight: bold; }
.result-multiplier { display: block; font-size: 18px; font-weight: bold; color: #FFD700; }
.game-no { font-size: 10px; color: #666; margin-top: 4px; }

@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

/* 下注区 */
.bet-section { padding: 0 12px; max-width: 480px; margin: 0 auto; }

.bet-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.bet-card {
  border: 2px solid transparent;
  border-radius: 10px;
  background: rgba(255,255,255,0.05);
  padding: 8px 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  text-align: center;
}
.bet-card.selected { background: rgba(255,255,255,0.15); box-shadow: 0 0 12px rgba(255,215,0,0.5); }
.bet-card.disabled { opacity: 0.6; cursor: not-allowed; }

.miss-badge {
  position: absolute; top: 4px; right: 4px;
  background: rgba(0,0,0,0.6); border-radius: 4px;
  font-size: 10px; color: #FFD700; padding: 1px 4px;
}

.card-icon-wrap {
  width: 40px; height: 40px; border-radius: 50%;
  margin: 0 auto 4px; display: flex; align-items: center; justify-content: center;
}
.card-icon { font-size: 20px; }
.card-info { display: flex; flex-direction: column; gap: 2px; }
.card-name { font-size: 10px; color: #ccc; }
.card-color { font-size: 10px; }
.card-multiplier { font-size: 14px; font-weight: bold; color: #FFD700; }
.card-stats { margin-top: 4px; font-size: 10px; color: #888; display: flex; justify-content: space-between; }

/* 金额档位 */
.amount-row {
  display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;
}
.amt-btn {
  flex: 1; min-width: 48px; padding: 6px 0;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; color: #fff; font-size: 13px; cursor: pointer;
  transition: all 0.2s;
}
.amt-btn.active { background: #FFD700; color: #1a1a2e; font-weight: bold; border-color: #FFD700; }

/* 操作按钮 */
.action-row { display: flex; gap: 10px; margin-bottom: 12px; }
.btn-confirm {
  flex: 2; padding: 12px; border-radius: 8px; border: none;
  background: linear-gradient(135deg, #FFD700, #FF8C00);
  color: #1a1a2e; font-size: 16px; font-weight: bold; cursor: pointer;
}
.btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel {
  flex: 1; padding: 12px; border-radius: 8px;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 14px; cursor: pointer;
}
.btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }

/* 工具栏 */
.tool-row { display: flex; gap: 10px; padding: 0 12px; max-width: 480px; margin: 0 auto; }
.tool-btn {
  flex: 1; padding: 10px; border-radius: 8px;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
  color: #ccc; font-size: 14px; cursor: pointer;
}
.tool-btn.active { color: #FFD700; border-color: #FFD700; }

/* 弹窗通用 */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  display: flex; align-items: flex-end; justify-content: center; z-index: 100;
}
.modal-box {
  background: #1a1a2e; border-radius: 16px 16px 0 0;
  width: 100%; max-width: 480px; max-height: 70vh; overflow-y: auto;
  padding: 20px 16px; position: relative;
}
.modal-title { font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #FFD700; }
.modal-close {
  display: block; width: 100%; margin-top: 16px;
  padding: 10px; border-radius: 8px;
  background: rgba(255,255,255,0.1); border: none; color: #ccc; cursor: pointer;
}

/* 掉落预览 */
.drop-list { display: flex; flex-direction: column; gap: 8px; }
.drop-item { display: flex; align-items: center; justify-content: space-between; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; }
.drop-name { font-size: 13px; color: #ccc; }
.drop-x { font-size: 12px; color: #888; }
.drop-reward { font-size: 14px; font-weight: bold; color: #FFD700; }

/* 记录弹窗 */
.modal-record { border-radius: 16px 16px 0 0; }
.record-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.record-tabs button {
  flex: 1; padding: 8px; border-radius: 6px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: #aaa; cursor: pointer; font-size: 13px;
}
.record-tabs button.active { background: rgba(255,215,0,0.15); border-color: #FFD700; color: #FFD700; }

.trend-list { display: flex; flex-direction: column; gap: 6px; }
.trend-item { display: flex; align-items: center; gap: 8px; padding: 8px; background: rgba(255,255,255,0.04); border-radius: 6px; }
.t-no { font-size: 11px; color: #666; width: 60px; }
.t-badge { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
.t-name { font-size: 12px; color: #ccc; flex: 1; }
.t-multi { font-size: 13px; color: #FFD700; }
.t-time { font-size: 10px; color: #555; }

.mine-list { display: flex; flex-direction: column; gap: 6px; }
.mine-item { display: flex; align-items: center; justify-content: space-between; padding: 8px; background: rgba(255,255,255,0.04); border-radius: 6px; }
.m-no { font-size: 11px; color: #666; width: 60px; }
.m-bet { font-size: 12px; color: #ccc; flex: 1; }
.m-win { font-size: 13px; color: #E74C3C; }
.m-win.win { color: #2ECC71; }

/* 结果浮层 */
.result-toast {
  position: fixed; top: 30%; left: 50%; transform: translateX(-50%);
  z-index: 200; pointer-events: none;
}
.toast-content {
  background: rgba(26,26,46,0.95); border: 2px solid #FFD700;
  border-radius: 16px; padding: 20px 30px; text-align: center;
  min-width: 200px;
}
.toast-title { font-size: 14px; color: #aaa; margin-bottom: 8px; }
.toast-result { font-size: 22px; font-weight: bold; margin-bottom: 4px; }
.toast-multi { font-size: 20px; color: #FFD700; margin-bottom: 8px; }
.toast-win { font-size: 18px; color: #2ECC71; font-weight: bold; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 6px; }
.toast-ornament-img { width: 48px; height: 48px; object-fit: contain; border-radius: 4px; }
.toast-ornament-name { color: #f0c040; font-size: 15px; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.toast-ornament-price { color: #aaa; font-size: 13px; }
.toast-ornament-count { color: #aaa; font-size: 12px; }

.result-toast-enter-active, .result-toast-leave-active { transition: all 0.4s; }
.result-toast-enter-from, .result-toast-leave-to { opacity: 0; transform: translateX(-50%) scale(0.8); }
</style>
