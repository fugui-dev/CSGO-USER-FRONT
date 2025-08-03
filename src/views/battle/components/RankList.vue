<script setup>
import {requireImg} from "@/utils/common";

const props = defineProps({
  rankList: {
    type: Array,
    required: true
  }
});

</script>
<template>
    <div class="rank-list" v-if="rankList && rankList.length">
      <div :class="['rank-list-item', {highlight: index % 2 === 1}]" v-for="(item, index) in rankList" :key="item.userId">
        <div class="rank-list-item-left">
          <div class="serial-num">{{ index + 1 }}</div>
          <img class="avatar" :src="item.avatar" alt="">
          <span class="nick-name">{{ item.nickName }}</span>
        </div>
        <div class="rank-list-item-right">
          <img :src="requireImg('/coin1.png',false)" alt="">
          <div>{{ item.totalBoxPrice }}</div>
        </div>
      </div>
    </div>
    <div class="empty-box" v-else>
      <p>暂无数据</p>
    </div>
</template>

<style scoped lang="scss">
.rank-list {
  min-height: 200px;
  .highlight {
    background-color: #3e1313;
  }
  .rank-list-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 8px;
    .rank-list-item-left {
      display: flex;
      align-items: center;
      .serial-num {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid #aaa;
        background-color: #444;
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 18px;
        color: #eee;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 12px;
      }
      img.avatar {
        width: 34px;
        height: 34px;
        border-radius: 6px;
        border: 1px solid #f2a814;
        margin-right: 8px;
      }
      .nick-name {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 15px;
        white-space: nowrap; /* 防止文本换行 */
        overflow: hidden; /* 隐藏溢出的内容 */
        text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
        max-width: 120px;
      }
    }
    .rank-list-item-right {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      line-height: 1.5em;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 10px;
        margin-right: 3px;
      }
    }
  }
  .rank-list-item:nth-of-type(1) {
    .serial-num {
      border: 1px solid #f2a814;
      color: #684412;
      background: linear-gradient(#f8debb, #fab71b);
    }
  }
  .rank-list-item:nth-of-type(2) {
    .serial-num {
      border: 1px solid #ccc;
      color: #ffffff;
      background: linear-gradient(#e9e7e3, #646463);
    }
  }
  .rank-list-item:nth-of-type(3) {
    .serial-num {
      border: 1px solid #f0edd9;
      color: #ffffff;
      background: linear-gradient(#e8dabf, #9c7315);
    }
  }
}
.empty-box {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
  font-size: 16px;
  color: #ccc;
}
</style>
