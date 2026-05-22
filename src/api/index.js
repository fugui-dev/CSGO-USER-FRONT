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

export const getAvatarListApi = () => {
    return request({
        url: "/api/user/avatarList",
        method: "get"
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

export const verifyPasswordApi = (data) => {
    return request({
        url: '/api/user/verifyPassword',
        method: 'post',
        data: data
    })
}

export const transferOrnamentApi = (data) => {
    return request({
        url: '/api/userPackSack/transferOrnament',
        method: 'post',
        data: data
    })
}

export const getTransferRecordsApi = (data) => {
    return request({
        url: '/api/userPackSack/transferRecords',
        method: 'post',
        data: data
    })
}

export const getUserInfoByIdApi = (userId) => {
    return request({
        url: `/api/user/getUserInfoById/${userId}`,
        method: 'get'
    })
}

export const getShopListApi = (data) => {
    return request({
        url: '/api/shopping/list',
        method: 'post',
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

// 贴纸系统API
// 查询用户贴纸列表
export const getUserStickerListApi = () => {
    return request({
        url: "/api/user/sticker/list",
        method: "get"
    })
}

// 查询所有贴纸类型和规则
export const getStickerTypesApi = () => {
    return request({
        url: "/api/user/sticker/types",
        method: "get"
    })
}

// 查询可兑换奖励列表
export const getStickerRewardListApi = () => {
    return request({
        url: "/api/user/sticker/reward/list",
        method: "get"
    })
}

// 查询奖励详情
export const getStickerRewardDetailApi = (rewardId) => {
    return request({
        url: `/api/user/sticker/reward/${rewardId}`,
        method: "get"
    })
}

// 兑换奖励
export const exchangeStickerRewardApi = (rewardId) => {
    return request({
        url: `/api/user/sticker/reward/exchange/${rewardId}`,
        method: "post"
    })
}

// 领取连续登录贴纸
export const claimLoginStickerApi = () => {
    return request({
        url: "/api/user/sticker/claim/login",
        method: "post"
    })
}

// 领取连续充值贴纸
export const claimRechargeStickerApi = () => {
    return request({
        url: "/api/user/sticker/claim/recharge",
        method: "post"
    })
}

// 根据贴纸类型获取箱子列表
export const getBoxesByStickerTypeApi = (stickerType) => {
    return request({
        url: `/api/user/sticker/boxes/${stickerType}`,
        method: "get"
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

// 推广用户相关接口（仅主播可见）
export const getPromotionUsersApi = (page, size) => {
    return request({
        url: `/api/user/promotionUsers/${page}/${size}`,
        method: 'get'
    })
}

export const getPromotionRechargeRecordsApi = (page, size) => {
    return request({
        url: `/api/user/promotionRechargeRecords/${page}/${size}`,
        method: 'get'
    })
}

export const getAvailableBalanceApi = () => {
    return request({
        url: '/api/user/availableBalance',
        method: 'get'
    })
}

export const generateCardInfoApi = () => {
    return request({
        url: '/api/user/generateCardInfo',
        method: 'post'
    })
}

export const createGenerateCardApi = () => {
    return request({
        url: '/api/user/createGenerateCard',
        method: 'post'
    })
}

// 获取用户每日福利信息
export const getDailyBenefitsApi = () => {
    return request({
        url: '/api/user/dailyBenefits',
        method: 'get'
    })
}

// 获取用户VIP进程信息
export const getVipProgressApi = () => {
    return request({
        url: '/api/user/vipProgress',
        method: 'get'
    })
}

// 获取用户奖励列表
export const getRewardListApi = () => {
    return request({
        url: '/api/user/rewardList',
        method: 'get'
    })
}

export const accessorySalvageApi = (data) => {
    return request({
        url: "/api/userPackSack/decompose",
        method: "post",
        data: data,
    });
};

// 分解记录
export const getDecomposeLogApi = (data) => {
    return request({
        url: "/api/userPackSack/decomposeLog",
        method: "post",
        data: data,
    });
};

// 我的对战十佳记录
export const getMyTopTenFightsApi = () => {
    return request({
        url: "/api/fight/myTopTen",
        method: "get",
    });
};

// 我的推广返佣记录
export const getMyPromotionRecordApi = (page, size) => {
    return request({
        url: `/api/promotinoLevel/myPromotionRecord?page=${page}&size=${size}`,
        method: "get",
    });
};
