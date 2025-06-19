<script setup>
import { computed, ref } from 'vue';
import Money from "@/assets/icons/money.svg";
const level = {
    1: {
        color: '#f2a105',
        background: 'https://cfcfcs.oss-cn-beijing.aliyuncs.com/static/oss6d005153def8488687142e9affe0f156黄的_20250412192110A035.png'
    },
    2: {
        color: '#FC7F53',
        background: 'https://cfcfcs.oss-cn-beijing.aliyuncs.com/static/osscb46671391254998a8284904ca205eeb红色_20250412192118A036.png'
    },
    3: {
        color: '#B26DFF',
        background: 'https://cfcfcs.oss-cn-beijing.aliyuncs.com/static/ossbaeec2f95e37499b960c52080b0a1402紫色_20250412192130A037.png'
    },
    4: {
        color: '#4589FF',
        background: 'https://cfcfcs.oss-cn-beijing.aliyuncs.com/static/osseb77eeb679a742d1b96270171ec7ca62蓝色_20250412192148A038.png'
    },
}
const props = defineProps({
    boxData: {
        type: Object,
        required: false
    },
    shortName: {
        type: Boolean,
        required: false
    },
    showFooter: {
        type: Boolean,
        required: false
    },
    isRound: {
        type: Boolean,
        required: false
    },
    isSmelt:{
      type: Boolean,
      required: false
    },
    showPrice:{
        type: Boolean,
        required: false
    }
});
const hover = ref(false)
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
    if (!props.showFooter) return historyData.value.shortName
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
    return props.boxData.imageUrl || props.boxData.imgUrl || ''
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
const displayLevelImg = computed(() => {
    if (props.isSmelt && props.boxData.usePrice){
      if (props.boxData.usePrice<=100){
        return level[4].background
      }
      if (props.boxData.usePrice<=500){
        return level[3].background
      }
      if (props.boxData.usePrice<=1000){
        return level[2].background
      }
      if (props.boxData.usePrice>1000){
        return level[1].background
      }
    }
    if (props.boxData.ornamentLevelImg) return props.boxData.ornamentLevelImg
    if (props.boxData.levelImg) return props.boxData.levelImg
    return ''
})
const boxUser = computed(() => {
    if (props.boxData.avatar) return {
        name: props.boxData.holderUserNickName,
        avatar: props.boxData.avatar,
        id: props.boxData.holderUserId
    }
    return {
        name: '',
        avatar: '',
        id: ''
    }
})
</script>
<template>
    <div @mouseenter="hover = true" @mouseleave="hover = false" :class="{ 'tw-rounded': props.isRound }"
        class=" tw-relative tw-text-white  tw-text-sm tw-font-bold tw-w-[10.625rem] tw-bg-[#383131] md:tw-w-[11.625rem] tw-overflow-hidden">

        <div class=" tw-relative tw-w-full tw-h-[7.9375rem] tw-overflow-hidden">
            <img :src="displayLevelImg" class="tw-w-full tw-h-full tw-absolute tw-top-0 tw-left-0" />
            <div class="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center">
                <img :src="displayImageUrl" class="tw-w-[80%]" />
            </div>
            <div class="tw-h-full tw-w-full tw-flex tw-flex-col tw-justify-between tw-p-2">
                <div class="tw-flex tw-items-center tw-w-full tw-justify-between tw-flex-row-reverse">
                    <span v-if="isOpenBox2Gift" :class="{ 'tw-rounded': props.isRound }"
                        class=" tw-text-xs tw-text-white tw-px-2 tw-py-1 tw-border tw-border-[#1FEBC4]   tw-bg-[#1FEBC4]">赠品</span>
                    <span>{{ oddsResult }}</span>
                </div>
                <div class=" tw-flex tw-flex-col tw-gap-px tw-text-sm">
                    <span class="tw-line-clamp-1">{{ displayExteriorName }}</span>
                    <span class="tw-line-clamp-1">{{ displayShortName }}</span>
                </div>
            </div>
          <div v-if="showPrice" class="tw-text-sm" style="position: absolute;right: .6rem;top: .2rem;display: flex;align-items: center;font-size: .8rem">
            <img :src="Money" class="tw-h-[16px] md:tw-h-[1.5rem]" />
            <div>{{props.boxData.ornamentsPrice}}</div>
          </div>
        </div>
        <div v-if="boxUser.id" :class="{ 'tw-opacity-100': hover, 'tw-rounded': props.isRound }"
            class="tw-absolute tw-top-0 tw-left-0  tw-opacity-0 tw-duration-300 tw-gap-2 tw-text-sm tw-w-full tw-h-full  tw-items-center tw-justify-center tw-bg-black/70 tw-flex tw-flex-col">
            <img :src="boxUser.avatar" class="tw-w-10 tw-h-10 tw-rounded-full" />
            <div>
                {{ boxUser.name }}
            </div>
        </div>
        <div v-if="props.showFooter" class="tw-text-sm tw-text-center  tw-px-3 tw-py-2">
            <div class="tw-line-clamp-1" :title="displayName">
                {{ displayName }}
            </div>
        </div>

    </div>

</template>
