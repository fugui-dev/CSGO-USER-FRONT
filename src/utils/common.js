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
