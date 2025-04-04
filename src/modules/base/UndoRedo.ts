import IUndoRedo from "@/types/IUndoRedo";
import ICommand from "@/types/ICommand";

export default class UndoRedo<T> implements IUndoRedo<T> {
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
  async undo(): Promise<boolean> {
    if (this.undoStack.length === 0) return false;
    const command = this.undoStack.pop();
    this.redoStack.push(command);
    await command.undo();
    return true;
  }

  /**
   * 重做
   */
  async redo(): Promise<boolean> {
    if (this.redoStack.length === 0) return false;
    const command = this.redoStack.pop();
    this.undoStack.push(command);
    await command.redo();
    return true;
  }
}
