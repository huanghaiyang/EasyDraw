import { IPoint } from "@/types/index";
import { IMaskTask } from "@/types/IRenderTask";

// 舞台光标
export default interface IStageCursor {
  // 值
  value: IPoint;
  // 世界值
  get worldValue(): IPoint;
  // 清除
  clear(): void;
  // 变换
  transform(e: MouseEvent): IPoint;
  // 设置样式
  setStyle(cursor: string): void;
  // 更新样式
  updateStyle(e?: MouseEvent): void;
  // 获取任务
  getTask(): IMaskTask;
}