import { ICommandElementObject, IRearrangeCommandElementObject } from "@/types/ICommand";
import IStageStore from "@/types/IStageStore";
import LodashUtils from "@/utils/LodashUtils";

export default class CommandHelper {
  /**
   * 组件数据恢复
   *
   * @param uDataList
   * @param store
   */
  static async restoreElementsFromData(uDataList: Array<ICommandElementObject>, store: IStageStore): Promise<void> {
    uDataList.forEach(data => {
      const { model } = data;
      const element = store.updateElementModel(model.id, LodashUtils.jsonClone(model));
      if (element) {
        element.refreshFlipX();
        element.refresh();
      }
    });
  }

  /**
   * 重新调整组件位置
   *
   * @param uDataList
   * @param store
   */
  static async rearrange(uDataList: Array<ICommandElementObject>, store: IStageStore): Promise<void> {
    uDataList.forEach(data => {
      const {
        model: { id },
        prevId,
      } = data as IRearrangeCommandElementObject;
      const element = store.getElementById(id);
      if (element) {
        store.rearrangeElementAfter(element, prevId ? store.getElementById(prevId) : null, true);
      }
    });
    store.resortElementsArray();
    store.emitElementsLayerChanged();
  }
}
