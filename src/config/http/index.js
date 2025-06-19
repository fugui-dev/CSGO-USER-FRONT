// http/index.js
import axios from 'axios'
import {ElMessage} from "element-plus";
import router from "../../router/index.js";
import {useStore} from "@/store";
import {goto} from "@/utils/common";

const api = {
    prod: '/prod-api'
}


export let baseUrl = (import.meta.env.PROD ? api.prod : api.prod)
let instance = axios.create({
    // baseURL: import.meta.env.VITE_APP_URL, //接口统一域名
    baseURL: baseUrl,
    timeout: 6000, //设置超时
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
    if (config.method === 'post') {
        config.data = JSON.stringify(config.data);
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
