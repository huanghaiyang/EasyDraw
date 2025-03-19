import { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import LodashUtils from "@/utils/LodashUtils";
import { IElementCommandPayload } from "@/types/ICommand";

export default class ElementsAddedCommand extends ElementsBaseCommand<IElementCommandPayload> {
  undo(): void {
    this.payload.dataList.forEach(data => {
      const {
        model: { id },
      } = data;
      this.store.removeElement(id);
    });
  }

  redo(): void {
    this.payload.dataList.forEach(data => {
      this.store.afterAddElementByModel(LodashUtils.jsonClone(data.model) as ElementObject);
    });
  }
}
