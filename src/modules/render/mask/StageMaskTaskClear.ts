import StageMaskTaskBase from "@/modules/render/mask/StageMaskTaskBase";
import { IStageMaskTaskClear } from "@/types";

export default class StageMaskTaskClear extends StageMaskTaskBase implements IStageMaskTaskClear {
  async run(): Promise<void> {
    if (this.canvas) {
      this.canvas.getContext('2d')?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

}