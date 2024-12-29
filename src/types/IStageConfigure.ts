export default interface IStageConfigure {
  get rotationIconEnable(): boolean;
  config(configs: StageConfigs): void;
}

export type StageConfigs = {
  rotationIconEnable?: boolean
}

export const StageConfigValues: StageConfigs = {
  rotationIconEnable: true
}