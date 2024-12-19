import { ElementCreateStatus, ElementObject, IPoint, IStageElement } from "@/types";
import { nanoid } from "nanoid";

export default class StageElement implements IStageElement {
  id: string;
  obj: ElementObject;
  points: IPoint[];
  pathPoints: IPoint[];
  status: ElementCreateStatus;
  isSelected: boolean;
  isVisible: boolean;
  isEditing: boolean;
  isLocked: boolean;
  isMoving: boolean;
  isResizing: boolean;
  isRotating: boolean;
  isDragging: boolean;

  constructor(obj: ElementObject) {
    this.obj = obj;
    this.status = ElementCreateStatus.starting;
    this.id = nanoid();
    this.isSelected = false;
    this.isVisible = true;
    this.isEditing = false;
    this.isLocked = false;
    this.isMoving = false;
    this.isResizing = false;
    this.isRotating = false;
    this.isDragging = false;
  }
  
  calcPathPoints(): IPoint[] {
    return this.points;
  }

  getEdgePoints(): IPoint[] {
    throw new Error("Method not implemented.");
  }
}