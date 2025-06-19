import request from "@/config/http/request.js";
import axios from "axios";
import {baseUrl} from "@/config/http";

export const registerApi = (data) => {
    return request({
        url: "/api/register",
        method: "post",
        data: data
    })
}

export const loginApi = (data) => {
    return request({
        url: "/api/login",
        method: "post",
        data: data
    })
}
export const getSmsCodeApi = (data) => {
    return request({
        url: "/api/sms/getVerifyCode",
        method: "post",
        data: data
    })
}

export const loginPhoneApi = (data) => {
    return request({
        url: "/api/verificationCodeLogin",
        method: "post",
        data: data
    })
}
export const getBoxListApi = (data) => {
    return request({
        url: "/api/bindbox/getBoxList?isFight=1",
    })
}


export const getUserInfoApi = () => {
    return request({
        url: "/api/getInfo"
    })
}

export const updateUserInfoApi = (data) => {
    return request({
        url: "/api/user/updateUserDetails",
        method: "post",
        data: data
    })
}


export const getBoxRecordApi = (data) => {
    return request({
        url: "/api/boxRecords/historyByCondition",
        method: "post",
        data: data
    })
}


export const getPackSackGlobalDataApi = () => {
    return request({
        url: '/api/userPackSack/packSackGlobalData',
    })
}

export const getPackSackApi = (data) => {
    return request({
        url: '/api/userPackSack/getPackSack',
        method: 'post',
        data: data

    })
}

export const deliverPackSackApi = (data) => {
    return request({
        url: '/api/userPackSack/delivery',
        method: 'post',
        data: data
    })
}

export const getExtractPackSackApi = (data) => {
    return request({
        url: '/api/userPackSack/extractOrn',
        method: 'post',
        data: data
    })
}


export const getShopListApi = (data) => {
    return request({
        url: '/api/shopping/list',
        method: 'get',
        data: data
    })
}


export const smeltApi = (data) => {
    return request({
        url: '/api/replacementRecord/smelt',
        method: 'post',
        data: data
    })
}

export const getBannerListApi = () => {
    return request({
        url: '/api/websiteSetup/getBannerList',

    })
}

export const useCdkApi = (cdk) => {
    return request({
        url: '/api/recharge/cardPay?password=' + cdk,
        method: 'post',
    })
}

export const useRedEnvelopeApi = (cdk) => {
    return request({
        url: 'api/bonus/receiveRedPacket/' + cdk,
    })
}


export const getMyBoxRecordApi = (data) => {
    return request({
        url: '/api/boxRecords/myRecord',
        method: 'post',
        data: data
    })
}

export const getAmountRecordsApi = (data) => {
    return request({
        url: '/api/userAmountRecords/userAccountDetail',
        method: 'post',
        data: data
    })
}

export const getNoticeApi = (data) => {
    return request({
        url: '/api/notice/list/',
        method: 'get',
        data: data
    })
}

export const getAnnouncementApi = (data) => {
    return request({
        url: '/api/announcement/list/',
        method: 'get',
        data: data
    })
}


export const uploadFileApi = (data) => {
    return axios.post(baseUrl + '/common/upload', data, {
        headers: {'Authorization': localStorage.getItem('token')}
    })
}


export const getActivityListApi = () => {
    return request({
        url: '/api/activity/list',
        method: 'get',
    })
}

export const getAwardApi = (data) => {
    return request({
        url: '/api/activity/getRechargeGift',
        method: 'get',
        data: data
    })

}

export const getNameActivityListApi = () => {
    return request({
        url: '/api/realnameGift/list',
        method: 'get',
    })
}

export const getNameAwardApi = (index) => {
    return request({
        url: '/api/realnameGift/gift'+index,
        method: 'get',
    })

}


export const setParentInvitationCodeApi = (data) => {
    return request({
        url: '/api/user/bindBoss',
        method: 'post',
        data: data
    })
}

export const setReal = (data) => {
    return request({
        url: '/api/user/realNameAuthentication',
        method: 'post',
        data: data
    })
}

export const getPromotionListApi = (data) => {
    return request({
        url: `/api/userAmountRecords/pCommissionRecords/${data.page || 1}/${data.size || 20}`,

    })
}

export const getPromotionDetailApi = () => {
    return request({
        url: '/api/promotinoLevel/getPromotionInfo'
    })
}

export const getPromotionUnderOrderAMountsApi = () => {
    return request({
        url: '/api/user/getOrdersAmounts'
    })
}

export const getPromotionUnderPeopleCountApi = () => {
    return request({
        url: '/api/user/rechargeCount'
    })
}



export const getStatisticsPromotionDataApi = (userId) => {
    return request({
        url: '/api/userAmountRecords/statisticsPromotionData/'+userId
    })
}

export const accessorySalvageApi = (data) => {
    return request({
        url: "/api/userPackSack/decompose",
        method: "post",
        data: data,
    });
};
