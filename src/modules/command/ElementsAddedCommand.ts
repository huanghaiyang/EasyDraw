import { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";

export default class ElementsAddedCommand extends ElementsBaseCommand {
  undo(): void {
    this.payload.dataList.forEach(data => {
      const { id } = data;
      this.store.removeElement(id);
    });
  }

  redo(): void {
    this.payload.dataList.forEach(data => {
      this.store.addElementByModel(data as ElementObject);
    });
  }
}
