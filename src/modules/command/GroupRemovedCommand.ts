import { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import LodashUtils from "@/utils/LodashUtils";
import { IGroupCommandElementObject, IElementCommandPayload } from "@/types/ICommand";

export default class GroupRemovedCommand extends ElementsBaseCommand<IElementCommandPayload> {
  async undo(): Promise<void> {
    this.payload.uDataList.forEach(data => {
      const {
        model: { id, groupId },
        isGroup,
        prevId,
      } = data as IGroupCommandElementObject;
      if (isGroup) {
        this.store.insertAfterElementByModel(LodashUtils.jsonClone(data.model) as ElementObject, prevId ? this.store.getElementById(prevId) : null, true);
      } else {
        this.store.updateElementModel(id, {
          groupId,
        });
      }
    });
  }

  async redo(): Promise<void> {
    this.payload.uDataList.forEach(data => {
      const {
        model: { id },
        isGroup,
      } = data as IGroupCommandElementObject;
      if (isGroup) {
        this.store.removeElementById(id);
      } else {
        this.store.updateElementModel(id, {
          groupId: undefined,
        });
      }
    });
  }
}
