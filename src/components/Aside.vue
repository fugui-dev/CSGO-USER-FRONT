<script setup>
import {ref} from "vue";
import {requireImg} from "@/utils/common";
import RedEnvelopeDialog from "@/components/dialogs/RedEnvelopeDialog.vue";
import CDKDialog from "@/components/dialogs/CDKDialog.vue";
import {useStore} from "@/store";
import Kefu from "@/components/dialogs/Kefu.vue";

const cdkDialogRef = ref()
const redEnvelopeDialogRef = ref()
const kefuRef=ref()
const store=useStore()
const open = ref(true)
const navs = ref([{
  name: '红包',
  img: requireImg("user/n7.png"),
  func: () => {
    redEnvelopeDialogRef.value.open()
  }
},
  {
    name: 'CDKey',
    img: requireImg("user/n8.png"),
    func: () => {
      cdkDialogRef.value.open()
    }
  },{
    name: '客服',
    img: requireImg("user/n5.png"),
    func: () => {
      kefuRef.value.open()
    }
  },])

</script>

<template>
  <aside class="aside" :style="{right: open ? '0' : '-60px'}" v-if="store.isPC">
    <div class="item" v-for="(i,index) in navs" :key="index" @click="i.func">
      <img :src="i.img" alt=""/>
      <div>{{ i.name }}</div>
    </div>
    <div class="switch" @click="open=!open">
      {{ !open ? '◀' : '▶' }}
    </div>
  </aside>
  <CDKDialog ref="cdkDialogRef"/>
  <RedEnvelopeDialog ref="redEnvelopeDialogRef"/>
  <Kefu ref="kefuRef"></Kefu>
</template>

<style scoped lang="scss">
.aside {
  position: fixed;
  right: 0;
  bottom: 30%;
  z-index: 5;
  width: 60px;
  background-color: rgb(41, 40, 42);
  border-bottom-left-radius: 30px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgb(22, 159, 255);
  border-right:none;
  border-top: none;
  transition: .3s;
  .item {
    height: 80px;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-top: 1px solid rgb(22, 159, 255);
    cursor: pointer;


    img {
      width: 50%;
    }
  }

  .switch {
    position: absolute;
    left: -21px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 60px;
    background-color: rgb(41, 40, 42);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgb(22, 159, 255);
    border-right: none;
    cursor: pointer;
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }

}
</style>
