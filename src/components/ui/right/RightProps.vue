<script lang="ts" setup></script>
<template>
  <div class="props-right-panel">
    <scale-setting></scale-setting>
    <align-props></align-props>
    <position-props></position-props>
    <size-props></size-props>
    <angle-props></angle-props>
    <corner-props></corner-props>
    <font-family-props></font-family-props>
    <font-size-props></font-size-props>
    <font-color-props></font-color-props>
    <font-line-height-props></font-line-height-props>
    <font-letter-spacing-props></font-letter-spacing-props>
    <font-paragraph-spacing-props></font-paragraph-spacing-props>
    <font-align-props></font-align-props>
    <font-text-decoration-props></font-text-decoration-props>
    <fill-props></fill-props>
    <stroke-props></stroke-props>
    <layer-props></layer-props>
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
  .corners-props,
  .font-props,
  .fill-props,
  .layer-props {
    &__title {
      font-size: 14px;
      font-weight: 500;
      color: #000000;
      padding: 4px;
      display: flex;
      align-items: center;

      &-text {
        display: flex;
        align-items: center;
        vertical-align: middle;
        line-height: 14px;
        margin: 0 4px 4px 4px;
        &.text-2 {
          font-size: 12px;
          line-height: 12px;
          font-weight: normal;
          transform: scale(0.9);
          color: rgba(0, 0, 0, 0.8);
        }
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
      justify-content: flex-start;
      align-items: center;
      padding: 0 4px;

      &:not(:first-child) {
        margin: 0 0 8px 0;
      }

      .el-tag {
        height: 24px;
        width: 70px;
      }

      &-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 96px;
        margin-right: 8px;

        &.large {
          width: 102px;
        }

        .el-select,
        .el-input {
          width: 100%;

          .el-input-group__prepend,
          .el-input-group__append {
            padding: 0 4px;
          }

          &--small {
            .el-input__wrapper {
              padding: 1px 2px;
            }
          }
        }
        &.full {
          width: 100%;
        }
        &.flex {
          width: auto;
        }
      }
    }
  }
}
</style>
