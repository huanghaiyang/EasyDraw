import { IPoint } from "@/types";
import { MathCalcFunc } from "@/types/IWorker";

self.onmessage = function (event: MessageEvent<MathCalcFunc>) {
  const { funcName, args } = event.data;
  let result: any;

  try {
    result = MathWorker[funcName](...args);
  } catch (e) {
    result = e;
  }

  self.postMessage(result);
};

class MathWorker {
  static translate(coord: IPoint, offset: IPoint): IPoint {
    return {
      x: coord.x + offset.x,
      y: coord.y + offset.y,
    };
  }

  static batchTranslate(coords: IPoint[], offset: IPoint): IPoint[] {
    return coords.map(coord => MathWorker.translate(coord, offset));
  }
}
