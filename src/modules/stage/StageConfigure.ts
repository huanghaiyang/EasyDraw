import IStageConfigure, { StageConfigs, StageConfigValues } from '@/types/IStageConfigure';
import { configure } from 'mobx'

export default class StageConfigure implements IStageConfigure {

  private _configs: StageConfigs = StageConfigValues;

  get rotationIconEnable(): boolean {
    return this._configs.rotationIconEnable;
  }

  constructor() {
    this.config(StageConfigValues);
    configure({
      enforceActions: 'never',
    })
  }

  config(configs: StageConfigs): void {
    Object.assign(this._configs, configs);
  }
}