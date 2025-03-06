import IStageShield from "@/types/IStageShield";
import IStageUndo from "@/types/IStageUndo";
import ICommand from "@/types/ICommand";

export default class StageUndo implements IStageUndo {
  shield: IStageShield;
  undoStack: ICommand[];
  redoStack: ICommand[];

  constructor(shield: IStageShield) {
    this.shield = shield;
    this.undoStack = [];
    this.redoStack = [];
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
}
