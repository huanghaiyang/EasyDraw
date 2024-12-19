import { IStageDrawerMaskTaskSelectionHandler, IStageDrawerMaskTaskSelectionHandlerObj, Directions } from "@/types";
import StageDrawerMaskTaskBase from "@/modules/render/mask/task/StageDrawerMaskTaskBase";
import { DefaultSelectionHandlerStrokeColor, DefaultSelectionHandlerStrokeWidth, DefaultSelectionHandlerFillColor, DefaultSelectionHandlerSize } from "@/types/constants";
import DirectionUtils from "@/utils/DirectionUtils";
import CanvasUtils from "@/utils/CanvasUtils";

export default class StageDrawerMaskTaskSelectionHandler extends StageDrawerMaskTaskBase implements IStageDrawerMaskTaskSelectionHandler {

  direction: Directions;

  constructor(direction: Directions, obj: IStageDrawerMaskTaskSelectionHandlerObj, params?: any) {
    super(obj, params);
    this.direction = direction;
    this.obj = obj;
  }

  get data(): IStageDrawerMaskTaskSelectionHandlerObj {
    return this.obj as IStageDrawerMaskTaskSelectionHandlerObj;
  }

  /**
   * 运行任务
   */
  async run(): Promise<void> {
    CanvasUtils.drawPath(this.canvas, DirectionUtils.get4DirectionPoints(this.data.point, {
      width: DefaultSelectionHandlerSize,
      height: DefaultSelectionHandlerSize
    }), {
      strokeStyle: DefaultSelectionHandlerStrokeColor,
      lineWidth: DefaultSelectionHandlerStrokeWidth,
      fillStyle: DefaultSelectionHandlerFillColor
    });
  }
}