<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import m1 from "@/assets/music/m1.wav";
import m2 from "@/assets/music/m2.wav";
import endCenter from '@/assets/boxroom/endCenter.png'
import endLeft from '@/assets/boxroom/endLeft.png'
import endRight from '@/assets/boxroom/endRight.png'
import end1 from '@/assets/boxroom/end1.svg'
import end2 from '@/assets/boxroom/end2.svg'
import end3 from '@/assets/boxroom/end3.svg'
import end4 from '@/assets/boxroom/end4.svg'
import end5 from '@/assets/boxroom/end5.svg'
import { requireImg } from "@/utils/common";
import lightLeft from '@/assets/boxroom/dengLeft.png'
import lightRight from '@/assets/boxroom/dengRight.png'
import lightUp from '@/assets/boxroom/q565@2x(1).png'
import lightDown from '@/assets/boxroom/q565@2x.png'
import Money from '@/assets/icons/money.svg'
import { postDecompose } from '@/views/openBox/server/api'
import { ElMessage } from 'element-plus'
const leavel = {
    1: {
        color: '#FFBD4E',
        background: 'linear-gradient(180deg, rgba(97, 58, 1, 0.00) 38.42%, rgba(255, 180, 57, 0.26) 100%)',
        img: end1
    },
    2: {
        color: '#FF352E',
        background: 'linear-gradient(180deg, rgba(97, 8, 1, 0) 38.42%, rgba(222, 67, 32, 0.26) 100%)',
        img: end2
    },
    3: {
        color: '#984EFF',
        background: 'linear-gradient(180deg, rgba(52, 49, 56, 0.00) 0%, rgba(105, 39, 181, 0.51) 100%)',
        img: end4
    },
    4: {
        color: '#35B2FF',
        background: 'linear-gradient(180deg, rgba(1, 43, 97, 0) 38.42%, rgba(32, 102, 222, 0.26) 100%)',
        img: end3
    },
    5: {
        color: '#1FEBC4',
        background: 'linear-gradient(180deg, rgba(0, 117, 103, 0.00) 0%, rgba(31, 235, 196, 0.65) 100%)',
        img: end5
    }
}
const delayTime = ref(1)
const musica = new Audio(m1) //结束音频
const musicbai = new Audio(m2) //滚动音频
let show = ref(false)//遮罩层
let xiangzibaohan = []//不相应的箱子包含
let box = ref([])
const props = defineProps({
    openData: {
        type: Array,
        required: true
    },
    boxData: {
        type: Object,
        required: true
    },
    curindex: {
        type: Number,
        required: true
    },
    localSet: {
        type: Object,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});
const visible = ref(false)
const emit = defineEmits(['close', 'openAgain'])
onMounted(() => {
    musica.src = m1
    musicbai.src = m2
    musica.load()
    musicbai.load()
    document.body.scrollIntoView()
})

// 禁止缩放和滚动相关方法
const disableZoomAndScroll = () => {
    // 设置meta标签禁止缩放
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    } else {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(viewportMeta);
    }

    // 禁止body滚动
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    // 添加触摸事件监听器阻止默认行为
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
    document.addEventListener('touchstart', preventMultiTouch, { passive: false });
}

const enableZoomAndScroll = () => {
    // 恢复meta标签
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }

    // 恢复body滚动
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';

    // 移除事件监听器
    document.removeEventListener('touchmove', preventTouchMove);
    document.removeEventListener('touchstart', preventMultiTouch);
}

// 阻止多点触控（缩放）
const preventMultiTouch = (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}

// 阻止默认的触摸移动行为（滚动）
const preventTouchMove = (e) => {
    e.preventDefault();
}

// 在组件卸载时清理
onUnmounted(() => {
    enableZoomAndScroll();
})

const open = () => {
    visible.value = true
    disableZoomAndScroll();
}

const close = () => {
    visible.value = false
    enableZoomAndScroll();
    emit('close')
}

const openAnimation = () => {
    let arrlist = []
    const allValue = 120
    const stopValue = 97
    if (!props.localSet.animation) {
        show.value = false
        return
    }
    // 根据 oddsResult 比例填充 arrlist 到 120 个元素
    if (xiangzibaohan.length > 0) {
        // 计算总权重
        let totalWeight = 0;
        xiangzibaohan.forEach(item => {
            if (props.boxData.boxId === 155) {
                totalWeight += (item.oddsResult || 1);
            } else {
                totalWeight += 1;
            }
        });

        // 根据 oddsResult 比例填充 arrlist
        xiangzibaohan.forEach(item => {
            const weight = props.boxData.boxId === 155 ? item.oddsResult || 1 : 1;
            const count = Math.round((weight / totalWeight) * allValue);
            for (let i = 0; i < count; i++) {
                arrlist.push(item);
            }
        });

        if (arrlist.length > allValue) {
            arrlist = arrlist.slice(0, allValue);
        } else if (arrlist.length < allValue) {
            while (arrlist.length < allValue) {
                const randomIndex = Math.floor(Math.random() * xiangzibaohan.length);
                arrlist.push(xiangzibaohan[randomIndex]);
            }
        }

        arrlist = arrlist.sort(() => Math.random() - 0.5);
    }

    let finalArrlist = [];
    for (let i = 0; i < props.curindex; i++) {
        const boxItems = [...arrlist].sort(() => Math.random() - 0.5);
        if (props.openData && props.openData[i]) {
            while (boxItems.length < 97) {
                boxItems.push(xiangzibaohan[Math.floor(Math.random() * xiangzibaohan.length)]);
            }
            boxItems[96] = props.openData[i];
        }
        finalArrlist.push(boxItems);
    }
    box.value = finalArrlist;
    show.value = true

    // 计算总时间：基础动画时间 + 延迟时间 * (动画数量 - 1)
    const time = 13600 + (box.value.length - 1) * delayTime.value * 700 + 1000;
    console.log('动画总时间:', time, 'ms'); // 添加日志方便调试

    if (props.localSet.music) {
        musica.src = m1
        musica.play()
        show.value = true

        setTimeout(() => {
            musica.pause()
            musicbai.play()
            setTimeout(() => {
                show.value = false
            }, 600)
        }, time - 1600);
    } else {
        show.value = true
        setTimeout(() => {
            show.value = false
        }, time);
    }

    // 使用 nextTick 确保 DOM 更新后再触发动画
    nextTick(() => {
        const containers = document.querySelectorAll('.rooling_animin_wai');
        containers.forEach((container, index) => {
            setTimeout(() => {
                container.style.opacity = '1';

                // 触发水平光效动画
                const horizontalLightLine = container.closest('.rooling_animin').querySelector('.tw-h-\\[0\\.0625rem\\]');
                if (horizontalLightLine) {
                    horizontalLightLine.style.width = 'calc(100% - 4.5rem)';
                }

                // 触发垂直光效动画
                const verticalLightLine = container.closest('.rooling_animin').querySelector('.tw-w-px');
                if (verticalLightLine) {
                    verticalLightLine.style.height = '16.25rem';
                }

                // 容器显示后触发滚动动画
                const animations = container.querySelectorAll('.rooling_animation');
                animations.forEach(animation => {
                    animation.style.animationPlayState = 'running';
                });
            }, index * 300);
        });
    });
}
// 添加监听
watch(() => visible.value, (newVal) => {
    if (newVal) {
        xiangzibaohan = props.boxData.boxOrnamentsList
        // 设置默认选中所有物品
        selectedItems.value = props.openData.map((_, index) => index)
        openAnimation()
    }
})

// 添加新的函数和响应式变量
const scrollEndPosition = ref('-462.5rem');
const verticalEndPosition = ref('-95rem');

const calculateScrollPosition = () => {
    // 等待DOM更新完成
    nextTick(() => {
        if (show.value && props.curindex === 1) {
            try {
                // 获取容器和单个元素
                const container = document.querySelector('.rooling_ani_x');
                const items = document.querySelectorAll('.rooling_ani_x .rooling_animation');

                if (!container || items.length === 0) return;
                // 计算单个元素宽度（包括边距等）
                const itemWidth = items[0].offsetWidth;
                // 考虑间距 gap-0.5 (0.125rem)
                const gapWidth = 0.125 * 16; // 假设 1rem = 16px, gap-0.5 = 0.125rem
                // 容器宽度
                const containerWidth = container.offsetWidth;
                // 目标是第97个元素居中，计算需要的位移
                // 计算目标元素的位置（第97个，索引为96）- 考虑间距
                const targetPosition = (itemWidth * 96) + (gapWidth * 95);
                // 计算需要的位移量，使目标元素位于容器中央
                // 减去容器宽度的一半，再加上元素宽度的一半
                const scrollTo = targetPosition - (containerWidth / 2) + (itemWidth / 2);
                // 转换为rem单位（假设1rem = 16px，视情况调整）
                const scrollToRem = `${scrollTo / 16}rem`;
                // 设置滚动距离
                scrollEndPosition.value = `-${scrollToRem}`;
                // 动态设置CSS变量
                document.documentElement.style.setProperty('--scroll-end-position', `-${scrollToRem}`);
                console.log('水平滚动位置计算完成:', `-${scrollToRem}`);
            } catch (error) {
                console.error('计算滚动位置时出错:', error);
            }
        }
    });
};

const calculateVerticalPosition = () => {
    // 等待DOM更新完成
    nextTick(() => {
        if (show.value && props.curindex > 1) {
            try {
                // 获取容器和单个元素
                const container = document.querySelector('.rooling_ani');
                const items = document.querySelectorAll('.rooling_ani .rooling_animation');

                if (!container || items.length === 0) return;

                // 计算单个元素高度
                const itemHeight = items[0].offsetHeight;

                // 获取容器高度
                const containerHeight = container.offsetHeight;

                // 计算屏幕高度
                const screenHeight = window.innerHeight;

                // 目标是第97个元素（索引96）显示在中间
                // 计算元素总位移量
                const totalItemsHeight = itemHeight * 96;

                // 减去容器高度的一半以及元素高度的一半，以使目标元素居中
                const scrollTo = totalItemsHeight - (containerHeight / 2) + (itemHeight / 2);

                // 计算偏移值（随机值，范围是itemHeight的一半）
                const halfItemHeight = (itemHeight - 5) / 2;
                const randomOffset1 = Math.floor(Math.random() * halfItemHeight);
                const randomOffset2 = Math.floor(Math.random() * halfItemHeight);
                const randomOffset3 = Math.floor(Math.random() * halfItemHeight);
                const randomOffset4 = Math.floor(Math.random() * halfItemHeight);
                const randomOffset5 = Math.floor(Math.random() * halfItemHeight);
                // 转换为rem单位
                const scrollToRem1 = `${(scrollTo + randomOffset1) / 16}rem`;
                const scrollToRem2 = `${(scrollTo + randomOffset2) / 16}rem`;
                const scrollToRem3 = `${(scrollTo - randomOffset3) / 16}rem`;
                const scrollToRem4 = `${(scrollTo + randomOffset4) / 16}rem`;
                const scrollToRem5 = `${(scrollTo - randomOffset5) / 16}rem`;
                // 设置垂直滚动距离
                verticalEndPosition.value = `-${scrollToRem1}`;

                // 设置CSS变量
                document.documentElement.style.setProperty('--vertical-end-position1', `-${scrollToRem1}`);
                document.documentElement.style.setProperty('--vertical-end-position2', `-${scrollToRem2}`);
                document.documentElement.style.setProperty('--vertical-end-position3', `-${scrollToRem3}`);
                document.documentElement.style.setProperty('--vertical-end-position4', `-${scrollToRem4}`);
                document.documentElement.style.setProperty('--vertical-end-position5', `-${scrollToRem5}`);

                console.log('垂直滚动位置计算完成:', `-${scrollToRem1}`, `-${scrollToRem2}`, `-${scrollToRem3}`, `-${scrollToRem4}`, `-${scrollToRem5}`,
                    '元素高度(px):', itemHeight,
                    '随机偏移值:', randomOffset1, randomOffset2, randomOffset3, randomOffset4,
                    '容器高度(px):', containerHeight,
                    '屏幕高度(px):', screenHeight);
            } catch (error) {
                console.error('计算垂直滚动位置时出错:', error);
            }
        }
    });
};


// 监听显示状态变化
watch(() => show.value, (newVal) => {
    if (newVal) {
        // 当盒子显示时计算滚动位置
        if (props.curindex === 1) {
            calculateScrollPosition();
        } else if (props.curindex > 1) {
            calculateVerticalPosition();
        }
    }
});

const parseOrnamentName = (name) => {
    if (!name) return { main: '', sub: '' }
    const match = name.match(/(.*?)\s*\((.*?)\)$/)
    if (match) {
        return {
            main: match[1].trim(),
            sub: match[2].trim()
        }
    }

    return { main: name, sub: '' }
}

// 添加分解相关变量和计算属性
const selectedItems = ref([]);
const showDecomposeModal = ref(false);

// 计算分解后的总价格
const totalDecomposePrice = computed(() => {
    if (!props.openData || props.openData.length === 0) return '0.00';

    // 只计算选中项的总价格
    return selectedItems.value.reduce((total, index) => {
        const item = props.openData[index];
        return total + (item?.ornamentsPrice || 0);
    }, 0).toFixed(2);
});

// 处理物品选择事件
const toggleSelectItem = (index) => {
    const itemIndex = selectedItems.value.indexOf(index);
    if (itemIndex === -1) {
        selectedItems.value.push(index);
    } else {
        selectedItems.value.splice(itemIndex, 1);
    }
};

// 分解确认函数
const confirmDecompose = async () => {
    // 直接调用接口，无需打开模态框
    const itemsToDecompose = selectedItems.value.map(index => props.openData[index].id)
    if (itemsToDecompose.length === 0) return ElMessage.error('请选择要分解的物品');
    // 这里直接调用分解API
    const res = await postDecompose({
        isAll: false,
        packSackIds: itemsToDecompose
    })
    if (res.code === 200) {
        ElMessage.success('分解成功')
        // API调用成功后可以清空选择
        selectedItems.value = [];
        // 这里可以添加成功提示
        // 完成后可以调用关闭或刷新页面等操作
        close();
    }
};

const handleOpenAgain = () => {
    close()
    setTimeout(() => {
        emit('openAgain')
    }, 400)
}

defineExpose({
    open,
    close
})
</script>
<template>
    <div>
        <van-popup class="dialog no-scrollbar tw-font-SourceHanSansCN" v-model:show="visible"
            :close-on-click-overlay="false" :lock-scroll="true" teleport="body">
            <div class="">
                <div class="tw-relative tw-w-full tw-h-screen md:tw-gap-32 tw-flex tw-flex-col  md:tw-justify-center tw-items-center tw-bg-black tw-bg-opacity-[0.74] "
                    v-if="!show">
                    <img :src="endCenter" alt=""
                        class="tw-absolute tw-top-1/2 tw-translate-x-[-50%] md:tw-w-auto tw-w-3/4 tw-translate-y-[-50%] tw-left-1/2 ">
                    <img :src="endLeft" alt="" class=" tw-absolute md:tw-w-auto tw-w-1/2 tw-top-0 tw-left-0 ">
                    <img :src="endRight" alt="" class=" tw-absolute md:tw-w-auto tw-w-1/2 tw-top-0 tw-right-0 ">
                    <div class="tw-flex tw-items-center tw-gap-3 md:tw-gap-6 tw-mt-[6.25rem] md:tw-mt-0 ">
                        <div class="md:tw-w-[12.5rem] tw-h-[0.3125rem] tw-w-[6.25rem] md:tw-h-2.5 tw-rotate-180"
                            style="background: linear-gradient(90deg, #F34A34 0%, rgba(141, 43, 30, 0.00) 100%);">
                        </div>
                        <div class="tw-text-[#FFF5F5] tw-text-lg md:tw-text-[1.75rem] tw-font-bold"
                            style="text-shadow: 0px 0px 4.3px rgba(255, 69, 69, 0.65);">恭喜获得</div>
                        <div class="md:tw-w-[12.5rem] tw-h-[0.3125rem] tw-w-[6.25rem] md:tw-h-2.5 tw-relative"
                            style="background: linear-gradient(90deg, #F34A34 0%, rgba(141, 43, 30, 0.00) 100%);">

                        </div>

                    </div>

                    <div class="tw-flex tw-justify-center tw-gap-3 tw-flex-wrap tw-mt-[3.125rem] md:tw-gap-6">
                        <div v-for="(item, index) in openData" :key="index"
                            class="tw-relative tw-cursor-pointer md:tw-w-[13.75rem] tw-w-[8.75rem] tw-h-[7.5rem] md:tw-h-[11.875rem] tw-flex tw-flex-col tw-justify-end tw-items-center"
                            :class="{
                                'tw-transform tw-scale-105 tw-transition-all tw-duration-200': selectedItems.includes(index),
                                'tw-transition-all tw-duration-200 hover:tw-shadow-lg hover:tw-scale-[1.02]': !selectedItems.includes(index)
                            }" @click="toggleSelectItem(index)">
                            <div class="tw-absolute tw-w-full tw-h-[4.5rem] md:tw-h-[7.125rem] tw-border-b-2"
                                :style="{ borderColor: leavel[item.openBox2Gift ? 5 : item.ornamentsLevelId].color, background: leavel[item.openBox2Gift ? 5 : item.ornamentsLevelId].background }">
                            </div>
                            <img :src="leavel[item.openBox2Gift ? 5 : item.ornamentsLevelId].img"
                                class="tw-absolute tw-w-full tw-h-full" alt="">
                            <div class="tw-flex tw-justify-center tw-gap-1 tw-mb-1 tw-absolute tw-top-2 tw-right-1">
                                <span
                                    class="  tw-text-xs  tw-text-white tw-px-2 tw-py-px  tw-border tw-border-[#1FEBC4]  tw-rounded-full tw-bg-[#1FEBC4]"
                                    v-if="item.openBox2Gift">赠品</span>
                                <span
                                    class="tw-text-xs tw-text-white tw-px-2 tw-py-px tw-flex tw-items-center tw-border-[#FF7A21] tw-bg-[#FF7A21] tw-border tw-rounded-full tw-gap-px"
                                    v-if="item.ornamentsPrice"> <img :src="Money"
                                        class="tw-h-[16px] md:tw-h-[1.25rem]" /> {{ item.ornamentsPrice }}</span>
                            </div>

                            <img :src="item.imageUrl"
                                class="tw-w-[70%] tw-absolute tw-top-1/2 tw-left-1/2 tw-transform-gpu tw-animate-float"
                                alt="">
                            <div
                                class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-pb-1 tw-w-[80%] tw-relative">
                                <span class="tw-text-base" style="color: rgba(255, 245, 245, 0.80);">{{
                                    parseOrnamentName(item.ornamenName).sub }}</span>
                                <span class="tw-font-bold tw-text-[#FFF5F5] tw-w-full tw-line-clamp-1 tw-text-center"
                                    :title="parseOrnamentName(item.ornamenName).main">{{
                                        parseOrnamentName(item.ornamenName).main
                                    }}</span>
                            </div>
                            <!-- 选中标记 -->
                            <div v-if="selectedItems.includes(index)"
                                class="tw-absolute tw-top-2 tw-left-2 tw-bg-gradient-to-r tw-from-[#2DD4BF] tw-to-[#14B8A6] tw-rounded-full tw-w-6 tw-h-6 tw-flex tw-items-center tw-justify-center tw-text-white tw-shadow-md tw-animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" class="tw-h-4 tw-w-4" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div
                        class="tw-flex tw-my-auto md:tw-my-4 tw-justify-center tw-gap-2 md:tw-gap-4  tw-max-w-[32.125rem] tw-w-[80%] tw-relative">
                        <div @click="close()"
                            class="tw-text-white/50 tw-text-xl tw-absolute tw-left-[-0.375rem] md:tw-left-[-1rem] -tw-translate-x-full -tw-translate-y-[50%] tw-top-1/2 tw-cursor-pointer">
                            <svg t="1745850734448" class="icon" viewBox="0 0 1024 1024" version="1.1"
                                xmlns="http://www.w3.org/2000/svg" p-id="1463" width="32" height="32">
                                <path
                                    d="M512 929.959184c-230.4 0-417.959184-187.559184-417.959184-417.959184s187.559184-417.959184 417.959184-417.959184 417.959184 187.559184 417.959184 417.959184-187.559184 417.959184-417.959184 417.959184z m0-794.122449c-207.412245 0-376.163265 168.75102-376.163265 376.163265s168.75102 376.163265 376.163265 376.163265 376.163265-168.75102 376.163265-376.163265-168.75102-376.163265-376.163265-376.163265z"
                                    fill="#e6e6e6" p-id="1464"></path>
                                <path
                                    d="M355.265306 689.632653c-5.22449 0-10.44898-2.089796-14.628571-6.269388-8.359184-8.359184-8.359184-21.420408 0-29.779592l313.469387-313.469387c8.359184-8.359184 21.420408-8.359184 29.779592 0 8.359184 8.359184 8.359184 21.420408 0 29.779592l-313.469387 313.469387c-4.702041 4.179592-9.926531 6.269388-15.151021 6.269388z"
                                    fill="#e6e6e6" p-id="1465"></path>
                                <path
                                    d="M668.734694 689.632653c-5.22449 0-10.44898-2.089796-14.628572-6.269388l-313.469387-313.469387c-8.359184-8.359184-8.359184-21.420408 0-29.779592 8.359184-8.359184 21.420408-8.359184 29.779592 0l313.469387 313.469387c8.359184 8.359184 8.359184 21.420408 0 29.779592-4.702041 4.179592-9.926531 6.269388-15.15102 6.269388z"
                                    fill="#e6e6e6" p-id="1466"></path>
                            </svg>
                        </div>
                        <div @click="handleOpenAgain"
                            class="md:tw-relative tw-w-1/2 tw-py-3 tw-rounded-full tw-flex tw-justify-center tw-items-center md:tw-text-lg tw-font-bold tw-cursor-pointer tw-text-white tw-text-center"
                            style="background: linear-gradient(93deg, #FF553C 7.24%, #A70202 98.65%);box-shadow: 0px 4px 13.4px 0px rgba(214, 47, 34, 0.49);">
                            再开一次 <img :src="Money" class="tw-h-[1rem] md:tw-h-[1.75rem]" /> <span class="tw-text-sm">{{
                                props.price }}</span>
                        </div>
                        <div @click="confirmDecompose"
                            class="md:tw-relative tw-w-1/2 tw-py-3 tw-rounded-full md:tw-text-lg tw-font-bold tw-cursor-pointer tw-text-white tw-text-center tw-flex tw-justify-center tw-items-center tw-gap-1"
                            style="background: linear-gradient(93deg, #2DD4BF 0%, #0F766E 100%); box-shadow: 0px 4px 13.4px 0px rgba(15, 118, 110, 0.49);">
                            <span>分解</span>
                            <span v-if="selectedItems.length > 0 || openData.length > 0"
                                class="tw-font-bold tw-flex tw-items-center tw-text-sm">
                                <img :src="Money" class="tw-h-[16px] md:tw-h-[1.75rem]" /> {{ totalDecomposePrice }}
                            </span>
                        </div>

                    </div>

                </div>

                <div v-if="show && curindex > 1"
                    class="  tw-w-full tw-bg-[#000] tw-bg-opacity-[0.7]  tw-h-screen tw-overflow-hidden">
                    <div class="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-screen  tw-flex tw-flex-col  tw-z-20 ">
                        <div class=" tw-flex tw-justify-between tw-w-full tw-absolute tw-top-0 tw-left-0 tw-z-10">
                            <img :src="requireImg('/v2/bg/openBgLeft.png')"
                                class="tw-w-1/2 md:tw-w-[25.9375rem] tw-h-auto" alt="" />
                            <img :src="requireImg('/v2/bg/openBgRight.png')"
                                class="tw-w-1/2 md:tw-w-[25.9375rem] tw-h-auto" alt="" />
                        </div>
                        <div class="tw-relative tw-w-full tw-flex-col tw-flex tw-justify-between tw-h-screen  ">
                            <div class="tw-w-full tw-h-1/3 md:tw-h-1/4"
                                style="background: linear-gradient(180deg, #000 10.55%, rgba(0, 0, 0, 0.00) 100%);">
                            </div>
                            <div class="tw-w-full tw-h-1/3 md:tw-h-1/4"
                                style="background: linear-gradient(360deg, #000 10.55%, rgba(0, 0, 0, 0.00) 100%);">
                            </div>
                        </div>
                    </div>
                    <div class="rooing tw-h-full tw-overflow-hidden">
                        <div class="rooling_ani tw-scale-[33%] md:tw-scale-100">
                            <div class="rooling_animin tw-relative tw-gap-1">
                                <div
                                    class="tw-absolute tw-top-1/2 tw-flex tw-gap-1 tw-left-1/2 tw-translate-x-[-50%] tw-translate-y-[-50%] tw-w-full tw-z-20">
                                    <div class="tw-w-[12.5rem] tw-flex tw-justify-center  box-animation  tw-relative "
                                        v-for="(item, index) in box" :key="index"
                                        :style="{ animationDelay: `${(index * 0.3) + 0.3}s` }">
                                        <img :src="props.boxData.boxImg01" class=" tw-w-[75%] tw-h-auto" alt="" />
                                        <img :src="props.boxData.boxImg02"
                                            class="tw-w-1/2 tw-absolute tw-top-1/2 tw-translate-y-[-50%]" alt="" />
                                    </div>
                                </div>
                                <div
                                    class="tw-absolute tw-top-1/2 tw-left-1/2 tw-w-[110%] tw-flex tw-justify-center tw-items-center tw-z-10 tw-translate-x-[-50%] tw-translate-y-[-50%]">
                                    <img :src="lightLeft" class="tw-w-[2.25rem]" alt="" />
                                    <div class="tw-h-[0.0625rem] tw-w-0 tw-transition-all tw-duration-500 tw-ease-out tw-relative tw-rounded-full"
                                        style="background: linear-gradient(90deg, #FFC74A 0%, #FF7C2B 100%);">
                                    </div>
                                    <img :src="lightRight" class="tw-w-[2.25rem]" alt="" />
                                </div>
                                <div class="rooling_animin_wai md:tw-h-[100vh] tw-h-[300vh] tw-bg-[#20194F]"
                                    v-for="(item, index) in box" :key="index"
                                    :style="{ transitionDelay: `${(index) * 0.3}s` }">
                                    <div :class="['rooling_animation ', `animation${index}`]" v-for="(v, i) in item"
                                        :key="i">
                                        <div class="tw-w-full tw-h-full tw-relative tw-overflow-hidden tw-flex tw-justify-center tw-items-center tw-border-b-2"
                                            :style="{ borderColor: leavel[v.ornamentsLevelId].color }"
                                            style=" background:linear-gradient(180deg, rgba(56, 49, 49, 0.50) 0%, #383131 100%); ">
                                            <img :src="v.imageUrl" alt="">
                                            <div
                                                class="tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-px-2 tw-py-1  tw-flex  tw-justify-between tw-items-center">
                                                <div class="tw-text-white tw-text-xs tw-font-bold tw-line-clamp-1">{{
                                                    v.shortName ? v.shortName : parseOrnamentName(v.ornamenName).main
                                                    }}</div>
                                                <div class="tw-text-white tw-text-xs tw-font-bold tw-line-clamp-1">{{
                                                    v.exteriorName ? v.exteriorName :
                                                        parseOrnamentName(v.ornamenName).sub
                                                }}</div>
                                            </div>
                                            <!-- <span class="tw-absolute ">{{ i }}</span> -->
                                            <div class="tw-absolute tw-top-3 tw-left-0 tw-w-full tw-h-full"
                                                :style="{ background: leavel[v.ornamentsLevelId].background }">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="show && curindex === 1"
                    class="tw-w-[100%]  tw-h-screen tw-overflow-hidden transition-opacity duration-500 tw-bg-[#000] tw-bg-opacity-[0.7]">
                    <div class="tw-absolute tw-inset-0 tw-flex tw-flex-col tw-z-20">
                        <div class=" tw-flex tw-justify-between tw-w-full tw-absolute tw-top-0 tw-left-0  tw-z-10">
                            <img :src="requireImg('/v2/bg/openBgLeft.png')"
                                class="tw-w-1/2 md:tw-w-[25.9375rem] tw-h-auto" alt="" />
                            <img :src="requireImg('/v2/bg/openBgRight.png')"
                                class="tw-w-1/2 md:tw-w-[25.9375rem] tw-h-auto" alt="" />
                        </div>
                        <div class="tw-relative tw-w-full tw-hidden md:tw-flex tw-justify-between  tw-h-full">
                            <div class="tw-w-1/4 tw-h-full"
                                style="background: linear-gradient(90deg, #000 10.55%, rgba(0, 0, 0, 0.00) 100%);">

                            </div>
                            <div class="tw-w-1/4 tw-h-full"
                                style="background: linear-gradient(270deg, #000 10.55%, rgba(0, 0, 0, 0.00) 100%);">
                            </div>
                        </div>
                    </div>
                    <div class="rooing" style="max-width: 100vw;width: 100vw;">
                        <div class="rooling_ani_x tw-scale-50 md:tw-scale-100 tw-w-[200%]">
                            <div class="rooling_animin tw-relative">
                                <div
                                    class="tw-absolute tw-top-1/2 tw-left-1/2 tw-h-[16.25rem] tw-flex tw-flex-col tw-justify-center tw-items-center tw-z-10 tw-translate-x-[-50%] tw-translate-y-[-50%]">
                                    <img :src="lightUp" class="tw-w-[2.25rem]" alt="" />
                                    <div class="tw-w-px tw-h-0 tw-transition-all tw-duration-500 tw-ease-out"
                                        style="background: linear-gradient(90deg, #FFC74A 0%, #FF7C2B 100%);">
                                    </div>
                                    <img :src="lightDown" class="tw-w-[2.25rem]" alt="" />
                                    <div
                                        class=" tw-text-white tw-text-sm tw-absolute tw-gap-6 -tw-bottom-28 tw-flex tw-flex-col tw-justify-center tw-items-center ">
                                        <div class="three-body">
                                            <div class="three-body__dot"></div>
                                            <div class="three-body__dot"></div>
                                            <div class="three-body__dot"></div>
                                        </div>
                                        <span class=" tw-w-[2.625rem] tw-text-white/70">开启中</span>
                                    </div>
                                </div>
                                <div class="rooling_animin_wai  tw-flex tw-flex-row tw-gap-0.5 tw-border-b tw-border-t tw-border-[#FF2121] tw-border-opacity-30 tw-py-2"
                                    v-for="(item, index) in box" :key="index">
                                    <div :class="['rooling_animation tw-shrink-0 ', `animation0`]"
                                        :style="{ animationDelay: `${index * 0.5}s` }" v-for="(v, i) in item" :key="i">
                                        <div class="tw-w-full tw-h-full tw-relative tw-overflow-hidden tw-flex tw-justify-center tw-items-center tw-border-b-2"
                                            :style="{ borderColor: leavel[v.ornamentsLevelId].color }"
                                            style=" background:linear-gradient(180deg, rgba(56, 49, 49, 0.50) 0%, #383131 100%); ">
                                            <img :src="v.imageUrl" alt="">
                                            <div
                                                class="tw-absolute tw-bottom-0 tw-left-0 tw-w-full tw-px-2 tw-py-1  tw-flex  tw-justify-between tw-items-center">
                                                <div class="tw-text-white tw-text-xs tw-font-bold tw-line-clamp-1">{{
                                                    v.shortName ? v.shortName : parseOrnamentName(v.ornamenName).main
                                                    }}</div>
                                                <div class="tw-text-white tw-text-xs tw-font-bold tw-line-clamp-1">{{
                                                    v.exteriorName ? v.exteriorName :
                                                        parseOrnamentName(v.ornamenName).sub
                                                }}</div>
                                            </div>
                                            <!-- <span class="tw-absolute ">{{ i }}</span> -->
                                            <div class="tw-absolute tw-top-3 tw-left-0 tw-w-full tw-h-full"
                                                :style="{ background: leavel[v.ornamentsLevelId].background }">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>


        </van-popup>
    </div>

</template>
<style scoped lang="scss">
.three-body {
    --uib-size: 3.125rem;
    --uib-speed: 0.8s;
    --uib-color: #FFC74A;
    position: relative;
    display: inline-block;
    height: var(--uib-size);
    width: var(--uib-size);
    animation: spin78236 calc(var(--uib-speed) * 2.5) infinite linear;
}

.three-body__dot {
    position: absolute;
    height: 100%;
    width: 30%;
}

.three-body__dot:after {
    content: '';
    position: absolute;
    height: 0%;
    width: 100%;
    padding-bottom: 100%;
    background-color: var(--uib-color);
    border-radius: 50%;
}

.three-body__dot:nth-child(1) {
    bottom: 5%;
    left: 0;
    transform: rotate(60deg);
    transform-origin: 50% 85%;
}

.three-body__dot:nth-child(1)::after {
    bottom: 0;
    left: 0;
    animation: wobble1 var(--uib-speed) infinite ease-in-out;
    animation-delay: calc(var(--uib-speed) * -0.3);
}

.three-body__dot:nth-child(2) {
    bottom: 5%;
    right: 0;
    transform: rotate(-60deg);
    transform-origin: 50% 85%;
}

.three-body__dot:nth-child(2)::after {
    bottom: 0;
    left: 0;
    animation: wobble1 var(--uib-speed) infinite calc(var(--uib-speed) * -0.15) ease-in-out;
}

.three-body__dot:nth-child(3) {
    bottom: -5%;
    left: 0;
    transform: translateX(116.666%);
}

.three-body__dot:nth-child(3)::after {
    top: 0;
    left: 0;
    animation: wobble2 var(--uib-speed) infinite ease-in-out;
}

@keyframes spin78236 {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@keyframes wobble1 {

    0%,
    100% {
        transform: translateY(0%) scale(1);
        opacity: 1;
    }

    50% {
        transform: translateY(-66%) scale(0.65);
        opacity: 0.8;
    }
}

@keyframes wobble2 {

    0%,
    100% {
        transform: translateY(0%) scale(1);
        opacity: 1;
    }

    50% {
        transform: translateY(66%) scale(0.65);
        opacity: 0.8;
    }
}

.van-popup--center {
    margin: 0;
    width: 100%;
    max-width: 100%;

}

.dialog {
    background: none;
}

.btn {
    display: flex;
    justify-content: end;
    font-size: 0.7rem;

    img {
        width: 1rem;

        height: 1rem
    }

    .btn_music {
        display: flex;
        align-items: center;
    }

    .btn_dong {
        display: flex;
        align-items: center;
        margin: 0 1rem;
    }
}


.box_qiang_quan {
    width: 80%;
    position: relative;
    margin: 0 auto;


    .box_qiang {
        position: absolute;
        z-index: 1;
        animation: jumpBoxHandler 3s infinite ease-in-out;
    }

    .box_box {
        z-index: 0;
    }

    img {
        width: 100%;
    }
}

.rooing {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    margin: 0 auto;

    ::-webkit-scrollbar {
        display: none;
    }

    .rooling_ani {


        background-size: 100% 100%;
        position: relative;
        padding: 0 0.9375rem;
        border-left: 1px solid rgba(255, 33, 33, 0.30);
        border-right: 1px solid rgba(255, 33, 33, 0.30);

        .rooling_animin {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
        }

        .rooling_animin_wai {

            overflow: hidden;
            opacity: 0;
            transition: opacity 0.3s ease-out;
        }

        .rooling_animation {
            width: 12.5rem;
            height: 9.9375rem;
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            animation-play-state: paused;

            img {
                width: 90%;
            }

        }

        .animation0 {
            animation-duration: 13s;
            animation-iteration-count: 1;
            animation-name: heart-bounce;
            animation-timing-function: cubic-bezier(0.1, 0.1, 0.3, 0.4, 0.6, 0.8, 0.9, 0.9, 0.9, 1);
            animation-fill-mode: forwards;
        }

        .animation1 {
            animation-duration: 13s;
            animation-iteration-count: 1;
            animation-name: heart-bounce2;
            animation-timing-function: cubic-bezier(0.1, 0.1, 0.3, 0.4, 0.6, 0.8, 0.9, 0.9, 0.9, 1);
            animation-fill-mode: forwards;
            animation-delay: 0.5s;
        }

        .animation2 {
            animation-duration: 13s;
            animation-iteration-count: 1;
            animation-name: heart-bounce3;
            animation-timing-function: cubic-bezier(0.1, 0.1, 0.3, 0.4, 0.6, 0.8, 0.9, 0.9, 0.9, 1);
            animation-fill-mode: forwards;
            animation-delay: 1s;
        }

        .animation3 {
            animation-duration: 13s;
            animation-iteration-count: 1;
            animation-name: heart-bounce4;
            animation-timing-function: cubic-bezier(0.1, 0.1, 0.3, 0.4, 0.6, 0.8, 0.9, 0.9, 0.9, 1);
            animation-fill-mode: forwards;
            animation-delay: 1.5s;
        }

        .animation4 {
            animation-duration: 13s;
            animation-iteration-count: 1;
            animation-name: heart-bounce5;
            animation-timing-function: cubic-bezier(0.1, 0.1, 0.3, 0.4, 0.6, 0.8, 0.9, 0.9, 0.9, 1);
            animation-fill-mode: forwards;
            animation-delay: 2s;
        }
    }

    .rooling_ani_x {

        height: 11rem;
        background-size: 100% 100%;
        position: relative;
        /* 
        &::before {
            content: '';
            position: absolute;
            width: 2.25rem;
            height: 2.25rem;
            top: -4.25rem;
            left: 50%;
            transform: translate(-50%, 50%);
            margin: auto;
            background: url('@/assets/boxroom/q565@2x(1).png') no-repeat;
            background-size: 100% 100%;
            z-index: 10;
        }

        &::after {
            content: '';
            position: absolute;
            width: 2.25rem;
            height: 2.25rem;
            bottom: -2rem;
            left: 50%;
            margin: auto;
            transform: translate(-50%, 50%);
            background: url('@/assets/boxroom/q565@2x.png') no-repeat;
            background-size: 100% 100%;
        } */

        .rooling_animin {
            display: flex;

            justify-content: center;
            height: 100%;

            /* &::before {
                content: '';
                position: absolute;
                width: 0.125rem;
                height: 13.25rem;
                background: linear-gradient(90deg, #FFC74A 0%, #FF7C2B 100%);
                box-shadow: 0 0 29px 8px #FFC74A;
                z-index: 2;
                top: 0;
                left: 0;
                margin: auto;
                right: 0;
                bottom: 0;
            } */
        }

        .rooling_animin_wai {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }

        .rooling_animation {
            width: 12.5rem;
            height: 9.9375rem;
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;

            img {
                width: 90%;
            }
        }

        .animation0 {
            animation-duration: 13s;
            animation-iteration-count: 1;
            animation-name: heart-bounceX;
            animation-timing-function: cubic-bezier(0.1, 0.1, 0.3, 0.4, 0.6, 0.8, 0.9, 0.9, 0.9, 1);
            animation-fill-mode: forwards;
        }
    }
}

@keyframes heart-bounce {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(var(--vertical-end-position1));
    }
}

@keyframes heart-bounce2 {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(var(--vertical-end-position2));
    }
}

@keyframes heart-bounce3 {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(var(--vertical-end-position3));
    }
}

@keyframes heart-bounce4 {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(var(--vertical-end-position4));
    }
}

@keyframes heart-bounce5 {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(var(--vertical-end-position5));
    }
}

@keyframes heart-bounceX {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(var(--scroll-end-position));
    }
}

/* 仍然保留媒体查询作为备用 */
@media (max-width: 768px) {
    :root {
        --scroll-end-position-mobile: -531.25rem;
    }

    @keyframes heart-bounceX {
        from {
            transform: translateX(0);
        }

        to {
            transform: translateX(var(--scroll-end-position, var(--scroll-end-position-mobile)));
        }
    }
}

.van-overlay {
    width: 100% !important;
    background: rgba(0, 0, 0, 0.5) !important;
}

.color_1 {
    background: #fbb800;
}

.color_2 {
    background: #ff0000;
}

.color_3 {
    background: #4d008f;
}

.color_4 {
    background: #0000ff;
}

.color_5 {
    background: #221a11;
}

@keyframes jumpBoxHandler {
    0% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-1rem)
    }

    100% {
        transform: translateY(0);
    }
}

/* 盒子容器样式 */
.tw-box-container {
    position: relative;
    padding: 0.75rem;
    transition: all 0.3s ease;
}

/* 确保PC端盒子大小一致 */
.tw-box-fixed-size {
    width: 200px;
    height: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
}



/* 确保单个盒子与多个盒子大小一致 */
@media (min-width: 768px) {
    .tw-grid-cols-1 .tw-box-fixed-size {
        width: 200px !important;
        height: 250px !important;
    }

    /* 确保盒子内容不会挤压或拉伸 */
    .tw-box-scale {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
}

/* 移动端Box组件缩放 */
.tw-box-scale {
    /* 确保内容居中 */
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 单个盒子的特殊处理 */
.tw-box-single {
    padding: 0.75rem;
    width: 100%;
    margin: 0 auto !important;
    /* 确保单个盒子宽度和多个盒子一致 */
    max-width: 200px;
}

/* 添加动画 */
@keyframes float {
    0% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-10px);
    }

    100% {
        transform: translateY(0px);
    }
}

.tw-box-container:hover {
    animation: float 3s ease-in-out infinite;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 闪光效果 */
.tw-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

/* 内容容器统一样式 */
.tw-box-content-container {
    width: 100%;
    box-sizing: border-box;
}


/* 增强的脉冲动画 */
@keyframes enhancedPulse {
    0% {
        opacity: 0.3;
    }

    50% {
        opacity: 0.7;
    }

    100% {
        opacity: 0.3;
    }
}

/* 轻微放大的动画 */
@keyframes subtleScale {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.05);
    }

    100% {
        transform: scale(1);
    }
}

/* 应用到光晕效果 */
.tw-blur-\[100px\] {
    animation: enhancedPulse 8s infinite, subtleScale 15s infinite;
}

/* 盒子数量响应式布局调整 */
@media (max-width: 768px) {

    /* 调整网格间距使组件更紧凑 */
    .tw-grid {
        gap: 0.5rem !important;
    }

    .tw-box-container {
        padding: 0.5rem;
    }



    /* 单个盒子占据更多空间但尺寸不变 */
    .tw-grid-cols-1 {
        max-width: 180px;
        margin: 0 auto;
    }

    /* 移动端的固定尺寸调整 */
    .tw-box-fixed-size {
        width: 150px;
        height: 200px;
    }
}

/* 添加自动消失的动画 */
.box-animation {
    animation: boxAnimation 0.3s forwards ease-out;
}

@keyframes boxAnimation {
    0% {
        opacity: 1;
    }

    100% {
        opacity: 0;

    }
}

/* 添加浏览器兼容性前缀 */
@-webkit-keyframes heart-bounce {
    from {
        -webkit-transform: translateY(0);
        transform: translateY(0);
    }

    to {
        -webkit-transform: translateY(var(--vertical-end-position1));
        transform: translateY(var(--vertical-end-position1));
    }
}

@-moz-keyframes heart-bounce {
    from {
        -moz-transform: translateY(0);
        transform: translateY(0);
    }

    to {
        -moz-transform: translateY(var(--vertical-end-position1));
        transform: translateY(var(--vertical-end-position1));
    }
}

@keyframes heart-bounce {
    from {
        -webkit-transform: translateY(0);
        -moz-transform: translateY(0);
        -ms-transform: translateY(0);
        transform: translateY(0);
    }

    to {
        -webkit-transform: translateY(var(--vertical-end-position1));
        -moz-transform: translateY(var(--vertical-end-position1));
        -ms-transform: translateY(var(--vertical-end-position1));
        transform: translateY(var(--vertical-end-position1));
    }
}

/* 添加硬件加速 */
.rooling_animation {
    -webkit-transform: translate3d(0, 0, 0);
    -moz-transform: translate3d(0, 0, 0);
    -ms-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-perspective: 1000;
    -moz-perspective: 1000;
    perspective: 1000;
    will-change: transform;
}

/* 修复Safari滚动问题 */
.rooling_animin_wai {
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
        display: none;
    }
}

/* 修复Firefox动画问题 */
@-moz-document url-prefix() {
    .rooling_animation {
        animation: none;
        -moz-animation: heart-bounce 13s cubic-bezier(0.2, 0.1, 0.1, 0.6) forwards;
    }
}

/* 修复IE11兼容性 */
@media all and (-ms-high-contrast: none),
(-ms-high-contrast: active) {
    .rooling_animation {
        animation: none;
        -ms-animation: heart-bounce 13s cubic-bezier(0.2, 0.1, 0.1, 0.6) forwards;
    }
}

/* 修复Chrome动画卡顿 */
@media screen and (-webkit-min-device-pixel-ratio:0) {
    .rooling_animation {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
    }
}

/* 添加动画性能优化 */
.rooling_animation {
    -webkit-transform-style: preserve-3d;
    -moz-transform-style: preserve-3d;
    transform-style: preserve-3d;
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    backface-visibility: hidden;
    will-change: transform;
}

/* 修复移动端Safari动画问题 */
@supports (-webkit-touch-callout: none) {
    .rooling_animation {
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
    }
}

/* 修复Edge浏览器动画问题 */
@supports (-ms-ime-align: auto) {
    .rooling_animation {
        -ms-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
    }
}

/* 添加动画降级处理 */
@media (prefers-reduced-motion: reduce) {
    .rooling_animation {
        animation: none !important;
        -webkit-animation: none !important;
        -moz-animation: none !important;
        -ms-animation: none !important;
        transition: transform 0.3s ease-out !important;
    }
}

/* 修复动画闪烁问题 */
.rooling_animin_wai {
    -webkit-transform: translateZ(0);
    -moz-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-perspective: 1000;
    -moz-perspective: 1000;
    perspective: 1000;
}

/* 添加动画性能监控 */
.rooling_animation {
    -webkit-transform: translate3d(0, 0, 0);
    -moz-transform: translate3d(0, 0, 0);
    -ms-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    -webkit-backface-visibility: hidden;
    -moz-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-perspective: 1000;
    -moz-perspective: 1000;
    perspective: 1000;
    will-change: transform;
    contain: layout style paint;
}

/* 添加移动端浏览器兼容性优化 */
@media (max-width: 768px) {

    /* 修复iOS Safari滚动问题 */
    .rooling_animin_wai {
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;

        &::-webkit-scrollbar {
            display: none;
        }

        /* 修复iOS Safari滚动卡顿 */
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
        -webkit-perspective: 1000;
        -webkit-backface-visibility: hidden;
    }

    /* 修复Android Chrome动画问题 */
    .rooling_animation {
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000;
        perspective: 1000;
        will-change: transform;
        contain: layout style paint;
    }

    /* 修复UC浏览器动画问题 */
    @supports (-webkit-touch-callout: none) {
        .rooling_animation {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
    }

    /* 修复QQ浏览器动画问题 */
    @media screen and (-webkit-min-device-pixel-ratio:0) {
        .rooling_animation {
            -webkit-transform: translateZ(0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
    }

    /* 修复华为浏览器动画问题 */
    @supports (-ms-ime-align: auto) {
        .rooling_animation {
            -ms-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -ms-backface-visibility: hidden;
            backface-visibility: hidden;
        }
    }

    /* 修复小米浏览器动画问题 */
    @media screen and (min-width: 0\0) {
        .rooling_animation {
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            perspective: 1000;
        }
    }

    /* 修复OPPO浏览器动画问题 */
    @media screen and (-webkit-min-device-pixel-ratio:0) and (min-resolution:0) {
        .rooling_animation {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
    }

    /* 修复vivo浏览器动画问题 */
    @media screen and (-webkit-min-device-pixel-ratio:0) and (min-resolution:72dpi) {
        .rooling_animation {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
    }

    /* 修复魅族浏览器动画问题 */
    @media screen and (-webkit-min-device-pixel-ratio:0) and (min-resolution:96dpi) {
        .rooling_animation {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
    }

    /* 修复360浏览器动画问题 */
    @media screen and (-webkit-min-device-pixel-ratio:0) and (min-resolution:120dpi) {
        .rooling_animation {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
    }

    /* 修复搜狗浏览器动画问题 */
    @media screen and (-webkit-min-device-pixel-ratio:0) and (min-resolution:144dpi) {
        .rooling_animation {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
    }

    /* 修复百度浏览器动画问题 */
    @media screen and (-webkit-min-device-pixel-ratio:0) and (min-resolution:168dpi) {
        .rooling_animation {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
    }

    /* 修复夸克浏览器动画问题 */
    @media screen and (-webkit-min-device-pixel-ratio:0) and (min-resolution:192dpi) {
        .rooling_animation {
            -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
        }
    }

    /* 添加动画降级处理 */
    @media (prefers-reduced-motion: reduce) {
        .rooling_animation {
            animation: none !important;
            -webkit-animation: none !important;
            -moz-animation: none !important;
            -ms-animation: none !important;
            transition: transform 0.3s ease-out !important;
        }
    }

    /* 修复动画闪烁问题 */
    .rooling_animin_wai {
        -webkit-transform: translateZ(0);
        -moz-transform: translateZ(0);
        -ms-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        -moz-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000;
        -moz-perspective: 1000;
        perspective: 1000;
    }

    /* 优化移动端性能 */
    .rooling_animation {
        -webkit-transform: translate3d(0, 0, 0);
        -moz-transform: translate3d(0, 0, 0);
        -ms-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
        -webkit-backface-visibility: hidden;
        -moz-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000;
        -moz-perspective: 1000;
        perspective: 1000;
        will-change: transform;
        contain: layout style paint;
        /* 添加GPU加速 */
        -webkit-transform-style: preserve-3d;
        transform-style: preserve-3d;
        /* 优化渲染 */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        /* 减少重绘 */
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        /* 优化动画性能 */
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
    }
}
</style>
<style>
.list-move,
/* 对移动中的元素应用的过渡 */
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.list-leave-active {
    position: absolute;
}

.tw-animate-float {
    animation: float 6s ease-in-out infinite;
    transform: translate(-50%, -50%);
}

@keyframes float {
    0% {
        transform: translate(-50%, -50%) rotate(0deg);
    }

    25% {
        transform: translate(-50%, calc(-50% - 5px)) rotate(0.5deg);
    }

    50% {
        transform: translate(-50%, -50%) rotate(0deg);
    }

    75% {
        transform: translate(-50%, calc(-50% + 5px)) rotate(-0.5deg);
    }

    100% {
        transform: translate(-50%, -50%) rotate(0deg);
    }
}
</style>
