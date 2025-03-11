import IStageShield from "@/types/IStageShield";
import IStageUndo from "@/types/IStageUndo";
import ICommand from "@/types/ICommand";

export default class StageUndo implements IStageUndo {
  shield: IStageShield;
  undoStack: ICommand[] = [];
  redoStack: ICommand[] = [];

  get nearestUndoCommand(): ICommand | undefined {
    return this.undoStack[this.undoStack.length - 1];
  }

  get nearestRedoCommand(): ICommand | undefined {
    return this.redoStack[this.redoStack.length - 1];
  }

  constructor(shield: IStageShield) {
    this.shield = shield;
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
