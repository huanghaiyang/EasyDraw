import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { ICommandElementObject, IElementCommandPayload } from "@/types/ICommand";
import LodashUtils from "@/utils/LodashUtils";
export default class ElementsUpdatedCommand extends ElementsBaseCommand<IElementCommandPayload> {
  /**
   * 恢复数据
   *
   * @param dataList
   */
  private async _restoreElementsFromData(dataList: Array<ICommandElementObject>): Promise<void> {
    dataList.forEach(data => {
      const { model } = data;
      const element = this.store.updateElementModel(model.id, LodashUtils.jsonClone(model));
      if (element) {
        element.refreshFlipX();
        element.refresh();
      }
    });
  }

  async undo(): Promise<void> {
    if (!this.payload.dataList) {
      return;
    }
    await this._restoreElementsFromData(this.payload.dataList);
  }
  
  async redo(): Promise<void> {
    if (!this.payload.rDataList) {
      return;
    }
    await this._restoreElementsFromData(this.payload.rDataList);
  }
}
