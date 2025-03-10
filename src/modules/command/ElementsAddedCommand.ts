import { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import { cloneDeep } from "lodash";

export default class ElementsAddedCommand extends ElementsBaseCommand {
  undo(): void {
    this.store.deSelectAll();
    this.payload.dataList.forEach(data => {
      const {
        model: { id },
      } = data;
      this.store.removeElement(id);
    });
  }

  redo(): void {
    this.store.deSelectAll();
    this.payload.dataList.forEach(data => {
      this.store.addElementByModel(cloneDeep(data.model) as ElementObject);
    });
  }
}
