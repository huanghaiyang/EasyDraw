import { EventEmitter } from "events";
import IStageShield from "@/types/IStageShield";

// 舞台事件处理器
export default interface IStageEvent extends EventEmitter {
  // 舞台 
  shield: IStageShield;
  // 是否为ctrl
  get isCtrl(): boolean;
  // 是否为ctrl
  get isOnlyCtrl(): boolean;
  // 是否为ctrl滚轮
  get isCtrlWheel(): boolean;
  // 是否为shift
  get isShift(): boolean;
  // 是否为shift
  get isOnlyShift(): boolean;
  // 初始化
  init(): void;
  // 上传图片
  onImagesUpload(images: File[]): Promise<void>;
}