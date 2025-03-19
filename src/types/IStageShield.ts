import { IPoint } from "@/types/index";
import IStageConfigure from "@/types/IStageConfigure";
import { IDrawerHtml, IDrawerMask, IDrawerProvisional, IStageDrawer } from "@/types/IStageDrawer";
import IStageSelection from "@/types/IStageSelection";
import IStageStore from "@/types/IStageStore";
import IStageCursor from "@/types/IStageCursor";
import { Creator } from "@/types/Creator";
import IStageEvent from "@/types/IStageEvent";
import IStageSetter from "@/types/IStageSetter";
import IElement from "@/types/IElement";
import IStageAlign from "@/types/IStageAlign";
import IUndoRedo from "@/types/IUndoRedo";
import { IElementCommandPayload } from "@/types/ICommand";

// 组件状态
export enum StageShieldElementsStatus {
  NONE,
  MOVING,
  ROTATING,
  TRANSFORMING,
  CORNER_MOVING,
}

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
  // html
  html: IDrawerHtml;
  // 配置
  configure: IStageConfigure;
  // 事件
  event: IStageEvent;
  // 对齐
  align: IStageAlign;
  // 撤销
  undoRedo: IUndoRedo<IElementCommandPayload>;
  // 当前创建者
  currentCreator: Creator;
  // 渲染组件
  renderEl: HTMLDivElement;
  // 舞台矩形
  stageRect: DOMRect;
  // 舞台世界坐标
  stageWorldCoord: IPoint;
  // 舞台缩放
  stageScale: number;
  // 组件状态
  elementsStatus: StageShieldElementsStatus;

  // 是否组件繁忙
  get isElementsBusy(): boolean;
  // 舞台矩形点
  get stageRectPoints(): IPoint[];
  // 舞台世界矩形坐标
  get stageWordRectCoords(): IPoint[];
  // 是否舞台移动
  get isStageMoving(): boolean;
  // 是否画板激活
  get isDrawerActive(): boolean;
  // 是否正在创建文本
  get isTextCreating(): boolean;
  // 是否正在编辑文本
  get isTextEditing(): boolean;
  // 是否可移动激活
  get isMoveableActive(): boolean;
  // 是否手激活
  get isHandActive(): boolean;
  // 是否任意绘制
  get isArbitraryDrawing(): boolean;
  // 是否任意编辑
  get isArbitraryEditing(): boolean;
  // 舞台计算参数
  get stageCalcParams(): StageCalcParams;

  // 计算给定范围的自动缩放值
  calcScaleAutoFitValueByBox(box: IPoint[]): number;
  // 计算自动缩放值
  calcScaleAutoFitValue(): number;
  // 计算组件自动缩放值
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
