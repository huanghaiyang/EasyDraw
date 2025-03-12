import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { ICommandElementObject, IRearrangeCommandElementObject } from "@/types/ICommand";

export default class ElementsRearrangeCommand extends ElementsBaseCommand {
  /**
   * 重新调整组件位置
   *
   * @param dataList
   */
  private _rearrange(dataList: Array<ICommandElementObject>): void {
    dataList.forEach(data => {
      const {
        model: { id },
        prevId,
      } = data as IRearrangeCommandElementObject;
      const element = this.store.getElementById(id);
      if (element) {
        this.store.rearrangeElementAfter(element, prevId ? this.store.getElementById(prevId) : null, true);
      }
    });
    this.store.resortElementsArray();
    this.store.emitElementsLayerChanged();
  }
  undo(): void {
    if (!this.payload.dataList) {
      return;
    }
    this._rearrange(this.payload.dataList);
  }

  redo(): void {
    if (!this.payload.rDataList) {
      return;
    }
    this._rearrange(this.payload.rDataList);
  }
}
