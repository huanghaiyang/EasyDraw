import StageDrawerMaskTaskBase from "@/modules/render/mask/StageDrawerMaskTaskBase";
import { IStageDrawerMaskTaskClear } from "@/types";

export default class StageDrawerMaskTaskClear extends StageDrawerMaskTaskBase implements IStageDrawerMaskTaskClear {
  async run(): Promise<void> {
    if (this.canvas) {
      this.canvas.getContext('2d')?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

}