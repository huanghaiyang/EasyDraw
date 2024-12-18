import StageMaskTaskBase from "@/modules/render/StageMaskTaskBase";
import { IStageMaskTaskClear } from "@/types";

export default class StageMaskTaskClear extends StageMaskTaskBase implements IStageMaskTaskClear {
  async run(): Promise<void> {
    const canvas = this.getCanvas();
    if (canvas) {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

}