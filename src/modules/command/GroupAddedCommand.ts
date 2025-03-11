import { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import LodashUtils from "@/utils/LodashUtils";
import { IGroupCommandElementObject } from "@/types/ICommand";

export default class GroupAddedCommand extends ElementsBaseCommand {
  undo(): void {
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

  redo(): void {
    this.payload.dataList.forEach(data => {
      const {
        model: { id, groupId },
        isGroup,
      } = data as IGroupCommandElementObject;
      if (isGroup) {
        this.store.addElementByModel(LodashUtils.jsonClone(data.model) as ElementObject);
      } else {
        this.store.updateElementModel(id, {
          groupId,
        });
      }
    });
  }
}
