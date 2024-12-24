<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { computed } from "vue";

const emits = defineEmits(["select"]);
const store = useStageStore();
const currentCreator = computed(() => store.currentCreator);
const currentCursorCreator = computed(() => store.currentCursorCreator);
const currentShapeCreator = computed(() => store.currentShapeCreator);

const select = (item) => {
  emits("select", item);
};
</script>
<template>
  <div class="create-bar">
    <div
      :class="[
        'tool-item',
        { selected: currentCursorCreator.category === currentCreator.category },
      ]"
      @click="select(currentCursorCreator)"
    >
      <el-icon :class="['iconfont', currentCursorCreator.icon]"></el-icon>
    </div>

    <div
      :class="[
        'tool-item',
        { selected: currentShapeCreator.category === currentCreator.category },
      ]"
      @click="select(currentShapeCreator)"
    >
      <el-icon :class="['iconfont', currentShapeCreator.icon]"></el-icon>
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
