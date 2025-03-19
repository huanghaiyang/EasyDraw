import { IRenderQueue } from "@/types/IRender";
import { IRenderTask } from "@/types/IRenderTask";
import TimeUtils from "@/utils/TimerUtils";

export default class RenderQueue implements IRenderQueue {
  running: boolean;
  queue: IRenderTask[];
  stopped: boolean;

  constructor() {
    this.running = false;
    this.queue = [];
    this.stopped = false;
  }

  /**
   * 添加任务
   *
   * @param task
   */
  async add(task: IRenderTask): Promise<void> {
    if (this.stopped) return;
    this.queue.push(task);
    if (!this.running) {
      this.running = true;
      await this.run();
    }
  }

  /**
   * 执行所有任务
   */
  async run(): Promise<void> {
    if (this.stopped) return;
    if (this.queue.length === 0) {
      this.running = false;
      return;
    }
    let task = this.queue.shift()!;
    if (task) {
      try {
        await task.run();
      } catch (error) {
        // console.error("RenderQueue: error running task", task.id, error);
      } finally {
        if (task.destroy) {
          await task.destroy();
        }
        task = null;
      }
    }
    if (this.queue.length > 0) {
      requestAnimationFrame(() => {
        this.run();
      });
    } else {
      this.running = false;
    }
  }

  /**
   * 等待结束运行
   */
  async wait(): Promise<void> {
    while (this.running) {
      await TimeUtils.wait(10);
    }
  }

  /**
   * 销毁队列
   */
  async destroy(): Promise<void> {
    await this.wait();
    this.stopped = true;
    this.queue = null;
    this.running = false;
  }
}

export class TaskQueue extends RenderQueue {}
