<script setup>
import {requireImg} from "@/utils/common";

const name =defineModel("name",{default:"标题"})
</script>

<template>
    <div class="main-title">
      <div class="main-title-line"></div>
      <div class="main-title-name">
        <img :src="requireImg('/v2/nav/cloud.png',false)" alt="">
        <div> {{name}}</div>
      </div>
      <div class="main-title-line"></div>
    </div>
</template>

<style scoped lang="scss">
@use "@/style" as *;
.main-title{
  width: 80%;
  margin: 30px auto;
  font-size: 48px;
  display: flex;
  align-items: center;
  @include mobile{
    font-size: 20px;
  }
  &-line{
    height: 1px;
    flex:1;
    background-image: linear-gradient(90deg, rgba(254, 215, 148, 0) 0%, #988159 100%);
    margin: 0 29px 0 0;
    &:last-child{
      transform: rotateY(180deg);
      margin: 0 0 0 29px;
    }
  }
  &-name{
    position: relative;
    img{
      position:absolute;
      left: 50%;
      top: 20%;
      transform: translate(-50%,-50%);
      width: 80%;
    }
    div{
      font-family: "FZZJ-JHTJW","titleFont", "Microsoft YaHei", 'sans-serif';
      background: linear-gradient(90deg, #FFE7E6 0%, #FFD792 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;

    }
  }
}

</style>
