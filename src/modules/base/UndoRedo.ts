import IUndoRedo from "@/types/IUndoRedo";
import ICommand from "@/types/ICommand";

export default class UndoRedo<T, A> implements IUndoRedo<T, A> {
  undoStack: ICommand<T>[] = [];
  redoStack: ICommand<T>[] = [];

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
    if (this.undoStack.length === 0) return false as A;
    const command = this.undoStack.pop();
    this.redoStack.push(command);
    await command.undo();
    return true as A;
  }

  /**
   * 重做
   */
  async redo(): Promise<A> {
    if (this.redoStack.length === 0) return false as A;
    const command = this.redoStack.pop();
    this.undoStack.push(command);
    await command.redo();
    return true as A;
  }
}
