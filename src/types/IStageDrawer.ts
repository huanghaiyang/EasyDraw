import { EventEmitter } from "events";
import IStageCanvas from "@/types/IStageCanvas";
import IStageShield from "@/types/IStageShield";
import { IStageRenderer } from "@/types/IStageRenderer";

// 舞台画布
export interface IStageDrawer extends IStageCanvas, EventEmitter {
  renderer: IStageRenderer;
  redraw(force?: boolean): Promise<void>;
}

export interface IHelperDrawer extends IStageDrawer {
  shield: IStageShield;
}

// 辅助画布
export interface IDrawerMask extends IHelperDrawer { }

// 临时组件绘制画布
export interface IDrawerProvisional extends IHelperDrawer { }