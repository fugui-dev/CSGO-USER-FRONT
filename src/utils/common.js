import router from "@/router/index.js";

export const requireImg = (imgPath,  css = false,net = true) => {
    const ossBaseUrl = import.meta.env.VITE_OSS_ADDRESS
    if (imgPath.startsWith("/")) {
        imgPath = imgPath.slice(1)
    }
    let url
    if (!net) {
        url=`/${imgPath}`
    } else {
        url = `${ossBaseUrl}${imgPath}`
    }
    if (css) {
        return `url(${url})`
    }else {
        return url
    }


};

export const goto = (path) => {
    if(path.startsWith("http")){
        window.open(path, '_blank')
    }else {

        router.push(path).then(r => {
        }).catch(err => {
            console.log(err)
        })
    }

}

export const deepClone = (obj) => {
  if (typeof obj !== 'object') return;
  let newObj = obj instanceof Array ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key];
    }
  }
  return newObj;
}

export const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export const timestampToHMS = (timestamp) => {
  // 计算时分秒
  const diffSeconds = Math.floor(timestamp / 1000);
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = Math.floor(diffSeconds % 60);
  
  return {hours, minutes, seconds};
}

// 是否为非空对象
export const isNotEmptyObj = (obj) => {
  return obj && Object.prototype.toString.call(obj) === '[object Object]' && Object.keys(obj).length > 0
}

// 图片预加载工具
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('图片URL为空'))
      return
    }
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

// 批量预加载图片
export const preloadImages = async (urls) => {
  const promises = urls.filter(url => url).map(url => preloadImage(url))
  return Promise.allSettled(promises)
}
