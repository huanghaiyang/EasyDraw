import IElement, { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { IElementCommandPayload, IDetachedRemovedCommandElementObject, DetachedRemovedType } from "@/types/ICommand";
import LodashUtils from "@/utils/LodashUtils";
import CommandHelper from "@/modules/command/helpers/CommandHelper";

export default class DetachedElementsRemovedCommand extends ElementsBaseCommand<IElementCommandPayload> {
  async undo(): Promise<void> {
    this.payload.uDataList.forEach(data => {
      const { prevId, model, type } = data as IDetachedRemovedCommandElementObject;
      switch (type) {
        case DetachedRemovedType.GroupUpdated: {
          CommandHelper.restoreElementsFromData([data], this.store);
          break;
        }
        case DetachedRemovedType.Removed: {
          let prevElement: IElement | undefined;
          if (prevId) {
            prevElement = this.store.getElementById(prevId);
          }
          this.store.insertAfterElementByModel(LodashUtils.jsonClone(model) as ElementObject, prevElement, !prevId);
        }
      }
    });
  }

  async redo(): Promise<void> {
    this.payload.uDataList.forEach(data => {
      const {
        model: { id },
        type,
      } = data as IDetachedRemovedCommandElementObject;
      switch (type) {
        case DetachedRemovedType.Removed: {
          this.store.removeElementById(id);
          break;
        }
      }
    });
    this.payload.rDataList.forEach(data => {
      const { type } = data as IDetachedRemovedCommandElementObject;
      switch (type) {
        case DetachedRemovedType.GroupUpdated: {
          CommandHelper.restoreElementsFromData([data], this.store);
          break;
        }
      }
    });
  }
}
