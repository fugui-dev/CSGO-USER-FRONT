import request from "@/config/http/request.js";

export const getRollListApi = (data) => {
    return request({
        url: "/api/roll/getRollList",
        method: "post",
        data: data
    })
}
export const getRollDetailsApi = (rollId) => {
    return request({
        url: "/api/roll/getRollDetails/" + rollId,
    })
}

export const getRollPrizePoolApi = (data) => {
    return request({
        url: "/api/roll/getRollPrizePool",
        method: "post",
        data: data
    })
}
export const getRollPlayersApi = (data) => {
    return request({
        url: "/api/roll/getRollPlayers",
        method: "post",
        data: data
    })
}

export const getRollOpenPrizeApi = (data) => {
    return request({
        url: "/api/roll/getRollOpenPrize",
        method: "post",
        data: data
    })
}

export const joinRollApi=(data)=>{
    return request({
        url: "/api/roll/joinRoll",
        method: "post",
        data: data
    })
}

export const getInRollApi=(rollId)=>{
  return request({
    url: "/api/roll/inRoll?rollId="+rollId,
  })
}


