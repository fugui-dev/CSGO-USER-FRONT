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

// 获取我参与的历史对战记录
export const getMyOwnFightListApi = (data) => {
    return request({
        url: "/api/fight/fightOnMyOwn",
        method: "post",
        data: data
    })
}

// 创建房间
export const createRoomApi = (data) => {
  return request({
      url: "/api/fight/createFight",
      method: "post",
      data: data
  })
}

// 创建房间
export const joinRoomApi = (data) => {
  return request({
      url: "/api/fight/joinFightRoom",
      method: "post",
      data: data
  })
}
