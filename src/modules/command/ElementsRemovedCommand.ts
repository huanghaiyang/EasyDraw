import IElement, { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { IRemovedCommandElementObject } from "@/types/ICommand";
import { cloneDeep } from "lodash";

export default class ElementsRemovedCommand extends ElementsBaseCommand {
  undo(): void {
    this.store.deSelectAll();
    this.payload.dataList.forEach(data => {
      const { prevId, model } = data as IRemovedCommandElementObject;
      let prevElement: IElement | undefined;
      if (prevId) {
        prevElement = this.store.getElementById(prevId);
      }
      this.store.addElementByModel(cloneDeep(model) as ElementObject, prevElement, !prevId);
    });
  }

  redo(): void {
    this.store.deSelectAll();
    this.payload.dataList.forEach(data => {
      const {
        model: { id },
      } = data;
      this.store.removeElement(id);
    });
  }
}
