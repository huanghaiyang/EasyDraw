import IUndoRedo from "@/types/IUndoRedo";
import ICommand from "@/types/ICommand";
import { IRenderQueue } from "@/types/IRender";
import { QueueTask } from "@/modules/render/RenderTask";
import RenderQueue from "@/modules/render/RenderQueue";

export default class UndoRedo<T, A> implements IUndoRedo<T, A> {
  undoStack: ICommand<T>[] = [];
  redoStack: ICommand<T>[] = [];
  renderQueue: IRenderQueue = new RenderQueue();

  get tailUndoCommand(): ICommand<T> | undefined {
    return this.undoStack[this.undoStack.length - 1];
  }

  get tailRedoCommand(): ICommand<T> | undefined {
    return this.redoStack[this.redoStack.length - 1];
  }

  /**
   * 添加撤销命令
   * @param command
   */
  add(command: ICommand<T>): void {
    this.undoStack.push(command);
    this.redoStack = [];
  }

  /**
   * 清空
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * 撤销
   */
  async undo(): Promise<A> {
    let result: A = false as A;
    await new Promise<void>(resolve => {
      this.renderQueue.add(
        new QueueTask(async () => {
          if (this.undoStack.length !== 0) {
            const command = this.undoStack.pop();
            this.redoStack.push(command);
            await command.undo();
            result = true as A;
          } else {
            result = false as A;
          }
          resolve();
        }),
      );
    });
    return result;
  }

  /**
   * 重做
   */
  async redo(): Promise<A> {
    let result: A = false as A;
    await new Promise<void>(resolve => {
      this.renderQueue.add(
        new QueueTask(async () => {
          if (this.redoStack.length !== 0) {
            const command = this.redoStack.pop();
            this.undoStack.push(command);
            await command.redo();
            result = true as A;
          } else {
            result = false as A;
          }
          resolve();
        }),
      );
    });
    return result;
  }

  /**
   * 执行命令
   * @param command
   */
  async execute(isRedo?: boolean): Promise<A> {
    if (isRedo) {
      return await this.redo();
    } else {
      return await this.undo();
    }
  }

  /**
   * 弹出命令（不执行）
   * 
   * @param isRedo
   */
  pop(isRedo?: boolean): ICommand<T> {
    if (isRedo) {
      return this.redoStack.pop();
    }
    return this.undoStack.pop();
  }
}
