import ICommand from "@/types/ICommand";

export default interface IUndoRedo<T, A> {
  undoStack: ICommand<T>[];
  redoStack: ICommand<T>[];

  get tailUndoCommand(): ICommand<T> | undefined;
  get tailRedoCommand(): ICommand<T> | undefined;

  undo(): Promise<A>;
  redo(): Promise<A>;

  add(command: ICommand<T>): void;
  clear(): void;
}
