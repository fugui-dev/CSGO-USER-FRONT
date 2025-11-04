import request from "@/config/http/request.js";

// 获取比赛详情
export const getMatchInfoApi = (data) => {
    return request({
        url: "/api/match/info",
        method: "get",
        data: data
    })
}

// 获取助威配置列表
export const getStageCheerConfigListApi = () => {
    return request({
        url: "/api/match/cheer/config/list",
        method: "get"
    })
}

// 获取宝箱列表
export const getBoxListApi = (data) => {
    return request({
        url: "/api/bindbox/getBoxList",
        method: "get",
        data: data
    })
}

// 获取队伍列表
export const getTeamListApi = (data) => {
    return request({
        url: "/api/match/team/list",
        method: "post",
        data: data
    })
}

// 创建比赛队伍
export const createTeamApi = (data) => {
  return request({
      url: "/api/match/team/create",
      method: "post",
      data: data
  })
}

// 加入比赛队伍
export const joinTeamApi = (data) => {
  return request({
      url: "/api/match/join/match/team",
      method: "post",
      data: data
  })
}

// 获取审批用户列表
export const getAuditListApi = (data) => {
  return request({
      url: "/api/match/user/examine/list",
      method: "post",
      data: data
  })
}

// 审核比赛用户
export const auditUserApi = (data) => {
  return request({
      url: "/api/match/examine/user",
      method: "post",
      data: data
  })
}

// 获取邀请或被邀请列表
export const getInviteListApi = (data) => {
  return request({
      url: "/api/match/user/invite/list",
      method: "post",
      data: data
  })
}

// 处理邀请
export const handleInviteApi = (data) => {
  return request({
      url: "/api/match/invite/deal/with",
      method: "post",
      data: data
  })
}

// 搜索用户
export const searchUserApi = (data) => {
  return request({
      url: "/api/match/user/list",
      method: "post",
      data: data
  })
}

// 邀请用户加入队伍
export const inviteUserApi = (data) => {
  return request({
      url: "/api/match/invite/user",
      method: "post",
      data: data
  })
}

// 获取比赛阶段列表
export const getMatchStageApi = (data) => {
  return request({
      url: "/api/match/stage/list",
      method: "post",
      data: data
  })
}

// 获取助威列表
export const getMatchCheerListApi = (data) => {
  return request({
      url: "/api/match/cheer/list",
      method: "post",
      data: data
  })
}

// 助威比赛阶段对战
export const cheerApi = (data) => {
  return request({
      url: "/api/match/cheer",
      method: "post",
      data: data
  })
}

// 获取往期比赛列表
export const getHistoryMatchListApi = (data) => {
    return request({
        url: "/api/match/history/list",
        method: "get",
        data: data
    })
}
