/**
 * 彩虹玩法 WebSocket 工具
 *
 * - 连接地址：ws(s)://host/ws/rainbow/{userId}
 * - 自动心跳：每 20s 发送 "ping"，服务端回 "pong"
 * - 断线重连：3s 后重试，最多连续失败 5 次后停止（避免无限重连）
 * - 对外暴露：connect(userId, onMessage)、disconnect()
 */

const HEARTBEAT_INTERVAL_MS = 20000
const RECONNECT_DELAY_MS = 3000
const MAX_RECONNECT_TIMES = 5

let ws = null
let heartbeatTimer = null
let reconnectTimer = null
let reconnectCount = 0
let manualClose = false   // 是否主动断开（不重连）
let _userId = 0
let _onMessage = null

/**
 * 建立 WebSocket 连接
 *
 * @param {number|string} userId  用户ID，未登录传 0
 * @param {function} onMessage    收到服务端消息的回调，参数为已解析的 JSON 对象
 */
export function connect(userId, onMessage) {
  _userId = userId || 0
  _onMessage = onMessage
  manualClose = false
  reconnectCount = 0
  _connect()
}

/**
 * 主动断开连接（页面卸载时调用，不触发重连）
 */
/**
 * 获取当前 WS 连接状态（调试用）
 */
export function getWsStatus() {
  if (!ws) return 'null'
  const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']
  return states[ws.readyState] || ws.readyState
}

export function disconnect() {
  manualClose = true
  _clearHeartbeat()
  _clearReconnect()
  if (ws) {
    ws.close()
    ws = null
  }
}

// ---- 内部实现 ----

function _connect() {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return
  }

  // 根据当前协议自动推导 ws/wss
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const host = window.location.host
  const url = `${protocol}://${host}/ws/rainbow/${_userId}`

  ws = new WebSocket(url)

  ws.onopen = () => {
    console.log('[RainbowWs] 连接成功')
    reconnectCount = 0
    _startHeartbeat()
  }

  ws.onmessage = (event) => {
    const data = event.data
    // 过滤心跳 pong 响应
    if (data === 'pong') return
    try {
      const msg = JSON.parse(data)
      if (_onMessage) _onMessage(msg)
    } catch (e) {
      console.warn('[RainbowWs] 消息解析失败', data)
    }
  }

  ws.onclose = (event) => {
    console.log('[RainbowWs] 连接关闭', event.code, event.reason)
    _clearHeartbeat()
    if (!manualClose) {
      _scheduleReconnect()
    }
  }

  ws.onerror = (error) => {
    console.error('[RainbowWs] 连接错误', error)
  }
}

function _startHeartbeat() {
  _clearHeartbeat()
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('ping')
    }
  }, HEARTBEAT_INTERVAL_MS)
}

function _clearHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function _scheduleReconnect() {
  _clearReconnect()
  if (reconnectCount >= MAX_RECONNECT_TIMES) {
    console.warn(`[RainbowWs] 重连失败超过 ${MAX_RECONNECT_TIMES} 次，停止重连`)
    return
  }
  reconnectCount++
  console.log(`[RainbowWs] ${RECONNECT_DELAY_MS / 1000}s 后第 ${reconnectCount} 次重连...`)
  reconnectTimer = setTimeout(() => {
    _connect()
  }, RECONNECT_DELAY_MS)
}

function _clearReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}
