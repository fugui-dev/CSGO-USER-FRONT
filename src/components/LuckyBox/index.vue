<script setup>
import { computed } from 'vue';
import { useTimeAgo } from '@vueuse/core'
const props = defineProps({
    luckyboxData: {
        type: Object,
        required: true
    },
    isShow: {
        type: Boolean,
        required: true
    },
});
const zh = {
    seconds: '刚刚',
    minutes: '分钟前',
    hours: '小时前',
    days: '天前',
    months: '月前',
    years: '年前'
}
const time = computed(() => {
    const num = useTimeAgo(props.luckyboxData.createTime)
    const parts = num.value.split(' ')
    if (parts.length < 2) return zh.seconds
    const number = parts[0]
    const unit = parts[1]
    return number + zh[unit]
})
</script>

<template>
    <div
        class="tw-relative tw-duration-300  tw-w-[7.5rem] tw-aspect-[5/6] tw-group hover:tw-scale-105 tw-transition-transform">
        <div
            class="tw-absolute tw-inset-0  tw-overflow-hidden tw-rounded-lg tw-border tw-border-[#FF7A21]/20">
            <img :src="luckyboxData.imageUrl"
                class="tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-[50%] -tw-translate-y-[50%] tw-w-4/5 tw-aspect-auto tw-object-contain tw-transition-transform tw-duration-300 group-hover:tw-scale-110"
                :alt="props.luckyboxData.ornamentName">
            <div
                class="tw-absolute tw-bottom-0 tw-w-full tw-px-2 tw-pb-3 tw-pt-8 tw-bg-gradient-to-t tw-from-black/60 tw-to-transparent">
                <div class="tw-text-center">
                    <div class="tw-text-white tw-text-sm tw-font-medium tw-line-clamp-1 tw-mb-1">
                        {{ props.luckyboxData.ornamentName }}
                    </div>
                    <div class="tw-text-[#FF7A21] tw-text-sm">
                        {{ time }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped></style>
