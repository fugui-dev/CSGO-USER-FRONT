import request from "@/config/http/request.js";

export const getBattleListApi = (data) => {
    return request({
        url: "/api/fight/getFightList",
        method: "get",
        data: data
    })
}
