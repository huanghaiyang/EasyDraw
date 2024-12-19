import { IStageMaskTaskSelectionHandler, IStageMaskTaskSelectionHandlerObj, Directions } from "@/types";
import StageMaskTaskBase from "@/modules/render/StageMaskTaskBase";
import { DefaultSelectionHandlerStrokeColor, DefaultSelectionHandlerStrokeWidth, DefaultSelectionHandlerFillColor, DefaultSelectionHandlerSize } from "@/types/constants";
import DirectionUtils from "@/utils/DirectionUtils";
import CanvasUtils from "@/utils/CanvasUtils";

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
    CanvasUtils.drawPath(this.getCanvas(), DirectionUtils.get4DirectionPoints(this.data.point, {
      width: DefaultSelectionHandlerSize,
      height: DefaultSelectionHandlerSize
    }), {
      strokeStyle: DefaultSelectionHandlerStrokeColor,
      lineWidth: DefaultSelectionHandlerStrokeWidth,
      fillStyle: DefaultSelectionHandlerFillColor
    });
  }
}