import IElement, { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { IElementCommandPayload, IRemovedCommandElementObject } from "@/types/ICommand";
import LodashUtils from "@/utils/LodashUtils";

export default class ElementsRemovedCommand extends ElementsBaseCommand<IElementCommandPayload> {
  undo(): void {
    this.payload.dataList.forEach(data => {
      const { prevId, model } = data as IRemovedCommandElementObject;
      let prevElement: IElement | undefined;
      if (prevId) {
        prevElement = this.store.getElementById(prevId);
      }
      this.store.afterAddElementByModel(LodashUtils.jsonClone(model) as ElementObject, prevElement, !prevId);
    });
  }

  redo(): void {
    this.payload.dataList.forEach(data => {
      const {
        model: { id },
      } = data;
      this.store.removeElement(id);
    });
  }
}
