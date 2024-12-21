import { ElementStatus, ElementObject, IPoint, IStageElement } from "@/types";
import { nanoid } from "nanoid";
import { ILinkedNodeData } from '@/modules/struct/LinkedNode';
import ElementUtils from "@/modules/elements/ElementUtils";

export default class StageElement implements IStageElement, ILinkedNodeData {
  id: string;
  obj: ElementObject;
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

  protected _points: IPoint[];
  protected _pathPoints: IPoint[];

  get points(): IPoint[] {
    return this._points;
  }

  get pathPoints(): IPoint[] {
    return this._pathPoints;
  }

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

  /**
   * 刷新坐标
   */
  refreshStagePoints(stageRect: DOMRect, stageWorldCoord: IPoint): void {
    this._points = ElementUtils.calcStageRelativePoints(this.obj.coords, stageRect, stageWorldCoord);
    this._pathPoints = this._points;
  }

  getEdgePoints(): IPoint[] {
    throw new Error("Method not implemented.");
  }
}