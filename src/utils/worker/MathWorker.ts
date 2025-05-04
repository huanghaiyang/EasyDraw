import { IPoint } from "@/types";
import { MapNamedPoints, MathCalcFunc, MathPoints, NamedPoints } from "@/types/IWorker";

self.onmessage = function (event: MessageEvent<MathCalcFunc>) {
  const { funcName, args, id } = event.data;
  let result: any;

  try {
    result = MathWorker[funcName](...args);
  } catch (e) {
    result = null;
  }

  self.postMessage({
    result,
    id,
    offset: args[args.length - 1],
  });
};

class MathWorker {
  /**
   * 平移
   *
   * @param coord
   * @param offset
   * @returns
   */
  static translate(coord: IPoint, offset: IPoint): IPoint {
    return {
      x: coord.x + offset.x,
      y: coord.y + offset.y,
    };
  }

  /**
   * 批量平移
   *
   * @param coords
   * @param offset
   * @returns
   */
  static batchTranslate(coords: MathPoints, offset: IPoint): MathPoints {
    return coords.map(coord => {
      if (Array.isArray(coord)) {
        return MathWorker.batchTranslate(coord, offset) as IPoint[];
      }
      return MathWorker.translate(coord, offset) as IPoint;
    }) as MathPoints;
  }

  /**
   * 批量命名平移
   *
   * @param coords
   * @param offset
   * @returns
   */
  static namedBatchTranslate(coords: NamedPoints, offset: IPoint): NamedPoints {
    return new Map(Array.from(coords.entries()).map(([key, value]) => [key, MathWorker.batchTranslate(value, offset)]));
  }

  /**
   * 批量映射命名平移
   *
   * @param coords
   * @param offset
   * @returns
   */
  static mapNamedBatchTranslate(coords: MapNamedPoints, offset: IPoint): MapNamedPoints {
    return new Map(Array.from(coords.entries()).map(([key, value]) => [key, MathWorker.namedBatchTranslate(value, offset)]));
  }
}
