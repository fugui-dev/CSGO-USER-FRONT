<script setup>
import BaseModel from '@/components/BaseModel/index.vue'
import { ref, onMounted, computed } from 'vue'
import { useDeviceType } from '@/composables/useDeviceType'
import Money from '@/assets/icons/money.svg'
const props = defineProps({
    moreData: {
        type: Object,
        default: () => { }
    },
    boxName: {
        type: String,
        default: ''
    }
})
const leavel = {
    1: {
        color: '#FFBD4E',
        background: 'linear-gradient(180deg, rgba(97, 58, 1, 0.00) 0%, rgba(255, 180, 57, 0.26) 100%)',
        name: "金色"
    },
    2: {
        color: '#FF352E',
        background: 'linear-gradient(180deg, rgba(97, 8, 1, 0) 0%, rgba(222, 67, 32, 0.26) 100%)',
        name: "红色"
    },
    3: {
        color: '#984EFF',
        background: 'linear-gradient(180deg, rgba(52, 49, 56, 0.00) 0%, rgba(105, 39, 181, 0.51) 100%)',
        name: "紫色"
    },
    4: {
        color: '#35B2FF',
        background: 'linear-gradient(180deg, rgba(1, 43, 97, 0) 0%, rgba(32, 102, 222, 0.26) 100%)',
        name: "蓝色"
    },
    5: {
        color: '#1FEBC4',
        background: 'linear-gradient(180deg, rgba(0, 117, 103, 0.00) 0%, rgba(31, 235, 196, 0.65) 100%)',
        name: "绿色"
    }
}
const visible = ref(false)
const { isPC } = useDeviceType()

const levelStyle = computed(() => {
    const id = props.moreData?.ornamentsLevelId || 1
    return {
        color: leavel[id].color,
        background: leavel[id].background
    }
})

const name = computed(() => {
    if (props.moreData?.name)
        return props.moreData?.name
    return props.moreData?.ornamentName
})
const levelImg = computed(() => {
    if (props.moreData?.levelImg)
        return props.moreData?.levelImg
    return props.moreData?.ornamentLevelImg
})
const price = computed(() => {
    if (props.moreData?.usePrice)
        return props.moreData?.usePrice
    return props.moreData?.ornamentsPrice
})
const shortName = computed(() => {
    if (props.moreData?.shortName)
        return props.moreData?.shortName
    return historyData.value.shortName
})
const exteriorName = computed(() => {
    if (props.moreData?.exteriorName)
        return props.moreData?.exteriorName
    return historyData.value.exteriorName
})
const historyData = computed(() => {
    if (!props.moreData?.ornamentName) return { shortName: '', exteriorName: '' }
    const name = props.moreData.ornamentName
    const match = name.match(/(.*?)\s*\((.*?)\)$/)
    if (match) {
        return {
            shortName: match[1].trim(),
            exteriorName: match[2].trim()
        }
    }

    return {
        shortName: name,
        exteriorName: ''
    }
})
const close = () => {
    visible.value = false
}
const open = () => {
    visible.value = true
}
defineExpose({
    open,
    close
})
</script>

<template>
    <div>
        <BaseModel v-model="visible" :modelStyle="{
            backgroundColor: '#111827',
            borderColor: '#111827',
            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.5)',
            width: isPC ? '60rem' : '100%',
            borderRadius: '12px'
        }" :closeOnEsc="true" :closeOnClickOutside="true" :showFooter="false" @close="close">
            <template #title>
                <div class="tw-flex tw-items-center tw-gap-3">
                    <div class="tw-text-lg md:tw-text-2xl tw-font-bold tw-text-white tw-relative">
                        饰品详情
                        <div
                            class="tw-absolute tw-h-[3px] tw-w-1/2 tw-bg-gradient-to-r tw-from-blue-500 tw-to-purple-500 tw-bottom-[-8px] tw-left-0 tw-rounded-full">
                        </div>
                    </div>
                </div>
            </template>
            <div
                class="tw-flex tw-flex-col md:tw-items-center md:tw-flex-row md:tw-justify-center tw-gap-6 tw-p-4 tw-bg-gray-900 tw-rounded-lg tw-text-white">
                <!-- 左侧图片区域 -->
                <div
                    class="tw-w-full md:tw-w-1/3 tw-flex tw-justify-center tw-items-center tw-bg-gradient-to-br tw-from-gray-800 tw-to-gray-900 tw-rounded-lg tw-overflow-hidden tw-shadow-lg">
                    <div class="tw-relative tw-group">
                        <img :src="levelImg" class="tw-z-[-1] tw-absolute tw-top-0 tw-right-0 tw-w-full tw-h-full" />
                        <img :src="moreData.imageUrl"
                            class="tw-w-full tw-p-2 tw-h-auto tw-object-contain tw-rounded tw-transition-all tw-duration-300 hover:tw-scale-105" />
                    </div>
                </div>
                <!-- 右侧信息区域 -->
                <div
                    class="tw-w-full md:tw-w-2/3 tw-flexw-flex-col tw-justify-start tw-p-4 tw-space-y-6 tw-rounded-xl tw-bg-gray-800/50 tw-backdrop-blur-sm tw-border tw-border-gray-700">
                    <!-- 顶部名称 -->
                    <h2
                        class="tw-text-2xl tw-font-bold tw-bg-clip-text tw-text-transparent tw-bg-gradient-to-r tw-from-blue-400 tw-to-purple-500">
                        {{ name }}
                    </h2>
                    <div class="tw-space-y-6">
                        <!-- 饰品信息卡片 -->
                        <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                            <!-- 饰品品质 -->
                            <div class="tw-flex tw-items-center tw-gap-4 tw-p-3 tw-rounded-lg "
                                :style="{ background: `${levelStyle.background}` }">
                                <div class="tw-w-1.5 tw-h-16 tw-rounded-full"
                                    :style="{ backgroundColor: levelStyle.color }"></div>
                                <div class="tw-flex tw-flex-col">
                                    <span class="tw-text-gray-400 tw-text-xs tw-font-medium">饰品品质</span>
                                    <span class="tw-font-bold tw-text-lg tw-mt-1" :style="{ color: levelStyle.color }">
                                        {{ leavel[moreData.ornamentsLevelId].name }}
                                    </span>
                                </div>
                            </div>

                            <!-- 外观信息 -->
                            <div class="tw-flex tw-items-center tw-gap-4 tw-p-3 tw-rounded-lg "
                                :style="{ background: `${levelStyle.background}` }">
                                <div class="tw-w-1.5 tw-h-16 tw-rounded-full"
                                    :style="{ backgroundColor: levelStyle.color }"></div>
                                <div class="tw-flex tw-flex-col">
                                    <span class="tw-text-gray-400 tw-text-xs tw-font-medium">外观</span>
                                    <span class="tw-font-bold tw-text-lg tw-mt-1" :style="{ color: levelStyle.color }">
                                        {{ exteriorName || '无' }}
                                    </span>
                                </div>
                            </div>

                            <!-- 概率信息 -->
                            <div v-if="moreData.oddsResult"
                                class="tw-flex tw-items-center tw-gap-4 tw-p-3 tw-rounded-lg "
                                :style="{ background: 'linear-gradient(180deg, rgba(97, 8, 1, 0) 0%, rgba(222, 67, 32, 0.26) 100%)' }">
                                <div class="tw-w-1.5 tw-h-16 tw-rounded-full tw-bg-[#FF352E]"></div>
                                <div class="tw-flex tw-flex-col">
                                    <span class="tw-text-gray-400 tw-text-xs tw-font-medium">出现概率</span>
                                    <span
                                        class="tw-font-bold tw-text-lg tw-mt-1 tw-text-[#FF352E] tw-flex tw-items-center">
                                        {{ moreData.oddsResult }}%
                                    </span>
                                </div>
                            </div>

                            <!-- 价格信息 -->
                            <div class="tw-flex tw-items-center tw-gap-4 tw-p-3 tw-rounded-lg "
                                :style="{ background: 'linear-gradient(180deg, rgba(97, 58, 1, 0.00) 0%, rgba(255, 180, 57, 0.26) 100%)' }">
                                <div class="tw-w-1.5 tw-h-16 tw-rounded-full tw-bg-[#FFBD4E]"></div>
                                <div class="tw-flex tw-flex-col">
                                    <span class="tw-text-gray-400 tw-text-xs tw-font-medium">饰品价格</span>
                                    <span
                                        class="tw-font-bold tw-text-lg tw-mt-1 tw-text-[#FFBD4E] tw-flex tw-items-center tw-gap-2">
                                        <img :src="Money" class="tw-h-5" />
                                        {{ price.toFixed(2) }}
                                    </span>
                                </div>
                            </div>

                            <!-- 简称信息 -->
                            <div class="tw-flex tw-items-center tw-gap-4 tw-p-3 tw-rounded-lg "
                                :style="{ background: 'linear-gradient(180deg, rgba(1, 43, 97, 0) 0%, rgba(32, 102, 222, 0.26) 100%)' }">
                                <div class="tw-w-1.5 tw-h-16 tw-rounded-full tw-bg-[#35B2FF]"></div>
                                <div class="tw-flex tw-flex-col">
                                    <span class="tw-text-gray-400 tw-text-xs tw-font-medium">开启箱子</span>
                                    <span class="tw-font-bold tw-text-lg tw-mt-1 tw-text-white">
                                        {{ boxName }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="moreData.updateTime"
                        class="tw-mt-6 tw-pt-3 tw-border-t tw-border-gray-700/50 tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-2">
                        <div class="tw-text-xs tw-text-gray-500 tw-bg-gray-800/50 tw-px-3 tw-py-1 tw-rounded-full">开启时间:
                            {{
                                moreData.updateTime }}</div>
                        <div
                            class="tw-flex tw-items-center tw-gap-2 tw-bg-gray-800/80 tw-px-3 tw-py-1.5 tw-rounded-full">
                            <img :src="moreData.avatar"
                                class="tw-w-6 tw-h-6 tw-rounded-full tw-border tw-border-gray-600" />
                            <span class="tw-text-xs tw-text-gray-300">{{ moreData.holderUserNickName }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </BaseModel>
    </div>
</template>
