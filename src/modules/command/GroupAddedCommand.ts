import { ElementObject } from "@/types/IElement";
import ElementsBaseCommand from "@/modules/command/ElementsBaseCommand";
import LodashUtils from "@/utils/LodashUtils";
import { IGroupCommandElementObject, IElementCommandPayload } from "@/types/ICommand";

export default class GroupAddedCommand extends ElementsBaseCommand<IElementCommandPayload> {
  async undo(): Promise<void> {
    this.payload.uDataList.forEach(data => {
      const {
        model: { id },
        isGroup,
        isGroupSubject,
        prevId,
      } = data as IGroupCommandElementObject;
      if (isGroup) {
        this.store.removeElementById(id);
      } else {
        const element = this.store.getElementById(id);
        if (element) {
          if (isGroupSubject) {
            this.store.updateElementModel(id, {
              groupId: undefined,
            });
          }
          this.store.rearrangeElementAfter(element, prevId ? this.store.getElementById(prevId) : null, true);
        }
      }
    });
    this.store.resortElementsArray();
    this.store.emitElementsLayerChanged();
  }

  async redo(): Promise<void> {
    // 从后向前还原组件的原因是，在生成组合的时候，子组件层级会提升，因此还原的时候需要先还原组合，在将子组件插入到组合前
    for (let i = this.payload.rDataList.length - 1; i >= 0; i--) {
      const data = this.payload.rDataList[i];
      const {
        model: { id, groupId },
        isGroup,
        isGroupSubject,
        nextId,
      } = data as IGroupCommandElementObject;
      if (isGroup) {
        this.store.beforeAddElementByModel(LodashUtils.jsonClone(data.model) as ElementObject, nextId ? this.store.getElementById(nextId) : null, true);
      } else {
        const element = this.store.getElementById(id);
        if (element) {
          if (isGroupSubject) {
            this.store.updateElementModel(id, {
              groupId,
            });
          }
          this.store.rearrangeElementBefore(element, nextId ? this.store.getElementById(nextId) : null, true);
        }
      }
    }
    this.store.resortElementsArray();
    this.store.emitElementsLayerChanged();
  }
}
