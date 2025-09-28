import request from "@/config/http/request.js";

export const getShopList = (data) => {
  return request({
    url: "/api/shopping/list",
    method: "post",
    data: data,
  });
};

export const commodityExchange = (data) => {
  return request({
    url: "/api/shopping/exchange",
    method: "post",
    data: data,
  });
};

export const ammunitionConversion = (data) => {
  return request({
    url: "/api/shopping/integratingConversion",
    method: "post",
    data: data,
  });
};
