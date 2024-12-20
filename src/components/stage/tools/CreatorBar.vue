<script lang="ts" setup>
import { Creator, CreatorTypes } from "@/types";
import { getCreatorByType } from "@/types/helper";
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

const select = (evt) => {
  const target = evt.target;
  const toolItem = target.closest(".tool-item");
  if (toolItem) {
    emits(
      "select",
      getCreatorByType(parseInt(toolItem.getAttribute("v-index")))
    );
  }
};
</script>
<template>
  <div class="create-bar" @click="select">
    <div
      :class="[
        'create-bar__moveable tool-item',
        {
          selected: type === CreatorTypes.moveable,
        },
      ]"
      :v-index="CreatorTypes.moveable"
    >
      <el-icon
        class="icon-verbise-arrow-cursor-2--mouse-select-cursor iconfont"
      ></el-icon>
    </div>
    <div
      :class="[
        'create-bar__rectangle tool-item',
        {
          selected: type === CreatorTypes.rectangle,
        },
      ]"
      :v-index="CreatorTypes.rectangle"
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
