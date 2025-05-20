import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { ElementsCommandTypes, ICommandElementObject, IElementsCommandPayload } from "@/types/ICommand";
import CommandHelper from "@/modules/command/helpers/CommandHelper";

export default class ElementsChangedCommand extends ElementsBaseCommand<IElementsCommandPayload> {

  /**
   * 执行还原操作
   * 
   * @param payload 
   * @param isRedo 
   * @returns 
   */
  private async _restore(payload: IElementsCommandPayload, isRedo: boolean): Promise<void> {
    const { type, uDataList, rDataList, prevSelectedIds, selectedIds } = payload;
    switch (type) {
      case ElementsCommandTypes.ElementsSelected: {
        const ids: string[] = isRedo? selectedIds : prevSelectedIds;
        this.store.setElementsDetachedSelectedByIds(ids, true);
        break;
      }
      default: {
        const dataList: Array<ICommandElementObject> = isRedo ? rDataList : uDataList;
        if (!dataList) return;
        CommandHelper.restoreDataList(dataList, isRedo, this.store);
        this.store.retrieveElements();
        this.store.emitElementsLayerChanged();
        break;
      }
    }  
  }

  /**
   * 撤销
   */
  async undo(): Promise<void> {
    await this._restore(this.payload, false);
  }

  /**
   * 重做
   */
  async redo(): Promise<void> {
    await this._restore(this.payload, true);
  }
}
