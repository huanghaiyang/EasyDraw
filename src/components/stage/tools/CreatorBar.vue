<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { CursorCreators } from "@/types/CreatorDicts";
import { computed } from "vue";

const emits = defineEmits(["select"]);
const stageStore = useStageStore();
const currentCreator = computed(() => stageStore.currentCreator);
const currentCursorCreator = computed(() => stageStore.currentCursorCreator);
const currentShapeCreator = computed(() => stageStore.currentShapeCreator);

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

    <el-dropdown>
      <div class="tool-dropdown">
        <el-icon class="icon-verbise-arrow_down iconfont"></el-icon>
      </div>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="creator in CursorCreators"
            :key="creator.type"
            :class="[
              {
                selected: creator.type === currentCreator.type,
              },
            ]"
            @click="select(creator)"
          >
            <div class="creator-menu__item">
              <div class="create-menu__item-text">{{ creator.name }}</div>
              <div class="create-menu__item-icon">
                <el-icon :class="['iconfont', creator.icon]"></el-icon>
              </div>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

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
  .tool-dropdown {
    width: 10px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
    margin: 0 0 0 2px;
    &:focus-visible {
      outline: none;
    }
    .iconfont {
      font-size: 8px;
    }
  }
  padding: 0 5px;
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
