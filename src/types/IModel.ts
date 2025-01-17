import { DrawerMaskModelTypes, IPoint } from "@/types/index";
import { CreatorCategories } from "@/types/Creator";
import { TransformerTypes } from "@/types/IElementTransformer";

// 辅助画布绘制任务对象类型
export interface IMaskModel {
  type: DrawerMaskModelTypes;
  scale?: number;
  point?: IPoint;
  points?: IPoint[];
  angle?: number;
  text?: string;
  radius?: number;
  element?: {
    transformerType?: TransformerTypes;
    isFold?: boolean;
  }
}

// 辅助画布绘制任务光标对象
export interface IMaskCursorModel extends IMaskModel {
  creatorCategory: CreatorCategories;
}

export interface IIconModel extends IMaskModel {
  width: number;
  height: number;
}

// 组件旋转图标绘制任务对象
export interface IRotationModel extends IIconModel {
  vertices: IPoint[];
}