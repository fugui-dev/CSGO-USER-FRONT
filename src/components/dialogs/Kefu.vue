<script setup>
import { ref, watch, onMounted } from "vue";
import { useStore } from "@/store";
import { ossUrl } from "@/utils/ossUrl.js";

const store = useStore();
const scriptLoaded = ref(false);
let scriptLoadPromise = null;

// 更新用户信息到 window.ai_service
const updateUserInfo = () => {
  if (!window.ai_service) {
    window.ai_service = {};
  }
  
  if (store.isLogin && store.userInfo) {
    const userInfo = store.userInfo;
    window.ai_service.visiter_id = userInfo.userId ? String(userInfo.userId) : '';
    window.ai_service.visiter_name = userInfo.nickName || '';
    window.ai_service.avatar = userInfo.avatar 
      ? (userInfo.avatar.startsWith('http') ? userInfo.avatar : ossUrl(userInfo.avatar))
      : '';
  } else {
    window.ai_service.visiter_id = '';
    window.ai_service.visiter_name = '';
    window.ai_service.avatar = '';
  }
};

// 加载客服系统脚本
const loadCustomerServiceScript = () => {
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }
  
  if (scriptLoaded.value || document.getElementById('customer-service-script')) {
    return Promise.resolve();
  }
  
  scriptLoadPromise = new Promise((resolve, reject) => {
    // 设置用户信息（在加载脚本之前）
    updateUserInfo();
    
    // 加载客服系统脚本
    const script = document.createElement('script');
    script.id = 'customer-service-script';
    script.src = 'https://mxkf.site/assets/layer/ai_service_diy_266.js';
    script.charset = 'UTF-8';
    script.async = true;
    
    script.onload = () => {
      scriptLoaded.value = true;
      
      // 等待脚本初始化完成后，探索其功能
      setTimeout(() => {
        console.log('[客服] 脚本加载完成，探索功能...');
        console.log('[客服] window.ai_service:', window.ai_service);
        console.log('[客服] window.layer:', window.layer);
        console.log('[客服] window.layui:', window.layui);
        
        // 检查是否有全局方法
        const globalMethods = [];
        for (const key in window) {
          if (typeof window[key] === 'function' && (key.includes('service') || key.includes('kf') || key.includes('ai') || key.includes('layer'))) {
            globalMethods.push(key);
          }
        }
        console.log('[客服] 可能的全局方法:', globalMethods);
        
        // 检查创建的 DOM 元素（包括所有可能的弹框和按钮）
        const allSelectors = [
          '[class*="layer"]',
          '[id*="layer"]',
          '[class*="service"]',
          '[id*="service"]',
          '[class*="kf"]',
          '[id*="kf"]',
          '[class*="ai"]',
          '[id*="ai"]',
          'iframe[src*="kefu"]',
          'iframe[src*="mxkf"]',
          'iframe[src*="layer"]'
        ];
        
        for (const selector of allSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            console.log(`[客服] ${selector}:`, elements.length, '个元素');
            Array.from(elements).forEach((el, idx) => {
              if (idx < 3) { // 只显示前3个
                const style = window.getComputedStyle(el);
                console.log(`  [${idx}]`, el, {
                  display: style.display,
                  visibility: style.visibility,
                  opacity: style.opacity,
                  className: el.className,
                  id: el.id,
                  tagName: el.tagName
                });
              }
            });
          }
        }
      }, 2000); // 增加等待时间到2秒
      
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('客服系统脚本加载失败'));
    };
    
    document.body.appendChild(script);
  });
  
  return scriptLoadPromise;
};

// 打开客服窗口
const open = async () => {
  console.log('[客服] 开始打开客服窗口');
  
  try {
    // 更新用户信息
    updateUserInfo();
    
    // 如果脚本未加载，先加载脚本
    if (!scriptLoaded.value && !document.getElementById('customer-service-script')) {
      console.log('[客服] 开始加载脚本');
      await loadCustomerServiceScript();
      // 等待脚本初始化（客服系统可能需要更长时间）
      await new Promise(resolve => setTimeout(resolve, 2500));
    } else {
      // 脚本已加载，更新用户信息
      updateUserInfo();
      // 等待一小段时间确保DOM更新
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 尝试多种方式打开客服窗口
    // 方式1: 使用 blzx.connenct(0) - 这是客服系统提供的API
    if (window.blzx && typeof window.blzx.connenct === 'function') {
      console.log('[客服] 使用 window.blzx.connenct(0)');
      try {
        window.blzx.connenct(0);
        return;
      } catch (e) {
        console.warn('[客服] window.blzx.connenct(0) 失败:', e);
      }
    }
    
    // 方式2: 点击"在线咨询"按钮
    const consultBtn = document.getElementById('minblzxmsgtitlecontainerlabel');
    if (consultBtn) {
      console.log('[客服] 点击"在线咨询"按钮');
      try {
        consultBtn.click();
        return;
      } catch (e) {
        console.warn('[客服] 点击按钮失败:', e);
      }
    }
    
    // 方式3: 检查是否有 window.ai_service.open 方法
    if (window.ai_service && typeof window.ai_service.open === 'function') {
      console.log('[客服] 使用 window.ai_service.open()');
      try {
        window.ai_service.open();
        return;
      } catch (e) {
        console.warn('[客服] window.ai_service.open() 失败:', e);
      }
    }
    
    // 方式4: 检查是否有 window.ai_service.show 方法
    if (window.ai_service && typeof window.ai_service.show === 'function') {
      console.log('[客服] 使用 window.ai_service.show()');
      try {
        window.ai_service.show();
        return;
      } catch (e) {
        console.warn('[客服] window.ai_service.show() 失败:', e);
      }
    }
    
    // 方式5: 使用 layer.open
    if (window.layer && typeof window.layer.open === 'function') {
      console.log('[客服] 使用 window.layer.open()');
      try {
        window.layer.open({
          type: 2,
          title: '客服',
          area: ['800px', '600px'],
          content: 'https://kefu.mxyes.cn/index/index/home?visiter_id=' + (window.ai_service?.visiter_id || '') + '&visiter_name=' + (window.ai_service?.visiter_name || '') + '&avatar=' + (window.ai_service?.avatar || '') + '&groupid=0&business_id=45'
        });
        return;
      } catch (e) {
        console.warn('[客服] window.layer.open() 失败:', e);
      }
    }
    
    // 方式4: 查找并点击客服按钮（包括隐藏的）
    console.log('[客服] 尝试查找客服按钮');
    const buttonSelectors = [
      '.ai-service-btn',
      '[data-ai-service]',
      '.customer-service-btn',
      '.kf-btn',
      '#ai-service-btn',
      '.service-btn',
      'a[href*="mxkf"]',
      '[class*="ai-service"]',
      '[id*="ai-service"]',
      '[class*="service-btn"]',
      '[id*="service-btn"]',
      'button[onclick*="service"]',
      'button[onclick*="kf"]',
      'a[onclick*="service"]',
      'a[onclick*="kf"]'
    ];
    
    for (const selector of buttonSelectors) {
      const buttons = document.querySelectorAll(selector);
      for (const btn of buttons) {
        if (btn) {
          console.log('[客服] 找到按钮，点击:', selector, btn);
          // 临时显示按钮（如果是隐藏的）
          const originalDisplay = btn.style.display;
          btn.style.display = 'block';
          btn.style.visibility = 'visible';
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          
          btn.click();
          
          // 恢复样式
          setTimeout(() => {
            btn.style.display = originalDisplay;
          }, 100);
          
          return;
        }
      }
    }
    
    // 方式6: 查找弹框容器并尝试显示
    console.log('[客服] 尝试查找弹框容器');
    // 查找包含 iframe 的弹框容器
    const container = document.getElementById('minblzxmsgtitlecontainer');
    if (container) {
      const style = window.getComputedStyle(container);
      const rect = container.getBoundingClientRect();
      // 检查容器是否可见
      const isVisible = style.display !== 'none' 
        && style.visibility !== 'hidden' 
        && style.opacity !== '0'
        && rect.width > 0 
        && rect.height > 0;
      
      if (!isVisible) {
        console.log('[客服] 弹框容器被隐藏，尝试显示');
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.style.zIndex = '99999';
        return;
      } else {
        console.log('[客服] 弹框容器已显示');
        return;
      }
    }
    
    // 方式7: 查找其他弹框元素
    const dialogSelectors = [
      '.layui-layer',
      '.layui-layer-iframe',
      '.layui-layer-dialog',
      '[class*="layui-layer"]',
      '[id*="layui-layer"]'
    ];
    
    for (const selector of dialogSelectors) {
      const dialogs = document.querySelectorAll(selector);
      for (const dialog of dialogs) {
        if (dialog) {
          console.log('[客服] 找到弹框元素:', selector, dialog);
          const style = window.getComputedStyle(dialog);
          const rect = dialog.getBoundingClientRect();
          // 如果弹框被隐藏了，尝试显示
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || rect.width === 0 || rect.height === 0) {
            console.log('[客服] 弹框被隐藏，尝试显示');
            dialog.style.display = 'block';
            dialog.style.visibility = 'visible';
            dialog.style.opacity = '1';
            dialog.style.zIndex = '99999';
            return;
          }
        }
      }
    }
    
    console.warn('[客服] 未找到打开客服窗口的方法');
  } catch (error) {
    console.error('[客服] 打开客服窗口失败:', error);
  }
};

// 监听用户信息变化
watch(() => store.userInfo, () => {
  updateUserInfo();
}, { deep: true });

defineExpose({
  open
});
</script>

<template>
  <!-- 这个组件不需要模板，因为客服系统会自己创建UI -->
</template>

<style scoped lang="scss">
</style>
