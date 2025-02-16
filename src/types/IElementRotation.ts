import { IPointController } from "@/types/IController";

export default interface IElementRotation extends IPointController {
  // 刷新
  refresh(): void;
}
