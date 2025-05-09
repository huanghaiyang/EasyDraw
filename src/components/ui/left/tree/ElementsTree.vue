<template>
  <el-tree
    style="max-width: 600px"
    :allow-drop="allowDrop"
    :allow-drag="allowDrag"
    :data="stageStore.treeNodes"
    draggable
    default-expand-all
    node-key="id"
    ref="treeRef"
    auto-expand-parent
    :expand-on-click-node="false"
    @node-click="handleClickNode"
    @node-drag-start="handleDragStart"
    @node-drag-enter="handleDragEnter"
    @node-drag-leave="handleDragLeave"
    @node-drag-over="handleDragOver"
    @node-drag-end="handleDragEnd"
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

const handleDragStart = (node: Node, ev: DragEvents) => {
  stageStore.setElementsDetachedSelected([node.data.id], true);
  console.log("drag start", node);
};
const handleDragEnter = (draggingNode: Node, dropNode: Node, ev: DragEvents) => {
  console.log("tree drag enter:", dropNode.label);
};
const handleDragLeave = (draggingNode: Node, dropNode: Node, ev: DragEvents) => {
  console.log("tree drag leave:", dropNode.label);
};
const handleDragOver = (draggingNode: Node, dropNode: Node, ev: DragEvents) => {
  console.log("tree drag over:", dropNode.label);
};
const handleDragEnd = (draggingNode: Node, dropNode: Node, dropType: NodeDropType, ev: DragEvents) => {
  console.log("tree drag end:", dropNode && dropNode.label, dropType);
};
const handleDrop = (draggingNode: Node, dropNode: Node, dropType: NodeDropType, ev: DragEvents) => {
  stageStore.moveElementsTo([draggingNode.data.id], dropNode.data.id, TreeNodeDropType[dropType]);
  console.log("tree drop:", dropNode.label, dropType);
};
const allowDrop = (draggingNode: Node, dropNode: Node, type: AllowDropType) => {
  if (dropNode.data.label === "Level two 3-1") {
    return type !== "inner";
  } else {
    return true;
  }
};
const allowDrag = (draggingNode: Node) => {
  return !draggingNode.data.label.includes("Level three 3-1-1");
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
