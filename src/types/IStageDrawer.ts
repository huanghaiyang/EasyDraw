import { EventEmitter } from "events";
import IStageCanvas from "@/types/IStageCanvas";
import IStageShield from "@/types/IStageShield";
import { IStageRenderer } from "@/types/IStageRenderer";
import { IPoint } from "@/types";

// 舞台画布
export interface IStageDrawer extends IStageCanvas, EventEmitter {
  // 舞台
  shield: IStageShield;
  // 渲染器
  renderer: IStageRenderer;
  // 重绘
  redraw(force?: boolean): Promise<void>;
}

// 辅助画布
export interface IDrawerMask extends IStageDrawer {}

// 临时组件绘制画布
export interface IDrawerProvisional extends IStageDrawer {}

// HTML绘制画布
export interface IDrawerHtml extends IStageDrawer {
  // 输入框
  textEditor: HTMLTextAreaElement;
  // 创建文本输入框
  createTextInput(position: IPoint): HTMLTextAreaElement;
}
