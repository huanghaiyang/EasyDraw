import IElement, { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import LodashUtils from "@/utils/LodashUtils";
import { IGroupRemovedCommandElementObject } from "@/types/ICommand";

export default class GroupRemovedCommand extends ElementsBaseCommand {
  undo(): void {
    this.payload.dataList.forEach(data => {
      const {
        model: { id, groupId },
        isGroup,
        prevId,
      } = data as IGroupRemovedCommandElementObject;
      if (isGroup) {
        let prevElement: IElement | undefined;
        if (prevId) {
          prevElement = this.store.getElementById(prevId);
        }
        this.store.addElementByModel(LodashUtils.jsonClone(data.model) as ElementObject, prevElement, !prevId);
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
      } = data as IGroupRemovedCommandElementObject;
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
