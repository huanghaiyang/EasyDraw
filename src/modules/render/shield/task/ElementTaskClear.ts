import ElementTaskBase from "@/modules/render/shield/task/ElementTaskBase";

export default class ElementTaskClear extends ElementTaskBase {
  async run(): Promise<void> {
    if (!this.canvas) return;

    this.canvas.getContext("2d")?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
