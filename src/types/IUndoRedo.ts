import ICommand from "@/types/ICommand";
import { IRenderQueue } from "@/types/IRender";

export default interface IUndoRedo<T, A> {
  undoStack: ICommand<T>[];
  redoStack: ICommand<T>[];
  renderQueue: IRenderQueue;

  get tailUndoCommand(): ICommand<T> | undefined;
  get tailRedoCommand(): ICommand<T> | undefined;

  undo(): Promise<A>;
  redo(): Promise<A>;
  pop(isRedo?: boolean): ICommand<T> | undefined;

  add(command: ICommand<T>): void;
  clear(): void;
}
