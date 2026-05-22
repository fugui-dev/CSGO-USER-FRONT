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

// 加入对战
export const joinRoomApi = (data) => {
  return request({
      url: "/api/fight/joinFightRoom",
      method: "post",
      data: data
  })
}

// 玩家准备
export const prepareFightApi = (data) => {
  return request({
      url: "/api/fight/seatrReady",
      method: "post",
      data: data
  })
}

// 开始游戏
export const beginFightApi = (data) => {
  return request({
      url: "/api/fight/fightBegin",
      method: "post",
      data: data
  })
}

// 存储对战回合数据
export const saveFightBoutApi = (data) => {
  return request({
      url: "/api/fight/saveFightBoutData",
      method: "post",
      data: data
  })
}

// 结束游戏
export const endFightApi = (data) => {
  return request({
      url: "/api/fight/fightEnd",
      method: "post",
      data: data
  })
}

// 历史对战详情
export const getHistoryDetailApi = (data) => {
  return request({
      url: "/api/fight/fightDetail",
      method: "post",
      data: data
  })
}

// 房主结束对战
export const ownerEndFightApi = (data) => {
  return request({
      url: "/api/fight/ownerEndFight",
      method: "post",
      data: data
  })
}

// 我的对战十佳记录（本人获得饰品总价值TOP10）
export const getMyTopTenFightsApi = () => {
  return request({
      url: "/api/fight/myTopTen",
      method: "get"
  })
}
