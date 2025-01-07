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
import ElementLine from "@/modules/elements/ElementLine";
import ElementTaskLine from "@/modules/render/base/task/ElementTaskLine";
import { StrokeTypes } from "@/types/ElementStyles";
import PolygonUtils from "@/utils/PolygonUtils";

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
      case CreatorTypes.line: {
        task = new ElementTaskLine(element, params);
        break;
      }
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
  static calcStageRelativePoints(worldCoords: IPoint[], stageRect: DOMRect, stageWorldCoord: IPoint, stageScale: number): IPoint[] {
    return worldCoords.map(p => ElementUtils.calcStageRelativePoint(p, stageRect, stageWorldCoord, stageScale));
  }

  /**
   * 计算世界坐标在画布坐标系下的坐标
   * 
   * @param worldCoord 
   * @param stageRect 
   * @param stageWorldCoord 
   * @param stageScale 
   * @returns 
   */
  static calcStageRelativePoint(worldCoord: IPoint, stageRect: DOMRect, stageWorldCoord: IPoint, stageScale: number): IPoint {
    return {
      x: MathUtils.toFixed(worldCoord.x + (stageRect.width / 2) / stageScale - stageWorldCoord.x, 2),
      y: MathUtils.toFixed(worldCoord.y + (stageRect.height / 2) / stageScale - stageWorldCoord.y, 2)
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
  static calcWorldPoints(points: IPoint[], stageRect: DOMRect, stageWorldCoord: IPoint, stageScale: number): IPoint[] {
    return points.map(p => ElementUtils.calcWorldPoint(p, stageRect, stageWorldCoord, stageScale));
  }

  /**
   * 计算世界坐标
   * 
   * @param point 
   * @param stageRect 
   * @param stageWorldCoord 
   * @param stageScale 
   * @returns 
   */
  static calcWorldPoint(point: IPoint, stageRect: DOMRect, stageWorldCoord: IPoint, stageScale: number): IPoint {
    return {
      x: MathUtils.toFixed(point.x - (stageRect.width / 2) / stageScale + stageWorldCoord.x, 2),
      y: MathUtils.toFixed(point.y - (stageRect.height / 2) / stageScale + stageWorldCoord.y, 2)
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
      case CreatorTypes.line:
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
      case CreatorTypes.line: {
        return new ElementLine(model);
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
    const { pathPoints, centroid, rotation: { model: { angle, scale } } } = element;
    const v1 = pathPoints[0];
    const v2 = pathPoints[3];
    const halfValue = MathUtils.distanceBetweenPoints(v1, v2) / 2;
    return MathUtils.calculateTargetPoint(centroid, halfValue + DefaultSelectionRotateDistance * scale, angle);
  }

  /**
   * 计算组件位置
   * 
   * @param element 
   * @returns 
   */
  static calcPosition(model: Partial<ElementObject>): IPoint {
    switch (model.type) {
      case CreatorTypes.rectangle:
      case CreatorTypes.line: {
        return MathUtils.calcPolygonCentroid(model.coords);
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

  /**
   * 计算组件尺寸
   * 
   * @param coords 
   * @param type 
   * @returns 
   */
  static calcSize(model: Partial<ElementObject>): ISize {
    const { coords, type } = model;
    switch (type) {
      case CreatorTypes.rectangle: {
        return CommonUtils.calcRectangleSize(coords);
      }
      case CreatorTypes.line: {
        return {
          width: MathUtils.toFixed(MathUtils.distanceBetweenPoints(coords[0], coords[1]), 2),
          height: 0,
        }
      }
    }
  }

  /**
   * 修正旋转角度
   * 
   * @param angle 
   * @returns 
   */
  static fixAngle(angle: number): number {
    if (angle > 180) {
      angle = angle - 360;
    }
    return angle;
  }

  /**
   * 计算组件包含外边框宽度的坐标
   * 
   * @param points
   * @param strokeType
   * @param strokeWidth
   * @returns
   */
  static calcOutlinePoints(points: IPoint[], strokeType: StrokeTypes, strokeWidth: number): IPoint[] {
    if (strokeWidth && strokeType !== StrokeTypes.inside) {
      let r = strokeWidth / 2;
      if (strokeType === StrokeTypes.outside) {
        r = strokeWidth;
      }
      return PolygonUtils.getPolygonOuterVertices(points, r);
    }
    return points;
  }
}