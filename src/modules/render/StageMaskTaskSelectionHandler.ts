import { IStageMaskTaskSelectionHandler, IStageMaskTaskSelectionHandlerObj, Directions } from "@/types";
import StageMaskTaskBase from "@/modules/render/StageMaskTaskBase";
import { DefaultSelectionHandlerStrokeColor, DefaultSelectionHandlerStrokeWidth, DefaultSelectionHandlerFillColor, DefaultSelectionHandlerSize } from "@/types/constants";
import DirectionUtils from "@/utils/DirectionUtils";

export default class StageMaskTaskSelectionHandler extends StageMaskTaskBase implements IStageMaskTaskSelectionHandler {

  direction: Directions;

  constructor(direction: Directions, obj: IStageMaskTaskSelectionHandlerObj, params?: any) {
    super(obj, params);
    this.direction = direction;
    this.obj = obj;
  }

  get data() {
    return this.obj as IStageMaskTaskSelectionHandlerObj;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    const canvas = this.getCanvas();
    const ctx = canvas?.getContext('2d');
    ctx.save();
    ctx.strokeStyle = DefaultSelectionHandlerStrokeColor;
    ctx.lineWidth = DefaultSelectionHandlerStrokeWidth;
    ctx.fillStyle = DefaultSelectionHandlerFillColor;
    ctx.beginPath();
    DirectionUtils.get4DirectionPoints(this.data.point, {
      width: DefaultSelectionHandlerSize,
      height: DefaultSelectionHandlerSize
    }).forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }
}