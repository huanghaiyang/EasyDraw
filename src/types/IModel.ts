import { DrawerMaskModelTypes, IPoint } from "@/types/index";
import { CreatorCategories } from "@/types/Creator";
import { TransformerTypes } from "@/types/ITransformer";

// 辅助画布绘制任务对象类型
export interface IMaskModel {
  // 类型
  type: DrawerMaskModelTypes;
  // 比例
  scale?: number;
  // 点
  point?: IPoint;
  // 点
  points?: IPoint[];
  // 角度
  angle?: number;
  // 文本
  text?: string;
  // 半径
  radius?: number;
  // 元素
  element?: {
    // 变换器类型
    transformerType?: TransformerTypes;
    // 是否闭合
    isFold?: boolean;
  }
}

// 辅助画布绘制任务光标对象
export interface IMaskCursorModel extends IMaskModel {
  // 创建器类型
  creatorCategory: CreatorCategories;
}

// 图标模型
export interface IIconModel extends IMaskModel {
  // 宽度
  width: number;
  // 高度
  height: number;
}

// 组件旋转图标绘制任务对象
export interface IRotationModel extends IIconModel {
  // 顶点
  vertices: IPoint[];
}