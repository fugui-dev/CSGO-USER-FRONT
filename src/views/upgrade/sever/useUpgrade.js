import { getCurrentData } from "./api";
import { useRoute } from "vue-router";
import { ref, computed } from "vue";

export const useUpgrade = () => {
  const route = useRoute();
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
      });
      
      if (res.code === 200) {
        RecordData.value = res.data.records.map(record => ({
          ...record,
          gainOrnamentList: JSON.parse(record.gainOrnamentList)
        }));
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

