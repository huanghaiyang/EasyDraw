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
   * 撤销
   */
  undo(): void {
    if (this.undoStack.length > 0) {
      const command = this.undoStack.pop();
      this.redoStack.push(command);
      command.undo();
    }
  }

  /**
   * 重做
   */
  redo(): void {
    if (this.redoStack.length > 0) {
      const command = this.redoStack.pop();
      this.undoStack.push(command);
      command.redo();
    }
  }
}
