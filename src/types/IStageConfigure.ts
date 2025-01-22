export default interface IStageConfigure {
  // 获取旋转图标是否启用
  get rotationIconEnable(): boolean;
  // 配置
  config(configs: StageConfigs): void;
}

export type StageConfigs = {
  // 旋转图标是否启用
  rotationIconEnable?: boolean
}

// 舞台配置
export const StageConfigValues: StageConfigs = {
  // 默认启用旋转
  rotationIconEnable: true
}