import ICommand from "@/types/ICommand";

export default interface IUndoRedo {
  undoStack: ICommand[];
  redoStack: ICommand[];

  get tailUndoCommand(): ICommand | undefined;
  get tailRedoCommand(): ICommand | undefined;

  undo(): void;
  redo(): void;

  add(command: ICommand): void;
}
