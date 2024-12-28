import { configure } from 'mobx'

export default class StageConfigure {
  config() {
    configure({
      enforceActions: 'never',
    })
  }
}