import { CreatorTypes, IPoint, IStageElement, IStageSelection, IStageShield, SelectionRenderTypes } from "@/types";
import CommonUtils from "@/utils/CommonUtils";
import { first, flatten } from "lodash";

export default class StageSelection implements IStageSelection {

  shield: IStageShield;
  canvas: HTMLCanvasElement;

  private elementList: IStageElement[];

  constructor(shield: IStageShield) {
    this.shield = shield;
  }

  /**
   * 设置画布
   * 
   * @param canvas 
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  /**
   * 重绘选区
   */
  redraw(): void {
    const renderType = this.getSelectionRenderType();
    switch (renderType) {
      case SelectionRenderTypes.rect: {
        const points = this.getSelectionRenderPoints();
        this.redrawRect(points);
        break;
      }
      default:
        break;
    }
  }

  /**
   * 渲染矩形选区
   * 
   * @param points 
   */
  redrawRect(points: IPoint[]): void {

  }

  /**
   * 设置选区元素
   * 
   * @param elements 
   */
  setElements(elements: IStageElement[]): void {
    this.elementList = elements;
  }

  /**
   * 获取选区渲染类型
   * 
   * @returns 
   */
  getSelectionRenderType() {
    if (this.elementList.length === 0) {
      const type = first(this.elementList).obj.type;
      switch (type) {
        case CreatorTypes.rectangle: {
          return SelectionRenderTypes.rect;
        }
      }
    }
    return SelectionRenderTypes.none;
  }

  /**
   * 获取需要渲染的选区坐标
   * 
   * @returns IPoint[]
   */
  getSelectionRenderPoints(): IPoint[] {
    let points: IPoint[] = [];
    const renderType = this.getSelectionRenderType();
    switch (renderType) {
      case SelectionRenderTypes.rect: {
        points = this.getElementsEdge();
        break;
      }
      default:
        break;
    }
    return points;
  }

  /**
   * 获取组件的边缘坐标
   * 
   * @returns IPoint[]
   */
  getElementsEdge(): IPoint[] {
    const points = flatten(this.elementList.map(element => {
      return element.getEdgePoints();
    }));
    return CommonUtils.getBoxByPoints(points);
  }

}