import { IPoint, ISize } from "@/types";
import ElementTaskRect from "@/modules/render/base/task/ElementTaskRect";
import CommonUtils from "@/utils/CommonUtils";
import ElementRect from "@/modules/elements/ElementRect";
import Element from "@/modules/elements/Element";
import MathUtils from "@/utils/MathUtils";
import IElement, { ElementObject } from "@/types/IElement";
import { IElementTask } from "@/types/IRenderTask";
import { CreatorTypes } from "@/types/Creator";
import { DefaultSelectionRotateDistance } from "@/types/MaskStyles";

export enum ElementReactionPropNames {
  isSelected = 'isSelected',
  isVisible = 'isVisible',
  isLocked = 'isLocked',
  isEditing = 'isEditing',
  isMoving = 'isMoving',
  isTransforming = 'isTransforming',
  isRotating = 'isRotating',
  isRotatingTarget = 'isRotatingTarget',
  isDragging = 'isDragging',
  isProvisional = 'isProvisional',
  isTarget = 'isTarget',
  isInRange = 'isInRange',
  isOnStage = 'isOnStage',
  status = 'status',
  position = 'position',
  width = 'width',
  height = 'height',
  angle = 'angle',
  strokeType = 'strokeType',
  strokeWidth = 'strokeWidth',
  strokeColor = 'strokeColor',
  strokeColorOpacity = 'strokeColorOpacity',
  fillColor = 'fillColor',
  fillColorOpacity = 'fillColorOpacity',
  fontSize = 'fontSize',
  fontFamily = 'fontFamily',
  textAlign = 'textAlign',
  textBaseline = 'textBaseline',
}

export enum ElementListEventNames {
  added,
  removed,
  updated,
  sizeChanged,
}

export default class ElementUtils {
  static createElementTask(element: IElement, params?: any): IElementTask {
    let task: IElementTask;
    switch (element.model.type) {
      case CreatorTypes.rectangle:
        task = new ElementTaskRect(element, params);
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
    return worldCoords.map(p => ElementUtils.calcStageRelativePoint(p, stageRect, stageWorldCoord));
  }

  static calcStageRelativePoint(point: IPoint, stageRect: DOMRect, stageWorldCoord: IPoint): IPoint {
    return {
      x: point.x + stageRect.width / 2 - stageWorldCoord.x,
      y: point.y + stageRect.height / 2 - stageWorldCoord.y
    }
  }

  /**
   * 计算世界坐标
   * 
   * @param points 
   * @param stageRect 
   * @param stageWorldCoord 
   * @returns 
   */
  static calcWorldPoints(points: IPoint[], stageRect: DOMRect, stageWorldCoord: IPoint): IPoint[] {
    return points.map(p => ElementUtils.calcWorldPoint(p, stageRect, stageWorldCoord));
  }

  static calcWorldPoint(point: IPoint, stageRect: DOMRect, stageWorldCoord: IPoint): IPoint {
    return {
      x: point.x - stageRect.width / 2 + stageWorldCoord.x,
      y: point.y - stageRect.height / 2 + stageWorldCoord.y
    }
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
  static createElement(model: ElementObject): IElement {
    const { type } = model;
    switch (type) {
      case CreatorTypes.rectangle: {
        return new ElementRect(model);
      }
      default:
        return new Element(model);
    }
  }

  /**
   * 给定一个坐标，选出最上层的那个组件
   * 
   * @param elements 
   * @param point 
   */
  static getTopAElementByPoint(elements: IElement[], point: IPoint): IElement {
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
  static calcElementRotatePoint(element: IElement): IPoint {
    const { pathPoints, centroid, rotationModel: { angle } } = element;
    const v1 = pathPoints[0];
    const v2 = pathPoints[3];
    const halfValue = MathUtils.distanceBetweenPoints(v1, v2) / 2;
    return MathUtils.calculateTargetPoint(centroid, halfValue + DefaultSelectionRotateDistance, angle);
  }

  /**
   * 计算矩形尺寸
   * 
   * @param coords 
   * @returns 
   */
  static calcRectangleSize(coords: IPoint[]): ISize {
    const width = MathUtils.toFixed(Math.abs(coords[0].x - coords[1].x));
    const height = MathUtils.toFixed(Math.abs(coords[0].y - coords[3].y));
    return { width, height };
  }

  /**
   * 计算组件位置
   * 
   * @param element 
   * @returns 
   */
  static calcPosition(model: Partial<ElementObject>): IPoint {
    switch (model.type) {
      case CreatorTypes.rectangle: {
        return CommonUtils.getBoxPoints(model.coords)[0]
      }
    }
  }

  /**
   * 移动坐标
   * 
   * @param coords 
   * @param offset 
   * @returns 
   */
  static translateCoords(coords: IPoint[], offset: IPoint): IPoint[] {
    return coords.map(p => {
      return {
        x: p.x + offset.x,
        y: p.y + offset.y
      }
    })
  }
}