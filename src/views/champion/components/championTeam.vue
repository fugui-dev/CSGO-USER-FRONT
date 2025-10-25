<template>
  <div class="champion-team-wrapper">
    <div class="champion">
      <img
        class="avatar"
        :src="data.avatar ? data.avatar : requireImg('/v2/nav/u1.png')"
        alt=""
      />
      <img
        class="part-bg"
        src="@/assets/images/champion/champion-team-part-bg.png"
        alt=""
      />
      <img
        class="avatar-bg"
        src="@/assets/images/champion/avatar-bg.png"
        alt=""
      />
    </div>
    <div class="list-wrapper">
      <div
        class="user-list-item"
        v-for="item in data.matchUserList"
        :key="item.id"
        >
        <div class="avatar-wrapper">
          <img
            class="avatar"
            :src="item.userAvatar ? item.userAvatar : requireImg('/v2/nav/u1.png')"
            alt=""
          />
          <img
            class="avatar-bg"
            src="@/assets/images/champion/avatar-rank-bg.png"
            alt=""
          />
        </div>
        <div class="name">{{ item.userName }}</div>
        <div class="amount tw-flex tw-items-center tw-justify-center">
          <img
            src="@/assets/images/battle/battle-coin.png"
            class="coin"
            alt=""
          />
          <div>{{ item.totalScore }}</div>
        </div>
      </div>
      <div v-if="!data.matchUserList || data.matchUserList.length === 0" class="empty">
        暂无数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { requireImg } from "@/utils/common";
const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped lang="scss">
.champion-team-wrapper {
  width: 100%;
  padding: 0 20px;
  .champion {
    margin: 61px auto;
    width: 236px;
    height: 230px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    .avatar {
      width: 191px;
      height: 191px;
      border-radius: 50%;
      display: block;
    }
    .avatar-bg {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      border-radius: 50%;
      width: 100%;
      height: 100%;
    }
    .part-bg {
      position: absolute;
      top: 0;
      left: -161px;
      width: 577px;
      min-width: 577px;
      max-width: 577px;
      height: auto;
      z-index: -1;
    }
  }
  .list-wrapper {
    width: 1018px;
    margin: 100px auto;
    display: flex;
    flex-wrap: wrap;
    padding: 15px 22px;
    gap: 7px;
    background-color: rgb(51, 56, 57, 0.28);
    border-radius: 22px;
    max-height: 800px;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: none;
    }
    .user-list-item {
      padding-top: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 156px;
      height: 215px;
      background: url('@/assets/images/champion/champion-item-bg.png') no-repeat;
      background-size: 100% 100%;
      font-family: "PingFang Medium";
      font-weight: 500;
      font-size: 17px;
      color: #FFFFFF;
      .avatar-wrapper {
        width: 81px;
        height: 81px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: block;
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
        margin-top: 16px;
        width: 110px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .amount {
        width: 100%;
        margin-top: 20px;
        .coin {
          width: 29px;
          height: 28px;
          margin-right: 8px;
        }
      }
    }
    .empty {
      width: 100%;
      text-align: center;
      color: #ffffff;
      font-size: 20px;
      margin: 50px;
    }
  }
}
</style>
