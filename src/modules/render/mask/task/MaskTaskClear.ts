import MaskTaskBase from "@/modules/render/mask/task/MaskTaskBase";

export default class MaskTaskClear extends MaskTaskBase {
  async run(): Promise<void> {
    if (this.canvas) {
      this.canvas
        .getContext("2d")
        ?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
