import { getBoxInfo, getBoxHistory } from "./api";

import { useRoute } from "vue-router";
import { ref, onMounted, computed, reactive } from "vue";
export const useOpen = ({ active }) => {
  // 获取当前路由信息
  const route = useRoute();
  // 获取 URL 中的 id 参数
  const boxId = Number(route.params.id);
  //箱子信息
  const boxData = reactive({});
  //箱子历史掉落
  const boxHistoryData = reactive([]);
  //欧皇记录
  const luckyboxData = reactive([]);
  // loading状态
  const loading = reactive({
    boxData: false,
    boxHistory: false,
    boxKing: false
  });

  const getBoxKingData = async (boxId) => {
    loading.boxKing = true;
    try {
      await getBoxHistory({
        boxId: boxId,
        page: 1,
        size: 10,
        status: [0],
        ornamentPriceMin: 200,
        orderByFie:0,
        ornamentLevelIds:['1']
      }).then((res) => {
        if (res.code === 200) Object.assign(luckyboxData, res.data);
      });
    } finally {
      loading.boxKing = false;
    }
  };

  const getBoxHistoryData = async (boxId) => {
    loading.boxHistory = true;
    try {
      await getBoxHistory({
        boxId: boxId,
        page: 1,
        size: 18,
        status: [0],
        orderByFie:0
      }).then((res) => {
        if (res.code === 200) Object.assign(boxHistoryData, res.data);
      });
    } finally {
      loading.boxHistory = false;
    }
  };

  const getBoxData = async (boxId) => {
    loading.boxData = true;
    try {
      await getBoxInfo({
        boxId: boxId,
      }).then((res) => {
        if (res.code === 200) Object.assign(boxData, res.data);
      });
    } finally {
      loading.boxData = false;
    }
  };

  // 获取所有数据的方法
  const fetchData = async () => {
    if (boxId) {
      await Promise.all([
        getBoxData(boxId),
        getBoxHistoryData(boxId),
        getBoxKingData(boxId)
      ]);
    }
  };

  onMounted(() => {
    if (boxId) {
      fetchData();
    }
  });

  return { 
    boxData, 
    boxId, 
    luckyboxData, 
    boxHistoryData, 
    loading,
    fetchData 
  };
};
