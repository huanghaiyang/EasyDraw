import { IPoint } from "@/types/index";
import IStageConfigure from "@/types/IStageConfigure";
import {
  IDrawerMask,
  IDrawerProvisional,
  IStageDrawer,
} from "@/types/IStageDrawer";
import IStageSelection from "@/types/IStageSelection";
import IStageStore from "@/types/IStageStore";
import IStageCursor from "@/types/IStageCursor";
import { Creator } from "@/types/Creator";
import IStageEvent from "@/types/IStageEvent";
import IStageSetter from "@/types/IStageSetter";
import IElement from "@/types/IElement";
import IStageAlign from "@/types/IStageAlign";

// 舞台主画板
export default interface IStageShield extends IStageDrawer, IStageSetter {
  // 光标
  cursor: IStageCursor;
  // 选区
  selection: IStageSelection;
  // 存储
  store: IStageStore;
  // 遮罩
  mask: IDrawerMask;
  // 临时
  provisional: IDrawerProvisional;
  // 配置
  configure: IStageConfigure;
  // 事件
  event: IStageEvent;
  // 对齐
  align: IStageAlign;
  // 当前创建者
  currentCreator: Creator;
  // 渲染元素
  renderEl: HTMLDivElement;
  // 舞台矩形
  stageRect: DOMRect;
  // 舞台世界坐标
  stageWorldCoord: IPoint;
  // 舞台缩放
  stageScale: number;

  // 是否需要重绘
  get shouldRedraw(): boolean;
  // 是否元素繁忙
  get isElementsBusy(): boolean;
  // 舞台矩形点
  get stageRectPoints(): IPoint[];
  // 舞台世界矩形坐标
  get stageWordRectCoords(): IPoint[];
  // 是否元素拖动
  get isElementsDragging(): boolean;
  // 是否元素变换
  get isElementsTransforming(): boolean;
  // 是否元素编辑
  get isElementsEditing(): boolean;
  // 是否舞台移动
  get isStageMoving(): boolean;
  // 是否画板激活
  get isDrawerActive(): boolean;
  // 是否可移动激活
  get isMoveableActive(): boolean;
  // 是否手激活
  get isHandActive(): boolean;
  // 是否元素旋转
  get isElementsRotating(): boolean;
  // 是否任意绘制
  get isArbitraryDrawing(): boolean;
  // 舞台计算参数
  get stageCalcParams(): StageCalcParams;

  // 计算给定范围的自动缩放值
  calcScaleAutoFitValueByBox(box: IPoint[]): number;
  // 计算自动缩放值
  calcScaleAutoFitValue(): number;
  // 计算元素自动缩放值
  calcElementAutoFitValue(element: IElement): number;
  // 设置缩放
  setScale(value: number): void;
  // 设置缩放100%
  setScale100(): void;
  // 设置自动缩放
  setScaleAutoFit(): void;
  // 设置缩小
  setScaleReduce(): void;
  // 设置放大
  setScaleIncrease(): void;
  // 删除选区元素
  deleteSelectElements(): void;
  // 全选
  selectAll(): void;
  // 上传图片
  uploadImages(images: File[]): Promise<void>;
  // 提交任意绘制
  commitArbitraryDrawing(): Promise<void>;
  // 提交编辑绘制
  commitEditingDrawing(): Promise<void>;
}

// 舞台计算参数
export interface StageCalcParams {
  // 舞台矩形
  rect: DOMRect;
  // 舞台世界坐标
  worldCoord: IPoint;
  // 舞台缩放
  scale: number;
}
