import StageElementTaskBase from "@/modules/render/base/element/StageElementTaskBase";
import { IStageElementTaskClear } from "@/types";

export default class StageElementTaskClear extends StageElementTaskBase implements IStageElementTaskClear {
  async run(): Promise<void> {
    if (this.canvas) {
      this.canvas.getContext('2d')?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

}