import ICommand, { ElementActionTypes, ElementsCommandTypes, ElementsActionParam, IElementsCommandPayload, IRelationNode, ICommandElementObject } from "@/types/ICommand";
import IElement, { ElementObject } from "@/types/IElement";
import IStageStore from "@/types/IStageStore";
import LodashUtils from "@/utils/LodashUtils";
import { IElementGroup } from "@/types/IElementGroup";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import ElementsChangedCommand from "@/modules/command/ElementsChangedCommand";
import CommonUtils from "@/utils/CommonUtils";
import { isEmpty } from "lodash";

export default class CommandHelper {
  /**
   * 组件数据恢复
   *
   * @param commandElementObject
   * @param store
   */
  static async updateElementFromData(commandElementObject: ICommandElementObject, store: IStageStore): Promise<IElement> {
    const { model } = commandElementObject;
    const element = store.updateElementModel(model.id, LodashUtils.jsonClone(model));
    if (element) {
      element.refreshFlipX();
      element.refresh();
    }
    return element;
  }

  /**
   * 多组件数据恢复
   *
   * @param uDataList
   * @param store
   */
  static async batchUpdateElementFromDatas(uDataList: Array<ICommandElementObject>, store: IStageStore): Promise<void> {
    uDataList.forEach(data => {
      CommandHelper.updateElementFromData(data, store);
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
      const { model, prevId } = data;
      const element = store.getElementById(model.id);
      const prevElement = prevId ? store.getElementById(prevId) : undefined;
      if (element) {
        store.moveElementAfter(element, prevElement, true);
      }
    });
  }

  /**
   * 还原被删除的组件
   *
   * @param data
   * @param store
   */
  static async restoreElementFromData(data: ICommandElementObject, store: IStageStore): Promise<IElement> {
    let element: IElement | undefined;
    const { model, prevId } = data;
    let prevElement: IElement | undefined;
    if (prevId) {
      prevElement = store.getElementById(prevId);
    }
    element = store.insertAfterElementByModel(LodashUtils.jsonClone(model) as ElementObject, prevElement, !prevId);
    return element;
  }

  /**
   * 创建重新调整组件位置的模型
   *
   * @param element
   */
  static createRearrangeModel(element: IElement): IRelationNode {
    return {
      prevId: element.node.prev?.value?.id,
      nextId: element.node.next?.value?.id,
    };
  }

  /**
   * 封装组件原始数据
   *
   * @param element
   * @param json
   */
  static async wrapElementJson(element: IElement, json: ICommandElementObject): Promise<ICommandElementObject> {
    return {
      ...await element.toElementJson(),
      ...json,
    };
  }

  /**
   * 根据给定参数创建组件命令
   *
   * @param elements
   * @param type
   * @param store
   * @param elementsOperatingFunction
   */
  static async createByActionParams(
    actionParams: ElementsActionParam[],
    type: ElementsCommandTypes,
    store?: IStageStore,
    elementsOperatingFunction?: () => Promise<void>,
  ): Promise<ICommand<IElementsCommandPayload>> {
    const uDataList = await CommandHelper.createDataListByActionParams(actionParams);
    elementsOperatingFunction && (await elementsOperatingFunction());
    const rDataList = await CommandHelper.createDataListByActionParams(actionParams);
    return CommandHelper.createElementsChangedCommand({ store, payload: { uDataList, rDataList, type } });
  }

  /**
   * 创建组件更新数据
   *
   * @param elements
   * @param dataTransferName
   * @param type
   * @param eachOperatingFunction
   * @returns
   */
  static async createDataList(
    elements: IElement[],
    type: ElementActionTypes,
    funcs: {
      dataTransfer: (element: IElement) => Promise<ElementObject>;
      objectTransfer?: (element: IElement) => Promise<ICommandElementObject>;
      eachOperatingFunction?: (element: IElement) => Promise<void>;
    },
  ): Promise<ICommandElementObject[]> {
    const { dataTransfer, objectTransfer, eachOperatingFunction } = funcs;
    return await Promise.all(
      elements.map(async element => {
        eachOperatingFunction && (await eachOperatingFunction(element));
        return CommandHelper.wrapElementJson(element, { model: await dataTransfer(element), type, ...(objectTransfer ? await objectTransfer(element) : {}) });
      }),
    );
  }

  /**
   * 创建组件更新命令数据
   *
   * @param elements
   * @param type
   * @param elementsOperatingFunction
   * @returns
   */
  static async batchCreateDataList(
    elements: IElement[],
    dataTransfers: ((element: IElement) => Promise<ElementObject>)[],
    types: ElementActionTypes[],
    funcs?: {
      elementsOperatingFunction?: () => Promise<void>;
      eachUDataListOperatingFunction?: (element: IElement) => Promise<void>;
      eachRDataListOperatingFunction?: (element: IElement) => Promise<void>;
    },
  ): Promise<[ICommandElementObject[], ICommandElementObject[]]> {
    const { elementsOperatingFunction, eachUDataListOperatingFunction, eachRDataListOperatingFunction } = funcs || {};
    const uDataTransfer = dataTransfers[0];
    const rDataTransfer = dataTransfers[1] || uDataTransfer;
    const uDataType = types[0];
    const rDataType = types[1] || uDataType;
    const uDataList = await CommandHelper.createDataList(elements, uDataType, {
      dataTransfer: uDataTransfer,
      eachOperatingFunction: eachUDataListOperatingFunction,
    });
    elementsOperatingFunction && (await elementsOperatingFunction());
    const rDataList = await CommandHelper.createDataList(elements, rDataType, {
      dataTransfer: rDataTransfer,
      eachOperatingFunction: eachRDataListOperatingFunction,
    });
    return [uDataList, rDataList];
  }

  /**
   * 创建组件组合添加命令
   *
   * @param uDataList 组件数据
   * @param rDataList 组件数据
   * @param type 命令类型
   * @param store 画板
   * @param id 命令ID
   * @returns
   */
  static createElementsChangedCommand({
    store,
    payload,
    id,
  }: {
    store?: IStageStore;
    id?: string;
    payload: IElementsCommandPayload;
  } & Partial<IElementsCommandPayload>): ICommand<IElementsCommandPayload> {
    return new ElementsChangedCommand(id || CommonUtils.getRandomId(), payload, store);
  }

  /**
   * 获取祖先组件更新数据
   *
   * @param ancestors
   * @returns
   */
  static async getAncestorsUpdateJson(ancestors: IElementGroup[]): Promise<ICommandElementObject[]> {
    return await CommandHelper.createDataList(ancestors, ElementActionTypes.GroupUpdated, {
      dataTransfer: async ancestor => {
        return await (ancestor as IElementGroup).toSubUpdatedJson();
      },
    });
  }

  /**
   * 获取组件层级调换数据
   *
   * @param elements
   * @returns
   */
  static async getRearrangeDataList(elements: IElement[]): Promise<ICommandElementObject[]> {
    return await CommandHelper.createDataList(elements, ElementActionTypes.Moved, {
      dataTransfer: async element => {
        return await element.toGroupJson();
      },
      objectTransfer: async element => {
        return CommandHelper.createRearrangeModel(element) as unknown as ICommandElementObject;
      },
    });
  }

  /**
   * 获取组件删除数据
   *
   * @param elements
   * @returns
   */
  static async getElementsRemovedDataList(elements: IElement[]): Promise<ICommandElementObject[]> {
    return await CommandHelper.createDataList(elements, ElementActionTypes.Removed, {
      dataTransfer: async element => {
        return await element.toJson();
      },
      objectTransfer: async element => {
        return CommandHelper.createRearrangeModel(element) as unknown as ICommandElementObject;
      },
    });
  }

  /**
   * 获取组件添加数据
   *
   * @param elements
   * @param type
   * @returns
   */
  static async getElementsAddedDataList(elements: IElement[], type: ElementActionTypes = ElementActionTypes.Added): Promise<ICommandElementObject[]> {
    return await CommandHelper.createDataList(elements, type, {
      dataTransfer: async element => {
        return await element.toJson();
      },
      objectTransfer: async element => {
        return CommandHelper.createRearrangeModel(element) as unknown as ICommandElementObject;
      },
    });
  }

  /**
   * 根据给定的层级调换参数，返回处理好撤销回退数据
   *
   * @param params
   * @returns
   */
  static async createRearrangeDataList(params: ElementsActionParam[]): Promise<Array<ICommandElementObject>> {
    const result: Array<ICommandElementObject> = [];
    await Promise.all(
      params.map(param => {
        return new Promise<void>(async resolve => {
          const { type, data: elements } = param;
          switch (type) {
            case ElementActionTypes.Moved: {
              const flatElements = ElementUtils.flatElementsWithDeepSubs(elements);
              result.push(...(await CommandHelper.getRearrangeDataList(flatElements)));
              break;
            }
            case ElementActionTypes.GroupUpdated: {
              result.push(...(await CommandHelper.getAncestorsUpdateJson(elements as IElementGroup[])));
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
   * 还原正在创建中的组件
   *
   * @param id
   * @param unEffect
   * @param store
   */
  static async updateElementProps(id: string, unEffect: Object = {}, store: IStageStore): Promise<void> {
    // 特殊属性不需要在此处处理
    if (!isEmpty(unEffect)) {
      store.updateElementById(id, unEffect);
    }
  }

  /**
   * 执行撤销操作
   *
   * @param datalist
   * @param isRedo
   * @param store
   * @returns
   */
  static async restoreDataList(
    datalist: ICommandElementObject[],
    isRedo: boolean,
    store: IStageStore,
  ): Promise<{
    updatedIds: Set<string>;
    removedIds: Set<string>;
    addedIds: Set<string>;
  }> {
    const updatedIds: Set<string> = new Set<string>();
    const removedIds: Set<string> = new Set<string>();
    const addedIds: Set<string> = new Set<string>();
    await Promise.all(
      datalist.map(data => {
        return new Promise<void>(async resolve => {
          const { model, type, unEffect } = data;
          const { id } = model;
          let isAdded: boolean = false;
          let isUpdated: boolean = false;
          let isRemoved: boolean = false;
          switch (type) {
            case ElementActionTypes.Added: {
              // 对于add命令，如果是redo操作，需要还原插入组件，否则直接删除组件
              if (isRedo) {
                await CommandHelper.restoreElementFromData(data, store);
                isAdded = true;
              } else {
                store.removeElementById(id);
                isRemoved = true;
              }
              break;
            }
            case ElementActionTypes.Updated:
            case ElementActionTypes.GroupUpdated: {
              await CommandHelper.updateElementFromData(data, store);
              await CommandHelper.updateElementProps(id, unEffect, store);
              isUpdated = true;
              break;
            }
            case ElementActionTypes.Removed: {
              // 对于remove命令，如果是redo操作，需要删除组件，否则还原插入组件
              if (isRedo) {
                store.removeElementById(id);
                isRemoved = true;
              } else {
                await CommandHelper.restoreElementFromData(data, store);
                isAdded = true;
              }
              break;
            }
            case ElementActionTypes.Moved: {
              await CommandHelper.rearrange([data], store);
              // 组件移动位置时，可能会改变组件的所属组合，需要更新组件的model
              store.updateElementModel(id, model);
              isUpdated = true;
              break;
            }
            case ElementActionTypes.Creating: {
              await CommandHelper.updateElementFromData(data, store);
              await CommandHelper.updateElementProps(id, unEffect, store);
              store.setElementProvisionalCreatingById(id);
              store.currentCreatingElementId = id;
              isUpdated = true;
              break;
            }
            case ElementActionTypes.StartCreating: {
              if (isRedo) {
                await CommandHelper.restoreElementFromData(data, store);
                await CommandHelper.updateElementProps(id, unEffect, store);
                store.setElementProvisionalCreatingById(id);
                store.currentCreatingElementId = id;
                isAdded = true;
              } else {
                store.removeElementById(id);
                store.currentCreatingElementId = null;
                isRemoved = true;
              }
              break;
            }
          }
          if (isAdded) {
            addedIds.add(id);
          } else if (isUpdated) {
            updatedIds.add(id);
          } else if (isRemoved) {
            removedIds.add(id);
          }
          resolve();
        });
      }),
    );
    return { updatedIds, removedIds, addedIds };
  }

  /**
   * 给定组合添加参数，返回处理好撤销数据
   *
   * @param params
   * @returns
   */
  static async createDataListByActionParams(params: ElementsActionParam[]): Promise<Array<ICommandElementObject>> {
    const dataList: Array<ICommandElementObject> = [];
    await Promise.all(
      params.map(async param => {
        const { data, type } = param;
        switch (type) {
          case ElementActionTypes.Moved: {
            dataList.push(...(await CommandHelper.getRearrangeDataList(data)));
            break;
          }
          case ElementActionTypes.Removed: {
            dataList.push(...(await CommandHelper.getElementsRemovedDataList(data)));
            break;
          }
          case ElementActionTypes.GroupUpdated: {
            dataList.push(...(await CommandHelper.getAncestorsUpdateJson(data as IElementGroup[])));
            break;
          }
          case ElementActionTypes.Added:
          case ElementActionTypes.Creating:
          case ElementActionTypes.StartCreating: {
            dataList.push(...(await CommandHelper.getElementsAddedDataList(data, type)));
            break;
          }
        }
      }),
    );
    return dataList;
  }
}
