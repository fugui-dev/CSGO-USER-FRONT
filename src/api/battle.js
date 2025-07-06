import request from "@/config/http/request.js";

export const getBattleListApi = (data) => {
    return request({
        url: "/api/fight/getFightList",
        method: "get",
        data: data
    })
}

// 获取对战宝箱列表
export const getBattleBoxListApi = (data) => {
  return request({
      url: "/api/fight/getFightBoxList",
      method: "get",
      data: data
  })
}

// 获取对战宝箱详情
export const getBattleBoxDetailApi = (data) => {
  return request({
      url: "/api/fight/simpleBoxDetail",
      method: "get",
      data: data
  })
}

// 获取对战排行榜
export const getBattleRankingApi = (data) => {
  return request({
      url: "/api/fight/fightRanking",
      method: "get",
      data: data
  })
}
