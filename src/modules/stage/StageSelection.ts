import { IPoint, DrawerMaskModelTypes, ElementStatus } from "@/types";
import IElement, { DefaultAngleModel, ElementObject } from "@/types/IElement";
import { TransformerTypes } from "@/types/ITransformer";
import { IMaskModel } from "@/types/IModel";
import IStageSelection from "@/types/IStageSelection";
import IStageShield from "@/types/IStageShield";
import { DefaultControllerRadius } from "@/styles/MaskStyles";
import CommonUtils from "@/utils/CommonUtils";
import IController from "@/types/IController";
import { IElementGroup } from "@/types/IElementGroup";
import ElementGroup from "@/modules/elements/ElementGroup";
import ElementUtils from "@/modules/elements/utils/ElementUtils";
import LodashUtils from "@/utils/LodashUtils";

export default class StageSelection implements IStageSelection {
  // 舞台
  shield: IStageShield;
  // 选区范围
  rangeElement: IElementGroup;
  // 选区模型
  private _selectionModel: IMaskModel;
  // 变换控制器模型
  private _transformerModels: IMaskModel[] = [];
  // 选区范围点
  private _rangeCoords: IPoint[] = null;

  // 是否为空
  get isEmpty(): boolean {
    const { isSelectedEmpty, isTargetEmpty, isRangeEmpty } = this.shield.store;
    return isSelectedEmpty && isTargetEmpty && isRangeEmpty;
  }

  // 是否为选区范围
  get isRange(): boolean {
    return this._rangeCoords !== null && this._rangeCoords.length > 0;
  }

  // 选区模型
  get selectionModel(): IMaskModel {
    return this._selectionModel;
  }

  // 变换控制器模型
  get transformerModels(): IMaskModel[] {
    return this._transformerModels;
  }

  // 选区中心点
  get center(): IPoint {
    return null;
  }

  // 获取内部角度
  get internalAngle(): number {
    return 0;
  }

  constructor(shield: IStageShield) {
    this.shield = shield;
    // 创建一个用于存放选区的组合组件
    this.rangeElement = new ElementGroup(
      {
        ...ElementUtils.createEmptyGroupObject(),
      } as ElementObject,
      this.shield,
      true,
    );
    this.rangeElement.status = ElementStatus.finished;
  }

  /**
   * 设置选区
   *
   * @param coords
   */
  setRange(coords: IPoint[]): void {
    this._rangeCoords = coords;
    this.refreshRangeElements(this._rangeCoords);
  }

  /**
   * 根据组件获取选区对象的属性
   *
   * @param element
   * @param boxRender
   * @returns
   */
  private _getElementMaskModelProps(element: IElement, boxRender?: boolean): Partial<IMaskModel> {
    const {
      rotateCoords,
      rotateBoxCoords,
      model: { angle, isFold },
    } = element;
    const points = boxRender ? rotateBoxCoords : rotateCoords;
    return {
      points,
      angle,
      element: {
        isFold,
      },
    };
  }

  /**
   * 获取组件模型
   *
   * @param elements
   * @returns
   */
  private _getElementsMaskModels(elements: IElement[], type: DrawerMaskModelTypes): IMaskModel[] {
    const result: IMaskModel[] = [];
    elements.forEach(element => {
      if (!element) return;
      // if (element.isGroupSubject) return; // 忘记此处为什么要限制子组件了
      result.push({
        type,
        ...this._getElementMaskModelProps(element),
      });
    });
    return result;
  }

  /**
   * 获取选区范围对象
   *
   * @returns
   */
  private _getRangeElementsMaskModels(): IMaskModel[] {
    return this._getElementsMaskModels(this.shield.store.rangeElements, DrawerMaskModelTypes.path);
  }

  /**
   * 获取高亮对象
   *
   * @returns
   */
  private _getTargetElementsMaskModels(): IMaskModel[] {
    return this._getElementsMaskModels(this.shield.store.targetElements, DrawerMaskModelTypes.path);
  }

  /**
   * 获取选中对象
   *
   * @returns
   */
  private _getSelectedElementsMaskModels(): IMaskModel[] {
    const { store } = this.shield;
    return this._getElementsMaskModels([store.primarySelectedElement || store.creatingElements[0]], DrawerMaskModelTypes.path);
  }

  /**
   * 获取高亮对象
   *
   * @returns
   */
  getModels(): IMaskModel[] {
    const result: IMaskModel[] = [];
    if (this.isRange) {
      result.push(...this._getRangeElementsMaskModels());
    }
    result.push(...this._getTargetElementsMaskModels());
    result.push(...this._getSelectedElementsMaskModels());
    if (this.isRange) {
      result.push({
        points: this._rangeCoords,
        type: DrawerMaskModelTypes.range,
      });
    }
    return result;
  }

  /**
   * 获取选区对象
   *
   * @returns
   */
  calcSelectionModel(): IMaskModel {
    if (this.shield.store.isSelectedEmpty) return;
    const element = this.shield.store.primarySelectedElement || this.rangeElement;
    if (element && element.boxVerticesTransformEnable && element.model.coords.length > 0) {
      return {
        type: DrawerMaskModelTypes.selection,
        points: element.rotateBoxCoords,
        angle: element.model.angle,
      };
    }
  }

  /**
   * 获取变换控制器对象
   *
   * @returns
   */
  calcTransformerModels(): IMaskModel[] {
    if (this.shield.store.isSelectedEmpty) return [];
    const { primarySelectedElement, creatingElements } = this.shield.store;
    const element = primarySelectedElement || creatingElements[0] || this.rangeElement;

    if (element && element.transformersEnable && element.model.coords.length > 0) {
      const { transformerType, angle, leanYAngle, actualAngle, transformers, coordTransformEnable, boxVerticesTransformEnable, flipX, flipY } = element;
      if (coordTransformEnable || boxVerticesTransformEnable) {
        return this.calcTransformerModelsByPoints(
          transformers,
          {
            angle,
            leanYAngle,
            actualAngle,
            flipX,
            flipY,
          },
          coordTransformEnable ? transformerType : TransformerTypes.rect,
        );
      }
    }
    return [];
  }

  /**
   * 获取变换控制器对象
   *
   * @param points
   * @param angle
   * @param transformerType
   * @returns
   */
  private calcTransformerModelsByPoints(points: IPoint[], props: Partial<IMaskModel>, transformerType: TransformerTypes): IMaskModel[] {
    return points.map(point => {
      const model: IMaskModel = {
        point,
        type: DrawerMaskModelTypes.transformer,
        element: {
          transformerType,
        },
        radius: DefaultControllerRadius,
        ...props,
      };
      return model;
    });
  }

  /**
   * 清空选区
   */
  clearSelects(): void {
    const { store } = this.shield;
    store.deSelectElements(store.selectedElements);
  }

  /**
   * 根据坐标获取命中的组件
   *
   * @param coord
   */
  hitTargetElements(coord: IPoint): void {
    const { store } = this.shield;
    for (let i = store.stageElements.length - 1; i >= 0; i--) {
      const element = store.stageElements[i];
      const isTarget = element.isContainsCoord(coord);
      store.updateElementById(element.id, { isTarget });
      if (isTarget) {
        store.targetElements.forEach(target => {
          if (target.id !== element.id) {
            store.updateElementById(target.id, { isTarget: false });
          }
        });
        break;
      }
    }
  }

  /**
   * 刷新选区
   *
   * 如果当前鼠标所在的组件是命中状态，则将命中组件设置为选中状态
   */
  selectTargets(): void {
    this.shield.store.updateElements(this.shield.store.targetElements, {
      isSelected: true,
      isTarget: false,
    });
  }

  /**
   * 刷新给定区域的组件，将其设置为命中状态
   *
   * @param rangeCoords
   */
  refreshRangeElements(rangeCoords: IPoint[]): void {
    if (rangeCoords && rangeCoords.length) {
      const { store } = this.shield;
      store.stageElements.forEach(element => {
        store.updateElementById(element.id, {
          isInRange: element.isPolygonOverlap(rangeCoords),
        });
      });
    }
  }

  /**
   * 确定选区组件选中
   */
  selectRange(): void {
    if (this.isRange) {
      const { store } = this.shield;
      store.updateElements(store.rangeElements, {
        isSelected: true,
        isInRange: false,
      });
    }
  }

  /**
   * 给定坐标获取命中的组件
   *
   * @param point
   * @returns
   */
  getElementOnCoord(point: IPoint): IElement {
    const stageElements = this.shield.store.stageElements;
    for (let i = stageElements.length - 1; i >= 0; i--) {
      const element = stageElements[i];
      if (element.isContainsCoord(point)) {
        return element;
      }
    }
  }

  /**
   * 刷新选区模型
   */
  refreshSelectionModel(): void {
    this._selectionModel = this.calcSelectionModel();
  }

  /**
   * 刷新变换控制器模型
   */
  refreshTransformerModels(): void {
    this._transformerModels = this.calcTransformerModels();
  }

  /**
   * 刷新范围组件
   */
  refreshRangeElement(): void {
    const elements = this.shield.store.selectedElements;
    if (elements.length === 0) {
      Object.assign(this.rangeElement.model, ElementUtils.createEmptyGroupObject());
    } else {
      if (!this.rangeElement.isRotating && !this.rangeElement.isTransforming) {
        const coords = CommonUtils.getBoxByPoints(elements.map(element => element.rotateCoords).flat());
        Object.assign(this.rangeElement.model, {
          coords,
          boxCoords: LodashUtils.jsonClone(coords),
          ...CommonUtils.getRect(coords),
          subIds: elements.map(element => element.id),
          ...DefaultAngleModel,
        });
      }
      if (this.rangeElement.isTransforming) {
        this.rangeElement.refresh(LodashUtils.toBooleanObject(["points", "size", "rotation", "angles", "outline", "strokes"]));
      } else {
        this.rangeElement.refresh();
      }
    }
  }

  /**
   * 刷新选区模型
   */
  refresh(): void {
    this.refreshRangeElement();
    this.refreshSelectionModel();
    this.refreshTransformerModels();
  }

  /**
   * 尝试激活控制器
   *
   * @param coord
   * @returns
   */
  tryActiveController(coord: IPoint): IController {
    if (this.shield.store.isSelectedEmpty) return;
    const element = this.shield.store.primarySelectedElement || this.rangeElement;
    if (element) {
      const controller = element.getControllerByCoord(coord);
      element.setControllersActive(
        element.controllers.filter(c => c.id !== controller?.id),
        false,
      );
      if (controller) {
        element.setControllersActive([controller], true);
        return controller;
      }
    }
  }

  /**
   * 获取激活控制器
   *
   * @returns
   */
  getActiveController(): IController {
    if (this.shield.store.isSelectedEmpty) return;
    const element = this.shield.store.primarySelectedElement || this.rangeElement;
    if (element) {
      return element.getActiveController();
    }
  }
}
