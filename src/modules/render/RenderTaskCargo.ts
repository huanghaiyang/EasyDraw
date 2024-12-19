import { IRenderTaskCargo, IRenderTask } from "@/types";
import RenderTaskBase from "@/modules/render/RenderTaskBase";

export default class RenderTaskCargo extends RenderTaskBase implements IRenderTaskCargo {
  tasks: IRenderTask[];
  running: boolean;

  constructor(tasks: IRenderTask[]) {
    super();
    this.tasks = tasks;
  }

  /**
   * 判断是否为空
   * 
   * @returns 
   */
  isEmpty() {
    return this.tasks.length === 0;
  }

  /**
   * 添加一个任务
   * 
   * @param task 
   */
  add(task: IRenderTask) {
    if (this.running) {
      return;
    }
    this.tasks.push(task);
  }

  /**
   * 添加多个任务
   * 
   * @param tasks 
   * @returns 
   */
  addAll(tasks: IRenderTask[]): void {
    if (this.running) {
      return;
    }
    this.tasks.push(...tasks);
  }

  /**
   * 添加一个任务到头部
   * 
   * @param task 
   */
  prepend(task: IRenderTask): void {
    if (this.running) {
      return;
    }
    this.tasks.unshift(task);
  }

  async run(): Promise<void> {
    this.running = true;
    while (this.tasks.length > 0) {
      let task = this.tasks.shift();
      if (task) {
        try {
          await task.run();
        } catch (e) {
          console.error(e);
        } finally {
          task.destroy();
          task = null;
        }
      }
    }
    this.running = false;
  }

}