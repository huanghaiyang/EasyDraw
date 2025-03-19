import { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import LodashUtils from "@/utils/LodashUtils";
import { IGroupCommandElementObject, IElementCommandPayload } from "@/types/ICommand";

export default class GroupRemovedCommand extends ElementsBaseCommand<IElementCommandPayload> {
  undo(): void {
    this.payload.dataList.forEach(data => {
      const {
        model: { id, groupId },
        isGroup,
        prevId,
      } = data as IGroupCommandElementObject;
      if (isGroup) {
        this.store.afterAddElementByModel(LodashUtils.jsonClone(data.model) as ElementObject, prevId ? this.store.getElementById(prevId) : null, true);
      } else {
        this.store.updateElementModel(id, {
          groupId,
        });
      }
    });
  }

  redo(): void {
    this.payload.dataList.forEach(data => {
      const {
        model: { id },
        isGroup,
      } = data as IGroupCommandElementObject;
      if (isGroup) {
        this.store.removeElement(id);
      } else {
        this.store.updateElementModel(id, {
          groupId: undefined,
        });
      }
    });
  }
}
