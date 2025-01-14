import { IPoint } from "@/types/index";
import { IMaskTask } from "@/types/IRenderTask";

// 舞台光标
export default interface IStageCursor {
  value: IPoint;
  
  get worldValue(): IPoint;

  clear(): void;
  transform(e: MouseEvent): IPoint;
  setStyle(cursor: string): void;
  updateStyle(e: MouseEvent): void;
  getTask(): IMaskTask;
}