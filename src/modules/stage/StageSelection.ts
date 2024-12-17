import { IStageElement, IStageSelection, IStageShield } from "@/types";

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

  }

  /**
   * 设置选区元素
   * 
   * @param elements 
   */
  setElements(elements: IStageElement[]) : void {
    this.elementList = elements;
  }

}