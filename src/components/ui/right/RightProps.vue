<script lang="ts" setup>
</script>
<template>
  <div class="props-right-panel">
    <scale-setting></scale-setting>
    <align-props></align-props>
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
  .align-props,
  .size-props,
  .angle-props,
  .stroke-props,
  .fill-props {
    &__title {
      font-size: 12px;
      font-weight: 500;
      color: #000000;
      padding: 10px;
      display: flex;
      align-items: center;
      &-text {
        display: flex;
        align-items: center;
        vertical-align: middle;
        line-height: 12px;
        margin: 0 4px 0 0;
      }
      .el-icon {
        &:hover {
          color: #007be5;
          cursor: pointer;
        }
      }
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
