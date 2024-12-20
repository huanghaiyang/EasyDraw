import { ElementStatus, ElementObject, IPoint, IStageElement } from "@/types";
import { nanoid } from "nanoid";
import { ILinkedNodeData } from '@/modules/struct/LinkedNode';

export default class StageElement implements IStageElement, ILinkedNodeData {
  id: string;
  obj: ElementObject;
  points: IPoint[];
  pathPoints: IPoint[];
  status: ElementStatus;
  isSelected: boolean;
  isVisible: boolean;
  isEditing: boolean;
  isLocked: boolean;
  isMoving: boolean;
  isResizing: boolean;
  isRotating: boolean;
  isDragging: boolean;
  isRendered: boolean;

  constructor(obj: ElementObject) {
    this.obj = obj;
    this.status = ElementStatus.initialed;
    this.id = nanoid();
    this.isSelected = false;
    this.isVisible = true;
    this.isEditing = false;
    this.isLocked = false;
    this.isMoving = false;
    this.isResizing = false;
    this.isRotating = false;
    this.isDragging = false;
    this.isRendered = false;
  }

  calcPathPoints(): IPoint[] {
    return this.points;
  }

  getEdgePoints(): IPoint[] {
    throw new Error("Method not implemented.");
  }
}