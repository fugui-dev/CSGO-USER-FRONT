import request from "@/config/http/request.js";

export const getShoppingList = (data) => {
  // 过滤掉 null 和 undefined 的参数
  const params = {};
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      params[key] = data[key];
    }
  });
  return request({
    url: "/api/luckyUpgrade/getOrnamentsList",
    method: "get",
    data: params, // request.js 会将 data 转换为 params
  });
};

export const getCurrentData = (data) => {
  return request({
    url: "/api/luckyUpgrade/getUpgradeRecord",
    method: "post",
    data: data,
  });
};

export const postOpenUpgrade = (data) => {
  return request({
    url: "/api/luckyUpgrade/upgrade2",
    method: "post",
    data: data,
  });
};

// 获取幸运升级可用的类型列表
export const getAvailableTypeList = () => {
  return request({
    url: "/api/luckyUpgrade/type/list",
    method: "get",
  });
};
