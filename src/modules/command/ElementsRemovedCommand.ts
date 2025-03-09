import { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";

export default class ElementsRemovedCommand extends ElementsBaseCommand {
  undo(): void {
    this.store.deSelectAll();
    this.payload.dataList.forEach(data => {
      this.store.addElementByModel(data.model as ElementObject);
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
