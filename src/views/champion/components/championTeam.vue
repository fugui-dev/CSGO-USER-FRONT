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
    <div class="team-name">{{ data.name }}</div>
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
        <div class="name">{{ item.nickName || item.userName }}</div>
        <div class="amount tw-flex tw-items-center tw-justify-center">
          <img
            src="@/assets/images/battle/battle-coin.png"
            class="coin"
            alt=""
          />
          <div>{{ item.totalScore }}</div>
        </div>
        <!-- 展示队员开出的饰品 -->
        <div v-if="item.ornamentId && item.ornamentImage" class="ornament-wrapper">
          <div class="ornament-label">开出饰品</div>
          <div class="ornament-item">
            <img
              :src="item.ornamentImage"
              :alt="item.ornamentName"
              class="ornament-image"
            />
            <div class="ornament-info">
              <div class="ornament-name" :title="item.ornamentName">{{ item.ornamentName }}</div>
              <div v-if="item.ornamentPrice" class="ornament-price">
                {{ parseFloat(item.ornamentPrice).toFixed(2) }}
              </div>
            </div>
          </div>
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
@use "@/style" as *;
.champion-team-wrapper {
  width: 100%;
  padding: 0 20px;
  @include mobile {
    padding: 0;
  }
  .champion {
    margin: 61px auto 20px;
    width: 236px;
    height: 230px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    @include mobile {
      width: 118px;
      height: 115px;
      margin-top: 16px;
    }
    .avatar {
      width: 191px;
      height: 191px;
      border-radius: 50%;
      display: block;
      @include mobile {
        width: 95px;
        height: 95px;
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
      @include mobile {
        width: 289px;
        min-width: 289px;
        height: 289px;
        left: -80px;
      }
    }
  }
  .team-name {
    text-align: center;
    font-size: 28px;
    @include mobile {
      font-size: 16px;
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
    box-sizing: border-box;
    justify-content: center;
    @include mobile {
      width: 98%;
      margin: 20px auto;
      padding: 10px;
    }
    &::-webkit-scrollbar {
      display: none;
    }
      .user-list-item {
      padding-top: 22px;
      padding-bottom: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 156px;
      min-height: 215px;
      background: url('@/assets/images/champion/champion-item-bg.png') no-repeat;
      background-size: 100% 100%;
      font-family: "PingFang Medium";
      font-weight: 500;
      font-size: 17px;
      color: #FFFFFF;
      @include mobile {
        width: 30%;
        padding-top: 10px;
        padding-bottom: 8px;
        min-height: 140px;
        font-size: 14px;
      }
      .avatar-wrapper {
        width: 81px;
        height: 81px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        @include mobile {
          width: 60px;
          height: 60px;
        }
        .avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: block;
          @include mobile {
            width: 45px;
            height: 45px;
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
        margin-top: 16px;
        width: 110px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        @include mobile {
          margin-top: 4px;
        }
      }
      .amount {
        width: 100%;
        margin-top: 20px;
        @include mobile {
          margin-top: 6px;
        }
        .coin {
          width: 29px;
          height: 28px;
          margin-right: 8px;
          @include mobile {
            width: 18px;
            height: 18px;
            margin-right: 4px;
          }
        }
      }
      .ornament-wrapper {
        width: 100%;
        margin-top: 10px;
        padding: 0 8px;
        border-top: 1px solid rgba(143, 237, 216, 0.3);
        padding-top: 8px;
        @include mobile {
          margin-top: 6px;
          padding: 0 4px;
          padding-top: 6px;
        }
        .ornament-label {
          font-size: 11px;
          color: #8fedd8;
          text-align: center;
          margin-bottom: 6px;
          font-weight: 500;
          @include mobile {
            font-size: 9px;
            margin-bottom: 4px;
          }
        }
        .ornament-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          @include mobile {
            gap: 2px;
          }
          .ornament-image {
            width: 65px;
            height: 48px;
            object-fit: contain;
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(143, 237, 216, 0.2);
            padding: 2px;
            @include mobile {
              width: 50px;
              height: 38px;
            }
          }
          .ornament-info {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            .ornament-name {
              font-size: 10px;
              color: #ffffff;
              text-align: center;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              width: 100%;
              line-height: 1.2;
              @include mobile {
                font-size: 8px;
              }
            }
            .ornament-price {
              font-size: 10px;
              color: #ffd700;
              text-align: center;
              font-weight: 600;
              @include mobile {
                font-size: 8px;
              }
            }
          }
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
