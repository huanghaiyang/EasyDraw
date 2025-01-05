<script lang="ts" setup>
import { Creator } from "@/types/Creator";
import { PropType } from "vue";

const { creators, currentCreator, select } = defineProps({
  creators: Array as PropType<Creator[]>,
  currentCreator: Object as PropType<Creator>,
  select: Function as PropType<(creator: Creator) => void>,
});
</script>
<template>
  <el-dropdown>
    <div class="tool-dropdown">
      <el-icon class="icon-verbise-arrow_down iconfont"></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="creator in creators"
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
</template>
<style lang="less" scoped>
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
</style>
