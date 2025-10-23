<script setup>
import { computed, onMounted, ref } from "vue";
import { getMatchCheerListApi } from "@/api/champion";
import { requireImg } from "@/utils/common";
import Detail from "./Detail.vue";

const loading = ref(false);
const cheerList = ref([]);

const getMatchCheerList = () => {
  loading.value = true;
  const matchId = Number(window.sessionStorage.getItem("matchId"));
  getMatchCheerListApi({
    matchId: matchId,
  })
    .then((res) => {
      if (res.data && res.data.length) {
        cheerList.value = res.data;
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  getMatchCheerList();
});
import bgImg from "@/assets/images/champion/cheer-bg.webp";
</script>

<template>
  <Detail :bg="{ img: bgImg, height: '187vw' }">
    <div class="cheer-container" v-loading="loading">
      <div class="cheer-list" v-if="cheerList.length">
        <div
          class="cheer-list-item"
          v-for="(item, index) in cheerList"
          :key="item.id"
        >
          <div class="cheer-list-item-header">
            <div>队伍</div>
            <div>助威用户</div>
            <div>助威金额</div>
            <div>奖励积分</div>
          </div>
          <div
            class="cheer-list-item-content tw-flex tw-items-center tw-justify-center"
          >
            <div class="team tw-flex tw-items-center tw-justify-center">
              <div class="avatar-wrapper">
                <img class="avatar" :src="item.teamAvatar" alt="" />
                <img
                  class="avatar-bg"
                  src="@/assets/images/battle/avatar-bg.png"
                  alt=""
                />
              </div>
              {{ item.teamName }}
            </div>
            <div class="user tw-flex tw-items-center tw-justify-center">
              <div class="avatar-wrapper">
                <img class="avatar" :src="item.userAvatar" alt="" />
                <img
                  class="avatar-bg"
                  src="@/assets/images/battle/avatar-bg.png"
                  alt=""
                />
              </div>
              {{ item.userName }}
            </div>
            <div class="amount tw-flex tw-items-center tw-justify-center">
              <img
                src="@/assets/images/battle/battle-coin.png"
                class="coin"
                alt=""
              />
              <div>{{ item.amount }}</div>
            </div>
            <div class="refund-amount tw-flex tw-items-center tw-justify-center">
              <img
                src="@/assets/images/battle/battle-coin.png"
                class="coin"
                alt=""
              />
              <div>{{ item.refundAmount || '0' }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="empty-box" v-else>
        <p>暂无数据</p>
      </div>
    </div>
  </Detail>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.cheer-container {
  position: relative;
  padding-top: 26px;
  font-weight: 500;
  color: #ffffff;
  font-size: 17px;
  .cheer-list {
    width: 1018px;
    margin: 0 auto;
    .cheer-list-item {
      margin-top: 16px;
      padding: 9px 7px 0;
      width: 100%;
      height: 210px;
      background: url("@/assets/images/champion/cheer/box-bg.png") no-repeat;
      background-size: 100% 100%;
      .cheer-list-item-header {
        width: 100%;
        height: 72px;
        line-height: 72px;
        background: url("@/assets/images/champion/cheer/header-bg.png")
          no-repeat;
        background-size: 100% 100%;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 3px;
        text-align: center;
      }
      .cheer-list-item-content {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 3px;
        .team,
        .user,
        .amount,
        .refund-amount {
          width: 100%;
          height: 129px;
          .coin {
            width: 42px;
            height: 39px;
            margin-right: 12px;
          }
        }
        .avatar-wrapper {
          width: 99px;
          height: 89px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          margin-right: 14px;
          .avatar {
            width: 65px;
            height: 62px;
            border-radius: 50%;
            display: block;
          }
          .avatar-bg {
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            width: 99px;
            height: 89px;
          }
        }
      }
    }
  }
}
.empty-box {
  font-size: 18px;
  color: #3f1b1b;
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 响应式调整 */
@media (max-width: 768px) {
}
</style>
