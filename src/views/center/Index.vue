<script setup>

import Layout from "@/components/Layout.vue";
import {requireImg} from "@/utils/common";
import {ref, watch, onMounted, computed} from "vue";
import {useRoute} from "vue-router";
import {getActivityListApi, getAwardApi, getNameActivityListApi, getNameAwardApi, getUserInfoApi} from "@/api";
import {
  getUserStickerListApi,
  getStickerTypesApi,
  getStickerRewardListApi,
  exchangeStickerRewardApi,
  claimLoginStickerApi,
  claimRechargeStickerApi,
  getBoxesByStickerTypeApi
} from "@/api";
import {ElMessage, ElMessageBox} from "element-plus";
import {useStore} from "@/store";
import Title from "@/components/Title.vue";
import BaseButton from "@/components/Btn/BaseButton.vue";
// 导入本地图片
import boxTigerImg from "@/assets/center/bx-tiger.png";

const store = useStore()
const route = useRoute()
const loading = ref(false)

const list = ref([])
const RNList = ref([])

// Tab 切换 - 根据路由参数设置默认tab
const activeTab = ref(route.query.tab === 'sticker' ? 'sticker' : 'activity') // 'activity' 或 'sticker'

// 贴纸相关数据
const stickerLoading = ref(false);
const rewardLoading = ref(false);
const stickerTypes = ref([]);
const userStickers = ref({});
const userStickerList = ref([]); // 保存完整的贴纸信息
const loginProgress = ref({ days: 0, canClaim: false });
const rechargeProgress = ref({ days: 0, canClaim: false });
const rewardList = ref([]);

// 箱子弹窗相关
const boxDialogVisible = ref(false);
const boxDialogLoading = ref(false);
const boxList = ref([]);
const currentSticker = ref(null);

// 奖励详情弹窗相关
const rewardDetailDialogVisible = ref(false);
const currentReward = ref(null);

// 贴纸类型配置
const stickerConfig = {
  red: { name: "红色贴纸", color: "#FF352E", type: "对战胜利获得", icon: "🔴" },
  yellow: { name: "黄色贴纸", color: "#FFBD4E", type: "对战失败获得", icon: "🟡" },
  purple: { name: "紫色贴纸", color: "#984EFF", type: "连续登录7天领取", icon: "🟣" },
  orange: { name: "橙色贴纸", color: "#FF8C42", type: "连续充值100金币7天领取", icon: "🟠" },
  black: { name: "黑色贴纸", color: "#2C2C2C", type: "通过开箱获得", icon: "⚫" },
  blue: { name: "蓝色贴纸", color: "#35B2FF", type: "通过开箱获得", icon: "🔵" },
  green: { name: "绿色贴纸", color: "#1FEBC4", type: "通过开箱获得", icon: "🟢" },
  pink: { name: "粉色贴纸", color: "#FF6B9D", type: "通过开箱获得", icon: "🩷" },
  gray: { name: "灰色贴纸", color: "#8E8E93", type: "通过开箱获得", icon: "⚪" },
  gold: { name: "金色贴纸", color: "#FFD700", type: "通过开箱获得", icon: "🟡" }
};


const getRNList = () => {
  getNameActivityListApi().then(res => {
    RNList.value = res.data
  })
}

const getRNAward = (index) => {
  getNameAwardApi(index).then(res => {
    ElMessage.success('领取成功')
    getUserInfoApi().then(res => {
      store.setUserInfo(res.data)
    })
    getRNList()
  })

}

const getList = () => {
  if (loading.value) return
  loading.value = true
  getActivityListApi().then(res => {
    list.value = []
    for (let i = 0; i < 3; i++) {
      let data = {}
      let item
      try {
        item = res.data[i]
        if (item) {
          const recharge =
              i === 0 ? res.data.rechargeProcess.dayTotalRecharge :
                  i === 1 ? res.data.rechargeProcess.weekTotalRecharge :
                      res.data.rechargeProcess.monthTotalRecharge
          for (let j of item) {
            data = j
            data['recharge'] = recharge
            list.value.push(data)
          }
        }


      } catch (e) {
        break
      }
      // if (i === 0) {
      //   const recharge = res.data.rechargeProcess.dayTotalRecharge
      //   for (let j of item) {
      //     if (recharge <= j.rechargeThreshold && j.status === '0') {
      //       data = j
      //       data['recharge'] = recharge
      //       break
      //     }
      //   }
      //   if (Object.keys(data).length === 0) {
      //     let length = item.length
      //     length = length - 1 < 0 ? 0 : length - 1
      //     data = res.data[i][length]
      //     data['recharge'] = recharge
      //   }
      // } else if (i === 1) {
      //   const recharge = res.data.rechargeProcess.weekTotalRecharge
      //   for (let j of res.data[i]) {
      //     if (recharge <= j.rechargeThreshold && j.status === '0') {
      //       data = j
      //       data['recharge'] = recharge
      //       break
      //     }
      //   }
      //   if (Object.keys(data).length === 0) {
      //     let length = item.length
      //     length = length - 1 < 0 ? 0 : length - 1
      //     data =item[length]
      //     data['recharge'] = recharge
      //   }
      // } else if (i === 2) {
      //   const recharge = res.data.rechargeProcess.monthTotalRecharge
      //   for (let j of item) {
      //     if (recharge <= j.rechargeThreshold && j.status === '0') {
      //       data = j
      //       data['recharge'] = recharge
      //       break
      //     }
      //   }
      //   if (Object.keys(data).length === 0) {
      //     let length = item.length
      //     length = length - 1 < 0 ? 0 : length - 1
      //     data = item[length]
      //     data['recharge'] = recharge
      //   }
      // }
      // list.value.push(data)
    }

    console.log(list.value)
  }).finally(() => {
    loading.value = false
  })
}

const getAward = (item) => {
    getAwardApi({
      bonusId: item.id
    }).then(res => {
      ElMessage.success('成功领取金币:' + res.data.toFixed(2))
      getUserInfoApi().then(res => {
        store.setUserInfo(res.data)
      })
      getList()
    })
}
watch(() => store.userInfo, () => {
  getList()
}, {
  immediate: true,
  deep: true
})

// 贴纸相关方法
const getStickerTypes = async () => {
  try {
    const res = await getStickerTypesApi();
    if (res.code === 200 && res.data) {
      stickerTypes.value = res.data;
    }
  } catch (error) {
    console.error("获取贴纸类型失败", error);
  }
};

const getUserStickers = async () => {
  try {
    const res = await getUserStickerListApi();
    if (res.code === 200 && res.data) {
      const stickerList = res.data.list || [];
      const stickerMap = {};
      stickerList.forEach(item => {
        stickerMap[item.stickerCode] = item.quantity || 0;
      });
      userStickers.value = stickerMap;
      userStickerList.value = stickerList; // 保存完整信息
      
      if (res.data.loginProgress) {
        loginProgress.value = {
          days: res.data.loginProgress.days || 0,
          canClaim: res.data.loginProgress.canClaim || false
        };
      }
      if (res.data.rechargeProgress) {
        rechargeProgress.value = {
          days: res.data.rechargeProgress.days || 0,
          canClaim: res.data.rechargeProgress.canClaim || false
        };
      }
    }
  } catch (error) {
    console.error("获取用户贴纸失败", error);
  }
};

const getRewardList = async () => {
  rewardLoading.value = true;
  try {
    const res = await getStickerRewardListApi();
    if (res.code === 200 && res.data) {
      rewardList.value = res.data || [];
    }
  } catch (error) {
    console.error("获取奖励列表失败", error);
    ElMessage.error("获取奖励列表失败");
  } finally {
    rewardLoading.value = false;
  }
};

const handleClaimLogin = async () => {
  try {
    const res = await claimLoginStickerApi();
    if (res.code === 200) {
      ElMessage.success("领取成功！");
      getUserStickers();
    } else {
      ElMessage.error(res.msg || "领取失败");
    }
  } catch (error) {
    console.error("领取失败", error);
    ElMessage.error("领取失败");
  }
};

const handleClaimRecharge = async () => {
  try {
    const res = await claimRechargeStickerApi();
    if (res.code === 200) {
      ElMessage.success("领取成功！");
      getUserStickers();
    } else {
      ElMessage.error(res.msg || "领取失败");
    }
  } catch (error) {
    console.error("领取失败", error);
    ElMessage.error("领取失败");
  }
};

const handleExchange = async (reward) => {
  try {
    await ElMessageBox.confirm(
      `确定要兑换"${reward.reward.rewardName}"吗？`,
      "确认兑换",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    const res = await exchangeStickerRewardApi(reward.reward.id);
    if (res.code === 200) {
      ElMessage.success("兑换成功！");
      getUserStickers();
      getRewardList();
    } else {
      ElMessage.error(res.msg || "兑换失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error("兑换失败", error);
      ElMessage.error("兑换失败");
    }
  }
};

const canExchange = (reward) => {
  return reward.canExchange === true;
};

// 获取贴纸显示信息
const getStickerInfo = (stickerCode) => {
  // 先从后端数据中查找
  const sticker = userStickerList.value.find(s => s.stickerCode === stickerCode);
  if (sticker) {
    const config = stickerConfig[stickerCode] || { name: sticker.stickerName, color: sticker.stickerColor || "#999", type: sticker.obtainMethod || "未知", icon: "❓" };
    return {
      ...config,
      image: sticker.stickerImage,
      stickerType: sticker.stickerType
    };
  }
  return stickerConfig[stickerCode] || { name: stickerCode, color: "#999", type: "未知", icon: "❓", image: null, stickerType: null };
};

// 判断是否为开箱获得的贴纸（类型5-10）
const isBoxSticker = (stickerType) => {
  return stickerType >= 5 && stickerType <= 10;
};

// 点击贴纸卡片
const handleStickerClick = async (stickerCode) => {
  const sticker = userStickerList.value.find(s => s.stickerCode === stickerCode);
  if (!sticker) return;
  
  // 如果是开箱获得的贴纸，显示箱子列表
  if (isBoxSticker(sticker.stickerType)) {
    currentSticker.value = sticker;
    boxDialogVisible.value = true;
    boxDialogLoading.value = true;
    boxList.value = [];
    
    try {
      const res = await getBoxesByStickerTypeApi(sticker.stickerType);
      if (res.code === 200 && res.data) {
        boxList.value = res.data || [];
      } else {
        ElMessage.error(res.msg || "获取箱子列表失败");
      }
    } catch (error) {
      console.error("获取箱子列表失败", error);
      ElMessage.error("获取箱子列表失败");
    } finally {
      boxDialogLoading.value = false;
    }
  }
};

// 跳转到开箱页面
const handleOpenBox = (boxId) => {
  boxDialogVisible.value = false;
  // 跳转到开箱页面
  window.location.href = `/#/openBox/${boxId}`;
};

// 查看奖励详情
const handleViewRewardDetail = (reward) => {
  currentReward.value = reward;
  rewardDetailDialogVisible.value = true;
};

// 应用弹窗背景色
const applyDialogBackground = (reward) => {
  const requirements = parseStickerRequirement(reward.reward.stickerRequirement);
  let color = null;
  
  if (requirements && requirements.length > 0) {
    const firstSticker = requirements[0];
    const stickerInfo = getStickerInfo(firstSticker.stickerCode);
    color = stickerInfo.color;
  }
  
  // 查找弹窗元素并应用背景色
  const dialog = document.querySelector('.reward-detail-dialog .el-dialog');
  if (!dialog) {
    // 如果找不到，尝试其他选择器
    const dialog2 = document.querySelector('.el-dialog');
    if (dialog2 && dialog2.querySelector('.reward-detail-content')) {
      applyBackgroundToDialog(dialog2, color);
    }
    return;
  }
  
  applyBackgroundToDialog(dialog, color);
};

// 应用背景色到弹窗元素
const applyBackgroundToDialog = (dialog, color) => {
  if (color) {
    // 将颜色转换为rgba格式
    const rgbaColor = hexToRgba(color, 0.3);
    const rgbaColorLight = hexToRgba(color, 0.15);
    dialog.style.setProperty('--sticker-color', color);
    // 应用渐变背景，覆盖整个弹窗（深色背景 + 贴纸颜色渐变）
    dialog.style.background = `linear-gradient(135deg, ${rgbaColor} 0%, ${rgbaColorLight} 50%, rgba(28, 37, 41, 0.98) 100%)`;
    dialog.style.backgroundColor = `rgba(28, 37, 41, 0.95)`;
  } else {
    // 如果没有颜色，使用默认深色背景（与卡片背景一致）
    dialog.style.background = 'rgba(28, 37, 41, 0.95)';
    dialog.style.backgroundColor = 'rgba(28, 37, 41, 0.95)';
    dialog.style.setProperty('--sticker-color', '');
  }
  
  // 同时设置header、body、footer的背景
  const header = dialog.querySelector('.el-dialog__header');
  const body = dialog.querySelector('.el-dialog__body');
  const footer = dialog.querySelector('.el-dialog__footer');
  
  if (header) {
    header.style.background = 'transparent';
    header.style.backgroundColor = 'transparent';
  }
  if (body) {
    body.style.background = 'transparent';
    body.style.backgroundColor = 'transparent';
  }
  if (footer) {
    footer.style.background = 'transparent';
    footer.style.backgroundColor = 'transparent';
  }
};

// 将十六进制颜色转换为rgba
const hexToRgba = (hex, alpha) => {
  // 处理不同格式的颜色值
  let r, g, b;
  if (hex.startsWith('#')) {
    if (hex.length === 4) {
      // 短格式 #RGB
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else {
      // 标准格式 #RRGGBB
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
  } else if (hex.startsWith('rgb')) {
    // 如果是rgb格式，提取数值
    const matches = hex.match(/\d+/g);
    if (matches && matches.length >= 3) {
      r = parseInt(matches[0]);
      g = parseInt(matches[1]);
      b = parseInt(matches[2]);
    } else {
      return `rgba(28, 37, 41, ${alpha})`;
    }
  } else {
    // 默认颜色
    return `rgba(28, 37, 41, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// 关闭奖励详情弹窗
const handleCloseRewardDetail = () => {
  rewardDetailDialogVisible.value = false;
  currentReward.value = null;
  
  // 清理背景色
  setTimeout(() => {
    const dialog = document.querySelector('.reward-detail-dialog .el-dialog');
    if (dialog) {
      dialog.style.background = '';
      dialog.style.setProperty('--sticker-color', '');
    }
  }, 100);
};

// 获取奖励卡片的样式（根据主要贴纸颜色设置背景）
const getRewardCardStyle = (reward) => {
  const requirements = parseStickerRequirement(reward.reward.stickerRequirement);
  if (requirements && requirements.length > 0) {
    // 使用第一个贴纸的颜色作为背景
    const firstSticker = requirements[0];
    const stickerInfo = getStickerInfo(firstSticker.stickerCode);
    if (stickerInfo.color) {
      // 将颜色转换为RGB用于背景渐变
      const color = stickerInfo.color;
      return {
        '--sticker-color': color,
      };
    }
  }
  return {};
};

const getUserStickerQuantity = (stickerCode) => {
  return userStickers.value[stickerCode] || 0;
};

const parseStickerRequirement = (requirement) => {
  if (!requirement) return [];
  try {
    return JSON.parse(requirement);
  } catch (e) {
    return [];
  }
};

const checkStickerEnough = (requirements) => {
  if (!requirements || requirements.length === 0) return true;
  return requirements.every(req => {
    const userQuantity = getUserStickerQuantity(req.stickerCode);
    return userQuantity >= req.quantity;
  });
};

// 监听路由参数变化
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'sticker') {
    activeTab.value = 'sticker';
  } else if (newTab === 'activity' || !newTab) {
    activeTab.value = 'activity';
  }
});

// 监听 tab 切换，加载对应数据
watch(() => activeTab.value, (newTab) => {
  if (newTab === 'sticker' && store.isLogin) {
    getStickerTypes();
    getUserStickers();
    getRewardList();
  }
});

// 监听弹窗打开状态，应用背景色
watch(() => rewardDetailDialogVisible.value, (isVisible) => {
  if (isVisible && currentReward.value) {
    // 等待DOM渲染完成，多次尝试确保应用成功
    const tryApply = (attempts = 0) => {
      if (attempts > 20) return; // 最多尝试20次
      
      // 尝试多种选择器
      let dialog = document.querySelector('.reward-detail-dialog .el-dialog');
      if (!dialog) {
        dialog = document.querySelector('.el-dialog');
      }
      if (!dialog) {
        // 通过body查找
        const dialogs = document.querySelectorAll('.el-dialog');
        dialog = Array.from(dialogs).find(d => d.querySelector('.reward-detail-content'));
      }
      
      if (dialog) {
        applyDialogBackground(currentReward.value);
        // 再次确认应用成功
        setTimeout(() => {
          if (dialog.style.background === '' || dialog.style.background.includes('rgb(255')) {
            applyDialogBackground(currentReward.value);
          }
        }, 100);
      } else {
        setTimeout(() => tryApply(attempts + 1), 50);
      }
    };
    
    setTimeout(() => {
      tryApply();
    }, 100);
  } else if (!isVisible) {
    // 关闭时清理背景色
    setTimeout(() => {
      const dialogs = document.querySelectorAll('.el-dialog');
      dialogs.forEach(dialog => {
        if (dialog.querySelector('.reward-detail-content')) {
          dialog.style.removeProperty('background');
          dialog.style.removeProperty('background-color');
          dialog.style.removeProperty('--sticker-color');
        }
      });
    }, 100);
  }
});

onMounted(() => {
  getRNList();
  // 如果当前是贴纸tab且已登录，加载贴纸数据
  if (activeTab.value === 'sticker' && store.isLogin) {
    getStickerTypes();
    getUserStickers();
    getRewardList();
  }
});
</script>

<template>
  <Layout :style="{
    '--bg-item':requireImg('/center/bg-item.png',true),
    '--bg-btn':requireImg('/center/bg-btn.png',true),
    '--bg-center':requireImg('/v2/bg/bg-center.png',true)
  }">
    <template #item>
      <div class="bg center-bg"></div>
      
      <!-- Tab 切换 -->
      <div class="tab-container">
        <div class="tab-header">
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'activity' }"
            @click="activeTab = 'activity'"
          >
            福利活动
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'sticker' }"
            @click="activeTab = 'sticker'"
          >
            贴纸系统
          </div>
        </div>
      </div>

      <!-- 福利活动 Tab -->
      <div v-show="activeTab === 'activity'" class="tab-content">
      <div class="center">
        <div class="center-content">
          <div class="center-title">
            <span>新人实名福利</span>
          </div>
          <div class="center-content-fl">
            <div class="center-content-fl-item" v-for="(i,index) in RNList" :key="index">

              <div class="center-content-fl-item-name">
                <div>{{ i.name }}</div>
                <div style="white-space: nowrap">
                  <template v-if="i.ornament">
                    <!-- 饰品奖励 -->
                    {{ i.ornament.name || i.ornament.marketHashName || '饰品 x1' }}
                  </template>
                  <template v-else-if="i.name && i.name.includes('金币')">
                    <!-- 金币奖励 -->
                    金币 x{{ i.awardMoney || 0 }}
                  </template>
                  <template v-else-if="i.name && i.name.includes('弹药')">
                    <!-- 弹药奖励 -->
                    弹药 x{{ i.awardMoney || 0 }}
                  </template>
                  <template v-else>
                    <!-- 默认显示 -->
                    {{ i.awardMoney ? `奖励 x${i.awardMoney}` : '奖励' }}
                  </template>
                </div>
                <img :src="boxTigerImg" alt="">
              </div>
              <BaseButton v-if="i.getStatus==0" @click="getRNAward(index+1)" class="btn_n ungetted" font-size="13px" name="立即领取">
              </BaseButton>
              <BaseButton v-else-if="i.getStatus==1" :is-gray="true"  @click="getRNAward(index+1)" class="btn_n" font-size="13px" name="已领取" style="color: #b9b9b9;">
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
      <div class="center">
        <div class="center-content">
          <div class="center-title">
            <span>充值福利</span>
          </div>
          <div class="center-content-fl">
            <div class="center-content-fl-item" v-for="(i,index) in list" :key="index">

              <div class="center-content-fl-item-name">
                <div>{{ i.name }}</div>
                <div style="white-space: nowrap">
                  金币：{{ JSON.parse(i.awardSection)[0] }} - {{ JSON.parse(i.awardSection)[1] }}
                </div>
                <img :src="boxTigerImg" alt="">
              </div>

              <BaseButton :is-gray="!(i.getStatus==1&&i.recharge>=i.rechargeThreshold)"  @click="getAward(i)" class="btn_n ungetted2" font-size="12px">
                <template #name>
                  <div v-if="i.getStatus==0&&i.recharge>=i.rechargeThreshold">
                    已达到领取门槛 ({{ i.recharge }}/{{ i.rechargeThreshold }})
                  </div>
                  <div v-else-if="i.getStatus==1">已领取</div>
                  <div v-else-if="i.getStatus==0&&i.recharge<i.rechargeThreshold">未达到领取门槛
                    ({{ i.recharge }}/{{ i.rechargeThreshold }})
                  </div>
                </template>
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- 贴纸系统 Tab -->
      <div v-show="activeTab === 'sticker'" class="tab-content sticker-tab-content">
        <div class="sticker-page">
          <!-- 板块1：贴纸获取规则 -->
          <div class="center">
            <div class="center-content">
              <div class="center-title">
                <span>贴纸获取规则</span>
              </div>
              <div class="center-content-fl">
                <div
                  v-for="sticker in userStickerList"
                  :key="sticker.stickerCode"
                  class="center-content-fl-item"
                  :class="{ 'clickable': isBoxSticker(sticker.stickerType) }"
                  @click="handleStickerClick(sticker.stickerCode)"
                >
                  <div class="center-content-fl-item-name">
                    <div>{{ sticker.stickerName }}</div>
                    <div style="white-space: nowrap">
                      {{ sticker.obtainMethod || stickerConfig[sticker.stickerCode]?.type || '未知' }}
                    </div>
                    <!-- 贴纸图片 -->
                    <img 
                      v-if="sticker.stickerImage" 
                      :src="sticker.stickerImage" 
                      :alt="sticker.stickerName"
                      style="width: 80%; object-fit: contain;"
                    />
                    <div v-else style="font-size: 60px; margin: 10px 0;">
                      {{ stickerConfig[sticker.stickerCode]?.icon || '❓' }}
                    </div>
                  </div>
                  
                  <!-- 连续登录贴纸领取按钮 -->
                  <BaseButton 
                    v-if="sticker.stickerCode === 'purple' && loginProgress.canClaim" 
                    @click.stop="handleClaimLogin" 
                    class="btn_n ungetted" 
                    font-size="13px" 
                    :name="`领取 (${loginProgress.days}/7天)`"
                  />
                  <BaseButton 
                    v-else-if="sticker.stickerCode === 'purple'" 
                    :is-gray="true" 
                    class="btn_n" 
                    font-size="13px" 
                    :name="`进度：${loginProgress.days}/7天`" 
                    style="color: #b9b9b9;"
                  />
                  
                  <!-- 连续充值贴纸领取按钮 -->
                  <BaseButton 
                    v-if="sticker.stickerCode === 'orange' && rechargeProgress.canClaim" 
                    @click.stop="handleClaimRecharge" 
                    class="btn_n ungetted" 
                    font-size="13px" 
                    :name="`领取 (${rechargeProgress.days}/7天)`"
                  />
                  <BaseButton 
                    v-else-if="sticker.stickerCode === 'orange'" 
                    :is-gray="true" 
                    class="btn_n" 
                    font-size="13px" 
                    :name="`进度：${rechargeProgress.days}/7天`" 
                    style="color: #b9b9b9;"
                  />
                  
                  <!-- 其他贴纸显示拥有数量 -->
                  <div 
                    v-if="sticker.stickerCode !== 'purple' && sticker.stickerCode !== 'orange'"
                    class="sticker-quantity-info"
                  >
                    拥有：{{ getUserStickerQuantity(sticker.stickerCode) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 板块2：贴纸兑换奖励（中间推荐区域） -->
          <div class="center">
            <div class="center-content">
              <div class="center-title">
                <span>贴纸兑换奖励</span>
              </div>
              <div class="center-content-fl reward-preview-grid">
                <div
                  v-for="(reward, index) in rewardList"
                  :key="index"
                  class="reward-preview-card"
                  :class="{ 'can-exchange': canExchange(reward) }"
                  :style="getRewardCardStyle(reward)"
                >
                  <div class="reward-preview-header">
                    <h3 class="reward-preview-name">{{ reward.reward.rewardName }}</h3>
                    <div v-if="reward.reward.maxExchangeCount" class="reward-preview-limit">
                      限兑{{ reward.reward.maxExchangeCount }}次
                    </div>
                  </div>
                  
                  <!-- 所需贴纸预览 -->
                  <div class="reward-preview-stickers" @click.stop="handleViewRewardDetail(reward)">
                    <div
                      v-for="(req, idx) in parseStickerRequirement(reward.reward.stickerRequirement).slice(0, 3)"
                      :key="idx"
                      class="reward-preview-sticker-item"
                    >
                      <img
                        v-if="getStickerInfo(req.stickerCode).image"
                        :src="getStickerInfo(req.stickerCode).image"
                        :alt="getStickerInfo(req.stickerCode).name"
                        class="reward-preview-sticker-image"
                      />
                      <div
                        v-else
                        class="reward-preview-sticker-icon"
                        :style="{ 
                          backgroundColor: getStickerInfo(req.stickerCode).color + '20',
                          color: getStickerInfo(req.stickerCode).color,
                          borderColor: getStickerInfo(req.stickerCode).color
                        }"
                      >
                        {{ stickerConfig[req.stickerCode]?.icon || '❓' }}
                      </div>
                      <span class="reward-preview-sticker-quantity">x{{ req.quantity }}</span>
                    </div>
                    <div v-if="parseStickerRequirement(reward.reward.stickerRequirement).length > 3" class="reward-preview-more">
                      +{{ parseStickerRequirement(reward.reward.stickerRequirement).length - 3 }}
                    </div>
                  </div>
                  
                  <!-- 奖励饰品预览 -->
                  <div class="reward-preview-ornaments" @click.stop="handleViewRewardDetail(reward)">
                    <div
                      v-for="(ornament, idx) in reward.ornaments.slice(0, 2)"
                      :key="idx"
                      class="reward-preview-ornament-item"
                    >
                      <img
                        v-if="ornament.imageUrl"
                        :src="ornament.imageUrl"
                        :alt="ornament.ornamentName"
                        class="reward-preview-ornament-image"
                      />
                      <div class="reward-preview-ornament-info">
                        <div class="reward-preview-ornament-name">{{ ornament.ornamentName }}</div>
                        <div v-if="ornament.price" class="reward-preview-ornament-price">
                          {{ ornament.price.toFixed(2) }} 金币
                        </div>
                      </div>
                    </div>
                    <div v-if="reward.ornaments.length > 2" class="reward-preview-more-ornaments">
                      还有 {{ reward.ornaments.length - 2 }} 个饰品...
                    </div>
                  </div>
                  
                  <!-- 兑换按钮 -->
                  <div class="reward-preview-action">
                    <BaseButton
                      v-if="canExchange(reward)"
                      class="btn_n ungetted"
                      font-size="13px"
                      name="立即兑换"
                      @click.stop="handleExchange(reward)"
                    />
                    <BaseButton
                      v-else
                      class="btn_n"
                      font-size="13px"
                      name="查看详情"
                      @click.stop="handleViewRewardDetail(reward)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 奖励详情弹窗 -->
      <el-dialog
        v-model="rewardDetailDialogVisible"
        :title="currentReward ? currentReward.reward.rewardName : '奖励详情'"
        width="500px"
        class="reward-detail-dialog"
        :class="{ 'has-sticker-color': currentReward && getRewardCardStyle(currentReward)['--sticker-color'] }"
        @close="handleCloseRewardDetail"
        @opened="() => { if (currentReward) { setTimeout(() => applyDialogBackground(currentReward), 100); } }"
      >
        <div 
          v-if="currentReward" 
          class="reward-detail-content"
        >
          <div v-if="currentReward.reward.maxExchangeCount" class="reward-detail-limit">
            每人限兑{{ currentReward.reward.maxExchangeCount }}次
          </div>
          
          <!-- 所需贴纸 -->
          <div class="reward-detail-section">
            <div class="reward-detail-label">所需贴纸：</div>
            <div class="reward-detail-stickers">
              <div
                v-for="(req, idx) in parseStickerRequirement(currentReward.reward.stickerRequirement)"
                :key="idx"
                class="reward-detail-sticker-item"
              >
                <div class="sticker-image-container">
                  <img
                    v-if="getStickerInfo(req.stickerCode).image"
                    :src="getStickerInfo(req.stickerCode).image"
                    :alt="getStickerInfo(req.stickerCode).name"
                    class="sticker-requirement-image"
                  />
                  <div
                    v-else
                    class="sticker-requirement-icon"
                    :style="{ 
                      backgroundColor: getStickerInfo(req.stickerCode).color + '20',
                      color: getStickerInfo(req.stickerCode).color,
                      borderColor: getStickerInfo(req.stickerCode).color
                    }"
                  >
                    {{ stickerConfig[req.stickerCode]?.icon || '❓' }}
                  </div>
                </div>
                <div class="sticker-requirement-info">
                  <span class="sticker-badge" :style="{ 
                    backgroundColor: getStickerInfo(req.stickerCode).color + '20',
                    color: getStickerInfo(req.stickerCode).color,
                    borderColor: getStickerInfo(req.stickerCode).color
                  }">
                    {{ getStickerInfo(req.stickerCode).name }} x{{ req.quantity }}
                  </span>
                  <span class="quantity-check" :class="{
                    'enough': getUserStickerQuantity(req.stickerCode) >= req.quantity,
                    'not-enough': getUserStickerQuantity(req.stickerCode) < req.quantity
                  }">
                    (拥有: {{ getUserStickerQuantity(req.stickerCode) }})
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 奖励饰品 -->
          <div class="reward-detail-section">
            <div class="reward-detail-label">奖励饰品：</div>
            <div class="reward-detail-ornaments">
              <div
                v-for="(ornament, idx) in currentReward.ornaments"
                :key="idx"
                class="reward-detail-ornament-item"
              >
                <img
                  v-if="ornament.imageUrl"
                  :src="ornament.imageUrl"
                  :alt="ornament.ornamentName"
                  class="reward-detail-ornament-image"
                />
                <div class="ornament-info">
                  <div class="ornament-name">{{ ornament.ornamentName }}</div>
                  <div class="ornament-details">
                    <span class="ornament-quantity">x{{ ornament.quantity }}</span>
                    <span v-if="ornament.price" class="ornament-price">
                      {{ ornament.price.toFixed(2) }} 金币
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 贴纸不足提示 -->
          <div v-if="!checkStickerEnough(parseStickerRequirement(currentReward.reward.stickerRequirement))" class="reward-detail-insufficient">
            <div class="insufficient-title">贴纸不足</div>
            <div class="insufficient-stickers">
              <template
                v-for="(req, idx) in parseStickerRequirement(currentReward.reward.stickerRequirement)"
                :key="idx"
              >
                <div
                  v-if="getUserStickerQuantity(req.stickerCode) < req.quantity"
                  class="insufficient-item"
                >
                  <span class="insufficient-sticker-name">{{ getStickerInfo(req.stickerCode).name }}</span>
                  <span class="insufficient-quantity">
                    需要: {{ req.quantity }}，拥有: {{ getUserStickerQuantity(req.stickerCode) }}
                  </span>
                </div>
              </template>
            </div>
          </div>
          
          <!-- 兑换按钮 -->
          <div class="reward-detail-action">
            <BaseButton
              v-if="canExchange(currentReward)"
              class="btn_n ungetted"
              font-size="16px"
              name="立即兑换"
              @click="handleExchange(currentReward); handleCloseRewardDetail();"
            />
            <BaseButton
              v-else
              :is-gray="true"
              class="btn_n"
              font-size="16px"
              name="不可兑换"
              style="color: #b9b9b9;"
            />
          </div>
        </div>
        <template #footer>
          <el-button @click="handleCloseRewardDetail">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 箱子弹窗 -->
      <el-dialog
        v-model="boxDialogVisible"
        :title="currentSticker ? `可获取「${currentSticker.stickerName}」的箱子` : '箱子列表'"
        width="90%"
        :max-width="800"
        class="box-dialog"
      >
        <div v-loading="boxDialogLoading" class="box-dialog-content">
          <div v-if="!boxDialogLoading && boxList.length === 0" class="empty-boxes">
            <p>暂无可获取该贴纸的箱子</p>
          </div>
          <div v-else class="box-list-container">
            <div 
              v-for="(boxType, typeIndex) in boxList" 
              :key="typeIndex"
              class="box-type-section"
            >
              <div class="box-type-title">{{ boxType.boxTypeName || '未分类' }}</div>
              <div class="box-grid">
                <div
                  v-for="(box, boxIndex) in boxType.boxList"
                  :key="boxIndex"
                  class="box-item"
                  @click="handleOpenBox(box.boxId)"
                >
                  <img
                    v-if="box.boxImage"
                    :src="box.boxImage"
                    :alt="box.boxName"
                    class="box-image"
                  />
                  <div class="box-info">
                    <div class="box-name">{{ box.boxName }}</div>
                    <div class="box-price" v-if="box.price">
                      价格：{{ box.price }} 金币
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="boxDialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>

      <div style="height: 200px"></div>
    </template>
  </Layout>
</template>

<style scoped lang="scss">
@use "@/style" as *;

$primary-color-user: rgb(138, 15, 198);

// Tab 样式
.tab-container {
  z-index: 2;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding-top: 20px;
}

.tab-header {
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 4px;
  backdrop-filter: blur(10px);
}

.tab-item {
  padding: 10px 30px;
  border-radius: 6px;
  cursor: pointer;
  color: #b4c7c9;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
  
  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
  
  @include mobile {
    padding: 8px 20px;
    font-size: 14px;
  }
}

.tab-content {
  width: 100%;
  z-index: 2;
}

.sticker-tab-content {
  padding: 0 20px;
  
  @include mobile {
    padding: 0 10px;
  }
}

.center-bg{
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1;
  left: 0;
  top: 0;
  background-image: url('@/assets/images/roll/bg.png');
  background-repeat: no-repeat;
  background-size: 100% 96%;
  background-position: left bottom;
}
.center {
  z-index: 2;
  width:100%;

  &-title {
    width: 70%;
    height: 36px;
    background: url('@/assets/images/roll/title_bg.png') no-repeat;
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    margin-top: 20px;
    padding-bottom: 6px;
    box-sizing: border-box;
    span {
      font-family: "jijiati";
      font-size: 19px;
      background: linear-gradient(to bottom, #FFF3C8, #FFCE79); /* 渐变方向和颜色 */
      -webkit-background-clip: text; /* 仅限WebKit浏览器 */
      background-clip: text; /* 现代浏览器支持 */
      color: transparent; /* 文本颜色设为透明 */
    }
  }
  .btn_n{
    width: 75%;
    position: absolute;
    bottom: 16px;
    height: 26px;
    border-radius: 6px;
    background: linear-gradient(to right, #252525, #383838);
  }
  .ungetted {
    background: linear-gradient(to right, #12382b, #33492a);
  }
  .ungetted2 {
    background: linear-gradient(to right, #2e291c, #463e2b);
  }
  .center-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;

    &-title {
      position: relative;
      width: fit-content;
      margin: 20px 30px;
      align-self: flex-start;
      @include mobile {
        align-self: center;
      }

      span {
        position: relative;
        font-size: 30px;
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        color: #fff;
        z-index: 2;
        filter: drop-shadow(1px 1px 2px $primary-color-user);
      }

      div {
        content: '';
        position: absolute;
        width: 140%;
        height: 10px;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        background: $primary-color-user;
        z-index: 0;
      }
    }

    &-fl {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 20px;
      width: 100%;
      max-width: 900px;
      place-items: center;
      @include mobile {
        //display: flex;
        //flex-direction: column;
        //align-items: center;
        grid-template-columns: repeat(2, 1fr);
      }

      &-item {
        width: 214px;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 281px;
        border-radius: 6px;
        background-color: rgba($color: #1C2529, $alpha: 0.78);
        position: relative;
        
        &.clickable {
          cursor: pointer;
          transition: all 0.3s;
          
          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }
        }
        
        img {
          width: 80%;
        }
        @include mobile{
          width: 161px;
          height: 210px;
          img{
            width: 100px;
          }
        }
        
        .sticker-quantity-info {
          position: absolute;
          bottom: 16px;
          color: #1FEBC4;
          font-size: 14px;
          font-weight: bold;
        }



        &-name {
          width: 200px;
          height: 100%;
          background-size: 100% 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 12px;

          div:nth-child(1) {
            color: #fff;
            filter: drop-shadow(0 0 2px black);
            font-size: 14px;
            white-space: nowrap;
            margin: 6px 0;
          }

          div:nth-child(2) {
            color: #FFFFFFCC;

            filter: drop-shadow(0 0 2px black);
            font-size: 12px;

          }
        }


        &-btn {
          height: 42px;
          width: 240px;
          background-image: var(--bg-btn);
          background-size: 100% 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          bottom: -10px;

          filter: grayscale(100%);
          cursor: no-drop;

          div {
            font-size: 20px;
            font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
            color: #fff;
            filter: drop-shadow(0 0 0px rgb(138, 15, 198));
            display: flex;
            align-items: baseline;

            div {
              font-size: 16px;

            }
          }

          &.active {
            cursor: pointer;
            filter: grayscale(0%);

          }
        }

      }

    }
  }
}

// 贴纸系统样式
.sticker-page {
  padding: 20px 0;
  min-height: 100vh;
  
  @include mobile {
    padding: 10px 0;
  }
}



// 板块2：贴纸兑换奖励（中间推荐区域）
.reward-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
  width: 100%;
  max-width: 900px;
  place-items: center;
  
  @include mobile {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

.reward-preview-card {
  width: 214px;
  height: 350px;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  background-color: rgba($color: #1C2529, $alpha: 0.78);
  position: relative;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--sticker-color, transparent);
    opacity: 0.1;
    z-index: 0;
    pointer-events: none;
    border-radius: 6px;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  &.can-exchange {
    border: 2px solid #1FEBC4;
    box-shadow: 0 0 15px rgba(31, 235, 196, 0.3);
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  
  @include mobile {
    width: 161px;
    height: 280px;
    padding: 12px;
  }
}

.reward-preview-header {
  margin-bottom: 12px;
  
  .reward-preview-name {
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    margin: 0 0 4px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    @include mobile {
      font-size: 14px;
    }
  }
  
  .reward-preview-limit {
    color: #b4c7c9;
    font-size: 11px;
    
    @include mobile {
      font-size: 10px;
    }
  }
}

.reward-preview-stickers {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  
  .reward-preview-sticker-item {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px 8px;
    border-radius: 6px;
  }
  
  .reward-preview-sticker-image {
    width: 24px;
    height: 24px;
    object-fit: contain;
    border-radius: 4px;
  }
  
  .reward-preview-sticker-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    border-radius: 4px;
    border: 1px solid;
  }
  
  .reward-preview-sticker-quantity {
    color: #fff;
    font-size: 11px;
    font-weight: bold;
  }
  
  .reward-preview-more {
    color: #b4c7c9;
    font-size: 11px;
    margin-left: 4px;
  }
}

.reward-preview-ornaments {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
  overflow-y: auto;
  cursor: pointer;
  
  .reward-preview-ornament-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    padding: 6px;
    border-radius: 6px;
  }
  
  .reward-preview-ornament-image {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.2);
    padding: 2px;
    flex-shrink: 0;
  }
  
  .reward-preview-ornament-info {
    flex: 1;
    min-width: 0;
  }
  
  .reward-preview-ornament-name {
    color: #fff;
    font-size: 11px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 2px;
  }
  
  .reward-preview-ornament-price {
    color: #FFD700;
    font-size: 10px;
    font-weight: bold;
  }
  
  .reward-preview-more-ornaments {
    color: #b4c7c9;
    font-size: 11px;
    text-align: center;
    padding: 4px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
}

.reward-preview-stickers {
  cursor: pointer;
}

.reward-preview-view-detail {
  text-align: center;
  color: #1FEBC4;
  font-size: 12px;
  padding: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 4px;
  background: rgba(31, 235, 196, 0.1);
  transition: all 0.3s;
  
  &:hover {
    background: rgba(31, 235, 196, 0.2);
    transform: scale(1.02);
  }
}

.reward-preview-action {
  margin-top: auto;
  
  .btn_n {
    width: 100%;
    height: 26px;
    border-radius: 6px;
  }
}


// 奖励详情弹窗样式
.reward-detail-dialog {
  // 直接在dialog上应用背景 - 使用更强的选择器
  :deep(.el-dialog__wrapper) {
    .el-dialog {
      border-radius: 12px;
      overflow: hidden;
      background: rgba(28, 37, 41, 0.95) !important;
      background-color: rgba(28, 37, 41, 0.95) !important;
      position: relative;
      border: 2px solid rgba(255, 255, 255, 0.1);
      transition: background 0.3s ease;
    }
  }
  
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
    background: rgba(28, 37, 41, 0.95) !important;
    background-color: rgba(28, 37, 41, 0.95) !important;
    position: relative;
    border: 2px solid rgba(255, 255, 255, 0.1);
    transition: background 0.3s ease;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--sticker-color, transparent);
      opacity: 0.3;
      z-index: 0;
      pointer-events: none;
      border-radius: 12px;
      transition: opacity 0.3s ease;
    }
  }
  
  // 确保遮罩层不影响
  :deep(.el-overlay) {
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  :deep(.el-dialog__header) {
    background: transparent !important;
    background-color: transparent !important;
    padding: 15px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 1;
  }
  
  :deep(.el-dialog__title) {
    color: #fff !important;
    font-size: 18px;
    font-weight: bold;
    position: relative;
    z-index: 1;
  }
  
  :deep(.el-dialog__headerbtn) {
    position: relative;
    z-index: 1;
    
    .el-dialog__close {
      color: #fff !important;
      font-size: 20px;
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 20px;
    background: transparent !important;
    background-color: transparent !important;
    position: relative;
    z-index: 1;
  }
  
  :deep(.el-dialog__footer) {
    background: transparent !important;
    background-color: transparent !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 1;
    padding: 15px 20px;
    
    .el-button {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      color: #fff;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
  
}

.reward-detail-content {
  position: relative;
  min-height: 200px;
  
  .reward-detail-limit {
    color: #b4c7c9;
    font-size: 13px;
    margin-bottom: 15px;
    text-align: center;
  }
  
  .reward-detail-section {
    margin-bottom: 15px;
  }
  
  .reward-detail-label {
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .reward-detail-stickers {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .reward-detail-sticker-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.05);
    padding: 8px;
    border-radius: 6px;
  }
  
  .reward-detail-ornaments {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 250px;
    overflow-y: auto;
  }
  
  .reward-detail-ornament-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.05);
    padding: 10px;
    border-radius: 6px;
    transition: all 0.3s;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
  
  .reward-detail-ornament-image {
    width: 50px;
    height: 50px;
    object-fit: contain;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.2);
    padding: 2px;
    flex-shrink: 0;
  }
  
  .sticker-image-container {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .sticker-requirement-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 4px;
  }
  
  .sticker-requirement-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    border-radius: 4px;
    border: 1px solid;
  }
  
  .sticker-requirement-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }
  
  .sticker-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
    border: 1px solid;
    width: fit-content;
  }
  
  .quantity-check {
    font-size: 11px;
    
    &.enough {
      color: #1FEBC4;
    }
    
    &.not-enough {
      color: #FF352E;
    }
  }
  
  .ornament-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }
  
  .ornament-name {
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .ornament-details {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .ornament-quantity {
    color: #1FEBC4;
    font-size: 11px;
    font-weight: bold;
  }
  
  .ornament-price {
    color: #FFD700;
    font-size: 11px;
    font-weight: bold;
  }
  
  .reward-detail-insufficient {
    background: rgba(255, 53, 46, 0.1);
    border: 1px solid rgba(255, 53, 46, 0.3);
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 15px;
    
    .insufficient-title {
      color: #FF352E;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .insufficient-stickers {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .insufficient-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      
      .insufficient-sticker-name {
        color: #fff;
        font-weight: 500;
      }
      
      .insufficient-quantity {
        color: #FF352E;
      }
    }
  }
  
  .reward-detail-action {
    margin-top: 15px;
    text-align: center;
    
    .btn_n {
      width: 100%;
      height: 36px;
      font-size: 14px;
    }
  }
}

// 箱子弹窗样式
.box-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.box-dialog-content {
  min-height: 200px;
  max-height: 60vh;
  overflow-y: auto;
}

.empty-boxes {
  text-align: center;
  padding: 40px;
  color: #b4c7c9;
  font-size: 16px;
}

.box-list-container {
  .box-type-section {
    margin-bottom: 30px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .box-type-title {
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  }
  
  .box-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    
    @include mobile {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }
  
  .box-item {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    &:hover {
      transform: translateY(-5px);
      border-color: #1FEBC4;
      box-shadow: 0 5px 20px rgba(31, 235, 196, 0.3);
    }
    
    @include mobile {
      padding: 10px;
    }
  }
  
  .box-image {
    width: 100%;
    max-width: 150px;
    height: 150px;
    object-fit: contain;
    margin-bottom: 10px;
    border-radius: 8px;
    
    @include mobile {
      max-width: 100px;
      height: 100px;
    }
  }
  
  .box-info {
    width: 100%;
    text-align: center;
  }
  
  .box-name {
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    @include mobile {
      font-size: 12px;
    }
  }
  
  .box-price {
    color: #1FEBC4;
    font-size: 12px;
    
    @include mobile {
      font-size: 11px;
    }
  }
}

</style>

<style lang="scss">
// 全局样式 - 强制覆盖Element Plus弹窗的白色背景（不使用scoped）
.reward-detail-dialog .el-dialog {
  background: rgba(28, 37, 41, 0.95) !important;
  background-color: rgba(28, 37, 41, 0.95) !important;
}

.reward-detail-dialog .el-dialog__header {
  background: transparent !important;
  background-color: transparent !important;
}

.reward-detail-dialog .el-dialog__body {
  background: transparent !important;
  background-color: transparent !important;
}

.reward-detail-dialog .el-dialog__footer {
  background: transparent !important;
  background-color: transparent !important;
}
</style>
