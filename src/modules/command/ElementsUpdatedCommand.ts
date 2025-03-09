import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { ElementObject } from "@/types/IElement";

export default class ElementsUpdatedCommand extends ElementsBaseCommand {
  /**
   * 恢复数据
   *
   * @param dataList
   */
  private _restoreElementsFromData(dataList: Array<Partial<ElementObject>>) {
    dataList.forEach(data => {
      const { id } = data;
      const element = this.store.updateElementModel(id, data);
      element && element.refresh();
    });
  }

  undo(): void {
    if (!this.payload.dataList) {
      return;
    }
    this._restoreElementsFromData(this.payload.dataList);
  }

  redo(): void {
    if (!this.payload.rDataList) {
      return;
    }
    this._restoreElementsFromData(this.payload.rDataList);
  }
}
