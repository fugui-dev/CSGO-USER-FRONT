<script setup>
import { computed } from 'vue';
import Money from '@/assets/icons/money.svg'
import { level } from '@/lib/leavel'

const props = defineProps({
    boxData: {
        type: Object,
        required: false
    },
    shortName: {
        type: Boolean,
        required: false
    },
    isSmelt: {
        type: Boolean,
        required: false
    },
    isLuck: {
        type: Boolean,
        required: false
    },
    isGold:{
        type: Boolean,
        required: false
    }
});
const historyData = computed(() => {
    if (!props.boxData?.ornamentName) return { shortName: '', exteriorName: '' }

    const name = props.boxData.ornamentName
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
const displayShortName = computed(() => {
    if (!props.shortName) return ''
    if (props.boxData.shortName) return props.boxData.shortName
    return ''
})
const displayExteriorName = computed(() => {
    if (props.boxData.exteriorName) return props.boxData.exteriorName
    if (historyData.value.exteriorName) return historyData.value.exteriorName
    return ''
})

const displayName = computed(() => {
    if (historyData.value.shortName) return historyData.value.shortName
    if (props.boxData.name) {
        return props.boxData.name
    }
    if (props.isHistory) {
        return historyData.value.shortName
    }
    if (props.isOpen) {
        return props.boxData.ornamentName
    }
    if (props.isOpenModal) {
        return props.boxData.ornamenName
    }
    if (props.isUpgradeModal) {
        return props.boxData.ornamentName
    }

    return props.boxData.ornamentName || props.boxData.shortName || ''
})

const displayImageUrl = computed(() => {
    if (props.isUpgradeModal) return props.boxData.ornamentImgUrl
    return props.boxData.imageUrl || ''
})
const isOpenBox2Gift = computed(() => {
    if (props.boxData.isOpenBox2Gift) return true
    if (props.boxData.openBox2Gift) return true
    return false
})
const oddsResult = computed(() => {
    if (props.boxData.oddsResult) return props.boxData.oddsResult + '%'
    return ''
})

const levelId = computed(() => {
    if (props.isSmelt && props.boxData.usePrice) {
        if (props.boxData.usePrice <= 100) {
            return 3
        }
        if (props.boxData.usePrice <= 500) {
            return 4
        }
        if (props.boxData.usePrice <= 1000) {
            return 2
        }
        if (props.boxData.usePrice > 1000) {
            return 1
        }
    }
    return props.boxData.ornamentsLevelId || 5

})
const price = computed(() => {
    if (!props.isLuck &&props.boxData.ornamentsPrice) {
        return props.boxData.ornamentsPrice
    }
    return null
})
</script>
<template>
    <div
        class=" tw-relative tw-text-white tw-text-sm tw-font-bold   tw-w-[9.375rem] tw-aspect-[161/191]  tw-rounded md:tw-w-[15rem]">
        <div class=" tw-relative tw-w-full tw-h-full tw-overflow-hidden tw-rounded-xl">
            <div class="tw-absolute tw-inset-0 "
                :style="{ background: level[isOpenBox2Gift&&!isLuck ? 5 :isGold ? 1 : levelId].background }">
            </div>
            <div
                class="tw-absolute tw-inset-0 tw-flex-col tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center">
                <div
                    class="tw-w-[8.4375rem] md:tw-w-[12.5rem] tw-relative tw-flex tw-flex-col tw-items-center tw-justify-center">
                    <img :src="displayImageUrl" class="tw-w-full " />
                </div>

            </div>
            <div class="tw-h-full tw-w-full tw-flex tw-flex-col tw-justify-between tw-p-2">
                <div class="tw-flex tw-items-center tw-w-full tw-gap-1 tw-flex-row-reverse">
                    <span v-if="isOpenBox2Gift && !isLuck"
                        class=" tw-text-xs tw-text-white tw-px-2 tw-py-1 tw-border tw-border-[#1FEBC4]  tw-rounded-full tw-bg-[#1FEBC4]">赠品</span>
                    <div v-if="price"
                        class="tw-text-xs tw-text-white tw-px-2 tw-py-px tw-flex tw-items-center tw-border-[#FF7A21] tw-bg-[#FF7A21] tw-border tw-rounded-full tw-gap-px">
                        <img :src="Money" class="tw-h-[16px] md:tw-h-[1.25rem]" /> {{ price
                        }}
                    </div>
                </div>
                <div class=" tw-flex tw-flex-col tw-gap-px">
                    <!-- <span>{{ displayExteriorName }}</span>
                    <span>{{ displayShortName }}</span> -->
                    <div class="tw-line-clamp-1 tw-text-center" :title="displayName">
                        {{ displayName }}
                    </div>
                </div>
            </div>
        </div>

    </div>

</template>
