// http/index.js
import axios from 'axios'
import {ElMessage} from "element-plus";
import router from "../../router/index.js";
import {useStore} from "@/store";
import {goto} from "@/utils/common";
import {encrypt} from "@/utils/aes";

const api = {
    prod: '/prod-api'
}


export let baseUrl = (import.meta.env.PROD ? api.prod : api.prod)
let instance = axios.create({
    // baseURL: import.meta.env.VITE_APP_URL, //接口统一域名
    baseURL: baseUrl,
    timeout: 30000, //设置超时30秒（之前6秒太短，导致接口响应慢时频繁超时）
    headers: {
        'Content-Type': 'application/json;charset=UTF-8;',
        'Referrer-Policy': 'no-referrer'
    }
})
let loading;
let requestCount = 0

const showLoading = () => {
    // if (requestCount === 0 && !loading) {
    //     Toast.loading('加载中')
    // }
    // requestCount++;
}
//隐藏loading
const hideLoading = () => {
    requestCount--
    if (requestCount == 0) {
        // Toast.clear()
    }
}

instance.interceptors.request.use((config) => {
    showLoading()
    let token = localStorage.getItem("token")
    token && (config.headers.Authorization = token)
    
    // 临时关闭接口加密：先注释掉用户端前端加密逻辑（保留代码，便于后续恢复）
    // const encryptEnabled = import.meta.env.VITE_ENCRYPT_ENABLED === 'true' || import.meta.env.VITE_ENCRYPT_ENABLED === true
    const encryptEnabled = false
    const encryptUrls = import.meta.env.VITE_ENCRYPT_URLS || '/api/**'
    
    // 调试日志
    if (encryptEnabled) {
        console.log('[加密调试] 加密功能已启用')
        console.log('[加密调试] 加密URL配置:', encryptUrls)
    }
    
    // 检查是否需要加密
    let needEncrypt = false
    if (encryptEnabled) {
        // 检查URL是否匹配需要加密的路径
        const urlPatterns = encryptUrls.split(',')
        // 获取请求路径（只取url部分，不包含baseURL）
        // 注意：config.url 不包含 baseURL，所以配置时不要包含 baseURL 前缀
        const requestPath = (config.url || '').split('?')[0]
        
        console.log('[加密调试] 请求路径:', requestPath)
        console.log('[加密调试] 请求方法:', config.method)
        console.log('[加密调试] baseURL:', config.baseURL)
        
        for (const pattern of urlPatterns) {
            let trimmedPattern = pattern.trim()
            
            // 移除 baseURL 前缀（如果配置中包含了）
            // 因为 config.url 不包含 baseURL
            if (trimmedPattern.startsWith('/prod-api')) {
                trimmedPattern = trimmedPattern.replace(/^\/prod-api/, '')
            }
            if (trimmedPattern.startsWith('/dev-api')) {
                trimmedPattern = trimmedPattern.replace(/^\/dev-api/, '')
            }
            
            // 支持 ** 匹配任意路径，* 匹配单层路径
            // 先处理 **，再处理 *，避免 ** 被错误转换
            let regexStr = trimmedPattern
                .replace(/\./g, '\\.')  // 转义点号
                .replace(/\*\*/g, '___DOUBLE_STAR___')  // 临时替换
                .replace(/\*/g, '[^/]*')  // 单星号匹配单层
                .replace(/___DOUBLE_STAR___/g, '.*')  // 双星号匹配任意
            
            // 确保正则表达式正确
            if (!regexStr.startsWith('^')) {
                regexStr = '^' + regexStr
            }
            if (!regexStr.endsWith('$')) {
                regexStr = regexStr + '$'
            }
            
            const regex = new RegExp(regexStr)
            const matches = regex.test(requestPath)
            console.log('[加密调试] 模式匹配:', pattern.trim(), '-> 处理后:', trimmedPattern, '-> 正则:', regexStr, '-> 匹配结果:', matches)
            
            if (matches) {
                needEncrypt = true
                break
            }
        }
    }
    
    console.log('[加密调试] 是否需要加密:', needEncrypt)
    
    if (config.method === 'post' || config.method === 'put') {
        // 如果需要加密，对请求体进行加密
        if (needEncrypt && config.data) {
            try {
                // 先序列化为JSON字符串
                const originalDataStr = typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
                console.log('[加密调试] 开始加密请求体，原始数据长度:', originalDataStr.length)
                
                // 加密
                const encryptedData = encrypt(originalDataStr)
                console.log('[加密调试] 加密成功，加密后数据长度:', encryptedData.length)
                console.log('[加密调试] 加密后数据预览:', encryptedData.substring(0, 50) + '...')
                
                // 重要：加密后的数据直接作为字符串设置，不要再次序列化
                // 设置Content-Type为text/plain，避免被JSON序列化
                config.headers['Content-Type'] = 'text/plain;charset=UTF-8'
                config.data = encryptedData
                
                // 添加加密标识头
                config.headers['X-Request-Encrypted'] = 'true'
                console.log('[加密调试] 已添加加密标识头')
            } catch (error) {
                console.error('[加密调试] 请求加密失败:', error)
                // 加密失败时，使用原始数据（不加密）
                const dataStr = typeof config.data === 'string' ? config.data : JSON.stringify(config.data)
                config.data = dataStr
            }
        } else {
            // 不需要加密，正常处理
            if (typeof config.data !== 'string') {
                config.data = JSON.stringify(config.data)
            }
        }
    }
    
    return config;
}, (error) =>
    Promise.reject(error));


instance.interceptors.response.use(res => {
        hideLoading()
        // 未设置状态码则默认成功状态
        const code = res.data.code || 0;
        // 获取错误信息
        const msg = res.data.msg
        // 二进制数据则直接返回
        if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
            return res.data
        }

        if (code === 200) {
            return res.data
        } else if (code === 401) {
            ElMessage.error({
                message: '请登录',
                grouping: true,
                duration: 5 * 1000
            })
            localStorage.removeItem("token")
            const store=useStore()
            store.setUserInfo({})
            goto("/login")

            return Promise.reject(new Error(msg))
        } else {
            ElMessage.error({
                message: msg,
                grouping: true,
                duration: 5 * 1000
            })
            return Promise.reject(new Error(msg))
        }
    },
    error => {
        console.log('err' + error)
        let code = error.response.status || 500
        console.log(code)
        if (code === 401) {
            ElMessage.error({
                message: '请登录',
                grouping: true,
                duration: 5 * 1000
            })
            localStorage.removeItem("token")
            const store=useStore()
            store.setUserInfo({})
            goto("/login")
            return
        }
        let {message} = error;
        if (message == "Network Error") {
            message = "后端接口连接异常";
        } else if (message.includes("timeout")) {
            message = "系统接口请求超时";
        } else if (message.includes("Request failed with status code")) {
            message = "系统接口" + message.substr(message.length - 3) + "异常";
            //遇到cloudflare防火墙就刷新
            let {response} = error
            if (response['data'] && response['data'].indexOf('Just a moment...') != -1) {
                window.location.reload()
            }
        }


        ElMessage({
            message: message,
            type: 'error',
            grouping: true,
            duration: 5 * 1000
        })
        return Promise.reject(error)
    }
)
export default instance;
