import { IPoint } from "@/types/index";

// 舞台光标
export default interface IStageCursor {
  value: IPoint;
  clear(): void;
  transform(e: MouseEvent): IPoint;
}