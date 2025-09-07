<script setup>
import {reactive, onMounted, ref} from "vue";


const props = defineProps({
  text: {
    type: String,
    default: '拖拽按钮'
  }
});

let initWidth = ref(0) // 父元素的宽-自适应值
let initHeight = ref(0) // 父元素的高-自适应值
let startclientX = ref(0) // 元素拖拽前距离浏览器的X轴位置
let startclientY = ref(0) //元素拖拽前距离浏览器的Y轴位置
let elRight = ref(28) // 元素的右偏移量
let elTop = ref(10) // 元素的右偏移量
let draggableBtnRef = ref()

// 页面初始化
function initBodySize() {
  initWidth.value = draggableBtnRef.value?.parentElement.clientWidth; // 拿到父元素宽
  initHeight.value = initWidth.value * ((1080 * 0.88) / (1920 - 1080 * 0.02)); // 根据宽计算高实现自适应
}
// 拖拽开始事件
function dragstart(e) {
  startclientX.value = e.clientX; // 记录拖拽元素初始位置
  startclientY.value = e.clientY;
}
// 拖拽完成事件
function dragend(e) {
  let x = startclientX.value - e.clientX; // 计算X轴偏移（反向计算）
  let y = e.clientY - startclientY.value; // Y轴计算保持不变
  
  // 更新右侧和顶部位置
  elRight.value += x;
  elTop.value += y;
  
  // 限制按钮不能拖出可视区域
  const btnWidth = 92;
  const btnHeight = 92;
  const parentWidth = draggableBtnRef.value?.parentElement.clientWidth;
  const parentHeight = draggableBtnRef.value?.parentElement.clientHeight;
  
  if (elRight.value < 0) elRight.value = 0;
  if (elRight.value > parentWidth - btnWidth) elRight.value = parentWidth - btnWidth;
  if (elTop.value < 0) elTop.value = 0;
  if (elTop.value > parentHeight - btnHeight) elTop.value = parentHeight - btnHeight;
}
onMounted(()=>{
  initBodySize()
  window.addEventListener('resize', initBodySize);
})

</script>
<template>
    <div 
      class="draggable-btn"
      ref="draggableBtnRef"
      draggable="true"
      @dragstart="dragstart($event)"
      @dragend="dragend($event)"
      :style="`right:${elRight}px;top:${elTop}px`">
        <p>{{ text }}</p>
    </div>
</template>

<style scoped lang="scss">
.draggable-btn {
  width: 92px;
  height: 92px;
  background: url('@/assets/openBox/di.png') no-repeat;
  background-size: cover;
  font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
  display: flex;
  justify-content: center;
  align-items: center;
  text-shadow:  0px 0px 10px rgb(247, 219, 77);
  position: absolute;
  z-index: 3;
  cursor: pointer;
}
</style>
