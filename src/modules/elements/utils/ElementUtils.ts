import { IPoint, ISize } from "@/types";
import ElementTaskRect from "@/modules/render/shield/task/ElementTaskRect";
import CommonUtils from "@/utils/CommonUtils";
import ElementRect from "@/modules/elements/ElementRect";
import Element from "@/modules/elements/Element";
import MathUtils from "@/utils/MathUtils";
import IElement, { AngleModel, DefaultAngleModel, DefaultCornerModel, ElementObject } from "@/types/IElement";
import { IElementTask } from "@/types/IRenderTask";
import { CreatorTypes } from "@/types/Creator";
import { SelectionRotationMargin } from "@/styles/MaskStyles";
import ElementLine from "@/modules/elements/ElementLine";
import ElementTaskLine from "@/modules/render/shield/task/ElementTaskLine";
import { StrokeStyle, StrokeTypes } from "@/styles/ElementStyles";
import PolygonUtils from "@/utils/PolygonUtils";
import ElementImage from "@/modules/elements/ElementImage";
import ElementTaskImage from "@/modules/render/shield/task/ElementTaskImage";
import IStageShield from "@/types/IStageShield";
import ElementTaskArbitrary from "@/modules/render/shield/task/ElementTaskArbitrary";
import ElementArbitrary from "@/modules/elements/ElementArbitrary";
import { ArcPoints, RenderParams } from "@/types/IRender";
import ArbitraryUtils from "@/utils/ArbitraryUtils";
import ElementGroup from "@/modules/elements/ElementGroup";
import ElementText from "@/modules/elements/ElementText";
import { clamp, range } from "lodash";
import ElementTaskEllipse from "@/modules/render/shield/task/ElementTaskEllipse";
import ElementEllipse from "@/modules/elements/ElementEllipse";
import ImageUtils from "@/utils/ImageUtils";
import ElementTaskText from "@/modules/render/shield/task/ElementTaskText";

export enum ElementReactionPropNames {
  isSelected = "isSelected",
  isVisible = "isVisible",
  isLocked = "isLocked",
  isEditing = "isEditing",
  isMoving = "isMoving",
  isTransforming = "isTransforming",
  isRotating = "isRotating",
  isRotatingTarget = "isRotatingTarget",
  isDragging = "isDragging",
  isProvisional = "isProvisional",
  isTarget = "isTarget",
  isInRange = "isInRange",
  isOnStage = "isOnStage",
  status = "status",
  isRatioLocked = "isRatioLocked",
}

export enum ElementListEventNames {
  added,
  removed,
}

export default class ElementUtils {
  static createElementTask(element: IElement, canvas: HTMLCanvasElement): IElementTask {
    let task: IElementTask;
    switch (element.model.type) {
      case CreatorTypes.rectangle:
        task = new ElementTaskRect(element, canvas);
        break;
      case CreatorTypes.image: {
        task = new ElementTaskImage(element, canvas);
        break;
      }
      case CreatorTypes.line: {
        task = new ElementTaskLine(element, canvas);
        break;
      }
      case CreatorTypes.ellipse: {
        task = new ElementTaskEllipse(element, canvas);
        break;
      }
      case CreatorTypes.arbitrary: {
        task = new ElementTaskArbitrary(element, canvas);
        break;
      }
      case CreatorTypes.text: {
        task = new ElementTaskText(element, canvas);
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
   * @param coords
   * @returns
   */
  static calcStageRelativePoints(coords: IPoint[]): IPoint[] {
    return coords.map(p => ElementUtils.calcStageRelativePoint(p));
  }

  /**
   * 批量计算世界坐标在画布坐标系下的坐标
   *
   * @param coords
   * @returns
   */
  static batchCalcStageRelativePoints(coords: IPoint[][]): IPoint[][] {
    return coords.map(coords => ElementUtils.calcStageRelativePoints(coords));
  }

  /**
   * 计算世界坐标在画布坐标系下的坐标
   *
   * @param coord
   * @returns
   */
  static calcStageRelativePoint(coord: IPoint): IPoint {
    const {
      rect: { width, height },
      scale,
      worldCoord: { x, y },
    } = window.shield.stageCalcParams;
    return {
      x: coord.x + width / 2 / scale - x,
      y: coord.y + height / 2 / scale - y,
    };
  }

  /**
   * 计算世界坐标
   *
   * @param points
   * @returns
   */
  static calcWorldCoords(points: IPoint[]): IPoint[] {
    return points.map(p => ElementUtils.calcWorldCoord(p));
  }

  /**
   * 计算世界坐标
   *
   * @param point
   * @returns
   */
  static calcWorldCoord(point: IPoint): IPoint {
    const {
      rect: { width, height },
      scale,
      worldCoord: { x, y },
    } = window.shield.stageCalcParams;
    return {
      x: point.x - width / 2 / scale + x,
      y: point.y - height / 2 / scale + y,
    };
  }

  /**
   * 在绘制图形时补全缺省点
   *
   * @param points
   * @param creatorType
   * @returns
   */
  static calcCreatorPoints(points: IPoint[], creatorType: CreatorTypes): IPoint[] {
    switch (creatorType) {
      case CreatorTypes.rectangle:
      case CreatorTypes.image:
      case CreatorTypes.arbitrary:
      case CreatorTypes.text:
      case CreatorTypes.ellipse:
      case CreatorTypes.group:
        return CommonUtils.getBoxPoints(points);
      default:
        return points;
    }
  }

  /**
   * 根据对象创建组件
   *
   * @param model
   * @returns
   */
  static createElement(model: ElementObject, shield: IStageShield): IElement {
    const { type } = model;
    switch (type) {
      case CreatorTypes.rectangle: {
        return new ElementRect(model, shield);
      }
      case CreatorTypes.line: {
        return new ElementLine(model, shield);
      }
      case CreatorTypes.ellipse: {
        return new ElementEllipse(model, shield);
      }
      case CreatorTypes.image: {
        return new ElementImage(model, shield);
      }
      case CreatorTypes.arbitrary: {
        return new ElementArbitrary(model, shield);
      }
      case CreatorTypes.text: {
        return new ElementText(model, shield);
      }
      case CreatorTypes.group: {
        return new ElementGroup(model, shield);
      }
      case CreatorTypes.image: {
        return new ElementImage(model, shield);
      }
      default:
        return new Element(model, shield);
    }
  }

  /**
   * 给定一个坐标，选出最上层的那个组件
   *
   * @param elements
   * @param point
   */
  static getTopAElementByCoord(elements: IElement[], point: IPoint): IElement {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (element.isContainsCoord(point)) {
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
    const {
      centerCoord,
      rotation: { angle, scale },
      model: { height },
    } = element;
    return MathUtils.calcTargetPoint(centerCoord, height / 2 + SelectionRotationMargin * scale, angle);
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
      case CreatorTypes.image:
      case CreatorTypes.line:
      case CreatorTypes.ellipse:
      case CreatorTypes.arbitrary:
      case CreatorTypes.text:
      case CreatorTypes.group: {
        return MathUtils.calcCenter(model.coords);
      }
    }
  }

  /**
   * 计算组件尺寸
   *
   * @param coords
   * @param type
   * @returns
   */
  static calcSize(model: Partial<ElementObject>): ISize {
    const { coords, boxCoords, type } = model;
    switch (type) {
      case CreatorTypes.rectangle:
      case CreatorTypes.text:
      case CreatorTypes.group:
      case CreatorTypes.image:
      case CreatorTypes.ellipse:
      case CreatorTypes.arbitrary: {
        return CommonUtils.calcRectangleSize(boxCoords);
      }
      case CreatorTypes.line: {
        return {
          width: MathUtils.precise(MathUtils.calcDistance(coords[0], coords[1]), 2),
          height: 0,
        };
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
   * @param coords
   * @param strokeType
   * @param strokeWidth
   * @param options
   * @returns
   */
  static calcOutlinePoints(coords: IPoint[], strokeType: StrokeTypes, strokeWidth: number, options: RenderParams): IPoint[] {
    if (strokeWidth && strokeType !== StrokeTypes.inside) {
      let r = strokeWidth / 2;
      if (strokeType === StrokeTypes.outside) {
        r = strokeWidth;
      }
      const { flipX, flipY } = options;
      return flipX !== flipY ? ArbitraryUtils.getArbitraryInnerVertices(coords, r, options) : ArbitraryUtils.getArbitraryOuterVertices(coords, r, options);
    }
    return coords;
  }

  /**
   * 计算自由绘制非闭合线框区块
   *
   * @param coords
   * @param styles
   * @param isFold
   * @returns
   */
  static calcNoFoldArbitraryBorderRegions(coords: IPoint[], strokeStyle: StrokeStyle): IPoint[][] {
    const { width } = strokeStyle;
    const result: IPoint[][] = [];
    coords.forEach((current, index) => {
      if (index < coords.length - 1) {
        const next = coords[index + 1];
        result.push(PolygonUtils.calcBentLineOuterVertices([current, next], width / 2));
        if (index !== 0) {
          const prev = coords[index - 1];
          result.push(ElementUtils.calc3PArbitraryBorderRegions(prev, current, next, strokeStyle));
        }
      }
    });
    return result;
  }

  /**
   * 计算自由绘制闭合线框区块
   *
   * @param coords
   * @param styles
   * @returns
   */
  static calcFoldArbitraryBorderRegions(coords: IPoint[], strokeStyle: StrokeStyle): IPoint[][] {
    const { width } = strokeStyle;
    const result: IPoint[][] = [];
    coords.forEach((current, index) => {
      const prev = CommonUtils.getPrevOfArray(coords, index);
      const next = CommonUtils.getNextOfArray(coords, index);
      result.push(PolygonUtils.calcBentLineOuterVertices([current, next], width / 2));
      result.push(ElementUtils.calc3PArbitraryBorderRegions(prev, current, next, strokeStyle));
    });
    return result;
  }

  /**
   * 计算自由绘制线框区块
   *
   * @param coords
   * @param styles
   * @param isFold
   * @returns
   */
  static calcArbitraryBorderRegions(coords: IPoint[], strokeStyle: StrokeStyle, isFold: boolean): IPoint[][] {
    if (isFold) return ElementUtils.calcFoldArbitraryBorderRegions(coords, strokeStyle);
    return ElementUtils.calcNoFoldArbitraryBorderRegions(coords, strokeStyle);
  }

  /**
   * 计算三角区块（斜接区块）
   *
   * @param prev
   * @param current
   * @param next
   * @param styles
   */
  static calc3PArbitraryBorderRegions(prev: IPoint, current: IPoint, next: IPoint, strokeStyle: StrokeStyle): IPoint[] {
    // 描边宽度
    const { width } = strokeStyle;
    // 是否顺时针
    const isClockwise = MathUtils.isPointClockwiseOfLine(next, prev, current);
    // 三角形角度
    const angle = MathUtils.calcTriangleAngle(prev, current, next);
    // 三角形角度的一半
    const aAngle = (180 - angle) / 2;
    // 计算三角形第三边长度
    const pcAngle = MathUtils.calcAngle(prev, current);
    // 计算三角形第三边长度
    const side3Length = MathUtils.calcTriangleSide3By2(aAngle, width / 2);
    // 计算三角形第三边终点
    const point = MathUtils.calcTargetPoint(current, side3Length, pcAngle + (isClockwise ? -aAngle : aAngle));
    // 计算三角形区域
    const region: IPoint[] = [];
    region.push(current);
    region.push(MathUtils.calcTargetPoint(current, width / 2, pcAngle - 90));
    region.push(point);
    region.push(MathUtils.calcTargetPoint(current, width / 2, MathUtils.calcAngle(next, current) + 90));
    return region;
  }

  /**
   * 通过旋转坐标计算旋转前的坐标
   *
   * @param rotateCoords
   * @param angles
   * @param lockCoord
   * @param params
   * @returns
   */
  static calcCoordsByTransPoints(rotateCoords: IPoint[], angles: Partial<AngleModel>, lockCoord: IPoint): IPoint[] {
    // 计算中心点
    const centerCoord = MathUtils.calcCenter(rotateCoords.map(point => MathUtils.transWithCenter(point, angles, lockCoord, true)));
    // 计算旋转后的中心点
    const newCenterCoord = MathUtils.transWithCenter(centerCoord, angles, lockCoord);
    // 计算旋转后的坐标
    return rotateCoords.map(point => MathUtils.rotateWithCenter(point, -angles.angle, newCenterCoord));
  }

  /**
   * 通过旋转坐标计算旋转前的坐标
   *
   * @param rotateCoords
   * @param angle
   * @param lockCoord
   * @param params
   * @returns
   */
  static calcCoordsByRotatePoints(rotateCoords: IPoint[], angle: number, lockCoord: IPoint): IPoint[] {
    // 计算中心点
    let centerCoord = MathUtils.calcCenter(rotateCoords.map(point => MathUtils.rotateWithCenter(point, -angle, lockCoord)));
    // 计算旋转后的中心点
    const newCenterCoord = MathUtils.rotateWithCenter(centerCoord, angle, lockCoord);
    // 计算旋转后的坐标
    return rotateCoords.map(point => MathUtils.rotateWithCenter(point, -angle, newCenterCoord));
  }

  /**
   * 将给定点还原为未变形前的坐标并按照给定的矩阵进行变形
   *
   * @param coord
   * @param matrix
   * @param lockCoord
   * @param angles
   * @returns
   */
  static normalizeMatrixPoint(coord: IPoint, matrix: number[][], lockCoord: IPoint, angles: Partial<AngleModel>): IPoint {
    // 坐标重新按照角度反向偏转
    coord = MathUtils.transWithCenter(coord, angles, lockCoord, true);
    // 以不动点为圆心，计算形变
    const [x, y] = MathUtils.multiply(matrix, [coord.x - lockCoord.x, coord.y - lockCoord.y, 1]);
    // 重新计算坐标
    return { x: x + lockCoord.x, y: y + lockCoord.y };
  }

  /**
   * 计算矩阵变换后的点
   *
   * @param coord
   * @param matrix
   * @param lockCoord
   * @param angles
   * @returns
   */
  static calcMatrixPoint(coord: IPoint, matrix: number[][], lockCoord: IPoint, angles: Partial<AngleModel>): IPoint {
    // 还原并计算
    const normalizedCoord = ElementUtils.normalizeMatrixPoint(coord, matrix, lockCoord, angles);
    // 坐标重新按照角度偏转
    return MathUtils.transWithCenter(normalizedCoord, angles, lockCoord);
  }

  /**
   * 计算矩阵变换后的点
   *
   * @param coords
   * @param matrix
   * @param lockCoord
   * @param angles
   * @returns
   */
  static calcMatrixPoints(coords: IPoint[], matrix: number[][], lockCoord: IPoint, angles: Partial<AngleModel>): IPoint[] {
    return coords.map(coord => ElementUtils.calcMatrixPoint(coord, matrix, lockCoord, angles));
  }

  /**
   * 判定给定的组件是否属于同一个组合
   *
   * @param elements
   */
  static isSameAncestorGroup(elements: IElement[]): boolean {
    if (elements.length <= 1) return true;
    const ancestorGroup = ElementUtils.getAncestorGroup(elements);
    return ancestorGroup !== null;
  }

  /**
   * 获取选中的根组件
   *
   * @param elements
   */
  static getAncestorGroup(elements: IElement[]): IElement {
    if (elements.length === 0) return null;
    const noParentElements = ElementUtils.getNoParentElements(elements);
    if (noParentElements.length > 1) return null;
    return noParentElements[0];
  }

  /**
   * 获取非组合组件
   *
   * @param elements
   */
  static getNoParentElements(elements: IElement[]): IElement[] {
    return elements.filter(element => !element.isGroupSubject);
  }

  /**
   * 创建组合对象
   */
  static createEmptyGroupObject(): Partial<ElementObject> {
    return {
      ...ElementUtils.createEmptyObject(),
      type: CreatorTypes.group,
    };
  }

  /**
   * 创建空对象
   */
  static createEmptyObject(): Partial<ElementObject> {
    const id = CommonUtils.getDateId();
    return {
      id: `${id}`,
      subIds: [],
      coords: [],
      boxCoords: [],
      width: 0,
      height: 0,
      styles: {
        strokes: [],
      },
      x: 0,
      y: 0,
      ...DefaultAngleModel,
      ...DefaultCornerModel,
    };
  }

  /**
   * 修正圆角
   *
   * @param values
   * @param minSize
   * @returns
   */
  static fixCornersBasedOnMinSize(values: number[], minSize: number): number[] {
    range(4).forEach(index => {
      if (values[index] === 0) return;
      values[index] = clamp(values[index], 0, minSize / 2);
    });
    return values;
  }

  /**
   * 转换JSON
   *
   * @param elementsJson
   * @returns
   */
  static convertElementsJson(elementsJson: Array<ElementObject>): Array<ElementObject> {
    const models = elementsJson as unknown as Array<ElementObject>;
    const modelsMap: Map<String, ElementObject> = new Map();
    const ids: number[] = [];
    const timestamp = CommonUtils.getDateId();
    models.forEach((model, index) => {
      modelsMap.set(model.id, model);
      ids.push(timestamp + index);
    });
    models.forEach((model, index) => {
      ElementUtils.reBindGroup(model, modelsMap, `${ids[index]}`);
      ElementUtils.divateCoords(model, 40);
    });
    return models;
  }

  /**
   * 重新绑定组合关系
   *
   * @param model
   * @param modelsMap
   */
  static reBindGroup(model: ElementObject, modelsMap: Map<String, ElementObject>, newId: string): void {
    const { subIds, groupId, id } = model;
    model.id = newId;
    modelsMap.set(newId, model);
    modelsMap.delete(id);

    if (subIds) {
      subIds.forEach(subId => {
        const subModel = modelsMap.get(subId);
        if (subModel) {
          subModel.groupId = newId;
        }
      });
    }
    if (groupId) {
      const group = modelsMap.get(groupId);
      if (group) {
        const index = group.subIds.indexOf(id);
        if (index === -1) return;
        group.subIds.splice(index, 1, newId);
      }
    }
  }

  /**
   * 使组件偏移
   *
   * @param model
   * @param dValue
   * @returns
   */
  static divateCoords(model: ElementObject, dValue: number): ElementObject {
    const { coords, boxCoords } = model;
    model.x += dValue;
    model.y += dValue;
    model.coords = MathUtils.batchTranslate(coords, { x: dValue, y: dValue });
    model.boxCoords = MathUtils.batchTranslate(boxCoords, {
      x: dValue,
      y: dValue,
    });
    return model;
  }

  /**
   * 转换组件模型
   *
   * @param model
   * @returns
   */
  static async convertElementModel(model: ElementObject): Promise<ElementObject> {
    const { type, data } = model;
    switch (type) {
      case CreatorTypes.image: {
        model.data = await ImageUtils.createImageFromUrl(data as string);
      }
      default:
        break;
    }
    return model;
  }

  /**
   * 计算arc舞台坐标
   *
   * @param arc
   * @returns
   */
  static calcStageRelativeArcPoint(arc: ArcPoints): ArcPoints {
    let { start, end, controller, corner, value } = arc;
    [start, end, controller, corner] = ElementUtils.calcStageRelativePoints([start, end, controller, corner]);
    return {
      start,
      end,
      controller,
      corner,
      value,
    };
  }

  /**
   * 批量计算arc舞台坐标
   *
   * @param arcCoords
   * @returns
   */
  static calcStageRelativeArcPoints(arcCoords: ArcPoints[]): ArcPoints[] {
    return arcCoords.map(arc => ElementUtils.calcStageRelativeArcPoint(arc));
  }

  /**
   * 批量计算arc舞台坐标
   *
   * @param arcCoords
   * @returns
   */
  static batchCalcStageRelativeArcPoints(arcCoords: ArcPoints[][]): ArcPoints[][] {
    return arcCoords.map(coords => ElementUtils.calcStageRelativeArcPoints(coords));
  }
}
