import { EventEmitter } from "events";
import IStageShield from "@/types/IStageShield";

// 舞台事件处理器
export default interface IStageEvent extends EventEmitter {
  shield: IStageShield;

  get isCtrl(): boolean;
  get isCtrlWheel(): boolean;
  get isShift(): boolean;

  init(): void;
  onImagesUpload(images: File[]): Promise<void>;
}