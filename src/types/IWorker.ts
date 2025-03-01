import { IPoint } from ".";

export type MathCalcFunc = {
  funcName: string;
  args: any[];
  id: string;
};

export type MathPoints = IPoint[] | IPoint[][];
export type NamedPoints = Map<string, MathPoints>;
export type MapNamedPoints = Map<string, NamedPoints>;
