// useWebSocketHeartbeat.js
import { ref, onUnmounted } from 'vue'

// interface WebSocketHeartbeatOptions {
//   pingInterval?: number
//   reconnectDelay?: number
//   onOpen?: () => void
//   onMessage?: (event: MessageEvent) => void
//   onClose?: () => void
//   onError?: (error: Event) => void
// }

export default function useWebSocketHeartbeat(options) {
  const {
    pingInterval = 30000, // 默认30秒发一次ping
    reconnectDelay = 5000, // 默认断开后5秒重连
    onOpen,
    onMessage,
    onClose,
    onError
  } = options

  const ws = ref(null)
  const isConnected = ref(false)
  let pingTimer = null
  let timeoutTimer = null

  // 初始化连接
  const connect = (url) => {
    console.log(url)
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      isConnected.value = true
      console.log('WebSocket已连接')
      onOpen?.()
      startHeartbeat()
    }

    ws.value.onmessage = (res) => {
      // 处理心跳响应
      const data = JSON.parse(res.data)
      if (data.data === 'pong') {
        console.log('收到pong响应')
        resetTimeout()
      }
      onMessage?.(res)
    }

    ws.value.onclose = () => {
      isConnected.value = false
      console.log('WebSocket已断联')
      onClose?.()
      stopHeartbeat()
      // setTimeout(() => connect(url), reconnectDelay)
    }

    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error)
      onError?.(error)
      ws.value?.close()
    }
  }

  // 开始心跳
  const startHeartbeat = () => {
    stopHeartbeat() // 避免重复启动
    pingTimer = window.setInterval(() => {
      if (isConnected.value && ws.value?.readyState === WebSocket.OPEN) {
        ws.value.send('ping') // 发送纯文本"ping"
        startTimeout() // 启动超时检测
      }
    }, pingInterval)
  }

  // 停止心跳
  const stopHeartbeat = () => {
    if (pingTimer) {
      clearInterval(pingTimer)
      pingTimer = null
    }
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
      timeoutTimer = null
    }
  }

  // 启动超时检测
  const startTimeout = () => {
    timeoutTimer = window.setTimeout(() => {
      console.warn('没有收到pong消息，关闭连接中...')
      ws.value?.close()
    }, pingInterval + 5000) // 超时时间 = ping间隔 + 5秒缓冲
  }

  // 收到pong后重置超时计时器
  const resetTimeout = () => {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer)
      timeoutTimer = null
    }
  }

  // 手动关闭连接
  const disconnect = () => {
    stopHeartbeat()
    ws.value?.close()
  }

  // 组件卸载时自动清理
  onUnmounted(() => {
    disconnect()
  })

  return {
    ws,
    isConnected,
    connect,
    disconnect
  }
}