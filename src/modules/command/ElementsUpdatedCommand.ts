import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { ICommandElementObject } from "@/types/ICommand";
import LodashUtils from "@/utils/LodashUtils";
export default class ElementsUpdatedCommand extends ElementsBaseCommand {
  /**
   * 恢复数据
   *
   * @param dataList
   */
  private _restoreElementsFromData(dataList: Array<ICommandElementObject>) {
    dataList.forEach(data => {
      const { model } = data;
      const element = this.store.updateElementModel(model.id, LodashUtils.jsonClone(model));
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
