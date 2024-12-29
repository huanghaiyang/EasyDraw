import { DrawerMaskModelTypes, IPoint } from "@/types/index";
import { CreatorCategories } from "@/types/Creator";

// 辅助画布绘制任务对象类型
export interface IMaskModel {
  type: DrawerMaskModelTypes;
}

// 辅助画布绘制任务选区对象
export interface IMaskSelectionModel extends IMaskModel {
  points: IPoint[];
  type: DrawerMaskModelTypes;
  angle?: number;
}

export interface IMaskSizeIndicatorModel extends IMaskModel {
  point: IPoint;
  text: string;
  angle: number;
}

// 辅助画布绘制任务选区控制器对象
export interface IMaskTransformerModel extends IMaskModel {
  point: IPoint;
  angle?: number;
}

// 辅助画布绘制任务光标对象
export interface IMaskCursorModel extends IMaskModel {
  point: IPoint;
  creatorCategory: CreatorCategories;
}

// 组件旋转图标绘制任务对象
export interface IRotationModel extends IMaskModel {
  point: IPoint;
  width: number;
  height: number;
  angle: number;
  vertices: IPoint[];
}