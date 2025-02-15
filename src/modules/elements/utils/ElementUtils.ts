import { IPoint, ISize } from "@/types";
import ElementTaskRect from "@/modules/render/shield/task/ElementTaskRect";
import CommonUtils from "@/utils/CommonUtils";
import ElementRect from "@/modules/elements/ElementRect";
import Element from "@/modules/elements/Element";
import MathUtils from "@/utils/MathUtils";
import IElement, {
  AngleModel,
  DefaultAngleModel,
  ElementObject,
} from "@/types/IElement";
import { IElementTask } from "@/types/IRenderTask";
import { CreatorTypes } from "@/types/Creator";
import { SelectionRotationMargin } from "@/styles/MaskStyles";
import ElementLine from "@/modules/elements/ElementLine";
import ElementTaskLine from "@/modules/render/shield/task/ElementTaskLine";
import { StrokeStyle, StrokeTypes } from "@/styles/ElementStyles";
import PolygonUtils from "@/utils/PolygonUtils";
import ElementImage from "@/modules/elements/ElementImage";
import ElementTaskImage from "@/modules/render/shield/task/ElementTaskImage";
import IStageShield, { StageCalcParams } from "@/types/IStageShield";
import ElementTaskArbitrary from "@/modules/render/shield/task/ElementTaskArbitrary";
import ElementArbitrary from "@/modules/elements/ElementArbitrary";
import { RenderParams } from "@/types/IRender";
import ArbitraryUtils from "@/utils/ArbitraryUtils";
import ElementGroup from "@/modules/elements/ElementGroup";
import ElementText from "@/modules/elements/ElementText";
import { multiply } from "mathjs";

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
  position = "position",
  width = "width",
  height = "height",
  angle = "angle",
  flipX = "flipX",
  leanYAngle = "leanYAngle",
  strokes = "strokes",
  fills = "fills",
  fontSize = "fontSize",
  fontFamily = "fontFamily",
  textAlign = "textAlign",
  textBaseline = "textBaseline",
  isRatioLocked = "isRatioLocked",
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
      case CreatorTypes.image: {
        task = new ElementTaskImage(element, params);
        break;
      }
      case CreatorTypes.line: {
        task = new ElementTaskLine(element, params);
        break;
      }
      case CreatorTypes.arbitrary: {
        task = new ElementTaskArbitrary(element, params);
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
   * @param params
   * @returns
   */
  static calcStageRelativePoints(
    worldCoords: IPoint[],
    params: StageCalcParams,
  ): IPoint[] {
    return worldCoords.map(p => ElementUtils.calcStageRelativePoint(p, params));
  }

  /**
   * 计算世界坐标在画布坐标系下的坐标
   *
   * @param worldCoord
   * @param params
   * @returns
   */
  static calcStageRelativePoint(
    worldCoord: IPoint,
    params: StageCalcParams,
  ): IPoint {
    return {
      x: MathUtils.preciseToFixed(
        worldCoord.x +
          params.rect.width / 2 / params.scale -
          params.worldCoord.x,
        2,
      ),
      y: MathUtils.preciseToFixed(
        worldCoord.y +
          params.rect.height / 2 / params.scale -
          params.worldCoord.y,
        2,
      ),
    };
  }

  /**
   * 计算世界坐标
   *
   * @param points
   * @param params
   * @returns
   */
  static calcWorldPoints(points: IPoint[], params: StageCalcParams): IPoint[] {
    return points.map(p => ElementUtils.calcWorldPoint(p, params));
  }

  /**
   * 计算世界坐标
   *
   * @param point
   * @param params
   * @returns
   */
  static calcWorldPoint(point: IPoint, params: StageCalcParams): IPoint {
    return {
      x: MathUtils.preciseToFixed(
        point.x - params.rect.width / 2 / params.scale + params.worldCoord.x,
        2,
      ),
      y: MathUtils.preciseToFixed(
        point.y - params.rect.height / 2 / params.scale + params.worldCoord.y,
        2,
      ),
    };
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
      case CreatorTypes.image:
      case CreatorTypes.arbitrary:
      case CreatorTypes.text:
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
    const {
      center,
      rotation: {
        model: { angle, scale },
      },
      model: { height },
    } = element;
    return MathUtils.calcTargetPoint(
      center,
      height / 2 + SelectionRotationMargin * scale,
      angle,
    );
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
      case CreatorTypes.arbitrary:
      case CreatorTypes.text:
      case CreatorTypes.group: {
        return MathUtils.calcCenter(model.coords);
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
        y: p.y + offset.y,
      };
    });
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
      case CreatorTypes.arbitrary: {
        return CommonUtils.calcRectangleSize(boxCoords);
      }
      case CreatorTypes.line: {
        return {
          width: MathUtils.preciseToFixed(
            MathUtils.calcDistance(coords[0], coords[1]),
            2,
          ),
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
   * @param points
   * @param strokeType
   * @param strokeWidth
   * @param options
   * @returns
   */
  static calcOutlinePoints(
    points: IPoint[],
    strokeType: StrokeTypes,
    strokeWidth: number,
    options: RenderParams,
  ): IPoint[] {
    if (strokeWidth && strokeType !== StrokeTypes.inside) {
      let r = strokeWidth / 2;
      if (strokeType === StrokeTypes.outside) {
        r = strokeWidth;
      }
      const { flipX, flipY } = options;
      return flipX !== flipY
        ? ArbitraryUtils.getArbitraryInnerVertices(points, r, options)
        : ArbitraryUtils.getArbitraryOuterVertices(points, r, options);
    }
    return points;
  }

  /**
   * 给定一个矩形的宽高，将其完全放入舞台中，计算世界坐标
   *
   * @param width
   * @param height
   * @param params
   * @param padding
   * @returns
   */
  static calcRectangleCoordsInStage(
    width: number,
    height: number,
    params: StageCalcParams,
    padding: number = 0,
  ): IPoint[] {
    let { width: innerWidth, height: innerHeight } =
      CommonUtils.calcRectangleSizeInRect(
        width,
        height,
        CommonUtils.scaleRect(params.rect, 1 / params.scale),
        padding / params.scale,
      );
    innerWidth = MathUtils.preciseToFixed(innerWidth * params.scale, 2);
    innerHeight = MathUtils.preciseToFixed(innerHeight * params.scale, 2);
    const points = CommonUtils.calcCenterInnerRectPoints(
      { width: innerWidth, height: innerHeight },
      params.rect,
    );
    return ElementUtils.calcWorldPoints(points, params);
  }

  /**
   * 计算自由绘制非闭合线框区块
   *
   * @param points
   * @param styles
   * @param isFold
   * @returns
   */
  static calcNoFoldArbitraryBorderRegions(
    points: IPoint[],
    strokeStyle: StrokeStyle,
  ): IPoint[][] {
    const { width } = strokeStyle;
    const result: IPoint[][] = [];
    points.forEach((current, index) => {
      if (index < points.length - 1) {
        const next = points[index + 1];
        result.push(
          PolygonUtils.calcBentLineOuterVertices([current, next], width / 2),
        );
        if (index !== 0) {
          const prev = points[index - 1];
          result.push(
            ElementUtils.calc3PArbitraryBorderRegions(
              prev,
              current,
              next,
              strokeStyle,
            ),
          );
        }
      }
    });
    return result;
  }

  /**
   * 计算自由绘制闭合线框区块
   *
   * @param points
   * @param styles
   * @returns
   */
  static calcFoldArbitraryBorderRegions(
    points: IPoint[],
    strokeStyle: StrokeStyle,
  ): IPoint[][] {
    const { width } = strokeStyle;
    const result: IPoint[][] = [];
    points.forEach((current, index) => {
      const prev = CommonUtils.getPrevOfArray(points, index);
      const next = CommonUtils.getNextOfArray(points, index);
      result.push(
        PolygonUtils.calcBentLineOuterVertices([current, next], width / 2),
      );
      result.push(
        ElementUtils.calc3PArbitraryBorderRegions(
          prev,
          current,
          next,
          strokeStyle,
        ),
      );
    });
    return result;
  }

  /**
   * 计算自由绘制线框区块
   *
   * @param points
   * @param styles
   * @param isFold
   * @returns
   */
  static calcArbitraryBorderRegions(
    points: IPoint[],
    strokeStyle: StrokeStyle,
    isFold: boolean,
  ): IPoint[][] {
    if (isFold)
      return ElementUtils.calcFoldArbitraryBorderRegions(points, strokeStyle);
    return ElementUtils.calcNoFoldArbitraryBorderRegions(points, strokeStyle);
  }

  /**
   * 计算三角区块（斜接区块）
   *
   * @param prev
   * @param current
   * @param next
   * @param styles
   */
  static calc3PArbitraryBorderRegions(
    prev: IPoint,
    current: IPoint,
    next: IPoint,
    strokeStyle: StrokeStyle,
  ): IPoint[] {
    // 描边宽度
    const { width } = strokeStyle;
    // 是否顺时针
    const isClockwise = MathUtils.isPointClockwise(next, prev, current);
    // 三角形角度
    const angle = MathUtils.calcTriangleAngle(prev, current, next);
    // 三角形角度的一半
    const aAngle = (180 - angle) / 2;
    // 计算三角形第三边长度
    const pcAngle = MathUtils.calcAngle(prev, current);
    // 计算三角形第三边长度
    const side3Length = MathUtils.calcTriangleSide3By2(aAngle, width / 2);
    // 计算三角形第三边终点
    const point = MathUtils.calcTargetPoint(
      current,
      side3Length,
      pcAngle + (isClockwise ? -aAngle : aAngle),
    );
    // 计算三角形区域
    const region: IPoint[] = [];
    region.push(current);
    region.push(MathUtils.calcTargetPoint(current, width / 2, pcAngle - 90));
    region.push(point);
    region.push(
      MathUtils.calcTargetPoint(
        current,
        width / 2,
        MathUtils.calcAngle(next, current) + 90,
      ),
    );
    return region;
  }

  /**
   * 通过旋转坐标计算旋转前的坐标
   *
   * @param rotatePoints
   * @param angles
   * @param lockPoint
   * @param params
   * @returns
   */
  static calcCoordsByTransPathPoints(
    rotatePoints: IPoint[],
    angles: Partial<AngleModel>,
    lockPoint: IPoint,
    params: StageCalcParams,
  ): IPoint[] {
    // 计算中心点
    let center = MathUtils.calcCenter(
      rotatePoints.map(point =>
        MathUtils.transWithCenter(point, angles, lockPoint, true),
      ),
    );
    // 计算旋转后的中心点
    center = MathUtils.transWithCenter(center, angles, lockPoint);
    // 计算中心点世界坐标
    const newCenterCoord = ElementUtils.calcWorldPoint(center, params);
    // 计算旋转后的坐标
    const rotateCoords = ElementUtils.calcWorldPoints(rotatePoints, params);
    // 计算旋转后的坐标
    return rotateCoords.map(point =>
      MathUtils.rotateWithCenter(point, -angles.angle, newCenterCoord),
    );
  }

  /**
   * 通过旋转坐标计算旋转前的坐标
   *
   * @param rotatePoints
   * @param angle
   * @param lockPoint
   * @param params
   * @returns
   */
  static calcCoordsByRotatePathPoints(
    rotatePoints: IPoint[],
    angle: number,
    lockPoint: IPoint,
    params: StageCalcParams,
  ): IPoint[] {
    // 计算中心点
    let center = MathUtils.calcCenter(
      rotatePoints.map(point =>
        MathUtils.rotateWithCenter(point, -angle, lockPoint),
      ),
    );
    // 计算旋转后的中心点
    center = MathUtils.rotateWithCenter(center, angle, lockPoint);
    // 计算中心点世界坐标
    const newCenterCoord = ElementUtils.calcWorldPoint(center, params);
    // 计算旋转后的坐标
    const rotateCoords = ElementUtils.calcWorldPoints(rotatePoints, params);
    // 计算旋转后的坐标
    return rotateCoords.map(point =>
      MathUtils.rotateWithCenter(point, -angle, newCenterCoord),
    );
  }

  /**
   * 将给定点还原为未变形前的坐标并按照给定的矩阵进行变形
   *
   * @param point
   * @param matrix
   * @param lockPoint
   * @param angles
   * @returns
   */
  static normalizeMatrixPoint(
    point: IPoint,
    matrix: number[][],
    lockPoint: IPoint,
    angles: Partial<AngleModel>,
  ): IPoint {
    // 坐标重新按照角度反向偏转
    point = MathUtils.transWithCenter(point, angles, lockPoint, true);
    // 以不动点为圆心，计算形变
    const [x, y] = multiply(matrix, [
      point.x - lockPoint.x,
      point.y - lockPoint.y,
      1,
    ]);
    // 重新计算坐标
    return { x: x + lockPoint.x, y: y + lockPoint.y };
  }

  /**
   * 计算矩阵变换后的点
   *
   * @param point
   * @param matrix
   * @param lockPoint
   * @param angles
   * @returns
   */
  static calcMatrixPoint(
    point: IPoint,
    matrix: number[][],
    lockPoint: IPoint,
    angles: Partial<AngleModel>,
  ): IPoint {
    // 还原并计算
    const normalizedPoint = ElementUtils.normalizeMatrixPoint(
      point,
      matrix,
      lockPoint,
      angles,
    );
    // 坐标重新按照角度偏转
    return MathUtils.transWithCenter(normalizedPoint, angles, lockPoint);
  }

  /**
   * 计算矩阵变换后的点
   *
   * @param points
   * @param matrix
   * @param lockPoint
   * @param angles
   * @returns
   */
  static calcMatrixPoints(
    points: IPoint[],
    matrix: number[][],
    lockPoint: IPoint,
    angles: Partial<AngleModel>,
  ): IPoint[] {
    return points.map(point =>
      ElementUtils.calcMatrixPoint(point, matrix, lockPoint, angles),
    );
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
  static createEmptyGroupObject(): ElementObject {
    return {
      id: CommonUtils.getRandomDateId(),
      subIds: new Set(),
      coords: [],
      boxCoords: [],
      width: 0,
      height: 0,
      styles: {
        strokes: [],
      },
      x: 0,
      y: 0,
      type: CreatorTypes.group,
      ...DefaultAngleModel,
    };
  }
}
