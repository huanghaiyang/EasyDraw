import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";
import { IMaskClear } from "@/types";

export default class MaskTaskClear extends MaskTaskBase implements IMaskClear {
  async run(): Promise<void> {
    if (this.canvas) {
      this.canvas.getContext('2d')?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

}