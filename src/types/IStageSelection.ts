import { IPoint } from "@/types/index";
import IElement from "@/types/IElement";
import { IMaskModel } from "@/types/IModel";
import IElementRotation from "@/types/IElementRotation";
import IStageShield from "@/types/IStageShield";
import { IVerticesTransformer } from "@/types/ITransformer";
import { IBorderTransformer } from "@/types/ITransformer";
import IController, { IPointController } from "@/types/IController";
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
  // 尝试激活组件旋转
  tryActiveElementRotation(point: IPoint): IElementRotation;
  // 尝试激活组件变换
  tryActiveElementTransformer(point: IPoint): IVerticesTransformer;
  // 尝试激活组件边框变换
  tryActiveElementBorderTransformer(point: IPoint): IBorderTransformer;
  // 尝试激活通用控制器
  tryActiveCommonController(point: IPoint): IVerticesTransformer;
  // 清除组件变换
  deActiveElementsTransformers(): void;
  // 清除组件边框变换
  deActiveElementsBorderTransformers(): void;
  // 清除组件旋转
  deActiveElementsRotations(): void;
  // 清除组件通用控制器
  deActiveCommonControllers(): void;
  // 获取激活组件变换
  getActiveElementTransformer(): IVerticesTransformer;
  // 获取激活组件边框变换
  getActiveElementBorderTransformer(): IBorderTransformer;
  // 获取激活组件旋转
  getActiveElementRotation(): IElementRotation;
  // 获取激活组件通用控制器
  getActiveCommonController(): IPointController;
  // 刷新范围组件
  refreshRangeElements(rangePoints: IPoint[]): void;
  // 获取点上组件
  getElementOnPoint(point: IPoint): IElement;
  // 获取激活控制器
  getActiveController(): IController;
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
