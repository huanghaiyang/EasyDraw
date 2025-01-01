<script lang="ts">
import PositionProps from "@/modules/components/props/PositionProps.vue";
import SizeProps from "@/modules/components/props/SizeProps.vue";
import AngleProps from "@/modules/components/props/AngleProps.vue";
import FillProps from "@/modules/components/props/FillProps.vue";
import StrokeProps from "@/modules/components/props/StrokeProps.vue";
</script>
<template>
  <div class="props-right-panel">
    <position-props></position-props>
    <size-props></size-props>
    <angle-props></angle-props>
    <fill-props></fill-props>
    <stroke-props></stroke-props>
  </div>
</template>
<style lang="less" scoped>
.props-right-panel {
  width: 100%;
  height: 100%;
}
</style>
<style lang="less">
.right-props {
  width: 100%;
  .position-props,
  .size-props,
  .angle-props,
  .stroke-props,
  .fill-props {
    &__title {
      font-size: 14px;
      font-weight: 500;
      color: #000000;
      padding: 10px;
    }

    &__row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;

      .el-tag {
        height: 24px;
        width: 70px;
      }

      &-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 96px;
        .el-select,
        .el-input {
          width: 100%;
          .el-input-group__prepend,
          .el-input-group__append {
            padding: 0 6px;
          }
        }
      }
    }
  }
}
</style>
