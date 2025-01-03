import { IPoint } from "@/types/index";
import { IMaskCursor } from "@/types/IRenderTask";

// 舞台光标
export default interface IStageCursor {
  value: IPoint;
  clear(): void;
  transform(e: MouseEvent): IPoint;
  setStyle(cursor: string): void;
  updateStyle(e: MouseEvent): void;
  getTask(): IMaskCursor;
}