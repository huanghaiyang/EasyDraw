import IStageShield from "@/types/IStageShield";
import ICommand from "@/types/ICommand";

export default interface IStageUndo {
  shield: IStageShield;
  undoStack: ICommand[];
  redoStack: ICommand[];

  get nearestUndoCommand(): ICommand | undefined;
  get nearestRedoCommand(): ICommand | undefined;

  undo(): void;
  redo(): void;

  add(command: ICommand): void;
}
