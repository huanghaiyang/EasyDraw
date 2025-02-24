<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { Creator, CreatorTypes } from "@/types/Creator";
import { debounce } from "lodash";
import { PropType, ref } from "vue";

const { creators, currentCreator, select } = defineProps({
  creators: Array as PropType<Creator[]>,
  currentCreator: Object as PropType<Creator>,
  select: Function as PropType<(creator: Creator) => void>,
});

const stageStore = useStageStore();

const fileList = ref([]);

const uploadImages = debounce(async () => {
  stageStore.uploadImages(fileList.value);
  fileList.value = [];
}, 500);

const onBeforeUpload = (file: File) => {
  fileList.value.push(file);
  uploadImages();
  return false;
};
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
          <el-upload v-if="creator.type === CreatorTypes.image" action="" multiple accept="image/*" :before-upload="onBeforeUpload">
            <creator-drop-down-item :creator="creator" />
          </el-upload>
          <creator-drop-down-item :creator="creator" v-else />
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
