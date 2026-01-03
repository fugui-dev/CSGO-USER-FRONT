import request from "@/config/http/request.js";

// 获取日流水排行榜
export const getDailyFlowRankingApi = () => {
  return request({
    url: "/api/dailyFlowRanking/ranking",
    method: "get"
  });
}

// 获取指定日期的排行榜
export const getDailyFlowRankingByDateApi = (statDate) => {
  return request({
    url: `/api/dailyFlowRanking/ranking/${statDate}`,
    method: "get"
  });
}

// 获取当前用户的排名信息
export const getMyRankingApi = (statDate) => {
  return request({
    url: "/api/dailyFlowRanking/myRanking",
    method: "get",
    params: { statDate }
  });
}

// 获取奖励配置列表
export const getRewardConfigApi = () => {
  return request({
    url: "/api/dailyFlowRanking/rewardConfig",
    method: "get"
  });
}

