import { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import LodashUtils from "@/utils/LodashUtils";
import { IElementCommandPayload } from "@/types/ICommand";

export default class ElementsAddedCommand extends ElementsBaseCommand<IElementCommandPayload> {
  async undo(): Promise<void> {
    this.payload.uDataList.forEach(data => {
      const {
        model: { id },
      } = data;
      this.store.removeElementById(id);
    });
  }

  async redo(): Promise<void> {
    this.payload.uDataList.forEach(data => {
      this.store.afterAddElementByModel(LodashUtils.jsonClone(data.model) as ElementObject);
    });
  }
}
