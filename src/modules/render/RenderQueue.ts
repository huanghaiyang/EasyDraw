import { IRenderQueue, IRenderTask } from "@/types";

export default class RenderQueue implements IRenderQueue {
  running: boolean
  queue: IRenderTask[]

  constructor() {
    this.running = false
    this.queue = []
  }


  /**
   * 添加任务
   * 
   * @param task 
   */
  async add(task: IRenderTask): Promise<void> {
    this.queue.push(task)
    if (!this.running) {
      this.running = true
      await this.run()
    }
  }

  /**
   * 执行所有任务
   */
  async run(): Promise<void> {
    if (this.queue.length === 0) {
      this.running = false;
      return;
    }
    let task = this.queue.shift()!;
    if (task) {
      await task.run();
      try {
        await this.run();
      } catch (error) {
        console.error('RenderQueue: error running task', task.id, error);
      } finally {
        task.destroy();
        task = null;
      }
    }

    requestAnimationFrame(() => {
      this.run();
    });
  }
}