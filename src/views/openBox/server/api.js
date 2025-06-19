import request from "@/config/http/request.js";
//箱子信息
export const getBoxInfo = (data) => {
  return request({
    url: "/api/bindbox/" + data.boxId,
    method: "get",
  });
};
//打开箱子
export const openBoxBind = (data) => {
  return request({
    url: "/api/bindbox/openBox?boxId=" + data.boxId + "&num=" + data.num,
    method: "post",
  });
};
//注入开箱
export const openBoxInject = (data) => {
  return request({
    url: "/api/bindbox/openBox2",
    method: "post",
    data: data,
  });
};
//获取箱子历史记录
export const getBoxHistory = (data) => {
  return request({
    url: "/api/boxRecords/historyByCondition",
    method: "post",
    data: data,
  });
};
//获取用户背包
export const getUserBag = (data) => {
  return request({
    url: "/api/userPackSack/getPackSack",
    method: "post",
    data: data,
  });
};
export const getboxlist = (params) => {
  return request({
    url: "/api/bindbox/getBoxList",
    method: "get",
    params: params,
  });
};
//分解
export const postDecompose = (data) => {
  return request({
    url: "/api/userPackSack/decompose",
    method: "post",
    data: data,
  });
};
