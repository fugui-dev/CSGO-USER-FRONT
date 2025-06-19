import { getRechargeList, getPayConfigList } from "./api";
import { ref } from "vue";  
export const useRecharge = () => {
  const rechargeList = ref([]);
  const payConfigList = ref([]);
  const loading = ref(false);
  const payLoading = ref(false);
  const fetchRechargeData = async () => {
    loading.value = true;
    const res = await getRechargeList();
    if (res.code === 200) {
      rechargeList.value = res.data;
    }
    loading.value = false;
  }
  
  const fetchPayConfigData = async () => {
    loading.value = true;
    const res = await getPayConfigList();
    if (res.code === 200) {
      payConfigList.value = res.data;
    }
    loading.value = false;
  }
  
  return {
    rechargeList,
    payConfigList,
    loading,
    fetchRechargeData,
    fetchPayConfigData
  };
};
