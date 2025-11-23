import { getCurrentData } from "./api";
import { useRoute } from "vue-router";
import { ref, computed } from "vue";
import { useStore } from "@/store";

export const useUpgrade = () => {
  const route = useRoute();
  const store = useStore();
  const RecordData = ref([]);
  const loading = ref(false);
  const boxData = computed(() => {
    return JSON.parse(route.query.data);
  });

  // 分页配置
  const pagination = ref({
    pageNum: 1,
    pageSize: 10,
    pageTotal: 0
  })

  // 获取记录数据
  const getRecordData = async (page = 1) => {
    try {
      loading.value = true
      const res = await getCurrentData({
        ornamentId: boxData.value.ornamentId,
        page: page,
        size: pagination.value.pageSize,
        userType: store.userInfo?.userType || null, // 添加 userType 参数
        userId: store.userInfo?.userId || null, // 添加 userId 参数，只查询当前用户的记录
      });
      
      if (res.code === 200) {
        RecordData.value = res.data.records.map(record => {
          // 处理 gainOrnamentList，失败时可能为空字符串
          let gainOrnamentList = [];
          if (record.gainOrnamentList) {
            try {
              const parsed = JSON.parse(record.gainOrnamentList);
              gainOrnamentList = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              console.warn('解析 gainOrnamentList 失败:', e);
              gainOrnamentList = [];
            }
          }
          return {
            ...record,
            gainOrnamentList: gainOrnamentList
          };
        });
        // 更新分页信息
        pagination.value.pageTotal = res.data.total
        pagination.value.pageNum = page
      }
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 页码改变处理
  const handlePageChange = (page) => {
    getRecordData(page)
  }

  // 刷新数据
  const refreshRecordData = () => {
    getRecordData(1)
  }

  // 初始化获取数据
  getRecordData(1);

  return {
    boxData,
    RecordData,
    loading,
    refreshRecordData,
    pagination,
    handlePageChange
  };
};

