import { ref, watch, computed } from 'vue'
import { useStore } from '@/store'
import { getUserInfoApi } from "@/api"

export function useUserInfo() {
  const store = useStore()
  const userInfo = ref(null)
  const loading = ref(false)
  const lastFetchTime = ref(0)
  const FETCH_INTERVAL = 0 // 0秒内不重复请求（每次都重新获取）

  // 获取最新用户信息
  const fetchUserInfo = async () => {
    console.log('fetchUserInfo 被调用，当前登录状态:', store.isLogin)
    
    // 如果未登录，直接返回null
    if (!store.isLogin) {
      console.log('用户未登录，返回null')
      userInfo.value = null
      return null
    }

    const now = Date.now()
    // 如果距离上次请求时间小于间隔时间，直接返回当前数据
    if (FETCH_INTERVAL > 0 && now - lastFetchTime.value < FETCH_INTERVAL) {
      console.log('距离上次请求时间太短，返回缓存数据')
      return userInfo.value
    }

    try {
      console.log('开始获取用户信息...')
      loading.value = true
      const res = await getUserInfoApi()
      console.log('用户信息API响应:', res)
      
      if (res.code === 200) {
        console.log('用户信息获取成功，更新store')
        userInfo.value = res.data
        store.setUserInfo(res.data)
        lastFetchTime.value = now
        console.log('用户信息更新完成，新余额:', res.data.accountAmount)
        return res.data
      }
      console.log('用户信息获取失败，响应码:', res.code)
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