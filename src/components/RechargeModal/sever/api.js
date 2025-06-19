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

// 查询支付订单状态
export const queryOrderStatus = (orderNo) => {
  return request({
    url: `/api/yimaPay/orderStatus?orderNo=${orderNo}`,
    method: "get",
  });
};
