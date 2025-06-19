import request from "@/config/http/request.js";

export const getShoppingList = (data) => {
  return request({
    url: "/api/luckyUpgrade/getOrnamentsList",
    method: "get",
    data: data,
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
