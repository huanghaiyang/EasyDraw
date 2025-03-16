import { DrawerMaskModelTypes, IPoint } from "@/types/index";
import { TransformerTypes } from "@/types/ITransformer";
import { AngleModel, FlipModel } from "@/types/IElement";

// 辅助画布绘制任务对象类型
export interface IMaskModel extends AngleModel, FlipModel {
  // 类型
  type: DrawerMaskModelTypes;
  // 点
  point?: IPoint;
  // 点
  points?: IPoint[];
  // 文本
  text?: string;
  // 半径
  radius?: number;
  // 组件
  element?: {
    // 变换器类型
    transformerType?: TransformerTypes;
    // 是否闭合
    isFold?: boolean;
  };
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
  points: IPoint[];
}
