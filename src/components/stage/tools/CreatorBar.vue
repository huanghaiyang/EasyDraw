<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { FreedomCreators, CursorCreators, ShapeCreators } from "@/types/CreatorDicts";
import { computed } from "vue";

const emits = defineEmits(["select"]);
const stageStore = useStageStore();
const currentCreator = computed(() => stageStore.currentCreator);
const currentCursorCreator = computed(() => stageStore.currentCursorCreator);
const currentShapeCreator = computed(() => stageStore.currentShapeCreator);
const currentArbitraryCreator = computed(() => stageStore.currentArbitraryCreator);
const currentTextCreator = computed(() => stageStore.currentTextCreator);

const select = item => {
  emits("select", item);
};
</script>
<template>
  <div class="create-bar">
    <div :class="['tool-item', { selected: currentCursorCreator.category === currentCreator.category }]" @click="select(currentCursorCreator)">
      <el-icon :class="['iconfont', currentCursorCreator.icon]"></el-icon>
    </div>

    <creator-dropdown :creators="CursorCreators" :current-creator="currentCreator" :select="select" />

    <div :class="['tool-item', { selected: currentShapeCreator.category === currentCreator.category }]" @click="select(currentShapeCreator)">
      <el-icon :class="['iconfont', currentShapeCreator.icon]"></el-icon>
    </div>

    <creator-dropdown :creators="ShapeCreators" :current-creator="currentCreator" :select="select" />

    <div
      :class="[
        'tool-item',
        {
          selected: currentArbitraryCreator.category === currentCreator.category,
        },
      ]"
      @click="select(currentArbitraryCreator)"
    >
      <el-icon :class="['iconfont', currentArbitraryCreator.icon]"></el-icon>
    </div>

    <creator-dropdown :creators="FreedomCreators" :current-creator="currentCreator" :select="select" />

    <div :class="['tool-item', { selected: currentTextCreator.category === currentCreator.category }]" @click="select(currentTextCreator)">
      <el-icon :class="['iconfont', currentTextCreator.icon]"></el-icon>
    </div>
  </div>
</template>
<style lang="less">
.create-bar,
.arbitrary-bar {
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
  padding: 0 5px;

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

      .iconfont,
      .el-icon {
        color: #fff;
        fill: #fff;
      }
    }
  }
}
</style>
<style lang="less">
.menu-active {
  background-color: #409eff;
  color: #fff;
}

.el-dropdown-menu__item {
  .creator-menu {
    &__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 120px;
      padding: 5px 10px;
      border-radius: 4px;
      transition: all 0.2s;

      .shortcut {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        margin-left: 5px;
        min-width: 20px;
      }

      &:hover {
        .menu-active();
      }
    }
  }

  &.selected {
    .creator-menu {
      &__item {
        .menu-active();
      }
    }
  }
}
</style>
