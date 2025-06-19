import { ref, watch, computed } from 'vue'
import { useStore } from '@/store'
import { getUserInfoApi } from "@/api"

export function useUserInfo() {
  const store = useStore()
  const userInfo = ref(null)
  const loading = ref(false)
  const lastFetchTime = ref(0)
  const FETCH_INTERVAL = 0 // 5秒内不重复请求

  // 获取最新用户信息
  const fetchUserInfo = async () => {
    // 如果未登录，直接返回null
    if (!store.isLogin) {
      userInfo.value = null
      return null
    }

    const now = Date.now()
    // 如果距离上次请求时间小于间隔时间，直接返回当前数据
    if (now - lastFetchTime.value < FETCH_INTERVAL) {
      return userInfo.value
    }

    try {
      loading.value = true
      const res = await getUserInfoApi()
      if (res.code === 200) {
        userInfo.value = res.data
        store.setUserInfo(res.data)
        lastFetchTime.value = now
        return res.data
      }
      return null
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 监听store中的用户信息变化
  watch(() => store.userInfo, (newVal) => {
    if (newVal) {
      userInfo.value = newVal
    } else {
      userInfo.value = null
    }
  }, { immediate: true })

  // 直接从store中获取登录状态
  const isLogin = computed(() => store.isLogin)

  return {
    userInfo,
    isLogin,
    loading,
    fetchUserInfo
  }
}