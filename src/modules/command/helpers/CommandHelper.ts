import ICommand, {
  DetachedRemovedType,
  ElementCommandTypes,
  ICommandElementObject,
  IDetachedRemovedCommandElementObject,
  IElementCommandPayload,
  IGroupCommandElementObject,
  INodeRelation,
  IRearrangeCommandElementObject,
  LayerChangedType,
} from "@/types/ICommand";
import IElement, { ElementObject } from "@/types/IElement";
import IStageStore from "@/types/IStageStore";
import LodashUtils from "@/utils/LodashUtils";
import ElementsRearrangeCommand from "@/modules/command/ElementsRearrangeCommand";
import ElementsUpdatedCommand from "@/modules/command/ElementsUpdatedCommand";
import { IElementGroup } from "@/types/IElementGroup";
import GroupRemovedCommand from "@/modules/command/GroupRemovedCommand";
import { nanoid } from "nanoid";
import GroupAddedCommand from "@/modules/command/GroupAddedCommand";
import ElementsRemovedCommand from "@/modules/command/ElementsRemovedCommand";
import DetachedElementsRemovedCommand from "@/modules/command/DetachedElementsRemovedCommand";
import { LayerActionParam } from "@/types/IStageSetter";
import ElementUtils from "@/modules/elements/utils/ElementUtils";

export default class CommandHelper {
  /**
   * 当组件层级变更后，重新刷新store数据
   *
   * @param store
   */
  static refreshStoreAfterLayerChanged(store: IStageStore): void {
    store.retrieveElements();
    store.emitElementsLayerChanged();
  }

  /**
   * 组件数据恢复

   * @param commandElementObject
   * @param store
   */

  static async restoreElementFromData(commandElementObject: ICommandElementObject, store: IStageStore): Promise<void> {
    const { model } = commandElementObject;
    const element = store.updateElementModel(model.id, LodashUtils.jsonClone(model));
    if (element) {
      element.refreshFlipX();
      element.refresh();
    }
  }

  /**
   * 多组件数据恢复
   *
   * @param uDataList
   * @param store
   */
  static async restoreElementsFromData(uDataList: Array<ICommandElementObject>, store: IStageStore): Promise<void> {
    uDataList.forEach(data => {
      CommandHelper.restoreElementFromData(data, store);
    });
  }

  /**
   * 重新调整组件位置
   *
   * @param uDataList
   * @param store
   */
  static async rearrange(uDataList: Array<ICommandElementObject>, store: IStageStore): Promise<void> {
    uDataList.forEach(data => {
      const {
        model: { id },
        prevId,
      } = data as IRearrangeCommandElementObject;
      const element = store.getElementById(id);
      if (element) {
        store.moveElementAfter(element, prevId ? store.getElementById(prevId) : null, true);
      }
    });
  }

  /**
   * 创建重新调整组件位置的模型
   *
   * @param element
   */
  static createRearrangeModel(element: IElement): INodeRelation {
    return {
      prevId: element.node.prev?.value?.id,
      nextId: element.node.next?.value?.id,
    };
  }

  /**
   * 创建组件移除命令
   *
   * @param elements
   * @param store
   */
  static createElementsRemovedCommand(uDataList: Array<ICommandElementObject>, store: IStageStore): ICommand<IElementCommandPayload> {
    const command = new ElementsRemovedCommand(
      nanoid(),
      {
        type: ElementCommandTypes.ElementsRemoved,
        uDataList,
      },
      store,
    );
    return command;
  }

  /**
   * 创建组件独立组件移除命令
   *
   * @param uDataList
   * @param rDataList
   * @param store
   */
  static createDetachedElementsRemovedCommand(uDataList: Array<ICommandElementObject>, rDataList: Array<ICommandElementObject>, store: IStageStore): ICommand<IElementCommandPayload> {
    const command = new DetachedElementsRemovedCommand(
      nanoid(),
      {
        type: ElementCommandTypes.DetachedElementsRemoved,
        uDataList,
        rDataList,
      },
      store,
    );
    return command;
  }

  /**
   * 创建重新调整组件位置的命令
   *
   * @param elements
   * @param elementsUpdateFunction
   * @param store
   */
  static async createRearrangeCommand(
    uDataList: Array<IRearrangeCommandElementObject>,
    rDataList: Array<IRearrangeCommandElementObject>,
    store: IStageStore,
  ): Promise<ICommand<IElementCommandPayload>> {
    const command = new ElementsRearrangeCommand(
      nanoid(),
      {
        type: ElementCommandTypes.ElementsRearranged,
        uDataList,
        rDataList,
      },
      store,
    );
    return command;
  }

  /**
   * 根据数据创建更新命令
   *
   * @param uDataList
   * @param rDataList
   * @param store
   * @param id
   */
  static async createUpdateCommandBy(uDataList: ICommandElementObject[], rDataList: ICommandElementObject[], store: IStageStore, id?: string): Promise<ICommand<IElementCommandPayload>> {
    const command = new ElementsUpdatedCommand(
      id || nanoid(),
      {
        type: ElementCommandTypes.ElementsUpdated,
        uDataList,
        rDataList,
      },
      store,
    );
    return command;
  }

  /**
   * 创建组件原始圆角半径命令
   *
   * @param elements
   * @param store
   */
  static async createOriginalCornerCommand(elements: IElement[], store: IStageStore): Promise<ICommand<IElementCommandPayload>> {
    const uDataList = await Promise.all(elements.map(async element => ({ model: await element.toOriginalCornerJson() })));
    const rDataList = await Promise.all(elements.map(async element => ({ model: await element.toCornerJson() })));
    return CommandHelper.createUpdateCommandBy(uDataList, rDataList, store);
  }

  /**
   * 创建组件组合添加数据模型
   *
   * @param group 组合
   * @param elements 组件
   * @returns
   */
  static async createGroupAddedDataList(group: IElementGroup, elements: IElement[]): Promise<Array<IGroupCommandElementObject>> {
    const { id: groupId } = group;
    return await Promise.all(
      elements.map(async element => {
        const {
          id,
          model: { groupId: eGroupId },
        } = element;
        let model: Partial<ElementObject>;
        const isGroup = groupId === id;
        // 是当前组合
        if (isGroup) {
          model = await element.toJson();
        } else if (eGroupId === groupId) {
          // 是当前组合的子组件
          model = await element.toGroupJson();
        } else {
          // 当前组合的孙子组件
          model = { id };
        }
        const result: IGroupCommandElementObject = { model, isGroup, ...CommandHelper.createRearrangeModel(element) };
        if (eGroupId === groupId) {
          result.isGroupSubject = true;
        }
        return result;
      }),
    );
  }

  /**
   * 创建组件组合添加命令
   *
   * @param uDataList 组件数据
   * @param rDataList 组件数据
   * @param store 画板
   * @returns
   */
  static createGroupAddedCommand(uDataList: Array<ICommandElementObject>, rDataList: Array<ICommandElementObject>, store: IStageStore): ICommand<IElementCommandPayload> {
    const command = new GroupAddedCommand(
      nanoid(),
      {
        type: ElementCommandTypes.GroupAdded,
        uDataList,
        rDataList,
      },
      store,
    );
    return command;
  }

  /**
   * 组合创建命令
   *
   * @param elements 组件列表
   * @param groupAddFunction 组合创建函数
   * @param store 画板
   * @returns
   */
  static async createGroupAddedCommandBy(elements: IElement[], groupAddFunction: () => { group: IElementGroup; elements: IElement[] }, store: IStageStore): Promise<ICommand<IElementCommandPayload>> {
    const uDataList: Array<IGroupCommandElementObject> = await Promise.all(
      elements.map(async element => ({ model: { id: element.id }, isGroupSubject: !element.isGroupSubject, ...CommandHelper.createRearrangeModel(element) })),
    );
    const { group, elements: newElements } = groupAddFunction() || {};
    if (group) {
      uDataList.push({
        model: { id: group.id },
        isGroup: true,
      } as IGroupCommandElementObject);
      const rDataList = await CommandHelper.createGroupAddedDataList(group, newElements);
      return CommandHelper.createGroupAddedCommand(uDataList, rDataList, store);
    }
  }

  /**
   * 创建组件组合移除命令
   *
   * @param elements 组件列表
   * @param store 画板
   */
  static createGroupRemovedCommand(uDataList: Array<ICommandElementObject>, store: IStageStore): ICommand<IElementCommandPayload> {
    const command = new GroupRemovedCommand(
      nanoid(),
      {
        type: ElementCommandTypes.GroupRemoved,
        uDataList,
      },
      store,
    );
    return command;
  }

  /**
   * 创建组件组合取消命令
   *
   * @param groups 组合列表
   */
  static async createGroupRemovedCommandBy(groups: IElementGroup[], store: IStageStore): Promise<ICommand<IElementCommandPayload>> {
    const uDataList: Array<IGroupCommandElementObject> = [];
    await Promise.all(
      groups.map(async group => {
        uDataList.push({
          model: await group.toJson(),
          isGroup: true,
          ...CommandHelper.createRearrangeModel(group),
        });
        group.subs.forEach(async sub => {
          uDataList.push({
            model: await sub.toGroupJson(),
            isGroup: false,
          });
        });
      }),
    );
    return CommandHelper.createGroupRemovedCommand(uDataList, store);
  }

  /**
   * 获取祖先组件更新数据
   *
   * @param ancestors
   * @returns
   */
  static async getAncestorsUpdateJson(ancestors: IElementGroup[]): Promise<IDetachedRemovedCommandElementObject[]> {
    return (await Promise.all(
      ancestors.map(async ancestor => {
        return {
          model: await (ancestor as IElementGroup).toSubUpdatedJson(),
          type: DetachedRemovedType.GroupUpdated,
        };
      }),
    )) as IDetachedRemovedCommandElementObject[];
  }

  /**
   * 根据给定的层级调换参数，返回处理好撤销回退数据
   *
   * @param params
   * @returns
   */
  static async createRearrangeDataList(params: LayerActionParam[]): Promise<Array<IRearrangeCommandElementObject>> {
    const result: Array<IRearrangeCommandElementObject> = [];
    await Promise.all(
      params.map(param => {
        return new Promise<void>(resolve => {
          const { type, data: elements } = param;
          switch (type) {
            case LayerChangedType.LayerChanged: {
              const flatElements = ElementUtils.flatElementsWithDeepSubs(elements);
              flatElements.forEach(element => {
                result.push({ model: { id: element.id }, ...CommandHelper.createRearrangeModel(element), type });
              });
              break;
            }
            case LayerChangedType.GroupUpdated: {
              elements.forEach(async element => {
                result.push({ model: await (element as IElementGroup).toSubUpdatedJson(), type });
              });
              break;
            }
          }
          resolve();
        });
      }),
    );
    return result;
  }

  /**
   * 还原组件位置
   *
   * @param dataList
   * @param store
   */
  static async restoreRearrangeDataList(dataList: Array<IRearrangeCommandElementObject>, store: IStageStore): Promise<void> {
    await Promise.all(
      dataList.map(item => {
        return new Promise<void>(async resolve => {
          const { type } = item as IRearrangeCommandElementObject;
          switch (type) {
            case LayerChangedType.LayerChanged: {
              await CommandHelper.rearrange([item], store);
              break;
            }
            case LayerChangedType.GroupUpdated: {
              await CommandHelper.restoreElementFromData(item, store);
              break;
            }
          }
          resolve();
        });
      }),
    );
  }
}
