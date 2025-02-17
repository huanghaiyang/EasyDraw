import { IPoint } from "@/types/index";
import IElement from "@/types/IElement";
import { IMaskModel } from "@/types/IModel";
import IStageShield from "@/types/IStageShield";
import IController from "@/types/IController";
import { IElementGroup } from "@/types/IElementGroup";

// 舞台选区
export default interface IStageSelection {
  // 舞台
  shield: IStageShield;
  // 选区范围
  rangeElement: IElementGroup;
  // 是否为空
  get isEmpty(): boolean;
  // 是否为鼠标范围选区
  get isRange(): boolean;

  // 选区模型
  get selectionModel(): IMaskModel;
  // 变换器模型
  get transformerModels(): IMaskModel[];
  // 中心点
  get center(): IPoint;
  // 获取内部角度
  get internalAngle(): number;

  // 设置范围
  setRange(points: IPoint[]): void;
  // 选区范围
  selectRange(): void;
  // 获取模型
  getModels(): IMaskModel[];
  // 选区目标
  selectTargets(): void;
  // 清除选区
  clearSelects(): void;
  // 命中目标组件
  hitTargetElements(point: IPoint): void;
  // 尝试激活控制器
  tryActiveController(point: IPoint): IController;
  // 获取激活控制器
  getActiveController(): IController;
  // 刷新范围组件
  refreshRangeElements(rangePoints: IPoint[]): void;
  // 获取点上组件
  getElementOnPoint(point: IPoint): IElement;
  // 计算选区模型
  calcSelectionModel(): IMaskModel;
  // 计算变换器模型
  calcTransformerModels(): IMaskModel[];
  // 刷新
  refresh(): void;
  // 刷新选区模型
  refreshSelectionModel(): void;
  // 刷新变换器模型
  refreshTransformerModels(): void;
  // 刷新范围组件
  refreshRangeElement(): void;
}
