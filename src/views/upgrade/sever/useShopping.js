import { getShoppingList } from "./api";
import { reactive, onMounted, watch } from "vue";
import { useDebounceFn } from "@vueuse/core"; // 引入 useDebouncedFn
import { useDeviceType } from "@/composables/useDeviceType"; // 引入设备类型检测

export const useShopping = ({ updata }) => {
  const { isPC } = useDeviceType(); // 获取设备类型
  
  // 列表数据
  const list = reactive([]);
  // loading状态
  const loading = reactive({
    list: false
  });

  // 分页数据
  const page = reactive({
    pageSize: isPC.value ? 20 : 6, 
    pageNum: 1,
    pageTotal: 0,
  });

  // 获取列表的函数
  const getList = async () => {
    loading.list = true;
    try {
      // 构建请求参数，只有当 type 不是 "-1" 时才添加 type 参数
      const requestParams = {
        size: page.pageSize,
        page: page.pageNum,
        isLevelDesc: updata.order ? "0" : "1",
        isPriceDesc: updata.price ? "1" : "0",
      };
      
      // 只有当 itemName 有值时才添加
      if (updata.userInput) {
        requestParams.itemName = updata.userInput;
      }
      
      // 只有当 type 不是 "-1" 时才添加 type 参数
      if (updata.select && updata.select !== "-1") {
        requestParams.type = String(updata.select);
      }
      
      console.log('请求参数:', requestParams); // 调试日志
      
      const res = await getShoppingList(requestParams);

      if (res.code === 200) {
        list.length = 0;
        if (res && Array.isArray(res.rows)) {
          list.push(...res.rows);
          page.pageTotal = res.total || 0;
        }
      }
    } catch (error) {
      console.error("Error fetching shopping list:", error);
      list.length = 0;
      page.pageTotal = 0;
    } finally {
      loading.list = false;
    }
  };

  const debouncedGetList = useDebounceFn(() => {
    page.pageNum = 1; // 重置页码
    getList();
  }, 1000);

  // 监听搜索条件变化
  watch(
    [() => updata.order, () => updata.price, () => updata.userInput, () => updata.select],
    debouncedGetList,
    { immediate: true }
  );

  // 监听页码变化
  watch(() => page.pageNum, getList);

  return {
    list,
    page,
    loading,
    getList,
  };
};
