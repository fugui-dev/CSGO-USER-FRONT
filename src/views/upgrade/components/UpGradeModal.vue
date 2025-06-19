<script setup>
import { ref, computed, onMounted } from "vue";
import { requireImg } from '@/utils/common'
import openSuccess from '@/assets/upgrade/open/open-success.png'
import BaseButton from '@/components/Btn/BaseButton.vue'
import { useDeviceType } from '@/composables/useDeviceType'
const props = defineProps({
  openData: {
    type: Object,
    required: true
  },
});

const emit = defineEmits(['close'])
const visible = ref(false)

const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
  setTimeout(() => {
    emit('close')
  }, 300)
}

const openData = computed(() => {
  try {
    if (props.openData && props.openData.gainOrnamentList) {
      // 检查是否已经是对象
      if (typeof props.openData.gainOrnamentList === 'object' && !Array.isArray(props.openData.gainOrnamentList) && props.openData.gainOrnamentList !== null) {
        return props.openData.gainOrnamentList;
      }
      // 检查是否是数组
      if (Array.isArray(props.openData.gainOrnamentList)) {
        return props.openData.gainOrnamentList[0];
      }
      // 尝试解析JSON字符串
      return JSON.parse(props.openData.gainOrnamentList)[0];
    }
    return {};
  } catch (e) {
    console.error('解析饰品数据出错:', e);
    return {};
  }
})

// 使用现有的设备类型检测hook
const { isPC } = useDeviceType()

defineExpose({
  open,
  close
})
</script>
<template>
  <div>
    <van-popup 
      class="dialog tw-no-scrollbar" 
      v-model:show="visible" 
      teleport="body"
      position="center"
      :close-on-click-overlay="false"
      :overlay-style="{ transition: 'opacity 0.3s ease' ,background: 'rgba(0, 0, 0, 0.95)'}"
      :style="{ 
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        marginTop: isPC ? '-10vh' : '-5vh',
        maxWidth: isPC ? '27.125rem' : '90vw'
      }">
      
      <div class="tw-relative tw-w-full tw-flex tw-flex-col tw-items-center">
        <div class="tw-relative tw-w-full" v-if="props.openData.isVictory">
          <img :src="requireImg('/v2/open/upgrade-open.png')" class="tw-w-full" />
          <img :src="openData.ornamentImgUrl"
            class="tw-absolute tw-top-1/3 tw-left-1/2 -tw-translate-x-1/2 tw-w-[50%] tw-max-w-[200px]" />
          <img :src="openSuccess" class="tw-absolute tw-top-1/2 tw-right-0 tw-w-[30%] md:tw-w-[9.75rem]" />
        </div>
        <div v-else class="tw-relative tw-w-full">
          <img :src="requireImg('/v2/open/open-fail.png')" class="tw-w-full" />
          <img :src="openData.ornamentImgUrl"
            class="tw-absolute tw-top-1/2 tw-left-1/2 tw-translate-x-[-50%] tw-translate-y-[-50%] tw-w-[70%] tw-max-w-[200px] tw-filter tw-brightness-80 tw-opacity-70 " />
        </div>
        <span class="tw-text-white tw-text-xl md:tw-text-2xl tw-font-bold -tw-translate-y-full tw-truncate tw-max-w-full tw-px-4" :title="openData.ornamentName">{{ openData.ornamentName }}</span>
        <BaseButton class="tw-text-white" :customStyle="{ width: isPC ? '12.625rem' : '10rem',height: isPC ? '' : '2.875rem' }" @click="close()">
          <template #name>
            确定
          </template>
        </BaseButton>
      </div>
    </van-popup>
  </div>

</template>
<style scoped lang="scss">
.dialog {
  background: none;
  transition: all 0.3s ease;
}

:deep(.van-popup) {
  transition: all 0.3s ease !important;
  overflow: visible !important;
  
  @media screen and (max-width: 768px) {
    width: 90vw !important;
  }
}

:deep(.van-overlay) {
  background: rgba(0, 0, 0, 0.9) !important;
  transition: opacity 0.3s ease !important;
}

:deep(.van-popup--center) {
  transition: opacity 0.3s ease, transform 0.3s ease !important;
}

// 优化长名称饰品显示
span.tw-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
