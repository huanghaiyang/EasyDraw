import ICommand from "@/types/ICommand";
import IUndoRedo from "@/types/IUndoRedo";

export default class UndoRedo implements IUndoRedo {
  undoStack: ICommand[] = [];
  redoStack: ICommand[] = [];

  get tailUndoCommand(): ICommand | undefined {
    return this.undoStack[this.undoStack.length - 1];
  }

  get tailRedoCommand(): ICommand | undefined {
    return this.redoStack[this.redoStack.length - 1];
  }

  /**
   * 添加撤销命令
   * @param command
   */
  add(command: ICommand): void {
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
