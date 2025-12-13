import request from "@/config/http/request.js";

export const getRechargeList = (data) => {
  return request({
    url: "/api/recharge/list",
    method: "get",
    data: data,
  });
};
export const getPayConfigList = (data) => {
    return request({
      url: "/api/payConfig/list",
      method: "get",
      data: data,
    });
  };
export const postCardPay = (data) => {
    return request({
      url: "/api/recharge/cardPay",
      method: "post",
      data: data,
    });
  };

// 查询支付订单状态（支持多种支付方式）
export const queryOrderStatus = (orderNo, payTag = null) => {
  // 根据支付通道选择不同的查询接口
  if (payTag === "banmasp") {
    return request({
      url: `/api/banmasp/queryOrder?payNum=${orderNo}`,
      method: "post",
    });
  }
  // 默认使用yimaPay接口
  return request({
    url: `/api/yimaPay/orderStatus?orderNo=${orderNo}`,
    method: "get",
  });
};
