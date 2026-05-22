import request from "@/config/http/request.js";

// 获取当前游戏状态
export const getRainbowCurrentApi = () =>
    request({ url: "/api/rainbow/current" });

// 下注
export const placeBetApi = (data) =>
    request({ url: "/api/rainbow/bet", method: "post", data });

// 清除本局下注
export const cancelBetApi = (gameId) =>
    request({ url: `/api/rainbow/cancelBet?gameId=${gameId}`, method: "post" });

// 掉落预览
export const getDropPreviewApi = (amount) =>
    request({ url: `/api/rainbow/dropPreview?amount=${amount}` });

// 遗漏统计
export const getMissStatisticsApi = () =>
    request({ url: "/api/rainbow/miss" });

// 近10场开奖历史
export const getRecentHistoryApi = () =>
    request({ url: "/api/rainbow/history" });

// 我的下注记录
export const getMyBetRecordsApi = (pageNum = 1, pageSize = 20) =>
    request({ url: `/api/rainbow/records?pageNum=${pageNum}&pageSize=${pageSize}` });
