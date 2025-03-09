import RenderTaskBase from "@/modules/render/RenderTaskBase";
import { IRenderTaskCargo } from "@/types/IRender";
import { IRenderTask } from "@/types/IRenderTask";

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
    if (task) {
      this.tasks.push(task);
    }
  }

  /**
   * 添加多个任务
   *
   * @param tasks
   * @returns
   */
  addAll(tasks: IRenderTask[]): void {
    tasks.forEach(task => {
      this.add(task);
    });
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
    if (task) {
      this.tasks.unshift(task);
    }
  }

  async run(): Promise<void> {
    this.running = true;
    while (this.tasks.length > 0) {
      let task = this.tasks.shift();
      if (task) {
        try {
          await task.run();
        } catch (e) {
          console.error("RenderTaskCargo: error running task", task.id, e);
        } finally {
          if (task.destroy) {
            await task.destroy();
          }
          task = null;
        }
      }
    }
    this.running = false;
  }
}
