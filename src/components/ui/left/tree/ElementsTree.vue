<template>
  <el-tree
    style="max-width: 600px"
    :allow-drop="allowDrop"
    :data="stageStore.treeNodes"
    draggable
    default-expand-all
    node-key="id"
    ref="treeRef"
    auto-expand-parent
    :expand-on-click-node="false"
    @node-click="handleClickNode"
    @node-drag-start="handleDragStart"
    @node-drop="handleDrop"
  >
    <template #default="{ data: { id, label, isSelected, isDetachedSelected, isTarget, isGroup, type } }">
      <span
        @mouseenter="handleMouseEnter(id)"
        @mouseleave="handleMouseLeave(id)"
        :class="[
          'tree-node',
          {
            selected: isSelected,
            detached: isDetachedSelected,
            target: isTarget,
            group: isGroup,
          },
        ]"
      >
        <el-icon :class="['iconfont', CreatorIcons[type]]"></el-icon>
        <div class="node-content">
          <span>{{ label }}</span>
          <el-tooltip effect="dark" content="节点详情" placement="right">
            <el-icon>
              <Paperclip />
            </el-icon>
            <template #content>
              <div>
                <p>节点ID: {{ id }}</p>
                <p>节点类型: {{ CreatorHelper.getCreatorByType(type)?.name || type }}</p>
              </div>
            </template>
          </el-tooltip>
        </div>
      </span>
    </template>
  </el-tree>
</template>

<script lang="ts" setup>
import { useStageStore } from "@/stores/stage";
import { CreatorIcons } from "@/types/CreatorDicts";
import { ElementTreeNode, TreeNodeDropType } from "@/types/IElement";
import { TreeInstance } from "element-plus";
import type Node from "element-plus/es/components/tree/src/model/node";
import type { DragEvents } from "element-plus/es/components/tree/src/model/useDragNode";
import type { AllowDropType, NodeDropType } from "element-plus/es/components/tree/src/tree.type";
import { Paperclip } from "@element-plus/icons-vue";
import { ref } from "vue";
import CreatorHelper from "@/types/CreatorHelper";
import { CreatorTypes } from "@/types/Creator";

const stageStore = useStageStore();
const treeRef = ref<TreeInstance>();

/**
 * 鼠标进入节点
 *
 * @param id
 */
function handleMouseEnter(id: string) {
  stageStore.toggleElementsTarget([id], true);
}

/**
 * 鼠标离开节点
 *
 * @param id
 */
function handleMouseLeave(id: string) {
  stageStore.toggleElementsTarget([id], false);
}

/**
 * 点击节点
 *
 * @param node
 */
function handleClickNode(node: ElementTreeNode) {
  stageStore.toggleElementsDetachedSelected([node.id]);
}

/**
 * 开始拖拽
 *
 * @param node
 * @param ev
 */
const handleDragStart = (node: Node, ev: DragEvents) => {
  stageStore.setElementsDetachedSelected([node.data.id], true);
};

/**
 * 拖拽到指定节点
 *
 * @param draggingNode
 * @param dropNode
 * @param dropType
 * @param ev
 */
const handleDrop = (draggingNode: Node, dropNode: Node, dropType: NodeDropType, ev: DragEvents) => {
  stageStore.moveElementsTo([draggingNode.data.id], dropNode.data.id, TreeNodeDropType[dropType]);
};

/**
 * 判断是否允许拖拽到指定节点
 *
 * @param draggingNode 
 * @param dropNode 
 * @param type 
 */
const allowDrop = (draggingNode: Node, dropNode: Node, type: AllowDropType) => {
  let result: boolean = true;
  const { type: dropNodeType } = dropNode.data;
  switch(type) {
    case "inner": {
      if (dropNodeType !== CreatorTypes.group) {
        result = false;
        console.log("inner dropNode is not group, the dropNode's type is ", dropNodeType);
      }
      break;
    }
  }
  return result;
};
</script>

<style lang="less" scoped>
.el-tree-node {
  margin: 10px 0;
}
.tree-node {
  width: 100%;
  height: 24px;
  display: flex;
  align-items: center;
  padding: 0 4px;
  border-radius: 6px 0 0 6px;
  .iconfont {
    margin: 0 2px;
  }
  &.selected {
    background-color: rgba(66, 161, 255, 0.1);
  }
  &.target {
    background-color: rgba(66, 161, 255, 0.15);
  }
  &.group {
    &.selected {
      background-color: rgba(66, 161, 255, 0.15);
    }
    &.target {
      background-color: rgba(66, 161, 255, 0.2);
    }
  }
  .node-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
}
</style>
