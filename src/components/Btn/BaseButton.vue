<script setup>
const name = defineModel("name", { default: '按钮' })
const isGoldColor = defineModel("isGoldColor", { default: false })
const isGray = defineModel("isGray", { default: false })
const fontSize = defineModel("fontSize", { default: '16px' })
const props = defineProps({
  customStyle: {
    type: Object,
    default: () => ({})
  }
})
</script>

<template>
  <div :class="['base_button', { 'gold': isGoldColor, 'gray': isGray }]" 
       :style="[{ '--font-size': fontSize }, customStyle]">
    <div class="base_button-name">
      <slot name="name">{{ name }}</slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.base_button {
  width: 100%;
  background: linear-gradient(93.1deg, #FF553C 7.24%, #A70202 98.65%);
  height: 52px;
  border-radius: 44px;
  padding: 14px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: .3s;
  filter: drop-shadow(0px 0px 2px #FF553C);

  &:hover {
    filter: drop-shadow(0px 0px 4px #FF553C);
  }

  &.gold {
    background: linear-gradient(93.1deg, #FFC43C 7.24%, #E36C0A 98.65%);
    filter: drop-shadow(0px 0px 2px #FFC43C);

    &:hover {
      filter: drop-shadow(0px 0px 4px #FFC43C);
    }

  }

  &.gray {
    background: #66554F;
    cursor: not-allowed;
    filter: none;
      filter: none;
    }

  

  &-name {
    white-space: nowrap;
    font-size: var(--font-size);

    div,
    span {
      white-space: nowrap;
    }
  }
}
</style>
