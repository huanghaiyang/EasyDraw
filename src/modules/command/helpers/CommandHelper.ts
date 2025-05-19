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
  static async restoreRemovedElementFromData(data: ICommandElementObject, store: IStageStore): Promise<IElement> {
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
      props: await element.toElementJson(),
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
  static async createCommandByActionParams(
    actionParams: ElementsActionParam[],
    type: ElementsCommandTypes,
    store?: IStageStore,
    elementsOperatingFunction?: () => Promise<void>,
  ): Promise<ICommand<IElementsCommandPayload>> {
    const uDataList = await CommandHelper.createDataListByActionParams(actionParams);
    elementsOperatingFunction && (await elementsOperatingFunction());
    const rDataList = await CommandHelper.createDataListByActionParams(actionParams);
    return CommandHelper.createElementsChangedCommand(uDataList, rDataList, type, store);
  }

  /**
   * 创建组件更新数据
   *
   * @param elements
   * @param modelFunctionName
   * @param type
   * @param eachOperatingFunction
   * @returns
   */
  static async createCommandDataList(
    elements: IElement[],
    modelFunctionName: string,
    type: ElementActionTypes,
    eachOperatingFunction?: (element: IElement) => Promise<void>,
  ): Promise<ICommandElementObject[]> {
    return await Promise.all(
      elements.map(async element => {
        eachOperatingFunction && (await eachOperatingFunction(element));
        return CommandHelper.wrapElementJson(element, { model: await (element as any)[modelFunctionName](), type });
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
  static async createCommandDataLists(
    elements: IElement[],
    modelFunctionNames: string[],
    types: ElementActionTypes[],
    funcs?: {
      elementsOperatingFunction?: () => Promise<void>;
      eachUDataListOperatingFunction?: (element: IElement) => Promise<void>;
      eachRDataListOperatingFunction?: (element: IElement) => Promise<void>;
    },
  ): Promise<[ICommandElementObject[], ICommandElementObject[]]> {
    const { elementsOperatingFunction, eachUDataListOperatingFunction, eachRDataListOperatingFunction } = funcs || {};
    const uDataFunctionName = modelFunctionNames[0];
    const rDataFunctionName = modelFunctionNames[1] || uDataFunctionName;
    const uDataType = types[0];
    const rDataType = types[1] || uDataType;
    const uDataList = await CommandHelper.createCommandDataList(elements, uDataFunctionName, uDataType, eachUDataListOperatingFunction);
    elementsOperatingFunction && (await elementsOperatingFunction());
    const rDataList = await CommandHelper.createCommandDataList(elements, rDataFunctionName, rDataType, eachRDataListOperatingFunction);
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
  static createElementsChangedCommand(
    uDataList: Array<ICommandElementObject>,
    rDataList: Array<ICommandElementObject>,
    type: ElementsCommandTypes,
    store?: IStageStore,
    id?: string,
  ): ICommand<IElementsCommandPayload> {
    const command = new ElementsChangedCommand(
      id || CommonUtils.getRandomId(),
      {
        type,
        uDataList,
        rDataList,
      },
      store,
    );
    return command;
  }

  /**
   * 获取祖先组件更新数据
   *
   * @param ancestors
   * @returns
   */
  static async getAncestorsUpdateJson(ancestors: IElementGroup[]): Promise<ICommandElementObject[]> {
    return await Promise.all(
      ancestors.map(async ancestor => {
        return CommandHelper.wrapElementJson(ancestor, {
          model: await (ancestor as IElementGroup).toSubUpdatedJson(),
          type: ElementActionTypes.GroupUpdated,
        });
      }),
    );
  }

  /**
   * 获取组件层级调换数据
   *
   * @param elements
   * @returns
   */
  static async getRearrangeDataList(elements: IElement[]): Promise<ICommandElementObject[]> {
    return Promise.all(
      elements.map(async element => {
        return CommandHelper.wrapElementJson(element, {
          model: await element.toGroupJson(),
          type: ElementActionTypes.Moved,
          ...CommandHelper.createRearrangeModel(element),
        });
      }),
    );
  }

  /**
   * 获取组件删除数据
   *
   * @param elements
   * @returns
   */
  static async getElementsRemovedDataList(elements: IElement[]): Promise<ICommandElementObject[]> {
    return Promise.all(
      elements.map(async element => {
        return CommandHelper.wrapElementJson(element, {
          model: await element.toJson(),
          type: ElementActionTypes.Removed,
          ...CommandHelper.createRearrangeModel(element),
        });
      }),
    );
  }

  /**
   * 获取组件添加数据
   *
   * @param elements
   * @param type
   * @returns
   */
  static async getElementsAddedDataList(elements: IElement[], type: ElementActionTypes = ElementActionTypes.Added): Promise<ICommandElementObject[]> {
    return Promise.all(
      elements.map(async element => {
        return CommandHelper.wrapElementJson(element, {
          model: await element.toJson(),
          type,
          ...CommandHelper.createRearrangeModel(element),
        });
      }),
    );
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
   * @param props
   * @param store
   */
  static async updateCreatingElementStatus(id: string, props: Object = {}, store: IStageStore): Promise<void> {
    store.setElementProvisionalCreatingById(id);
    if (!isEmpty(props)) {
      store.updateElementById(id, props);
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
  static async restoreDataList(datalist: ICommandElementObject[], isRedo: boolean, store: IStageStore): Promise<void> {
    await Promise.all(
      datalist.map(data => {
        return new Promise<void>(async resolve => {
          const { model, type, props = {} } = data;
          const { id } = model;
          switch (type) {
            case ElementActionTypes.Added: {
              // 对于add命令，如果是redo操作，需要还原插入组件，否则直接删除组件
              if (isRedo) {
                await CommandHelper.restoreRemovedElementFromData(data, store);
              } else {
                store.removeElementById(id);
              }
              break;
            }
            case ElementActionTypes.Updated:
            case ElementActionTypes.GroupUpdated: {
              await CommandHelper.updateElementFromData(data, store);
              break;
            }
            case ElementActionTypes.Removed: {
              // 对于remove命令，如果是redo操作，需要删除组件，否则还原插入组件
              if (isRedo) {
                store.removeElementById(id);
              } else {
                await CommandHelper.restoreRemovedElementFromData(data, store);
              }
              break;
            }
            case ElementActionTypes.Moved: {
              await CommandHelper.rearrange([data], store);
              // 组件移动位置时，可能会改变组件的所属组合，需要更新组件的model
              store.updateElementModel(id, model);
              break;
            }
            case ElementActionTypes.Creating: {
              await CommandHelper.updateElementFromData(data, store);
              await CommandHelper.updateCreatingElementStatus(id, props, store);
              store.currentCreatingElementId = id;
              break;
            }
            case ElementActionTypes.StartCreating: {
              if (isRedo) {
                await CommandHelper.restoreRemovedElementFromData(data, store);
                await CommandHelper.updateCreatingElementStatus(id, props, store);
                store.currentCreatingElementId = id;
              } else {
                store.removeElementById(id);
                store.currentCreatingElementId = null;
              }
              break;
            }
          }
          resolve();
        });
      }),
    );
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
