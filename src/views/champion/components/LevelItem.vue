<script setup>
import {computed, ref, watch, defineEmits} from "vue";
import {requireImg} from "@/utils/common";
import {joinTeamApi} from "@/api/champion"
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  showTitle: {
    type: Boolean
  },
  showBottomBtn: {
    type: Boolean
  },
  btnText: {
    type: String
  },
  label: {
    type: String
  },
  data: {
    type: Object,
    required: true
  },
  showStatus: {
    type: Boolean
  },
  statusText: {
    type: String
  },
  statusBgColor: {
    type: String
  }
});

const emit = defineEmits(['clickBtn'])

const handleClickBtn = (teamId) => {
  const stageGroupFightId = props.data.id
  emit('clickBtn', stageGroupFightId, teamId)
}

</script>
<template>
    <div class="level-item" :style="{
        '--bg-level-2':requireImg('/level/1.png',true),
        '--bg-level-4':requireImg('/level/2.png',true),
        '--bg-level-8':requireImg('/level/3.png',true),
        '--bg-level-16':requireImg('/level/4.png',true),
      }">
      <div class="level-item-container" v-if="showTitle">
        <div
          class="level-item-status"
          v-if="showStatus"
          :style="{backgroundColor: statusBgColor}">
            {{ statusText }}
        </div>
        <div class="level-item-wrap">
          <div class="level-item-content pad-margin-left">
            <h3>{{ data.team.aliasName }}</h3>
            <img :src="data.team.teamAvatar" alt="">
            <p>{{ data.team.teamName }}</p>
          </div>
          <div class="level-item-btn" v-if="showBottomBtn" @click.stop="handleClickBtn(data.team.teamId)">{{ btnText }}</div>
        </div>
        <div class="label-item-center">
          <p v-if="label" class="label">{{ label }}</p>
          <p class="vs">VS</p>
        </div>
        <div class="level-item-wrap level-item-right">
          <div class="level-item-content pad-margin-right">
            <h3>{{ data.opponentTeam.aliasName }}</h3>
            <img :src="data.opponentTeam.teamAvatar" alt="">
            <p>{{ data.opponentTeam.teamName }}</p>
          </div>
          <div class="level-item-btn" v-if="showBottomBtn" @click="handleClickBtn(data.opponentTeam.teamId)">{{ btnText }}</div>
        </div>
      </div>
      <div class="level-item-container" v-else>
        <div
          class="level-item-status"
          v-if="showStatus"
          :style="{backgroundColor: statusBgColor}">
            {{ statusText }}
        </div>
        <div class="level-item-wrap">
          <div class="level-item-content">
            <img :src="data.team.teamAvatar" alt="">
            <p>{{ data.team.teamName }}</p>
          </div>
          <div class="level-item-btn" v-if="showBottomBtn" @click="handleClickBtn">{{ btnText }}</div>
        </div>
        <div class="label-item-center">
          <p v-if="label" class="label">{{ label }}</p>
          <p class="vs">VS</p>
        </div>
        <div class="level-item-wrap level-item-right">
          <div class="level-item-content">
            <img :src="data.opponentTeam.teamAvatar" alt="">
            <p>{{ data.opponentTeam.teamName }}</p>
          </div>
          <div class="level-item-btn" v-if="showBottomBtn" @click="handleClickBtn">{{ btnText }}</div>
        </div>
      </div>
    </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;

.level-item-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 0;
  background-color: #eee;
  border-radius: 8px;
  margin: 10px;
  position: relative;
  background: linear-gradient(to right, rgb(188, 145, 207), rgb(112, 112, 200));
  .level-item-status {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    padding: 0 14px;
    z-index: 3;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  .pad-margin-left {
    background-color: #526fa4;
    padding: 2px 10px;
    border-radius: 4px;
  }
  .pad-margin-right {
    background-color: #75559d;
    padding: 2px 10px;
    border-radius: 4px;
  }
  .level-item-wrap {
    margin-right: 12px;
    margin-top: 12px;
    @include mobile {
      margin-right: 8px;
    }
    .level-item-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      h3 {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 13px;
        color: #701818;
      }
      img {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        border: 1px solid #060ee8;
        margin-bottom: 2px;
        background-color: #666;
        @include mobile {
          width: 34px;
          height: 34px;
        }
      }
      p {
        font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
        font-size: 13px;
        white-space: nowrap; /* 防止文本换行 */
        overflow: hidden; /* 隐藏溢出的内容 */
        text-overflow: ellipsis; /* 显示省略符号来代表被修剪的文本 */
        max-width: 120px;
      }
    }
    .level-item-btn {
      cursor: pointer;
      margin-top: 5px;
      font-size: 12px;
      height: 22px;
      line-height: 22px;
      text-align: center;
      border-radius: 11px;
      background: linear-gradient(to right, rgb(143, 5, 202), rgb(11, 11, 96));
    }
  }
  .level-item-right {
    margin-left: 12px;
    margin-right: 0;
    @include mobile {
      margin-left: 8px;
    }
    img {
      border: 1px solid #7414f2;
    }
  }
  .label-item-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    @include mobile {
      position: absolute;
      z-index: 3;
    }
    .label {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      color: #eee;
      font-size: 13px;
      margin-bottom: 2px;
    }
    .vs {
      font-family: "titleFont", "Microsoft YaHei", 'sans-serif';
      color: #f29614;
      font-size: 20px;
      transform: translateY(-6px);
    }
  }
}
</style>