<script lang="ts" setup>
import { Creator } from "@/types";
import { Creators } from "@/types/constants";
import { ref, watch } from "vue";

const props = defineProps({
  currentCreator: { type: Object, required: true },
});
const type = ref((props.currentCreator as Creator).type);
const emits = defineEmits(["select"]);

watch(
  () => props.currentCreator,
  (val) => {
    type.value = (val as Creator).type;
  }
);

const select = (item) => {
  emits("select", item);
};
</script>
<template>
  <div class="create-bar">
    <div
      v-for="item in Creators"
      :class="[
        'tool-item',
        {
          selected: type === item.type,
        },
      ]"
      :v-index="item.type"
      :key="item.type"
      @click="select(item)"
    >
      <el-icon :class="['iconfont', item.icon]"></el-icon>
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
