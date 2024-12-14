<script lang="ts" setup>
import { creatorTypes } from "@/types/constants";
import { ref } from "vue";

const emits = defineEmits(["select"]);
const current = ref(-1);
const select = (evt) => {
  const target = evt.target;
  const toolItem = target.closest(".tool-item");
  if (toolItem) {
    current.value = parseInt(toolItem.getAttribute("v-index"));
    emits("select", current.value);
  }
};
</script>
<template>
  <div class="create-bar" @click="select">
    <div
      :class="[
        'create-bar__moveable tool-item',
        {
          selected: current === creatorTypes.moveable,
        },
      ]"
      :v-index="creatorTypes.moveable"
    >
      <el-icon
        class="icon-verbise-arrow-cursor-2--mouse-select-cursor iconfont"
      ></el-icon>
    </div>
    <div
      :class="[
        'create-bar__shapes tool-item',
        {
          selected: current === creatorTypes.shapes,
        },
      ]"
      :v-index="creatorTypes.shapes"
    >
      <el-icon class="icon-verbise-Rectangle iconfont"></el-icon>
    </div>
  </div>
</template>
<style lang="less" scoped>
.create-bar {
  display: flex;
  align-items: center;
  height: 40px;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  width: 200px;
  position: absolute;
  bottom: 10px;
  left: calc(50% - 100px);
  .tool-item {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
    margin: 0 0 0 5px;
    &:first-of-type {
      margin: 0;
    }
    &:hover,
    &.selected {
      background-color: #007be5;
      .iconfont {
        color: #fff;
        fill: #fff;
      }
    }
  }
  padding: 0 5px;
}
</style>
