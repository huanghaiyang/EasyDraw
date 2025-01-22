import { IPoint } from "@/types/index";
import IElement from "@/types/IElement";
import { IMaskModel } from "@/types/IModel";
import IElementRotation from "@/types/IElementRotation";
import IStageShield from "@/types/IStageShield";
import { IVerticesTransformer } from "@/types/ITransformer";
import { IBorderTransformer } from "@/types/ITransformer";

// 舞台选区
export default interface IStageSelection {
  // 舞台
  shield: IStageShield;
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
  // 命中目标元素
  hitTargetElements(point: IPoint): void;
  // 尝试激活元素旋转
  tryActiveElementRotation(point: IPoint): IElementRotation;
  // 尝试激活元素变换
  tryActiveElementTransformer(point: IPoint): IVerticesTransformer;
  // 尝试激活元素边框变换
  tryActiveElementBorderTransformer(point: IPoint): IBorderTransformer;
  // 清除元素变换
  deActiveElementsTransformers(): void;
  // 清除元素边框变换
  deActiveElementsBorderTransformers(): void;
  // 获取激活元素变换
  getActiveElementTransformer(): IVerticesTransformer;
  // 获取激活元素边框变换
  getActiveElementBorderTransformer(): IBorderTransformer;
  // 刷新范围元素
  refreshRangeElements(rangePoints: IPoint[]): void;
  // 获取点上元素
  getElementOnPoint(point: IPoint): IElement;
  // 检查选区是否包含目标
  checkSelectContainsTarget(): boolean;

  // 计算选区模型
  calcSelectionModel(): IMaskModel;
  // 计算变换器模型
  calcTransformerModels(): IMaskModel[];
  // 计算多选区模型
  calcMultiSelectionModel(): IMaskModel;
  // 计算单选区模型
  calcSingleSelectionModel(): IMaskModel;
  // 计算单选区变换器模型
  calcSingleTransformerModels(): IMaskModel[];
  // 计算多选区变换器模型
  calcMultiTransformerModels(): IMaskModel[];
  // 获取实时选区模型
  getRealTimeSelectionModel(): IMaskModel;
  // 获取实时变换器模型
  getRealTimeTransformerModels(): IMaskModel[];
  // 刷新
  refresh(): void;
  // 刷新选区模型
  refreshSelectionModel(): void;
  // 刷新变换器模型
  refreshTransformerModels(): void;
}