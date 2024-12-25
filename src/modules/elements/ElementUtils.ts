import { CreatorTypes, ElementObject, IPoint, IStageElement, IStageElementTask } from "@/types";
import StageElementTaskRect from "@/modules/render/base/task/StageElementTaskRect";
import CommonUtils from "@/utils/CommonUtils";
import StageElementRect from "@/modules/elements/StageElementRect";
import StageElement from "@/modules/elements/StageElement";
import MathUtils from "@/utils/MathUtils";
import { DefaultSelectionRotateDistance } from "@/types/constants";

export enum ElementReactionPropNames {
  isSelected = 'isSelected',
  isVisible = 'isVisible',
  isLocked = 'isLocked',
  isEditing = 'isEditing',
  isMoving = 'isMoving',
  isResizing = 'isResizing',
  isRotating = 'isRotating',
  isRotatingTarget = 'isRotatingTarget',
  isDragging = 'isDragging',
  isProvisional = 'isProvisional',
  isTarget = 'isTarget',
  isInRange = 'isInRange',
  isOnStage = 'isOnStage',
  status = 'status'
}

export enum ElementListEventNames {
  added = 'added',
  removed = 'removed',
  updated = 'updated',
  sizeChanged = 'sizeChanged'
}

export default class ElementUtils {
  static createElementTask(element: IStageElement, params?: any): IStageElementTask {
    let task: IStageElementTask;
    switch (element.model.type) {
      case CreatorTypes.rectangle:
        task = new StageElementTaskRect(element, params);
        break;
      default:
        break;
    }
    return task;
  }

  /**
   * 计算世界坐标在画布坐标系下的坐标
   * 
   * @param worldCoords 
   * @param stageRect 
   * @param stageWorldCoord 
   * @returns 
   */
  static calcStageRelativePoints(worldCoords: IPoint[], stageRect: DOMRect, stageWorldCoord: IPoint): IPoint[] {
    // 计算element坐标相对于画布的坐标
    const points = worldCoords.map(p => {
      return {
        x: p.x + stageRect.width / 2 - stageWorldCoord.x,
        y: p.y + stageRect.height / 2 - stageWorldCoord.y
      }
    })
    return points;
  }

  /**
   * 在绘制图形时补全缺省点
   * 
   * @param points 
   * @param creatorType 
   * @returns 
   */
  static calcCreatorPoints(points: IPoint[], creatorType: CreatorTypes) {
    switch (creatorType) {
      case CreatorTypes.rectangle:
        return CommonUtils.getBoxPoints(points);
      default:
        return points;
    }
  }

  /**
   * 根据对象创建元素
   * 
   * @param model 
   * @returns 
   */
  static createElement(model: ElementObject): IStageElement {
    const { type } = model;
    switch (type) {
      case CreatorTypes.rectangle: {
        return new StageElementRect(model);
      }
      default:
        return new StageElement(model);
    }
  }

  /**
   * 给定一个坐标，选出最上层的那个组件
   * 
   * @param elements 
   * @param point 
   */
  static getTopAElementByPoint(elements: IStageElement[], point: IPoint): IStageElement {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (element.isContainsPoint(point)) {
        return element;
      }
    }
  }

  /**
   * 计算组件旋转按钮的中心点
   * 
   * @param element 
   * @returns 
   */
  static calcElementRotatePoint(element: IStageElement): IPoint {
    const { boxPoints, centroid, rotationModel: { angle } } = element;
    const v1 = boxPoints[0];
    const v2 = boxPoints[3];
    const halfValue = Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2)) / 2;
    return MathUtils.calculateTargetPoint(centroid, halfValue + DefaultSelectionRotateDistance, angle);
  }
}