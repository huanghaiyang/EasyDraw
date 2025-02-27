import IElement from "@/types/IElement";
import { IPoint } from "@/types/index";

// 控制器
export default interface IController {
  // 唯一标识
  id: string;
  // 是否激活
  isActive: boolean;
  // 角度
  get angle(): number;
  // 宿主
  host?: IElement;
  // 缩放
  get scale(): number;

  /**
   * 是否命中点
   * @param coord 点坐标
   */
  isCoordHitting(coord: IPoint): boolean;
}

// 点控制器
export interface IPointController extends IController, IPoint {
  // 宽度
  width: number;
  // 高度
  height: number;
  // 盒模型坐标
  points: IPoint[];
  // 是否包含点
  isContainsCoord(coord: IPoint): boolean;
}

// 线段控制器
export interface ISegmentController extends IController {
  // 起始点
  start: IPoint;
  // 结束点
  end: IPoint;
  // 是否接近
  isClosest(coord: IPoint): boolean;
}

// 圆角控制器
export interface ICornerController extends IPointController {}
