<template>
  <div class="team-member-wrapper">
    <template v-for="(item, index) in data" :key="'member' + index">
      <div class="team-member-item">
        <div class="info">
          <div class="rank">{{ index + 1 }}</div>
          <div class="avatar-wrapper">
            <img
              class="avatar"
              :src="item[fieldMap.avatar]"
              alt=""
            />
            <img
              class="avatar-bg"
              src="@/assets/images/champion/avatar-rank-bg.png"
              alt=""
            />
          </div>
          <div class="name">{{ item[fieldMap.name] }}</div>
        </div>
        <template v-if="item.status === 0 && !(!isAudit && isLeader)">
          <div v-if="isAudit" class="audit-btn-wrap">
            <div class="audit-btn" @click="emit('audit', 1, item.id)">同意</div>
            <div class="audit-btn reject" @click="emit('audit', 2, item.id)">拒绝</div>
          </div>
          <div v-if="!isLeader" class="audit-btn-wrap">
            <div class="audit-btn" @click="emit('reply', 1, item.id)">同意邀请</div>
            <div class="audit-btn reject" @click="emit('reply', 2, item.id)">拒绝邀请</div>
          </div>
        </template>
        <div v-else class="status" :style="{ color: statusMap[item.status].color }">{{ statusMap[item.status].text }}</div>
      </div>
      <div class="split"></div>
    </template>
    <div v-if="!data.length" class="empty">暂无数据</div>
  </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
    required: true,
  },
  isAudit: {
    type: Boolean,
    default: false,
  },
  isLeader: {
    type: Boolean,
    default: false,
  },
});
const statusMap = computed(() => {
  if (props.isLeader && !props.isAudit) {
    return {
      0: { text: "未接受邀请", color: "#C4C4C4" },
      1: { text: "已接受邀请", color: "#3BDF93" },
      2: { text: "已拒绝邀请", color: "#FB7000" }
    }
  }
  return {
    1: { text: "已接受邀请", color: "#3BDF93" },
    2: { text: "已拒绝邀请", color: "#FB7000" }
  }
})
const fieldMap = computed(() => {
  if (props.isLeader && props.isAudit) {
    return {
      name: 'nickName',
      avatar: 'userAvatar'
    }
  }
  return {
    name: 'invitedUserName',
    avatar: 'invitedUserAvatar',
  }
})
const emit = defineEmits(['audit', 'reply']);
</script>

<style scoped lang="scss">
@use "@/style" as *;
.team-member-wrapper {
  width: 100%;
  min-height: 500px;
  padding: 1px 30px 40px 27px;
  border-radius: 8px;
  background-color: #38383894;
  font-weight: 500;
  font-family: "PingFang Medium";
  @include mobile {
    margin-top: 10px;
  }
  .team-member-item {
    width: 100%;
    height: 98px;
    padding-left: 27px;
    padding-right: 35px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    color: #FFFFFF;
    font-size: 17px;
    @include mobile {
      padding-left: 10px;
      padding-right: 10px;
      font-size: 14px;
      height: 50px;
    }
    .info {
      flex: 1;
      display: flex;
      align-items: center;
      .rank {
        text-align: center;
        width: 54px;
        height: 54px;
        line-height: 54px;
        background: url("@/assets/images/open/count-active-bg.png") no-repeat;
        background-size: 100% auto;
        @include mobile {
          width: 36px;
          height: 36px;
          line-height: 36px;
        }
      }
      .avatar-wrapper {
        margin-left: 24px;
        width: 80px;
        height: 81px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        @include mobile {
          width: 45px;
          height: 45px;
        }
        .avatar {
          width: 61px;
          height: 61px;
          border-radius: 50%;
          display: block;
          @include mobile {
            width: 32px;
            height: 32px;
          }
        }
        .avatar-bg {
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 50%;
          width: 100%;
          height: 100%;
          z-index: -1;
        }
      }
      .name {
        margin-left: 16px;
        max-width: 240px;
        text-overflow: ellipsis;// 显示省略符号来代表被修剪的文本
        white-space: nowrap; //文本不会换行，文本会在在同一行上继续，直到遇到标签为止
        overflow: hidden;// 超出部分隐藏
        @include mobile {
          margin-left: 4px;
          max-width: 80px;

        }
      }
    }
    .audit-btn-wrap {
      display: flex;
      align-items: center;
      .audit-btn {
        width: 116px;
        height: 44px;
        line-height: 44px;
        text-align: center;
        font-size: 18px;
        color: #072523;
        background: url('@/assets/images/champion/team/green-btn.png') no-repeat;
        background-size: 100% 100%;
        margin-left: 16px;
        cursor: pointer;
        @include mobile {
          width: 80px;
          height: 32px;
          line-height: 32px;
          font-size: 14px;
        }
        &.reject {
          background: url('@/assets/images/champion/team/red-btn.png') no-repeat;
          background-size: 100% 100%;
        }
      }
    }
    .status {
      font-size: 22px;
      color: #C4C4C4;
      @include mobile {
        font-size: 14px;
      }
      &.active {
        color: #3BDF93;
      }
    }
  }
  .split {
    margin: 0 auto;
    width: 1104px;
    height: 1px;
    background: #59554D;
  }
  .empty {
    width: 100%;
    height: 500px;
    font-size: 19px;
    color: #C4C4C4;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
